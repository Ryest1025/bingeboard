# Firebase Configuration Guide

## How to Find Your Firebase Configuration Values

### Step 1: Access Firebase Console
1. Go to https://console.firebase.google.com/
2. Sign in with your Google account
3. Select your project "bingeboard-73c5f" (or create one if it doesn't exist)

### Step 2: Navigate to Project Settings
1. Click the gear icon (⚙️) in the left sidebar
2. Select "Project settings"

### Step 3: Find Your Web App Configuration
1. Scroll down to the "Your apps" section
2. Look for the web app icon (</>) 
3. If you don't see a web app, click "Add app" and select "Web"
4. Click on your web app to expand it

### Step 4: Copy Configuration Values
You'll see a code snippet that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB45zr8b2HjIx1fzXOuQsHxeQK9wl_wC88",
  authDomain: "bingeboard-73c5f.firebaseapp.com",
  projectId: "bingeboard-73c5f",
  storageBucket: "bingeboard-73c5f.firebasestorage.app",
  messagingSenderId: "145846820194",
  appId: "1:145846820194:web:047efd7a8e59b36944a03b",
  measurementId: "G-TB1ZXQ79LB"
};
```

### Step 5: Add Values to Replit Secrets
Copy these three values and add them to your Replit secrets:

1. **VITE_FIREBASE_API_KEY** = `apiKey` value
2. **VITE_FIREBASE_PROJECT_ID** = `projectId` value  
3. **VITE_FIREBASE_APP_ID** = `appId` value

### Current Values I Can See:
Based on your existing configuration, these should be:
- **VITE_FIREBASE_API_KEY**: `AIzaSyB45zr8b2HjIx1fzXOuQsHxeQK9wl_wC88`
- **VITE_FIREBASE_PROJECT_ID**: `bingeboard-73c5f`
- **VITE_FIREBASE_APP_ID**: `1:145846820194:web:047efd7a8e59b36944a03b`

### Step 6: Add to Replit Secrets
1. In your Replit project, click on "Secrets" in the left sidebar (🔒)
2. Click "Add new secret"
3. Add each of the three values above

### Step 7: Authorize Mobile Domain
In Firebase Console:
1. Go to Authentication > Settings > Authorized domains
2. Add your current Replit domain: `80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev`

This will fix the mobile authentication issue!