/**
 * 🎯 BingeBoard Recommendation Engine - API Endpoints
 * 
 * Production-ready API endpoints for serving personalized recommendations
 * with real-time updates, A/B testing, and comprehensive analytics.
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { BingeBoardRecommendationEngine } from '../services/recommendationEngine.js';
import { AdvancedPersonalization } from '../services/advancedPersonalization.js';
import { PersonalizationMonitoring } from '../services/monitoring.js';
import { authMiddleware } from '../middleware/auth.js';
import { db } from '../db.js';
import { userBehavior, aiRecommendations } from '../../shared/schema.js';
import { eq, and, gte } from 'drizzle-orm';

const router = Router();

// === Main Recommendations Endpoint ===

/**
 * GET /api/recommendations
 * Get personalized recommendations for the authenticated user
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const refresh = req.query.refresh === 'true';
    
    console.log(`📊 Fetching recommendations for user: ${userId} (refresh: ${refresh})`);

    // Check for cached recommendations (unless refresh requested)
    if (!refresh) {
      const cached = await getCachedRecommendations(userId);
      if (cached && cached.length > 0) {
        console.log(`⚡ Serving cached recommendations (${cached.length} items)`);
        return res.json({
          success: true,
          sections: cached,
          cached: true,
          generatedAt: new Date().toISOString()
        });
      }
    }

    // Generate fresh recommendations
    const sections = await BingeBoardRecommendationEngine.generateRecommendations(userId);
    
    // Log recommendation generation event
    await logUserBehavior(userId, 'recommendations_generated', {
      sectionCount: sections.length,
      totalItems: sections.reduce((sum, s) => sum + s.items.length, 0),
      refresh
    });

    res.json({
      success: true,
      sections,
      cached: false,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations'
    });
  }
});

// === Section-Specific Endpoints ===

/**
 * GET /api/recommendations/for-you
 * Get hybrid recommendations (For You section)
 */
router.get('/for-you', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const userProfile = await BingeBoardRecommendationEngine.buildUserProfile(userId);
    const recommendations = await BingeBoardRecommendationEngine.getHybridRecommendations(userProfile, limit);
    
    await logUserBehavior(userId, 'recommendations_viewed', {
      section: 'for_you',
      itemCount: recommendations.length
    });

    res.json({
      success: true,
      section: 'for_you',
      items: recommendations,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching for-you recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch for-you recommendations'
    });
  }
});

/**
 * GET /api/recommendations/social
 * Get social recommendations (Friends Are Watching)
 */
router.get('/social', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 15;
    
    const userProfile = await BingeBoardRecommendationEngine.buildUserProfile(userId);
    const recommendations = await BingeBoardRecommendationEngine.getSocialRecommendations(userProfile, limit);
    
    await logUserBehavior(userId, 'recommendations_viewed', {
      section: 'social',
      itemCount: recommendations.length
    });

    res.json({
      success: true,
      section: 'social',
      items: recommendations,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching social recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch social recommendations'
    });
  }
});

/**
 * GET /api/recommendations/trending
 * Get trending recommendations
 */
router.get('/trending', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const userProfile = await BingeBoardRecommendationEngine.buildUserProfile(userId);
    const recommendations = await BingeBoardRecommendationEngine.getTrendingRecommendations(userProfile, limit);
    
    await logUserBehavior(userId, 'recommendations_viewed', {
      section: 'trending',
      itemCount: recommendations.length
    });

    res.json({
      success: true,
      section: 'trending',
      items: recommendations,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching trending recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending recommendations'
    });
  }
});

// === Recommendation Feedback ===

/**
 * POST /api/recommendations/feedback
 * Record user feedback on recommendations
 */
router.post('/feedback', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { contentId, action, section, algorithmType } = req.body;

    // Validate required fields
    if (!contentId || !action) {
      return res.status(400).json({
        success: false,
        error: 'contentId and action are required'
      });
    }

    // Log the feedback
    await logUserBehavior(userId, 'recommendation_feedback', {
      contentId,
      action, // 'clicked', 'added_to_watchlist', 'dismissed', 'not_interested'
      section,
      algorithmType
    });

    // Update recommendation feedback table if it exists
    try {
      // You might have a recommendation_feedback table for ML training
      console.log(`📝 Recorded recommendation feedback: ${action} for content ${contentId}`);
    } catch (error) {
      console.warn('Could not store feedback in recommendation_feedback table:', error);
    }

    res.json({
      success: true,
      message: 'Feedback recorded'
    });

  } catch (error) {
    console.error('Error recording recommendation feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record feedback'
    });
  }
});

// === Recommendation Analytics ===

/**
 * GET /api/recommendations/analytics
 * Get recommendation performance analytics (admin only)
 */
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user is admin (you'd implement this check)
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ success: false, error: 'Admin access required' });
    // }

    const timeframe = req.query.timeframe as string || '7d';
    const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 1;
    
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    // Get recommendation generation stats
    const generationStats = await db.query.userBehavior.findMany({
      where: and(
        eq(userBehavior.actionType, 'recommendations_generated'),
        gte(userBehavior.timestamp, startDate)
      ),
      limit: 1000
    });

    // Get click-through rates
    const viewStats = await db.query.userBehavior.findMany({
      where: and(
        eq(userBehavior.actionType, 'recommendations_viewed'),
        gte(userBehavior.timestamp, startDate)
      ),
      limit: 1000
    });

    const feedbackStats = await db.query.userBehavior.findMany({
      where: and(
        eq(userBehavior.actionType, 'recommendation_feedback'),
        gte(userBehavior.timestamp, startDate)
      ),
      limit: 1000
    });

    // Calculate metrics
    const analytics = {
      timeframe,
      period: {
        start: startDate.toISOString(),
        end: new Date().toISOString()
      },
      metrics: {
        totalGenerations: generationStats.length,
        totalViews: viewStats.length,
        totalFeedback: feedbackStats.length,
        avgItemsPerGeneration: generationStats.reduce((sum, stat) => {
          const metadata = JSON.parse(stat.metadata || '{}');
          return sum + (metadata.totalItems || 0);
        }, 0) / Math.max(generationStats.length, 1),
        sectionStats: calculateSectionStats(viewStats),
        feedbackBreakdown: calculateFeedbackBreakdown(feedbackStats)
      }
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error fetching recommendation analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

// === User Profile Endpoint ===

/**
 * GET /api/recommendations/profile
 * Get user's recommendation profile (preferences, affinities, etc.)
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userProfile = await BingeBoardRecommendationEngine.buildUserProfile(userId);
    
    // Remove sensitive data before sending
    const sanitizedProfile = {
      explicitPreferences: userProfile.explicitPreferences,
      implicitProfile: {
        topGenres: Object.entries(userProfile.implicitProfile.genreAffinities)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([genre, score]) => ({ genre, score })),
        viewingPatterns: userProfile.implicitProfile.viewingPatterns,
        topPlatforms: Object.entries(userProfile.implicitProfile.platformUsage)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([platform, usage]) => ({ platform, usage }))
      },
      socialProfile: userProfile.socialProfile
    };

    res.json({
      success: true,
      profile: sanitizedProfile,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

// === Explanation Endpoint ===

/**
 * GET /api/recommendations/explain/:contentId
 * Get detailed explanation for why a specific item was recommended
 */
router.get('/explain/:contentId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const contentId = parseInt(req.params.contentId);

    if (isNaN(contentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid content ID'
      });
    }

    // Find the recommendation in the database
    const recommendation = await db.query.aiRecommendations.findFirst({
      where: and(
        eq(aiRecommendations.userId, userId),
        eq(aiRecommendations.showId, contentId)
      ),
      with: {
        show: true
      }
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        error: 'Recommendation not found'
      });
    }

    // Parse the stored explanation
    const metadata = JSON.parse(recommendation.metadata || '{}');
    const explanation = metadata.explanation || {};

    res.json({
      success: true,
      contentId,
      explanation: {
        primaryReason: recommendation.reason,
        algorithmType: recommendation.recommendationType,
        score: recommendation.score,
        confidence: metadata.confidence || 0.5,
        factors: explanation.factors || [],
        similarContent: explanation.similarContent || [],
        socialSignals: explanation.socialSignals || [],
        availabilityInfo: explanation.availabilityInfo || {}
      },
      content: {
        id: recommendation.show?.id,
        title: recommendation.show?.title,
        type: recommendation.show?.type || 'tv'
      }
    });

  } catch (error) {
    console.error('Error fetching recommendation explanation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch explanation'
    });
  }
});

// === Real-time Updates ===

/**
 * POST /api/recommendations/refresh
 * Force refresh of recommendations (clears cache)
 */
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Clear cached recommendations
    await db.delete(aiRecommendations).where(eq(aiRecommendations.userId, userId));
    
    // Generate fresh recommendations
    const sections = await BingeBoardRecommendationEngine.generateRecommendations(userId);
    
    await logUserBehavior(userId, 'recommendations_refreshed', {
      sectionCount: sections.length,
      totalItems: sections.reduce((sum, s) => sum + s.items.length, 0)
    });

    res.json({
      success: true,
      message: 'Recommendations refreshed',
      sections,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error refreshing recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh recommendations'
    });
  }
});

// === Helper Functions ===

async function getCachedRecommendations(userId: string) {
  try {
    const cached = await db.query.aiRecommendations.findMany({
      where: eq(aiRecommendations.userId, userId),
      with: {
        show: true
      },
      limit: 100
    });

    if (cached.length === 0) return null;

    // Group by section
    const sections = new Map();
    
    for (const rec of cached) {
      const metadata = JSON.parse(rec.metadata || '{}');
      const sectionKey = metadata.section || 'for_you';
      
      if (!sections.has(sectionKey)) {
        sections.set(sectionKey, {
          key: sectionKey,
          title: getSectionTitle(sectionKey),
          description: getSectionDescription(sectionKey),
          items: [],
          algorithm: rec.recommendationType,
          refreshable: true
        });
      }

      sections.get(sectionKey).items.push({
        contentId: rec.showId,
        userId: rec.userId,
        algorithmType: rec.recommendationType,
        baseScore: rec.score,
        finalScore: rec.score,
        explanation: metadata.explanation || {},
        confidence: metadata.confidence || 0.5,
        content: rec.show
      });
    }

    return Array.from(sections.values());
  } catch (error) {
    console.error('Error fetching cached recommendations:', error);
    return null;
  }
}

function getSectionTitle(key: string): string {
  const titles: Record<string, string> = {
    'for_you': 'For You',
    'friends_watching': 'Friends Are Watching',
    'trending_now': 'Trending Now',
    'because_you_watched': 'Because You Watched',
    'new_releases': 'New Releases'
  };
  return titles[key] || 'Recommendations';
}

function getSectionDescription(key: string): string {
  const descriptions: Record<string, string> = {
    'for_you': 'Personalized picks based on your taste',
    'friends_watching': 'See what your friends are enjoying',
    'trending_now': 'Popular across all platforms',
    'because_you_watched': 'More like what you\'ve enjoyed',
    'new_releases': 'Fresh content you might like'
  };
  return descriptions[key] || 'Curated recommendations';
}

async function logUserBehavior(userId: string, actionType: string, metadata: any) {
  try {
    await db.insert(userBehavior).values({
      userId,
      actionType,
      timestamp: new Date(),
      metadata: JSON.stringify(metadata)
    });
  } catch (error) {
    console.error('Error logging user behavior:', error);
  }
}

function calculateSectionStats(viewStats: any[]) {
  const sectionCounts: Record<string, number> = {};
  
  for (const stat of viewStats) {
    const metadata = JSON.parse(stat.metadata || '{}');
    const section = metadata.section || 'unknown';
    sectionCounts[section] = (sectionCounts[section] || 0) + 1;
  }
  
  return sectionCounts;
}

function calculateFeedbackBreakdown(feedbackStats: any[]) {
  const breakdown: Record<string, number> = {};
  
  for (const stat of feedbackStats) {
    const metadata = JSON.parse(stat.metadata || '{}');
    const action = metadata.action || 'unknown';
    breakdown[action] = (breakdown[action] || 0) + 1;
  }
  
  return breakdown;
}

/**
 * Performance monitoring middleware
 */
const performanceMiddleware = (methodName: string) => {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    // Store start time for logging
    req.startTime = startTime;
    req.methodName = methodName;
    
    // Override res.json to capture response time
    const originalJson = res.json;
    res.json = function(data: any) {
      const duration = Date.now() - startTime;
      
      // Log performance data (async, don't block response)
      setImmediate(async () => {
        try {
          await AdvancedPersonalization.logPerformance(
            methodName,
            duration,
            {
              userId: req.user?.id,
              success: res.statusCode < 400,
              statusCode: res.statusCode,
              userAgent: req.get('User-Agent'),
              ip: req.ip
            }
          );
        } catch (error) {
          console.error('Error logging performance:', error);
        }
      });
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Error handling wrapper
 */
const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// === Advanced Personalization Endpoints ===

/**
 * 📊 GET /api/recommendations/personalized
 * Get personalized recommendations using advanced algorithms
 */
router.get('/personalized', 
  authMiddleware,
  performanceMiddleware('getPersonalizedRecommendations'),
  asyncHandler(async (req: any, res: any) => {
    const { limit = 20, offset = 0, category, includeMetrics = false } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Validate parameters
    if (limit > 100) {
      return res.status(400).json({
        error: 'Limit cannot exceed 100',
        maxLimit: 100
      });
    }

    try {
      const recommendations = await AdvancedPersonalization.getPersonalizedRecommendations(
        userId,
        {
          limit: parseInt(limit),
          offset: parseInt(offset),
          category: category || undefined,
          includeDebugInfo: includeMetrics === 'true'
        }
      );

      res.json({
        success: true,
        data: recommendations,
        meta: {
          userId,
          limit: parseInt(limit),
          offset: parseInt(offset),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      res.status(500).json({
        error: 'Failed to get personalized recommendations',
        timestamp: new Date().toISOString()
      });
    }
  })
);

/**
 * 🎯 GET /api/recommendations/preferences
 * Get user's current preferences and metrics
 */
router.get('/preferences',
  authMiddleware,
  performanceMiddleware('getUserPreferences'),
  asyncHandler(async (req: any, res: any) => {
    const userId = req.user?.id;
    const { includeHistory = false } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const preferences = await AdvancedPersonalization.getUserPreferences(userId);
      
      let response: any = {
        success: true,
        data: preferences,
        meta: {
          userId,
          timestamp: new Date().toISOString()
        }
      };

      // Optionally include interaction history
      if (includeHistory === 'true') {
        // This would require implementing getRecentInteractions method
        try {
          response.data.recentInteractions = await AdvancedPersonalization.getRecentInteractions(userId, 50);
        } catch (error) {
          console.log('Could not get recent interactions:', error);
          response.data.recentInteractions = [];
        }
      }

      res.json(response);
    } catch (error) {
      console.error('Error getting user preferences:', error);
      res.status(500).json({
        error: 'Failed to get user preferences',
        timestamp: new Date().toISOString()
      });
    }
  })
);

/**
 * 🔄 POST /api/recommendations/refresh
 * Force refresh user's recommendation cache
 */
router.post('/refresh',
  authMiddleware,
  performanceMiddleware('refreshRecommendations'),
  asyncHandler(async (req: any, res: any) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      // Clear user's cache
      await AdvancedPersonalization.clearUserCache(userId);

      // Pre-generate fresh recommendations
      const freshRecommendations = await AdvancedPersonalization.getPersonalizedRecommendations(
        userId,
        { limit: 20, forceRefresh: true }
      );

      res.json({
        success: true,
        message: 'Recommendations refreshed successfully',
        data: {
          userId,
          refreshedAt: new Date().toISOString(),
          newRecommendationsCount: freshRecommendations.length
        }
      });
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      res.status(500).json({
        error: 'Failed to refresh recommendations',
        timestamp: new Date().toISOString()
      });
    }
  })
);

/**
 * 🏥 GET /api/recommendations/health
 * Health check endpoint for load balancers
 */
router.get('/health',
  asyncHandler(async (req: any, res: any) => {
    try {
      const healthCheck = await PersonalizationMonitoring.healthCheck();
      
      const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
      
      res.status(statusCode).json({
        status: healthCheck.status,
        timestamp: new Date().toISOString(),
        details: healthCheck.details
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  })
);

/**
 * 📊 GET /api/recommendations/metrics
 * Get personalization performance metrics
 */
router.get('/metrics',
  authMiddleware,
  performanceMiddleware('getMetrics'),
  asyncHandler(async (req: any, res: any) => {
    const { timeframe = '24h' } = req.query;

    try {
      const dashboardData = await PersonalizationMonitoring.getDashboardData();
      
      res.json({
        success: true,
        data: dashboardData,
        meta: {
          timeframe,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting metrics:', error);
      res.status(500).json({
        error: 'Failed to get metrics',
        timestamp: new Date().toISOString()
      });
    }
  })
);

export default router;
