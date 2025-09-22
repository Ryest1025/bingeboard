import { Router } from 'express';
import { MultiAPIStreamingService, UserPreferences } from '../services/MultiAPIStreamingService.js';

const router = Router();

/**
 * Test endpoint for preference-aware streaming
 * POST /api/test/preference-streaming
 */
router.post('/preference-streaming', async (req, res) => {
  try {
    const { tmdbId, title, mediaType = 'tv', userPrefs, imdbId } = req.body;

    if (!tmdbId || !title) {
      return res.status(400).json({
        error: 'Missing required fields: tmdbId and title'
      });
    }

    console.log('🧪 Testing preference-aware streaming:', {
      tmdbId,
      title,
      mediaType,
      userPrefs,
      imdbId
    });

    // Test the new preference-aware method
    const result = await MultiAPIStreamingService.getPreferenceAwareAvailability(
      tmdbId,
      title,
      mediaType,
      userPrefs as UserPreferences,
      imdbId
    );

    // Also test the original method for comparison
    const originalResult = await MultiAPIStreamingService.getComprehensiveAvailability(
      tmdbId,
      title,
      mediaType,
      imdbId
    );

    return res.json({
      success: true,
      preferenceAware: result,
      original: originalResult,
      comparison: {
        preferenceFilteredPlatforms: result.totalPlatforms,
        originalTotalPlatforms: originalResult.totalPlatforms,
        platformsFiltered: originalResult.totalPlatforms - result.totalPlatforms,
        affiliatePlatforms: {
          preferenceAware: result.affiliatePlatforms,
          original: originalResult.affiliatePlatforms
        }
      }
    });

  } catch (error) {
    console.error('❌ Preference-aware streaming test failed:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Test endpoint for batch preference-aware streaming
 * POST /api/test/batch-preference-streaming
 */
router.post('/batch-preference-streaming', async (req, res) => {
  try {
    const { titles, userPrefs } = req.body;

    if (!titles || !Array.isArray(titles)) {
      return res.status(400).json({
        error: 'Missing required field: titles (array)'
      });
    }

    console.log('🧪 Testing batch preference-aware streaming:', {
      titlesCount: titles.length,
      userPrefs
    });

    const startTime = Date.now();

    // Test the new batch preference-aware method
    const results = await MultiAPIStreamingService.getBatchAvailabilityWithPreferences(
      titles,
      userPrefs as UserPreferences
    );

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // Calculate statistics
    let totalPlatforms = 0;
    let totalAffiliate = 0;
    let totalPremium = 0;
    let totalFree = 0;

    const resultsArray = Array.from(results.entries()).map(([tmdbId, result]) => {
      totalPlatforms += result.totalPlatforms;
      totalAffiliate += result.affiliatePlatforms;
      totalPremium += result.premiumPlatforms;
      totalFree += result.freePlatforms;

      return {
        tmdbId,
        title: result.title,
        totalPlatforms: result.totalPlatforms,
        affiliatePlatforms: result.affiliatePlatforms,
        platforms: result.platforms.map(p => ({
          name: p.provider_name,
          type: p.type,
          source: p.source,
          affiliate: p.affiliate_supported,
          commission: p.commission_rate
        }))
      };
    });

    return res.json({
      success: true,
      processingTime: `${processingTime}ms`,
      coverage: `${results.size}/${titles.length} titles`,
      summary: {
        totalPlatforms,
        totalAffiliate,
        totalPremium,
        totalFree,
        averagePlatformsPerTitle: Math.round(totalPlatforms / results.size * 100) / 100,
        affiliateConversionRate: Math.round(totalAffiliate / totalPlatforms * 100 * 100) / 100 + '%'
      },
      results: resultsArray
    });

  } catch (error) {
    console.error('❌ Batch preference-aware streaming test failed:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;