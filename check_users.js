const Database = require('better-sqlite3');

try {
  const db = new Database('./server/database.sqlite');
  
  // Check if users table exists
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables in database:', tables.map(t => t.name));
  
  if (tables.some(t => t.name === 'users')) {
    // Get all users
    const users = db.prepare('SELECT email, id FROM users').all();
    console.log('\nRegistered users:');
    users.forEach(user => console.log(`- ${user.email} (ID: ${user.id})`));
  } else {
    console.log('\nUsers table does not exist yet');
  }
  
  db.close();
} catch (error) {
  console.error('Error:', error.message);
}
