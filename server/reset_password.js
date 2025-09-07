import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

async function resetPassword() {
  try {
    const db = new Database('./dev.db');
    
    // Check if user exists
    const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get('rachel.gubin@gmail.com');
    
    if (!user) {
      console.log('❌ User rachel.gubin@gmail.com not found');
      db.close();
      return;
    }
    
    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);
    
    // Hash the new password
    const newPassword = 'newpassword123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the password
    const updateStmt = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    const result = updateStmt.run(hashedPassword, user.id);
    
    if (result.changes > 0) {
      console.log(`✅ Password updated successfully for ${user.email}`);
      console.log(`🔑 New password: ${newPassword}`);
    } else {
      console.log('❌ Failed to update password');
    }
    
    db.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

resetPassword();
