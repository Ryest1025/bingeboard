# Google OAuth Redirect URL Configuration

## Complete URL for Google Cloud Console

Add this exact URL to your Google Cloud Console OAuth configuration:

```
https://bingeboard-73c5f.firebaseapp.com/__/auth/handler
```

## Where to Add This URL

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to: **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID
5. Click **Edit** (pencil icon)
6. In the **Authorized redirect URIs** section, add:
   ```
   https://bingeboard-73c5f.firebaseapp.com/__/auth/handler
   ```
7. Click **Save**

## Additional URLs to Add (Optional)

For development and testing, you may also want to add:
```
https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/__/auth/handler
```

## Firebase Console Setup

Also ensure in Firebase Console → Authentication → Settings → Authorized domains:
- `bingeboard-73c5f.firebaseapp.com`
- `80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev`

## Current Firebase Configuration
- Project ID: `bingeboard-73c5f`
- Auth Domain: `bingeboard-73c5f.firebaseapp.com`
- API Key: `AIzaSyB45zr8b2HjIx1fzXOuQsHxeQK9wl_wC88`

This should resolve the mobile authentication "domain not authorized" error.