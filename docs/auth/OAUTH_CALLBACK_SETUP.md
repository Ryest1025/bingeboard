# OAuth Callback URL Setup Guide

## Current Domain Setup (For Testing)
**Current Replit Domain:** `80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev`

**Required Callback URL:** `https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/auth/callback`

**Status:** Use this URL for immediate OAuth testing!

## Google Cloud Console Setup

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Select your project (or create one if needed)

2. **Configure OAuth Client:**
   - Find your OAuth 2.0 Client ID: `874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr.apps.googleusercontent.com`
   - Click "Edit" on the OAuth client
   - In "Authorized redirect URIs", add:
     ```
     https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/auth/callback
     ```
   - Click "Save"

## Facebook Developer Console Setup

1. **Go to Facebook Developer Console:**
   - Visit: https://developers.facebook.com/apps/
   - Select your app ID: `1407155243762479`

2. **Configure OAuth Settings:**
   - Go to "Facebook Login" → "Settings"
   - In "Valid OAuth Redirect URIs", add:
     ```
     https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/auth/callback
     ```
   - Click "Save Changes"

## Testing After Setup

1. **Test Google Login:**
   - Go to `/login` page
   - Click "Log in with Google"
   - Should redirect to Google authentication
   - After approval, redirects back to your app

2. **Test Facebook Login:**
   - Go to `/login` page
   - Click "Log in with Facebook"
   - Should redirect to Facebook authentication
   - After approval, redirects back to your app

## Troubleshooting

- **403 Error:** Callback URL not configured in provider console
- **Invalid Redirect URI:** URL doesn't match exactly (check https/http)
- **App Not Approved:** Facebook apps need review for public use

## Notes

- **PERMANENT SOLUTION:** Using custom domain eliminates daily OAuth breakage
- **One-time Setup:** Configure callback URL once, works forever
- **Mobile Compatible:** Works identically on all devices
- Both OAuth providers are already enabled in Firebase Console