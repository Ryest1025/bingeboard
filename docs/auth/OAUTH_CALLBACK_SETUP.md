# OAuth Callback Setup Guide

## Current OAuth Callback URLs

**✅ GOOGLE CLOUD CONSOLE SETUP:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your project: `bingeboard`
3. Edit the OAuth 2.0 Client ID: `874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr.apps.googleusercontent.com`
4. Add this URL to "Authorized redirect URIs":
   ```
   https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/google/callback
   ```

**✅ FACEBOOK DEVELOPER CONSOLE SETUP:**
1. Go to: https://developers.facebook.com/apps/
2. Select your app: `bingeboard`
3. Go to Facebook Login → Settings
4. Add this URL to "Valid OAuth Redirect URIs":
   ```
   https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/facebook/callback
   ```

## Current Domain
The current Replit domain is: `80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev`

This domain changes daily, which is why OAuth breaks every day.

## Permanent Solution
Configure custom domain `www.joinbingeboard.com` to eliminate daily OAuth URL changes.

## Testing OAuth
After adding the callback URLs:
1. Test Google login: Visit the app and click "Sign in with Google"
2. Test Facebook login: Visit the app and click "Sign in with Facebook"
3. Both should complete authentication and redirect back to the app

## Current Status
- ✅ Server-side OAuth routes working
- ✅ Callback handlers implemented
- ❌ Provider console URLs need configuration
- ❌ Domain changes daily (requires custom domain solution)