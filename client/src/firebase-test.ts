// Test Firebase environment variables
console.log('🔍 Firebase Environment Variables Test:');
console.log('VITE_FIREBASE_API_KEY:', import.meta.env.VITE_FIREBASE_API_KEY);
console.log('VITE_FIREBASE_PROJECT_ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log('VITE_FIREBASE_AUTH_DOMAIN:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);

// Check if API key looks valid
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
if (!apiKey) {
  console.error('❌ Firebase API key is missing!');
} else if (apiKey.startsWith('AIza')) {
  console.log('✅ Firebase API key format looks correct');
} else {
  console.error('❌ Firebase API key format looks wrong');
}

/* ignore-unused-export */
export default null;
