// Firebase configuration for BingeBoard
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB45zr8b2HjIx1fzXOuQsHxeQK9wl_wC88",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "bingeboard-73c5f"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bingeboard-73c5f",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "bingeboard-73c5f"}.firebasestorage.app`,
  messagingSenderId: "145846820194",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:145846820194:web:047efd7a8e59b36944a03b",
  measurementId: "G-TB1ZXQ79LB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Configure scopes
googleProvider.addScope('profile');
googleProvider.addScope('email');
facebookProvider.addScope('email');

export { app, auth, googleProvider, facebookProvider };
export default app;