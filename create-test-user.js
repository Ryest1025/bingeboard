import { auth } from './client/src/firebase/config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

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
  }
}

createAndTestUser();