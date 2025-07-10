// Test Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

console.log('Firebase imports working');

export const testFirebase = () => {
  console.log('Firebase test successful');
  return { initializeApp, getAuth, GoogleAuthProvider, FacebookAuthProvider };
};