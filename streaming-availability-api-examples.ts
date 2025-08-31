/**
 * Example Enhanced Endpoint with Streaming Availability API
 * This shows how the 4th API source automatically integrates into your existing enhanced endpoints
 */

import { Request, Response } from 'express';
import { MultiAPIStreamingService } from '../services/multiAPIStreamingService.js';
import { TMDBService } from '../services/tmdb.js';

/**
 * Enhanced Trending endpoint with all 4 API sources
 * GET /api/content/trending-enhanced?includeStreamingAvailability=true
 */
export async function getTrendingEnhanced(req: Request, res: Response) {
  try {
    const { 
      mediaType = 'all', 
      timeWindow = 'week',
      includeStreaming = 'true',
      includeStreamingAvailability = 'true' 
    } = req.query;

    const tmdbService = new TMDBService();
    const trendingData = await tmdbService.getTrending(
      mediaType as 'tv' | 'movie' | 'all',
      timeWindow as 'day' | 'week'
    );

    if (includeStreaming === 'true' && trendingData.results) {
      console.log(`🔄 Enhancing ${trendingData.results.length} trending items with 4-API streaming data...`);
      
      // Process in batches to avoid overwhelming APIs
      const batchSize = 5;
      const enhancedResults = [];
      
      for (let i = 0; i < trendingData.results.length; i += batchSize) {
        const batch = trendingData.results.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (item: any) => {
          try {
            const mediaTypeStr = item.title ? 'movie' : 'tv';
            const title = item.title || item.name || '';
            
            // This now automatically includes Streaming Availability API data!
            const streamingData = await MultiAPIStreamingService.getComprehensiveAvailability(
              item.id,
              title,
              mediaTypeStr,
              item.imdb_id
            );
            
            return {
              ...item,
              // All 4 API sources included
              streamingPlatforms: streamingData.platforms,
              streamingCount: streamingData.totalPlatforms,
              affiliatePlatforms: streamingData.affiliatePlatforms,
              // New fields from Streaming Availability API
              hasUHDContent: streamingData.platforms.some(p => p.video_quality === 'uhd'),
              hasExpiringContent: streamingData.platforms.some(p => p.expires_soon),
              // Source breakdown
              apiSources: streamingData.sources,
              // Monetization data
              monetization: MultiAPIStreamingService.getMonetizationMetrics(streamingData.platforms)
            };
          } catch (error) {
            console.warn(`Failed to enhance item ${item.id}:`, error);
            return item; // Return original if enhancement fails
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        enhancedResults.push(...batchResults);
        
        // Small delay between batches
        if (i + batchSize < trendingData.results.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      trendingData.results = enhancedResults;
      
      console.log(`✅ Enhanced trending data with 4-API streaming information`);
      console.log(`📊 API Source Coverage:`, {
        tmdb: enhancedResults.filter(r => r.apiSources?.tmdb).length,
        watchmode: enhancedResults.filter(r => r.apiSources?.watchmode).length, 
        utelly: enhancedResults.filter(r => r.apiSources?.utelly).length,
        streamingAvailability: enhancedResults.filter(r => r.apiSources?.streamingAvailability).length
      });
    }
    
    res.json({
      ...trendingData,
      enhancedWithStreaming: includeStreaming === 'true',
      apiSourcesUsed: ['tmdb', 'watchmode', 'utelly', 'streaming-availability'],
      enhanced: true
    });
  } catch (error) {
    console.error('Trending enhanced endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch enhanced trending data' });
  }
}

/**
 * Enhanced Show Details endpoint with comprehensive streaming data
 * GET /api/streaming/comprehensive/:type/:id
 */
export async function getComprehensiveShowDetails(req: Request, res: Response) {
  try {
    const { type, id } = req.params;
    const { title, includeAffiliate = 'true' } = req.query;
    
    if (!type || !id) {
      return res.status(400).json({ error: 'Type and ID are required' });
    }
    
    const mediaType = type as 'movie' | 'tv';
    const showTitle = title as string || '';
    
    console.log(`🔍 Getting comprehensive streaming data for ${mediaType} ${id}: "${showTitle}"`);
    
    // Get comprehensive streaming data from all 4 APIs
    const streamingData = await MultiAPIStreamingService.getComprehensiveAvailability(
      parseInt(id),
      showTitle,
      mediaType
    );
    
    // Generate affiliate links if requested
    let affiliateLinks = {};
    if (includeAffiliate === 'true') {
      const userId = 'demo-user'; // In production, get from auth
      affiliateLinks = streamingData.platforms
        .filter(p => p.affiliate_supported)
        .reduce((acc, platform) => {
          acc[platform.provider_name] = MultiAPIStreamingService.generateAffiliateUrl(
            platform,
            userId,
            parseInt(id),
            showTitle
          );
          return acc;
        }, {} as Record<string, string>);
    }
    
    console.log(`✅ Found streaming data from ${Object.values(streamingData.sources).filter(Boolean).length} API sources`);
    console.log(`📱 Available on ${streamingData.totalPlatforms} platforms`);
    console.log(`💰 ${streamingData.affiliatePlatforms} affiliate-supported platforms`);
    
    res.json({
      tmdbId: parseInt(id),
      mediaType,
      title: showTitle,
      streaming: {
        platforms: streamingData.platforms,
        totalPlatforms: streamingData.totalPlatforms,
        affiliatePlatforms: streamingData.affiliatePlatforms,
        premiumPlatforms: streamingData.premiumPlatforms,
        freePlatforms: streamingData.freePlatforms,
        // New fields from Streaming Availability API
        uhd_available: streamingData.platforms.some(p => p.video_quality === 'uhd'),
        hd_available: streamingData.platforms.some(p => p.video_quality === 'hd'),
        expiring_soon: streamingData.platforms.filter(p => p.expires_soon),
        // Source breakdown
        sources: streamingData.sources
      },
      ...(includeAffiliate === 'true' && { affiliateLinks }),
      monetization: MultiAPIStreamingService.getMonetizationMetrics(streamingData.platforms),
      enhanced: true,
      apiVersion: '4.0', // 4 API sources
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Comprehensive show details error:', error);
    res.status(500).json({ error: 'Failed to fetch comprehensive show details' });
  }
}

/**
 * Example of how to use the new client-side API
 */
export const exampleClientUsage = `
// Client-side usage example
import { 
  searchShowsByTitle, 
  getShowByTmdbId,
  getStreamingServices 
} from '@/services/streamingAvailabilityApi';

// Search for a show
const searchResults = await searchShowsByTitle('Breaking Bad', 'us', 'series');

// Get show by TMDB ID  
const showDetails = await getShowByTmdbId(1396, 'us');

// Get available streaming services
const services = await getStreamingServices('us');

// All of these will be automatically integrated into your enhanced endpoints
// when you call your existing multi-API enhanced endpoints!
`;

export default {
  getTrendingEnhanced,
  getComprehensiveShowDetails,
  exampleClientUsage
};
