// Quick Firebase Admin test script (ESM)
import admin from 'firebase-admin';

// Set environment variables
process.env.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'bingeboard-73c5f';

console.log('🔥 Testing Firebase Admin initialization');
console.log('Environment variables:');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);

try {
  // Initialize Firebase Admin if not already initialized
  if (!admin.apps.length) {
    console.log('Initializing Firebase Admin...');
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    console.log('Firebase Admin initialized successfully');
  } else {
    console.log('Firebase Admin already initialized');
  }
  
  // Get auth service
  const auth = admin.auth();
  console.log('Auth service initialized:', !!auth);
  
  // Test creating a session cookie
  auth.createCustomToken('test-user-id')
    .then((customToken) => {
      console.log('Created custom token successfully');
      console.log('Firebase Admin working correctly!');
    })
    .catch((error) => {
      console.error('Error creating custom token:', error);
    });
} catch (error) {
  console.error('Firebase Admin initialization failed:', error);
}
