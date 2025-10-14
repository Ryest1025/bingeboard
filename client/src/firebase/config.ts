// Firebase configuration - Single authoritative source (lazy + defensive init)
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB45zr8b2HjIx1fzXOuQsHxeQK9wl_wC88",
  authDomain: "bingeboard-73c5f.firebaseapp.com",
  projectId: "bingeboard-73c5f",
  storageBucket: "bingeboard-73c5f.firebasestorage.app",
  messagingSenderId: "145846820194",
  appId: "1:145846820194:web:047efd7a8e59b36944a03b",
  measurementId: "G-TB1ZXQ79LB",
};

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let initAttempted = false;

function initFirebase(): { app: FirebaseApp; auth: Auth } {
  if (!appInstance) {
    appInstance = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  }
  if (!authInstance) {
    authInstance = getAuth(appInstance);
  }
  return { app: appInstance, auth: authInstance };
}

// ESM side-effect guard: ensure initializeAuth only once
export const getFirebase = () => {
  if (!initAttempted) {
    initAttempted = true;
    try {
      const { app, auth } = initFirebase();
      if (process.env.NODE_ENV !== 'production') {
        // Lightweight fingerprint to detect multiple bundles
        (window as any).__FIREBASE_INIT_DEBUG__ = ((window as any).__FIREBASE_INIT_DEBUG__ || 0) + 1;
        console.log(`🔥 Firebase initialized (count=${(window as any).__FIREBASE_INIT_DEBUG__})`, {
          hasApp: !!app, hasAuth: !!auth
        });
      }
    } catch (e) {
      console.error('❌ Firebase initialization failed:', e);
    }
  }
  return { app: appInstance!, auth: authInstance! };
};

// Export direct conveniences (will trigger lazy init on first access)
export const app: FirebaseApp = getFirebase().app;
export const auth: Auth = getFirebase().auth;

// Providers (instantiate after auth to avoid race issues)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
googleProvider.addScope('email');
googleProvider.addScope('profile');

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({ display: 'popup' });
facebookProvider.addScope('email');

export default app;
