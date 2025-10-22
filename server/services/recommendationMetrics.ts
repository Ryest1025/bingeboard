/**
 * Recommendation Metrics & A/B Testing Framework
 * 
 * Measures effectiveness of AI recommendations and enables continuous improvement
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';

export interface RecommendationEvent {
  userId: string;
  recommendationId: string;
  tmdbId: number;
  source: 'ai' | 'tmdb' | 'friends' | 'ensemble';
  aiModel?: string;
  score: number;
  rank: number; // Position in recommendation list
  timestamp: Date;
}

export interface UserAction {
  userId: string;
  recommendationId: string;
  tmdbId: number;
  actionType: 'view' | 'add_watchlist' | 'watch' | 'rate' | 'dismiss' | 'ignore';
  actionValue?: number; // e.g., rating value
  timeToAction?: number; // milliseconds from recommendation to action
  timestamp: Date;
}

export interface MetricsSnapshot {
  source: string;
  totalRecommendations: number;
  clickThroughRate: number; // % that were clicked
  addToWatchlistRate: number; // % added to watchlist
  watchRate: number; // % actually watched
  avgRating: number; // Average user rating
  avgTimeToAction: number; // How quickly users act
  qualityScore: number; // Composite quality metric
  diversityScore: number; // How diverse are the recommendations
  sessionSuccess: number; // % of sessions with at least one positive action
}

export class RecommendationMetrics {
  private static events: Map<string, RecommendationEvent[]> = new Map();
  private static actions: Map<string, UserAction[]> = new Map();

  /**
   * Log a recommendation shown to user
   */
  static logRecommendation(event: RecommendationEvent): void {
    const key = `${event.userId}-${event.recommendationId}`;
    const existing = this.events.get(key) || [];
    existing.push(event);
    this.events.set(key, existing);

    console.log('📊 Recommendation logged:', {
      user: event.userId.substring(0, 8),
      source: event.source,
      model: event.aiModel,
      showId: event.tmdbId,
      score: event.score.toFixed(3),
      rank: event.rank
    });
  }

  /**
   * Log user action on a recommendation
   */
  static logAction(action: UserAction): void {
    const key = `${action.userId}-${action.recommendationId}`;
    const existing = this.actions.get(key) || [];
    existing.push(action);
    this.actions.set(key, existing);

    console.log('✅ User action logged:', {
      user: action.userId.substring(0, 8),
      show: action.tmdbId,
      action: action.actionType,
      value: action.actionValue,
      time: action.timeToAction ? `${action.timeToAction}ms` : 'immediate'
    });

    // Update recommendation quality in real-time
    this.updateRecommendationQuality(action);
  }

  /**
   * Calculate metrics for a specific source
   */
  static async calculateMetrics(
    source: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<MetricsSnapshot> {
    const now = new Date();
    const start = startDate || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    const end = endDate || now;

    // Filter events and actions by source and date range
    const relevantEvents = Array.from(this.events.values())
      .flat()
      .filter(e => 
        e.source === source &&
        e.timestamp >= start &&
        e.timestamp <= end
      );

    if (relevantEvents.length === 0) {
      return this.getEmptyMetrics(source);
    }

    const eventIds = new Set(relevantEvents.map(e => `${e.userId}-${e.recommendationId}`));
    
    const relevantActions = Array.from(this.actions.values())
      .flat()
      .filter(a => eventIds.has(`${a.userId}-${a.recommendationId}`));

    // Calculate metrics
    const totalRecs = relevantEvents.length;
    const uniqueShows = new Set(relevantEvents.map(e => e.tmdbId)).size;
    
    const viewed = relevantActions.filter(a => a.actionType === 'view').length;
    const addedToWatchlist = relevantActions.filter(a => a.actionType === 'add_watchlist').length;
    const watched = relevantActions.filter(a => a.actionType === 'watch').length;
    const ratings = relevantActions.filter(a => a.actionType === 'rate');
    const dismissed = relevantActions.filter(a => a.actionType === 'dismiss').length;

    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, a) => sum + (a.actionValue || 0), 0) / ratings.length
      : 0;

    const actionsWithTime = relevantActions.filter(a => a.timeToAction);
    const avgTimeToAction = actionsWithTime.length > 0
      ? actionsWithTime.reduce((sum, a) => sum + (a.timeToAction || 0), 0) / actionsWithTime.length
      : 0;

    // Quality score: weighted combination of positive actions
    const qualityScore = this.calculateQualityScore({
      clickThroughRate: viewed / totalRecs,
      addToWatchlistRate: addedToWatchlist / totalRecs,
      watchRate: watched / totalRecs,
      avgRating: avgRating / 10, // Normalize to 0-1
      dismissRate: dismissed / totalRecs
    });

    // Diversity: unique shows / total recs
    const diversityScore = uniqueShows / totalRecs;

    // Session success: % of unique users who took at least one positive action
    const usersWithActions = new Set(
      relevantActions
        .filter(a => ['add_watchlist', 'watch', 'rate'].includes(a.actionType))
        .map(a => a.userId)
    ).size;
    const totalUsers = new Set(relevantEvents.map(e => e.userId)).size;
    const sessionSuccess = totalUsers > 0 ? usersWithActions / totalUsers : 0;

    const metrics: MetricsSnapshot = {
      source,
      totalRecommendations: totalRecs,
      clickThroughRate: viewed / totalRecs,
      addToWatchlistRate: addedToWatchlist / totalRecs,
      watchRate: watched / totalRecs,
      avgRating,
      avgTimeToAction,
      qualityScore,
      diversityScore,
      sessionSuccess
    };

    console.log('📊 Metrics calculated for', source, ':', {
      totalRecs,
      CTR: `${(metrics.clickThroughRate * 100).toFixed(1)}%`,
      watchlistRate: `${(metrics.addToWatchlistRate * 100).toFixed(1)}%`,
      watchRate: `${(metrics.watchRate * 100).toFixed(1)}%`,
      quality: metrics.qualityScore.toFixed(3),
      diversity: metrics.diversityScore.toFixed(3),
      sessionSuccess: `${(sessionSuccess * 100).toFixed(1)}%`
    });

    return metrics;
  }

  /**
   * Compare A/B test variants
   */
  static async compareVariants(
    variantA: string,
    variantB: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    variantA: MetricsSnapshot;
    variantB: MetricsSnapshot;
    winner: string | null;
    confidence: number;
    insights: string[];
  }> {
    const [metricsA, metricsB] = await Promise.all([
      this.calculateMetrics(variantA, startDate, endDate),
      this.calculateMetrics(variantB, startDate, endDate)
    ]);

    // Determine winner based on quality score
    let winner: string | null = null;
    const diff = metricsA.qualityScore - metricsB.qualityScore;
    const relativeDiff = Math.abs(diff) / Math.max(metricsA.qualityScore, metricsB.qualityScore);

    if (relativeDiff > 0.05) { // 5% difference threshold
      winner = diff > 0 ? variantA : variantB;
    }

    // Calculate confidence (simplified - in production use proper statistical tests)
    const minSampleSize = Math.min(metricsA.totalRecommendations, metricsB.totalRecommendations);
    const confidence = Math.min(0.99, Math.max(0.5, minSampleSize / 100));

    // Generate insights
    const insights: string[] = [];

    if (metricsA.clickThroughRate > metricsB.clickThroughRate * 1.1) {
      insights.push(`${variantA} has ${((metricsA.clickThroughRate / metricsB.clickThroughRate - 1) * 100).toFixed(1)}% higher CTR`);
    } else if (metricsB.clickThroughRate > metricsA.clickThroughRate * 1.1) {
      insights.push(`${variantB} has ${((metricsB.clickThroughRate / metricsA.clickThroughRate - 1) * 100).toFixed(1)}% higher CTR`);
    }

    if (metricsA.avgRating > metricsB.avgRating + 0.5) {
      insights.push(`${variantA} recommendations get higher ratings (+${(metricsA.avgRating - metricsB.avgRating).toFixed(1)})`);
    } else if (metricsB.avgRating > metricsA.avgRating + 0.5) {
      insights.push(`${variantB} recommendations get higher ratings (+${(metricsB.avgRating - metricsA.avgRating).toFixed(1)})`);
    }

    if (metricsA.diversityScore > metricsB.diversityScore * 1.15) {
      insights.push(`${variantA} provides more diverse recommendations`);
    } else if (metricsB.diversityScore > metricsA.diversityScore * 1.15) {
      insights.push(`${variantB} provides more diverse recommendations`);
    }

    if (metricsA.sessionSuccess > metricsB.sessionSuccess + 0.1) {
      insights.push(`${variantA} has higher session success rate (+${((metricsA.sessionSuccess - metricsB.sessionSuccess) * 100).toFixed(1)}%)`);
    } else if (metricsB.sessionSuccess > metricsA.sessionSuccess + 0.1) {
      insights.push(`${variantB} has higher session success rate (+${((metricsB.sessionSuccess - metricsA.sessionSuccess) * 100).toFixed(1)}%)`);
    }

    if (insights.length === 0) {
      insights.push('Both variants perform similarly - no significant difference detected');
    }

    console.log('🔬 A/B Test Results:', {
      variantA: `${variantA} (quality: ${metricsA.qualityScore.toFixed(3)})`,
      variantB: `${variantB} (quality: ${metricsB.qualityScore.toFixed(3)})`,
      winner: winner || 'tie',
      confidence: `${(confidence * 100).toFixed(1)}%`,
      insights
    });

    return {
      variantA: metricsA,
      variantB: metricsB,
      winner,
      confidence,
      insights
    };
  }

  /**
   * Get real-time performance dashboard
   */
  static async getDashboard(timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<{
    overall: MetricsSnapshot;
    bySource: Record<string, MetricsSnapshot>;
    trending: {
      improving: string[];
      declining: string[];
    };
    recommendations: string[];
  }> {
    const ranges = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };

    const now = new Date();
    const startDate = new Date(now.getTime() - ranges[timeRange]);

    // Get metrics for all sources
    const sources = ['ai', 'tmdb', 'friends', 'ensemble'];
    const bySource: Record<string, MetricsSnapshot> = {};

    for (const source of sources) {
      bySource[source] = await this.calculateMetrics(source, startDate, now);
    }

    // Calculate overall metrics
    const overall = this.aggregateMetrics(Object.values(bySource));

    // Identify trends (compare with previous period)
    const previousStart = new Date(startDate.getTime() - ranges[timeRange]);
    const previousMetrics: Record<string, MetricsSnapshot> = {};
    
    for (const source of sources) {
      previousMetrics[source] = await this.calculateMetrics(source, previousStart, startDate);
    }

    const improving: string[] = [];
    const declining: string[] = [];

    for (const source of sources) {
      const current = bySource[source].qualityScore;
      const previous = previousMetrics[source].qualityScore;
      const change = (current - previous) / Math.max(previous, 0.01);

      if (change > 0.1) improving.push(`${source} (+${(change * 100).toFixed(1)}%)`);
      else if (change < -0.1) declining.push(`${source} (${(change * 100).toFixed(1)}%)`);
    }

    // Generate actionable recommendations
    const recommendations: string[] = [];

    // Check for underperforming sources
    const avgQuality = overall.qualityScore;
    for (const [source, metrics] of Object.entries(bySource)) {
      if (metrics.qualityScore < avgQuality * 0.8) {
        recommendations.push(`Investigate ${source} recommendations - performing below average`);
      }
    }

    // Check for low diversity
    if (overall.diversityScore < 0.6) {
      recommendations.push('Consider increasing recommendation diversity to avoid filter bubbles');
    }

    // Check for low engagement
    if (overall.clickThroughRate < 0.15) {
      recommendations.push('CTR is low - test more compelling presentation or better targeting');
    }

    // Check for high dismiss rate
    const allActions = Array.from(this.actions.values()).flat();
    const dismissRate = allActions.filter(a => a.actionType === 'dismiss').length / allActions.length;
    if (dismissRate > 0.2) {
      recommendations.push('High dismiss rate detected - recommendations may not match user preferences');
    }

    console.log('📊 Dashboard generated:', {
      timeRange,
      overall: `Quality: ${overall.qualityScore.toFixed(3)}`,
      improving: improving.length,
      declining: declining.length,
      recommendations: recommendations.length
    });

    return {
      overall,
      bySource,
      trending: { improving, declining },
      recommendations
    };
  }

  /**
   * Update recommendation quality based on user action
   */
  private static updateRecommendationQuality(action: UserAction): void {
    // Real-time learning: adjust scores based on user feedback
    const qualityUpdate = {
      'add_watchlist': +0.2,
      'watch': +0.3,
      'rate': action.actionValue ? (action.actionValue / 10) * 0.4 : +0.2,
      'dismiss': -0.3,
      'ignore': -0.1,
      'view': +0.05
    }[action.actionType] || 0;

    console.log('🎯 Quality update:', {
      action: action.actionType,
      delta: qualityUpdate.toFixed(2),
      show: action.tmdbId
    });

    // This could be used to update ML model weights in real-time
  }

  /**
   * Calculate composite quality score
   */
  private static calculateQualityScore(metrics: {
    clickThroughRate: number;
    addToWatchlistRate: number;
    watchRate: number;
    avgRating: number;
    dismissRate: number;
  }): number {
    // Weighted formula (weights sum to 1.0)
    const score = 
      metrics.clickThroughRate * 0.15 +          // Initial interest
      metrics.addToWatchlistRate * 0.25 +        // Intent to watch
      metrics.watchRate * 0.35 +                 // Actually watched
      metrics.avgRating * 0.20 +                 // User satisfaction
      (1 - metrics.dismissRate) * 0.05;          // Not dismissed

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Aggregate metrics from multiple sources
   */
  private static aggregateMetrics(metrics: MetricsSnapshot[]): MetricsSnapshot {
    if (metrics.length === 0) {
      return this.getEmptyMetrics('overall');
    }

    const totalRecs = metrics.reduce((sum, m) => sum + m.totalRecommendations, 0);

    return {
      source: 'overall',
      totalRecommendations: totalRecs,
      clickThroughRate: this.weightedAvg(metrics, 'clickThroughRate'),
      addToWatchlistRate: this.weightedAvg(metrics, 'addToWatchlistRate'),
      watchRate: this.weightedAvg(metrics, 'watchRate'),
      avgRating: this.weightedAvg(metrics, 'avgRating'),
      avgTimeToAction: this.weightedAvg(metrics, 'avgTimeToAction'),
      qualityScore: this.weightedAvg(metrics, 'qualityScore'),
      diversityScore: this.weightedAvg(metrics, 'diversityScore'),
      sessionSuccess: this.weightedAvg(metrics, 'sessionSuccess')
    };
  }

  private static weightedAvg(metrics: MetricsSnapshot[], field: keyof MetricsSnapshot): number {
    const total = metrics.reduce((sum, m) => sum + m.totalRecommendations, 0);
    if (total === 0) return 0;

    return metrics.reduce((sum, m) => {
      const value = m[field];
      const weight = m.totalRecommendations / total;
      return sum + (typeof value === 'number' ? value : 0) * weight;
    }, 0);
  }

  private static getEmptyMetrics(source: string): MetricsSnapshot {
    return {
      source,
      totalRecommendations: 0,
      clickThroughRate: 0,
      addToWatchlistRate: 0,
      watchRate: 0,
      avgRating: 0,
      avgTimeToAction: 0,
      qualityScore: 0,
      diversityScore: 0,
      sessionSuccess: 0
    };
  }

  /**
   * Export metrics for analysis
   */
  static exportData(startDate?: Date, endDate?: Date): {
    events: RecommendationEvent[];
    actions: UserAction[];
  } {
    const now = new Date();
    const start = startDate || new Date(0);
    const end = endDate || now;

    return {
      events: Array.from(this.events.values())
        .flat()
        .filter(e => e.timestamp >= start && e.timestamp <= end),
      actions: Array.from(this.actions.values())
        .flat()
        .filter(a => a.timestamp >= start && a.timestamp <= end)
    };
  }
}
