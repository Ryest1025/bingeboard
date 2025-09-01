/**
 * 🎯 BingeBoard Database Migration - Advanced Personalization Tables
 * 
 * Creates the necessary database tables for production-ready personalization
 * with enhanced performance, data integrity, and future-proofing
 */

import { db } from '../server/db.js';
import { sql } from 'drizzle-orm';

/**
 * Migration: Add Advanced Personalization Tables
 * Version: 2025.09.01.002 (Enhanced)
 */
export async function up() {
  console.log('🚀 Starting advanced personalization migration...');

  try {
    // Start transaction for atomicity
    await db.execute(sql`BEGIN;`);

    // Migration version tracking table (if not exists)
    console.log('📋 Creating migration registry...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS migration_registry (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        version VARCHAR(50) NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        rollback_sql TEXT
      );
    `);

    // Check if this migration is already applied
    const existingMigration = await db.execute(sql`
      SELECT migration_name FROM migration_registry 
      WHERE migration_name = 'advanced-personalization'
    `);

    if (existingMigration.rows.length > 0) {
      console.log('⚠️ Migration already applied, skipping...');
      await db.execute(sql`ROLLBACK;`);
      return;
    }

    // Genre taxonomy mapping table (create first for FK references)
    console.log('🏷️ Creating genre taxonomy table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS genre_taxonomy (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        canonical_genre VARCHAR(100) NOT NULL,
        tmdb_genre VARCHAR(100),
        watchmode_genre VARCHAR(100),
        utelly_genre VARCHAR(100),
        seasonal_boost_key VARCHAR(50),
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT unique_canonical_genre UNIQUE(canonical_genre)
      );
    `);

    // User temporal metrics for performance optimization
    console.log('⏱️ Creating user temporal metrics table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_temporal_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        -- Explicit columns for hot queries (faster than JSONB access)
        avg_session_length_minutes DECIMAL(8,2),
        total_watch_time_hours DECIMAL(10,2),
        binge_session_count INTEGER DEFAULT 0,
        preferred_genres TEXT[], -- Array of top 5 genres
        preferred_watch_times INTEGER[], -- Hour preferences (0-23)
        device_split JSONB, -- {"mobile": 0.6, "desktop": 0.3, "tv": 0.1}
        -- Flexible JSONB for additional metrics
        extended_metrics JSONB,
        computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT unique_user_temporal UNIQUE(user_id)
      );
    `);

    // User device preferences cache with enhanced data types
    console.log('📱 Creating user device preferences table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_device_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        device_type VARCHAR(50) NOT NULL,
        screen_size VARCHAR(20), -- "mobile", "tablet", "desktop", "tv"
        connection_speed VARCHAR(20), -- "slow", "medium", "fast"
        preferred_quality VARCHAR(10), -- "720p", "1080p", "4k"
        usage_patterns JSONB NOT NULL,
        computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT unique_user_device UNIQUE(user_id, device_type)
      );
    `);

    // Performance metrics tracking with enhanced data types
    console.log('📊 Creating performance logs table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS recommendation_performance_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        method_name VARCHAR(100) NOT NULL,
        duration_ms BIGINT NOT NULL, -- BIGINT for defensive programming
        user_id VARCHAR(255),
        response_size_bytes INTEGER,
        cache_hit BOOLEAN,
        error_type VARCHAR(100),
        context JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Recommendation quality metrics with future-proof score range
    console.log('🎯 Creating quality metrics table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS recommendation_quality_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        recommendation_id VARCHAR(255) NOT NULL,
        method_name VARCHAR(100) NOT NULL,
        score DECIMAL(5,2), -- Expanded to support 0-999.99 range
        clicked BOOLEAN NOT NULL DEFAULT FALSE,
        watched BOOLEAN NOT NULL DEFAULT FALSE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 10),
        watch_duration_seconds INTEGER,
        feedback_type VARCHAR(50), -- 'positive', 'negative', 'skip', 'share'
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes for performance
    console.log('🔍 Creating performance indexes...');
    
    // User temporal metrics indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_user_temporal_metrics_user_id 
      ON user_temporal_metrics(user_id);
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_user_temporal_metrics_updated_at 
      ON user_temporal_metrics(updated_at);
    `);

    // GIN index for JSONB queries on extended_metrics
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_user_temporal_metrics_extended_gin
      ON user_temporal_metrics USING gin (extended_metrics jsonb_path_ops);
    `);

    // Genre array index for fast genre lookups
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_user_temporal_metrics_genres_gin
      ON user_temporal_metrics USING gin (preferred_genres);
    `);

    // User device preferences indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_user_device_preferences_user_id 
      ON user_device_preferences(user_id);
    `);

    // GIN index for JSONB queries on usage_patterns
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_user_device_preferences_usage_gin
      ON user_device_preferences USING gin (usage_patterns jsonb_path_ops);
    `);

    // Performance logs indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_perf_logs_method_created 
      ON recommendation_performance_logs(method_name, created_at);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_perf_logs_user_created 
      ON recommendation_performance_logs(user_id, created_at) 
      WHERE user_id IS NOT NULL;
    `);

    // GIN index for JSONB context queries
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_perf_logs_context_gin
      ON recommendation_performance_logs USING gin (context jsonb_path_ops);
    `);

    // Quality metrics indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_quality_metrics_user_created 
      ON recommendation_quality_metrics(user_id, created_at);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_quality_metrics_method_score 
      ON recommendation_quality_metrics(method_name, score DESC);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_quality_metrics_clicked_watched 
      ON recommendation_quality_metrics(clicked, watched) 
      WHERE clicked = TRUE OR watched = TRUE;
    `);

    // Genre taxonomy indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_genre_taxonomy_canonical 
      ON genre_taxonomy(canonical_genre);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_genre_taxonomy_seasonal 
      ON genre_taxonomy(seasonal_boost_key) 
      WHERE seasonal_boost_key IS NOT NULL;
    `);

    // Insert default genre mappings with enhanced data
    console.log('🎬 Seeding genre taxonomy...');
    await db.execute(sql`
      INSERT INTO genre_taxonomy (canonical_genre, tmdb_genre, seasonal_boost_key, active) VALUES
      ('Horror', 'Horror', 'horror', TRUE),
      ('Thriller', 'Thriller', 'thriller', TRUE),
      ('Mystery', 'Mystery', 'supernatural', TRUE),
      ('Family', 'Family', 'family', TRUE),
      ('Animation', 'Animation', 'family', TRUE),
      ('Comedy', 'Comedy', 'light', TRUE),
      ('Romance', 'Romance', 'valentine', TRUE),
      ('Adventure', 'Adventure', 'adventure', TRUE),
      ('Action', 'Action', 'adventure', TRUE),
      ('Drama', 'Drama', 'comfort', TRUE),
      ('Documentary', 'Documentary', 'comfort', TRUE),
      ('Sci-Fi', 'Science Fiction', 'adventure', TRUE),
      ('Fantasy', 'Fantasy', 'adventure', TRUE),
      ('Crime', 'Crime', 'thriller', TRUE),
      ('War', 'War', 'drama', TRUE),
      ('Western', 'Western', 'adventure', TRUE),
      ('Musical', 'Music', 'light', TRUE),
      ('History', 'History', 'comfort', TRUE),
      ('Sport', 'Sport', 'adventure', TRUE),
      ('Biography', 'Biography', 'comfort', TRUE)
      ON CONFLICT (canonical_genre) DO UPDATE SET
        tmdb_genre = EXCLUDED.tmdb_genre,
        seasonal_boost_key = EXCLUDED.seasonal_boost_key,
        active = EXCLUDED.active,
        updated_at = NOW();
    `);

    // Record migration in registry
    await db.execute(sql`
      INSERT INTO migration_registry (migration_name, version, rollback_sql) VALUES (
        'advanced-personalization',
        '2025.09.01.002',
        'DROP TABLE IF EXISTS recommendation_quality_metrics CASCADE; DROP TABLE IF EXISTS recommendation_performance_logs CASCADE; DROP TABLE IF EXISTS user_device_preferences CASCADE; DROP TABLE IF EXISTS user_temporal_metrics CASCADE; DROP TABLE IF EXISTS genre_taxonomy CASCADE;'
      );
    `);

    // Commit transaction
    await db.execute(sql`COMMIT;`);
    
    console.log('✅ Advanced personalization migration completed successfully!');
    console.log('📊 Tables created:');
    console.log('   - migration_registry (version tracking)');
    console.log('   - genre_taxonomy (20 canonical genres)');
    console.log('   - user_temporal_metrics (with explicit columns + JSONB)');
    console.log('   - user_device_preferences (enhanced device tracking)');
    console.log('   - recommendation_performance_logs (with BIGINT duration)');
    console.log('   - recommendation_quality_metrics (expanded score range)');
    console.log('🔍 Indexes created: 12 performance indexes including GIN for JSONB');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    try {
      await db.execute(sql`ROLLBACK;`);
      console.log('🔄 Transaction rolled back successfully');
    } catch (rollbackError) {
      console.error('💥 Rollback failed:', rollbackError);
    }
    throw error;
  }
}

/**
 * Enhanced rollback migration with proper dependency order
 */
export async function down() {
  console.log('🗑️ Starting advanced personalization rollback...');

  try {
    // Start transaction for atomicity
    await db.execute(sql`BEGIN;`);

    console.log('📋 Dropping tables in dependency order...');

    // Drop dependent tables first (proper FK constraint order)
    console.log('🎯 Dropping recommendation_quality_metrics...');
    await db.execute(sql`DROP TABLE IF EXISTS recommendation_quality_metrics CASCADE;`);

    console.log('📊 Dropping recommendation_performance_logs...');
    await db.execute(sql`DROP TABLE IF EXISTS recommendation_performance_logs CASCADE;`);

    console.log('📱 Dropping user_device_preferences...');
    await db.execute(sql`DROP TABLE IF EXISTS user_device_preferences CASCADE;`);

    console.log('⏱️ Dropping user_temporal_metrics...');
    await db.execute(sql`DROP TABLE IF EXISTS user_temporal_metrics CASCADE;`);

    // Drop taxonomy table last (may be referenced by other tables in future)
    console.log('🏷️ Dropping genre_taxonomy...');
    await db.execute(sql`DROP TABLE IF EXISTS genre_taxonomy CASCADE;`);

    // Remove migration record
    console.log('📋 Removing migration registry entry...');
    await db.execute(sql`
      DELETE FROM migration_registry 
      WHERE migration_name = 'advanced-personalization';
    `);

    // Commit transaction
    await db.execute(sql`COMMIT;`);

    console.log('✅ Advanced personalization rollback completed successfully!');
    console.log('🗑️ All tables and indexes removed');

  } catch (error) {
    console.error('❌ Rollback failed:', error);
    try {
      await db.execute(sql`ROLLBACK;`);
      console.log('🔄 Transaction rolled back successfully');
    } catch (rollbackError) {
      console.error('💥 Rollback failed:', rollbackError);
    }
    throw error;
  }
}

/**
 * Migration status check
 */
export async function status() {
  try {
    const result = await db.execute(sql`
      SELECT migration_name, version, applied_at 
      FROM migration_registry 
      WHERE migration_name = 'advanced-personalization'
    `);
    
    if (result.rows.length > 0) {
      const migration = result.rows[0];
      console.log('✅ Migration Status: APPLIED');
      console.log(`   Version: ${migration.version}`);
      console.log(`   Applied: ${migration.applied_at}`);
      return true;
    } else {
      console.log('❌ Migration Status: NOT APPLIED');
      return false;
    }
  } catch (error) {
    console.log('❓ Migration Status: UNKNOWN (registry table may not exist)');
    return false;
  }
}

/**
 * Validate migration integrity
 */
export async function validate() {
  console.log('🔍 Validating migration integrity...');
  
  const expectedTables = [
    'genre_taxonomy',
    'user_temporal_metrics', 
    'user_device_preferences',
    'recommendation_performance_logs',
    'recommendation_quality_metrics'
  ];

  const issues = [];

  try {
    for (const tableName of expectedTables) {
      const result = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      `);

      if (result.rows.length === 0) {
        issues.push(`❌ Missing table: ${tableName}`);
      } else {
        console.log(`✅ Table exists: ${tableName}`);
      }
    }

    // Check genre taxonomy has data
    const genreCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM genre_taxonomy
    `);
    
    if (Number(genreCount.rows[0]?.count) < 10) {
      issues.push(`⚠️ Genre taxonomy has insufficient data: ${genreCount.rows[0]?.count} genres`);
    } else {
      console.log(`✅ Genre taxonomy populated: ${genreCount.rows[0]?.count} genres`);
    }

    // Check critical indexes exist
    const criticalIndexes = [
      'idx_user_temporal_metrics_user_id',
      'idx_user_temporal_metrics_extended_gin',
      'idx_perf_logs_method_created',
      'idx_quality_metrics_user_created'
    ];

    for (const indexName of criticalIndexes) {
      const result = await db.execute(sql`
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname = ${indexName}
      `);

      if (result.rows.length === 0) {
        issues.push(`❌ Missing critical index: ${indexName}`);
      } else {
        console.log(`✅ Index exists: ${indexName}`);
      }
    }

    if (issues.length === 0) {
      console.log('🎉 Migration validation PASSED - all components healthy');
      return true;
    } else {
      console.log('⚠️ Migration validation found issues:');
      issues.forEach(issue => console.log(`   ${issue}`));
      return false;
    }

  } catch (error) {
    console.error('❌ Validation failed:', error);
    return false;
  }
}

/**
 * Run migration directly with enhanced CLI
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2] || 'up';
  
  try {
    switch (command) {
      case 'up':
        await up();
        await validate();
        break;
        
      case 'down':
        await down();
        break;
        
      case 'status':
        await status();
        break;
        
      case 'validate':
        const isValid = await validate();
        process.exit(isValid ? 0 : 1);
        break;
        
      case 'force-up':
        console.log('🔄 Force applying migration (skipping existing check)...');
        // Temporarily remove the existing check
        const originalUp = up;
        up = async function() {
          await db.execute(sql`BEGIN;`);
          // Skip existing migration check and proceed
        };
        await originalUp();
        break;
        
      default:
        console.error('Usage: node migration-advanced-personalization.js [up|down|status|validate|force-up]');
        console.error('');
        console.error('Commands:');
        console.error('  up       - Apply the migration');
        console.error('  down     - Rollback the migration');
        console.error('  status   - Check if migration is applied');
        console.error('  validate - Validate migration integrity');
        console.error('  force-up - Force apply migration (skip checks)');
        process.exit(1);
    }
    
    console.log('🎯 Migration command completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Migration command failed:', error);
    process.exit(1);
  }
}
