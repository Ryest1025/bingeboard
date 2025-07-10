# AUTHENTICATION LOCK CONFIGURATION
**CRITICAL: This document permanently locks Firebase-only authentication to prevent daily regression**

## 🔒 PERMANENT FIREBASE AUTHENTICATION SYSTEM - DO NOT MODIFY

### LOCKED CONFIGURATION STATUS
- ✅ **Firebase Authentication**: Permanently enabled and locked
- ❌ **Server-side OAuth**: Permanently removed and forbidden
- ❌ **Supabase Auth**: Permanently removed and forbidden  
- ❌ **Passport.js**: Permanently removed and forbidden
- ❌ **Duplicate Login Pages**: Permanently removed and forbidden

### AUTHENTICATION FILE STRUCTURE - LOCKED
```
✅ KEEP THESE FILES:
- client/src/firebase/auth.ts (LOCKED - Firebase authentication only)
- client/src/firebase/config-simple.ts (LOCKED - Firebase configuration)
- client/src/hooks/useAuth.ts (LOCKED - Firebase auth state management)
- client/src/pages/login-simple.tsx (LOCKED - Single login page)
- server/auth.ts (LOCKED - Firebase token verification only)

❌ REMOVED PERMANENTLY:
- client/src/components/simple-auth.tsx (DELETED)
- client/src/lib/authUtils.ts (DELETED)
- client/src/pages/oauth-redirect.tsx (DELETED)
- server/routes/auth.ts (DELETED)
- server/routes/oauth.ts (DELETED)
- All duplicate login pages in archive/ (DO NOT RESTORE)
```

### LOCKED AUTHENTICATION FLOW
1. **Frontend**: Firebase client authentication (Google/Facebook/Email)
2. **Session Creation**: `/api/auth/firebase-session` endpoint only
3. **Backend**: Firebase token verification + PostgreSQL session storage
4. **Logout**: Firebase signOut() + `/api/auth/logout` session destruction

### FORBIDDEN MODIFICATIONS
**NEVER ADD BACK:**
- Server-side OAuth routes (`/api/auth/google`, `/api/auth/facebook`)
- OAuth callback handlers 
- Passport.js authentication middleware
- Supabase authentication code
- Multiple login page variations
- getOAuthCallbackUrl() helper functions
- OAuth testing endpoints

### PERMANENT RULES TO PREVENT REGRESSION
1. **Single Source of Truth**: Only `client/src/firebase/auth.ts` handles authentication
2. **No Dual Systems**: Firebase authentication only - no mixing with other providers
3. **Session Cookie Name**: `bingeboard.session` (never change)
4. **Import Lock**: All auth imports must come from `client/src/firebase/auth.ts`
5. **useAuth Hook**: Single authentication hook across entire application

### DAILY STABILITY CHECKLIST
- [ ] Firebase authentication working
- [ ] No server-side OAuth routes present
- [ ] Single login page (login-simple.tsx) functional
- [ ] Backend session creation via Firebase tokens only
- [ ] No conflicting authentication systems

### WARNING SIGNS OF REGRESSION
🚨 **If you see any of these, immediately revert:**
- Multiple authentication hooks (useAuth, useSupabaseAuth, etc.)
- Server-side OAuth endpoints reappearing
- Passport.js imports or req.login() calls
- Multiple login page components
- OAuth callback URL generators
- Mixed authentication systems

### RECOVERY PROCEDURE
If authentication regresses:
1. Remove all non-Firebase authentication code
2. Restore files from this locked configuration
3. Verify only Firebase authentication remains
4. Test login/logout flow completely
5. Document any changes in changelog

## 🔐 LOCKED: July 10, 2025
**This configuration is locked to prevent daily authentication breakage**
**DO NOT MODIFY WITHOUT EXPLICIT USER APPROVAL**