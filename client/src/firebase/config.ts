// Firebase configuration for BingeBoard
// Currently using simplified authentication system
// Social auth will be added later when needed

// Firebase configuration (for future social auth)
const firebaseConfig = {
  apiKey: "AIzaSyB45zr8b2HjIx1fzXOuQsHxeQK9wl_wC88",
  authDomain: "bingeboard-73c5f.firebaseapp.com",
  projectId: "bingeboard-73c5f",
  storageBucket: "bingeboard-73c5f.firebasestorage.app",
  messagingSenderId: "145846820194",
  appId: "1:145846820194:web:047efd7a8e59b36944a03b",
  measurementId: "G-TB1ZXQ79LB"
};

// Simplified exports for current system
const app = { name: "bingeboard-app" };
const auth = { currentUser: null };

export { app, auth };
export default app;