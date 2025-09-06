/**
 * BingeBoard Recommendations API (clean, deduplicated)
 * - Unified responses, zod validation, safe parsing
 * - Single authoritative /refresh
 */

import { Router } from 'express';
import { z } from 'zod';
import { BingeBoardRecommendationEngine } from '../services/recommendationEngine.js';
import * as APModule from '../services/advancedPersonalization.js';
import { PersonalizationMonitoring } from '../services/monitoring.js';
import { isAuthenticated } from '../auth.js';
import { db } from '../db.js';
import { userBehavior, aiRecommendations } from '../../shared/schema.js';
import { eq, and, gte } from 'drizzle-orm';

const router = Router();

type JsonRecord = Record<string, unknown>;

const sendOk = (res: any, data: unknown, meta: JsonRecord = {}) =>
  res.json({ success: true, data, meta });

const sendError = (res: any, status: number, message: string, meta: JsonRecord = {}) =>
  res.status(status).json({ success: false, error: message, meta });

const safeParse = <T = any>(json?: string | null, fallback: T = {} as T): T => {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
};

const asyncHandler = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const performanceMiddleware = (methodName: string) => {
  const AP: any = (APModule as any).AdvancedPersonalization || (APModule as any).default || APModule;
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    const originalJson = res.json.bind(res);

    res.json = (payload: any) => {
      const ms = Date.now() - start;
      setImmediate(async () => {
        try {
          if (typeof AP?.logPerformance === 'function') {
            await AP.logPerformance(methodName, ms, {
              userId: req.user?.id,
              success: res.statusCode < 400,
              statusCode: res.statusCode,
              userAgent: req.get('User-Agent'),
              ip: req.ip,
            });
          }
        } catch (e) {
          console.error('perf log failed:', e);
        }
      });
      return originalJson(payload);
    };

    next();
  };
};

// Schemas
const baseListQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const personalizedQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  category: z.string().min(1).optional(),
  includeMetrics: z.enum(['true', 'false']).optional().default('false'),
});

const preferencesQuerySchema = z.object({
  includeHistory: z.enum(['true', 'false']).optional().default('false'),
});

const analyticsQuerySchema = z.object({
  timeframe: z.enum(['1d', '7d', '30d']).optional().default('7d'),
});

const feedbackBodySchema = z.object({
  contentId: z.coerce.number().int().positive(),
  action: z.enum(['clicked', 'added_to_watchlist', 'dismissed', 'not_interested', 'liked', 'disliked']),
  section: z.string().optional(),
  algorithmType: z.string().optional(),
});

function getSectionTitle(key: string): string {
  const titles: Record<string, string> = {
    for_you: 'For You',
    friends_watching: 'Friends Are Watching',
    trending_now: 'Trending Now',
    because_you_watched: 'Because You Watched',
    new_releases: 'New Releases',
  };
  return titles[key] ?? 'Recommendations';
}

function getSectionDescription(key: string): string {
  const descriptions: Record<string, string> = {
    for_you: 'Personalized picks based on your taste',
    friends_watching: 'See what your friends are enjoying',
    trending_now: 'Popular across all platforms',
    because_you_watched: "More like what you've enjoyed",
    new_releases: 'Fresh content you might like',
  };
  return descriptions[key] ?? 'Curated recommendations';
}

async function logUserBehavior(userId: string, actionType: string, metadata: JsonRecord) {
  try {
    await db.insert(userBehavior).values({
      userId,
      actionType,
      targetType: 'recommendation',
      timestamp: new Date(),
      metadata: JSON.stringify(metadata ?? {}),
    });
  } catch (e) {
    console.error('Error logging user behavior:', e);
  }
}

async function getCachedRecommendations(userId: string) {
  try {
    const cached = await db.query.aiRecommendations.findMany({
      where: eq(aiRecommendations.userId, userId),
      with: { show: true },
      limit: 100,
    });

    if (!cached.length) return null;

    type SectionItem = {
      contentId: number;
      userId: string;
      algorithmType: string;
      baseScore: number;
      finalScore: number;
      explanation: JsonRecord;
      confidence: number;
      content: any;
    };

    type Section = {
      key: string;
      title: string;
      description: string;
      items: SectionItem[];
      algorithm: string;
      refreshable: boolean;
    };

    const sections = new Map<string, Section>();

    for (const rec of cached) {
      const metadata = safeParse(rec.metadata, {} as JsonRecord);
      const sectionKey = (metadata.section as string) || 'for_you';

      if (!sections.has(sectionKey)) {
        sections.set(sectionKey, {
          key: sectionKey,
          title: getSectionTitle(sectionKey),
          description: getSectionDescription(sectionKey),
          items: [],
          algorithm: rec.recommendationType,
          refreshable: true,
        });
      }

      sections.get(sectionKey)!.items.push({
        contentId: rec.showId,
        userId: rec.userId,
        algorithmType: rec.recommendationType,
        baseScore: rec.score,
        finalScore: rec.score,
        explanation: (metadata.explanation as JsonRecord) || {},
        confidence: (metadata.confidence as number) ?? 0.5,
        content: rec.show,
      });
    }

    return Array.from(sections.values());
  } catch (e) {
    console.error('Error fetching cached recommendations:', e);
    return null;
  }
}

function calculateSectionStats(viewStats: any[]) {
  const sectionCounts: Record<string, number> = {};
  for (const stat of viewStats) {
    const metadata = safeParse<JsonRecord>(stat.metadata, {});
    const section = (metadata.section as string) || 'unknown';
    sectionCounts[section] = (sectionCounts[section] || 0) + 1;
  }
  return sectionCounts;
}

function calculateFeedbackBreakdown(feedbackStats: any[]) {
  const breakdown: Record<string, number> = {};
  for (const stat of feedbackStats) {
    const metadata = safeParse<JsonRecord>(stat.metadata, {});
    const action = (metadata.action as string) || 'unknown';
    breakdown[action] = (breakdown[action] || 0) + 1;
  }
  return breakdown;
}

// Routes
router.get(
  '/',
  isAuthenticated,
  performanceMiddleware('getRecommendations'),
  asyncHandler(async (req: any, res: any) => {
    const userId = req.user.id as string;
    const refresh = req.query.refresh === 'true';

    if (!refresh) {
      const cached = await getCachedRecommendations(userId);
      if (cached && cached.length) {
        await logUserBehavior(userId, 'recommendations_served_cached', {
          sectionCount: cached.length,
          totalItems: cached.reduce((s, sec) => s + sec.items.length, 0),
        });
        return sendOk(
          res,
          { sections: cached },
          { cached: true, generatedAt: new Date().toISOString() }
        );
      }
    }

    const sections = await BingeBoardRecommendationEngine.generateRecommendations(userId);
    await logUserBehavior(userId, 'recommendations_generated', {
      sectionCount: sections.length,
      totalItems: sections.reduce((s: number, sec: any) => s + sec.items.length, 0),
      refresh,
    });

    return sendOk(
      res,
      { sections },
      { cached: false, generatedAt: new Date().toISOString() }
    );
  })
);

router.get(
  '/for-you',
  isAuthenticated,
  performanceMiddleware('getForYou'),
  asyncHandler(async (req: any, res: any) => {
    try {
      const userId = req.user.id as string;
      const { limit } = baseListQuerySchema.parse(req.query);

      const userProfile = await BingeBoardRecommendationEngine.buildUserProfile(userId);
      const items = await BingeBoardRecommendationEngine.getHybridRecommendations(userProfile, limit);

      await logUserBehavior(userId, 'recommendations_viewed', {
        section: 'for_you',
        itemCount: items.length,
      });

      return sendOk(
        res,
        { section: 'for_you', items },
        { generatedAt: new Date().toISOString() }
      );
    } catch (e: any) {
      console.error('Error in /for-you route:', e);
      return sendError(res, 500, e?.message || 'Failed to generate recommendations');
    }
  })
);

router.get(
  '/social',
  isAuthenticated,
  performanceMiddleware('getSocial'),
  asyncHandler(async (req: any, res: any) => {
    const userId = req.user.id as string;
    const { limit } = baseListQuerySchema.parse(req.query);

    const userProfile = await BingeBoardRecommendationEngine.buildUserProfile(userId);
    const items = await BingeBoardRecommendationEngine.getSocialRecommendations(userProfile, limit);

    await logUserBehavior(userId, 'recommendations_viewed', {
      section: 'social',
      itemCount: items.length,
    });

    return sendOk(
      res,
      { section: 'social', items },
      { generatedAt: new Date().toISOString() }
    );
  })
);

router.get(
  '/trending',
  isAuthenticated,
  performanceMiddleware('getTrending'),
  asyncHandler(async (req: any, res: any) => {
    const userId = req.user.id as string;
    const { limit } = baseListQuerySchema.parse(req.query);

    const userProfile = await BingeBoardRecommendationEngine.buildUserProfile(userId);
    const items = await BingeBoardRecommendationEngine.getTrendingRecommendations(userProfile, limit);

    await logUserBehavior(userId, 'recommendations_viewed', {
      section: 'trending',
      itemCount: items.length,
    });

    return sendOk(
      res,
      { section: 'trending', items },
      { generatedAt: new Date().toISOString() }
    );
  })
);

router.post(
  '/feedback',
  isAuthenticated,
  performanceMiddleware('postFeedback'),
  asyncHandler(async (req: any, res: any) => {
    const userId = req.user.id as string;
    const { contentId, action, section, algorithmType } = feedbackBodySchema.parse(req.body);

    await logUserBehavior(userId, 'recommendation_feedback', {
      contentId,
      action,
      section,
      algorithmType,
    });

    return sendOk(res, { message: 'Feedback recorded' });
  })
);

router.get(
  '/analytics',
  isAuthenticated,
  performanceMiddleware('getAnalytics'),
  asyncHandler(async (req: any, res: any) => {
    const { timeframe } = analyticsQuerySchema.parse(req.query);
    const daysBack = timeframe === '30d' ? 30 : timeframe === '1d' ? 1 : 7;
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    const generationStats = await db.query.userBehavior.findMany({
      where: and(eq(userBehavior.actionType, 'recommendations_generated'), gte(userBehavior.timestamp, startDate)),
      limit: 2000,
    });

    const viewStats = await db.query.userBehavior.findMany({
      where: and(eq(userBehavior.actionType, 'recommendations_viewed'), gte(userBehavior.timestamp, startDate)),
      limit: 5000,
    });

    const feedbackStats = await db.query.userBehavior.findMany({
      where: and(eq(userBehavior.actionType, 'recommendation_feedback'), gte(userBehavior.timestamp, startDate)),
      limit: 5000,
    });

    const avgItemsPerGeneration =
      generationStats.reduce((sum: number, stat: any) => {
        const metadata = safeParse<JsonRecord>(stat.metadata, {});
        const totalItems = (metadata.totalItems as number) || 0;
        return sum + totalItems;
      }, 0) / Math.max(generationStats.length, 1);

    const analytics = {
      timeframe,
      period: { start: startDate.toISOString(), end: new Date().toISOString() },
      metrics: {
        totalGenerations: generationStats.length,
        totalViews: viewStats.length,
        totalFeedback: feedbackStats.length,
        avgItemsPerGeneration,
        sectionStats: calculateSectionStats(viewStats),
        feedbackBreakdown: calculateFeedbackBreakdown(feedbackStats),
      },
    };

    return sendOk(res, analytics);
  })
);

router.get(
  '/profile',
  isAuthenticated,
  performanceMiddleware('getProfile'),
  asyncHandler(async (req: any, res: any) => {
    const userId = req.user.id as string;

    const userProfile = await BingeBoardRecommendationEngine.buildUserProfile(userId);

    const sanitizedProfile = {
      explicitPreferences: userProfile.explicitPreferences,
      implicitProfile: {
        topGenres: Object.entries(userProfile.implicitProfile.genreAffinities)
          .sort(([, a]: any, [, b]: any) => (b as number) - (a as number))
          .slice(0, 10)
          .map(([genre, score]) => ({ genre, score })),
        viewingPatterns: userProfile.implicitProfile.viewingPatterns,
        topPlatforms: Object.entries(userProfile.implicitProfile.platformUsage)
          .sort(([, a]: any, [, b]: any) => (b as number) - (a as number))
          .slice(0, 5)
          .map(([platform, usage]) => ({ platform, usage })),
      },
      socialProfile: userProfile.socialProfile,
    };

    return sendOk(res, { profile: sanitizedProfile }, { generatedAt: new Date().toISOString() });
  })
);

router.get(
  '/explain/:contentId',
  isAuthenticated,
  performanceMiddleware('getExplanation'),
  asyncHandler(async (req: any, res: any) => {
    const userId = req.user.id as string;
    const contentId = Number(req.params.contentId);

    if (!Number.isFinite(contentId) || contentId <= 0) {
      return sendError(res, 400, 'Invalid content ID');
    }

    const recommendation = await db.query.aiRecommendations.findFirst({
      where: and(eq(aiRecommendations.userId, userId), eq(aiRecommendations.showId, contentId)),
      with: { show: true },
    });

    if (!recommendation) {
      return sendError(res, 404, 'Recommendation not found');
    }

    const metadata = safeParse<JsonRecord>(recommendation.metadata, {});
    const explanation = (metadata.explanation as JsonRecord) || {};

    return sendOk(res, {
      contentId,
      explanation: {
        primaryReason: recommendation.reason,
        algorithmType: recommendation.recommendationType,
        score: recommendation.score,
        confidence: (metadata.confidence as number) ?? 0.5,
        factors: (explanation.factors as unknown[]) || [],
        similarContent: (explanation.similarContent as unknown[]) || [],
        socialSignals: (explanation.socialSignals as unknown[]) || [],
        availabilityInfo: (explanation.availabilityInfo as JsonRecord) || {},
      },
      content: {
        id: recommendation.show?.id,
        title: recommendation.show?.title,
        type: recommendation.show?.type || 'tv',
      },
    });
  })
);

router.post(
  '/refresh',
  isAuthenticated,
  performanceMiddleware('refreshRecommendations'),
  asyncHandler(async (req: any, res: any) => {
    const userId = req.user.id as string;

    await db.delete(aiRecommendations).where(eq(aiRecommendations.userId, userId));

    try {
      const AP: any = (APModule as any).AdvancedPersonalization || (APModule as any).default || APModule;
      await AP.clearUserCache?.(userId);
    } catch {}

    const sections = await BingeBoardRecommendationEngine.generateRecommendations(userId);

    await logUserBehavior(userId, 'recommendations_refreshed', {
      sectionCount: sections.length,
      totalItems: sections.reduce((s: number, sec: any) => s + sec.items.length, 0),
    });

    return sendOk(
      res,
      { sections },
      { message: 'Recommendations refreshed', generatedAt: new Date().toISOString() }
    );
  })
);

router.get(
  '/personalized',
  isAuthenticated,
  performanceMiddleware('getPersonalizedRecommendations'),
  asyncHandler(async (req: any, res: any) => {
    const userId = req.user?.id as string;
    const { limit, offset, category, includeMetrics } = personalizedQuerySchema.parse(req.query);

    const AP: any = (APModule as any).AdvancedPersonalization || (APModule as any).default || APModule;
    let data: any;
    if (typeof AP?.getPersonalizedRecommendations === 'function') {
      data = await AP.getPersonalizedRecommendations(userId, {
        limit,
        offset,
        category: category || undefined,
        includeDebugInfo: includeMetrics === 'true',
      });
    } else {
      const profile = await BingeBoardRecommendationEngine.buildUserProfile(userId);
      const items = await BingeBoardRecommendationEngine.getHybridRecommendations(profile, limit + offset);
      data = items.slice(offset, offset + limit);
    }

    return sendOk(res, data, {
      userId,
      limit,
      offset,
      timestamp: new Date().toISOString(),
    });
  })
);

router.get(
  '/preferences',
  isAuthenticated,
  performanceMiddleware('getUserPreferences'),
  asyncHandler(async (req: any, res: any) => {
    const userId = req.user?.id as string;
    const { includeHistory } = preferencesQuerySchema.parse(req.query);

    const AP: any = (APModule as any).AdvancedPersonalization || (APModule as any).default || APModule;
    let preferences: any = {};
    if (typeof AP?.getUserPreferences === 'function') {
      preferences = await AP.getUserPreferences(userId);
    } else {
      preferences = { userId, explicitPreferences: { genres: [], excluded: [] }, implicitProfile: {} };
    }

    const payload: any = { ...preferences };

    if (includeHistory === 'true') {
      try {
        const AP: any = (APModule as any).AdvancedPersonalization || (APModule as any).default || APModule;
        if (typeof AP?.getRecentInteractions === 'function') {
          payload.recentInteractions = await AP.getRecentInteractions(userId, 50);
        } else {
          payload.recentInteractions = [];
        }
      } catch {
        payload.recentInteractions = [];
      }
    }

    return sendOk(res, payload, {
      userId,
      timestamp: new Date().toISOString(),
    });
  })
);

router.get(
  '/health',
  asyncHandler(async (_req: any, res: any) => {
    try {
      const health = await PersonalizationMonitoring.healthCheck();
      const status = health.status === 'healthy' ? 200 : 503;
      return res.status(status).json({
        status: health.status,
        timestamp: new Date().toISOString(),
        details: health.details,
      });
    } catch {
      return res.status(503).json({
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      });
    }
  })
);

router.get(
  '/metrics',
  isAuthenticated,
  performanceMiddleware('getMetrics'),
  asyncHandler(async (req: any, res: any) => {
    const timeframe = (req.query.timeframe as string) ?? '24h';
    const dashboardData = await PersonalizationMonitoring.getDashboardData();
    return sendOk(res, dashboardData, { timeframe, generatedAt: new Date().toISOString() });
  })
);

export default router;
