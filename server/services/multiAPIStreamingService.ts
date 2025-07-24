import { TMDBService } from './tmdb.js';
import { WatchmodeService } from './watchmodeService.js';
import { 
  searchStreamingAvailability, 
  getStreamingByImdbId,
  StreamingLocation,
  UtellyResult 
} from '../clients/utellyClient.js';

interface EnhancedStreamingPlatform {
  provider_id: number;
  provider_name: string;
  logo_path?: string;
  type: 'sub' | 'buy' | 'rent' | 'free';
  web_url?: string;
  ios_url?: string;
  android_url?: string;
  price?: number;
  format?: string;
  source: 'tmdb' | 'watchmode' | 'utelly';
  affiliate_supported: boolean;
  commission_rate?: number;
}

interface StreamingAvailabilityResponse {
  tmdbId: number;
  title: string;
  platforms: EnhancedStreamingPlatform[];
  totalPlatforms: number;
  affiliatePlatforms: number;
  premiumPlatforms: number;
  freePlatforms: number;
  sources: {
    tmdb: boolean;
    watchmode: boolean;
    utelly: boolean;
  };
}

export class MultiAPIStreamingService {
  private static tmdbService = new TMDBService();
  
  // Affiliate commission rates for different platforms
  private static affiliateCommissions = {
    'Netflix': 8.5,
    'Amazon Prime Video': 4.5,
    'Hulu': 6.0,
    'Disney Plus': 7.2,
    'Disney+': 7.2,
    'HBO Max': 9.0,
    'Max': 9.0,
    'Apple TV Plus': 5.0,
    'Apple TV+': 5.0,
    'Paramount Plus': 5.5,
    'Paramount+': 5.5,
    'Peacock': 4.8,
    'Crunchyroll': 6.5,
    'YouTube Premium': 3.2,
    'Showtime': 7.0,
    'Starz': 6.8
  };

  // Check if platform supports affiliate links
  private static hasAffiliateSupport(platformName: string): boolean {
    return platformName in this.affiliateCommissions;
  }

  // Get commission rate for platform
  private static getCommissionRate(platformName: string): number {
    return this.affiliateCommissions[platformName as keyof typeof this.affiliateCommissions] || 0;
  }

  // Normalize platform names across different APIs
  private static normalizePlatformName(name: string): string {
    const normalizations: Record<string, string> = {
      'Disney Plus': 'Disney+',
      'Amazon Prime': 'Amazon Prime Video',
      'Apple TV Plus': 'Apple TV+',
      'Paramount Plus': 'Paramount+',
      'HBO Max': 'Max',
      'Peacock Premium': 'Peacock',
      'YouTube TV': 'YouTube Premium'
    };
    
    return normalizations[name] || name;
  }

  // Convert Utelly results to our enhanced format
  private static convertUtellyResults(utellyResults: UtellyResult[]): EnhancedStreamingPlatform[] {
    const platforms: EnhancedStreamingPlatform[] = [];
    
    utellyResults.forEach((result, index) => {
      result.locations.forEach((location: StreamingLocation, locationIndex) => {
        const normalizedName = this.normalizePlatformName(location.display_name);
        
        platforms.push({
          provider_id: 9000 + index * 100 + locationIndex, // Generate unique ID for Utelly
          provider_name: normalizedName,
          logo_path: location.icon ? `/logos/${normalizedName.toLowerCase().replace(/\s+/g, '_')}.jpg` : undefined,
          type: 'sub', // Utelly doesn't specify type, assume subscription
          web_url: location.url,
          source: 'utelly',
          affiliate_supported: this.hasAffiliateSupport(normalizedName),
          commission_rate: this.getCommissionRate(normalizedName)
        });
      });
    });
    
    return platforms;
  }

  // Get comprehensive streaming availability from all APIs
  static async getComprehensiveAvailability(
    tmdbId: number, 
    title: string, 
    mediaType: 'movie' | 'tv' = 'tv',
    imdbId?: string
  ): Promise<StreamingAvailabilityResponse> {
    const allPlatforms: EnhancedStreamingPlatform[] = [];
    const sources = { tmdb: false, watchmode: false, utelly: false };

    // 1. Get TMDB watch providers
    try {
      const tmdbData = await this.tmdbService.getWatchProviders(mediaType, tmdbId);
      if (tmdbData.results?.US?.flatrate || tmdbData.results?.US?.buy || tmdbData.results?.US?.rent) {
        sources.tmdb = true;
        
        const tmdbProviders = [
          ...(tmdbData.results.US.flatrate || []),
          ...(tmdbData.results.US.buy || []),
          ...(tmdbData.results.US.rent || [])
        ];

        tmdbProviders.forEach(provider => {
          const normalizedName = this.normalizePlatformName(provider.provider_name);
          allPlatforms.push({
            provider_id: provider.provider_id,
            provider_name: normalizedName,
            logo_path: provider.logo_path,
            type: 'sub', // TMDB doesn't specify type clearly
            source: 'tmdb',
            affiliate_supported: this.hasAffiliateSupport(normalizedName),
            commission_rate: this.getCommissionRate(normalizedName)
          });
        });
      }
    } catch (error) {
      console.warn('TMDB watch providers failed:', error);
    }

    // 2. Get Watchmode availability
    try {
      const watchmodeData = await WatchmodeService.getStreamingAvailability(tmdbId, mediaType);
      if (watchmodeData.streamingPlatforms.length > 0) {
        sources.watchmode = true;
        
        watchmodeData.streamingPlatforms.forEach(platform => {
          const normalizedName = this.normalizePlatformName(platform.provider_name);
          allPlatforms.push({
            ...platform,
            provider_name: normalizedName,
            source: 'watchmode',
            affiliate_supported: this.hasAffiliateSupport(normalizedName),
            commission_rate: this.getCommissionRate(normalizedName)
          });
        });
      }
    } catch (error) {
      console.warn('Watchmode availability failed:', error);
    }

    // 3. Get Utelly availability
    try {
      let utellyData;
      if (imdbId) {
        utellyData = await getStreamingByImdbId(imdbId);
      } else {
        utellyData = await searchStreamingAvailability(title);
      }
      
      if (utellyData?.results?.length > 0) {
        sources.utelly = true;
        const utellyPlatforms = this.convertUtellyResults(utellyData.results);
        allPlatforms.push(...utellyPlatforms);
      }
    } catch (error) {
      console.warn('Utelly availability failed:', error);
    }

    // 4. Deduplicate platforms by name (keep the one with most data)
    const platformMap = new Map<string, EnhancedStreamingPlatform>();
    
    allPlatforms.forEach(platform => {
      const key = platform.provider_name.toLowerCase();
      const existing = platformMap.get(key);
      
      if (!existing || this.getPlatformScore(platform) > this.getPlatformScore(existing)) {
        platformMap.set(key, platform);
      }
    });

    const finalPlatforms = Array.from(platformMap.values());

    // 5. Calculate statistics
    const affiliatePlatforms = finalPlatforms.filter(p => p.affiliate_supported).length;
    const premiumPlatforms = finalPlatforms.filter(p => p.type === 'sub' || p.price && p.price > 0).length;
    const freePlatforms = finalPlatforms.filter(p => p.type === 'free' || (p.price && p.price === 0)).length;

    return {
      tmdbId,
      title,
      platforms: finalPlatforms,
      totalPlatforms: finalPlatforms.length,
      affiliatePlatforms,
      premiumPlatforms,
      freePlatforms,
      sources
    };
  }

  // Score platforms based on data completeness for deduplication
  private static getPlatformScore(platform: EnhancedStreamingPlatform): number {
    let score = 0;
    
    if (platform.logo_path) score += 2;
    if (platform.web_url) score += 3;
    if (platform.ios_url || platform.android_url) score += 1;
    if (platform.price !== undefined) score += 1;
    if (platform.format) score += 1;
    if (platform.affiliate_supported) score += 2;
    
    // Prefer certain sources based on reliability
    if (platform.source === 'tmdb') score += 3;
    if (platform.source === 'watchmode') score += 2;
    if (platform.source === 'utelly') score += 1;
    
    return score;
  }

  // Get monetization metrics for a platform
  static getMonetizationMetrics(platforms: EnhancedStreamingPlatform[]): {
    potentialRevenue: number;
    affiliateClicks: number;
    conversionRate: number;
    averageCommission: number;
    topAffiliatePlatforms: EnhancedStreamingPlatform[];
  } {
    const affiliatePlatforms = platforms.filter(p => p.affiliate_supported);
    const totalCommission = affiliatePlatforms.reduce((sum, p) => sum + (p.commission_rate || 0), 0);
    const averageCommission = affiliatePlatforms.length > 0 ? totalCommission / affiliatePlatforms.length : 0;
    
    // Sort by commission rate for top platforms
    const topAffiliatePlatforms = affiliatePlatforms
      .sort((a, b) => (b.commission_rate || 0) - (a.commission_rate || 0))
      .slice(0, 5);

    // Mock metrics - in production these would come from analytics
    return {
      potentialRevenue: affiliatePlatforms.length * 25.50, // Average revenue per platform
      affiliateClicks: Math.floor(Math.random() * 100) + 50,
      conversionRate: 12.5 + (Math.random() * 5), // 12.5-17.5%
      averageCommission,
      topAffiliatePlatforms
    };
  }

  // Get availability for multiple titles (batch processing)
  static async getBatchAvailability(
    titles: Array<{ tmdbId: number; title: string; mediaType: 'movie' | 'tv'; imdbId?: string }>
  ): Promise<Map<number, StreamingAvailabilityResponse>> {
    const results = new Map<number, StreamingAvailabilityResponse>();
    
    // Process in batches to respect API rate limits
    const batchSize = 5;
    for (let i = 0; i < titles.length; i += batchSize) {
      const batch = titles.slice(i, i + batchSize);
      const promises = batch.map(async ({ tmdbId, title, mediaType, imdbId }) => {
        try {
          const availability = await this.getComprehensiveAvailability(tmdbId, title, mediaType, imdbId);
          return { tmdbId, availability };
        } catch (error) {
          console.error(`Failed to get availability for ${title}:`, error);
          return { tmdbId, availability: null };
        }
      });

      const batchResults = await Promise.allSettled(promises);
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.availability) {
          results.set(result.value.tmdbId, result.value.availability);
        }
      });

      // Add delay between batches to respect rate limits
      if (i + batchSize < titles.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return results;
  }

  // Get platform-specific affiliate URL with tracking
  static generateAffiliateUrl(
    platform: EnhancedStreamingPlatform, 
    userId: string, 
    showId: number,
    showTitle: string
  ): string {
    if (!platform.affiliate_supported || !platform.web_url) {
      return platform.web_url || `https://www.google.com/search?q=${encodeURIComponent(showTitle + ' streaming')}`;
    }

    const trackingId = this.generateTrackingId(userId, showId, platform.provider_name);
    
    // Platform-specific affiliate URL generation
    const affiliateUrls: Record<string, (url: string, trackingId: string) => string> = {
      'Netflix': (url, id) => `${url}?trkid=BINGEBOARD_${id}`,
      'Amazon Prime Video': (url, id) => `${url}?tag=bingeboard-20&ref_=${id}`,
      'Hulu': (url, id) => `${url}?ref=BINGEBOARD_${id}`,
      'Disney+': (url, id) => `${url}?cid=BINGEBOARD_${id}`,
      'Max': (url, id) => `${url}?src=BINGEBOARD_${id}`,
      'Apple TV+': (url, id) => `${url}?at=BINGEBOARD_${id}`,
      'Paramount+': (url, id) => `${url}?promo=BINGEBOARD_${id}`,
      'Peacock': (url, id) => `${url}?partner=BINGEBOARD_${id}`
    };

    const affiliateGenerator = affiliateUrls[platform.provider_name];
    if (affiliateGenerator) {
      return affiliateGenerator(platform.web_url, trackingId);
    }

    // Fallback to direct URL
    return platform.web_url;
  }

  // Generate unique tracking ID
  private static generateTrackingId(userId: string, showId: number, platform: string): string {
    const timestamp = Date.now().toString(36);
    const userHash = btoa(userId).slice(0, 6);
    const showHash = showId.toString(36);
    const platformHash = platform.toLowerCase().replace(/\s+/g, '').slice(0, 4);
    
    return `${userHash}_${showHash}_${platformHash}_${timestamp}`;
  }
}
