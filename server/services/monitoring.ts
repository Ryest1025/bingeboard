/**
 * 📊 Advanced Personalization Monitoring & Alerting
 * 
 * Real-time monitoring, alerting, and performance tracking
 */

import { db } from '../db.js';
import { sql, gte } from 'drizzle-orm';
import { userBehavior } from '../../shared/schema.js';

interface AlertRule {
  name: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq';
  threshold: number;
  timeWindow: number; // minutes
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface PerformanceSnapshot {
  timestamp: Date;
  avgResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  throughput: number;
  activeUsers: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export class PersonalizationMonitoring {

  private static readonly ALERT_RULES: AlertRule[] = [
    {
      name: 'High Response Time',
      metric: 'avg_response_time',
      operator: 'gt',
      threshold: 200, // ms
      timeWindow: 5, // 5 minutes
      enabled: true,
      severity: 'high'
    },
    {
      name: 'Low Cache Hit Rate',
      metric: 'cache_hit_rate',
      operator: 'lt',
      threshold: 0.5, // 50%
      timeWindow: 10,
      enabled: true,
      severity: 'medium'
    },
    {
      name: 'High Error Rate',
      metric: 'error_rate',
      operator: 'gt',
      threshold: 0.05, // 5%
      timeWindow: 5,
      enabled: true,
      severity: 'critical'
    },
    {
      name: 'Low Throughput',
      metric: 'throughput',
      operator: 'lt',
      threshold: 10, // requests/minute
      timeWindow: 15,
      enabled: true,
      severity: 'medium'
    },
    {
      name: 'Extreme Response Time',
      metric: 'max_response_time',
      operator: 'gt',
      threshold: 1000, // 1 second
      timeWindow: 1,
      enabled: true,
      severity: 'critical'
    }
  ];

  /**
   * Get current system performance snapshot
   */
  static async getPerformanceSnapshot(): Promise<PerformanceSnapshot> {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    try {
      // In dev (SQLite), we may not have a recommendation_performance_logs table.
      // Derive rough metrics from user_behavior as a fallback.
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const fiveMinAgo = fiveMinutesAgo;

      // Total events in last 5 minutes as proxy for throughput and requests
      const recentEvents = await db.query.userBehavior.findMany({
        where: gte(userBehavior.timestamp, fiveMinAgo),
        limit: 2000,
      } as any);

      const totalRequests = recentEvents.length;
      const throughput = totalRequests / 5; // req/min over 5 minutes

      // Error rate proxy: count events with metadata.error=true
      let errorCount = 0;
      for (const ev of recentEvents) {
        try {
          const meta = JSON.parse((ev as any).metadata || '{}');
          if (meta && (meta.error === true || meta.statusCode >= 500)) errorCount++;
        } catch {}
      }
      const errorRate = totalRequests > 0 ? errorCount / totalRequests : 0;

      // Cache hit rate is mocked for now
      const cacheMetrics = await this.getCacheMetrics();
      const cacheHitRate = cacheMetrics.hitRate;

      // Active users in last hour
      const hourEvents = await db.query.userBehavior.findMany({
        where: gte(userBehavior.timestamp, oneHourAgo),
        columns: { userId: true },
        limit: 5000,
      } as any);
      const activeUsers = new Set(hourEvents.map((e: any) => e.userId)).size;

      const avgResponseTime = 0; // Not available without perf logs; report 0 in dev

      const systemHealth = this.determineSystemHealth(
        avgResponseTime,
        cacheHitRate,
        errorRate,
        throughput
      );

      return {
        timestamp: now,
        avgResponseTime,
        cacheHitRate,
        errorRate,
        throughput,
        activeUsers,
        systemHealth,
      };

    } catch (error) {
      console.error('Error getting performance snapshot:', error);
      return {
        timestamp: now,
        avgResponseTime: 0,
        cacheHitRate: 0,
        errorRate: 1,
        throughput: 0,
        activeUsers: 0,
        systemHealth: 'critical',
      };
    }
  }

  /**
   * Get cache metrics from the system
   */
  private static async getCacheMetrics(): Promise<{ hitRate: number; totalRequests: number }> {
    // This would integrate with AdvancedPersonalization metrics
    // For now, return mock data
    return {
      hitRate: 0.75, // 75% cache hit rate
      totalRequests: 1000
    };
  }

  /**
   * Determine overall system health
   */
  private static determineSystemHealth(
    avgResponseTime: number,
    cacheHitRate: number,
    errorRate: number,
    throughput: number
  ): 'healthy' | 'warning' | 'critical' {
    
    // Critical conditions
    if (errorRate > 0.1 || avgResponseTime > 1000) {
      return 'critical';
    }

    // Warning conditions
    if (errorRate > 0.05 || avgResponseTime > 500 || cacheHitRate < 0.5) {
      return 'warning';
    }

    return 'healthy';
  }

  /**
   * Check all alert rules and trigger alerts
   */
  static async checkAlerts(): Promise<void> {
    console.log('🚨 Checking alert rules...');

    const snapshot = await this.getPerformanceSnapshot();
    
    for (const rule of this.ALERT_RULES) {
      if (!rule.enabled) continue;

      const shouldAlert = await this.evaluateAlertRule(rule, snapshot);
      
      if (shouldAlert) {
        await this.triggerAlert(rule, snapshot);
      }
    }
  }

  /**
   * Evaluate a single alert rule
   */
  private static async evaluateAlertRule(
    rule: AlertRule, 
    snapshot: PerformanceSnapshot
  ): Promise<boolean> {
    
    let metricValue: number;

    // Map rule metric to snapshot value
    switch (rule.metric) {
      case 'avg_response_time':
        metricValue = snapshot.avgResponseTime;
        break;
      case 'cache_hit_rate':
        metricValue = snapshot.cacheHitRate;
        break;
      case 'error_rate':
        metricValue = snapshot.errorRate;
        break;
      case 'throughput':
        metricValue = snapshot.throughput;
        break;
      default:
        console.warn(`Unknown metric: ${rule.metric}`);
        return false;
    }

    // Evaluate condition
    switch (rule.operator) {
      case 'gt':
        return metricValue > rule.threshold;
      case 'lt':
        return metricValue < rule.threshold;
      case 'eq':
        return metricValue === rule.threshold;
      default:
        return false;
    }
  }

  /**
   * Trigger an alert
   */
  private static async triggerAlert(rule: AlertRule, snapshot: PerformanceSnapshot): Promise<void> {
    const alert = {
      rule: rule.name,
      severity: rule.severity,
      timestamp: snapshot.timestamp,
      snapshot,
      message: this.generateAlertMessage(rule, snapshot)
    };

    console.error(`🚨 ALERT [${rule.severity.toUpperCase()}]: ${alert.message}`);

    // Store alert in database
    await this.storeAlert(alert);

    // Send notifications based on severity
    await this.sendNotification(alert);
  }

  /**
   * Generate human-readable alert message
   */
  private static generateAlertMessage(rule: AlertRule, snapshot: PerformanceSnapshot): string {
    switch (rule.metric) {
      case 'avg_response_time':
        return `Average response time (${snapshot.avgResponseTime.toFixed(2)}ms) exceeds threshold (${rule.threshold}ms)`;
      case 'cache_hit_rate':
        return `Cache hit rate (${(snapshot.cacheHitRate * 100).toFixed(1)}%) below threshold (${(rule.threshold * 100).toFixed(1)}%)`;
      case 'error_rate':
        return `Error rate (${(snapshot.errorRate * 100).toFixed(1)}%) exceeds threshold (${(rule.threshold * 100).toFixed(1)}%)`;
      case 'throughput':
        return `Throughput (${snapshot.throughput.toFixed(1)} req/min) below threshold (${rule.threshold} req/min)`;
      default:
        return `Alert triggered for ${rule.name}`;
    }
  }

  /**
   * Store alert in database for tracking
   */
  private static async storeAlert(alert: any): Promise<void> {
    try {
      // In dev, recommendation_performance_logs may not exist. Store as a user_behavior event.
      await db.insert(userBehavior as any).values({
        userId: 'system',
        actionType: 'alert_triggered',
        targetType: 'monitoring',
        metadata: JSON.stringify(alert),
        timestamp: new Date(),
      } as any);
    } catch (e) {
      console.warn('storeAlert fallback failed:', e);
    }
  }

  /**
   * Send notifications based on alert severity
   */
  private static async sendNotification(alert: any): Promise<void> {
    // Implementation depends on your notification system
    // Examples: Slack, email, PagerDuty, Discord, etc.
    
    switch (alert.severity) {
      case 'critical':
        // Send immediate notification to on-call engineer
        await this.sendSlackAlert(alert, '#alerts-critical');
        await this.sendPagerDutyAlert(alert);
        break;
        
      case 'high':
        // Send notification to team channel
        await this.sendSlackAlert(alert, '#alerts-high');
        break;
        
      case 'medium':
        // Send to monitoring channel
        await this.sendSlackAlert(alert, '#monitoring');
        break;
        
      case 'low':
        // Log only
        console.log(`📊 Low severity alert: ${alert.message}`);
        break;
    }
  }

  /**
   * Send Slack alert (mock implementation)
   */
  private static async sendSlackAlert(alert: any, channel: string): Promise<void> {
    // Mock implementation - replace with actual Slack integration
    console.log(`💬 [SLACK ${channel}] ${alert.rule}: ${alert.message}`);
    
    // Example Slack webhook call:
    // await fetch(process.env.SLACK_WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     channel,
    //     text: `🚨 ${alert.rule}`,
    //     attachments: [{
    //       color: alert.severity === 'critical' ? 'danger' : 'warning',
    //       fields: [{
    //         title: 'Alert Details',
    //         value: alert.message,
    //         short: false
    //       }]
    //     }]
    //   })
    // });
  }

  /**
   * Send PagerDuty alert (mock implementation)
   */
  private static async sendPagerDutyAlert(alert: any): Promise<void> {
    // Mock implementation - replace with actual PagerDuty integration
    console.log(`📟 [PAGERDUTY] Critical alert: ${alert.message}`);
  }

  /**
   * Generate monitoring dashboard data
   */
  static async getDashboardData(): Promise<any> {
    const snapshot = await this.getPerformanceSnapshot();
    
    // Get historical data for charts
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    // Fallback historical: bucket user_behavior per hour count
    const events = await db.query.userBehavior.findMany({
      where: gte(userBehavior.timestamp, last24Hours),
      columns: { timestamp: true },
      limit: 10000,
    } as any);
    const buckets = new Map<string, { hour: string; avg_response_time: number; request_count: number }>();
    for (const ev of events) {
      const d = new Date((ev as any).timestamp);
      const hourKey = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()).toISOString();
      const bucket = buckets.get(hourKey) || { hour: hourKey, avg_response_time: 0, request_count: 0 };
      bucket.request_count++;
      buckets.set(hourKey, bucket);
    }
    const historicalPerformance = Array.from(buckets.values()).sort((a, b) => a.hour.localeCompare(b.hour));

    return {
      currentSnapshot: snapshot,
      historicalPerformance,
      systemStatus: snapshot.systemHealth,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Health check endpoint for load balancers
   */
  static async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const snapshot = await this.getPerformanceSnapshot();
      
      return {
        status: snapshot.systemHealth === 'critical' ? 'unhealthy' : 'healthy',
        details: {
          systemHealth: snapshot.systemHealth,
          avgResponseTime: snapshot.avgResponseTime,
          errorRate: snapshot.errorRate,
          timestamp: snapshot.timestamp
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: 'Health check failed',
          timestamp: new Date()
        }
      };
    }
  }

}

/**
 * CLI interface for monitoring
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const command = process.argv[2] || 'status';
    switch (command) {
      case 'status': {
        const snapshot = await PersonalizationMonitoring.getPerformanceSnapshot();
        console.log('📊 Current Status:', snapshot);
        break;
      }
      case 'alerts': {
        await PersonalizationMonitoring.checkAlerts();
        break;
      }
      case 'health': {
        const health = await PersonalizationMonitoring.healthCheck();
        console.log('🏥 Health Check:', health);
        process.exit(health.status === 'healthy' ? 0 : 1);
        break;
      }
      case 'dashboard': {
        const dashboard = await PersonalizationMonitoring.getDashboardData();
        console.log('📈 Dashboard Data:', JSON.stringify(dashboard, null, 2));
        break;
      }
      default: {
        console.error('Usage: node monitoring.js [status|alerts|health|dashboard]');
        process.exit(1);
      }
    }
  })().catch((e) => {
    console.error('Monitoring CLI error:', e);
    process.exit(1);
  });
}

export default PersonalizationMonitoring;
