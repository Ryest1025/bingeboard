// Firebase config-simple - MINIMAL VERSION
import app, { getAuthInstance, googleProvider as mainGoogleProvider, facebookProvider as mainFacebookProvider } from './config';

/**
 * Simple config that reuses the main Firebase app
 * No direct auth initialization - uses lazy loading
 */

console.log('Firebase config-simple: Using main Firebase app');

// Export auth function and provider objects directly
export const auth = getAuthInstance;
export const googleProvider = mainGoogleProvider;
export const facebookProvider = mainFacebookProvider;

export default app;
