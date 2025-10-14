const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(process.cwd(), 'dev.db'));

// Create user_collections table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS user_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
);
`;

try {
  db.exec(createTableSQL);
  console.log('✅ user_collections table created successfully');
  
  // Check if table exists and show structure
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user_collections';").all();
  console.log('📋 Table exists:', tables.length > 0);
  
  if (tables.length > 0) {
    const tableInfo = db.prepare("PRAGMA table_info(user_collections);").all();
    console.log('📊 Table structure:');
    tableInfo.forEach(col => {
      console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
    });
  }
} catch (error) {
  console.error('❌ Error creating table:', error);
} finally {
  db.close();
}
