# OAuth Provider Configuration - IMMEDIATE FIX REQUIRED

## Root Cause of 403 Errors
Google and Facebook OAuth providers need their callback URLs updated to the current Replit domain.

## URGENT: Update These URLs in Provider Consoles

### Google Cloud Console
**Need to Add This Callback URL:**
```
https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/google/callback
```

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services > Credentials
3. Find your OAuth 2.0 Client ID (874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr.apps.googleusercontent.com)
4. Add the callback URL above to "Authorized redirect URIs"

### Facebook Developer Console
**Need to Add This Callback URL:**
```
https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/facebook/callback
```

**Steps:**
1. Go to [Facebook for Developers](https://developers.facebook.com)
2. Navigate to your app (ID: 1407155243762479)
3. Go to Facebook Login > Settings
4. Add the callback URL above to "Valid OAuth Redirect URIs"

## Current Status
✅ Server authentication working
✅ OAuth strategies configured
✅ Apps connecting to providers
❌ Provider consoles need callback URL updates

## What's Happening
- Authentication requests are reaching Google/Facebook
- Providers reject them because callback URLs don't match
- Need to update provider console settings

This is a 5-minute fix once you update the provider consoles!