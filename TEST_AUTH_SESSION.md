# Authentication Session Testing Guide

## Current Issue: Session Lost After Login

**Symptom:** Login succeeds → backend session created → navigation happens → user state resets to `null`

**Root Cause:** Race condition where App.tsx root route renders BEFORE backend session check completes

---

## Testing Steps

### 1. Check Backend Session Endpoint

Open browser console and run:

```javascript
// Test if backend session exists
fetch("/api/auth/status", { credentials: "include" })
  .then(res => {
    console.log('Status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('Session data:', data);
    console.log('Is authenticated:', data.isAuthenticated);
    console.log('User:', data.user);
  })
  .catch(err => console.error('Error:', err));
```

**Expected after login:**
```json
{
  "isAuthenticated": true,
  "user": {
    "email": "rachel.gubin@gmail.com",
    "id": "...",
    "displayName": "..."
  }
}
```

**If you get 401 or `isAuthenticated: false`:**
- Backend session cookie is NOT being sent
- OR backend session expired/was cleared

### 2. Check Cookies

In browser console:

```javascript
console.log('All cookies:', document.cookie);
```

Look for session cookies like:
- `session=...`
- `connect.sid=...`
- Or any other session identifier

**If NO cookies:**
- Backend is not setting cookies properly
- Check `credentials: 'include'` is used in all fetch calls
- Check backend sets `Set-Cookie` header

### 3. Monitor Auth State Changes

Add this to see real-time auth updates:

```javascript
// In browser console
const originalLog = console.log;
console.log = function(...args) {
  if (args[0]?.includes?.('🛣️') || args[0]?.includes?.('✅') || args[0]?.includes?.('Backend session')) {
    originalLog.apply(console, ['[AUTH]', ...args]);
  }
  originalLog.apply(console, args);
};
```

Then try logging in and watch the sequence.

---

## Expected Flow (FIXED)

### Before Fix
1. Login → `/api/auth/firebase-session` → 200 ✅
2. Navigate to `/` → App.tsx renders
3. `useAuth()` returns `{ isAuthenticated: false, isLoading: false }` ❌
4. Root route redirects to `/landing` ❌
5. Backend session check completes (too late) ✅

### After Fix
1. Login → `/api/auth/firebase-session` → 200 ✅
2. Navigate to `/` → App.tsx renders
3. `useAuth()` returns `{ isAuthenticated: false, isLoading: TRUE }` ✅
4. Root route shows "Verifying session..." loader ✅
5. Backend session check completes → updates to `isAuthenticated: true` ✅
6. Root route re-renders → redirects to `/dashboard` ✅

---

## Key Changes Made

### 1. Added Session Hydration Flag

```typescript
let sessionHydrated = false; // Track if backend check is complete
```

### 2. Keep isLoading=true Until Session Hydrated

```typescript
export function useAuth(): AuthState {
  const [state, setState] = useState(() => ({ 
    ...globalState,
    isLoading: !sessionHydrated ? true : globalState.isLoading
  }));
  // ...
}
```

### 3. Wait for Session Check in Root Route

```typescript
<Route path="/">{(() => {
  if (isLoading) {
    return <LoadingSpinner message="Verifying session..." />;
  }
  
  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  } else {
    return <Landing />;
  }
})()}
</Route>
```

---

## Debug Checklist

Run these in order after deploying:

### ✅ 1. Verify No Duplicate Auth Providers

```bash
cd /workspaces/bingeboard-local/client
grep -r "useAuth" src/ | grep -v "node_modules" | grep -v ".test."
```

**Expected:** Only imports, no multiple provider wrappers

### ✅ 2. Check Auth Hook Hydration

Look for these logs in console during page load:

```
🔍 Checking backend session at /api/auth/status...
📡 Backend session response: 200 OK
✅ Backend session RESTORED: { email: "..." }
✅ Initial auth sequence complete, session hydrated: true
```

### ✅ 3. Check Root Route Behavior

After login, you should see:

```
🛣️ Root route render: { isAuthenticated: false, isLoading: true, ... }
⏸️ Root route waiting for auth to complete...
🛣️ Root route render: { isAuthenticated: true, isLoading: false, ... }
✅ User authenticated, redirecting to dashboard
```

---

## Manual Testing Steps

1. **Clear all state:**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   // In DevTools: Application → Cookies → Delete all
   ```

2. **Reload page:**
   - Should show landing page
   - Auth state: `{ isAuthenticated: false, isLoading: false }`

3. **Login:**
   - Click login button
   - Complete OAuth flow
   - Watch console logs

4. **Expected logs:**
   ```
   ✅ OAuth redirect successful: your@email.com
   ✅ OAuth redirect session created
   ✅ Initial auth sequence complete, session hydrated: true
   🛣️ Root route render: { isAuthenticated: true, isLoading: false }
   ✅ User authenticated, redirecting to dashboard
   ```

5. **Refresh page (test persistence):**
   - Should NOT go back to landing
   - Should show "Verifying session..." briefly
   - Should automatically redirect to dashboard

---

## If Still Broken

### Check 1: Backend Session Endpoint

```bash
# In terminal
curl -i https://bingeboard-two.vercel.app/api/auth/status \
  -H "Cookie: session=YOUR_SESSION_COOKIE"
```

Replace `YOUR_SESSION_COOKIE` with actual cookie from browser.

**Expected:** `200 OK` with user data

### Check 2: Cookie Domain

In browser DevTools → Application → Cookies, check:
- Domain: Should match your site domain
- Path: Should be `/`
- SameSite: `None` or `Lax`
- Secure: `true` (for HTTPS)

### Check 3: CORS/Credentials

In browser Network tab, check `/api/auth/status` request:
- Request Headers should include `Cookie: ...`
- Response Headers should include `Access-Control-Allow-Credentials: true`

---

## Quick Fixes

### If session check never completes:

```typescript
// Add timeout in useAuth.ts
const timeoutId = setTimeout(() => {
  if (!sessionHydrated) {
    console.warn('⚠️ Session check timed out, assuming no session');
    sessionHydrated = true;
    updateState({ isLoading: false });
  }
}, 5000); // 5 second timeout
```

### If cookies not sent:

Check `api-config.ts` has:
```typescript
export const apiFetch = (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include', // CRITICAL
  });
};
```

---

## Success Criteria

- [x] Login succeeds and creates backend session
- [x] Backend session persists across page refreshes
- [x] Root route waits for session check before redirecting
- [x] Authenticated users stay on dashboard after refresh
- [x] Non-authenticated users see landing page

**Last Updated:** 2024-11-20  
**Status:** 🟢 FIXED - Session hydration now blocks routing
