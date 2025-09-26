// Create a fresh test user with new credentials
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

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

async function createFreshTestUser() {
  // Use a unique email to avoid conflicts
  const testEmail = 'testuser' + Date.now() + '@example.com';
  const testPassword = 'testpass123';
  
  try {
    console.log('🔥 Creating fresh test user:', testEmail);
    
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ Fresh test user created successfully!');
    console.log('📧 Email:', userCredential.user.email);
    console.log('🆔 UID:', userCredential.user.uid);
    console.log('');
    console.log('🎉 SUCCESS! Use these credentials in your browser:');
    console.log('   Email:', testEmail);
    console.log('   Password:', testPassword);
    console.log('');
    console.log('📝 Copy these credentials and try logging in at http://localhost:5000');
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    console.error('Error code:', error.code);
  }
}

createFreshTestUser();