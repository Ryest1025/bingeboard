// Create test user in Firebase - Node.js compatible
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase config (same as client)
const firebaseConfig = {
  apiKey: "AIzaSyB45zr8b2HjIx1fzXOuQsHxeQK9wl_wC88",
  authDomain: "bingeboard-73c5f.firebaseapp.com",
  projectId: "bingeboard-73c5f",
  storageBucket: "bingeboard-73c5f.firebasestorage.app",
  messagingSenderId: "145846820194",
  appId: "1:145846820194:web:047efd7a8e59b36944a03b",
  measurementId: "G-TB1ZXQ79LB",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function createAndTestUser() {
  const testEmail = 'test@example.com';
  const testPassword = 'password123';
  
  try {
    console.log('🔥 Creating test user:', testEmail);
    
    // Try to create user
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('✅ Test user created successfully!');
      console.log('📧 Email:', userCredential.user.email);
      console.log('🆔 UID:', userCredential.user.uid);
    } catch (createError) {
      if (createError.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Test user already exists, trying to sign in...');
      } else {
        throw createError;
      }
    }
    
    // Now try to sign in
    console.log('🔐 Testing login with test credentials...');
    const loginResult = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ Login successful!');
    console.log('📧 Logged in as:', loginResult.user.email);
    console.log('');
    console.log('🎉 SUCCESS! You can now use these credentials in the browser:');
    console.log('   Email:', testEmail);
    console.log('   Password:', testPassword);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'auth/invalid-credential') {
      console.log('');
      console.log('🔍 This suggests:');
      console.log('1. Email/password authentication might be disabled in Firebase Console');
      console.log('2. The Firebase project configuration might be incorrect');
      console.log('3. Network connectivity issues');
    }
  }
}

createAndTestUser();