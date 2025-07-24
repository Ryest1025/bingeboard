// Temporary Firebase config test with hardcoded values
import { initializeApp, getApps, getApp } from 'firebase/app';

const testFirebaseConfig = {
  apiKey: "AIzaSyB45zr8b2HjIx1fzXOuQsHxeQK9wl_wC88",
  authDomain: "bingeboard-73c5f.firebaseapp.com",
  projectId: "bingeboard-73c5f",
  storageBucket: "bingeboard-73c5f.firebasestorage.app",
  messagingSenderId: "145846820194",
  appId: "1:145846820194:web:047efd7a8e59b36944a03b",
  measurementId: "G-TB1ZXQ79LB"
};

console.log('🧪 Testing Firebase config:', testFirebaseConfig);

try {
  const app = getApps().length === 0 ? initializeApp(testFirebaseConfig) : getApp();
  console.log('✅ Firebase app initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}

export { testFirebaseConfig };
