// Firebase configuration using v9 modular syntax
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase configuration with hardcoded values for testing
const firebaseConfig = {
  apiKey: "AIzaSyB45zr8b2HjIx1fzXOuQsHxeQK9wl_wC88",
  authDomain: "bingeboard-73c5f.firebaseapp.com",
  projectId: "bingeboard-73c5f",
  storageBucket: "bingeboard-73c5f.firebasestorage.app",
  messagingSenderId: "145846820194",
  appId: "1:145846820194:web:047efd7a8e59b36944a03b",
  measurementId: "G-TB1ZXQ79LB"
};

console.log('🔍 Firebase Config Values:', {
  apiKey: firebaseConfig.apiKey ? '✅ Present' : '❌ Missing',
  authDomain: firebaseConfig.authDomain ? '✅ Present' : '❌ Missing',
  projectId: firebaseConfig.projectId ? '✅ Present' : '❌ Missing',
});

// Initialize Firebase app only if it doesn't exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with a delay to ensure proper registration
const initializeAuth = () => {
  try {
    const auth = getAuth(app);
    console.log('✅ Firebase Auth initialized successfully');
    return auth;
  } catch (error) {
    console.error('❌ Firebase Auth initialization failed:', error);
    // Wait a bit and retry
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const auth = getAuth(app);
          console.log('✅ Firebase Auth initialized successfully on retry');
          resolve(auth);
        } catch (retryError) {
          console.error('❌ Firebase Auth retry failed:', retryError);
          reject(retryError);
        }
      }, 100);
    });
  }
};

// Export auth instance
export const auth = getAuth(app);

// Configure Firebase persistence to remember users between refreshes
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✅ Firebase persistence set to browserLocalPersistence');
  })
  .catch((error) => {
    console.warn('⚠️ Failed to set Firebase persistence:', error);
  });

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
