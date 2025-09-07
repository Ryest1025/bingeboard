import { Router } from 'express';
import { isAuthenticated } from '../auth.js';
import { storage } from '../storage.js';

const router = Router();

// Track trailer views for monetization analytics
router.post('/trailer-view', isAuthenticated, async (req, res) => {
  try {
    const { tmdbId, videoKey, showTitle, hasAds } = req.body;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Simple tracking - just log for now since we don't have full analytics system
    console.log('📊 Trailer view tracked:', {
      userId: user.uid || user.id,
      tmdbId,
      showTitle,
      hasAds,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Trailer view tracked' });
  } catch (error) {
    console.error('Error tracking trailer view:', error);
    res.status(500).json({ error: 'Failed to track trailer view' });
  }
});

// Track affiliate link clicks for revenue tracking
router.post('/affiliate-click', isAuthenticated, async (req, res) => {
  try {
    const { platform, showId, trackingId } = req.body;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Simple tracking - just log for now
    console.log('💰 Affiliate click tracked:', {
      userId: user.uid || user.id,
      platform,
      showId,
      trackingId,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Affiliate click tracked' });
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    res.status(500).json({ error: 'Failed to track affiliate click' });
  }
});

// Track ad views for monetization analytics
router.post('/ad-view', isAuthenticated, async (req, res) => {
  try {
    const { adId, context } = req.body;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('📺 Ad view tracked:', {
      userId: user.uid || user.id,
      adId,
      context,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Ad view tracked' });
  } catch (error) {
    console.error('Error tracking ad view:', error);
    res.status(500).json({ error: 'Failed to track ad view' });
  }
});

// Track ad clicks for revenue tracking
router.post('/ad-click', isAuthenticated, async (req, res) => {
  try {
    const { adId, clickUrl } = req.body;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('💰 Ad click tracked:', {
      userId: user.uid || user.id,
      adId,
      clickUrl,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Ad click tracked' });
  } catch (error) {
    console.error('Error tracking ad click:', error);
    res.status(500).json({ error: 'Failed to track ad click' });
  }
});

// Track ad completion for revenue calculation
router.post('/ad-completion', isAuthenticated, async (req, res) => {
  try {
    const { adId, watchTime } = req.body;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('✅ Ad completion tracked:', {
      userId: user.uid || user.id,
      adId,
      watchTime,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Ad completion tracked' });
  } catch (error) {
    console.error('Error tracking ad completion:', error);
    res.status(500).json({ error: 'Failed to track ad completion' });
  }
});

// Get basic monetization metrics for admin dashboard
router.get('/monetization-metrics', isAuthenticated, async (req, res) => {
  try {
    const user = (req as any).user;

    // For now, return mock metrics since we don't have full analytics system
    const metrics = {
      trailerViews: 1234,
      adTrailerViews: 987,
      adFreeTrailerViews: 247,
      affiliateClicks: 156,
      adClicks: 89,
      adCompletions: 743,
      clickThroughRate: 12.6,
      adCompletionRate: 75.3,
      estimatedRevenue: {
        daily: 12.45,
        weekly: 87.15,
        monthly: 341.20
      },
      platformBreakdown: {
        netflix: 45,
        hulu: 32,
        disney_plus: 28,
        hbo_max: 25,
        amazon_prime_video: 26
      },
      adPartnerPerformance: {
        streammax: { views: 345, clicks: 28, revenue: 89.45 },
        techvision: { views: 267, clicks: 19, revenue: 67.23 },
        snacktime: { views: 198, clicks: 15, revenue: 45.67 },
        cinemahub: { views: 123, clicks: 12, revenue: 34.12 },
        gamezone: { views: 89, clicks: 8, revenue: 23.45 }
      }
    };

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Error fetching monetization metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

export default router;
