# IMMEDIATE OAUTH SETUP REQUIRED

## Current Status
- Google Client ID: 874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr.apps.googleusercontent.com
- Facebook App ID: 1407155243762479
- Current Domain: 80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev

## Server Logs Show
```
=== GOOGLE AUTH INITIATED ===
Google Client ID: 874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr.apps.googleusercontent.com 
Google Client Secret exists: true
Available strategies: ['google']
GET /api/auth/google 302 in 53ms
```

Authentication is working server-side but failing at OAuth provider level.

## REQUIRED IMMEDIATE ACTIONS

### 1. Google Cloud Console
**URL**: https://console.cloud.google.com/apis/credentials/oauthclient/874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr.apps.googleusercontent.com

**Steps**:
1. Go to OAuth 2.0 Client IDs
2. Click on the client ID: 874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr.apps.googleusercontent.com
3. Add to "Authorized redirect URIs":
   ```
   https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/google/callback
   ```
4. Save changes

### 2. Facebook Developer Console
**URL**: https://developers.facebook.com/apps/1407155243762479/fb-login/settings/

**Steps**:
1. Go to Facebook Login > Settings
2. Add to "Valid OAuth Redirect URIs":
   ```
   https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/facebook/callback
   ```
3. Save changes

## Test Authentication
After updating both consoles:
1. Go to: https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/login
2. Click "Continue with Google"
3. Should redirect to Google OAuth consent screen
4. After consent, should redirect back with successful login

## WHY THIS IS URGENT
- Domain changes daily - tomorrow's domain will be different
- Need to test working authentication TODAY
- Then set up permanent domain to prevent daily breakage

## SUCCESS CRITERIA
- Google login button → Google OAuth screen → Successful login
- Facebook login button → Facebook OAuth screen → Successful login
- User profile appears in top navigation after login