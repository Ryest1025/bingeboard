// CommonJS Firebase Admin test script
const admin = require('firebase-admin');

// Set env vars if needed
process.env.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'bingeboard-73c5f';

console.log('🔥 Testing Firebase Admin initialization');
console.log('Environment variables:');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);

try {
  if (!admin.apps.length) {
    console.log('Initializing Firebase Admin...');
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    console.log('Firebase Admin initialized successfully');
  } else {
    console.log('Firebase Admin already initialized');
  }
  
  const auth = admin.auth();
  console.log('Auth service initialized:', !!auth);
  console.log('Firebase Admin working correctly!');
} catch (error) {
  console.error('Firebase Admin initialization failed:', error);
}
