import { TMDBService } from './tmdb.js';
import { WatchmodeService } from './watchmodeService.js';
import {
  searchStreamingAvailability,
  getStreamingByImdbId,
  StreamingLocation,
  UtellyResult
} from '../clients/utellyClient.js';
import {
  getShowByTmdbId,
  convertStreamingAvailabilityToPlatforms,
  StreamingAvailabilityOption
} from '../clients/streamingAvailabilityClient.js';
import { streamingCache } from '../cache/streaming-cache.js';

/**
 * Normalized streaming platform coming from TMDB, Watchmode and Utelly.
 * Marked readonly to prevent accidental mutation after aggregation / caching.
 */
export interface EnhancedStreamingPlatform {
  readonly provider_id: number;
  readonly provider_name: string;
  readonly logo_path?: string;
  readonly type: 'sub' | 'buy' | 'rent' | 'free';
  readonly web_url?: string;
  readonly ios_url?: string;
  readonly android_url?: string;
  readonly price?: number;
  readonly format?: string;
  readonly source: 'tmdb' | 'watchmode' | 'utelly' | 'streaming-availability';
  readonly affiliate_supported: boolean;
  readonly commission_rate?: number;
}

interface StreamingAvailabilityResponse {
  readonly tmdbId: number;
  readonly title: string;
  readonly platforms: EnhancedStreamingPlatform[];
  readonly totalPlatforms: number;
  readonly affiliatePlatforms: number;
  readonly premiumPlatforms: number;
  readonly freePlatforms: number;
  readonly sources: {
    tmdb: boolean;
    watchmode: boolean;
    utelly: boolean;
    streamingAvailability: boolean;
  };
}

// Subset of TMDB watch provider response we rely upon (keeps external dependency light)
interface TMDBWatchProvidersResponse {
  results?: Record<string, {
    flatrate?: Array<{ provider_id: number; provider_name: string; logo_path?: string }>;
    buy?: Array<{ provider_id: number; provider_name: string; logo_path?: string }>;
    rent?: Array<{ provider_id: number; provider_name: string; logo_path?: string }>;
  }>;
}

// Simple logger interface for injection / test mocking
/* ignore-unused-export (consumed indirectly by dependency injection & tests) */
export interface Logger {
  info(message?: any, ...optional: any[]): void;
  warn(message?: any, ...optional: any[]): void;
  error(message?: any, ...optional: any[]): void;
  debug?(message?: any, ...optional: any[]): void;
  log?(message?: any, ...optional: any[]): void;
}

// Export normalization helper for tests & external consumers (kept pure)
/* ignore-unused-export (used by tests) */
export function normalizePlatformName(name: string): string {
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

export class MultiAPIStreamingService {
  private static tmdbService = new TMDBService();
  // Pluggable logger (defaults to console) so production can inject structured logger
  private static logger: Logger = console;

  // Concurrency limiter (simple semaphore) configurable via env STREAMING_CONCURRENCY
  private static maxConcurrency = parseInt(process.env.STREAMING_CONCURRENCY || '5', 10);
  private static activeCount = 0;
  private static queue: Array<() => void> = [];
  private static batchDelayMs = parseInt(process.env.STREAMING_BATCH_DELAY_MS || '0', 10);
  private static batchSizeOverride = parseInt(process.env.STREAMING_BATCH_SIZE || '0', 10);

  private static runWithLimit<T>(fn: () => Promise<T>): Promise<T> {
    if (this.activeCount < this.maxConcurrency) {
      this.activeCount++;
      return fn().finally(() => {
        this.activeCount--;
        const next = this.queue.shift();
        if (next) next();
      });
    }
    return new Promise<T>(resolve => {
      this.queue.push(() => {
        this.activeCount++;
        fn().then(resolve).catch((err) => { throw err; }).finally(() => {
          this.activeCount--;
          const next = this.queue.shift();
          if (next) next();
        });
      });
    });
  }

  /** Inject custom logger */
  static setLogger(logger: Logger) {
    this.logger = logger;
  }

  /** Adjust concurrency at runtime */
  static setConcurrency(limit: number) {
    if (limit > 0) this.maxConcurrency = limit;
  }

  /** Configure batch delay & preferred batch size (for external tuning) */
  static setBatchConfig({ delayMs, batchSize }: { delayMs?: number; batchSize?: number }) {
    if (typeof delayMs === 'number' && delayMs >= 0) this.batchDelayMs = delayMs;
    if (typeof batchSize === 'number' && batchSize > 0) this.batchSizeOverride = batchSize;
  }

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
  private static normalizePlatformName(name: string): string { return normalizePlatformName(name); }

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

  /**
   * Get comprehensive streaming availability combining TMDB, Watchmode & Utelly.
   * Cache key: (tmdbId, mediaType) – title / imdbId are assumed stable for a TMDB id+type.
   * If that assumption changes (e.g. localized title variants), expand cache key.
   */
  static async getComprehensiveAvailability(
    tmdbId: number,
    title: string,
    mediaType: 'movie' | 'tv' = 'tv',
    imdbId?: string
  ): Promise<StreamingAvailabilityResponse> {
    // 🚀 Cache lookup (see cache key note above)
    const cachedResult = streamingCache.get(tmdbId, mediaType);
    if (cachedResult) {
      return cachedResult;
    }

    const allPlatforms: EnhancedStreamingPlatform[] = [];
    const sources = { tmdb: false, watchmode: false, utelly: false, streamingAvailability: false };

    // 1. Get TMDB watch providers (normalize type based on flatrate|buy|rent arrays)
    try {
      const tmdbData = await this.tmdbService.getWatchProviders(mediaType, tmdbId) as TMDBWatchProvidersResponse;
      const us = tmdbData.results?.US;
      // Build unified list with explicit type mapping
      const tmdbProviders = [
        ...(us?.flatrate?.map(p => ({ ...p, type: 'sub' as const })) || []),
        ...(us?.buy?.map(p => ({ ...p, type: 'buy' as const })) || []),
        ...(us?.rent?.map(p => ({ ...p, type: 'rent' as const })) || [])
      ];

      if (tmdbProviders.length > 0) {
        sources.tmdb = true;
        tmdbProviders.forEach(provider => {
          const normalizedName = this.normalizePlatformName(provider.provider_name);
          allPlatforms.push({
            provider_id: provider.provider_id,
            provider_name: normalizedName,
            logo_path: provider.logo_path,
            type: provider.type,
            source: 'tmdb',
            affiliate_supported: this.hasAffiliateSupport(normalizedName),
            commission_rate: this.getCommissionRate(normalizedName)
          });
        });
      }
    } catch (error) {
      this.logger.warn('TMDB watch providers failed:', error);
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
      this.logger.warn('Watchmode availability failed:', error);
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
      this.logger.warn('Utelly availability failed:', error);
    }

    // 4. Get Streaming Availability API data
    try {
      const streamingAvailabilityData = await getShowByTmdbId(mediaType, tmdbId, 'us');
      
      if (streamingAvailabilityData.show && 
          streamingAvailabilityData.show.streamingOptions && 
          streamingAvailabilityData.show.streamingOptions.us && 
          streamingAvailabilityData.show.streamingOptions.us.length > 0) {
        sources.streamingAvailability = true;
        const streamingAvailabilityPlatforms = convertStreamingAvailabilityToPlatforms(
          streamingAvailabilityData.show.streamingOptions.us
        );
        
        // Convert to our EnhancedStreamingPlatform format
        streamingAvailabilityPlatforms.forEach(platform => {
          const normalizedName = this.normalizePlatformName(platform.provider_name);
          allPlatforms.push({
            provider_id: parseInt(platform.provider_id) || 0,
            provider_name: normalizedName,
            logo_path: platform.logo_path,
            type: platform.type,
            web_url: platform.web_url,
            source: 'streaming-availability',
            affiliate_supported: this.hasAffiliateSupport(normalizedName),
            commission_rate: this.getCommissionRate(normalizedName),
            price: platform.price
          });
        });
      }
    } catch (error) {
      this.logger.warn('Streaming Availability API failed:', error);
    }

    // 5. Deduplicate platforms by name (keep the one with most data)
    const platformMap = new Map<string, EnhancedStreamingPlatform>();

    allPlatforms.forEach(platform => {
      // Dedupe key includes source + optional domain (if web_url) to reduce accidental collisions
      const domain = (platform as any).web_url ? (()=>{ try { return new URL((platform as any).web_url).hostname; } catch { return ''; } })() : '';
      const key = `${platform.provider_name.toLowerCase()}::${platform.source}${domain ? '::'+domain : ''}`;
      const existing = platformMap.get(key);

      if (!existing || this.getPlatformScore(platform) > this.getPlatformScore(existing)) {
        platformMap.set(key, platform);
      }
    });

    const finalPlatforms = Array.from(platformMap.values());

    // 6. Calculate statistics
  const affiliatePlatforms = finalPlatforms.filter(p => p.affiliate_supported).length;
  const premiumPlatforms = finalPlatforms.filter(p => p.type === 'sub' || (p.price !== undefined && p.price > 0)).length;
  const freePlatforms = finalPlatforms.filter(p => p.type === 'free' || (p.price !== undefined && p.price === 0)).length;

  const result: StreamingAvailabilityResponse = {
      tmdbId,
      title,
      platforms: finalPlatforms,
      totalPlatforms: finalPlatforms.length,
      affiliatePlatforms,
      premiumPlatforms,
      freePlatforms,
      sources
    };

    // 🚀 Cache the result for future requests (30 minute TTL)
    streamingCache.set(tmdbId, mediaType, result, 30 * 60 * 1000);

    return result;
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

  /**
   * Batch availability with simple concurrency (batchSize). For heavier load, replace with
   * a queue + token bucket (TODO: integrate generic rate limiter).
   */
  static async getBatchAvailability(
    titles: Array<{ tmdbId: number; title: string; mediaType: 'movie' | 'tv'; imdbId?: string }>
  ): Promise<Map<number, StreamingAvailabilityResponse>> {
    const results = new Map<number, StreamingAvailabilityResponse>();
    const batchSize = this.batchSizeOverride > 0 ? this.batchSizeOverride : titles.length;
    for (let i = 0; i < titles.length; i += batchSize) {
      const slice = titles.slice(i, i + batchSize);
      const wrapped = slice.map(({ tmdbId, title, mediaType, imdbId }) =>
        this.runWithLimit(() => this.getComprehensiveAvailability(tmdbId, title, mediaType, imdbId)
          .then(av => ({ tmdbId, av }))
          .catch(err => { this.logger.error(`Failed availability for ${title}`, err); return { tmdbId, av: null as any }; })
        )
      );
      const settled = await Promise.all(wrapped);
      settled.forEach(r => { if (r.av) results.set(r.tmdbId, r.av); });
      if (this.batchDelayMs > 0 && i + batchSize < titles.length) {
        await new Promise(r => setTimeout(r, this.batchDelayMs));
      }
    }
    return results;
  }

  /**
   * Generate platform-specific affiliate URL. If platform supports affiliate commissions
   * but no explicit template exists, append a generic ref parameter.
   */
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

  // Generic fallback for supported platforms without explicit mapping
  const separator = platform.web_url.includes('?') ? '&' : '?';
  const genericUrl = `${platform.web_url}${separator}ref=BINGEBOARD_${trackingId}`;
  this.logger.info(`[affiliate] Generic affiliate URL applied for platform without template: ${platform.provider_name}`);
  return genericUrl;
  }

  // Generate unique tracking ID
  private static generateTrackingId(userId: string, showId: number, platform: string): string {
    const timestamp = Date.now().toString(36);
    // Environment-agnostic unicode -> base64 short hash
    const utf8ToBase64 = (str: string) => {
      try {
        if (typeof Buffer !== 'undefined') {
          return Buffer.from(str, 'utf8').toString('base64').replace(/=+$/,'');
        }
      } catch { /* ignore */ }
      try { return btoa(unescape(encodeURIComponent(str))); } catch { return btoa(str.replace(/[^\x00-\x7F]/g,'')); }
    };
    const userHash = utf8ToBase64(userId).slice(0,6);
    const showHash = showId.toString(36);
    const platformHash = platform.toLowerCase().replace(/\s+/g, '').slice(0, 4);
    const randomHash = Math.random().toString(36).slice(2, 8);
    return `${userHash}_${showHash}_${platformHash}_${timestamp}_${randomHash}`;
  }

  /** Public readonly access to platform scoring for tests */
  static scorePlatformForTest(p: EnhancedStreamingPlatform) { return this.getPlatformScore(p); }

  /** Expose cache stats for observability */
  static getCacheStats() {
    try {
      if (typeof (streamingCache as any).getDetailedStats === 'function') {
        return (streamingCache as any).getDetailedStats();
      }
      return (streamingCache as any).getStats?.() || {};
    } catch {
      return {};
    }
  }

  // =============================
  // Preference-Aware Enhancements
  // =============================
  /** User preference shape for filtering streaming availability */
  /* ignore-unused-export (used by routes & test scripts) */
  static UserPreferencesExample: UserPreferences | undefined; // no-op sentinel to keep type exported in emitted JS
}

// Exported outside the class so it can be imported as a type without side-effects
/* ignore-unused-export (consumed by test route & scripts) */
export interface UserPreferences {
  /** Only include these platform names (after normalization). If empty/undefined, no inclusion filter. */
  preferredPlatforms?: string[];
  /** Exclude these platform names (after normalization). */
  excludedPlatforms?: string[];
  /** Restrict to these subscription types (sub|buy|rent|free). */
  subscriptionTypes?: Array<'sub' | 'buy' | 'rent' | 'free'>;
  /** When true, only keep platforms with affiliate_supported=true. */
  onlyAffiliateSupported?: boolean;
}

// Extend the service with preference-aware methods (appended after declaration to avoid cluttering core logic region)
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MultiAPIStreamingService {
  /** Apply user preference filters to an availability response */
  function applyPreferences(
    base: Awaited<ReturnType<typeof MultiAPIStreamingService.getComprehensiveAvailability>>,
    prefs?: UserPreferences
  ) {
    if (!prefs) return base; // no filtering
    const {
      preferredPlatforms,
      excludedPlatforms,
      subscriptionTypes,
      onlyAffiliateSupported
    } = prefs;

    const includeSet = preferredPlatforms?.length ? new Set(preferredPlatforms.map(p => p.toLowerCase())) : null;
    const excludeSet = excludedPlatforms?.length ? new Set(excludedPlatforms.map(p => p.toLowerCase())) : null;
    const typeSet = subscriptionTypes?.length ? new Set(subscriptionTypes) : null;

    const filtered = base.platforms.filter(p => {
      if (onlyAffiliateSupported && !p.affiliate_supported) return false;
      if (includeSet && !includeSet.has(p.provider_name.toLowerCase())) return false;
      if (excludeSet && excludeSet.has(p.provider_name.toLowerCase())) return false;
      if (typeSet && !typeSet.has(p.type)) return false;
      return true;
    });

    // Recompute stats with filtered list (sources remain original to show coverage provenance)
    const affiliatePlatforms = filtered.filter(p => p.affiliate_supported).length;
    const premiumPlatforms = filtered.filter(p => p.type === 'sub' || (p.price !== undefined && p.price > 0)).length;
    const freePlatforms = filtered.filter(p => p.type === 'free' || (p.price !== undefined && p.price === 0)).length;

    return Object.assign({}, base, {
      platforms: filtered,
      totalPlatforms: filtered.length,
      affiliatePlatforms,
      premiumPlatforms,
      freePlatforms,
      preferenceMeta: {
        originalTotal: base.totalPlatforms,
        filteredOut: base.totalPlatforms - filtered.length
      }
    }) as (typeof base & { preferenceMeta: { originalTotal: number; filteredOut: number } });
  }

  /** Get availability filtered by user preferences */
  export async function getPreferenceAwareAvailability(
    tmdbId: number,
    title: string,
    mediaType: 'movie' | 'tv' = 'tv',
    prefs?: UserPreferences,
    imdbId?: string
  ) {
    const base = await MultiAPIStreamingService.getComprehensiveAvailability(tmdbId, title, mediaType, imdbId);
    return applyPreferences(base, prefs);
  }

  /** Batch availability with preferences applied per title */
  export async function getBatchAvailabilityWithPreferences(
    titles: Array<{ tmdbId: number; title: string; mediaType: 'movie' | 'tv'; imdbId?: string }>,
    prefs?: UserPreferences
  ) {
    const map = await MultiAPIStreamingService.getBatchAvailability(titles);
    // Transform each entry with preferences
    const transformed = new Map<number, ReturnType<typeof applyPreferences>>();
    map.forEach((val, key) => {
      transformed.set(key, applyPreferences(val, prefs));
    });
    return transformed;
  }
}
