import { auth } from './client/src/firebase/config.js';
import { createUserWithEmailAndPassword } from 'firebase/auth';

async function createTestUser() {
  try {
    console.log('🔥 Creating Firebase user: rachel.gubin@gmail.com');
    
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'rachel.gubin@gmail.com', 
      'testpassword123'  // You can change this password
    );
    
    console.log('✅ User created successfully!');
    console.log('📧 Email:', userCredential.user.email);
    console.log('🆔 UID:', userCredential.user.uid);
    console.log('');
    console.log('🔐 You can now log in with:');
    console.log('   Email: rachel.gubin@gmail.com');
    console.log('   Password: testpassword123');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('✅ User already exists in Firebase!');
      console.log('🔐 Try logging in with: rachel.gubin@gmail.com');
    } else {
      console.error('❌ Error creating user:', error.message);
    }
  }
}

createTestUser();