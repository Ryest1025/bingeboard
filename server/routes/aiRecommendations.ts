import type { Express, Request, Response } from 'express';
import { isAuthenticated } from '../auth';
import { AIRecommendationService } from '../services/aiRecommendations';
import { UnifiedRecommendationService } from '../services/unifiedRecommendationService';
import { TMDBService } from '../services/tmdb';

/**
 * AI Recommendation Routes
 * POST /api/ai/recommendations         -> Personalized AI (or fallback) recommendations
 * POST /api/recommendations/unified    -> Multi-system unified recommendations (NEW)
 * GET  /api/ai/recommendations/demo    -> Quick demo with mock profile (unauthenticated)
 */
export function registerAIRecommendationRoutes(app: Express) {
  const tmdb = new TMDBService();

  // NEW: Unified multi-system recommendations endpoint with proper TMDB filtering
  app.post('/api/recommendations/unified', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
    try {
      console.log('🎯 Unified recommendation request received');
      console.log('🎯 Request body:', JSON.stringify(req.body, null, 2));
      
      const body = req.body || {};
      const filters = body.filters || {};
      const rawProfile = body.userProfile || body.profile || {};
      
      // Enhanced filter processing with detailed logging
      console.log('🎯 UNIFIED API RECEIVED FILTERS:', filters);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== null && v !== undefined)
      );
      const filtersUsed = Object.keys(cleanFilters).length;
      console.log('🎯 CLEANED FILTERS:', cleanFilters, `(${filtersUsed} filters applied)`);
      
      const userProfile = {
        favoriteGenres: rawProfile.favoriteGenres || body.favoriteGenres || [],
        preferredNetworks: rawProfile.preferredNetworks || body.preferredNetworks || [],
        watchingHabits: rawProfile.watchingHabits || body.watchingHabits || [],
        contentRating: rawProfile.contentRating || body.contentRating || 'Any',
        languagePreferences: rawProfile.languagePreferences || body.languagePreferences || ['English'],
        viewingHistory: rawProfile.viewingHistory || body.viewingHistory || [],
        watchlist: rawProfile.watchlist || body.watchlist || [],
        currentlyWatching: rawProfile.currentlyWatching || body.currentlyWatching || [],
        recentlyWatched: rawProfile.recentlyWatched || body.recentlyWatched || []
      };

      // Build TMDB discover query from filters (following your flowchart)
      const tmdbDiscoverParams: any = {
        page: 1,
        sort_by: 'popularity.desc',
        include_adult: false,
        language: 'en-US'
      };

      // Genre filter → TMDB with_genres
      if (cleanFilters.genre && cleanFilters.genre !== 'all') {
        const genreMap: Record<string, number> = {
          'Action': 10759, 'Adventure': 10759, 'Comedy': 35, 'Drama': 18, 
          'Crime': 80, 'Documentary': 99, 'Family': 10751, 'Mystery': 9648,
          'Romance': 10749, 'Sci-Fi': 10765, 'Fantasy': 10765, 'Thriller': 53,
          'Horror': 27, 'Animation': 16, 'Western': 37, 'Biography': 99,
          'History': 36, 'Music': 10402, 'Sport': 99, 'War': 10768
        };
        
        const genreId = genreMap[cleanFilters.genre as string];
        if (genreId) {
          tmdbDiscoverParams.with_genres = genreId.toString();
          console.log(`🎯 Applied genre filter: ${cleanFilters.genre} → ID ${genreId}`);
        }
      }

      // Year filter → TMDB primary_release_year
      if (cleanFilters.year && cleanFilters.year !== 'all') {
        const yearInt = parseInt(cleanFilters.year as string);
        if (!isNaN(yearInt)) {
          tmdbDiscoverParams.primary_release_year = yearInt;
          tmdbDiscoverParams.first_air_date_year = yearInt; // For TV shows
          console.log(`🎯 Applied year filter: ${yearInt}`);
        }
      }

      // Platform filter → TMDB with_watch_providers
      if (cleanFilters.platform && cleanFilters.platform !== 'all') {
        const platformMap: Record<string, number> = {
          'netflix': 8, 'hulu': 15, 'amazon': 119, 'hbo': 384, 'disney': 337,
          'apple': 350, 'paramount': 531, 'peacock': 386, 'showtime': 37,
          'starz': 43, 'max': 384 // HBO Max/Max
        };
        
        const platformId = platformMap[(cleanFilters.platform as string).toLowerCase()];
        if (platformId) {
          tmdbDiscoverParams.with_watch_providers = platformId.toString();
          tmdbDiscoverParams.watch_region = 'US';
          console.log(`🎯 Applied platform filter: ${cleanFilters.platform} → ID ${platformId}`);
        }
      }

      // Rating filter → TMDB vote_average.gte
      if (cleanFilters.rating && cleanFilters.rating !== 'all') {
        const minRating = parseFloat(cleanFilters.rating as string);
        if (!isNaN(minRating)) {
          tmdbDiscoverParams['vote_average.gte'] = minRating;
          console.log(`🎯 Applied rating filter: minimum ${minRating}`);
        }
      }

      console.log('🎯 Final TMDB discover params:', tmdbDiscoverParams);

      // Execute TMDB discover query with filters
      let filteredShows: any[] = [];
      try {
        console.log('🎯 Executing TMDB discover query...');
        const tmdbTvResults = await tmdb.discover('tv', tmdbDiscoverParams);
        const tmdbMovieResults = await tmdb.discover('movie', tmdbDiscoverParams);
        
        filteredShows = [
          ...(tmdbTvResults.results || []).map((item: any) => ({ ...item, media_type: 'tv' })),
          ...(tmdbMovieResults.results || []).map((item: any) => ({ ...item, media_type: 'movie' }))
        ].slice(0, 50);
        
        console.log(`🎯 TMDB discover returned ${filteredShows.length} filtered results`);
        console.log('🎯 Sample result:', filteredShows[0] ? {
          id: filteredShows[0].id,
          title: filteredShows[0].title || filteredShows[0].name,
          vote_average: filteredShows[0].vote_average,
          release_date: filteredShows[0].release_date || filteredShows[0].first_air_date
        } : 'No results');
        
      } catch (tmdbError) {
        console.error('🎯 TMDB discover failed, falling back to popular:', tmdbError);
        // Fallback to popular content if discover fails
        const popular = await safeGetPopular(tmdb, 'tv');
        filteredShows = (popular.results || []).slice(0, 20);
      }

      // Build exclude list from user's watchlist and history
      const excludeIds = new Set<number>();
      [...(userProfile.watchlist || []), ...(userProfile.viewingHistory || []), ...(userProfile.recentlyWatched || [])].forEach((item: any) => {
        const id = item?.tmdbId || item?.id;
        if (typeof id === 'number') excludeIds.add(id);
      });

      // Add any manual exclusions from request
      const bodyExclude: number[] = Array.isArray(body.excludeShows) 
        ? body.excludeShows.filter((n: any) => typeof n === 'number') 
        : [];
      bodyExclude.forEach(id => excludeIds.add(id));

      console.log('🎯 Processing unified recommendations:', {
        userGenres: userProfile.favoriteGenres.length,
        filteredShows: filteredShows.length,
        excludedShows: excludeIds.size,
        currentlyWatching: userProfile.currentlyWatching.length,
        filtersUsed,
        appliedFilters: cleanFilters
      });

      // Use filtered shows from TMDB discover instead of generic popular/trending
      const result = await UnifiedRecommendationService.getUnifiedRecommendations(
        userProfile,
        filteredShows, // Use TMDB-filtered results
        Array.from(excludeIds),
        cleanFilters, // Pass clean filters to unified service
        req.user?.id
      );

      // Add filter context to recommendations
      if (Object.keys(cleanFilters).length > 0) {
        result.recommendations = result.recommendations.map(rec => ({
          ...rec,
          reason: rec.reason + ` (filtered for: ${Object.entries(cleanFilters).map(([k, v]) => `${k}: ${v}`).join(', ')})`
        }));
      }

      res.json({
        success: result.success,
        strategy: 'tmdb-filtered-unified',
        ai: result.ai,
        model: result.model,
        recommendations: result.recommendations,
        confidence: result.confidence,
        sources: result.sources,
        totalRecommendations: result.totalRecommendations,
        filtersUsed, // Include filter count in response
        appliedFilters: cleanFilters, // Include applied filters for debugging
        processingInfo: {
          tmdbDiscoverParams,
          filteredShowsFromTMDB: filteredShows.length,
          excludedItems: excludeIds.size,
          userPreferences: {
            genres: userProfile.favoriteGenres.length,
            networks: userProfile.preferredNetworks.length,
            currentShows: userProfile.currentlyWatching.length,
            recentHistory: userProfile.recentlyWatched.length
          }
        }
      });

    } catch (error: any) {
      console.error('🎯 Unified recommendations error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to generate unified recommendations', 
        error: error.message,
        strategy: 'tmdb-filtered-unified',
        filtersUsed: 0
      });
    }
  });

  // Demo endpoint with mock data (no auth) so we can verify quickly
  app.get('/api/ai/recommendations/demo', async (_req: Request, res: Response) => {
    try {
      const popular = await safeGetPopular(tmdb, 'tv');
      const mockProfile = {
        favoriteGenres: ['Drama', 'Crime', 'Thriller'],
        preferredNetworks: ['netflix', 'hulu'],
        watchingHabits: ['binges', 'evening viewer'],
        contentRating: 'TV-14',
        languagePreferences: ['English'],
        viewingHistory: [],
        watchlist: [],
        currentlyWatching: [],
        recentlyWatched: []
      };
      const result = await AIRecommendationService.generatePersonalizedRecommendations({
        userProfile: mockProfile as any,
        availableShows: popular.results || [],
        excludeShows: []
      }, 'demo-user'); // Pass demo userId for caching
      res.json({ source: 'demo', ...result });
    } catch (e:any) {
      res.status(500).json({ message: 'Demo recommendations failed', error: e.message });
    }
  });

  // Authenticated personalized recommendations
  app.post('/api/ai/recommendations', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
    try {
      const body = req.body || {};
      const rawProfile = body.userProfile || body.profile || {};
      const userProfile = {
        favoriteGenres: rawProfile.favoriteGenres || body.favoriteGenres || [],
        preferredNetworks: rawProfile.preferredNetworks || body.preferredNetworks || [],
        watchingHabits: rawProfile.watchingHabits || body.watchingHabits || [],
        contentRating: rawProfile.contentRating || body.contentRating || 'All',
        languagePreferences: rawProfile.languagePreferences || body.languagePreferences || ['English'],
        viewingHistory: rawProfile.viewingHistory || body.viewingHistory || [],
        watchlist: rawProfile.watchlist || body.watchlist || [],
        currentlyWatching: rawProfile.currentlyWatching || body.currentlyWatching || [],
        recentlyWatched: rawProfile.recentlyWatched || body.recentlyWatched || []
      };

      // Build exclude list from watchlist + history ids if present
      const excludeIds = new Set<number>();
      [...(userProfile.watchlist||[]), ...(userProfile.viewingHistory||[]), ...(userProfile.recentlyWatched||[])].forEach((it:any)=>{
        const id = it?.tmdbId || it?.id;
        if (typeof id === 'number') excludeIds.add(id);
      });

      // Allow client to send availableShows; otherwise fetch popular
      let availableShows: any[] = Array.isArray((body as any).availableShows) ? (body as any).availableShows : [];
      if (!availableShows.length) {
        const popular = await safeGetPopular(tmdb, 'tv');
        availableShows = (popular.results || []).slice(0, 50);
      }

      // Allow direct excludeShows override
      const bodyExclude: number[] = Array.isArray(body.excludeShows) ? body.excludeShows.filter((n: any)=> typeof n === 'number') : [];
      bodyExclude.forEach(id => excludeIds.add(id));

      const result = await AIRecommendationService.generatePersonalizedRecommendations({
        userProfile,
        availableShows,
        excludeShows: Array.from(excludeIds),
        mood: body.mood
      }, req.user?.id); // Pass userId for caching/throttling

      res.json({
        success: true,
        ai: !!process.env.OPENAI_API_KEY,
        strategy: 'ai-or-fallback',
        count: result.recommendations.length,
        model: (result as any).model,
        recommendations: result.recommendations,
        confidence: result.confidence
      });
    } catch (e:any) {
      console.error('AI recommendations endpoint error:', e);
      res.status(500).json({ message: 'Failed to generate recommendations', error: e.message });
    }
  });
}

async function safeGetPopular(tmdb: TMDBService, type: 'tv' | 'movie') {
  try {
    return await tmdb.getPopular(type);
  } catch (e) {
    console.warn('⚠️ TMDB popular fetch failed, using static fallback list');
    return {
      results: [
        { id: 1399, name: 'Game of Thrones', vote_average: 8.4, genre_ids: [18, 10765] },
        { id: 82856, name: 'The Mandalorian', vote_average: 8.5, genre_ids: [10765, 10759] },
        { id: 66732, name: 'Stranger Things', vote_average: 8.6, genre_ids: [18, 9648, 10765] },
        { id: 97180, name: 'House of the Dragon', vote_average: 8.4, genre_ids: [18, 10765] },
        { id: 456, name: 'The Simpsons', vote_average: 8.0, genre_ids: [16, 35] },
        { id: 2316, name: 'The Office', vote_average: 8.5, genre_ids: [35] }
      ]
    } as any;
  }
}

async function safeGetTrending(tmdb: TMDBService) {
  try {
    return await tmdb.getTrending('tv', 'day');
  } catch (e) {
    console.warn('⚠️ TMDB trending fetch failed');
    return { results: [] };
  }
}

async function safeGetDiscover(tmdb: TMDBService, userProfile: any) {
  try {
    // Use user's favorite genres for discovery
    const genreMap: Record<string, number> = {
      'Action': 10759, 'Comedy': 35, 'Drama': 18, 'Crime': 80,
      'Documentary': 99, 'Family': 10751, 'Mystery': 9648,
      'Romance': 10749, 'Sci-Fi': 10765, 'Thriller': 53,
      'Horror': 27, 'Animation': 16, 'Western': 37, 'Fantasy': 14
    };
    
    const genreIds = userProfile.favoriteGenres
      .map((genre: string) => genreMap[genre])
      .filter(Boolean)
      .slice(0, 3); // Limit to 3 genres
    
    if (genreIds.length > 0) {
      return await tmdb.discover('tv', { genres: genreIds.join(',') });
    }
    
    return { results: [] };
  } catch (e) {
    console.warn('⚠️ TMDB discover fetch failed');
    return { results: [] };
  }
}
