import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

async function setupDatabase() {
  try {
    const db = new Database('./dev.db');
    
    // Create users table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        firstName TEXT,
        lastName TEXT,
        profileImageUrl TEXT,
        authProvider TEXT DEFAULT 'email',
        googleId TEXT,
        facebookId TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Users table created');
    
    // Check if rachel.gubin@gmail.com exists
    const existingUser = db.prepare('SELECT id, email FROM users WHERE email = ?').get('rachel.gubin@gmail.com');
    
    if (existingUser) {
      console.log('✅ User already exists:', existingUser);
      
      // Update password
      const newPassword = 'newpassword123';
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const updateStmt = db.prepare('UPDATE users SET password_hash = ? WHERE email = ?');
      updateStmt.run(hashedPassword, 'rachel.gubin@gmail.com');
      
      console.log('✅ Password updated successfully');
    } else {
      // Create user
      const newPassword = 'newpassword123';
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const userId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const insertStmt = db.prepare(`
        INSERT INTO users (id, email, password_hash, firstName, lastName, authProvider)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      insertStmt.run(userId, 'rachel.gubin@gmail.com', hashedPassword, 'Rachel', 'Gubin', 'email');
      
      console.log('✅ User created successfully');
    }
    
    // List all users
    const allUsers = db.prepare('SELECT id, email, authProvider FROM users').all();
    console.log('📋 All users:', allUsers);
    
    db.close();
    console.log('✅ Database setup complete');
    
  } catch (error) {
    console.error('❌ Database setup error:', error);
  }
}

setupDatabase();
