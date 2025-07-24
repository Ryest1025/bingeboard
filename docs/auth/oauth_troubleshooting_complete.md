# Complete OAuth Troubleshooting Guide

## Current Status
- Facebook App ID: 1407155243762479 ✓
- Google Client ID: 874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr.apps.googleusercontent.com ✓
- Authentication redirects are working (302 status) ✓
- OAuth callbacks are failing ❌

## Facebook Configuration Checklist

### 1. Basic Settings
**URL:** https://developers.facebook.com/apps/1407155243762479/settings/basic/

Required settings:
- **App Domains:** `riker.replit.dev`
- **App Type:** Should be "Consumer" or "Business"
- **Privacy Policy URL:** Can be blank for development

### 2. Facebook Login Settings  
**URL:** https://developers.facebook.com/apps/1407155243762479/fb-login/settings/

Required settings:
- **Valid OAuth Redirect URIs:**
  ```
  https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/facebook/callback
  ```
- **Client OAuth Login:** ON
- **Web OAuth Login:** ON

### 3. App Review Status
**URL:** https://developers.facebook.com/apps/1407155243762479/app-review/

Required settings:
- **App Status:** Development (NOT Live)
- **Test Users:** Add yourself as a test user
- **Permissions:** email, public_profile should be available

## Google OAuth Configuration Checklist

### 1. OAuth 2.0 Client Configuration
**URL:** https://console.cloud.google.com/apis/credentials

Required settings:
- **Application type:** Web application
- **Authorized redirect URIs:**
  ```
  https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/google/callback
  ```
- **Authorized JavaScript origins:**
  ```
  https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev
  https://riker.replit.dev
  ```

### 2. APIs & Services
**URL:** https://console.cloud.google.com/apis/library

Required APIs to enable:
- **Google+ API** (Legacy but may be required)
- **People API** (Current recommended)
- **OAuth2 API**

### 3. OAuth Consent Screen
**URL:** https://console.cloud.google.com/apis/credentials/consent

Required settings:
- **User Type:** External (for testing)
- **Application name:** BingeBoard
- **Scopes:** email, profile, openid
- **Test users:** Add your email as a test user

## Common Issues and Solutions

### "Firefox cannot open page" (Facebook)
**Cause:** Facebook app not properly configured
**Solution:** 
1. Verify app is in Development mode
2. Add your Replit domain to App Domains
3. Add exact callback URL to Valid OAuth Redirect URIs

### "403 Error" (Google)
**Cause:** Google OAuth client missing redirect URI or APIs not enabled
**Solution:**
1. Add exact callback URL to Authorized redirect URIs
2. Enable People API in Google Cloud Console
3. Configure OAuth consent screen

### Both services redirect but don't complete login
**Cause:** Missing API permissions or incorrect app configuration
**Solution:**
1. Check that both apps are in development/testing mode
2. Add yourself as a test user in both services
3. Verify all required permissions are granted

## Testing Steps
1. Clear browser cookies and cache
2. Try authentication in private/incognito mode
3. Check browser developer console for specific error messages
4. Verify redirect URIs match exactly (no trailing slashes, correct protocol)