# Firebase OAuth Configuration

## Current Firebase Setup
- **Project ID**: `bingeboard-73c5f`
- **Auth Domain**: `bingeboard-73c5f.firebaseapp.com`
- **Current Replit Domain**: `80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev`

## Required Firebase Console Updates

### 1. Firebase Console - Authorized Domains
**URL**: https://console.firebase.google.com/project/bingeboard-73c5f/authentication/settings

**Add to Authorized Domains:**
```
80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev
```

### 2. Enable Google Authentication
**In Firebase Console:**
1. Go to Authentication → Sign-in method
2. Enable Google provider
3. Use existing Google Cloud Console credentials

### 3. Enable Facebook Authentication  
**In Firebase Console:**
1. Go to Authentication → Sign-in method
2. Enable Facebook provider
3. Add Facebook App ID: `1407155243762479`
4. Add Facebook App Secret (from environment variables)

## OAuth Provider Console Setup

### Google Cloud Console
**URL**: https://console.cloud.google.com/apis/credentials
- OAuth callback URL: `https://bingeboard-73c5f.firebaseapp.com/__/auth/handler`

### Facebook Developer Console
**URL**: https://developers.facebook.com/apps/
- OAuth callback URL: `https://bingeboard-73c5f.firebaseapp.com/__/auth/handler`

## Current Configuration Status

### Firebase Config (client/src/firebase/config.ts)
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB45zr8b2HjIx1fzXOuQsHxeQK9wl_wC88",
  authDomain: "bingeboard-73c5f.firebaseapp.com",
  projectId: "bingeboard-73c5f",
  storageBucket: "bingeboard-73c5f.firebasestorage.app",
  messagingSenderId: "145846820194",
  appId: "1:145846820194:web:047efd7a8e59b36944a03b"
};
```

### Authentication Flow
1. User clicks Google/Facebook login button
2. Firebase redirects to provider authentication
3. Provider redirects back to Firebase callback URL
4. Firebase processes authentication and returns to app
5. App creates backend session and redirects to dashboard

## Key Points
- **Firebase handles OAuth flow**: No custom server-side OAuth needed
- **Callback URLs use Firebase domain**: `bingeboard-73c5f.firebaseapp.com`
- **Current domain authorization**: Must be added to Firebase console
- **Mobile compatible**: Firebase handles mobile/web differences automatically

## Next Steps
1. Add current Replit domain to Firebase authorized domains
2. Verify Google/Facebook OAuth providers are enabled in Firebase
3. Test authentication flow with current domain
4. Switch to custom domain later for permanent solution