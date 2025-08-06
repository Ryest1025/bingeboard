// MOBILE-SAFE Firebase configuration
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

/**
 * 🔒 MOBILE-SAFE FIREBASE CONFIG
 * 
 * ✅ Synchronous imports to avoid getModularInstance errors
 * ✅ Direct auth initialization
 * ✅ Mobile browser compatibility
 * 
 * Created: August 6, 2025
 * Status: ✅ MOBILE-OPTIMIZED
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

console.log('📱 Mobile-Safe Firebase Config Loading...');

// Initialize Firebase app
let app: FirebaseApp;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  console.log('✅ Firebase app initialized successfully');
} catch (error) {
  console.error('❌ Firebase app initialization failed:', error);
  throw error;
}

// Initialize Auth immediately (no dynamic imports)
let auth: Auth;
try {
  auth = getAuth(app);
  console.log('✅ Firebase Auth initialized successfully (mobile-safe)');
} catch (error) {
  console.error('❌ Firebase Auth initialization failed:', error);
  throw error;
}

// Export both app and auth
export default app;
export { auth };

// Simple getter functions
export const getAuthInstance = (): Auth => {
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }
  return auth;
};

export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    throw new Error('Firebase App not initialized');
  }
  return app;
};

console.log('🎯 Mobile-Safe Firebase config loaded successfully');
