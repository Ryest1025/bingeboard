// Firebase configuration using v9 modular syntax
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getMessaging, isSupported } from 'firebase/messaging';

/**
 * 🔒 FIREBASE CONFIG - FIXED AUTH REGISTRATION
 * 
 * ✅ Fixed "Component auth has not been registered yet" error
 * ✅ Proper async initialization
 * ✅ Clean initialization flow
 * 
 * Created: August 5, 2025
 * Status: ✅ WORKING
 */

// Firebase configuration
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

// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
console.log('✅ Firebase app initialized successfully');

// Initialize auth with proper async handling
let authInstance: ReturnType<typeof getAuth> | null = null;
let authInitPromise: Promise<ReturnType<typeof getAuth>> | null = null;

// Function to initialize auth safely
const initializeAuthSafely = async (): Promise<ReturnType<typeof getAuth>> => {
  if (authInstance) return authInstance;
  
  if (authInitPromise) return authInitPromise;
  
  authInitPromise = new Promise((resolve, reject) => {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      try {
        authInstance = getAuth(app);
        console.log('✅ Firebase Auth initialized successfully');
        
        // Set persistence
        setPersistence(authInstance, browserLocalPersistence)
          .then(() => {
            console.log('✅ Firebase persistence set to browserLocalPersistence');
          })
          .catch((error) => {
            console.warn('⚠️ Failed to set Firebase persistence:', error);
          });
        
        resolve(authInstance);
      } catch (error) {
        console.error('❌ Firebase Auth initialization failed:', error);
        reject(error);
      }
    });
  });
  
  return authInitPromise;
};

// Initialize auth immediately
initializeAuthSafely();

// Create a proxy object for auth that will work with existing code
const auth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(target, prop) {
    if (authInstance) {
      return authInstance[prop as keyof ReturnType<typeof getAuth>];
    }
    
    // For methods that might be called before auth is ready, return async versions
    if (typeof prop === 'string' && ['signInWithPopup', 'signOut', 'onAuthStateChanged'].includes(prop)) {
      return async (...args: any[]) => {
        const authObj = await initializeAuthSafely();
        return (authObj as any)[prop](...args);
      };
    }
    
    return undefined;
  }
});

// Configure providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Configure provider settings for cross-platform compatibility
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

facebookProvider.setCustomParameters({
  display: 'popup'
});

// Initialize Firebase Messaging conditionally
let messaging: ReturnType<typeof getMessaging> | null = null;

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

// Exports
export { auth, googleProvider, facebookProvider, messaging, initializeAuthSafely };
export default app;

// Debug logging
console.log('🔥 Firebase configuration loaded:', {
  apiKey: firebaseConfig.apiKey ? 'Set' : 'Missing',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId ? 'Set' : 'Missing',
  currentDomain: typeof window !== 'undefined' ? window.location.hostname : 'server-side',
  env: import.meta.env.MODE
});
