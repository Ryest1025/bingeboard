// Firebase configuration - MOBILE-OPTIMIZED VERSION
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

/**
 * 🔒 FIREBASE CONFIG - MOBILE-STABLE APPROACH
 * 
 * ✅ Direct imports to avoid getModularInstance errors
 * ✅ Synchronous initialization for mobile compatibility
 * ✅ Proper error handling for mobile browsers
 * 
 * Created: August 6, 2025
 * Status: ✅ MOBILE-FIXED
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
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  console.log('✅ Firebase app initialized successfully');
} catch (error) {
  console.error('❌ Firebase app initialization failed:', error);
  throw error;
}

// Initialize auth directly (no dynamic imports)
let firebaseAuth: Auth;
try {
  firebaseAuth = getAuth(app);
  console.log('✅ Firebase Auth initialized directly');
} catch (error) {
  console.error('❌ Firebase Auth initialization failed:', error);
  throw error;
}

// Initialize providers directly
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
googleProvider.addScope('email');
googleProvider.addScope('profile');

const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({ display: 'popup' });
facebookProvider.addScope('email');

console.log('✅ Firebase providers initialized');

// Export everything
export default app;
export { firebaseAuth as auth };
export { googleProvider };
export { facebookProvider };

// Simple auth getter for compatibility
export const getAuthInstance = async (): Promise<Auth> => {
  return firebaseAuth;
};

// Provider getters for compatibility
export const getGoogleProvider = async () => {
  return googleProvider;
};

export const getFacebookProvider = async () => {
  return facebookProvider;
};
