// Simple test script to verify Firebase Admin initialization and authentication
require('dotenv').config(); // ✅ Load .env variables first
const admin = require('./server/simple-firebase-admin');

async function testFirebaseAdmin() {
  try {
    console.log('🔍 Testing Firebase Admin initialization...');

    if (admin.isInitialized) {
      console.log('✅ Firebase Admin initialized:', admin.isInitialized());
    } else {
      console.log('❌ Firebase Admin initialization status unknown');
    }

    if (admin.adminApp && admin.adminApp.options) {
      const projectId = admin.adminApp.options.projectId;
      console.log('📛 Firebase project ID:', projectId);
    } else {
      console.log('⚠️ Firebase Admin app not available');
    }

    console.log('✅ Firebase Admin test complete');
  } catch (error) {
    console.error('❌ Firebase Admin test failed:', error);
  }
}

testFirebaseAdmin()
  .then(() => console.log('🧪 Tests complete'))
  .catch((error) => console.error('Test error:', error));
