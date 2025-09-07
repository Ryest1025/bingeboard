# Facebook OAuth Redirect URL Configuration

## Complete URL for Facebook Developer Console

Add this exact URL to your Facebook Developer Console OAuth configuration:

```
https://bingeboard-73c5f.firebaseapp.com/__/auth/handler
```

## Where to Add This URL

1. Go to [Facebook Developer Console](https://developers.facebook.com/)
2. Select your app
3. Navigate to: **Facebook Login** → **Settings**
4. In the **Valid OAuth Redirect URIs** field, add:
   ```
   https://bingeboard-73c5f.firebaseapp.com/__/auth/handler
   ```
5. Click **Save Changes**

## Additional URLs to Add (Optional)

For development and testing, you may also want to add:
```
https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/__/auth/handler
```

## App Domains Configuration

Also in Facebook Developer Console → **App Domains**, add:
- `bingeboard-73c5f.firebaseapp.com`
- `80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev`

## Firebase Console Setup

Ensure in Firebase Console → Authentication → Sign-in method → Facebook:
- App ID: Your Facebook App ID
- App Secret: Your Facebook App Secret
- Redirect URI should show: `https://bingeboard-73c5f.firebaseapp.com/__/auth/handler`

## Current Configuration
- Firebase Project: `bingeboard-73c5f`
- Auth Domain: `bingeboard-73c5f.firebaseapp.com`
- Facebook App ID: `1407155243762479` (from server logs)

This will enable Facebook authentication on both desktop and mobile devices.