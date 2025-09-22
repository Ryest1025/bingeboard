// Firebase configuration - SSR + Browser safe
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  FacebookAuthProvider,
  type Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB45zr8b2HjIx1fzXOuQsHxeQK9wl_wC88",
  authDomain: "bingeboard-73c5f.firebaseapp.com",
  projectId: "bingeboard-73c5f",
  storageBucket: "bingeboard-73c5f.firebasestorage.app",
  messagingSenderId: "145846820194",
  appId: "1:145846820194:web:047efd7a8e59b36944a03b",
  measurementId: "G-TB1ZXQ79LB",
};

// ✅ Reuse app if already initialized (HMR safe)
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Initialize Firebase Auth properly
let auth: Auth;

if (typeof window !== "undefined") {
  // ---- Browser ----
  try {
    // Always call initializeAuth ONCE for web
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch (error) {
    console.warn("initializeAuth failed, falling back to getAuth:", error);
    auth = getAuth(app); // fallback if already initialized
  }
} else {
  // ---- Server / Node ----
  auth = getAuth(app);
}

// ✅ Store globally to survive hot reload in dev
if (typeof window !== "undefined") {
  (window as any).__auth = auth;
}

// ---- Providers ----
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
googleProvider.addScope("email");
googleProvider.addScope("profile");

const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({ display: "popup" });
facebookProvider.addScope("email");

// ---- Exports ----
export { app, auth, googleProvider, facebookProvider };
export default app;
