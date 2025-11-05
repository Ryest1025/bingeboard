# 🔐 Authentication Debug Guide

## Quick Test Steps

### 1. Wait for Deployment
- Vercel should deploy in ~2-3 minutes
- Check: https://vercel.com/your-project/deployments

### 2. Clear Everything
```javascript
// Open DevTools Console (F12) and run:
// Clear all cookies
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// Clear sessionStorage
sessionStorage.clear();

// Clear localStorage
localStorage.clear();

console.log('✅ All storage cleared');
```

### 3. Hard Refresh
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

### 4. Login Flow Test

**Go to:** https://bingeboardapp.com/login

**Watch Console for:**
```
🔍 Checking backend session on app load...
ℹ️ No backend session found
🔑 Firebase user detected: your.email@gmail.com
✅ Firebase authentication and backend session synced
```

**Check Cookies (DevTools → Application → Cookies):**
- Should see `bb_session` cookie
- Domain: `bingeboard-two.vercel.app` or `.vercel.app`
- SameSite: `None`
- Secure: `✓`
- HttpOnly: `✓`

### 5. Refresh Test

**Refresh the page (F5)**

**Watch Console for:**
```
🔍 Checking backend session on app load...
✅ Backend session found: your.email@gmail.com
```

**Expected Behavior:**
- ✅ Should stay logged in
- ✅ Should NOT redirect to login page
- ✅ User info should appear immediately

### 6. Navigation Test

**Navigate to different pages:**
- `/dashboard`
- `/discover`
- `/friends`

**Expected:**
- ✅ No logout
- ✅ No redirect to login
- ✅ User stays authenticated

## Common Issues & Fixes

### ❌ Cookie not visible in DevTools

**Possible causes:**
1. HTTPS not enabled → Cookie requires secure=true
2. Domain mismatch → Check cookie domain matches your backend
3. FIREBASE_ADMIN_KEY not set on Vercel

**Fix:**
```bash
# Check Vercel environment variables
vercel env ls

# Should show FIREBASE_ADMIN_KEY
```

### ❌ "Session cookie verification failed"

**Console shows:**
```
❌ Session cookie verification failed: Error: ...
```

**Fix:**
1. Check FIREBASE_ADMIN_KEY is valid JSON
2. Verify it's the service account key, not client config
3. Try logging out and back in to get fresh token

### ❌ Still getting logged out on refresh

**Console shows:**
```
ℹ️ No backend session found
```

**Possible causes:**
1. Cookie not being sent with request
2. Cookie expired (5 days)
3. Firebase Admin not initialized

**Debug:**
```javascript
// Check if cookie exists
console.log('Cookies:', document.cookie);

// Check fetch is sending cookies
fetch('/api/auth/status', { credentials: 'include' })
  .then(r => r.json())
  .then(d => console.log('Auth status:', d));
```

### ❌ CORS errors

**Console shows:**
```
Access to fetch at 'https://bingeboard-two.vercel.app/api/auth/status' 
from origin 'https://bingeboardapp.com' has been blocked by CORS policy
```

**This shouldn't happen with current setup, but if it does:**

Backend should already have CORS enabled. If not, add to server:
```typescript
app.use(cors({
  origin: 'https://bingeboardapp.com',
  credentials: true
}));
```

## Vercel Logs Check

**View backend logs:**
```bash
vercel logs bingeboard-two --follow
```

**Look for:**
```
🔍 Auth status check: { hasSessionCookie: true, hasLegacyToken: false }
✅ Session cookie verified: your.email@gmail.com
```

## Success Indicators

✅ **Login works:**
- Console shows session created
- Cookie appears in DevTools
- Dashboard loads

✅ **Refresh works:**
- Console shows "Backend session found"
- No redirect to login
- User data persists

✅ **Navigation works:**
- Moving between pages keeps you logged in
- No auth checks cause flickering

✅ **Logout works:**
- Cookie gets cleared
- Redirects to landing page
- Can't access protected routes

## Emergency Recovery

**If completely stuck:**

1. **Clear all site data:**
   - DevTools → Application → Clear Storage → Clear site data

2. **Try Incognito mode:**
   - Fresh browser session
   - No cached cookies/data

3. **Check Vercel deployment:**
   - Verify latest commit is deployed
   - Check deployment logs for errors

4. **Verify environment variables:**
   ```bash
   vercel env pull .env.local
   cat .env.local | grep FIREBASE
   ```

5. **Test backend directly:**
   ```bash
   curl https://bingeboard-two.vercel.app/api/auth/status
   # Should return: {"isAuthenticated":false,"user":null}
   ```
