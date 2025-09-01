/**
 * 🌙 Nightly Aggregation Job - User Temporal Preferences
 * 
 * Pre-computes user temporal preferences for improved performance
 * Run daily at 2 AM via cron job
 */

import { db } from '../server/db.js';
import { sql } from 'drizzle-orm';
import AdvancedPersonalization from '../server/services/advancedPersonalization.js';
import pLimit from 'p-limit';
import { userTemporalMetrics, aggregationRuns } from '../shared/schema.js';

/**
 * @typedef {Object} AggregationStats
 * @property {number} usersProcessed
 * @property {number} usersSkipped
 * @property {number} processingTime
 * @property {number} errors
 * @property {number} avgComputationTime
 */

class NightlyAggregation {
  
  static BATCH_SIZE = 1000;
  static MAX_RETRIES = 3;
  static PROGRESS_LOG_INTERVAL = 5000; // Log every 5000 users
  static CONCURRENCY_LIMIT = 20; // Process 20 users at a time max
  static RETENTION_DAYS = 7; // Keep metrics for 7 days
  static CLEANUP_KEEP_DAYS = 30; // Keep 30 days of daily snapshots

  // Graceful shutdown handling
  static isShuttingDown = false;
  static currentStats = null;

  /**
   * Main aggregation process
   * @returns {Promise<AggregationStats>}
   */
  static async runAggregation() {
    const startTime = performance.now();
    console.log('🌙 Starting nightly aggregation job...');

    // Set up graceful shutdown handling
    this.setupGracefulShutdown();
    
    const stats = {
      usersProcessed: 0,
      usersSkipped: 0,
      processingTime: 0,
      errors: 0,
      avgComputationTime: 0
    };

    // Store stats for potential graceful shutdown
    this.currentStats = stats;

    try {
      // Get all active users (last activity within 90 days)
      const activeUsers = await this.getActiveUsers();
      console.log(`📊 Found ${activeUsers.length} active users to process`);

      // Process users in batches
      const batches = this.createBatches(activeUsers, this.BATCH_SIZE);
      console.log(`📦 Processing ${batches.length} batches of ${this.BATCH_SIZE} users`);

      stats.batchCount = batches.length;
      stats.startTime = new Date();

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const batchStats = await this.processBatch(batch, i + 1, batches.length);
        
        stats.usersProcessed += batchStats.usersProcessed;
        stats.usersSkipped += batchStats.usersSkipped;
        stats.errors += batchStats.errors;

        // Progress logging
        if ((i + 1) % 5 === 0 || i === batches.length - 1) {
          console.log(`📈 Progress: ${i + 1}/${batches.length} batches (${stats.usersProcessed} users processed)`);
        }
      }

      const endTime = performance.now();
      stats.processingTime = endTime - startTime;
      stats.endTime = new Date();
      // Fix division by zero bug
      stats.avgComputationTime = stats.usersProcessed > 0
        ? stats.processingTime / stats.usersProcessed
        : 0;

      // Log final statistics
      this.logAggregationStats(stats);
      
      // Store aggregation run data for monitoring
      await this.storeAggregationRun(stats);

      // Clean up old metrics (keep last 7 days)
      await this.cleanupOldMetrics();

      console.log('✅ Nightly aggregation completed successfully!');
      return stats;

    } catch (error) {
      console.error('❌ Nightly aggregation failed:', {
        error: error.message,
        stack: error.stack,
        partialStats: stats,
        timestamp: new Date().toISOString()
      });
      
      // Store partial stats even on failure for monitoring
      stats.errors++;
      stats.endTime = new Date();
      stats.processingTime = performance.now() - startTime;
      
      try {
        await this.storeAggregationRun(stats);
      } catch (storeError) {
        console.error('❌ Failed to store failure stats:', storeError.message);
      }
      
      throw error;
    } finally {
      // Reset shutdown flag
      this.isShuttingDown = false;
      this.currentStats = null;
    }
  }

  /**
   * Set up graceful shutdown handling
   */
  static setupGracefulShutdown() {
    const gracefulShutdown = async (signal) => {
      console.log(`\n🚨 Received ${signal}, initiating graceful shutdown...`);
      this.isShuttingDown = true;

      if (this.currentStats) {
        console.log('💾 Saving partial aggregation stats...');
        await this.storeAggregationRun(this.currentStats);
      }

      console.log('✅ Graceful shutdown complete');
      process.exit(0);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  }

  /**
   * Get active users for processing
   */
  static async getActiveUsers() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago

    const result = await db.execute(sql`
      SELECT DISTINCT user_id 
      FROM user_behavior 
      WHERE timestamp >= ${cutoffDate.toISOString()}
      ORDER BY user_id
    `);

    return result.rows.map(row => row.user_id);
  }

  /**
   * Create batches of users for processing
   */
  static createBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Process a batch of users with concurrency limiting
   */
  static async processBatch(userIds, batchNumber, totalBatches) {
    const batchStats = { usersProcessed: 0, usersSkipped: 0, errors: 0 };
    
    console.log(`🔄 Processing batch ${batchNumber}/${totalBatches} (${userIds.length} users)`);

    // Check for graceful shutdown
    if (this.isShuttingDown) {
      console.log('🛑 Graceful shutdown in progress, skipping batch');
      return batchStats;
    }

    // Use concurrency limiting to prevent database overload
    const limit = pLimit(this.CONCURRENCY_LIMIT);
    const promises = userIds.map(userId => limit(() => this.processUser(userId)));
    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.processed) {
          batchStats.usersProcessed++;
        } else {
          batchStats.usersSkipped++;
        }
      } else {
        batchStats.errors++;
        console.error(`Error processing user ${userIds[index]}:`, result.reason);
      }
    });

    // Small delay between batches to prevent database overload
    await new Promise(resolve => setTimeout(resolve, 100));

    return batchStats;
  }

  /**
   * Process individual user temporal preferences
   */
  static async processUser(userId, retryCount = 0) {
    try {
      // Check if user already has recent metrics (within 24 hours)
      const existingMetrics = await this.getExistingMetrics(userId);
      if (existingMetrics && this.isRecentEnough(existingMetrics.updated_at)) {
        return { processed: false }; // Skip - already up to date
      }

      // Compute temporal preferences
      const preferences = await AdvancedPersonalization.analyzeTemporalPreferences(userId);
      
      // Store in database
      await this.storeTemporalMetrics(userId, preferences);
      
      return { processed: true };

    } catch (error) {
      if (retryCount < this.MAX_RETRIES && this.isRetryableError(error)) {
        console.warn(`🔄 Retrying user ${userId} (attempt ${retryCount + 1}/${this.MAX_RETRIES}):`, {
          error: error.message,
          isRetryable: true
        });
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return this.processUser(userId, retryCount + 1);
      } else {
        console.error(`❌ Failed to process user ${userId} after ${this.MAX_RETRIES} retries:`, {
          error: error.message,
          stack: error.stack,
          retryCount,
          isRetryable: this.isRetryableError(error)
        });
        throw error;
      }
    }
  }

  /**
   * Check if an error is retryable (transient vs permanent)
   */
  static isRetryableError(error) {
    const retryableErrors = [
      'ECONNRESET',
      'ETIMEDOUT', 
      'ENOTFOUND',
      'database is locked',
      'connection timeout'
    ];
    
    return retryableErrors.some(pattern => 
      error.message.toLowerCase().includes(pattern.toLowerCase()) ||
      error.code === pattern
    );
  }

  /**
   * Get existing metrics for user
   */
  static async getExistingMetrics(userId) {
    const result = await db.execute(sql`
      SELECT updated_at 
      FROM user_temporal_metrics 
      WHERE user_id = ${userId}
    `);

    return result.rows[0] || null;
  }

  /**
   * Check if metrics are recent enough (within 24 hours)
   */
  static isRecentEnough(updatedAt) {
    const threshold = new Date();
    threshold.setHours(threshold.getHours() - 24);
    return new Date(updatedAt) > threshold;
  }

  /**
   * Store temporal metrics in database
   */
  static async storeTemporalMetrics(userId, preferences) {
    try {
      await db.insert(userTemporalMetrics).values({
        userId: userId,
        metrics: JSON.stringify(preferences),
        updatedAt: new Date()
      }).onConflictDoUpdate({
        target: userTemporalMetrics.userId,
        set: {
          metrics: JSON.stringify(preferences),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      // Fallback to raw SQL if schema-based approach fails
      await db.execute(sql`
        INSERT INTO user_temporal_metrics (user_id, metrics, updated_at)
        VALUES (${userId}, ${JSON.stringify(preferences)}, NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          metrics = ${JSON.stringify(preferences)},
          updated_at = NOW()
      `);
    }
  }

  /**
   * Clean up old metrics data
   */
  static async cleanupOldMetrics() {
    try {
      // Calculate cutoff date for retention
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.RETENTION_DAYS);
      const cutoffISOString = cutoffDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      console.log(`🧹 Cleaning up metrics older than ${cutoffISOString} (${this.RETENTION_DAYS} days)`);
      
      // Clean up old temporal metrics
      const temporalResult = await db.execute(sql`
        DELETE FROM user_temporal_metrics 
        WHERE DATE(updated_at) < DATE(${cutoffISOString})
      `);

      // Clean up old performance logs
      await db.execute(sql`
        DELETE FROM recommendation_performance_logs 
        WHERE created_at < ${cutoffDate.toISOString()}
      `);

      // Clean up old quality metrics but keep daily snapshots
      await db.execute(sql`
        DELETE FROM recommendation_quality_metrics 
        WHERE created_at < ${cutoffDate.toISOString()}
          AND created_at NOT IN (
            SELECT DISTINCT DATE(created_at) 
            FROM recommendation_quality_metrics 
            ORDER BY created_at DESC 
            LIMIT 30
          )
      `);

      console.log(`📊 Cleaned up ${temporalResult.rowsAffected || 0} old temporal metrics records`);
    } catch (error) {
      console.error('❌ Failed to cleanup old metrics:', {
        error: error.message,
        stack: error.stack
      });
      // Don't throw - cleanup failure shouldn't stop the main process
    }
  }

  /**
   * Log aggregation statistics
   */
  static logAggregationStats(stats) {
    console.log('📊 Nightly Aggregation Statistics:');
    console.log(`   Users Processed: ${stats.usersProcessed.toLocaleString()}`);
    console.log(`   Users Skipped: ${stats.usersSkipped.toLocaleString()}`);
    console.log(`   Total Processing Time: ${(stats.processingTime / 1000 / 60).toFixed(2)} minutes`);
    console.log(`   Average Time per User: ${stats.avgComputationTime.toFixed(2)}ms`);
    console.log(`   Errors: ${stats.errors}`);
    console.log(`   Success Rate: ${((stats.usersProcessed / (stats.usersProcessed + stats.errors)) * 100).toFixed(2)}%`);

    // Don't call storeAggregationRun here - it's called in the main process
  }

  /**
   * Store aggregation run statistics for monitoring
   */
  static async storeAggregationRun(stats) {
    try {
      // Enhanced aggregation run storage with monitoring metrics
      const aggregationData = {
        startTime: stats.startTime || new Date(),
        endTime: stats.endTime || new Date(),
        duration: Math.round(stats.processingTime || 0),
        usersProcessed: stats.usersProcessed || 0,
        usersSkipped: stats.usersSkipped || 0,
        errorCount: stats.errors || 0,
        avgProcessingTime: Math.round(stats.avgComputationTime || 0),
        batchCount: stats.batchCount || 0,
        concurrencyLimit: this.CONCURRENCY_LIMIT,
        context: JSON.stringify({
          batchSize: this.BATCH_SIZE,
          maxRetries: this.MAX_RETRIES,
          retentionDays: this.RETENTION_DAYS,
          version: '2.0.0-enhanced',
          performanceMetrics: {
            totalUsers: (stats.usersProcessed || 0) + (stats.usersSkipped || 0),
            successRate: stats.usersProcessed && stats.errors 
              ? stats.usersProcessed / (stats.usersProcessed + stats.errors) 
              : stats.usersProcessed > 0 ? 1 : 0,
            avgBatchTime: stats.processingTime && stats.batchCount 
              ? stats.processingTime / stats.batchCount 
              : 0
          }
        })
      };

      try {
        // Try using schema-based insertion first
        await db.insert(aggregationRuns).values(aggregationData);
      } catch (schemaError) {
        // Fallback to raw SQL if schema approach fails
        await db.execute(sql`
          INSERT INTO recommendation_performance_logs (
            method_name, 
            duration_ms, 
            context, 
            created_at
          ) VALUES (
            'nightly_aggregation',
            ${aggregationData.duration},
            ${aggregationData.context},
            NOW()
          )
        `);
      }
      
      console.log('📊 Aggregation run data stored successfully');
    } catch (error) {
      console.error('❌ Failed to store aggregation run data:', {
        error: error.message,
        stack: error.stack
      });
      // Don't throw - this is just monitoring data
    }
  }

  /**
   * Health check for aggregation job
   */
  static async healthCheck() {
    const issues = [];

    try {
      // Check if aggregation ran in last 25 hours
      const result = await db.execute(sql`
        SELECT created_at, context
        FROM recommendation_performance_logs 
        WHERE method_name = 'nightly_aggregation'
        ORDER BY created_at DESC 
        LIMIT 1
      `);

      if (result.rows.length === 0) {
        issues.push('No aggregation runs found in database');
      } else {
        const lastRun = new Date(result.rows[0].created_at);
        const hoursSinceLastRun = (Date.now() - lastRun.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastRun > 25) {
          issues.push(`Last aggregation run was ${hoursSinceLastRun.toFixed(1)} hours ago`);
        }

        const context = JSON.parse(result.rows[0].context);
        if (context.errors > context.usersProcessed * 0.05) {
          issues.push(`High error rate in last run: ${context.errors} errors`);
        }

        return {
          status: issues.length === 0 ? 'healthy' : 'warning',
          lastRun,
          issues
        };
      }

    } catch (error) {
      issues.push(`Database error during health check: ${error}`);
    }

    return {
      status: 'error',
      issues
    };
  }
}

/**
 * CLI interface for running aggregation
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2] || 'run';
  
  if (command === 'run') {
    try {
      const stats = await NightlyAggregation.runAggregation();
      console.log('🎯 Aggregation completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('💥 Aggregation failed:', error);
      process.exit(1);
    }
  } else if (command === 'health') {
    const health = await NightlyAggregation.healthCheck();
    console.log('🏥 Health Check:', health);
    process.exit(health.status === 'healthy' ? 0 : 1);
  } else {
    console.error('Usage: node nightly-aggregation.js [run|health]');
    process.exit(1);
  }
}

export default NightlyAggregation;
