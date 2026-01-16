# 🚨 URGENT: Firebase Backend Session Fix

**Date:** January 16, 2026  
**Issue:** Login works on Firebase frontend but backend sessions aren't being created  
**Impact:** Users can't stay logged in, infinite login loop

---

## The Problem

Console logs show:
```
✅ Firebase email/password login successful
🔐 Creating backend session...
✅ Backend session created, syncing auth state...
🔄 Refreshing session...
ℹ️ No session found  ← PROBLEM HERE!
```

**Root Cause:** Firebase Admin SDK on Vercel backend is not initialized because environment variables are missing.

---

## Immediate Fix (5 minutes)

### Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **bingeboard-73c5f**
3. Click ⚙️ (Settings) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the downloaded JSON file

### Step 2: Convert to Base64

```bash
# On your computer (where JSON file is)
cat firebase-service-account.json | base64 | tr -d '\n'
```

Copy the output (long base64 string).

### Step 3: Add to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project: **bingeboard-two**
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT_BASE64`
   - **Value:** (paste the base64 string from step 2)
   - **Environment:** Production, Preview, Development (all 3)
5. Click **Save**

### Step 4: Redeploy

```bash
# In your terminal
cd /workspaces/bingeboard-local
git commit --allow-empty -m "Trigger redeployment for Firebase Admin env vars"
git push origin main
```

Or in Vercel dashboard: **Deployments** → latest deployment → **...** menu → **Redeploy**

### Step 5: Test (after 2 minutes)

1. Go to bingeboardapp.com
2. Try logging in
3. Check console for:
   ```
   ✅ Firebase Admin initialized successfully
   ✅ Session refreshed: your@email.com
   ```

---

## Alternative: Quick Workaround (use client-side auth only)

If you can't set up Firebase Admin right now, you can temporarily use client-side auth only:

### Update api/index.js

Change lines 131-136 from:
```javascript
if (!admin.apps.length || !firebaseInitialized) {
  console.error('Firebase Admin not initialized - missing credentials');
  // Return success but log warning
  return res.status(200).json({ 
    success: true,
    warning: 'Session created on client only'
  });
}
```

To:
```javascript
if (!admin.apps.length || !firebaseInitialized) {
  console.warn('⚠️ Firebase Admin not configured - using client-side auth only');
  
  // Store session in memory (temporary workaround)
  // This won't persist across serverless function instances
  // but allows testing
  const body = req.body || JSON.parse(await getRawBody(req));
  const mockUser = {
    email: body.user?.email || 'user@example.com',
    uid: 'temp-uid',
    name: body.user?.displayName || 'User'
  };
  
  res.setHeader('Set-Cookie', cookie.serialize('bb_session', 
    JSON.stringify(mockUser), {
    maxAge: 60 * 60 * 24 * 5, // 5 days
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/'
  }));
  
  return res.status(200).json({ success: true });
}
```

**Note:** This is NOT secure for production but will allow testing.

---

## Why This Happened

The backend code checks for Firebase Admin credentials:
```javascript
if (process.env.FIREBASE_ADMIN_KEY) {
  serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString());
} else {
  console.warn('⚠️ No Firebase Admin credentials found');
  serviceAccount = null;
}
```

None of these environment variables exist in Vercel, so:
1. Firebase Admin never initializes
2. Session cookie creation fails silently
3. `/api/auth/status` always returns `isAuthenticated: false`
4. User gets stuck in login loop

---

## Social Login Issue (Separate)

**Error:** `auth/unauthorized-domain`  
**Fix:** Add domain to Firebase authorized domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **bingeboard-73c5f**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add: `bingeboardapp.com`
6. Click **Save**

This allows Google/Facebook OAuth to work on your custom domain.

---

## Testing Checklist

After fixes:

- [ ] Firebase Admin initialized (check Vercel logs)
- [ ] Email/password login works and stays logged in
- [ ] Google OAuth works (after domain authorization)
- [ ] Facebook OAuth works (after domain authorization)
- [ ] Session persists across page refreshes
- [ ] Console shows "✅ Session refreshed: email@example.com"

---

## Priority

**CRITICAL** - Without this fix:
- ❌ No one can stay logged in
- ❌ All auth is client-side only
- ❌ Backend API calls won't be authenticated
- ❌ Social login doesn't work

**Fix this first** before deploying any other features.

---

Last Updated: January 16, 2026
