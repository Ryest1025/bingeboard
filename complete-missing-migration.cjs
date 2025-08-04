const Database = require('better-sqlite3');
const db = new Database('./dev.db');

console.log('🔄 Creating missing database tables and updating schema...\n');

try {
  // Begin transaction
  db.exec('BEGIN TRANSACTION');

  // Add missing columns to user_preferences if they don't exist
  console.log('📋 Updating user_preferences table...');
  
  const userPrefsColumns = db.prepare(`PRAGMA table_info(user_preferences)`).all();
  const existingColumns = userPrefsColumns.map(col => col.name);
  
  const newColumns = [
    { name: 'genres', type: 'TEXT', default: "'[]'" },
    { name: 'mood', type: 'TEXT', default: "'[]'" },
    { name: 'content_rating', type: 'TEXT', default: "'[]'" },
    { name: 'viewing_context', type: 'TEXT', default: "'[]'" },
    { name: 'accessibility_needs', type: 'TEXT', default: "'[]'" },
    { name: 'content_warnings', type: 'TEXT', default: "'[]'" },
    { name: 'deleted_at', type: 'TEXT' },
    { name: 'is_deleted', type: 'INTEGER', default: '0' }
  ];

  for (const column of newColumns) {
    if (!existingColumns.includes(column.name)) {
      const defaultClause = column.default ? `DEFAULT ${column.default}` : '';
      db.exec(`ALTER TABLE user_preferences ADD COLUMN ${column.name} ${column.type} ${defaultClause}`);
      console.log(`  ✅ Added column: ${column.name}`);
    } else {
      console.log(`  ⚠️  Column ${column.name} already exists`);
    }
  }

  // Create missing tables
  console.log('\n📋 Creating missing tables...');

  // 1. User Feedback Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      content_id TEXT NOT NULL,
      content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'show', 'episode')),
      rating REAL CHECK (rating >= 0 AND rating <= 10),
      feedback_text TEXT,
      helpful_votes INTEGER DEFAULT 0,
      is_verified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      deleted_at TEXT,
      is_deleted INTEGER DEFAULT 0,
      UNIQUE(user_id, content_id, content_type)
    )
  `);
  console.log('  ✅ Created user_feedback table');

  // 2. Content Translations Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS content_translations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id TEXT NOT NULL,
      content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'show')),
      language_code TEXT NOT NULL,
      title TEXT,
      overview TEXT,
      tagline TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(content_id, content_type, language_code)
    )
  `);
  console.log('  ✅ Created content_translations table');

  // 3. User Activity Log Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      action_type TEXT NOT NULL,
      content_id TEXT,
      content_type TEXT,
      metadata TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log('  ✅ Created user_activity_log table');

  // 4. Scheduled Jobs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS scheduled_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_type TEXT NOT NULL,
      job_data TEXT,
      scheduled_for TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
      attempts INTEGER DEFAULT 0,
      max_attempts INTEGER DEFAULT 3,
      error_message TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log('  ✅ Created scheduled_jobs table');

  // 5. Filter Presets Table (enhanced)
  db.exec(`
    CREATE TABLE IF NOT EXISTS filter_presets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      filters TEXT NOT NULL,
      is_public INTEGER DEFAULT 0,
      usage_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      deleted_at TEXT,
      is_deleted INTEGER DEFAULT 0
    )
  `);
  console.log('  ✅ Created filter_presets table');

  // 6. Recommendation Feedback Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS recommendation_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      recommendation_id TEXT NOT NULL,
      content_id TEXT NOT NULL,
      feedback_type TEXT NOT NULL CHECK (feedback_type IN ('like', 'dislike', 'not_interested', 'inappropriate')),
      reason TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, recommendation_id)
    )
  `);
  console.log('  ✅ Created recommendation_feedback table');

  // 7. Moods Reference Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS moods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      color_code TEXT,
      icon TEXT,
      sort_order INTEGER DEFAULT 0
    )
  `);
  console.log('  ✅ Created moods table');

  // 8. Streaming Services Reference Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS streaming_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER UNIQUE,
      name TEXT NOT NULL,
      logo_path TEXT,
      display_priority INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    )
  `);
  console.log('  ✅ Created streaming_services table');

  // Add missing columns to collections table
  console.log('\n📋 Updating collections table...');
  const collectionsColumns = db.prepare(`PRAGMA table_info(collections)`).all();
  const existingCollectionsColumns = collectionsColumns.map(col => col.name);
  
  if (!existingCollectionsColumns.includes('user_id')) {
    db.exec(`ALTER TABLE collections ADD COLUMN user_id TEXT`);
    console.log('  ✅ Added user_id column to collections');
  }
  if (!existingCollectionsColumns.includes('deleted_at')) {
    db.exec(`ALTER TABLE collections ADD COLUMN deleted_at TEXT`);
    console.log('  ✅ Added deleted_at column to collections');
  }
  if (!existingCollectionsColumns.includes('is_deleted')) {
    db.exec(`ALTER TABLE collections ADD COLUMN is_deleted INTEGER DEFAULT 0`);
    console.log('  ✅ Added is_deleted column to collections');
  }

  // Create indexes for performance
  console.log('\n📋 Creating indexes...');
  
  const indexes = [
    `CREATE INDEX IF NOT EXISTS idx_user_feedback_user ON user_feedback(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_user_feedback_content ON user_feedback(content_id, content_type)`,
    `CREATE INDEX IF NOT EXISTS idx_content_translations_content ON content_translations(content_id, content_type)`,
    `CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity_log(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_status ON scheduled_jobs(status, scheduled_for)`,
    `CREATE INDEX IF NOT EXISTS idx_filter_presets_user ON filter_presets(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_user ON recommendation_feedback(user_id)`
  ];

  indexes.forEach((indexSQL, i) => {
    db.exec(indexSQL);
    console.log(`  ✅ Created index ${i + 1}/${indexes.length}`);
  });

  // Create triggers for updated_at
  console.log('\n📋 Creating triggers...');
  
  const triggers = [
    {
      name: 'user_feedback_updated_at',
      sql: `
        CREATE TRIGGER IF NOT EXISTS user_feedback_updated_at 
        AFTER UPDATE ON user_feedback
        BEGIN
          UPDATE user_feedback SET updated_at = datetime('now') WHERE id = NEW.id;
        END
      `
    },
    {
      name: 'user_preferences_updated_at',
      sql: `
        CREATE TRIGGER IF NOT EXISTS user_preferences_updated_at 
        AFTER UPDATE ON user_preferences
        BEGIN
          UPDATE user_preferences SET updated_at = datetime('now') WHERE id = NEW.id;
        END
      `
    },
    {
      name: 'filter_presets_updated_at',
      sql: `
        CREATE TRIGGER IF NOT EXISTS filter_presets_updated_at 
        AFTER UPDATE ON filter_presets
        BEGIN
          UPDATE filter_presets SET updated_at = datetime('now') WHERE id = NEW.id;
        END
      `
    }
  ];

  triggers.forEach(trigger => {
    db.exec(trigger.sql);
    console.log(`  ✅ Created trigger: ${trigger.name}`);
  });

  // Insert sample data
  console.log('\n📋 Inserting sample data...');
  
  // Sample moods
  const moodData = [
    ['Relaxed', 'Perfect for unwinding after a long day', '#4CAF50', '😌', 1],
    ['Adventurous', 'Ready for excitement and thrills', '#FF5722', '🚀', 2],
    ['Romantic', 'In the mood for love stories', '#E91E63', '💕', 3],
    ['Thoughtful', 'Want something that makes you think', '#9C27B0', '🤔', 4],
    ['Funny', 'Need a good laugh', '#FFC107', '😂', 5],
    ['Intense', 'Ready for high-stakes drama', '#F44336', '🔥', 6],
    ['Nostalgic', 'Want to revisit the past', '#795548', '📼', 7],
    ['Social', 'Great for watching with friends', '#2196F3', '👥', 8]
  ];

  const insertMood = db.prepare(`INSERT OR IGNORE INTO moods (name, description, color_code, icon, sort_order) VALUES (?, ?, ?, ?, ?)`);
  moodData.forEach(mood => insertMood.run(...mood));
  console.log(`  ✅ Inserted ${moodData.length} mood entries`);

  // Sample streaming services
  const streamingData = [
    [8, 'Netflix', '/8Q99hDtnvdtpjasb1fy8LVU6h4Y.jpg', 1],
    [337, 'Disney Plus', '/7Fl8ylPDcMoAapdgQ57Y2wEhmV7.jpg', 2],
    [119, 'Amazon Prime Video', '/h5DcR0J2EESLitnhR8xLG1QymTE.jpg', 3],
    [384, 'HBO Max', '/3b6CtF0v6EK3VbFCQIVKnqCPGf0.jpg', 4],
    [15, 'Hulu', '/giwM8XX4V2AQb9vsoN7yti82tKK.jpg', 5],
    [350, 'Apple TV Plus', '/peURlLlr8jggOwK53fJ5wdQl05y.jpg', 6]
  ];

  const insertStreaming = db.prepare(`INSERT OR IGNORE INTO streaming_services (provider_id, name, logo_path, display_priority) VALUES (?, ?, ?, ?)`);
  streamingData.forEach(service => insertStreaming.run(...service));
  console.log(`  ✅ Inserted ${streamingData.length} streaming service entries`);

  // Update Rachel's preferences with new structure
  const updateRachel = db.prepare(`
    UPDATE user_preferences 
    SET 
      genres = ?,
      mood = ?,
      content_rating = ?,
      viewing_context = ?,
      updated_at = datetime('now')
    WHERE user_id = ?
  `);
  
  const rachelResult = updateRachel.run(
    JSON.stringify(['Drama', 'Comedy', 'Documentary']),
    JSON.stringify(['Relaxed', 'Thoughtful']),
    JSON.stringify(['PG-13', 'R']),
    JSON.stringify(['Evening', 'Weekend']),
    'rachel-test'
  );
  
  if (rachelResult.changes > 0) {
    console.log('  ✅ Updated Rachel\'s preferences with new structure');
  } else {
    console.log('  ⚠️  Rachel\'s preferences not found, creating new entry...');
    const insertRachel = db.prepare(`
      INSERT INTO user_preferences (
        user_id, genres, mood, content_rating, viewing_context, 
        preferred_genres, excluded_genres, adult_content
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertRachel.run(
      'rachel-test',
      JSON.stringify(['Drama', 'Comedy', 'Documentary']),
      JSON.stringify(['Relaxed', 'Thoughtful']),
      JSON.stringify(['PG-13', 'R']),
      JSON.stringify(['Evening', 'Weekend']),
      JSON.stringify(['Drama', 'Comedy']),
      JSON.stringify(['Horror']),
      0
    );
    console.log('  ✅ Created Rachel\'s preferences with new structure');
  }

  // Create sample filter preset
  const insertPreset = db.prepare(`
    INSERT OR IGNORE INTO filter_presets (user_id, name, description, filters, is_public) 
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const sampleFilter = JSON.stringify({
    genres: ['Drama', 'Comedy'],
    mood: ['Relaxed'],
    content_rating: ['PG-13'],
    runtime_min: 90,
    runtime_max: 180,
    release_year_min: 2020
  });
  
  insertPreset.run(
    'rachel-test',
    'Evening Relaxation',
    'Perfect for unwinding after work',
    sampleFilter,
    0
  );
  console.log('  ✅ Created sample filter preset');

  // Commit transaction
  db.exec('COMMIT');
  
  console.log('\n🎉 Database update completed successfully!');
  
  // Show summary
  const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).all();
  console.log(`\n📊 Database now contains ${tables.length} tables:`);
  tables.forEach(table => {
    console.log(`   - ${table.name}`);
  });

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  db.exec('ROLLBACK');
  throw error;
} finally {
  db.close();
}
