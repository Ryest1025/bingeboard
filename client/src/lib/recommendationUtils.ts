import { Show } from '@/lib/utils';

interface StreamingPlatform {
  provider_id?: number;
  provider_name?: string;
  name?: string;
  logo_path?: string;
}

interface AwardInfo {
  wins?: number;
  nominations?: number;
  type?: string;
  isWinner?: boolean;
  isAwardNominated?: boolean;
}

export interface NormalizedShow extends Show {
  streaming: StreamingPlatform[];
  streaming_platforms?: StreamingPlatform[];
  awards?: AwardInfo;
  personalizedScore?: number;
  reason?: string;
  isAwardWinner?: boolean;
  isAwardNominated?: boolean;
  isUpcoming?: boolean;
  normalizedReleaseDate?: string;
  priority?: number;
}

export interface RecommendationOptions {
  includeUpcoming?: boolean;
  includeAwards?: boolean;
  includeNonStreaming?: boolean;
  minStreamingPlatforms?: number;
  minRating?: number;
  maxResults?: number;
  userHistory?: Show[];
}

export interface DashboardRecommendations {
  awardWinners: NormalizedShow[];
  awardNominees: NormalizedShow[];
  upcomingShows: NormalizedShow[];
  personalizedRecommendations: NormalizedShow[];
  trendingShows: NormalizedShow[];
  all: NormalizedShow[];
}

/**
 * 1️⃣ Normalize show object for consistent fields
 */
export function normalizeShow(show: any): NormalizedShow {
  const showWithStreaming = show as any;
  
  // Consolidate all possible streaming data sources into a single array
  // Handle the inconsistency between raw_streaming_platforms and raw_streamingPlatforms
  const streamingSources = [
    ...(show.streamingPlatforms || []),
    ...(showWithStreaming.streaming || []),
    ...(show.streaming_platforms || []),
    ...(showWithStreaming.raw_streaming_platforms || []),
    ...(showWithStreaming.raw_streamingPlatforms || [])
  ];

  if (process.env.NODE_ENV === 'development') {
    const hasAnyStreaming = streamingSources.length > 0;
    console.log(`🔍 Normalizing "${show.title || show.name}":`, {
      streamingPlatforms: show.streamingPlatforms?.length || 0,
      streaming: showWithStreaming.streaming?.length || 0,
      streaming_platforms: show.streaming_platforms?.length || 0,
      raw_streaming_platforms: showWithStreaming.raw_streaming_platforms?.length || 0,
      raw_streamingPlatforms: showWithStreaming.raw_streamingPlatforms?.length || 0,
      totalSources: streamingSources.length,
      hasAnyStreaming
    });
  }

  // Remove duplicates based on provider_id and provider_name
  const uniqueStreaming = streamingSources.reduce((unique: StreamingPlatform[], platform) => {
    const key = `${platform.provider_id || 0}-${platform.provider_name || platform.name || ''}`;
    const exists = unique.some(p => 
      `${p.provider_id || 0}-${p.provider_name || p.name || ''}` === key
    );
    
    if (!exists) {
      unique.push({
        provider_id: platform.provider_id || unique.length + 1,
        provider_name: platform.provider_name || platform.name || `Platform ${unique.length + 1}`,
        logo_path: platform.logo_path || null
      });
    }
    
    return unique;
  }, []);

  // Extract award information
  const awards = extractAwardInfo(show);
  
  // Determine if upcoming (release date in the future)
  const releaseDate = show.release_date || show.first_air_date || null;
  const isUpcoming = releaseDate ? new Date(releaseDate) > new Date() : false;

  const normalizedShow = {
    ...show,
    id: typeof show.id === 'string' ? parseInt(show.id) : show.id,
    streaming: uniqueStreaming,
    awards,
    personalizedScore: show.personalizedScore || Math.random() * 0.5 + 0.5,
    reason: show.reason || 'Recommended for you',
    isAwardWinner: awards.isWinner || false,
    isAwardNominated: (awards.nominations && awards.nominations > 0) || awards.isAwardNominated || false,
    isUpcoming,
    normalizedReleaseDate: releaseDate,
    priority: calculatePriority(awards, uniqueStreaming, isUpcoming)
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Normalized "${show.title || show.name}": ${uniqueStreaming.length} streaming platforms`, {
      platforms: uniqueStreaming.map(p => p.provider_name),
      sources: {
        streamingPlatforms: show.streamingPlatforms?.length || 0,
        streaming: showWithStreaming.streaming?.length || 0,
        streaming_platforms: show.streaming_platforms?.length || 0,
        raw_streaming_platforms: showWithStreaming.raw_streaming_platforms?.length || 0,
        raw_streamingPlatforms: showWithStreaming.raw_streamingPlatforms?.length || 0
      }
    });
  }

  return normalizedShow;
}

/**
 * Calculate priority score for sorting
 */
function calculatePriority(awards: AwardInfo, streaming: StreamingPlatform[], isUpcoming: boolean): number {
  let score = 0;
  
  // Award winners get highest priority
  if (awards.isWinner) score += 100;
  
  // Award nominees get high priority
  if (awards.nominations && awards.nominations > 0) score += 50;
  
  // Shows with more streaming platforms get slight boost
  score += streaming.length * 2;
  
  // Upcoming shows get moderate priority
  if (isUpcoming) score += 20;
  
  return score;
}

/**
 * 2️⃣ Remove duplicate shows by ID
 */
export function deduplicateShows(shows: NormalizedShow[]): NormalizedShow[] {
  const uniqueMap = new Map<number, NormalizedShow>();
  
  shows.forEach(show => {
    const id = typeof show.id === 'string' ? parseInt(show.id) : show.id;
    const existingShow = uniqueMap.get(id);
    
    // Keep the show with more streaming platforms or higher priority
    if (!existingShow || show.priority! > existingShow.priority! || show.streaming.length > existingShow.streaming.length) {
      uniqueMap.set(id, show);
    }
  });
  
  return Array.from(uniqueMap.values());
}

/**
 * 3️⃣ Filter shows by streaming availability
 */
export function filterStreamingShows(shows: NormalizedShow[], minPlatforms = 1): NormalizedShow[] {
  return shows.filter(show => show.streaming.length >= minPlatforms);
}

/**
 * 4️⃣ Filter shows by user watch history
 */
export function filterUnwatchedShows(shows: NormalizedShow[], userHistory: Show[] = []): NormalizedShow[] {
  if (userHistory.length === 0) return shows;
  
  const watchedIds = new Set(userHistory.map(show => show.id));
  return shows.filter(show => !watchedIds.has(show.id));
}

/**
 * Extract award information from various show data structures
 */
const extractAwardInfo = (show: any): AwardInfo => {
  // Check for award data in different possible locations
  if (show.awards) {
    return {
      wins: show.awards.wins || 0,
      nominations: show.awards.nominations || 0,
      type: show.awards.type,
      isWinner: show.awards.isWinner || false
    };
  }

  if (show.isWinner || show.type === 'Winner') {
    return {
      wins: 1,
      nominations: 0,
      type: 'Winner',
      isWinner: true
    };
  }

  if (show.type === 'Nominated') {
    return {
      wins: 0,
      nominations: 1,
      type: 'Nominated',
      isWinner: false
    };
  }

  return {
    wins: 0,
    nominations: 0,
    isWinner: false
  };
};



/**
 * 5️⃣ Build comprehensive recommendation system
 */
export function buildDashboardRecommendations(
  allShows: Show[],
  options: RecommendationOptions = {}
): DashboardRecommendations {
  const {
    includeUpcoming = true,
    includeAwards = true,
    includeNonStreaming = false,
    minStreamingPlatforms = 1,
    minRating = 0,
    maxResults = 50,
    userHistory = []
  } = options;

  console.log('🎯 Building dashboard recommendations:', {
    totalShows: allShows.length,
    options
  });

  // Step 1: Normalize all shows
  const normalized = allShows.map(normalizeShow);
  console.log('✅ Normalized shows:', normalized.length);

  // Step 2: Deduplicate
  const deduplicated = deduplicateShows(normalized);
  console.log('✅ Deduplicated shows:', deduplicated.length);

  // Step 3: Filter out watched shows
  const unwatched = filterUnwatchedShows(deduplicated, userHistory);
  console.log('✅ Unwatched shows:', unwatched.length);

  // Step 4: Categorize shows
  const awardWinners = unwatched.filter(show => show.isAwardWinner);
  const awardNominees = unwatched.filter(show => show.isAwardNominated && !show.isAwardWinner);
  const upcomingShows = unwatched.filter(show => show.isUpcoming);
  
  // Step 5: Get streaming-available shows for personalized recommendations
  const streamingShows = includeNonStreaming 
    ? unwatched 
    : filterStreamingShows(unwatched, minStreamingPlatforms);
  
  console.log('✅ Filtered shows with streaming:', streamingShows.length);
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Streaming breakdown:', {
      withStreaming: streamingShows.filter(s => s.streaming.length > 0).length,
      withoutStreaming: streamingShows.filter(s => s.streaming.length === 0).length,
      examples: streamingShows.slice(0, 3).map(s => ({
        title: s.title || s.name,
        streamingCount: s.streaming.length,
        platforms: s.streaming.map(p => p.provider_name).join(', ')
      }))
    });
  }
  
  // Filter by rating if specified
  const ratedShows = streamingShows.filter(show => 
    (show.vote_average || 0) >= minRating
  );

  // Step 6: Create personalized recommendations (exclude awards and upcoming from main recs)
  const personalizedRecommendations = ratedShows
    .filter(show => !show.isAwardWinner && !show.isAwardNominated && !show.isUpcoming)
    .sort((a, b) => {
      // Sort by personalized score, then rating, then streaming availability
      const scoreA = (a.personalizedScore || 0) + (a.vote_average || 0) / 10 + a.streaming.length;
      const scoreB = (b.personalizedScore || 0) + (b.vote_average || 0) / 10 + b.streaming.length;
      return scoreB - scoreA;
    })
    .slice(0, maxResults);

  // Step 7: Get trending shows (recent, high-rated, with streaming)
  const trendingShows = ratedShows
    .filter(show => {
      const releaseDate = new Date(show.normalizedReleaseDate || '1970-01-01');
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return releaseDate >= sixMonthsAgo && (show.vote_average || 0) >= 7;
    })
    .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
    .slice(0, 12);

  const result: DashboardRecommendations = {
    awardWinners: awardWinners.slice(0, 12),
    awardNominees: awardNominees.slice(0, 12),
    upcomingShows: upcomingShows.slice(0, 12),
    personalizedRecommendations,
    trendingShows,
    all: deduplicated
  };

  console.log('✅ Dashboard recommendations built:', {
    awardWinners: result.awardWinners.length,
    awardNominees: result.awardNominees.length,
    upcomingShows: result.upcomingShows.length,
    personalizedRecommendations: result.personalizedRecommendations.length,
    trendingShows: result.trendingShows.length,
    total: result.all.length
  });

  return result;
}

/**
 * Legacy function for backward compatibility
 */
export const getRecommendedShows = (allShows: Show[], options?: {
  includeNonStreaming?: boolean;
  maxResults?: number;
  sortBy?: 'awards' | 'streaming' | 'recent' | 'personalized';
}): NormalizedShow[] => {
  const recommendations = buildDashboardRecommendations(allShows, {
    includeNonStreaming: options?.includeNonStreaming,
    maxResults: options?.maxResults
  });
  
  return recommendations.personalizedRecommendations;
};

/**
 * Get the primary streaming platform for a show
 */
export const getPrimaryStreamingPlatform = (show: NormalizedShow): StreamingPlatform | null => {
  if (!show.streaming || show.streaming.length === 0) return null;

  // Platform priority ranking
  const platformPriority: Record<string, number> = {
    "Netflix": 10,
    "Disney+": 9,
    "Disney Plus": 9,
    "Amazon Prime Video": 8,
    "Prime Video": 8,
    "HBO Max": 7,
    "Max": 7,
    "Apple TV+": 6,
    "Apple TV Plus": 6,
    "Apple TV": 6,
    "Hulu": 5,
    "Paramount+": 4,
    "Paramount Plus": 4,
    "Peacock": 3,
    "Crunchyroll": 2,
    "Discovery+": 1,
    "Discovery Plus": 1
  };

  return show.streaming.reduce((best, current) => {
    const currentPriority = platformPriority[current.provider_name || ''] || 0;
    const bestPriority = platformPriority[best.provider_name || ''] || 0;
    return currentPriority > bestPriority ? current : best;
  });
};

/**
 * Get award display information
 */
export const getAwardDisplayInfo = (show: NormalizedShow): {
  hasAwards: boolean;
  badgeText: string;
  badgeColor: string;
  emoji: string;
} => {
  const awards = show.awards;
  if (!awards) return { hasAwards: false, badgeText: '', badgeColor: '', emoji: '' };

  if (awards.wins && awards.wins > 0) {
    return {
      hasAwards: true,
      badgeText: `${awards.wins} Win${awards.wins > 1 ? 's' : ''}`,
      badgeColor: 'bg-yellow-400 text-black',
      emoji: '🏆'
    };
  }

  if (awards.nominations && awards.nominations > 0) {
    return {
      hasAwards: true,
      badgeText: `${awards.nominations} Nom${awards.nominations > 1 ? 's' : ''}`,
      badgeColor: 'bg-gray-200 text-black',
      emoji: '✨'
    };
  }

  return { hasAwards: false, badgeText: '', badgeColor: '', emoji: '' };
};

export type { StreamingPlatform, AwardInfo };