# Firebase OAuth Setup Guide

## Quick Setup Links
- **Firebase Console**: https://console.firebase.google.com/project/bingeboard-73c5f/authentication/providers
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials/oauthclient
- **Facebook Developer Console**: https://developers.facebook.com/apps/

## Step 1: Enable OAuth Providers in Firebase Console

### Google Authentication
1. Go to [Firebase Console Authentication](https://console.firebase.google.com/project/bingeboard-73c5f/authentication/providers)
2. Click "Sign-in method" tab
3. Find "Google" and click to enable
4. Click "Enable" toggle
5. Add your support email (required)
6. Click "Save"

### Facebook Authentication
1. In the same Firebase Console page
2. Find "Facebook" and click to enable
3. Click "Enable" toggle
4. You'll need Facebook App ID and App Secret from Facebook Developer Console
5. Click "Save"

## Step 2: Configure OAuth Credentials

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials/oauthclient)
2. Select your project: `bingeboard-73c5f`
3. Find your OAuth 2.0 Client ID
4. Add authorized redirect URIs:
   - `https://bingeboard-73c5f.firebaseapp.com/__/auth/handler`
   - `https://auth.bingeboard-73c5f.firebaseapp.com/__/auth/handler`
5. Click "Save"

### Facebook OAuth Setup
1. Go to [Facebook Developer Console](https://developers.facebook.com/apps/)
2. Select your BingeBoard app
3. Go to "Facebook Login" > "Settings"
4. Add Valid OAuth Redirect URIs:
   - `https://bingeboard-73c5f.firebaseapp.com/__/auth/handler`
5. Click "Save Changes"

## Step 3: Test Authentication

After enabling both providers:
1. Refresh your BingeBoard app
2. Try clicking "Google" or "Facebook" login buttons
3. You should see the provider's login popup/redirect

## Troubleshooting

### If Google login fails:
- Check that Google provider is enabled in Firebase Console
- Verify redirect URIs are added in Google Cloud Console
- Ensure the OAuth client is active

### If Facebook login fails:
- Check that Facebook provider is enabled in Firebase Console
- Verify redirect URIs are added in Facebook Developer Console
- Ensure your Facebook app is not in development mode restrictions

## Current Configuration
- **Firebase Project**: bingeboard-73c5f
- **Auth Domain**: bingeboard-73c5f.firebaseapp.com
- **Callback URL**: `https://bingeboard-73c5f.firebaseapp.com/__/auth/handler`

## Security Notes
- Never share your Firebase private key
- Keep OAuth client secrets secure
- Regularly review authorized domains
- Monitor authentication logs for suspicious activity