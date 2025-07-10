# Complete OAuth Setup Guide

## Overview
This guide provides the exact steps to configure Google and Facebook OAuth providers to work with BingeBoard's authentication system.

## Current Domain Information
- **Current Replit Domain**: `80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev`
- **Custom Domain**: `www.joinbingeboard.com` (configured, requires DNS propagation)
- **Protocol**: HTTPS (forced for all Replit domains)

## Required OAuth Callback URLs

### Google Cloud Console Configuration
1. **Go to**: [Google Cloud Console](https://console.cloud.google.com)
2. **Navigate to**: APIs & Services > Credentials
3. **Select**: Your OAuth 2.0 Client ID
4. **Add to Authorized redirect URIs**:
   ```
   https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/google/callback
   ```
   **OR (if custom domain is active)**:
   ```
   https://www.joinbingeboard.com/api/auth/google/callback
   ```

### Facebook Developer Console Configuration
1. **Go to**: [Facebook Developers](https://developers.facebook.com)
2. **Navigate to**: Your App > App Settings > Facebook Login
3. **Add to Valid OAuth Redirect URIs**:
   ```
   https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/facebook/callback
   ```
   **OR (if custom domain is active)**:
   ```
   https://www.joinbingeboard.com/api/auth/facebook/callback
   ```

## Environment Variables Required
Ensure these are set in your Replit environment:
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

## Testing OAuth Integration
1. Visit your app: `https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev`
2. Click "Log in with Google" or "Log in with Facebook"
3. Complete the OAuth flow
4. Should redirect back to your app with successful authentication

## Troubleshooting

### 404 Errors
- **Cause**: OAuth callback URLs in provider consoles don't match current domain
- **Solution**: Update callback URLs in Google/Facebook consoles to match current domain

### Domain Changes
Replit domains change daily. To avoid this:
1. Configure custom domain `www.joinbingeboard.com` 
2. Update OAuth providers to use custom domain URLs
3. This provides permanent, stable URLs

### Mobile Authentication
The system automatically detects mobile devices and uses appropriate authentication flow:
- **Desktop**: Popup-based authentication
- **Mobile**: Redirect-based authentication

## Current Implementation Details
- **Authentication Method**: Server-side OAuth with session management
- **Session Storage**: PostgreSQL with Express sessions
- **Domain Detection**: Automatic HTTPS for Replit/custom domains
- **Mobile Compatibility**: Device-specific authentication flows

## Quick Domain Check
To see current OAuth URLs, visit:
```
https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/test/oauth-urls
```

## Success Indicators
When properly configured:
- OAuth buttons redirect to provider login pages
- After authentication, users return to BingeBoard dashboard
- No 404 or domain authorization errors
- Sessions persist across page refreshes

## One-Time Setup with Custom Domain
For permanent solution:
1. Ensure `www.joinbingeboard.com` DNS is properly configured
2. Update OAuth providers to use:
   - Google: `https://www.joinbingeboard.com/api/auth/google/callback`
   - Facebook: `https://www.joinbingeboard.com/api/auth/facebook/callback`
3. This eliminates daily domain updates