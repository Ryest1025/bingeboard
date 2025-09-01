/**
 * 🔧 BingeBoard Recommendation Engine - Production Configuration
 * Environment-specific settings and feature flags
 */

export interface RecommendationConfig {
  performance: {
    cacheTimeout: number;
    batchSize: number;
    performanceThreshold: number;
    maxRecommendations: number;
    enableDetailedLogging: boolean;
  };
  algorithms: {
    enableAdvancedPersonalization: boolean;
    enableSeasonalBoosts: boolean;
    enableDeviceOptimization: boolean;
    enableContextualRecommendations: boolean;
    enableABTesting: boolean;
  };
  scoring: {
    deviceBoostCap: number;
    seasonalBoostCap: number;
    contextualBoostCap: number;
    scoreNormalization: boolean;
  };
  monitoring: {
    enablePerformanceTracking: boolean;
    enableAnomalyDetection: boolean;
    alertThresholds: {
      ctrThreshold: number;
      scoreThreshold: number;
      errorThreshold: number;
      responseTimeThreshold: number;
    };
    latencyPercentiles: {
      p95: number;
      p99: number;
    };
  };
  database: {
    enablePreAggregation: boolean;
    preAggregationInterval: number;
    enableBatchProcessing: boolean;
    connectionPoolSize: number;
  };
}

const baseConfig: RecommendationConfig = {
  performance: {
    cacheTimeout: 3600000, // 1 hour
    batchSize: 100,
    performanceThreshold: 500, // 500ms
    maxRecommendations: 1000,
    enableDetailedLogging: false
  },
  algorithms: {
    enableAdvancedPersonalization: true,
    enableSeasonalBoosts: true,
    enableDeviceOptimization: true,
    enableContextualRecommendations: true,
    enableABTesting: false
  },
  scoring: {
    deviceBoostCap: 0.5,
    seasonalBoostCap: 0.4,
    contextualBoostCap: 0.3,
    scoreNormalization: true
  },
  monitoring: {
    enablePerformanceTracking: true,
    enableAnomalyDetection: true,
    alertThresholds: {
      ctrThreshold: 0.05, // 5%
      scoreThreshold: 0.3,
      errorThreshold: 10,
      responseTimeThreshold: 1000 // 1 second
    },
    latencyPercentiles: {
      p95: 0,
      p99: 0
    }
  },
  database: {
    enablePreAggregation: false,
    preAggregationInterval: 86400000, // 24 hours
    enableBatchProcessing: true,
    connectionPoolSize: 10
  }
};

export const recommendationConfig: Record<string, RecommendationConfig> = {
  development: {
    ...baseConfig,
    performance: {
      ...baseConfig.performance,
      cacheTimeout: 300000, // 5 minutes for faster testing
      batchSize: 10,
      performanceThreshold: 2000, // More lenient in dev
      enableDetailedLogging: true
    },
    algorithms: {
      ...baseConfig.algorithms,
      enableABTesting: true // Enable A/B testing in dev
    },
    monitoring: {
      ...baseConfig.monitoring,
      alertThresholds: {
        ...baseConfig.monitoring.alertThresholds,
        errorThreshold: 5, // Lower threshold in dev
        responseTimeThreshold: 2000
      }
    }
  },

  staging: {
    ...baseConfig,
    performance: {
      ...baseConfig.performance,
      cacheTimeout: 1800000, // 30 minutes
      batchSize: 50,
      performanceThreshold: 750,
      enableDetailedLogging: true
    },
    algorithms: {
      ...baseConfig.algorithms,
      enableABTesting: true
    },
    database: {
      ...baseConfig.database,
      enablePreAggregation: true,
      connectionPoolSize: 15
    }
  },

  production: {
    ...baseConfig,
    performance: {
      ...baseConfig.performance,
      cacheTimeout: 3600000, // 1 hour
      batchSize: 100,
      performanceThreshold: 500,
      enableDetailedLogging: false
    },
    algorithms: {
      ...baseConfig.algorithms,
      enableABTesting: process.env.ENABLE_AB_TESTING === 'true'
    },
    monitoring: {
      ...baseConfig.monitoring,
      enableAnomalyDetection: true,
      alertThresholds: {
        ctrThreshold: 0.05,
        scoreThreshold: 0.3,
        errorThreshold: 20, // Higher threshold for production
        responseTimeThreshold: 500
      }
    },
    database: {
      ...baseConfig.database,
      enablePreAggregation: true,
      preAggregationInterval: 86400000, // Daily in production
      connectionPoolSize: 25
    }
  }
};

/**
 * Get current environment configuration
 */
export function getCurrentConfig(): RecommendationConfig {
  const env = process.env.NODE_ENV || 'development';
  return recommendationConfig[env] || recommendationConfig.development;
}

/**
 * Feature flag helpers
 */
export class FeatureFlags {
  /** Always get the latest config (handles env var changes at runtime) */
  static get config() {
    return getCurrentConfig();
  }

  /** Optionally force refresh (noop, but can be extended for caching) */
  static refresh() {/* no-op, kept for API symmetry */}

  static isAdvancedPersonalizationEnabled(): boolean {
    return FeatureFlags.config.algorithms.enableAdvancedPersonalization &&
      process.env.ENABLE_ADVANCED_PERSONALIZATION !== 'false';
  }
  static isSeasonalBoostsEnabled(): boolean {
    return FeatureFlags.config.algorithms.enableSeasonalBoosts &&
      process.env.ENABLE_SEASONAL_BOOSTS !== 'false';
  }
  static isDeviceOptimizationEnabled(): boolean {
    return FeatureFlags.config.algorithms.enableDeviceOptimization &&
      process.env.ENABLE_DEVICE_OPTIMIZATION !== 'false';
  }
  static isContextualRecommendationsEnabled(): boolean {
    return FeatureFlags.config.algorithms.enableContextualRecommendations &&
      process.env.ENABLE_CONTEXTUAL_RECOMMENDATIONS !== 'false';
  }
  static isABTestingEnabled(): boolean {
    return FeatureFlags.config.algorithms.enableABTesting &&
      process.env.ENABLE_AB_TESTING === 'true';
  }
  static isPerformanceTrackingEnabled(): boolean {
    return FeatureFlags.config.monitoring.enablePerformanceTracking &&
      process.env.ENABLE_PERFORMANCE_TRACKING !== 'false';
  }
  static isAnomalyDetectionEnabled(): boolean {
    return FeatureFlags.config.monitoring.enableAnomalyDetection &&
      process.env.ENABLE_ANOMALY_DETECTION !== 'false';
  }
  static isPreAggregationEnabled(): boolean {
    return FeatureFlags.config.database.enablePreAggregation &&
      process.env.ENABLE_PRE_AGGREGATION !== 'false';
  }
}

/**
 * Runtime configuration validation
 */
export function validateConfiguration(): { valid: boolean; errors: string[] } {
  const config = getCurrentConfig();
  const errors: string[] = [];

  // Validate performance settings
  if (config.performance.cacheTimeout < 60000) {
    errors.push('Cache timeout should be at least 1 minute');
  }
  if (config.performance.batchSize < 1 || config.performance.batchSize > 1000) {
    errors.push('Batch size should be between 1 and 1000');
  }
  if (config.performance.performanceThreshold < 100) {
    errors.push('Performance threshold should be at least 100ms');
  }
  if (config.performance.maxRecommendations < 1 || config.performance.maxRecommendations > 5000) {
    errors.push('Max recommendations should be between 1 and 5000');
  }

  // Validate scoring caps
  if (config.scoring.deviceBoostCap > 1.0 || config.scoring.deviceBoostCap < 0) {
    errors.push('Device boost cap should be between 0 and 1');
  }
  if (config.scoring.seasonalBoostCap > 1.0 || config.scoring.seasonalBoostCap < 0) {
    errors.push('Seasonal boost cap should be between 0 and 1');
  }
  if (config.scoring.contextualBoostCap > 1.0 || config.scoring.contextualBoostCap < 0) {
    errors.push('Contextual boost cap should be between 0 and 1');
  }

  // Validate monitoring thresholds
  if (config.monitoring.alertThresholds.ctrThreshold < 0 || config.monitoring.alertThresholds.ctrThreshold > 1) {
    errors.push('CTR threshold should be between 0 and 1');
  }

  // Validate database settings
  if (config.database.connectionPoolSize < 1) {
    errors.push('Connection pool size should be at least 1');
  }
  if (config.database.preAggregationInterval < 60000) {
    errors.push('Pre-aggregation interval should be at least 1 minute');
  }

  // Validate monitoring percentiles if present
  if (config.monitoring && (config.monitoring as any).latencyPercentiles) {
    const percentiles = (config.monitoring as any).latencyPercentiles;
    if (percentiles.p95 < 0) errors.push('p95 latency percentile must be >= 0');
    if (percentiles.p99 < 0) errors.push('p99 latency percentile must be >= 0');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Environment-specific logging
 */
export function logConfiguration(verbose = false): void {
  const config = getCurrentConfig();
  const env = process.env.NODE_ENV || 'development';

  if (verbose) {
    // Print the full config (redact sensitive fields if present)
    const redacted = { ...config };
    // Example: redact DB URLs if present in future
    // if ((redacted as any).databaseUrl) (redacted as any).databaseUrl = '[REDACTED]';
    console.log(`🔧 Recommendation Engine Configuration (${env.toUpperCase()} - VERBOSE):`, redacted);
  } else {
    // Print summary only
    console.log(`🔧 Recommendation Engine Configuration (${env.toUpperCase()}):`, {
      algorithms: {
        advancedPersonalization: FeatureFlags.isAdvancedPersonalizationEnabled(),
        seasonalBoosts: FeatureFlags.isSeasonalBoostsEnabled(),
        deviceOptimization: FeatureFlags.isDeviceOptimizationEnabled(),
        contextualRecommendations: FeatureFlags.isContextualRecommendationsEnabled(),
        abTesting: FeatureFlags.isABTestingEnabled()
      },
      performance: {
        cacheTimeout: `${config.performance.cacheTimeout / 1000}s`,
        batchSize: config.performance.batchSize,
        threshold: `${config.performance.performanceThreshold}ms`,
        detailedLogging: config.performance.enableDetailedLogging
      },
      monitoring: {
        performanceTracking: FeatureFlags.isPerformanceTrackingEnabled(),
        anomalyDetection: FeatureFlags.isAnomalyDetectionEnabled(),
        ctrThreshold: `${(config.monitoring.alertThresholds.ctrThreshold * 100).toFixed(1)}%`,
        latencyPercentiles: config.monitoring.latencyPercentiles
      },
      database: {
        preAggregation: FeatureFlags.isPreAggregationEnabled(),
        batchProcessing: config.database.enableBatchProcessing,
        poolSize: config.database.connectionPoolSize
      }
    });
  }

  // Validate configuration
  const validation = validateConfiguration();
  if (!validation.valid) {
    console.error('❌ Configuration validation failed:', validation.errors);
  } else {
    console.log('✅ Configuration validation passed');
  }
}

export default getCurrentConfig;
