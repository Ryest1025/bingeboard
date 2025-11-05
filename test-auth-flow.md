# Authentication Flow Test Plan

## Expected Flow After Deploy

### 1. Login Process
```
User enters email/password
  ↓
Firebase authenticates user
  ↓
Client gets Firebase ID token via user.getIdToken()
  ↓
Client sends POST /api/auth/firebase-session with:
  - Authorization: Bearer <idToken>
  - Body: { idToken, firebaseToken, user }
  ↓
Backend verifies token with Firebase Admin
  ↓
Backend creates session cookie with admin.auth().createSessionCookie()
  ↓
Backend sets bb_session cookie:
  - httpOnly: true
  - secure: true
  - sameSite: 'none'
  - maxAge: 5 days
  ↓
Backend returns { success: true, user }
  ↓
Client receives response with cookie set automatically
```

### 2. Session Persistence Check
```
User loads app / refreshes page
  ↓
Client calls GET /api/auth/status
  ↓
Backend checks cookies for bb_session
  ↓
Backend verifies with admin.auth().verifySessionCookie()
  ↓
Backend returns { isAuthenticated: true, user }
  ↓
Client sets state, user stays logged in
```

### 3. Logout Process
```
User clicks logout
  ↓
Client calls POST /api/auth/logout
  ↓
Backend clears all cookies (bb_session, bingeboard_auth, etc.)
  ↓
Client signs out from Firebase
  ↓
Client updates state to logged out
```

## Critical Requirements

### Environment Variables (Vercel)
- `FIREBASE_ADMIN_KEY` - Full service account JSON

### Cookie Requirements
- Name: `bb_session`
- Domain: Must work cross-origin (bingeboardapp.com → bingeboard-two.vercel.app)
- SameSite: `none`
- Secure: `true` (HTTPS required)
- HttpOnly: `true`

### Testing Steps

1. **Deploy and wait** (~2 mins for Vercel)

2. **Clear browser cookies** for bingeboardapp.com

3. **Open in Incognito** or new browser session

4. **Login** at https://bingeboardapp.com/login

5. **Check DevTools** → Application → Cookies:
   - Should see `bb_session` cookie
   - Check SameSite = None, Secure = Yes

6. **Refresh page** - should stay logged in

7. **Check console** for:
   ```
   ✅ Session cookie verified: [email]
   ```

8. **Navigate** to /dashboard - should not redirect to /login

## Common Issues & Fixes

### Issue: Cookie not set
- Check HTTPS is enabled (required for sameSite=none)
- Check credentials: 'include' in fetch requests
- Verify FIREBASE_ADMIN_KEY is set on Vercel

### Issue: Cookie set but not sent on subsequent requests
- Check SameSite is 'none' not 'lax'
- Check secure is true
- Check credentials: 'include' in all fetch calls

### Issue: Session expires immediately
- Check Firebase Admin is actually creating session cookie
- Verify verifySessionCookie is being called
- Check for errors in Vercel logs

### Issue: Still redirecting after login
- Check /api/auth/status is returning isAuthenticated: true
- Verify bb_session cookie exists in request
- Check console logs for auth verification

