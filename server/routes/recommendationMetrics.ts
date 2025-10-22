/**
 * Recommendation Metrics API Endpoints
 * 
 * Provides access to recommendation performance data and A/B testing results
 */

import express, { Request, Response } from 'express';
import { isAuthenticated } from '../auth';
import { RecommendationMetrics } from '../services/recommendationMetrics';

const router = express.Router();

/**
 * Log user action on a recommendation
 * POST /api/metrics/action
 */
router.post('/action', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { recommendationId, tmdbId, actionType, actionValue, timeToAction } = req.body;
    const userId = req.user?.id;

    if (!userId || !recommendationId || !tmdbId || !actionType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: recommendationId, tmdbId, actionType'
      });
    }

    RecommendationMetrics.logAction({
      userId,
      recommendationId,
      tmdbId,
      actionType,
      actionValue,
      timeToAction,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Action logged successfully'
    });

  } catch (error: any) {
    console.error('❌ Failed to log action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log action',
      error: error.message
    });
  }
});

/**
 * Get metrics dashboard
 * GET /api/metrics/dashboard?timeRange=day
 */
router.get('/dashboard', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    const timeRange = (req.query.timeRange as any) || 'day';
    
    if (!['hour', 'day', 'week', 'month'].includes(timeRange)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid timeRange. Must be: hour, day, week, or month'
      });
    }

    const dashboard = await RecommendationMetrics.getDashboard(timeRange);

    res.json({
      success: true,
      timeRange,
      ...dashboard
    });

  } catch (error: any) {
    console.error('❌ Failed to get dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard',
      error: error.message
    });
  }
});

/**
 * Compare A/B test variants
 * GET /api/metrics/compare?variantA=ai&variantB=tmdb
 */
router.get('/compare', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { variantA, variantB, days } = req.query;

    if (!variantA || !variantB) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: variantA and variantB'
      });
    }

    const daysNum = parseInt(days as string) || 7;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - daysNum * 24 * 60 * 60 * 1000);

    const comparison = await RecommendationMetrics.compareVariants(
      variantA as string,
      variantB as string,
      startDate,
      endDate
    );

    res.json({
      success: true,
      ...comparison,
      period: {
        days: daysNum,
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to compare variants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare variants',
      error: error.message
    });
  }
});

/**
 * Get metrics for a specific source
 * GET /api/metrics/source/ai?days=7
 */
router.get('/source/:source', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { source } = req.params;
    const days = parseInt(req.query.days as string) || 7;

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const metrics = await RecommendationMetrics.calculateMetrics(source, startDate, endDate);

    res.json({
      success: true,
      source,
      period: {
        days,
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      metrics
    });

  } catch (error: any) {
    console.error('❌ Failed to get source metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get metrics',
      error: error.message
    });
  }
});

/**
 * Export raw data for analysis
 * GET /api/metrics/export?days=30
 */
router.get('/export', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    // Only allow admins to export data (add admin check here if needed)
    const days = parseInt(req.query.days as string) || 30;

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const data = RecommendationMetrics.exportData(startDate, endDate);

    res.json({
      success: true,
      period: {
        days,
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      data: {
        events: data.events.length,
        actions: data.actions.length
      },
      export: data
    });

  } catch (error: any) {
    console.error('❌ Failed to export data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message
    });
  }
});

/**
 * Health check for metrics system
 * GET /api/metrics/health
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const dashboard = await RecommendationMetrics.getDashboard('hour');

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        totalRecommendations: dashboard.overall.totalRecommendations,
        avgQuality: dashboard.overall.qualityScore.toFixed(3)
      }
    });

  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
