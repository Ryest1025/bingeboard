// Firebase config-simple - MINIMAL VERSION
import { app, auth, googleProvider, facebookProvider } from './config';

/**
 * Simple config that reuses the main Firebase app
 * Directly exports the auth instance and providers
 */

console.log('Firebase config-simple: Using main Firebase app');

// Export auth and provider objects directly
export { auth, googleProvider, facebookProvider };
export default app;
