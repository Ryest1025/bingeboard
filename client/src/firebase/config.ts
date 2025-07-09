// Firebase configuration for BingeBoard
// Temporarily disabling Firebase imports to resolve dependency issues
// This will allow the app to start properly

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

// Mock Firebase objects for now to allow app to start
const app = { name: "bingeboard-app" };
const auth = { currentUser: null };

export { app, auth };
export default app;