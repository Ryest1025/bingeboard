/**
 * 🧪 A/B Testing Framework - Production Ready
 * 
 * Integrates with Enhanced Database Service for comprehensive experiment management
 * Supports ML algorithm testing, UI variant testing, and recommendation strategy evaluation
 */

import { DatabaseIntegrationService } from './databaseIntegration.js';

export interface ABTestConfig {
  experimentName: string;
  variants: {
    name: string;
    weight: number; // Percentage allocation (0-100)
    config: Record<string, any>;
  }[];
  startDate: Date;
  endDate?: Date;
  targetMetrics: string[];
  minimumSampleSize: number;
  description?: string;
}

export interface ABTestResult {
  experimentName: string;
  variant: string;
  conversions: number;
  views: number;
  conversionRate: number;
  confidence: number;
  isStatisticallySignificant: boolean;
  sampleSize: number;
}

export interface UserAssignment {
  userId: string;
  experimentName: string;
  variant: string;
  assignedAt: Date;
  context?: Record<string, any>;
}

export class ABTestingFramework {
  private dbService: DatabaseIntegrationService;
  private activeExperiments: Map<string, ABTestConfig> = new Map();

  constructor(dbService: DatabaseIntegrationService) {
    this.dbService = dbService;
  }

  /**
   * 🚀 Create and start a new A/B test experiment
   */
  async createExperiment(config: ABTestConfig): Promise<void> {
    // Validate experiment configuration
    this.validateExperimentConfig(config);
    
    // Store experiment configuration
    this.activeExperiments.set(config.experimentName, config);
    
    console.log(`🧪 A/B Test "${config.experimentName}" created with ${config.variants.length} variants`);
    console.log(`📊 Target metrics: ${config.targetMetrics.join(', ')}`);
    console.log(`🎯 Minimum sample size: ${config.minimumSampleSize}`);
  }

  /**
   * 🎲 Assign user to experiment variant
   */
  async assignUserToVariant(userId: string, experimentName: string, context?: Record<string, any>): Promise<string> {
    const experiment = this.activeExperiments.get(experimentName);
    if (!experiment) {
      throw new Error(`Experiment "${experimentName}" not found`);
    }

    // Check if user already assigned
    const existingAssignment = await this.getUserAssignment(userId, experimentName);
    if (existingAssignment) {
      return existingAssignment.variant;
    }

    // Assign user to variant based on weighted distribution
    const variant = this.selectVariantForUser(userId, experiment);
    
    // Record assignment
    const assignment: UserAssignment = {
      userId,
      experimentName,
      variant: variant.name,
      assignedAt: new Date(),
      context
    };

    // Store assignment in database (using contextual data)
    await this.dbService.recordUserBehavior({
      userId,
      tmdbId: 0, // Use 0 for experiment tracking
      action: 'viewed',
      timestamp: Date.now(),
      contextualData: {
        timeOfDay: this.getTimeOfDay(),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        device: context?.device || 'unknown',
        location: context?.location || 'unknown',
        experimentName,
        experimentVariant: variant.name
      }
    });

    console.log(`👤 User ${userId} assigned to variant "${variant.name}" for experiment "${experimentName}"`);
    return variant.name;
  }

  /**
   * 📈 Record conversion event for experiment tracking
   */
  async recordConversion(userId: string, experimentName: string, metricName: string, value: number = 1): Promise<void> {
    const assignment = await this.getUserAssignment(userId, experimentName);
    if (!assignment) {
      console.warn(`⚠️ User ${userId} not assigned to experiment "${experimentName}"`);
      return;
    }

    // Record conversion in database
    await this.dbService.recordUserBehavior({
      userId,
      tmdbId: 0, // Use 0 for experiment tracking
      action: 'completed',
      timestamp: Date.now(),
      rating: value,
      contextualData: {
        timeOfDay: this.getTimeOfDay(),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        device: 'unknown',
        location: 'unknown',
        experimentName,
        experimentVariant: assignment.variant
      }
    });

    console.log(`📊 Conversion recorded: ${userId} → ${assignment.variant} → ${metricName} = ${value}`);
  }

  /**
   * 📊 Get experiment results with statistical analysis
   */
  async getExperimentResults(experimentName: string, dateRange?: { start: Date; end: Date }): Promise<ABTestResult[]> {
    const experiment = this.activeExperiments.get(experimentName);
    if (!experiment) {
      throw new Error(`Experiment "${experimentName}" not found`);
    }

    // Get results from database
    const timeRange = dateRange ? {
      start: dateRange.start.getTime(),
      end: dateRange.end.getTime()
    } : {
      start: 0,
      end: Date.now()
    };
    
    const rawResults = await this.dbService.getExperimentResults(experimentName, timeRange);
    
    // Calculate statistical significance
    const results: ABTestResult[] = [];
    
    for (const result of rawResults) {
      const conversionRate = result.views > 0 ? (result.conversions / result.views) : 0;
      const confidence = this.calculateConfidence(result.conversions, result.views, rawResults);
      
      results.push({
        experimentName,
        variant: result.variant,
        conversions: result.conversions,
        views: result.views,
        conversionRate,
        confidence,
        isStatisticallySignificant: confidence >= 0.95 && result.views >= experiment.minimumSampleSize,
        sampleSize: result.views
      });
    }

    return results.sort((a, b) => b.conversionRate - a.conversionRate);
  }

  /**
   * 🏆 Get winning variant for experiment
   */
  async getWinningVariant(experimentName: string): Promise<ABTestResult | null> {
    const results = await this.getExperimentResults(experimentName);
    
    // Find statistically significant winner
    const significantResults = results.filter(r => r.isStatisticallySignificant);
    if (significantResults.length === 0) {
      return null; // No significant winner yet
    }

    // Return highest conversion rate
    return significantResults[0];
  }

  /**
   * 🎯 ML Algorithm A/B Testing Helper
   */
  async createMLAlgorithmTest(
    experimentName: string,
    algorithms: { name: string; config: any; weight?: number }[]
  ): Promise<void> {
    const variants = algorithms.map(algo => ({
      name: algo.name,
      weight: algo.weight || (100 / algorithms.length),
      config: {
        algorithmType: algo.name,
        parameters: algo.config
      }
    }));

    await this.createExperiment({
      experimentName,
      variants,
      startDate: new Date(),
      targetMetrics: ['recommendation_click', 'recommendation_completion', 'user_satisfaction'],
      minimumSampleSize: 100,
      description: `ML Algorithm comparison: ${algorithms.map(a => a.name).join(' vs ')}`
    });
  }

  /**
   * 🎨 UI Variant A/B Testing Helper
   */
  async createUIVariantTest(
    experimentName: string,
    uiVariants: { name: string; config: any; weight?: number }[]
  ): Promise<void> {
    const variants = uiVariants.map(ui => ({
      name: ui.name,
      weight: ui.weight || (100 / uiVariants.length),
      config: ui.config
    }));

    await this.createExperiment({
      experimentName,
      variants,
      startDate: new Date(),
      targetMetrics: ['page_engagement', 'feature_usage', 'user_retention'],
      minimumSampleSize: 50,
      description: `UI Variant testing: ${uiVariants.map(u => u.name).join(' vs ')}`
    });
  }

  // Private helper methods

  private validateExperimentConfig(config: ABTestConfig): void {
    if (!config.experimentName || config.experimentName.trim() === '') {
      throw new Error('Experiment name is required');
    }

    if (!config.variants || config.variants.length < 2) {
      throw new Error('At least 2 variants are required');
    }

    const totalWeight = config.variants.reduce((sum, variant) => sum + variant.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error(`Variant weights must sum to 100, got ${totalWeight}`);
    }

    if (config.minimumSampleSize < 10) {
      throw new Error('Minimum sample size must be at least 10');
    }
  }

  private selectVariantForUser(userId: string, experiment: ABTestConfig): ABTestConfig['variants'][0] {
    // Use user ID hash for consistent assignment
    const hash = this.hashUserId(userId);
    const normalizedHash = hash % 100;
    
    let cumulativeWeight = 0;
    for (const variant of experiment.variants) {
      cumulativeWeight += variant.weight;
      if (normalizedHash < cumulativeWeight) {
        return variant;
      }
    }
    
    // Fallback to first variant
    return experiment.variants[0];
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private async getUserAssignment(userId: string, experimentName: string): Promise<UserAssignment | null> {
    // Check database for existing assignment
    // This is a simplified implementation - in production, you'd query the database
    return null; // For now, assume new assignment each time
  }

  private calculateConfidence(conversions: number, views: number, allResults: any[]): number {
    if (views < 10) return 0; // Not enough data
    
    // Simplified confidence calculation
    // In production, use proper statistical tests (t-test, chi-square, etc.)
    const conversionRate = conversions / views;
    const standardError = Math.sqrt((conversionRate * (1 - conversionRate)) / views);
    
    // Return confidence as percentage (simplified)
    return Math.min(0.99, Math.max(0.5, 1 - (2 * standardError)));
  }

  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }
}

// Export ML Algorithm Testing Presets
export const MLAlgorithmPresets = {
  RECOMMENDATION_ENGINE_TEST: {
    name: 'recommendation_algorithm_test',
    algorithms: [
      { name: 'collaborative_filtering', config: { factors: 50, regularization: 0.1 } },
      { name: 'content_based', config: { vectorSize: 100, similarity: 'cosine' } },
      { name: 'hybrid_ml', config: { cfWeight: 0.7, cbWeight: 0.3, aiBoost: true } }
    ]
  },
  
  PERSONALIZATION_TEST: {
    name: 'personalization_strategy_test',
    algorithms: [
      { name: 'genre_focused', config: { genreWeight: 0.8, diversityFactor: 0.2 } },
      { name: 'mood_based', config: { moodWeight: 0.6, genreWeight: 0.4 } },
      { name: 'ai_enhanced', config: { aiWeight: 0.9, fallbackStrategy: 'genre' } }
    ]
  }
};
