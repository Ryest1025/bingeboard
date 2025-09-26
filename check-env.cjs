// Check environment loading
require('dotenv').config();

console.log('Environment loaded. Checking Firebase Admin Key...');
console.log('FIREBASE_ADMIN_KEY exists:', !!process.env.FIREBASE_ADMIN_KEY);

if (process.env.FIREBASE_ADMIN_KEY) {
  const keyStart = process.env.FIREBASE_ADMIN_KEY.substring(0, 10);
  console.log('First 10 chars:', keyStart);
  
  try {
    const parsed = JSON.parse(process.env.FIREBASE_ADMIN_KEY);
    console.log('✅ Firebase Admin Key is valid JSON');
    console.log('Project ID:', parsed.project_id);
    console.log('Client email:', parsed.client_email);
  } catch (error) {
    console.log('❌ Firebase Admin Key is NOT valid JSON:', error.message);
  }
} else {
  console.log('❌ FIREBASE_ADMIN_KEY not found in environment');
}