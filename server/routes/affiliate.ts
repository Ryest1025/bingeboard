/**
 * Affiliate Redirect Route
 * Handles affiliate link generation and redirects users to streaming platforms
 * with proper tracking and commission links
 */

import type { Express, Request, Response } from 'express';
import { MultiAPIStreamingService } from '../services/multiAPIStreamingService.js';

export function registerAffiliateRoutes(app: Express) {
  
  /**
   * Affiliate redirect endpoint
   * GET /api/affiliate/redirect?provider=netflix&title=Breaking%20Bad&userId=123&showId=456
   */
  app.get('/api/affiliate/redirect', async (req: Request & { user?: any }, res: Response) => {
    try {
      const { provider, title, showId } = req.query;
      const userId = req.user?.id || 'anonymous';

      if (!provider || !title || !showId) {
        return res.status(400).json({ 
          error: 'Missing required parameters: provider, title, showId' 
        });
      }

      // Create a mock EnhancedStreamingPlatform object for the affiliate URL generation
      const platform = {
        provider_id: 0, // Not used in URL generation
        provider_name: provider as string,
        web_url: getDefaultPlatformUrl(provider as string),
        type: 'sub' as const,
        affiliate_supported: true,
        source: 'tmdb' as const // Use valid source type
      };

      // Generate the affiliate URL using the existing service method
      const affiliateUrl = MultiAPIStreamingService.generateAffiliateUrl(
        platform,
        userId as string,
        parseInt(showId as string),
        title as string
      );

      // Log the affiliate click for analytics
      console.log(`🔗 Affiliate redirect: ${userId} -> ${provider} -> ${title}`, {
        provider,
        title,
        showId,
        userId,
        timestamp: new Date().toISOString()
      });

      // TODO: Store affiliate click in database for revenue tracking

      // Redirect to the affiliate URL
      return res.redirect(302, affiliateUrl);

    } catch (error) {
      console.error('❌ Affiliate redirect error:', error);
      
      // Fallback to generic search if affiliate fails
      const title = req.query.title as string;
      const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(title + ' streaming')}`;
      return res.redirect(302, fallbackUrl);
    }
  });

  /**
   * Affiliate stats endpoint (for analytics)
   * GET /api/affiliate/stats
   */
  app.get('/api/affiliate/stats', (req: Request & { user?: any }, res: Response) => {
    // TODO: Return affiliate click stats from database
    res.json({
      totalClicks: 0,
      topPlatforms: [],
      revenue: 0,
      conversionRate: 0
    });
  });
}

/**
 * Get default platform URLs for fallback
 */
function getDefaultPlatformUrl(provider: string): string {
  const platformUrls: Record<string, string> = {
    'Netflix': 'https://www.netflix.com',
    'Amazon Prime Video': 'https://www.amazon.com/prime-video',
    'Hulu': 'https://www.hulu.com',
    'Disney Plus': 'https://www.disneyplus.com',
    'Disney+': 'https://www.disneyplus.com',
    'HBO Max': 'https://www.max.com',
    'Max': 'https://www.max.com',
    'Apple TV Plus': 'https://tv.apple.com',
    'Apple TV+': 'https://tv.apple.com',
    'Paramount Plus': 'https://www.paramountplus.com',
    'Paramount+': 'https://www.paramountplus.com',
    'Peacock': 'https://www.peacocktv.com',
    'Crunchyroll': 'https://www.crunchyroll.com',
    'YouTube Premium': 'https://www.youtube.com/premium',
    'Showtime': 'https://www.showtime.com',
    'Starz': 'https://www.starz.com'
  };

  return platformUrls[provider] || `https://www.google.com/search?q=${encodeURIComponent(provider + ' streaming')}`;
}