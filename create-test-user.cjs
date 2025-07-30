// Load environment variables first
const dotenv = require('dotenv');
dotenv.config();

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

// Set DATABASE_URL environment variable if not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'sqlite:dev.db';
}

async function createTestUser() {
  try {
    const isLocalSQLite = process.env.DATABASE_URL.startsWith('sqlite:');
    const dbPath = isLocalSQLite ? process.env.DATABASE_URL.replace('sqlite:', '') : 'dev.db';
    
    console.log(`Opening database at: ${dbPath}`);
    const db = new Database(dbPath, { verbose: console.log });
    
    // Check if the test user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get('testuser@example.com');
    
    if (existingUser) {
      console.log('Test user already exists:', existingUser.id);
      return;
    }
    
    // Create a new user with a password hash
    const userId = uuidv4();
    const passwordHash = await bcrypt.hash('testpassword', 10);
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Insert the new user
    const stmt = db.prepare(
      'INSERT INTO users (id, email, username, password_hash, auth_provider, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    
    stmt.run(userId, 'testuser@example.com', 'testuser', passwordHash, 'email', timestamp, timestamp);
    
    console.log('Test user created with ID:', userId);
    console.log('Email: testuser@example.com');
    console.log('Password: testpassword');
    
    // List all users
    const users = db.prepare('SELECT id, email, username, auth_provider, password_hash FROM users').all();
    
    console.log('\nUsers in database:');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Username: ${user.username}, Auth Provider: ${user.auth_provider}, Has Password: ${!!user.password_hash}`);
    });
    
    db.close();
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser().catch(console.error);
