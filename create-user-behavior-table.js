const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

try {
  // Check if table exists
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user_behavior'").get();

  if (!tableExists) {
    console.log('Creating user_behavior table...');

    // Create the user_behavior table in SQLite format
    const createTable = `
      CREATE TABLE user_behavior (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        action_type TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id INTEGER,
        metadata TEXT,
        session_id TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    db.exec(createTable);
    console.log('user_behavior table created successfully');

    // Create index for better performance
    db.exec('CREATE INDEX idx_user_behavior_user_id ON user_behavior(user_id)');
    db.exec('CREATE INDEX idx_user_behavior_timestamp ON user_behavior(timestamp)');
    console.log('Indexes created successfully');
  } else {
    console.log('user_behavior table already exists');
  }

  // Show table structure
  const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='user_behavior'").get();
  if (schema) {
    console.log('Table schema:', schema.sql);
  }

} catch (error) {
  console.error('Error creating user_behavior table:', error);
} finally {
  db.close();
}
