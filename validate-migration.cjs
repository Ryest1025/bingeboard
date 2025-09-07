const Database = require('better-sqlite3');
const db = new Database('./dev.db');

async function runValidationTests() {
console.log('🧪 Running database validation tests...\n');

// Test 1: Verify CHECK constraints
console.log('📋 Test 1: CHECK Constraints');
try {
  // Test valid rating
  const stmt1 = db.prepare(`INSERT INTO user_feedback (user_id, content_id, content_type, rating, feedback_text) VALUES (?, ?, ?, ?, ?)`);
  stmt1.run('test-user', 'test-content', 'show', 4.5, 'Great show!');
  console.log('✅ Valid rating (4.5) accepted');
  
  // Test invalid rating (should fail)
  try {
    stmt1.run('test-user-2', 'test-content-2', 'show', 11.0, 'Invalid rating');
    console.log('❌ Invalid rating should have been rejected');
  } catch (error) {
    console.log('✅ Invalid rating (11.0) properly rejected');
  }
} catch (error) {
  console.log('❌ CHECK constraint test failed:', error.message);
}

// Test 2: Verify soft delete functionality
console.log('\n📋 Test 2: Soft Delete Functionality');
try {
  // Insert a test record
  const insertStmt = db.prepare(`INSERT INTO collections (id, user_id, name, description) VALUES (?, ?, ?, ?)`);
  insertStmt.run('test-collection', 'test-user', 'Test Collection', 'For testing');
  
  // Soft delete it
  const softDeleteStmt = db.prepare(`UPDATE collections SET deleted_at = datetime('now'), is_deleted = 1 WHERE id = ?`);
  const result = softDeleteStmt.run('test-collection');
  
  if (result.changes > 0) {
    console.log('✅ Soft delete executed successfully');
    
    // Verify it's excluded from normal queries
    const selectStmt = db.prepare(`SELECT * FROM collections WHERE id = ? AND is_deleted = 0`);
    const activeRecord = selectStmt.get('test-collection');
    
    if (!activeRecord) {
      console.log('✅ Soft deleted record properly excluded from active queries');
    } else {
      console.log('❌ Soft deleted record still appears in active queries');
    }
    
    // Verify it can be found in deleted queries
    const deletedStmt = db.prepare(`SELECT * FROM collections WHERE id = ? AND is_deleted = 1`);
    const deletedRecord = deletedStmt.get('test-collection');
    
    if (deletedRecord) {
      console.log('✅ Soft deleted record can be found in deleted queries');
    } else {
      console.log('❌ Soft deleted record not found in deleted queries');
    }
  }
} catch (error) {
  console.log('❌ Soft delete test failed:', error.message);
}

// Test 3: Verify triggers work
console.log('\n📋 Test 3: Trigger Functionality');
try {
  // Insert a record and check if updated_at trigger works
  const beforeTime = new Date().toISOString();
  
  const insertStmt = db.prepare(`INSERT INTO user_preferences (user_id, genres, mood, content_rating) VALUES (?, ?, ?, ?)`);
  insertStmt.run('trigger-test-user', JSON.stringify(['Drama']), JSON.stringify(['Relaxed']), JSON.stringify(['PG-13']));
  
  // Small delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Update the record
  const updateStmt = db.prepare(`UPDATE user_preferences SET genres = ? WHERE user_id = ?`);
  updateStmt.run(JSON.stringify(['Drama', 'Comedy']), 'trigger-test-user');
  
  // Check if updated_at was changed
  const selectStmt = db.prepare(`SELECT created_at, updated_at FROM user_preferences WHERE user_id = ?`);
  const record = selectStmt.get('trigger-test-user');
  
  if (record && record.updated_at > record.created_at) {
    console.log('✅ Update trigger working - updated_at is newer than created_at');
  } else {
    console.log('❌ Update trigger not working properly');
  }
} catch (error) {
  console.log('❌ Trigger test failed:', error.message);
}

// Test 4: Verify new table structure
console.log('\n📋 Test 4: New Table Structure');
try {
  const tables = [
    'user_feedback',
    'content_translations', 
    'user_activity_log',
    'scheduled_jobs',
    'collections',
    'collection_items',
    'filter_presets',
    'recommendation_feedback'
  ];
  
  for (const table of tables) {
    const result = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table);
    if (result) {
      console.log(`✅ Table '${table}' exists`);
    } else {
      console.log(`❌ Table '${table}' missing`);
    }
  }
} catch (error) {
  console.log('❌ Table structure test failed:', error.message);
}

// Test 5: Verify indexes
console.log('\n📋 Test 5: Index Verification');
try {
  const indexes = db.prepare(`SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'`).all();
  console.log(`✅ Found ${indexes.length} custom indexes:`);
  indexes.forEach(index => {
    console.log(`   - ${index.name}`);
  });
} catch (error) {
  console.log('❌ Index verification failed:', error.message);
}

// Test 6: Sample data verification
console.log('\n📋 Test 6: Sample Data');
try {
  const moods = db.prepare(`SELECT COUNT(*) as count FROM moods`).get();
  const streamingServices = db.prepare(`SELECT COUNT(*) as count FROM streaming_services`).get();
  
  console.log(`✅ Moods table has ${moods.count} entries`);
  console.log(`✅ Streaming services table has ${streamingServices.count} entries`);
  
  // Check Rachel's enhanced preferences
  const rachel = db.prepare(`SELECT * FROM user_preferences WHERE user_id = 'rachel-test'`).get();
  if (rachel) {
    console.log('✅ Rachel\'s enhanced preferences found');
    console.log(`   - Mood: ${rachel.mood}`);
    console.log(`   - Content Rating: ${rachel.content_rating}`);
    console.log(`   - Viewing Context: ${rachel.viewing_context}`);
  } else {
    console.log('❌ Rachel\'s enhanced preferences not found');
  }
} catch (error) {
  console.log('❌ Sample data test failed:', error.message);
}

console.log('\n🎉 Database validation tests completed!');

db.close();
}

// Run the tests
runValidationTests().catch(console.error);
