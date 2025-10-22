/**
 * Recommendation Sources Service
 * 
 * This module provides the three main recommendation systems:
 * 1. TMDB-based recommendations (trending, discover, similar)
 * 2. AI-powered recommendations (OpenAI + user preferences)
 * 3. Friends-based recommendations (social collaborative filtering)
 */

import { TMDBService } from './tmdb';
import { AIRecommendationService } from './aiRecommendations';
import { EnhancedAIEngine } from './enhancedAI';
import { RecommendationMetrics } from './recommendationMetrics';
import { db } from '../db';
import { watchlists, friendships, users } from '../../shared/schema';
import { eq, and, inArray, desc } from 'drizzle-orm';
import crypto from 'crypto';

// Initialize services
const tmdb = new TMDBService();

// TMDB Genre ID mapping for filter conversion
const GENRE_MAP: Record<string, number> = {
  'Action': 10759,
  'Adventure': 10759, 
  'Comedy': 35,
  'Drama': 18,
  'Crime': 80,
  'Documentary': 99,
  'Family': 10751,
  'Mystery': 9648,
  'Romance': 10749,
  'Sci-Fi': 10765,
  'Fantasy': 10765,
  'Thriller': 53,
  'Horror': 27,
  'Animation': 16,
  'Western': 37,
  'Biography': 99,
  'History': 36,
  'Music': 10402,
  'Sport': 99,
  'War': 10768
};

// Platform ID mapping for TMDB watch providers
const PLATFORM_MAP: Record<string, number> = {
  'netflix': 8,
  'hulu': 15,
  'amazon': 119,
  'amazon_prime': 119,
  'hbo': 384,
  'hbo_max': 384,
  'max': 384,
  'disney': 337,
  'disney_plus': 337,
  'apple': 350,
  'apple_tv': 350,
  'paramount': 531,
  'paramount_plus': 531,
  'peacock': 386,
  'showtime': 37,
  'starz': 43
};

/**
 * Fetch TMDB-based recommendations with filters applied
 */
export async function fetchTMDBRecommendations(
  userId: string, 
  filters: Record<string, any>, 
  userProfile: any
): Promise<any[]> {
  console.log('🎬 FETCHING TMDB RECOMMENDATIONS:', { userId, filters });

  try {
    // Build TMDB discover parameters from filters
    const tmdbParams: any = {
      page: 1,
      sort_by: 'popularity.desc',
      include_adult: false,
      language: 'en-US',
      'vote_count.gte': 100 // Minimum votes for quality
    };

    // Apply genre filter
    if (filters.genre) {
      const genreId = GENRE_MAP[filters.genre];
      if (genreId) {
        tmdbParams.with_genres = genreId.toString();
        console.log(`🎭 Applied genre filter: ${filters.genre} → ID ${genreId}`);
      }
    }

    // Apply year filter
    if (filters.year) {
      const yearInt = parseInt(filters.year);
      if (!isNaN(yearInt)) {
        tmdbParams.primary_release_year = yearInt;
        tmdbParams.first_air_date_year = yearInt;
        console.log(`📅 Applied year filter: ${yearInt}`);
      }
    }

    // Apply platform filter
    if (filters.platform) {
      const platformId = PLATFORM_MAP[filters.platform.toLowerCase()];
      if (platformId) {
        tmdbParams.with_watch_providers = platformId.toString();
        tmdbParams.watch_region = 'US';
        console.log(`📺 Applied platform filter: ${filters.platform} → ID ${platformId}`);
      }
    }

    // Apply rating filter
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      if (!isNaN(minRating)) {
        tmdbParams['vote_average.gte'] = minRating;
        console.log(`⭐ Applied rating filter: minimum ${minRating}`);
      }
    }

    // Apply hideWatched filter using user's viewing history
    if (filters.hideWatched && userProfile.viewingHistory?.length > 0) {
      // TMDB doesn't support excluding specific IDs, so we'll filter post-fetch
      console.log('👁️ HideWatched filter will be applied post-fetch');
    }

    console.log('🔍 Final TMDB discover params:', tmdbParams);

    // Fetch from multiple TMDB endpoints for variety
    const [tvResults, movieResults, trendingResults] = await Promise.allSettled([
      tmdb.discover('tv', tmdbParams),
      tmdb.discover('movie', { ...tmdbParams, primary_release_year: tmdbParams.first_air_date_year }),
      tmdb.getTrending('tv', 'day')
    ]);

    // Combine results
    let allResults: any[] = [];

    if (tvResults.status === 'fulfilled') {
      allResults.push(...(tvResults.value.results || []).map((item: any) => ({ 
        ...item, 
        media_type: 'tv',
        source: 'tmdb_discover_tv'
      })));
    }

    if (movieResults.status === 'fulfilled') {
      allResults.push(...(movieResults.value.results || []).map((item: any) => ({ 
        ...item, 
        media_type: 'movie',
        source: 'tmdb_discover_movie'
      })));
    }

    if (trendingResults.status === 'fulfilled' && allResults.length < 10) {
      // Add trending content if we don't have enough results
      allResults.push(...(trendingResults.value.results || []).slice(0, 10).map((item: any) => ({ 
        ...item, 
        media_type: 'tv',
        source: 'tmdb_trending'
      })));
    }

    // Apply post-fetch filters
    if (filters.hideWatched && userProfile.viewingHistory?.length > 0) {
      const watchedIds = new Set(
        userProfile.viewingHistory.map((item: any) => item.tmdbId || item.id).filter(Boolean)
      );
      allResults = allResults.filter(item => !watchedIds.has(item.id));
      console.log(`🚫 Filtered out ${watchedIds.size} watched items`);
    }

    // Transform to standardized format
    const recommendations = allResults.slice(0, 20).map(item => ({
      tmdbId: item.id,
      title: item.title || item.name,
      overview: item.overview,
      posterPath: item.poster_path,
      backdropPath: item.backdrop_path,
      voteAverage: item.vote_average,
      releaseDate: item.release_date || item.first_air_date,
      genreIds: item.genre_ids || [],
      mediaType: item.media_type,
      reason: `${item.source.replace('tmdb_', '').replace('_', ' ')} recommendation`,
      score: (item.vote_average || 5) / 10, // Normalize to 0-1
      confidence: 0.8,
      source: 'tmdb'
    }));

    console.log(`🎬 TMDB returned ${recommendations.length} recommendations`);
    return recommendations;

  } catch (error: any) {
    console.error('❌ TMDB recommendations failed:', error);
    
    // Fallback to popular content
    try {
      const popular = await tmdb.getPopular('tv');
      const fallbackRecs = (popular.results || []).slice(0, 10).map((item: any) => ({
        tmdbId: item.id,
        title: item.name,
        overview: item.overview,
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        voteAverage: item.vote_average,
        releaseDate: item.first_air_date,
        genreIds: item.genre_ids || [],
        mediaType: 'tv',
        reason: 'Popular fallback recommendation',
        score: (item.vote_average || 5) / 10,
        confidence: 0.6,
        source: 'tmdb_fallback'
      }));
      
      console.log(`🔄 TMDB fallback returned ${fallbackRecs.length} recommendations`);
      return fallbackRecs;
      
    } catch (fallbackError) {
      console.error('❌ TMDB fallback also failed:', fallbackError);
      return [];
    }
  }
}

/**
 * Fetch AI-powered recommendations with filters applied
 * NOW WITH ENHANCED MULTI-MODEL AI ENGINE
 */
export async function fetchAIRecommendations(
  userId: string, 
  filters: Record<string, any>, 
  userProfile: any
): Promise<any[]> {
  console.log('🤖 FETCHING ENHANCED AI RECOMMENDATIONS:', { userId, filters });

  try {
    // Check if AI service is available
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️ No AI APIs configured, using fallback');
      return await useFallbackAI(userId, filters, userProfile);
    }

    // Step 1: Analyze user behavioral patterns
    const behavioralPatterns = await EnhancedAIEngine.analyzeBehavioralPatterns(userProfile);

    // Step 2: Get available shows (from TMDB or cache)
    const availableShows = await getAvailableShows(filters);
    
    if (availableShows.length === 0) {
      console.log('⚠️ No available shows found, using fallback');
      return await useFallbackAI(userId, filters, userProfile);
    }

    // Step 3: Prepare context
    const context = {
      mood: filters.mood || filters.genre,
      timeOfDay: filters.timeOfDay,
      filters: filters
    };

    // Step 4: Generate ensemble recommendations using multiple AI models
    const enhancedRecs = await EnhancedAIEngine.generateEnsembleRecommendations(
      userProfile,
      availableShows,
      behavioralPatterns,
      context
    );

    // Step 5: Log recommendations for metrics tracking
    const recommendationId = generateRecommendationId();
    enhancedRecs.forEach((rec, index) => {
      RecommendationMetrics.logRecommendation({
        userId,
        recommendationId,
        tmdbId: rec.tmdbId,
        source: 'ai',
        aiModel: rec.aiModel,
        score: rec.score,
        rank: index + 1,
        timestamp: new Date()
      });
    });

    // Step 6: Transform to standardized format
    const recommendations = enhancedRecs.map(rec => ({
      tmdbId: rec.tmdbId,
      title: rec.title,
      overview: rec.explanations?.why || rec.reason,
      posterPath: availableShows.find(s => s.id === rec.tmdbId)?.poster_path,
      backdropPath: availableShows.find(s => s.id === rec.tmdbId)?.backdrop_path,
      voteAverage: availableShows.find(s => s.id === rec.tmdbId)?.vote_average || 7.0,
      releaseDate: availableShows.find(s => s.id === rec.tmdbId)?.first_air_date,
      genreIds: availableShows.find(s => s.id === rec.tmdbId)?.genre_ids || [],
      mediaType: 'tv',
      reason: rec.reason,
      score: rec.score,
      confidence: rec.confidence,
      source: 'ai',
      aiModel: rec.aiModel,
      personalityFit: rec.personalityFit,
      matchFactors: rec.matchFactors,
      explanations: rec.explanations
    }));

    console.log(`🤖 Enhanced AI returned ${recommendations.length} high-quality recommendations`);
    return recommendations;

  } catch (error: any) {
    console.error('❌ Enhanced AI recommendations failed:', error);
    return await useFallbackAI(userId, filters, userProfile);
  }
}

/**
 * Fallback to original AI service if enhanced fails
 */
async function useFallbackAI(
  userId: string,
  filters: Record<string, any>,
  userProfile: any
): Promise<any[]> {
  console.log('🔄 Using fallback AI recommendation service');
  
  // Build AI prompt with filters and user profile
  const filterContext = Object.keys(filters).length > 0 
    ? `Apply these filters: ${Object.entries(filters).map(([k, v]) => `${k}: ${v}`).join(', ')}`
    : '';

  const userContext = [
    userProfile.favoriteGenres.length > 0 ? `Favorite genres: ${userProfile.favoriteGenres.join(', ')}` : '',
    userProfile.preferredNetworks.length > 0 ? `Preferred platforms: ${userProfile.preferredNetworks.join(', ')}` : '',
    userProfile.recentlyWatched.length > 0 ? `Recently watched: ${userProfile.recentlyWatched.slice(0, 3).map((s: any) => s.title || s.name).join(', ')}` : '',
    filterContext
  ].filter(Boolean).join('. ');

  // Use AI service with enhanced context
  const aiResult = await AIRecommendationService.generatePersonalizedRecommendations({
    userProfile: {
      ...userProfile,
      additionalContext: userContext
    },
    availableShows: [], // Let AI service fetch its own content
    excludeShows: [],
    mood: filters.genre || 'balanced' // Use genre as mood hint
  }, userId);

  // Transform AI results to standardized format
  const recommendations = (aiResult.recommendations || []).map((rec: any) => ({
    tmdbId: rec.tmdbId || rec.id,
    title: rec.title || rec.name,
    overview: rec.overview || rec.description,
    posterPath: rec.posterPath || rec.poster_path,
    backdropPath: rec.backdropPath || rec.backdrop_path,
    voteAverage: rec.voteAverage || rec.vote_average || 7.0,
    releaseDate: rec.releaseDate || rec.first_air_date,
    genreIds: rec.genreIds || rec.genre_ids || [],
    mediaType: rec.mediaType || 'tv',
    reason: rec.reason || 'AI personalized recommendation',
    score: rec.score || rec.confidence || 0.9,
    confidence: rec.confidence || 0.9,
    source: 'ai'
  }));

  console.log(`🤖 Fallback AI returned ${recommendations.length} recommendations`);
  return recommendations;
}

/**
 * Get available shows from TMDB based on filters
 */
async function getAvailableShows(filters: Record<string, any>): Promise<any[]> {
  const tmdb = new TMDBService();
  
  try {
    // Fetch trending and popular shows
    const [trending, popular] = await Promise.all([
      tmdb.getTrending('tv', 'week'),
      tmdb.getPopular('tv')
    ]);

    const shows = [...(trending.results || []), ...(popular.results || [])];
    
    // Apply basic filters
    let filtered = shows;
    
    if (filters.genre) {
      const genreId = GENRE_MAP[filters.genre];
      if (genreId) {
        filtered = filtered.filter(s => s.genre_ids?.includes(genreId));
      }
    }
    
    if (filters.year) {
      const year = parseInt(filters.year);
      filtered = filtered.filter(s => {
        const showYear = parseInt(s.first_air_date?.substring(0, 4) || '0');
        return showYear === year;
      });
    }

    // Deduplicate by ID
    const unique = Array.from(new Map(filtered.map(s => [s.id, s])).values());
    
    console.log(`📺 Found ${unique.length} available shows after filtering`);
    return unique;
    
  } catch (error) {
    console.error('❌ Failed to fetch available shows:', error);
    return [];
  }
}

/**
 * Generate unique recommendation ID for tracking
 */
function generateRecommendationId(): string {
  return `rec_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Fetch friends-based recommendations with filters applied
 */
export async function fetchFriendsRecommendations(
  userId: string, 
  filters: Record<string, any>, 
  userProfile: any
): Promise<any[]> {
  console.log('👥 FETCHING FRIENDS RECOMMENDATIONS:', { userId, filters });

  try {
    // Get user's friends
    const friendsData = await db
      .select({
        friendId: friendships.friendId,
        friend: users
      })
      .from(friendships)
      .innerJoin(users, eq(users.id, friendships.friendId))
      .where(and(
        eq(friendships.userId, userId),
        eq(friendships.status, 'accepted')
      ))
      .limit(50);

    if (friendsData.length === 0) {
      console.log('👥 No friends found, skipping friends recommendations');
      return [];
    }

    console.log(`👥 Found ${friendsData.length} friends`);

    // Get friends' watchlists and highly rated content
    const friendIds = friendsData.map((f: any) => f.friendId);
    const friendsWatchlists = await db
      .select({
        userId: watchlists.userId,
        showId: watchlists.showId,
        status: watchlists.status,
        rating: watchlists.rating,
        createdAt: watchlists.createdAt
      })
      .from(watchlists)
      .where(and(
        inArray(watchlists.userId, friendIds),
        inArray(watchlists.status, ['finished', 'watching'])
      ))
      .orderBy(desc(watchlists.rating), desc(watchlists.createdAt))
      .limit(100);

    console.log(`👥 Found ${friendsWatchlists.length} friend watchlist items`);

    // Group by show and calculate social score
    const showScores = new Map<number, { 
      count: number, 
      avgRating: number, 
      friends: string[],
      latestActivity: Date 
    }>();

    friendsWatchlists.forEach((item: any) => {
      const showId = item.showId;
      const rating = parseFloat(item.rating?.toString() || '7');
      const existing = showScores.get(showId) || { 
        count: 0, 
        avgRating: 0, 
        friends: [], 
        latestActivity: new Date(0) 
      };

      existing.count += 1;
      existing.avgRating = (existing.avgRating * (existing.count - 1) + rating) / existing.count;
      existing.friends.push(item.userId);
      existing.latestActivity = new Date(Math.max(
        existing.latestActivity.getTime(), 
        new Date(item.createdAt).getTime()
      ));

      showScores.set(showId, existing);
    });

    // Get top shows by social score
    const topShows = Array.from(showScores.entries())
      .sort(([, a], [, b]) => {
        // Sort by friend count, then rating, then recency
        if (a.count !== b.count) return b.count - a.count;
        if (a.avgRating !== b.avgRating) return b.avgRating - a.avgRating;
        return b.latestActivity.getTime() - a.latestActivity.getTime();
      })
      .slice(0, 15)
      .map(([showId, data]) => ({ showId, ...data }));

    // Fetch TMDB details for these shows
    const recommendations: any[] = [];
    
    for (const show of topShows) {
      try {
        const tmdbDetails: any = await tmdb.getShowDetails(show.showId);
        
        // Apply filters to friends recommendations
        let includeShow = true;
        
        if (filters.genre) {
          const genreId = GENRE_MAP[filters.genre];
          if (genreId && tmdbDetails.genres && !tmdbDetails.genres.some((g: any) => g.id === genreId)) {
            includeShow = false;
          }
        }
        
        if (filters.year) {
          const yearInt = parseInt(filters.year);
          const showYear = parseInt(tmdbDetails.first_air_date?.substring(0, 4) || '0');
          if (!isNaN(yearInt) && showYear !== yearInt) {
            includeShow = false;
          }
        }
        
        if (filters.rating) {
          const minRating = parseFloat(filters.rating);
          if (!isNaN(minRating) && tmdbDetails.vote_average < minRating) {
            includeShow = false;
          }
        }

        if (includeShow) {
          recommendations.push({
            tmdbId: tmdbDetails.id,
            title: tmdbDetails.name,
            overview: tmdbDetails.overview,
            posterPath: tmdbDetails.poster_path,
            backdropPath: tmdbDetails.backdrop_path,
            voteAverage: tmdbDetails.vote_average,
            releaseDate: tmdbDetails.first_air_date,
            genreIds: tmdbDetails.genres?.map((g: any) => g.id) || [],
            mediaType: 'tv',
            reason: `Loved by ${show.count} friend${show.count > 1 ? 's' : ''} (avg rating: ${show.avgRating.toFixed(1)})`,
            score: Math.min(1.0, (show.count / friendsData.length) * (show.avgRating / 10)),
            confidence: 0.85,
            source: 'friends',
            socialData: {
              friendCount: show.count,
              avgRating: show.avgRating,
              latestActivity: show.latestActivity
            }
          });
        }
        
      } catch (error) {
        console.warn(`⚠️ Failed to fetch TMDB details for show ${show.showId}:`, error);
      }
    }

    console.log(`👥 Friends recommendations returned ${recommendations.length} items`);
    return recommendations;

  } catch (error: any) {
    console.error('❌ Friends recommendations failed:', error);
    return [];
  }
}

export default {
  fetchTMDBRecommendations,
  fetchAIRecommendations,
  fetchFriendsRecommendations
};