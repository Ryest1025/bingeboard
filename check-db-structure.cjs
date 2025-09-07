const Database = require('better-sqlite3');
const db = new Database('./dev.db');

console.log('📋 Current database tables:');
const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).all();
tables.forEach(table => {
  console.log(`  - ${table.name}`);
});

console.log('\n📋 Current user_preferences columns:');
const columns = db.prepare(`PRAGMA table_info(user_preferences)`).all();
columns.forEach(col => {
  console.log(`  - ${col.name} (${col.type})`);
});

db.close();
