# AUTHENTICATION SYSTEM TEST - LOCKED CONFIGURATION
**Run this test to verify Firebase-only authentication is working properly**

## 🔒 LOCKED SYSTEM VERIFICATION

### TEST CHECKLIST - RUN DAILY
- [ ] **Firebase Authentication**: Login/logout works with Google
- [ ] **Firebase Authentication**: Login/logout works with Facebook  
- [ ] **Firebase Authentication**: Email/password registration works
- [ ] **Firebase Authentication**: Email/password login works
- [ ] **Backend Session**: Sessions created after Firebase auth
- [ ] **Protected Routes**: Authenticated users can access dashboard
- [ ] **Logout**: Both Firebase and backend sessions cleared
- [ ] **No Errors**: No 401/403 errors in console during normal flow

### AUTHENTICATION ENDPOINTS - FIREBASE ONLY
✅ **Working Endpoints**:
- `POST /api/auth/firebase-session` (Firebase token → backend session)
- `POST /api/auth/logout` (destroy backend session)
- `GET /api/auth/user` (get current user data)
- `POST /api/auth/register` (email/password registration)
- `POST /api/auth/login` (email/password login)

❌ **Forbidden Endpoints** (these should NOT exist):
- `/api/auth/google` (server-side OAuth - REMOVED)
- `/api/auth/facebook` (server-side OAuth - REMOVED)
- `/api/auth/google/callback` (OAuth callback - REMOVED)
- `/api/auth/facebook/callback` (OAuth callback - REMOVED)

### AUTHENTICATION FILES - LOCKED STATUS
✅ **Required Files**:
- `client/src/firebase/auth.ts` - Firebase authentication functions
- `client/src/firebase/config-simple.ts` - Firebase configuration
- `client/src/hooks/useAuth.ts` - Authentication state management
- `client/src/pages/login-simple.tsx` - Single login page
- `server/auth.ts` - Firebase token verification

❌ **Forbidden Files** (these should NOT exist):
- `client/src/components/simple-auth.tsx` (DELETED)
- `client/src/pages/oauth-redirect.tsx` (DELETED)
- `server/routes/auth.ts` (DELETED)
- `server/routes/oauth.ts` (DELETED)
- Multiple login page variations (DELETED)

### QUICK TEST COMMANDS
```bash
# Check for forbidden OAuth routes
curl -s http://localhost:5000/api/auth/google && echo "❌ OAuth route found!" || echo "✅ OAuth route removed"

# Test Firebase session endpoint
curl -s -X POST http://localhost:5000/api/auth/firebase-session && echo "✅ Firebase endpoint working"

# Check authentication files
ls client/src/firebase/auth.ts && echo "✅ Firebase auth file exists"
ls client/src/pages/login-simple.tsx && echo "✅ Single login page exists"
```

### SYSTEM STABILITY INDICATORS
🟢 **Healthy System**:
- Single useAuth hook across all components
- Firebase authentication working without errors
- Backend sessions created automatically after Firebase auth
- No OAuth server routes present
- Single login page functional

🔴 **Unhealthy System** (immediate fix required):
- Multiple authentication hooks present
- Server-side OAuth routes reappearing
- Authentication infinite loops
- Multiple login pages
- Mixed authentication systems

## 🔐 LOCKED: July 10, 2025
**This test ensures Firebase-only authentication remains stable**
**Run daily to prevent regression**