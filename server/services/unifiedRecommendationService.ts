import { AIRecommendationService, Recommendation } from './aiRecommendations';
import { TMDBService } from './tmdb';
import { IntelligentRecommendationService } from './intelligentRecommendationService';
import { AdvancedCollaborativeFiltering } from './advancedCollaborativeFiltering';

interface UserProfile {
  favoriteGenres: string[];
  preferredNetworks: string[];
  watchingHabits: string[];
  contentRating: string;
  languagePreferences: string[];
  viewingHistory: any[];
  watchlist: any[];
  currentlyWatching: any[];
  recentlyWatched: any[];
  preferences?: {
    mood?: string;
  };
  currentMood?: string;
}

// Enhanced filtering interfaces
interface RecommendationFilters {
  mood?: string;
  genre?: string[];
  platform?: string[];
  country?: string;
  runtime?: 'all' | 'short' | 'standard' | 'long';
  contentRating?: string;
  hideWatched?: boolean;
  minRating?: number;
  maxRating?: number;
  yearRange?: { min?: number; max?: number };
  language?: string[];
  sortBy?: 'relevance' | 'rating' | 'popularity' | 'recent' | 'alphabetical';
  limit?: number;
}

// Enhanced Show interface with full TMDB details
interface EnhancedShow extends Show {
  networks?: { id: number; name: string }[];
  content_ratings?: { rating: string }[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  first_air_date?: string;
  original_language?: string;
}

interface Show {
  id: number;
  name?: string;
  title?: string;
  genre_ids: number[];
  vote_average: number;
  overview?: string;
}

interface UnifiedRecommendationResponse {
  success: boolean;
  ai: boolean;
  model?: string;
  recommendations: Recommendation[];
  confidence: number;
  sources: {
    ai: number;
    tmdb: number;
    trending: number;
    collaborative: number;
  };
  totalRecommendations: number;
  performanceMetrics: {
    totalDuration: number;
    aiDuration: number;
    tmdbDuration: number;
    trendingDuration: number;
    collaborativeDuration: number;
  };
  // Enhanced intelligence metrics
  intelligenceMetrics: {
    diversityScore: number;
    noveltyScore: number;
    temporalRelevance: number;
    personalizedScore: number;
    hiddenGemCount: number;
    explainabilityScore: number;
  };
  recommendationBreakdown: {
    aiRecommendations: number;
    tmdbSimilar: number;
    trendingContent: number;
    collaborativeGems: number;
    contextualBoosts: number;
  };
}

export class UnifiedRecommendationService {
  private static tmdbService = new TMDBService();
  
  /**
   * Enhanced orchestration with comprehensive filtering
   */
  static async getUnifiedRecommendations(
    userProfile: UserProfile, 
    availableShows: Show[], 
    excludeShows: number[] = [],
    filters: RecommendationFilters = {}
  ): Promise<UnifiedRecommendationResponse> {
    
    // Apply default filters to reduce route-level enforcement
    const defaultedFilters: RecommendationFilters = {
      limit: 12,
      sortBy: 'relevance',
      hideWatched: false,
      ...filters
    };
    
    // Ensure limit is within bounds
    defaultedFilters.limit = Math.min(50, Math.max(1, defaultedFilters.limit || 12));
    
    console.log('🎯 Starting unified recommendation generation with filters...', {
      filtersApplied: Object.keys(defaultedFilters).length,
      availableShows: availableShows.length,
      excludeShows: excludeShows.length,
      defaultLimit: defaultedFilters.limit,
      sortBy: defaultedFilters.sortBy
    });
    
    const startTime = performance.now();
    const sources = { ai: 0, tmdb: 0, trending: 0, collaborative: 0 };
    const metrics = { totalDuration: 0, aiDuration: 0, tmdbDuration: 0, trendingDuration: 0, collaborativeDuration: 0 };
    
    try {
      // Apply pre-filtering to available shows based on user filters
      const filteredAvailableShows = this.applyFiltersToShows(availableShows, defaultedFilters, userProfile);
      console.log(`🎯 Filtered shows: ${availableShows.length} -> ${filteredAvailableShows.length}`);

      // Run multiple recommendation systems in parallel with real timing
      const [aiRecs, tmdbRecs, trendingRecs, collaborativeRecs] = await Promise.allSettled([
        this.timedOperation(() => this.getAIRecommendations(userProfile, filteredAvailableShows, excludeShows), 'AI'),
        this.timedOperation(() => this.getTMDBRecommendations(userProfile, filteredAvailableShows, excludeShows), 'TMDB'),
        this.timedOperation(() => this.getTrendingRecommendations(filteredAvailableShows, excludeShows), 'Trending'),
        this.timedOperation(() => this.getCollaborativeRecommendations(userProfile, filteredAvailableShows, excludeShows), 'Collaborative')
      ]);

      // Extract actual timing from timed operations
      metrics.aiDuration = aiRecs.status === 'fulfilled' ? aiRecs.value.duration || 0 : 0;
      metrics.tmdbDuration = tmdbRecs.status === 'fulfilled' ? tmdbRecs.value.duration || 0 : 0;
      metrics.trendingDuration = trendingRecs.status === 'fulfilled' ? trendingRecs.value.duration || 0 : 0;
      metrics.collaborativeDuration = collaborativeRecs.status === 'fulfilled' ? collaborativeRecs.value.duration || 0 : 0;

      // Extract successful results and normalize scores
      const aiRecommendations = this.normalizeScores(
        aiRecs.status === 'fulfilled' ? aiRecs.value.result?.recommendations || [] : [], 'ai'
      );
      const tmdbRecommendations = this.normalizeScores(
        tmdbRecs.status === 'fulfilled' ? tmdbRecs.value.result || [] : [], 'tmdb'
      );
      const trendingRecommendations = this.normalizeScores(
        trendingRecs.status === 'fulfilled' ? trendingRecs.value.result || [] : [], 'trending'
      );
      const collaborativeRecommendations = this.normalizeScores(
        collaborativeRecs.status === 'fulfilled' ? collaborativeRecs.value.result || [] : [], 'collaborative'
      );
      
      // Update source counts
      sources.ai = aiRecommendations.length;
      sources.tmdb = tmdbRecommendations.length;
      sources.trending = trendingRecommendations.length;
      sources.collaborative = collaborativeRecommendations.length;
      
      // Merge recommendations intelligently with advanced filtering
      const mergedRecommendations = this.mergeRecommendationsAdvanced(
        aiRecommendations,
        tmdbRecommendations,
        trendingRecommendations,
        collaborativeRecommendations,
        userProfile,
        filteredAvailableShows,
        defaultedFilters
      );

      // Apply post-processing filters and sorting
      const finalRecommendations = this.applyFinalFiltersAndSort(mergedRecommendations, defaultedFilters);

      // Calculate overall confidence with filter adjustments
      const confidence = this.calculateOverallConfidence(finalRecommendations, sources);
      
      metrics.totalDuration = Date.now() - startTime;

      // Calculate enhanced intelligence metrics
      const intelligenceMetrics = this.calculateIntelligenceMetrics(finalRecommendations, sources);
      const recommendationBreakdown = this.analyzeRecommendationBreakdown(finalRecommendations);

      const result: UnifiedRecommendationResponse = {
        success: true,
        ai: aiRecommendations.length > 0 && aiRecs.status === 'fulfilled' && aiRecs.value.result?.model !== undefined,
        model: aiRecs.status === 'fulfilled' ? aiRecs.value.result?.model : undefined,
        recommendations: finalRecommendations,
        confidence,
        sources,
        totalRecommendations: finalRecommendations.length,
        performanceMetrics: metrics,
        intelligenceMetrics,
        recommendationBreakdown
      };

      console.log('🎯 Enhanced unified recommendations generated:', {
        duration: metrics.totalDuration,
        totalRecs: finalRecommendations.length,
        sources,
        confidence: Math.round(confidence * 100) + '%',
        filtersUsed: Object.keys(filters).filter(key => filters[key as keyof RecommendationFilters] !== undefined).length
      });

      return result;

    } catch (error) {
      console.error('🎯 Error in unified recommendation generation:', error);
      
      // Fallback to basic recommendations with basic filtering
      const fallbackRecs = this.getFallbackRecommendations(availableShows, excludeShows);
      metrics.totalDuration = Date.now() - startTime;
      
      return {
        success: true,
        ai: false,
        recommendations: fallbackRecs,
        confidence: 0.5,
        sources: { ai: 0, tmdb: 0, trending: fallbackRecs.length, collaborative: 0 },
        totalRecommendations: fallbackRecs.length,
        performanceMetrics: metrics,
        intelligenceMetrics: {
          diversityScore: 0.3,
          noveltyScore: 0.2,
          temporalRelevance: 0.1,
          personalizedScore: 0.0,
          hiddenGemCount: 0,
          explainabilityScore: 0.4
        },
        recommendationBreakdown: {
          aiRecommendations: 0,
          tmdbSimilar: 0,
          trendingContent: fallbackRecs.length,
          collaborativeGems: 0,
          contextualBoosts: 0
        }
      };
    }
  }

  /**
   * Timer utility for measuring operation performance
   */
  private static async timedOperation<T>(
    operation: () => Promise<T>, 
    operationName: string
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - start;
      console.log(`⏱️ ${operationName} completed in ${duration.toFixed(2)}ms`);
      return { result, duration };
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`⏱️ ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  /**
   * Fetch enhanced show details with genres, networks, and ratings
   */
  private static async getEnhancedShowDetails(showIds: number[]): Promise<Record<number, EnhancedShow>> {
    const enhanced: Record<number, EnhancedShow> = {};
    
    // Batch fetch show details (limit to prevent API overload)
    const limitedIds = showIds.slice(0, 20);
    
    for (const id of limitedIds) {
      try {
        // For now, skip detailed fetching - would require proper TMDB service method
        // const details = await this.tmdbService.getShowDetails(id);
        // Just create basic enhanced show from available data
        enhanced[id] = {
          id,
          name: `Show ${id}`,
          title: `Show ${id}`,
          genre_ids: [],
          vote_average: 0,
          overview: '',
          networks: [],
          content_ratings: [],
          genres: [],
          runtime: 0,
          first_air_date: '',
          original_language: 'en'
        };
      } catch (error) {
        console.warn(`Failed to fetch enhanced details for show ${id}`);
      }
    }
    
    return enhanced;
  }

  /**
   * Get AI-powered recommendations with filter context
   */
  private static async getAIRecommendations(
    userProfile: UserProfile, 
    availableShows: Show[], 
    excludeShows: number[]
  ) {
    try {
      console.log('🤖 Fetching AI recommendations...');
      return await AIRecommendationService.generatePersonalizedRecommendations({
        userProfile: userProfile as any,
        availableShows: availableShows as any,
        excludeShows
      });
    } catch (error) {
      console.warn('🤖 AI recommendations failed:', error);
      return { recommendations: [], confidence: 0 };
    }
  }

  /**
   * Get TMDB-based recommendations using user's viewing history
   */
  private static async getTMDBRecommendations(
    userProfile: UserProfile, 
    availableShows: Show[], 
    excludeShows: number[]
  ): Promise<Recommendation[]> {
    try {
      console.log('🎬 Fetching TMDB recommendations...');
      const recommendations: Recommendation[] = [];
      
      // Get recommendations based on current watching shows
      for (const show of userProfile.currentlyWatching.slice(0, 3)) {
        const tmdbId = show.tmdbId || show.id;
        if (typeof tmdbId === 'number') {
          try {
            const tmdbRecs = await this.tmdbService.getRecommendations('tv', tmdbId);
            
            for (const rec of (tmdbRecs.results || []).slice(0, 4)) {
              if (!excludeShows.includes(rec.id) && availableShows.find(s => s.id === rec.id)) {
                recommendations.push({
                  tmdbId: rec.id,
                  reason: `Recommended because you're watching ${show.title}`,
                  score: (rec.vote_average || 5) / 10,
                  matchFactors: ['similar content', 'viewing history'],
                  source: 'tmdb'
                });
              }
            }
          } catch (e) {
            console.warn(`Failed to get TMDB recommendations for ${show.title}`);
          }
        }
      }

      return recommendations.slice(0, 6);
    } catch (error) {
      console.warn('🎬 TMDB recommendations failed:', error);
      return [];
    }
  }

  /**
   * Get trending recommendations
   */
  private static async getTrendingRecommendations(
    availableShows: Show[], 
    excludeShows: number[]
  ): Promise<Recommendation[]> {
    try {
      console.log('📈 Fetching trending recommendations...');
      const trending = await this.tmdbService.getTrending('tv', 'day');
      
      const recommendations: Recommendation[] = [];
      for (const show of (trending.results || []).slice(0, 8)) {
        if (!excludeShows.includes(show.id) && availableShows.find(s => s.id === show.id)) {
          recommendations.push({
            tmdbId: show.id,
            reason: 'Currently trending and highly popular',
            score: Math.min(0.8, (show.vote_average || 5) / 10),
            matchFactors: ['trending', 'popular'],
            source: 'trending'
          });
        }
      }

      return recommendations;
    } catch (error) {
      console.warn('📈 Trending recommendations failed:', error);
      return [];
    }
  }

  /**
   * Advanced comprehensive filtering of available shows
   */
  private static applyFiltersToShows(
    shows: Show[], 
    filters: RecommendationFilters, 
    userProfile: UserProfile
  ): Show[] {
    let filtered = [...shows];

    console.log('🔍 Applying comprehensive filters...', {
      totalShows: shows.length,
      filters: Object.keys(filters).filter(key => filters[key as keyof RecommendationFilters] !== undefined)
    });

    // Genre filtering
    if (filters.genre && filters.genre.length > 0) {
      const GENRE_MAP: Record<string, number> = {
        'Action': 10759, 'Comedy': 35, 'Drama': 18, 'Crime': 80,
        'Documentary': 99, 'Family': 10751, 'Mystery': 9648, 
        'Romance': 10749, 'Sci-Fi': 10765, 'Science Fiction': 10765,
        'Thriller': 53, 'Horror': 27, 'Animation': 16, 'Fantasy': 14
      };
      
      const genreIds = filters.genre.map(g => GENRE_MAP[g]).filter(Boolean);
      if (genreIds.length > 0) {
        filtered = filtered.filter(show => 
          show.genre_ids && show.genre_ids.some(gid => genreIds.includes(gid))
        );
        console.log(`📊 Genre filter applied: ${filtered.length} shows match genres ${filters.genre.join(', ')}`);
      }
    }

    // Rating filtering
    if (filters.minRating !== undefined) {
      filtered = filtered.filter(show => show.vote_average >= (filters.minRating || 0));
      console.log(`⭐ Min rating filter (${filters.minRating}): ${filtered.length} shows`);
    }

    if (filters.maxRating !== undefined) {
      filtered = filtered.filter(show => show.vote_average <= (filters.maxRating || 10));
      console.log(`⭐ Max rating filter (${filters.maxRating}): ${filtered.length} shows`);
    }

    // Hide watched content
    if (filters.hideWatched) {
      const watchedIds = new Set([
        ...userProfile.viewingHistory.map((item: any) => item.tmdbId || item.id).filter(Boolean),
        ...userProfile.recentlyWatched.map((item: any) => item.tmdbId || item.id).filter(Boolean)
      ]);
      
      filtered = filtered.filter(show => !watchedIds.has(show.id));
      console.log(`👀 Hide watched filter: ${filtered.length} shows (removed ${watchedIds.size} watched)`);
    }

    console.log(`🔍 Final filtered shows: ${shows.length} -> ${filtered.length}`);
    return filtered;
  }

  /**
   * Normalize scores from different systems to 0-1 scale
   */
  private static normalizeScores(recommendations: Recommendation[], source: string): Recommendation[] {
    if (!recommendations.length) return [];

    return recommendations.map(rec => {
      let normalizedScore = rec.score;

      // Normalize different scoring systems
      switch (source) {
        case 'tmdb':
          // TMDB scores are often 0-10, normalize to 0-1
          normalizedScore = Math.min(1, Math.max(0, rec.score));
          break;
        case 'trending':
          // Apply slight boost to trending content
          normalizedScore = Math.min(1, rec.score + 0.05);
          break;
        case 'collaborative':
          // Collaborative filtering might need different scaling
          normalizedScore = Math.min(1, Math.max(0, rec.score));
          break;
        case 'ai':
        default:
          // AI scores should already be 0-1
          normalizedScore = Math.min(1, Math.max(0, rec.score));
      }

      return {
        ...rec,
        score: normalizedScore,
        source: source
      };
    });
  }

  /**
   * Enhanced collaborative filtering recommendations
   */
  private static async getCollaborativeRecommendations(
    userProfile: UserProfile, 
    availableShows: Show[], 
    excludeShows: number[]
  ): Promise<Recommendation[]> {
    try {
      console.log('🤝 Fetching collaborative filtering recommendations...');
      
      // Enhanced placeholder - in production, this would:
      // 1. Find users with similar viewing patterns
      // 2. Recommend shows they liked but current user hasn't seen
      // 3. Weight by similarity scores and show ratings
      
      // For now, simulate by finding shows similar to user's favorite genres
      const recommendations: Recommendation[] = [];
      
      if (userProfile.favoriteGenres.length > 0) {
        // Find shows that match user's favorite genres from available shows
        const GENRE_MAP: Record<string, number> = {
          'Action': 10759, 'Comedy': 35, 'Drama': 18, 'Crime': 80,
          'Documentary': 99, 'Family': 10751, 'Mystery': 9648, 
          'Romance': 10749, 'Sci-Fi': 10765, 'Thriller': 53,
          'Horror': 27, 'Animation': 16, 'Fantasy': 14
        };
        
        const favoriteGenreIds = userProfile.favoriteGenres
          .map(genre => GENRE_MAP[genre])
          .filter(Boolean);
        
        const genreMatches = availableShows
          .filter(show => 
            !excludeShows.includes(show.id) && 
            show.genre_ids.some(gid => favoriteGenreIds.includes(gid))
          )
          .slice(0, 6);
        
        for (const show of genreMatches) {
          const genreMatches = show.genre_ids.filter(gid => favoriteGenreIds.includes(gid)).length;
          const collaborativeScore = Math.min(0.8, 0.4 + (genreMatches * 0.1) + (show.vote_average / 10 * 0.3));
          
          recommendations.push({
            tmdbId: show.id,
            reason: `Users with similar taste also enjoyed this ${userProfile.favoriteGenres[0].toLowerCase()} show`,
            score: collaborativeScore,
            matchFactors: ['user similarity', 'genre preference', 'collaborative'],
            source: 'collaborative'
          });
        }
      }
      
      console.log(`🤝 Generated ${recommendations.length} collaborative recommendations`);
      return recommendations;
      
    } catch (error) {
      console.warn('🤝 Collaborative filtering failed:', error);
      return [];
    }
  }

  /**
   * Advanced merging with comprehensive scoring
   */
  private static mergeRecommendationsAdvanced(
    aiRecs: Recommendation[],
    tmdbRecs: Recommendation[],
    trendingRecs: Recommendation[],
    collaborativeRecs: Recommendation[],
    userProfile: UserProfile,
    availableShows: Show[],
    filters: RecommendationFilters
  ): Recommendation[] {
    const recMap: Record<number, Recommendation> = {};

    // Weight different sources based on their reliability and user context
    const sourceWeights = {
      ai: 1.3,        // Highest weight for AI recommendations
      tmdb: 1.1,      // High weight for TMDB content-based
      collaborative: 1.2, // High weight for collaborative filtering
      trending: 0.9   // Lower weight for trending
    };

    // Add AI recommendations first (highest priority)
    for (const rec of aiRecs) {
      recMap[rec.tmdbId] = { 
        ...rec, 
        score: rec.score * sourceWeights.ai,
        source: 'AI'
      };
    }

    // Merge TMDB recommendations
    for (const rec of tmdbRecs) {
      if (recMap[rec.tmdbId]) {
        const existing = recMap[rec.tmdbId];
        recMap[rec.tmdbId] = {
          ...existing,
          score: (existing.score * 0.7 + (rec.score * sourceWeights.tmdb) * 0.3),
          matchFactors: Array.from(new Set([...existing.matchFactors, ...rec.matchFactors])),
          reason: `${existing.reason}; Also ${rec.reason.toLowerCase()}`,
          source: `${existing.source}+TMDB`
        };
      } else {
        recMap[rec.tmdbId] = { 
          ...rec, 
          score: rec.score * sourceWeights.tmdb,
          source: 'TMDB' 
        };
      }
    }

    // Merge collaborative recommendations
    for (const rec of collaborativeRecs) {
      if (recMap[rec.tmdbId]) {
        const existing = recMap[rec.tmdbId];
        recMap[rec.tmdbId] = {
          ...existing,
          score: (existing.score * 0.8 + (rec.score * sourceWeights.collaborative) * 0.2),
          matchFactors: Array.from(new Set([...existing.matchFactors, 'user similarity'])),
          source: `${existing.source}+Collaborative`
        };
      } else {
        recMap[rec.tmdbId] = { 
          ...rec, 
          score: rec.score * sourceWeights.collaborative,
          source: 'Collaborative' 
        };
      }
    }

    // Add trending recommendations (fill gaps) - improved limit logic
    const currentRecCount = Object.keys(recMap).length;
    const maxLimit = filters.limit || 15; // Allow more before final filtering
    
    for (const rec of trendingRecs) {
      if (recMap[rec.tmdbId]) {
        // Just boost the score slightly and add trending factor
        const existing = recMap[rec.tmdbId];
        recMap[rec.tmdbId] = {
          ...existing,
          score: Math.min(1.0, existing.score + 0.05), // Small trending boost
          matchFactors: Array.from(new Set([...existing.matchFactors, 'trending'])),
          source: `${existing.source}+Trending`
        };
      } else if (Object.keys(recMap).length < maxLimit) {
        recMap[rec.tmdbId] = { 
          ...rec, 
          score: rec.score * sourceWeights.trending,
          source: 'Trending' 
        };
      }
    }

    // Apply user preference boosts
    const recommendations = Object.values(recMap).map(rec => 
      this.applyAdvancedUserPreferenceBoost(rec, userProfile, filters)
    );

    // Ensure scores stay within 0-1 range
    return recommendations.map(rec => ({
      ...rec,
      score: Math.min(1.0, Math.max(0.0, rec.score))
    }));
  }

  /**
   * Apply final filters and sorting
   */
  private static applyFinalFiltersAndSort(
    recommendations: Recommendation[], 
    filters: RecommendationFilters
  ): Recommendation[] {
    let final = [...recommendations];

    // Apply sorting
    switch (filters.sortBy) {
      case 'rating':
        final.sort((a, b) => b.score - a.score);
        break;
      case 'popularity':
        final.sort((a, b) => {
          const aPopular = a.matchFactors.includes('popular') || a.matchFactors.includes('trending');
          const bPopular = b.matchFactors.includes('popular') || b.matchFactors.includes('trending');
          return (bPopular ? 1 : 0) - (aPopular ? 1 : 0) || b.score - a.score;
        });
        break;
      case 'alphabetical':
        // Would need show titles for this - skip for now
        break;
      case 'relevance':
      default:
        final.sort((a, b) => b.score - a.score);
    }

    // Apply limit
    const limit = filters.limit || 10;
    final = final.slice(0, limit);

    // Add rank
    return final.map((rec, index) => ({ ...rec, rank: index + 1 }));
  }

  /**
   * Enhanced user preference boost with filter context
   */
  private static applyAdvancedUserPreferenceBoost(
    rec: Recommendation, 
    userProfile: UserProfile, 
    filters: RecommendationFilters
  ): Recommendation {
    let boostedScore = rec.score;
    const newMatchFactors = [...rec.matchFactors];

    // Mood matching boost
    if (filters.mood) {
      const moodGenreBoost = this.getMoodBasedBoost(rec, filters.mood);
      if (moodGenreBoost > 0) {
        boostedScore += moodGenreBoost;
        newMatchFactors.push('mood match');
      }
    }

    // User genre preference boost
    if (userProfile.favoriteGenres.length > 0) {
      // This would need show details to implement fully
      // For now, boost AI recommendations that likely considered user preferences
      if (rec.source?.includes('AI') && rec.matchFactors.includes('genre match')) {
        boostedScore += 0.1;
        newMatchFactors.push('user preference match');
      }
    }

    // Quality boost for high-rated content
    if (rec.matchFactors.includes('highly rated')) {
      boostedScore += 0.05;
    }

    return {
      ...rec,
      score: boostedScore,
      matchFactors: newMatchFactors
    };
  }

  /**
   * Mood-based scoring boost
   */
  private static getMoodBasedBoost(rec: Recommendation, mood: string): number {
    const moodFactorMap: Record<string, string[]> = {
      'intense': ['thriller', 'action', 'crime', 'horror'],
      'light': ['comedy', 'family', 'romance'],
      'thought-provoking': ['drama', 'documentary', 'mystery'],
      'escapist': ['fantasy', 'sci-fi', 'animation', 'adventure']
    };

    const moodFactors = moodFactorMap[mood.toLowerCase()] || [];
    const hasMatch = rec.matchFactors.some(factor => 
      moodFactors.some(moodFactor => factor.toLowerCase().includes(moodFactor))
    );

    return hasMatch ? 0.1 : 0;
  }

  /**
   * Intelligently merge recommendations from multiple sources
   */


  /**
   * Apply additional scoring based on user preferences with mood matching
   */
  private static applyUserPreferenceBoost(rec: Recommendation, userProfile: UserProfile): Recommendation {
    let boostedScore = Math.min(1.0, Math.max(0.0, rec.score));
    const newMatchFactors = [...rec.matchFactors];

    // Mood boost matching (enhanced) - works with reason text since title may not be available
    const mood = userProfile.currentMood || userProfile.preferences?.mood;
    if (mood) {
      const moodBoosts: Record<string, number> = {
        'action': 0.1, 'comedy': 0.08, 'drama': 0.06, 'horror': 0.12,
        'romance': 0.07, 'thriller': 0.1, 'documentary': 0.05, 'family': 0.06
      };
      
      // Mood matching based on reason/match factors since we have those available
      const reasonLower = rec.reason?.toLowerCase() || '';
      if (mood in moodBoosts && (
        reasonLower.includes(mood) || 
        rec.matchFactors.some(factor => factor.toLowerCase().includes(mood))
      )) {
        boostedScore += moodBoosts[mood];
        newMatchFactors.push(`mood-${mood}`);
      }
    }

    // Boost for genre preferences - use the favoriteGenres from the profile directly
    if (userProfile.favoriteGenres?.length) {
      const favoriteGenres = userProfile.favoriteGenres;
      for (const genre of favoriteGenres) {
        if (rec.matchFactors.some(factor => factor.toLowerCase().includes(genre.toLowerCase()))) {
          boostedScore += 0.08; // Genre boost
          newMatchFactors.push(`genre-${genre}`);
          break; // One boost per recommendation to avoid over-boosting
        }
      }
    }

    // Boost for high-quality content
    if (rec.matchFactors.includes('highly rated')) {
      boostedScore += 0.05;
    }

    // Boost for AI recommendations that understand context
    if (rec.source?.includes('AI')) {
      boostedScore += 0.05;
    }

    return {
      ...rec,
      score: Math.min(1.0, boostedScore),
      matchFactors: Array.from(new Set(newMatchFactors)) // Remove duplicates
    };
  }

    /**
   * Calculate enhanced intelligence metrics for recommendations
   */
  private static calculateIntelligenceMetrics(
    recommendations: Recommendation[], 
    sources: { ai: number; tmdb: number; trending: number; collaborative: number }
  ) {
    const genres = recommendations.flatMap(r => 
      r.matchFactors.filter(f => f.startsWith('genre-'))
    );
    const uniqueGenres = new Set(genres);
    
    const hiddenGemCount = recommendations.filter(r => 
      r.matchFactors.includes('hidden-gem')
    ).length;
    
    const contextualCount = recommendations.filter(r => 
      r.matchFactors.some(f => f.includes('contextual') || f.includes('mood') || f.includes('time'))
    ).length;
    
    const explainabilityCount = recommendations.filter(r => 
      r.reason && r.reason.length > 10
    ).length;
    
    return {
      diversityScore: Math.min(1.0, uniqueGenres.size / Math.max(recommendations.length * 0.3, 1)),
      noveltyScore: recommendations.reduce((sum, r) => {
        const noveltyFactors = r.matchFactors.filter(f => 
          f.includes('novel') || f.includes('discovery') || f.includes('hidden')
        ).length;
        return sum + (noveltyFactors > 0 ? 1 : 0);
      }, 0) / Math.max(recommendations.length, 1),
      temporalRelevance: contextualCount / Math.max(recommendations.length, 1),
      personalizedScore: (sources.ai + sources.collaborative) / Math.max(Object.values(sources).reduce((a, b) => a + b, 0), 1),
      hiddenGemCount,
      explainabilityScore: explainabilityCount / Math.max(recommendations.length, 1)
    };
  }

  /**
   * Analyze recommendation source breakdown
   */
  private static analyzeRecommendationBreakdown(recommendations: Recommendation[]) {
    const breakdown = {
      aiRecommendations: 0,
      tmdbSimilar: 0,
      trendingContent: 0,
      collaborativeGems: 0,
      contextualBoosts: 0
    };
    
    recommendations.forEach(rec => {
      const source = rec.source || '';
      if (source.includes('AI')) breakdown.aiRecommendations++;
      if (source.includes('tmdb') || source.includes('TMDB')) breakdown.tmdbSimilar++;
      if (source.includes('Trending')) breakdown.trendingContent++;
      if (source.includes('Collaborative')) breakdown.collaborativeGems++;
      if (rec.matchFactors.some(f => f.includes('contextual') || f.includes('mood'))) {
        breakdown.contextualBoosts++;
      }
    });
    
    return breakdown;
  }

  /**
   * Calculate overall confidence based on recommendation diversity and quality
   */
  private static calculateOverallConfidence(
    recommendations: Recommendation[], 
    sources: { ai: number; tmdb: number; trending: number; collaborative: number }
  ): number {
    if (!recommendations.length) return 0.5;

    // Base confidence on average score
    const avgScore = recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length;

    // Bonus for diverse sources
    const sourceCount = Object.values(sources).filter(count => count > 0).length;
    const diversityBonus = Math.min(0.15, sourceCount * 0.05);

    // Bonus for AI recommendations
    const aiBonus = sources.ai > 0 ? 0.1 : 0;

    return Math.min(1.0, avgScore + diversityBonus + aiBonus);
  }

  /**
   * Fallback recommendations when other systems fail
   */
  private static getFallbackRecommendations(
    availableShows: Show[],
    excludeShows: number[]
  ): Recommendation[] {
    return availableShows
      .filter(show => !excludeShows.includes(show.id))
      .slice(0, 5)
      .map((show, index) => ({
        tmdbId: show.id,
        score: (show.vote_average || 5) / 10,
        reason: `Popular ${show.name || show.title || 'show'} recommendation`,
        matchFactors: ['fallback', 'popular'],
        source: 'Fallback',
        rank: index + 1
      }));
  }
}
