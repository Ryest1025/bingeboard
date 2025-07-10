# IMMEDIATE OAUTH FIX - Add These URLs to Provider Consoles

## The Problem
OAuth redirect works (302 responses) but callbacks fail because provider consoles don't have the current Replit callback URLs.

## REQUIRED ACTIONS - DO THESE NOW

### 1. Google Cloud Console
**URL:** https://console.cloud.google.com/apis/credentials  
**Project:** Your Google project  
**OAuth 2.0 Client ID:** 874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr.apps.googleusercontent.com

**ADD THIS EXACT URL to "Authorized redirect URIs":**
```
https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/google/callback
```

### 2. Facebook Developer Console  
**URL:** https://developers.facebook.com/apps/1407155243762479/fb-login/settings/
**App ID:** 1407155243762479

**ADD THIS EXACT URL to "Valid OAuth Redirect URIs":**
```
https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/facebook/callback
```

## Test Status
Run these to verify configuration:
- Google: http://localhost:5000/api/auth/google/test
- Facebook: http://localhost:5000/api/auth/facebook/test

## After Adding URLs
1. Wait 2-3 minutes for provider caches to update
2. Test Google login button
3. Test Facebook login button
4. Authentication should complete successfully

## Why This Will Work
- OAuth strategies are properly configured ✅
- Server-side authentication is working ✅  
- Callback URLs just need to be whitelisted in provider consoles ✅
- This is a one-time setup that fixes the issue permanently ✅