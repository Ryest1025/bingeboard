// Firebase configuration using v9 modular syntax - Reuses existing Firebase instance
import { getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';

// Get the existing Firebase app or throw error
const getExistingApp = () => {
  if (getApps().length === 0) {
    console.error('Firebase app not initialized. Import from @/firebase/config instead');
    throw new Error('Firebase app not initialized. Import from @/firebase/config instead');
  }
  return getApp();
};

// Use existing Firebase app
const app = getExistingApp();

// Initialize Firebase Auth and export it
export const auth = getAuth(app);

// Set persistence to remember user between refreshes
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Failed to set Firebase persistence:', error);
});

// Add debug logging
console.log('Firebase config-simple: Using existing Firebase instance', {
  currentDomain: window.location.hostname,
  isCodespaces: window.location.hostname.includes('.app.github.dev'),
  fullOrigin: window.location.origin
});

// Configure providers with custom parameters for domain compatibility
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Configure scopes and custom parameters for localhost development
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account',
  hd: '', // Allow any hosted domain
  // Always use window.location.origin for correct redirect in all environments
  redirect_uri: window.location.origin
});

facebookProvider.addScope('email');
facebookProvider.setCustomParameters({
  display: 'popup', // Use popup instead of redirect for localhost
  // Always use window.location.origin for correct redirect in all environments
  redirect_uri: window.location.origin
});