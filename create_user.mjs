import { storage } from './server/storage.js';
import bcrypt from 'bcryptjs';

async function createUser() {
  try {
    console.log('🔧 Creating user account...');
    
    // Check if user exists
    const existingUser = await storage.getUserByEmail('rachel.gubin@gmail.com');
    
    if (existingUser) {
      console.log('✅ User already exists:', existingUser.email);
      
      // Update password
      const hashedPassword = await bcrypt.hash('newpassword123', 10);
      await storage.updateUser(existingUser.id, { passwordHash: hashedPassword });
      console.log('✅ Password updated successfully');
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash('newpassword123', 10);
      const userId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const user = await storage.upsertUser({
        id: userId,
        email: 'rachel.gubin@gmail.com',
        firstName: 'Rachel',
        lastName: 'Gubin',
        passwordHash: hashedPassword,
        authProvider: 'email'
      });
      
      console.log('✅ User created successfully:', user.email);
    }
    
    // List all users
    const allUsers = await storage.getAllUsers();
    console.log('📋 All users:', allUsers.map(u => ({ id: u.id, email: u.email })));
    
    console.log('✅ Setup complete! You can now log in with:');
    console.log('   Email: rachel.gubin@gmail.com');
    console.log('   Password: newpassword123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createUser();
