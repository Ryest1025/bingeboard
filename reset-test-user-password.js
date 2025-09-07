import pkg from 'better-sqlite3';
const Database = pkg;
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resetTestUserPassword() {
  try {
    const dbPath = path.join(__dirname, 'dev.db');
    const db = new Database(dbPath);
    
    console.log('🔄 Resetting test user password...');
    
    const email = 'rachel.gubin@gmail.com';
    const newPassword = 'newpassword123';
    
    // Check if user exists
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      console.log('❌ User not found, creating new user...');
      
      // Create user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const userId = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      
      db.prepare(`
        INSERT INTO users (id, email, first_name, last_name, username, auth_provider, password_hash, created_at, updated_at, onboarding_completed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        email,
        'Rachel',
        'Gubin',
        'rachel',
        'manual',
        hashedPassword,
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000),
        1
      );
      
      console.log('✅ Test user created successfully');
    } else {
      console.log('👤 User found, updating password...');
      
      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      db.prepare('UPDATE users SET password_hash = ?, auth_provider = ?, updated_at = ? WHERE email = ?')
        .run(hashedPassword, 'manual', Math.floor(Date.now() / 1000), email);
      
      console.log('✅ Password updated successfully');
    }
    
    // Verify the update
    const updatedUser = db.prepare('SELECT id, email, first_name, last_name, auth_provider FROM users WHERE email = ?').get(email);
    console.log('👤 Updated user:', updatedUser);
    
    db.close();
    
    console.log('🎉 Test user ready! You can now login with:');
    console.log('   Email: rachel.gubin@gmail.com');
    console.log('   Password: newpassword123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

resetTestUserPassword();
