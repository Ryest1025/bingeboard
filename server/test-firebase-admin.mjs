// test-firebase-admin.js - Simple test for Firebase Admin SDK initialization

// Import the firebaseAdmin module
import { adminAuth } from './firebaseAdmin.js';

console.log('🔍 Testing Firebase Admin SDK initialization...');

try {
  console.log('✅ Firebase Admin Auth module:', adminAuth ? 'Initialized' : 'Not initialized');
  
  // Try to get app from auth
  const app = adminAuth.app;
  console.log('✅ Firebase Admin App:', app ? 'Initialized' : 'Not initialized');
  console.log('✅ Firebase App Name:', app ? app.name : 'N/A');
  console.log('✅ Firebase Project ID:', app ? app.options.projectId : 'N/A');
  
  console.log('✅ Firebase Admin SDK is working correctly!');
} catch (error) {
  console.error('❌ Firebase Admin SDK test failed:', error);
}
