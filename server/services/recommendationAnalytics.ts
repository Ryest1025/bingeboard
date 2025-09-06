/**
 * 📊 BingeBoard Recommendation Engine - Analytics & Monitoring Service
 * Production-ready analytics for recommendation performance tracking
 */

import { db } from '../db.js';
import { eq, and, gte, sql, desc } from 'drizzle-orm';

export interface RecommendationEvent {
  userId: string;
  recommendationId: string;
  contentId: string;
  algorithm: string;
  deviceType: string;
  contextData?: any;
  eventType: 'impression' | 'click' | 'watch_start' | 'watch_complete';
  position?: number;
  score?: number;
}

export interface AlgorithmPerformance {
  algorithm: string;
  impressions: number;
  clicks: number;
  watchStarts: number;
  watchCompletions: number;
  clickThroughRate: number;
  watchRate: number;
  avgScore: number;
  avgPosition: number;
}

export interface PerformanceAlert {
  type: 'performance' | 'quality' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metrics: any;
  timestamp: Date;
}

export class RecommendationAnalytics {
  
  /**
   * Track recommendation event (impression, click, watch)
   */
  static async trackEvent(event: RecommendationEvent): Promise<void> {
    try {
      await db.insert('recommendation_events').values({
        user_id: event.userId,
        recommendation_id: event.recommendationId,
        content_id: event.contentId,
        algorithm: event.algorithm,
        device_type: event.deviceType,
        context_data: event.contextData ? JSON.stringify(event.contextData) : null,
        event_type: event.eventType,
        position: event.position,
        score: event.score,
        created_at: new Date()
      });
    } catch (error) {
      console.error('Failed to track recommendation event:', error);
    }
  }

  /**
   * Get algorithm performance metrics
   */
  static async getAlgorithmPerformance(
    timeRange: string = '7d'
  ): Promise<AlgorithmPerformance[]> {
    const timeCondition = this.getTimeCondition(timeRange);
    
    const results = await db.query(`
      SELECT 
        algorithm,
        COUNT(*) as impressions,
        COUNT(CASE WHEN event_type = 'click' THEN 1 END) as clicks,
        COUNT(CASE WHEN event_type = 'watch_start' THEN 1 END) as watch_starts,
        COUNT(CASE WHEN event_type = 'watch_complete' THEN 1 END) as watch_completions,
        AVG(score) as avg_score,
        AVG(position) as avg_position
      FROM recommendation_events 
      WHERE created_at >= ${timeCondition}
      GROUP BY algorithm
      ORDER BY impressions DESC
    `);

    return results.map((row: any) => ({
      algorithm: row.algorithm,
      impressions: row.impressions,
      clicks: row.clicks,
      watchStarts: row.watch_starts,
      watchCompletions: row.watch_completions,
      clickThroughRate: row.clicks / row.impressions,
      watchRate: row.watch_starts / row.impressions,
      avgScore: parseFloat(row.avg_score || '0'),
      avgPosition: parseFloat(row.avg_position || '0')
    }));
  }

  /**
   * Get device-specific performance metrics
   */
  static async getDevicePerformance(timeRange: string = '7d') {
    const timeCondition = this.getTimeCondition(timeRange);
    
    return await db.query(`
      SELECT 
        device_type,
        algorithm,
        COUNT(*) as impressions,
        COUNT(CASE WHEN event_type = 'click' THEN 1 END) as clicks,
        AVG(score) as avg_score,
        AVG(position) as avg_click_position
      FROM recommendation_events 
      WHERE created_at >= ${timeCondition}
        AND event_type IN ('impression', 'click')
      GROUP BY device_type, algorithm
      ORDER BY device_type, impressions DESC
    `);
  }

  /**
   * Get content performance (what's being recommended most)
   */
  static async getContentPerformance(
    limit: number = 100,
    timeRange: string = '7d'
  ) {
    const timeCondition = this.getTimeCondition(timeRange);
    
    return await db.query(`
      SELECT 
        content_id,
        COUNT(*) as recommendation_count,
        COUNT(CASE WHEN event_type = 'click' THEN 1 END) as clicks,
        COUNT(CASE WHEN event_type = 'watch_start' THEN 1 END) as watches,
        AVG(score) as avg_score,
        COUNT(DISTINCT user_id) as unique_users
      FROM recommendation_events 
      WHERE created_at >= ${timeCondition}
      GROUP BY content_id
      ORDER BY recommendation_count DESC
      LIMIT ${limit}
    `);
  }

  /**
   * Get user engagement patterns
   */
  static async getUserEngagementMetrics(timeRange: string = '7d') {
    const timeCondition = this.getTimeCondition(timeRange);
    
    return await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*) as total_interactions,
        COUNT(CASE WHEN event_type = 'click' THEN 1 END) as total_clicks,
        COUNT(CASE WHEN event_type = 'watch_start' THEN 1 END) as total_watches,
        AVG(CASE WHEN event_type = 'click' THEN position END) as avg_click_position
      FROM recommendation_events 
      WHERE created_at >= ${timeCondition}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
  }

  /**
   * Detect performance anomalies and generate alerts
   */
  static async detectAnomalies(): Promise<PerformanceAlert[]> {
    const alerts: PerformanceAlert[] = [];
    
    // Check click-through rates
    const algorithmPerf = await this.getAlgorithmPerformance('24h');
    
    for (const perf of algorithmPerf) {
      // Alert if CTR drops below 5%
      if (perf.clickThroughRate < 0.05 && perf.impressions > 100) {
        alerts.push({
          type: 'performance',
          severity: 'medium',
          message: `Low click-through rate for ${perf.algorithm}: ${(perf.clickThroughRate * 100).toFixed(2)}%`,
          metrics: perf,
          timestamp: new Date()
        });
      }
      
      // Alert if average score is too low
      if (perf.avgScore < 0.3 && perf.impressions > 100) {
        alerts.push({
          type: 'quality',
          severity: 'high',
          message: `Low recommendation scores for ${perf.algorithm}: ${perf.avgScore.toFixed(3)}`,
          metrics: perf,
          timestamp: new Date()
        });
      }
    }

    // Check for errors in performance logs
    const errorCount = await this.getRecentErrorCount();
    if (errorCount > 10) {
      alerts.push({
        type: 'error',
        severity: 'critical',
        message: `High error count in recommendation engine: ${errorCount} errors in last hour`,
        metrics: { errorCount },
        timestamp: new Date()
      });
    }

    return alerts;
  }

  /**
   * Generate daily performance report
   */
  static async generateDailyReport(date: Date = new Date()) {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateStr = yesterday.toISOString().split('T')[0];
    
    const [
      algorithmPerf,
      devicePerf,
      engagementMetrics,
      topContent
    ] = await Promise.all([
      this.getAlgorithmPerformance('1d'),
      this.getDevicePerformance('1d'),
      this.getUserEngagementMetrics('1d'),
      this.getContentPerformance(20, '1d')
    ]);

    const report = {
      date: dateStr,
      summary: {
        totalUsers: engagementMetrics[0]?.unique_users || 0,
        totalInteractions: engagementMetrics[0]?.total_interactions || 0,
        totalClicks: engagementMetrics[0]?.total_clicks || 0,
        totalWatches: engagementMetrics[0]?.total_watches || 0,
        overallCTR: engagementMetrics[0] ? 
          engagementMetrics[0].total_clicks / engagementMetrics[0].total_interactions : 0
      },
      algorithmPerformance: algorithmPerf,
      devicePerformance: devicePerf,
      topRecommendedContent: topContent,
      generatedAt: new Date().toISOString()
    };

    // Store report for historical tracking
    await this.storePerformanceReport(report);
    
    return report;
  }

  /**
   * A/B Testing Support
   */
  static async trackABTestEvent(
    userId: string,
    experiment: string,
    variant: string,
    interaction: 'view' | 'click' | 'watch',
    metadata?: any
  ) {
    try {
      await db.insert('ab_test_events').values({
        user_id: userId,
        experiment,
        variant,
        interaction,
        metadata: metadata ? JSON.stringify(metadata) : null,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to track A/B test event:', error);
    }
  }

  /**
   * Get A/B test results
   */
  static async getABTestResults(experiment: string, timeRange: string = '7d') {
    const timeCondition = this.getTimeCondition(timeRange);
    
    return await db.query(`
      SELECT 
        variant,
        COUNT(*) as total_events,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(CASE WHEN interaction = 'click' THEN 1 END) as clicks,
        COUNT(CASE WHEN interaction = 'watch' THEN 1 END) as watches,
        COUNT(CASE WHEN interaction = 'click' THEN 1 END) / COUNT(*) as ctr,
        COUNT(CASE WHEN interaction = 'watch' THEN 1 END) / COUNT(*) as watch_rate
      FROM ab_test_events 
      WHERE experiment = ? 
        AND timestamp >= ${timeCondition}
      GROUP BY variant
      ORDER BY variant
    `, [experiment]);
  }

  /**
   * Real-time dashboard metrics
   */
  static async getDashboardMetrics() {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const [
      hourlyStats,
      activeAlerts,
      systemHealth
    ] = await Promise.all([
      this.getHourlyStats(hourAgo),
      this.detectAnomalies(),
      this.getSystemHealth()
    ]);

    return {
      timestamp: now.toISOString(),
      hourlyStats,
      alerts: activeAlerts,
      systemHealth,
      status: activeAlerts.some(a => a.severity === 'critical') ? 'critical' :
              activeAlerts.some(a => a.severity === 'high') ? 'degraded' : 'healthy'
    };
  }

  // Helper methods

  private static getTimeCondition(timeRange: string): string {
    const intervals = {
      '1h': 'NOW() - INTERVAL 1 HOUR',
      '24h': 'NOW() - INTERVAL 24 HOUR', 
      '1d': 'NOW() - INTERVAL 1 DAY',
      '7d': 'NOW() - INTERVAL 7 DAY',
      '30d': 'NOW() - INTERVAL 30 DAY'
    };
    
    return intervals[timeRange as keyof typeof intervals] || intervals['7d'];
  }

  private static async getRecentErrorCount(): Promise<number> {
    const result = await db.query(`
      SELECT SUM(error_count) as total_errors
      FROM recommendation_performance_logs 
      WHERE logged_at >= NOW() - INTERVAL 1 HOUR
    `);
    
    return result[0]?.total_errors || 0;
  }

  private static async getHourlyStats(since: Date) {
    return await db.query(`
      SELECT 
        COUNT(*) as total_recommendations,
        COUNT(CASE WHEN event_type = 'click' THEN 1 END) as clicks,
        COUNT(CASE WHEN event_type = 'watch_start' THEN 1 END) as watches,
        COUNT(DISTINCT user_id) as unique_users,
        AVG(score) as avg_score
      FROM recommendation_events 
      WHERE created_at >= ?
    `, [since]);
  }

  private static async getSystemHealth() {
    const perfLogs = await db.query(`
      SELECT 
        method_name,
        AVG(duration_ms) as avg_duration,
        MAX(duration_ms) as max_duration,
        SUM(CASE WHEN cache_hit = TRUE THEN 1 ELSE 0 END) / COUNT(*) as cache_hit_rate
      FROM recommendation_performance_logs 
      WHERE logged_at >= NOW() - INTERVAL 1 HOUR
      GROUP BY method_name
    `);

    return {
      methods: perfLogs,
      overallHealth: perfLogs.every((log: any) => log.avg_duration < 1000) ? 'healthy' : 'degraded'
    };
  }

  private static async storePerformanceReport(report: any) {
    try {
      await db.insert('daily_performance_reports').values({
        report_date: report.date,
        report_data: JSON.stringify(report),
        created_at: new Date()
      });
    } catch (error) {
      console.error('Failed to store performance report:', error);
    }
  }
}

export default RecommendationAnalytics;
