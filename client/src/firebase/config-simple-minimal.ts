// Firebase config-simple - MINIMAL VERSION
import app, { getAuthInstance, getGoogleProvider, getFacebookProvider } from './config';

/**
 * Simple config that reuses the main Firebase app
 * No direct auth initialization - uses lazy loading
 */

console.log('Firebase config-simple: Using main Firebase app');

// Export functions that return promises
export const auth = getAuthInstance;
export const googleProvider = getGoogleProvider;
export const facebookProvider = getFacebookProvider;

export default app;
