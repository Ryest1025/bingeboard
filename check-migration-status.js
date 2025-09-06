#!/usr/bin/env node
/**
 * 🔍 Migration Status Checker
 * 
 * Quick utility to check if migrations need to be run
 */

import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function checkMigrationStatus() {
  console.log('🔍 Checking migration status...');

  try {
    // Check if migration registry exists
    const registryExists = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'migration_registry'
    `);

    if (registryExists.rows.length === 0) {
      console.log('❌ Migration registry not found - migrations need to be run');
      console.log('👉 Run: node migrations/migration-advanced-personalization.js up');
      process.exit(1);
    }

    // Check advanced personalization migration
    const advancedPersonalization = await db.execute(sql`
      SELECT migration_name, version, applied_at 
      FROM migration_registry 
      WHERE migration_name = 'advanced-personalization'
    `);

    if (advancedPersonalization.rows.length === 0) {
      console.log('❌ Advanced personalization migration not applied');
      console.log('👉 Run: node migrations/migration-advanced-personalization.js up');
      process.exit(1);
    }

    const migration = advancedPersonalization.rows[0];
    console.log('✅ Advanced personalization migration applied');
    console.log(`   Version: ${migration.version}`);
    console.log(`   Applied: ${migration.applied_at}`);

    // Check table integrity
    const expectedTables = [
      'genre_taxonomy',
      'user_temporal_metrics', 
      'user_device_preferences',
      'recommendation_performance_logs',
      'recommendation_quality_metrics'
    ];

    console.log('\n📊 Checking table integrity...');
    let allTablesExist = true;

    for (const tableName of expectedTables) {
      const result = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      `);

      if (result.rows.length === 0) {
        console.log(`❌ Missing table: ${tableName}`);
        allTablesExist = false;
      } else {
        console.log(`✅ Table exists: ${tableName}`);
      }
    }

    if (!allTablesExist) {
      console.log('\n⚠️ Some tables are missing. Consider running migration again.');
      process.exit(1);
    }

    console.log('\n🎉 All migrations applied and tables exist');
    console.log('✅ System is ready for advanced personalization');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error checking migration status:', error);
    console.log('\n💡 This might mean:');
    console.log('   - Database is not accessible');
    console.log('   - Migration tables do not exist');
    console.log('   - Database connection configuration issue');
    console.log('\n👉 Try running: node migrations/migration-advanced-personalization.js up');
    process.exit(1);
  }
}

// Run the check
checkMigrationStatus();
