# 🎯 BingeBoard Recommendation Engine - Advanced Architecture & Enhancements

## 🧠 Algorithm Architecture Deep Dive

### Candidate Generation Pipeline

The recommendation engine uses a sophisticated multi-stage candidate generation process:

```typescript
interface CandidateGeneration {
  // Stage 1: Content Pool Assembly
  recentWatches: {
    source: 'user_watch_history',
    lookbackDays: 90,
    maxItems: 100,
    weightDecay: 'exponential' // Recent items weighted higher
  };
  
  // Stage 2: Semantic Expansion
  contentEmbeddings: {
    source: 'content_embeddings',
    similarityThreshold: 0.7,
    maxPerSource: 20,
    models: ['sentence-transformers', 'tmdb-vectors']
  };
  
  // Stage 3: Trending Integration
  trendingBoost: {
    source: 'trending_cache',
    timeWindows: ['1h', '24h', '7d'],
    personalizedFiltering: true,
    maxContribution: 0.3 // Max 30% from trending
  };
  
  // Stage 4: Social Signals
  socialActivity: {
    source: 'social_signals',
    friendNetworkDepth: 2, // Friends of friends
    activityTypes: ['watch_complete', 'rated_high', 'added_to_watchlist'],
    recencyWeight: 'linear_decay_14d'
  };
}
```

### Score Combination & Normalization

```typescript
interface ScoreCombination {
  algorithmWeights: {
    contentBased: 0.35,    // Stable baseline
    collaborative: 0.25,   // User similarity
    social: 0.20,         // Friend network
    trending: 0.15,       // Platform popularity
    temporal: 0.05        // Time-based boosts
  };
  
  normalization: {
    method: 'min_max_scaling', // Normalize to 0-1 range
    outlierClipping: 0.95,     // Cap extreme scores
    smoothing: 'sigmoid'       // Smooth score distribution
  };
  
  finalRanking: {
    diversityPenalty: 0.1,     // Reduce similar content clustering
    availabilityBoost: 0.2,    // Prefer user's platforms
    freshnessFactor: 0.15      // Balance familiar vs new
  };
}
```

### Cold Start Handling

```typescript
interface ColdStartStrategy {
  newUsers: {
    onboardingPreferences: 'weight_high',  // Trust explicit preferences
    popularityFallback: 'trending_by_genre',
    socialBootstrap: 'friend_recommendations',
    contentVariety: 'max_diversity_first_20'
  };
  
  newContent: {
    metadataBasedScoring: true,           // Use genre, cast, keywords
    similarContentLookup: 'tmdb_api',     // Find similar via TMDB
    trendingBoost: 'early_adopter_bonus', // Boost for early engagement
    platformAvailability: 'prefer_major_platforms'
  };
}
```

## 📊 Enhanced Observability & Metrics

<function_calls>
<invoke name="create_file">
<parameter name="content">/**
 * 🎯 BingeBoard Recommendation Engine - Advanced Observability
 * 
 * Comprehensive metrics, monitoring, and A/B testing infrastructure
 */

import { db } from '../db.js';
import { userBehavior } from '../../shared/schema.js';

export class RecommendationObservability {
  private static metrics = new Map<string, any>();
  private static performanceTimers = new Map<string, number>();

  // === Performance Metrics ===

  static startTimer(operation: string): string {
    const timerId = `${operation}_${Date.now()}_${Math.random()}`;
    this.performanceTimers.set(timerId, Date.now());
    return timerId;
  }

  static endTimer(timerId: string): number {
    const startTime = this.performanceTimers.get(timerId);
    if (!startTime) return 0;
    
    const duration = Date.now() - startTime;
    this.performanceTimers.delete(timerId);
    return duration;
  }

  static async logRecommendationRequest(metrics: {
    userId: string;
    requestType: string;
    processingTime: number;
    candidateCount: number;
    algorithmBreakdown: Record<string, number>;
    cacheHit: boolean;
    streamingEnrichmentTime?: number;
  }) {
    try {
      await db.insert(userBehavior).values({
        userId: metrics.userId,
        actionType: 'recommendation_request_metrics',
        timestamp: new Date(),
        metadata: JSON.stringify({
          requestType: metrics.requestType,
          performance: {
            processingTimeMs: metrics.processingTime,
            candidateCount: metrics.candidateCount,
            cacheHit: metrics.cacheHit,
            streamingEnrichmentMs: metrics.streamingEnrichmentTime || 0
          },
          algorithms: metrics.algorithmBreakdown
        })
      });

      // Update in-memory metrics for real-time monitoring
      this.updateMetrics('recommendation_requests', {
        total: 1,
        avgProcessingTime: metrics.processingTime,
        cacheHitRate: metrics.cacheHit ? 1 : 0
      });

    } catch (error) {
      console.error('Failed to log recommendation metrics:', error);
    }
  }

  // === Cache Hit/Miss Tracking ===

  static async trackCachePerformance(cacheKey: string, hit: boolean, generationTime?: number) {
    const cacheMetrics = this.metrics.get('cache_performance') || {
      hits: 0,
      misses: 0,
      avgGenerationTime: 0
    };

    if (hit) {
      cacheMetrics.hits++;
    } else {
      cacheMetrics.misses++;
      if (generationTime) {
        cacheMetrics.avgGenerationTime = 
          (cacheMetrics.avgGenerationTime + generationTime) / 2;
      }
    }

    this.metrics.set('cache_performance', cacheMetrics);
  }

  // === A/B Testing Dashboard ===

  static async getExperimentPerformance(experimentName: string, timeRange: '1d' | '7d' | '30d' = '7d') {
    const daysBack = timeRange === '1d' ? 1 : timeRange === '7d' ? 7 : 30;
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    try {
      // Get experiment participants and their outcomes
      const experimentResults = await db.query.userBehavior.findMany({
        where: (behavior, { and, gte, like }) => and(
          gte(behavior.timestamp, startDate),
          like(behavior.metadata, `%${experimentName}%`)
        ),
        limit: 10000
      });

      const variantMetrics = new Map<string, {
        users: number;
        clickThroughRate: number;
        conversionRate: number;
        avgEngagementTime: number;
      }>();

      for (const result of experimentResults) {
        const metadata = JSON.parse(result.metadata || '{}');
        const variant = metadata.experimentVariant || 'control';
        
        if (!variantMetrics.has(variant)) {
          variantMetrics.set(variant, {
            users: 0,
            clickThroughRate: 0,
            conversionRate: 0,
            avgEngagementTime: 0
          });
        }

        const metrics = variantMetrics.get(variant)!;
        metrics.users++;
        
        // Calculate performance metrics based on action type
        if (result.actionType === 'recommendation_click') {
          metrics.clickThroughRate++;
        } else if (result.actionType === 'add_to_watchlist') {
          metrics.conversionRate++;
        }
      }

      // Normalize rates
      variantMetrics.forEach((metrics, variant) => {
        if (metrics.users > 0) {
          metrics.clickThroughRate = metrics.clickThroughRate / metrics.users;
          metrics.conversionRate = metrics.conversionRate / metrics.users;
        }
      });

      return {
        experiment: experimentName,
        timeRange,
        variants: Object.fromEntries(variantMetrics),
        totalParticipants: experimentResults.length,
        significance: this.calculateStatisticalSignificance(variantMetrics)
      };

    } catch (error) {
      console.error('Failed to get experiment performance:', error);
      return null;
    }
  }

  // === Real-Time Dashboard Metrics ===

  static async getDashboardMetrics(timeRange: '1h' | '24h' | '7d' = '24h') {
    const hoursBack = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168;
    const startDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    try {
      const recentMetrics = await db.query.userBehavior.findMany({
        where: (behavior, { and, gte, inArray }) => and(
          gte(behavior.timestamp, startDate),
          inArray(behavior.actionType, [
            'recommendation_request_metrics',
            'recommendation_click',
            'recommendation_feedback',
            'add_to_watchlist'
          ])
        ),
        limit: 50000
      });

      const dashboard = {
        overview: {
          totalRequests: 0,
          avgResponseTime: 0,
          cacheHitRate: 0,
          uniqueUsers: new Set<string>()
        },
        algorithms: {
          contentBased: { requests: 0, avgScore: 0 },
          collaborative: { requests: 0, avgScore: 0 },
          social: { requests: 0, avgScore: 0 },
          trending: { requests: 0, avgScore: 0 }
        },
        engagement: {
          clickThroughRate: 0,
          conversionRate: 0,
          feedbackRate: 0
        },
        errors: {
          total: 0,
          byType: {} as Record<string, number>
        }
      };

      let totalResponseTime = 0;
      let cacheHits = 0;
      let clicks = 0;
      let conversions = 0;
      let feedbacks = 0;

      for (const metric of recentMetrics) {
        dashboard.overview.uniqueUsers.add(metric.userId);
        
        const metadata = JSON.parse(metric.metadata || '{}');

        if (metric.actionType === 'recommendation_request_metrics') {
          dashboard.overview.totalRequests++;
          totalResponseTime += metadata.performance?.processingTimeMs || 0;
          if (metadata.performance?.cacheHit) cacheHits++;

          // Algorithm breakdown
          Object.entries(metadata.algorithms || {}).forEach(([algo, score]) => {
            if (dashboard.algorithms[algo as keyof typeof dashboard.algorithms]) {
              dashboard.algorithms[algo as keyof typeof dashboard.algorithms].requests++;
              dashboard.algorithms[algo as keyof typeof dashboard.algorithms].avgScore += score as number;
            }
          });
        } else if (metric.actionType === 'recommendation_click') {
          clicks++;
        } else if (metric.actionType === 'add_to_watchlist') {
          conversions++;
        } else if (metric.actionType === 'recommendation_feedback') {
          feedbacks++;
        }
      }

      // Calculate rates
      dashboard.overview.avgResponseTime = totalResponseTime / Math.max(dashboard.overview.totalRequests, 1);
      dashboard.overview.cacheHitRate = cacheHits / Math.max(dashboard.overview.totalRequests, 1);
      dashboard.engagement.clickThroughRate = clicks / Math.max(dashboard.overview.totalRequests, 1);
      dashboard.engagement.conversionRate = conversions / Math.max(dashboard.overview.totalRequests, 1);
      dashboard.engagement.feedbackRate = feedbacks / Math.max(dashboard.overview.totalRequests, 1);

      // Average algorithm scores
      Object.keys(dashboard.algorithms).forEach(algo => {
        const algoData = dashboard.algorithms[algo as keyof typeof dashboard.algorithms];
        if (algoData.requests > 0) {
          algoData.avgScore = algoData.avgScore / algoData.requests;
        }
      });

      return {
        ...dashboard,
        overview: {
          ...dashboard.overview,
          uniqueUsers: dashboard.overview.uniqueUsers.size
        },
        timeRange,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Failed to generate dashboard metrics:', error);
      return null;
    }
  }

  // === Helper Methods ===

  static updateMetrics(key: string, values: Record<string, number>) {
    const existing = this.metrics.get(key) || {};
    Object.entries(values).forEach(([metric, value]) => {
      existing[metric] = (existing[metric] || 0) + value;
    });
    this.metrics.set(key, existing);
  }

  static calculateStatisticalSignificance(variants: Map<string, any>): string {
    // Simplified significance calculation
    const variantArray = Array.from(variants.values());
    if (variantArray.length < 2) return 'insufficient_data';
    
    const controlMetrics = variantArray[0];
    const testMetrics = variantArray[1];
    
    if (controlMetrics.users < 100 || testMetrics.users < 100) {
      return 'insufficient_sample_size';
    }
    
    const conversionDiff = Math.abs(testMetrics.conversionRate - controlMetrics.conversionRate);
    const pooledRate = (testMetrics.conversionRate + controlMetrics.conversionRate) / 2;
    
    // Simplified z-test approximation
    const standardError = Math.sqrt(pooledRate * (1 - pooledRate) * (1/controlMetrics.users + 1/testMetrics.users));
    const zScore = conversionDiff / standardError;
    
    if (zScore > 1.96) return 'significant_95%';
    if (zScore > 1.64) return 'significant_90%';
    return 'not_significant';
  }
}

export default RecommendationObservability;
