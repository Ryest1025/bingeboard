# Google OAuth Configuration Guide

## Current Configuration
- Client ID: 874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr.apps.googleusercontent.com
- Client Secret: [Configured]
- Your Replit Domain: 80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev

## Required Google Cloud Console Settings

### 1. Go to Google Cloud Console
URL: https://console.cloud.google.com/apis/credentials

### 2. Configure OAuth 2.0 Client
Find your OAuth 2.0 Client ID: `874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr.apps.googleusercontent.com`

### 3. Authorized Redirect URIs
Add this exact URL to your OAuth client:
```
https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/google/callback
```

### 4. Authorized JavaScript Origins
Add these domains:
```
https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev
https://riker.replit.dev
```

## Common 403 Error Causes
1. **Missing Redirect URI**: The callback URL must be exactly configured in Google Cloud Console
2. **Domain Mismatch**: JavaScript origins must include your Replit domain
3. **OAuth Consent Screen**: May need to be configured for external users
4. **API Permissions**: Google+ API or People API might need to be enabled

## Steps to Fix 403 Error
1. Open Google Cloud Console
2. Navigate to APIs & Services → Credentials
3. Click on your OAuth 2.0 Client ID
4. Add the redirect URI and JavaScript origins listed above
5. Save the configuration
6. Wait a few minutes for changes to propagate