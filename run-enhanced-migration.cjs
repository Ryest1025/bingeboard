#!/usr/bin/env node

// Enhanced Database Migration Script
// Run this to add all the new filtering tables to your database

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

console.log('🔄 Running enhanced database migration...');

try {
  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Add new columns to existing user_preferences table
  console.log('📋 Adding new columns to user_preferences...');
  
  const addColumns = [
    'ALTER TABLE user_preferences ADD COLUMN preferred_content_types TEXT',
    'ALTER TABLE user_preferences ADD COLUMN preferred_moods TEXT',
    'ALTER TABLE user_preferences ADD COLUMN preferred_networks TEXT',
    'ALTER TABLE user_preferences ADD COLUMN availability_preferences TEXT',
    'ALTER TABLE user_preferences ADD COLUMN release_year_range TEXT',
    'ALTER TABLE user_preferences ADD COLUMN runtime_preferences TEXT',
    'ALTER TABLE user_preferences ADD COLUMN language_preferences TEXT',
    'ALTER TABLE user_preferences ADD COLUMN social_preferences TEXT',
    'ALTER TABLE user_preferences ADD COLUMN ai_preferences TEXT'
  ];

  addColumns.forEach(sql => {
    try {
      db.exec(sql);
      console.log('✅ Added column successfully');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('⚠️  Column already exists, skipping');
      } else {
        console.error('❌ Error adding column:', error.message);
      }
    }
  });

  // Create new tables
  console.log('🆕 Creating new tables...');

  const createTables = [
    `CREATE TABLE IF NOT EXISTS content_moods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_type TEXT NOT NULL,
      content_id INTEGER NOT NULL,
      mood_tags TEXT NOT NULL,
      vibe_score REAL DEFAULT 0.0,
      ai_analyzed INTEGER DEFAULT 0,
      user_votes INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(content_type, content_id)
    )`,

    `CREATE TABLE IF NOT EXISTS streaming_availability (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_type TEXT NOT NULL,
      content_id INTEGER NOT NULL,
      platform_name TEXT NOT NULL,
      platform_id TEXT NOT NULL,
      availability_type TEXT NOT NULL,
      is_available INTEGER DEFAULT 1,
      available_from TEXT,
      expires_at TEXT,
      deep_link_url TEXT,
      price_usd REAL,
      quality_available TEXT,
      audio_languages TEXT,
      subtitle_languages TEXT,
      last_checked TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(content_type, content_id, platform_name)
    )`,

    `CREATE TABLE IF NOT EXISTS user_filter_presets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      preset_name TEXT NOT NULL,
      preset_description TEXT,
      filter_config TEXT NOT NULL,
      is_public INTEGER DEFAULT 0,
      usage_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS user_watch_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      content_type TEXT NOT NULL,
      content_id INTEGER NOT NULL,
      session_start TEXT NOT NULL,
      session_end TEXT,
      watch_percentage REAL DEFAULT 0.0,
      mood_at_start TEXT,
      mood_at_end TEXT,
      device_type TEXT,
      platform_used TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS content_ai_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_type TEXT NOT NULL,
      content_id INTEGER NOT NULL,
      emotional_tags TEXT,
      complexity_score REAL,
      intensity_score REAL,
      feel_good_score REAL,
      binge_worthiness REAL,
      similar_content_ids TEXT,
      analysis_version TEXT DEFAULT '1.0',
      analyzed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(content_type, content_id)
    )`,

    `CREATE TABLE IF NOT EXISTS user_watch_together (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL UNIQUE,
      host_user_id TEXT NOT NULL,
      content_type TEXT NOT NULL,
      content_id INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1,
      max_participants INTEGER DEFAULT 8,
      password_protected INTEGER DEFAULT 0,
      session_password TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (host_user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS watch_together_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
      current_position REAL DEFAULT 0.0,
      is_ready INTEGER DEFAULT 0,
      FOREIGN KEY (session_id) REFERENCES user_watch_together(session_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(session_id, user_id)
    )`,

    `CREATE TABLE IF NOT EXISTS content_metadata_enhanced (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_type TEXT NOT NULL,
      content_id INTEGER NOT NULL,
      comfort_watch_score REAL DEFAULT 0.0,
      date_night_score REAL DEFAULT 0.0,
      background_score REAL DEFAULT 0.0,
      group_watch_score REAL DEFAULT 0.0,
      critical_acclaim_score REAL DEFAULT 0.0,
      user_retention_rate REAL DEFAULT 0.0,
      rewatch_rate REAL DEFAULT 0.0,
      discussion_volume INTEGER DEFAULT 0,
      trending_score REAL DEFAULT 0.0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(content_type, content_id)
    )`
  ];

  createTables.forEach((sql, index) => {
    try {
      db.exec(sql);
      console.log(`✅ Created table ${index + 1}/${createTables.length}`);
    } catch (error) {
      console.error(`❌ Error creating table ${index + 1}:`, error.message);
    }
  });

  // Create indexes for performance
  console.log('📊 Creating indexes...');
  
  const createIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_content_moods_content ON content_moods(content_type, content_id)',
    'CREATE INDEX IF NOT EXISTS idx_streaming_availability_content ON streaming_availability(content_type, content_id)',
    'CREATE INDEX IF NOT EXISTS idx_streaming_availability_platform ON streaming_availability(platform_name, is_available)',
    'CREATE INDEX IF NOT EXISTS idx_user_filter_presets_user ON user_filter_presets(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_watch_sessions_user ON user_watch_sessions(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_content_ai_analysis_content ON content_ai_analysis(content_type, content_id)',
    'CREATE INDEX IF NOT EXISTS idx_content_metadata_enhanced_content ON content_metadata_enhanced(content_type, content_id)'
  ];

  createIndexes.forEach((sql, index) => {
    try {
      db.exec(sql);
      console.log(`✅ Created index ${index + 1}/${createIndexes.length}`);
    } catch (error) {
      console.error(`❌ Error creating index ${index + 1}:`, error.message);
    }
  });

  // Insert some sample mood data for testing
  console.log('🎭 Inserting sample mood data...');
  
  const insertSampleData = `
    INSERT OR IGNORE INTO content_moods (content_type, content_id, mood_tags, vibe_score, ai_analyzed)
    VALUES 
    ('tv', 1399, '["epic", "dark_gritty", "mind_bending"]', 8.5, 1),
    ('tv', 100, '["comfort_watch", "nostalgic"]', 7.2, 1),
    ('tv', 1418, '["feel_good", "light_funny"]', 8.8, 1),
    ('movie', 550, '["dark_gritty", "mind_bending"]', 9.1, 1),
    ('movie', 13, '["light_funny", "feel_good"]', 7.8, 1)
  `;

  try {
    db.exec(insertSampleData);
    console.log('✅ Inserted sample mood data');
  } catch (error) {
    console.error('❌ Error inserting sample data:', error.message);
  }

  // Insert some sample streaming availability data
  console.log('📺 Inserting sample streaming data...');
  
  const insertStreamingData = `
    INSERT OR IGNORE INTO streaming_availability (content_type, content_id, platform_name, platform_id, availability_type, deep_link_url)
    VALUES 
    ('tv', 1399, 'Netflix', 'netflix', 'subscription', 'https://www.netflix.com/title/70121425'),
    ('tv', 1418, 'Netflix', 'netflix', 'subscription', 'https://www.netflix.com/title/80014749'),
    ('tv', 100, 'Hulu', 'hulu', 'subscription', 'https://www.hulu.com/series/friends'),
    ('movie', 550, 'Netflix', 'netflix', 'subscription', 'https://www.netflix.com/title/70019678'),
    ('movie', 13, 'Disney+', 'disney_plus', 'subscription', 'https://www.disneyplus.com/movies/forrest-gump/3GzOK7ZTU1Lr')
  `;

  try {
    db.exec(insertStreamingData);
    console.log('✅ Inserted sample streaming data');
  } catch (error) {
    console.error('❌ Error inserting streaming data:', error.message);
  }

  // Update Rachel's preferences with enhanced options
  console.log('👤 Updating Rachel\'s preferences with enhanced options...');
  
  const updateRachelPrefs = `
    UPDATE user_preferences 
    SET 
      preferred_content_types = '["tv", "movie"]',
      preferred_moods = '["feel_good", "epic", "comfort_watch"]',
      preferred_networks = '["netflix", "hulu", "hbo_max"]',
      availability_preferences = '{"currently_streaming": true, "coming_soon": false}',
      release_year_range = '{"min": 2000, "max": 2025}',
      runtime_preferences = '{"tv_episode_length": "30-60", "movie_length": "90-150"}',
      language_preferences = '["en"]',
      social_preferences = '{"show_friends_activity": true, "allow_recommendations": true}',
      ai_preferences = '{"mood_matching": true, "hidden_gems": true}',
      updated_at = datetime('now')
    WHERE user_id = 'manual_1752272712977_25fdy83s7'
  `;

  try {
    const result = db.prepare(updateRachelPrefs).run();
    console.log('✅ Updated Rachel\'s enhanced preferences:', result.changes, 'rows affected');
  } catch (error) {
    console.error('❌ Error updating Rachel\'s preferences:', error.message);
  }

  // Create a sample filter preset for Rachel
  console.log('🎨 Creating sample filter preset...');
  
  const insertSamplePreset = `
    INSERT OR IGNORE INTO user_filter_presets (user_id, preset_name, preset_description, filter_config, is_public)
    VALUES (
      'manual_1752272712977_25fdy83s7',
      'Weekend Binge',
      'Perfect for long weekend watching sessions',
      '{"contentTypes": ["tv"], "moods": ["epic", "mind_bending"], "platforms": ["netflix", "hulu"], "releaseYearRange": [2015, 2025], "genreMode": "any"}',
      0
    )
  `;

  try {
    db.exec(insertSamplePreset);
    console.log('✅ Created sample filter preset');
  } catch (error) {
    console.error('❌ Error creating preset:', error.message);
  }

  console.log('🎉 Enhanced database migration completed successfully!');
  console.log('');
  console.log('📋 Migration Summary:');
  console.log('   • Added 9 new columns to user_preferences table');
  console.log('   • Created 7 new tables for enhanced filtering');
  console.log('   • Added indexes for performance');
  console.log('   • Inserted sample mood and streaming data');
  console.log('   • Updated Rachel\'s preferences with enhanced options');
  console.log('   • Created sample filter preset');
  console.log('');
  console.log('🚀 Your database is now ready for comprehensive filtering!');

} catch (error) {
  console.error('❌ Migration failed:', error);
} finally {
  db.close();
}
