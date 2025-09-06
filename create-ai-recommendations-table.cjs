const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

try {
  const exists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='ai_recommendations'").get();
  if (exists) {
    console.log('ℹ️ ai_recommendations table already exists');
  } else {
    console.log('🛠️ Creating ai_recommendations table...');
    db.exec(`
      CREATE TABLE ai_recommendations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        show_id INTEGER NOT NULL,
        score REAL NOT NULL,
        reason TEXT NOT NULL,
        recommendation_type TEXT NOT NULL,
        metadata TEXT,
        is_viewed INTEGER DEFAULT 0,
        is_interacted INTEGER DEFAULT 0,
        feedback TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Helpful indexes
    db.exec(`CREATE INDEX idx_ai_recs_user ON ai_recommendations(user_id);`);
    db.exec(`CREATE UNIQUE INDEX idx_ai_recs_user_show ON ai_recommendations(user_id, show_id);`);
    console.log('✅ ai_recommendations table created');
  }

  // Show schema for verification
  const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='ai_recommendations'").get();
  if (schema?.sql) console.log('📐 Schema:', schema.sql);
} catch (err) {
  console.error('❌ Failed to create ai_recommendations table:', err);
  process.exitCode = 1;
} finally {
  db.close();
}
