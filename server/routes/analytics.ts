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

// Get basic monetization metrics for admin dashboard
router.get('/monetization-metrics', isAuthenticated, async (req, res) => {
  try {
    const user = (req as any).user;

    // For now, return mock metrics since we don't have full analytics system
    const metrics = {
      trailerViews: 1234,
      adTrailerViews: 987,
      affiliateClicks: 156,
      adFreeTrailerViews: 247,
      clickThroughRate: 12.6,
      platformBreakdown: {
        netflix: 45,
        hulu: 32,
        disney_plus: 28,
        hbo_max: 25,
        amazon_prime_video: 26
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
