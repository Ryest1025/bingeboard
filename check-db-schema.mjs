import pkg from 'better-sqlite3';
const Database = pkg;
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

console.log('📋 Database schema:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables);

console.log('\n👤 Users table structure:');
const userColumns = db.prepare('PRAGMA table_info(users)').all();
console.log('Columns:', userColumns);

console.log('\n🔍 Sample users:');
const users = db.prepare('SELECT * FROM users LIMIT 2').all();
console.log('Users:', users);

db.close();
