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

  // NEW: Unified multi-system recommendations endpoint
  app.post('/api/recommendations/unified', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
    try {
      console.log('🎯 Unified recommendation request received');
      
      const body = req.body || {};
      const rawProfile = body.userProfile || body.profile || {};
      
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

      // Build exclude list from user's watchlist and history
      const excludeIds = new Set<number>();
      [...(userProfile.watchlist || []), ...(userProfile.viewingHistory || []), ...(userProfile.recentlyWatched || [])].forEach((item: any) => {
        const id = item?.tmdbId || item?.id;
        if (typeof id === 'number') excludeIds.add(id);
      });

      // Get available shows (client can provide or we fetch popular)
      let availableShows: any[] = Array.isArray(body.availableShows) ? body.availableShows : [];
      if (!availableShows.length) {
        const popular = await safeGetPopular(tmdb, 'tv');
        const trending = await safeGetTrending(tmdb);
        const discover = await safeGetDiscover(tmdb, userProfile);
        
        // Combine and deduplicate
        const combinedShows = new Map();
        [...(popular.results || []), ...(trending.results || []), ...(discover.results || [])].forEach(show => {
          if (show && show.id) combinedShows.set(show.id, show);
        });
        
        availableShows = Array.from(combinedShows.values()).slice(0, 100);
      }

      // Add any manual exclusions from request
      const bodyExclude: number[] = Array.isArray(body.excludeShows) 
        ? body.excludeShows.filter((n: any) => typeof n === 'number') 
        : [];
      bodyExclude.forEach(id => excludeIds.add(id));

      console.log('🎯 Processing unified recommendations:', {
        userGenres: userProfile.favoriteGenres.length,
        availableShows: availableShows.length,
        excludedShows: excludeIds.size,
        currentlyWatching: userProfile.currentlyWatching.length,
        mood: body.mood || 'none'
      });

      // Get unified recommendations
      const result = await UnifiedRecommendationService.getUnifiedRecommendations(
        userProfile,
        availableShows,
        Array.from(excludeIds)
      );

      // Add mood context if provided
      if (body.mood) {
        result.recommendations = result.recommendations.map(rec => ({
          ...rec,
          reason: rec.reason + ` (matches your ${body.mood} mood)`
        }));
      }

      res.json({
        success: result.success,
        strategy: 'unified-multi-system',
        ai: result.ai,
        model: result.model,
        recommendations: result.recommendations,
        confidence: result.confidence,
        sources: result.sources,
        totalRecommendations: result.totalRecommendations,
        processingInfo: {
          availableShowsProcessed: availableShows.length,
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
        strategy: 'unified-multi-system'
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
      });
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
      });

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
