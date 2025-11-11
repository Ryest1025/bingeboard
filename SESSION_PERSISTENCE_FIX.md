# Session Persistence Fix - November 11, 2024

## Problem
Users were logging in successfully, but getting kicked out within 1-5 seconds with "No session found" errors.

## Root Causes Identified

### 1. **Race Condition in onAuthStateChanged**
The Firebase `onAuthStateChanged` listener was firing **in parallel** with the initial OAuth/backend session checks, causing:
- Multiple "checking backend session" log entries
- Duplicate session verification requests
- Potential conflict between Firebase auth state and backend session state

### 2. **Aggressive Logout on Firebase Sign-Out Signal**
When Firebase signaled a sign-out (which can happen innocently on page load), the code immediately called `checkBackendSession()` and cleared the user state if no session was found. This created a race condition where:
1. Backend session cookie exists
2. Firebase emits sign-out event during initialization
3. Code checks backend before cookie is sent
4. User gets logged out despite valid session

### 3. **Service Worker Interference**
Service workers were still registered despite unregistration code in `index.html`. User logs showed:
```
InvalidStateError: Only the active worker can claim clients
```

## Solutions Implemented

### Fix 1: Added Auth Check Synchronization
```typescript
let authCheckInProgress = false;
let initialAuthComplete = false;

const checkBackendSession = async () => {
  if (authCheckInProgress) {
    console.log('⏸️ Auth check already in progress, skipping duplicate check');
    return false;
  }
  
  authCheckInProgress = true;
  try {
    // Check session
  } finally {
    authCheckInProgress = false;
  }
};
```

**What this does:**
- Prevents multiple simultaneous backend session checks
- Eliminates race condition between OAuth check and onAuthStateChanged
- Ensures only one auth verification at a time

### Fix 2: Sequential Auth Initialization
```typescript
checkOAuthRedirect().then(async (hadOAuthRedirect) => {
  if (!hadOAuthRedirect) {
    const hasSession = await checkBackendSession();
    if (!hasSession) {
      updateState({ isLoading: false });
    }
  }
  // Mark initial auth as complete
  initialAuthComplete = true;
  console.log('✅ Initial auth sequence complete');
});
```

**What this does:**
- Completes OAuth check before allowing onAuthStateChanged to proceed
- Prevents Firebase listener from interfering with initial session restoration
- Establishes clear initialization phase

### Fix 3: Prevent Premature Logout from onAuthStateChanged
```typescript
onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
  // Wait for initial auth to complete
  if (!initialAuthComplete) {
    console.log('⏸️ Skipping onAuthStateChanged during initial auth sequence');
    return;
  }
  
  if (firebaseUser) {
    // Sync with backend
  } else {
    // Firebase signaled sign-out - DON'T immediately clear state
    console.log('ℹ️ Firebase signaled sign-out (this can happen on page load)');
    console.log('ℹ️ Preserving backend session if it exists');
    // Don't call checkBackendSession here - it can cause race conditions
  }
});
```

**What this does:**
- Prevents onAuthStateChanged from firing during initial page load
- Stops premature logout when Firebase emits sign-out signal
- Preserves backend session cookie even if Firebase says "signed out"

### Fix 4: Service Worker Cleanup in useAuth
```typescript
// STEP 0: Ensure no service workers are interfering
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    if (registrations.length > 0) {
      console.log(`🧹 Unregistering ${registrations.length} service workers...`);
      registrations.forEach(reg => reg.unregister());
    } else {
      console.log('✅ No service workers to clean up');
    }
  }).catch(err => console.error('❌ SW cleanup error:', err));
}
```

**What this does:**
- Actively checks for service workers during auth initialization
- Unregisters any found workers before proceeding
- Logs cleanup status for debugging

### Fix 5: Enhanced Backend Cookie Logging
```typescript
console.log('🔍 Auth status check:', {
  allCookies: Object.keys(req.cookies || {}),
  hasSessionCookie: !!sessionCookie,
  hasLegacyToken: !!legacyToken,
  origin: req.headers.origin,
  referer: req.headers.referer,
});
```

**What this does:**
- Shows ALL cookies received by backend (helps identify missing bb_session)
- Logs origin/referer to debug CORS issues
- Provides visibility into what browser is actually sending

## Files Modified

1. **client/src/hooks/useAuth.ts**
   - Added `authCheckInProgress` flag
   - Added `initialAuthComplete` flag
   - Updated `checkBackendSession()` with race condition prevention
   - Modified `onAuthStateChanged` to wait for initial auth
   - Removed aggressive logout on Firebase sign-out
   - Added service worker cleanup

2. **server/routes.ts**
   - Enhanced `/api/auth/status` logging to show all cookies received

## Expected Behavior After Fix

### Successful Login Flow
```
1. User enters credentials
2. 🧹 Unregistering 0 service workers...
3. ✅ No service workers to clean up
4. 🔍 Checking for OAuth redirect result...
5. 🔍 Checking backend session...
6. 🔍 Auth status check: { allCookies: ['bb_session'], hasSessionCookie: true, ... }
7. ✅ Backend session found: user@example.com
8. ✅ Initial auth sequence complete
9. [User stays logged in - no logout]
```

### Page Refresh Flow
```
1. Page loads
2. 🧹 Unregistering 0 service workers...
3. ✅ No service workers to clean up
4. 🔍 Checking for OAuth redirect result...
5. 🔍 Checking backend session...
6. 🔍 Auth status check: { allCookies: ['bb_session'], hasSessionCookie: true, ... }
7. ✅ Backend session found: user@example.com
8. ✅ Initial auth sequence complete
9. ⏸️ Skipping onAuthStateChanged during initial auth sequence
10. [User stays logged in - session persists]
```

## Testing Checklist

- [ ] Login → Wait 10 seconds → Should stay logged in
- [ ] Login → Refresh page → Should stay logged in
- [ ] Login → Navigate between pages → Should stay logged in
- [ ] Check console for single "checking backend session" (not multiple)
- [ ] Check DevTools → Application → Service Workers (should be empty)
- [ ] Check DevTools → Application → Cookies → Verify bb_session exists
- [ ] Check backend logs for "allCookies: ['bb_session']"

## What Was NOT the Problem

✅ **Cookie Configuration** - Already correct (sameSite=none, secure=true, httpOnly=true)
✅ **CORS Settings** - credentials: 'include' already present
✅ **Backend Session Creation** - Firebase Admin SDK working correctly
✅ **Cookie Domain** - Proper cross-origin setup

The issue was purely **timing and race conditions** in the frontend auth flow.

## Deployment

Push these changes to trigger automatic deployment:
```bash
git add client/src/hooks/useAuth.ts server/routes.ts
git commit -m "Fix session persistence race conditions"
git push
```

Frontend will deploy to GitHub Pages, backend will deploy to Vercel.

## Verification

After deployment, test the flow and check for these log patterns:

**Good (Fixed):**
```
✅ Initial auth sequence complete
⏸️ Skipping onAuthStateChanged during initial auth sequence
✅ Backend session found
```

**Bad (Still Broken):**
```
🔍 Checking backend session... (appears multiple times)
ℹ️ No backend session found
ℹ️ Firebase user signed out, checking backend session...
```

If you still see the "bad" pattern, check:
1. Are cookies actually being sent? Check backend logs for `allCookies: []`
2. Is browser blocking cookies? Check DevTools → Network → Request Headers → Cookie
3. Is service worker still registered? Check DevTools → Application → Service Workers
