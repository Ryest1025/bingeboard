/**
 * Universal Media Normalizer
 * 
 * Provides consistent normalization of media content across all components.
 * Handles movies, TV shows, and sports content with unified streaming platform
 * normalization and metadata enhancement.
 */

import { 
  RawMedia, 
  NormalizedMedia, 
  MediaType, 
  StreamingPlatform,
  SportsInfo,
  AwardInfo
} from '@/types/media';
import { platformsMatch, normalizePlatformName } from '@/utils/platform-normalizer';

/**
 * Detect media type from raw media data
 */
export function detectMediaType(media: RawMedia): MediaType {
  // Explicit media type
  if (media.media_type) {
    if (media.media_type === 'movie') return 'movie';
    if (media.media_type === 'tv') return 'tv';
  }
  
  // Sports detection
  if (media.sportsLeague || media.homeTeam || media.awayTeam) {
    return 'sports';
  }
  
  // TV show indicators
  if (
    media.episode_count || 
    media.number_of_episodes || 
    media.number_of_seasons ||
    media.first_air_date
  ) {
    return 'tv';
  }
  
  // Default to movie if has release_date or title
  if (media.release_date || media.title) {
    return 'movie';
  }
  
  // Final fallback - assume TV if has name, movie if has title
  return media.name ? 'tv' : 'movie';
}

/**
 * Normalize streaming platforms from various API sources
 */
export function normalizeStreamingPlatforms(media: RawMedia): {
  platforms: StreamingPlatform[];
  normalizedProviders: string[];
} {
  // Collect all streaming sources
  const streamingSources: StreamingPlatform[] = [
    ...(media.streamingPlatforms || []),
    ...(media.streaming || []),
    ...(media.streaming_platforms || []),
    ...(media.raw_streaming_platforms || []),
    ...(media.raw_streamingPlatforms || [])
  ];
  
  // Remove duplicates based on provider_id and provider_name
  const uniquePlatforms = streamingSources.reduce((unique: StreamingPlatform[], platform) => {
    const key = `${platform.provider_id || 0}-${platform.provider_name || platform.name || ''}`;
    const exists = unique.some(p => 
      `${p.provider_id || 0}-${p.provider_name || p.name || ''}` === key
    );
    
    if (!exists) {
      unique.push({
        provider_id: platform.provider_id || unique.length + 1,
        provider_name: platform.provider_name || platform.name || `Platform ${unique.length + 1}`,
        logo_path: platform.logo_path || undefined,
        source: platform.source
      });
    }
    
    return unique;
  }, []);
  
  // Create normalized provider names for consistent filtering
  const normalizedProviders = uniquePlatforms
    .map(p => p.provider_name || p.name || '')
    .filter(Boolean)
    .map(name => normalizePlatformName(name));
  
  return {
    platforms: uniquePlatforms,
    normalizedProviders: Array.from(new Set(normalizedProviders))
  };
}

/**
 * Check if sports content is currently live
 */
export function checkIfLive(media: RawMedia): boolean {
  if (!media.matchTime) return false;
  
  try {
    const matchTime = new Date(media.matchTime);
    const now = new Date();
    const diffMinutes = Math.abs(now.getTime() - matchTime.getTime()) / (1000 * 60);
    
    // Consider live if match started within last 3 hours and hasn't ended
    // (assuming average sports event duration)
    return diffMinutes <= 180 && now >= matchTime;
  } catch {
    return false;
  }
}

/**
 * Get next match time for sports content
 */
export function getNextMatchTime(media: RawMedia): Date | null {
  if (!media.matchTime) return null;
  
  try {
    const matchTime = new Date(media.matchTime);
    const now = new Date();
    
    // Return match time if it's in the future
    return matchTime > now ? matchTime : null;
  } catch {
    return null;
  }
}

/**
 * Extract and normalize award information
 */
export function normalizeAwardInfo(media: RawMedia): AwardInfo {
  const awards = media.awards || {};
  
  return {
    wins: awards.wins || 0,
    nominations: awards.nominations || 0,
    type: awards.type,
    isWinner: awards.isWinner || (awards.wins && awards.wins > 0) || false,
    isAwardNominated: awards.isAwardNominated || (awards.nominations && awards.nominations > 0) || false
  };
}

/**
 * Get display title for any media type
 */
export function getDisplayTitle(media: RawMedia): string {
  return media.title || media.name || 'Untitled';
}

/**
 * Get display date for any media type
 */
export function getDisplayDate(media: RawMedia): string | null {
  const releaseDate = media.release_date || media.first_air_date;
  if (!releaseDate) return null;
  
  try {
    return new Date(releaseDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return releaseDate;
  }
}

/**
 * Check if content is upcoming (future release date)
 */
export function isUpcoming(media: RawMedia): boolean {
  const releaseDate = media.release_date || media.first_air_date;
  if (!releaseDate) return false;
  
  try {
    return new Date(releaseDate) > new Date();
  } catch {
    return false;
  }
}

/**
 * Calculate priority score for sorting
 */
export function calculatePriority(
  awards: AwardInfo,
  streamingCount: number,
  isUpcoming: boolean,
  isLive: boolean
): number {
  let score = 0;
  
  // Live content gets highest priority
  if (isLive) score += 1000;
  
  // Award winners get very high priority
  if (awards.isWinner) score += 500;
  
  // Award nominees get high priority
  if (awards.nominations && awards.nominations > 0) score += 250;
  
  // More streaming platforms = higher availability
  score += streamingCount * 10;
  
  // Upcoming content gets moderate boost
  if (isUpcoming) score += 100;
  
  return score;
}

/**
 * Main normalization function - converts raw media to normalized format
 */
export function normalizeMedia(mediaList: RawMedia[]): NormalizedMedia[] {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 Normalizing ${mediaList.length} media items...`);
  }
  
  return mediaList.map((media, index) => {
    // Detect media type
    const type = detectMediaType(media);
    
    // Normalize streaming platforms
    const { platforms, normalizedProviders } = normalizeStreamingPlatforms(media);
    
    // Handle sports-specific data
    const isLiveContent = type === 'sports' ? checkIfLive(media) : false;
    const nextMatch = type === 'sports' ? getNextMatchTime(media) : null;
    const sportsInfo: SportsInfo | undefined = type === 'sports' ? {
      sportsLeague: media.sportsLeague,
      homeTeam: media.homeTeam,
      awayTeam: media.awayTeam,
      matchTime: media.matchTime,
      isLive: isLiveContent,
      score: media.score,
      venue: media.venue
    } : undefined;
    
    // Normalize award information
    const awards = normalizeAwardInfo(media);
    
    // Calculate derived fields
    const displayTitle = getDisplayTitle(media);
    const displayDate = getDisplayDate(media);
    const upcoming = isUpcoming(media);
    const priority = calculatePriority(awards, platforms.length, upcoming, isLiveContent);
    
    const normalized: NormalizedMedia = {
      // Core identification
      id: typeof media.id === 'string' ? parseInt(media.id) : media.id,
      type,
      displayTitle,
      displayDate,
      
      // Preserve original fields
      title: media.title,
      name: media.name,
      overview: media.overview,
      poster_path: media.poster_path,
      backdrop_path: media.backdrop_path,
      vote_average: media.vote_average || 0,
      vote_count: media.vote_count || 0,
      popularity: media.popularity || 0,
      genre_ids: media.genre_ids || [],
      genres: media.genres,
      release_date: media.release_date,
      first_air_date: media.first_air_date,
      
      // Normalized streaming data
      streaming: platforms,
      normalizedProviders,
      streaming_count: platforms.length,
      
      // Sports data
      isLive: isLiveContent,
      nextMatchTime: nextMatch,
      sportsInfo,
      
      // Enhanced metadata
      isUpcoming: upcoming,
      isAwardWinner: awards.isWinner || false,
      isAwardNominated: awards.isAwardNominated || false,
      awards,
      personalizedScore: media.personalizedScore || Math.random() * 0.5 + 0.5,
      reason: media.reason || 'Recommended for you',
      priority,
      
      // Preserve original for debugging/fallback
      originalData: media
    };
    
    if (process.env.NODE_ENV === 'development' && index < 3) {
      console.log(`✅ Normalized "${displayTitle}" (${type}):`, {
        streaming_count: platforms.length,
        providers: normalizedProviders.slice(0, 3),
        isLive: isLiveContent,
        isUpcoming: upcoming,
        priority
      });
    }
    
    return normalized;
  });
}

/**
 * Batch normalize with performance monitoring
 */
export function normalizeMediaBatch(
  mediaList: RawMedia[], 
  batchSize: number = 50
): NormalizedMedia[] {
  if (mediaList.length <= batchSize) {
    return normalizeMedia(mediaList);
  }
  
  const results: NormalizedMedia[] = [];
  const startTime = Date.now();
  
  for (let i = 0; i < mediaList.length; i += batchSize) {
    const batch = mediaList.slice(i, i + batchSize);
    results.push(...normalizeMedia(batch));
  }
  
  if (process.env.NODE_ENV === 'development') {
    const duration = Date.now() - startTime;
    console.log(`⚡ Batch normalized ${mediaList.length} items in ${duration}ms`);
  }
  
  return results;
}

/**
 * Debug helper for normalization issues
 */
export function debugNormalization(media: RawMedia): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.group(`🔍 Debug normalization for: ${getDisplayTitle(media)}`);
  console.log('Raw media:', media);
  console.log('Detected type:', detectMediaType(media));
  console.log('Streaming platforms:', normalizeStreamingPlatforms(media));
  console.log('Awards:', normalizeAwardInfo(media));
  console.log('Is upcoming:', isUpcoming(media));
  if (detectMediaType(media) === 'sports') {
    console.log('Is live:', checkIfLive(media));
    console.log('Next match:', getNextMatchTime(media));
  }
  console.groupEnd();
}