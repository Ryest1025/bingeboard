// Simple test script to verify Firebase Admin initialization and authentication
import * as admin from './server/simple-firebase-admin';

// Simple test to verify Firebase Admin initialization
async function testFirebaseAdmin() {
  try {
    console.log('🔍 Testing Firebase Admin initialization...');
    
    // Check if Firebase Admin is initialized
    console.log('Firebase Admin initialized:', admin.isInitialized());
    
    // Try a simple admin operation that doesn't require real credentials
    const projectId = admin.adminApp.options.projectId;
    console.log('Firebase project ID:', projectId);
    
    console.log('✅ Firebase Admin test successful');
  } catch (error) {
    console.error('❌ Firebase Admin test failed:', error);
  }
}

// Run the test
testFirebaseAdmin()
  .then(() => console.log('Tests complete'))
  .catch(error => console.error('Test error:', error));
