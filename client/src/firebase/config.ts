// Firebase configuration using v9 modular syntax
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getMessaging, isSupported } from 'firebase/messaging';

/**
 * 🔒 FIREBASE CONFIG - PRODUCTION LOCKED
 * 
 * ⚠️  CRITICAL: This configuration is LOCKED and working perfectly
 * 🚨 DO NOT MODIFY provider settings, imports, or initialization
 * 
 * Lock Date: July 12, 2025
 * Status: ✅ WORKING PERFECTLY
 * 
 * LOCKED CONFIGURATION:
 * - ✅ signInWithPopup implementation (cross-platform compatible)
 * - ✅ Google OAuth provider with prompt: 'select_account'
 * - ✅ Facebook OAuth provider with display: 'popup'
 * - ✅ Firebase v9 modular syntax
 * 
 * CRITICAL: This file is imported as '@/firebase/config' throughout the app
 * DO NOT change the import path or exports
 * 
 * Last Verified Working: July 12, 2025
 */

// Firebase configuration with environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-TB1ZXQ79LB"
};

// Initialize Firebase app only if it doesn't exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth and export it
export const auth = getAuth(app);

// Configure providers following the final pattern
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Configure provider settings for cross-platform compatibility
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

facebookProvider.setCustomParameters({
  display: 'popup'
});

// Initialize Firebase Messaging conditionally with proper error handling
let messaging: ReturnType<typeof getMessaging> | null = null;

// Check if messaging is supported before initializing
const initMessaging = async () => {
  try {
    const messagingSupported = await isSupported();
    if (messagingSupported && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      messaging = getMessaging(app);
      console.log('✅ Firebase Messaging initialized successfully');
    } else {
      console.log('ℹ️ Firebase Messaging not supported in this environment');
    }
  } catch (error) {
    console.log('ℹ️ Firebase Messaging initialization skipped:', error);
  }
};

// Initialize messaging asynchronously
initMessaging();

export { messaging };

// Add debug logging
console.log('Firebase initialized:', {
  apiKey: firebaseConfig.apiKey ? 'Set' : 'Missing',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId ? 'Set' : 'Missing',
  currentDomain: typeof window !== 'undefined' ? window.location.hostname : 'server-side',
  env: import.meta.env.MODE
});

export default app;