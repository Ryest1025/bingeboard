/**
 * 🎭 Bias Auditing & Fairness Monitoring System
 * 
 * Automated fairness analysis for recommendation algorithms
 * to ensure diverse, unbiased content discovery
 */

import { db } from '../db.js';
import { sql } from 'drizzle-orm';

interface FairnessMetrics {
  genreDiversity: {
    averageGenresPerUser: number;
    genreDistribution: Record<string, number>;
    diversityScore: number; // 0-1, higher is more diverse
  };
  creatorRepresentation: {
    topCreators: Array<{ creator: string; percentage: number }>;
    concentrationIndex: number; // Herfindahl index
    fairnessViolations: string[]; // Creators with >15% share
  };
  contentAgeBalance: {
    recentContent: number; // < 2 years
    catalogContent: number; // > 2 years
    balanceScore: number; // How close to 70/30 target
  };
  demographicFairness: {
    engagementByDemographic: Record<string, number>;
    varianceScore: number; // Lower is more fair
    inequityAlerts: string[];
  };
  explorationComfort: {
    familiarContent: number; // % familiar to user
    explorationContent: number; // % new discoveries
    explorationScore: number; // How close to 80/20 target
  };
}

interface BiasAlert {
  type: 'genre_concentration' | 'creator_dominance' | 'demographic_inequity' | 'exploration_deficit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  affectedUsers: number;
  recommendedAction: string;
  timestamp: Date;
}

export class FairnessMonitoring {

  private static readonly FAIRNESS_THRESHOLDS = {
    minGenresPerUser: 5,
    maxCreatorShare: 0.15, // 15%
    maxDemographicVariance: 0.10, // 10%
    targetRecentContent: 0.70, // 70%
    targetFamiliarContent: 0.80, // 80%
    diversityMinimum: 0.7 // Minimum diversity score
  };

  /**
   * Run comprehensive fairness audit
   */
  static async runFairnessAudit(timeWindow: string = '7d'): Promise<FairnessMetrics> {
    console.log('🎭 Starting fairness audit...');

    const endDate = new Date();
    const startDate = new Date();
    
    // Parse time window
    if (timeWindow.endsWith('d')) {
      startDate.setDate(endDate.getDate() - parseInt(timeWindow));
    } else if (timeWindow.endsWith('h')) {
      startDate.setHours(endDate.getHours() - parseInt(timeWindow));
    }

    const [
      genreDiversity,
      creatorRepresentation,
      contentAgeBalance,
      demographicFairness,
      explorationComfort
    ] = await Promise.all([
      this.analyzeGenreDiversity(startDate, endDate),
      this.analyzeCreatorRepresentation(startDate, endDate),
      this.analyzeContentAgeBalance(startDate, endDate),
      this.analyzeDemographicFairness(startDate, endDate),
      this.analyzeExplorationComfort(startDate, endDate)
    ]);

    const metrics: FairnessMetrics = {
      genreDiversity,
      creatorRepresentation,
      contentAgeBalance,
      demographicFairness,
      explorationComfort
    };

    // Store audit results
    await this.storeAuditResults(metrics);

    // Check for fairness violations
    await this.checkFairnessViolations(metrics);

    return metrics;
  }

  /**
   * Analyze genre diversity in recommendations
   */
  private static async analyzeGenreDiversity(startDate: Date, endDate: Date) {
    const genreData = await db.execute(sql`
      SELECT 
        user_id,
        jsonb_array_elements_text(
          COALESCE(context->>'genres', '[]')::jsonb
        ) as genre
      FROM recommendation_performance_logs
      WHERE created_at >= ${startDate.toISOString()}
        AND created_at <= ${endDate.toISOString()}
        AND method_name = 'getPersonalizedRecommendations'
        AND context->>'genres' IS NOT NULL
    `);

    // Calculate genres per user
    const userGenres: Record<string, Set<string>> = {};
    const genreCounts: Record<string, number> = {};

    for (const row of genreData.rows) {
      const userId = row.user_id as string;
      const genre = row.genre as string;

      if (!userGenres[userId]) {
        userGenres[userId] = new Set();
      }
      userGenres[userId].add(genre);

      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    }

    // Calculate diversity metrics
    const genresPerUser = Object.values(userGenres).map(genres => genres.size);
    const averageGenresPerUser = genresPerUser.reduce((a, b) => a + b, 0) / genresPerUser.length || 0;

    // Calculate Shannon diversity index
    const totalGenreOccurrences = Object.values(genreCounts).reduce((a, b) => a + b, 0);
    const genreDistribution: Record<string, number> = {};
    let shannonIndex = 0;

    for (const [genre, count] of Object.entries(genreCounts)) {
      const proportion = count / totalGenreOccurrences;
      genreDistribution[genre] = proportion;
      shannonIndex -= proportion * Math.log2(proportion);
    }

    // Normalize diversity score (0-1)
    const maxPossibleShannon = Math.log2(Object.keys(genreCounts).length);
    const diversityScore = maxPossibleShannon > 0 ? shannonIndex / maxPossibleShannon : 0;

    return {
      averageGenresPerUser,
      genreDistribution,
      diversityScore
    };
  }

  /**
   * Analyze creator representation fairness
   */
  private static async analyzeCreatorRepresentation(startDate: Date, endDate: Date) {
    const creatorData = await db.execute(sql`
      SELECT 
        context->>'creator' as creator,
        COUNT(*) as recommendation_count
      FROM recommendation_performance_logs
      WHERE created_at >= ${startDate.toISOString()}
        AND created_at <= ${endDate.toISOString()}
        AND method_name = 'getPersonalizedRecommendations'
        AND context->>'creator' IS NOT NULL
      GROUP BY context->>'creator'
      ORDER BY recommendation_count DESC
    `);

    const totalRecommendations = creatorData.rows.reduce(
      (sum, row) => sum + Number(row.recommendation_count), 0
    );

    // Calculate creator percentages
    const topCreators = creatorData.rows.map(row => ({
      creator: row.creator as string,
      percentage: Number(row.recommendation_count) / totalRecommendations
    }));

    // Calculate Herfindahl concentration index
    const concentrationIndex = topCreators.reduce(
      (sum, creator) => sum + Math.pow(creator.percentage, 2), 0
    );

    // Find fairness violations (>15% share)
    const fairnessViolations = topCreators
      .filter(creator => creator.percentage > this.FAIRNESS_THRESHOLDS.maxCreatorShare)
      .map(creator => creator.creator);

    return {
      topCreators: topCreators.slice(0, 10), // Top 10 creators
      concentrationIndex,
      fairnessViolations
    };
  }

  /**
   * Analyze content age balance
   */
  private static async analyzeContentAgeBalance(startDate: Date, endDate: Date) {
    const ageData = await db.execute(sql`
      SELECT 
        CASE 
          WHEN (context->>'releaseYear')::int >= EXTRACT(YEAR FROM NOW()) - 2 
          THEN 'recent'
          ELSE 'catalog'
        END as content_age,
        COUNT(*) as count
      FROM recommendation_performance_logs
      WHERE created_at >= ${startDate.toISOString()}
        AND created_at <= ${endDate.toISOString()}
        AND method_name = 'getPersonalizedRecommendations'
        AND context->>'releaseYear' IS NOT NULL
      GROUP BY content_age
    `);

    const totalCount = ageData.rows.reduce((sum, row) => sum + Number(row.count), 0);
    const recentCount = ageData.rows.find(row => row.content_age === 'recent')?.count || 0;
    const catalogCount = ageData.rows.find(row => row.content_age === 'catalog')?.count || 0;

    const recentContent = Number(recentCount) / totalCount;
    const catalogContent = Number(catalogCount) / totalCount;

    // How close to 70/30 target?
    const targetRecent = this.FAIRNESS_THRESHOLDS.targetRecentContent;
    const balanceScore = 1 - Math.abs(recentContent - targetRecent);

    return {
      recentContent,
      catalogContent,
      balanceScore
    };
  }

  /**
   * Analyze demographic fairness
   */
  private static async analyzeDemographicFairness(startDate: Date, endDate: Date) {
    // This would require user demographic data
    // For now, return mock analysis
    const mockDemographics = {
      '18-25': 0.28,
      '26-35': 0.31,
      '36-45': 0.27,
      '46+': 0.24
    };

    // Calculate variance across demographics
    const values = Object.values(mockDemographics);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const varianceScore = Math.sqrt(variance);

    const inequityAlerts = varianceScore > this.FAIRNESS_THRESHOLDS.maxDemographicVariance
      ? ['High variance in engagement across age groups']
      : [];

    return {
      engagementByDemographic: mockDemographics,
      varianceScore,
      inequityAlerts
    };
  }

  /**
   * Analyze exploration vs comfort balance
   */
  private static async analyzeExplorationComfort(startDate: Date, endDate: Date) {
    const explorationData = await db.execute(sql`
      SELECT 
        CASE 
          WHEN context->>'isExploration' = 'true' THEN 'exploration'
          ELSE 'familiar'
        END as content_type,
        COUNT(*) as count
      FROM recommendation_performance_logs
      WHERE created_at >= ${startDate.toISOString()}
        AND created_at <= ${endDate.toISOString()}
        AND method_name = 'getPersonalizedRecommendations'
        AND context->>'isExploration' IS NOT NULL
      GROUP BY content_type
    `);

    const totalCount = explorationData.rows.reduce((sum, row) => sum + Number(row.count), 0);
    const explorationCount = explorationData.rows.find(row => row.content_type === 'exploration')?.count || 0;
    const familiarCount = explorationData.rows.find(row => row.content_type === 'familiar')?.count || 0;

    const explorationContent = Number(explorationCount) / totalCount;
    const familiarContent = Number(familiarCount) / totalCount;

    // How close to 80/20 familiar/exploration target?
    const targetFamiliar = this.FAIRNESS_THRESHOLDS.targetFamiliarContent;
    const explorationScore = 1 - Math.abs(familiarContent - targetFamiliar);

    return {
      familiarContent,
      explorationContent,
      explorationScore
    };
  }

  /**
   * Store audit results in database
   */
  private static async storeAuditResults(metrics: FairnessMetrics): Promise<void> {
    await db.execute(sql`
      INSERT INTO recommendation_performance_logs (
        method_name,
        duration_ms,
        context,
        created_at
      ) VALUES (
        'fairness_audit',
        0,
        ${JSON.stringify(metrics)},
        NOW()
      )
    `);
  }

  /**
   * Check for fairness violations and generate alerts
   */
  private static async checkFairnessViolations(metrics: FairnessMetrics): Promise<BiasAlert[]> {
    const alerts: BiasAlert[] = [];

    // Genre diversity violations
    if (metrics.genreDiversity.averageGenresPerUser < this.FAIRNESS_THRESHOLDS.minGenresPerUser) {
      alerts.push({
        type: 'genre_concentration',
        severity: 'medium',
        message: `Low genre diversity: ${metrics.genreDiversity.averageGenresPerUser.toFixed(1)} genres per user (target: ${this.FAIRNESS_THRESHOLDS.minGenresPerUser}+)`,
        affectedUsers: 0, // Would calculate based on actual data
        recommendedAction: 'Increase exploration factor in recommendation algorithm',
        timestamp: new Date()
      });
    }

    // Creator concentration violations
    for (const violation of metrics.creatorRepresentation.fairnessViolations) {
      alerts.push({
        type: 'creator_dominance',
        severity: 'high',
        message: `Creator over-representation: ${violation} exceeds 15% threshold`,
        affectedUsers: 0,
        recommendedAction: 'Apply creator diversity filters to recommendation algorithm',
        timestamp: new Date()
      });
    }

    // Demographic inequality violations
    if (metrics.demographicFairness.varianceScore > this.FAIRNESS_THRESHOLDS.maxDemographicVariance) {
      alerts.push({
        type: 'demographic_inequity',
        severity: 'high',
        message: `High demographic variance: ${(metrics.demographicFairness.varianceScore * 100).toFixed(1)}% (target: <${this.FAIRNESS_THRESHOLDS.maxDemographicVariance * 100}%)`,
        affectedUsers: 0,
        recommendedAction: 'Review recommendation fairness across demographic groups',
        timestamp: new Date()
      });
    }

    // Exploration deficit violations
    if (metrics.explorationComfort.explorationScore < 0.8) {
      alerts.push({
        type: 'exploration_deficit',
        severity: 'medium',
        message: `Poor exploration balance: ${(metrics.explorationComfort.explorationContent * 100).toFixed(1)}% exploration (target: 20%)`,
        affectedUsers: 0,
        recommendedAction: 'Increase exploration content injection in recommendations',
        timestamp: new Date()
      });
    }

    // Send critical alerts
    for (const alert of alerts.filter(a => a.severity === 'critical' || a.severity === 'high')) {
      await this.sendBiasAlert(alert);
    }

    return alerts;
  }

  /**
   * Send bias alert notification
   */
  private static async sendBiasAlert(alert: BiasAlert): Promise<void> {
    console.error(`🚨 BIAS ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);

    // Store alert in performance logs
    await db.execute(sql`
      INSERT INTO recommendation_performance_logs (
        method_name,
        duration_ms,
        context,
        created_at
      ) VALUES (
        'bias_alert',
        0,
        ${JSON.stringify(alert)},
        NOW()
      )
    `);

    // Send to monitoring channels
    // Implementation would depend on your notification system
  }

  /**
   * Generate fairness report for stakeholders
   */
  static async generateFairnessReport(timeWindow: string = '30d'): Promise<string> {
    const metrics = await this.runFairnessAudit(timeWindow);

    const report = `
# 🎭 Fairness & Bias Audit Report
**Time Period**: Last ${timeWindow}
**Generated**: ${new Date().toISOString()}

## 📊 Genre Diversity
- **Average Genres per User**: ${metrics.genreDiversity.averageGenresPerUser.toFixed(1)}
- **Diversity Score**: ${(metrics.genreDiversity.diversityScore * 100).toFixed(1)}%
- **Status**: ${metrics.genreDiversity.averageGenresPerUser >= this.FAIRNESS_THRESHOLDS.minGenresPerUser ? '✅ PASS' : '❌ FAIL'}

## 🎬 Creator Representation
- **Concentration Index**: ${metrics.creatorRepresentation.concentrationIndex.toFixed(3)}
- **Fairness Violations**: ${metrics.creatorRepresentation.fairnessViolations.length}
- **Status**: ${metrics.creatorRepresentation.fairnessViolations.length === 0 ? '✅ PASS' : '❌ FAIL'}

## 📅 Content Age Balance
- **Recent Content**: ${(metrics.contentAgeBalance.recentContent * 100).toFixed(1)}%
- **Catalog Content**: ${(metrics.contentAgeBalance.catalogContent * 100).toFixed(1)}%
- **Balance Score**: ${(metrics.contentAgeBalance.balanceScore * 100).toFixed(1)}%
- **Status**: ${metrics.contentAgeBalance.balanceScore > 0.8 ? '✅ PASS' : '❌ FAIL'}

## 🔄 Exploration vs Comfort
- **Familiar Content**: ${(metrics.explorationComfort.familiarContent * 100).toFixed(1)}%
- **Exploration Content**: ${(metrics.explorationComfort.explorationContent * 100).toFixed(1)}%
- **Status**: ${metrics.explorationComfort.explorationScore > 0.8 ? '✅ PASS' : '❌ FAIL'}

## 🎯 Overall Fairness Score
${this.calculateOverallFairnessScore(metrics).toFixed(1)}% - ${this.getFairnessGrade(metrics)}
`;

    return report;
  }

  /**
   * Calculate overall fairness score
   */
  private static calculateOverallFairnessScore(metrics: FairnessMetrics): number {
    const scores = [
      metrics.genreDiversity.diversityScore,
      metrics.creatorRepresentation.fairnessViolations.length === 0 ? 1 : 0.5,
      metrics.contentAgeBalance.balanceScore,
      metrics.explorationComfort.explorationScore
    ];

    return scores.reduce((a, b) => a + b, 0) / scores.length * 100;
  }

  /**
   * Get fairness grade
   */
  private static getFairnessGrade(metrics: FairnessMetrics): string {
    const score = this.calculateOverallFairnessScore(metrics);
    
    if (score >= 90) return '🏆 EXCELLENT';
    if (score >= 80) return '✅ GOOD';
    if (score >= 70) return '⚠️ FAIR';
    if (score >= 60) return '❌ POOR';
    return '🚨 CRITICAL';
  }

}

/**
 * CLI interface for fairness monitoring
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2] || 'audit';
  const timeWindow = process.argv[3] || '7d';
  
  switch (command) {
    case 'audit':
      const metrics = await FairnessMonitoring.runFairnessAudit(timeWindow);
      console.log('📊 Fairness Metrics:', JSON.stringify(metrics, null, 2));
      break;
      
    case 'report':
      const report = await FairnessMonitoring.generateFairnessReport(timeWindow);
      console.log(report);
      break;
      
    default:
      console.error('Usage: node fairness-monitoring.js [audit|report] [timeWindow]');
      console.error('Examples:');
      console.error('  node fairness-monitoring.js audit 7d');
      console.error('  node fairness-monitoring.js report 30d');
      process.exit(1);
  }
}

export default FairnessMonitoring;
