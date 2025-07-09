# OAuth Callback URL Update Required

## Issue
Google and Facebook authentication are failing because the OAuth provider consoles have outdated callback URLs. The app is currently running on a different domain than what's configured in the OAuth providers.

## Current Status
- **App Domain**: `80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev`
- **Configured Domain**: `www.joinbingeboard.com`
- **Required Callback URLs**: 
  - `https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/google/callback`
  - `https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/facebook/callback`

## Solutions

### Option 1: Update OAuth Provider Consoles (Quick Fix)

#### Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Find your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   ```
   https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/google/callback
   ```

#### Facebook Developer Console
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Navigate to your app > Facebook Login > Settings
3. Add to **Valid OAuth Redirect URIs**:
   ```
   https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/facebook/callback
   ```

### Option 2: Configure Custom Domain (Permanent Fix)
Set up the custom domain `www.joinbingeboard.com` to point to this Replit app, eliminating daily domain changes.

## Changes Made
- Updated server OAuth configuration to use current Replit domain
- Fixed callback URL generation to match actual running domain
- Authentication will work once provider consoles are updated

## Status
⚠️ **Action Required**: OAuth provider consoles need callback URL updates before authentication will work.