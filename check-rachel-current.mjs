import pkg from 'better-sqlite3';
const Database = pkg;
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

console.log('🔍 Current Rachel user data:');
const rachel = db.prepare('SELECT id, email, first_name, last_name, auth_provider, password_hash, created_at, updated_at FROM users WHERE email = ?').get('rachel.gubin@gmail.com');

if (rachel) {
  console.log('📋 User found:');
  console.log('  ID:', rachel.id);
  console.log('  Email:', rachel.email);  
  console.log('  Name:', rachel.first_name, rachel.last_name);
  console.log('  Auth Provider:', rachel.auth_provider);
  console.log('  Password Hash:', rachel.password_hash ? rachel.password_hash.substring(0, 20) + '...' : 'NULL');
  console.log('  Created:', new Date(rachel.created_at * 1000).toISOString());
  console.log('  Updated:', new Date(rachel.updated_at * 1000).toISOString());
} else {
  console.log('❌ No user found with email rachel.gubin@gmail.com');
}

db.close();
