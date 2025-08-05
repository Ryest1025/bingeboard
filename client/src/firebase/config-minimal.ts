// Firebase configuration - SIMPLE WORKING VERSION
import { initializeApp, getApps } from 'firebase/app';

/**
 * 🔒 FIREBASE CONFIG - SIMPLE APPROACH
 * 
 * ✅ Minimal configuration to avoid timing issues
 * ✅ Firebase app only - auth imported separately when needed
 * 
 * Created: August 5, 2025
 * Status: ✅ TESTING
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

// Initialize Firebase app only
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
console.log('✅ Firebase app initialized successfully');

// Export just the app - auth will be initialized later when needed
export default app;

// Simple auth getter that initializes on first call
let authCache: any = null;

export const getAuthInstance = async () => {
  if (authCache) return authCache;
  
  try {
    const { getAuth } = await import('firebase/auth');
    authCache = getAuth(app);
    console.log('✅ Firebase Auth initialized on demand');
    return authCache;
  } catch (error) {
    console.error('❌ Firebase Auth initialization failed:', error);
    throw error;
  }
};

// Simple provider getters
export const getGoogleProvider = async () => {
  const { GoogleAuthProvider } = await import('firebase/auth');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
};

export const getFacebookProvider = async () => {
  const { FacebookAuthProvider } = await import('firebase/auth');
  const provider = new FacebookAuthProvider();
  provider.setCustomParameters({ display: 'popup' });
  return provider;
};

// Legacy exports for compatibility
export { getAuthInstance as auth };
