import { Router, Request, Response } from 'express';
import { UnifiedRecommendationService } from '../services/unifiedRecommendationService.js';
import { isAuthenticated } from '../auth.js';
import { TMDBService } from '../services/tmdb.js';
import { DatabaseIntegrationService } from '../services/databaseIntegration.js';
import OpenAI from 'openai';

// Enhanced type definitions with intelligent user profiling
interface Show {
  id: number;
  name?: string;
  title?: string;
  genre_ids: number[];
  vote_average: number;
  overview?: string;
  first_air_date?: string;
  original_language?: string;
  runtime?: number;
  networks?: Array<{ id: number; name: string }>;
}

interface BehavioralData {
  averageWatchTime: number; // minutes per session
  skipRate: number; // 0-1, how often they skip shows
  bingePatterns: 'light' | 'moderate' | 'heavy'; // watching habits
  completionRate: number; // 0-1, how often they finish shows
  repeatWatching: number; // how often they rewatch content
  preferredWatchTimes: string[]; // ['morning', 'afternoon', 'evening', 'night']
  devicePreferences: Record<string, number>; // device usage patterns
}

interface ContextualCues {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'tv';
  seasonalTrends: Record<string, number>; // seasonal content preferences
  currentMood?: string;
  sessionContext: 'solo' | 'family' | 'friends' | 'date';
}

interface EnhancedUserProfile {
  // Core demographics
  favoriteGenres: string[];
  preferredNetworks: string[];
  watchingHabits: string[];
  contentRating: string;
  languagePreferences: string[];
  
  // Enhanced viewing data
  viewingHistory: Array<{ 
    tmdbId: number; 
    type: string; 
    watchedAt: Date;
    watchDuration: number; // minutes watched
    totalDuration: number; // total show/episode length
    completed: boolean;
    rating?: number; // user rating 1-10
    skipCount: number; // times skipped/abandoned
  }>;
  
  watchlist: Array<{ 
    tmdbId: number; 
    type: string; 
    addedAt: Date;
    priority: 'high' | 'medium' | 'low';
    reason?: string; // why added to watchlist
  }>;
  
  currentlyWatching: Array<{ 
    tmdbId: number; 
    type: string; 
    progress: number;
    lastWatched: Date;
    episodesWatched?: number;
    totalEpisodes?: number;
    bingeFactor: number; // episodes per session
  }>;
  
  recentlyWatched: Array<{ 
    tmdbId: number; 
    type: string; 
    watchedAt: Date;
    enjoymentScore: number; // derived from completion + rating
  }>;
  
  // Behavioral intelligence
  behavioralData: BehavioralData;
  contextualCues: ContextualCues;
  
  // Advanced preferences
  preferences: {
    mood?: string;
    themes: string[]; // ['dark', 'uplifting', 'complex', 'light']
    contentComplexity: 'simple' | 'moderate' | 'complex';
    pacePreference: 'slow' | 'medium' | 'fast';
    noveltySeeker: boolean; // prefers new/unknown content
    comfortWatcher: boolean; // prefers familiar/safe content
  };
  
  // Temporal patterns
  temporalPatterns: {
    weekdayPreferences: Record<string, string[]>; // day -> preferred genres
    seasonalMoods: Record<string, string>; // month -> mood
    timeSlotPreferences: Record<string, string[]>; // time -> content types
  };
}

// Valid filter values for type safety
const VALID_RUNTIME_VALUES = ['all', 'short', 'standard', 'long'] as const;
const VALID_SORT_VALUES = ['relevance', 'rating', 'popularity', 'recent', 'alphabetical'] as const;
const VALID_CONTENT_RATINGS = ['G', 'PG', 'PG-13', 'TV-Y', 'TV-Y7', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA', 'R'] as const;

const router = Router();

// Initialize services
const db = new DatabaseIntegrationService();
const tmdbService = new TMDBService();
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Simple rate limiting for enhanced recommendations (production enhancement)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function rateLimiter(req: Request, res: Response, next: Function) {
  const clientId = (req as any).user?.uid || req.ip || 'anonymous';
  const now = Date.now();
  
  // Clean up expired entries
  const keysToDelete: string[] = [];
  rateLimitMap.forEach((value, key) => {
    if (now > value.resetTime) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => rateLimitMap.delete(key));
  
  // Check current client
  const clientData = rateLimitMap.get(clientId);
  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    next();
  } else if (clientData.count < RATE_LIMIT) {
    clientData.count++;
    next();
  } else {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: `Too many requests. Limit: ${RATE_LIMIT} per minute.`,
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  }
}

/**
 * Fetch enhanced user profile from database with behavioral intelligence
 */
async function getUserProfileFromDB(userId: string): Promise<EnhancedUserProfile> {
  // TODO: Replace with actual database call that includes behavioral analytics
  // This enhanced stub demonstrates the rich data model for intelligent recommendations
  
  const currentHour = new Date().getHours();
  const currentMonth = new Date().getMonth();
  
  return {
    // Core demographics
    favoriteGenres: ['Drama', 'Sci-Fi', 'Thriller', 'Mystery'],
    preferredNetworks: ['Netflix', 'HBO Max', 'Apple TV+'],
    watchingHabits: ['evening-watcher', 'binge-watcher', 'weekend-viewer'],
    contentRating: 'TV-MA',
    languagePreferences: ['en', 'es'],
    
    // Enhanced viewing data with behavioral insights
    viewingHistory: [
      { 
        tmdbId: 1399, type: 'tv', watchedAt: new Date('2024-08-15'),
        watchDuration: 540, totalDuration: 600, completed: true,
        rating: 9, skipCount: 0
      },
      { 
        tmdbId: 66732, type: 'tv', watchedAt: new Date('2024-08-10'),
        watchDuration: 720, totalDuration: 800, completed: false,
        rating: 8, skipCount: 2
      },
    ],
    
    watchlist: [
      { 
        tmdbId: 85552, type: 'tv', addedAt: new Date('2024-08-01'),
        priority: 'high', reason: 'Recommended by friend'
      },
      { 
        tmdbId: 94605, type: 'tv', addedAt: new Date('2024-07-25'),
        priority: 'medium', reason: 'Saw trailer'
      },
    ],
    
    currentlyWatching: [
      { 
        tmdbId: 94605, type: 'tv', progress: 0.6, 
        lastWatched: new Date('2024-08-20'),
        episodesWatched: 6, totalEpisodes: 9, bingeFactor: 2.5
      },
    ],
    
    recentlyWatched: [
      { 
        tmdbId: 1399, type: 'tv', watchedAt: new Date('2024-08-15'),
        enjoymentScore: 0.9 // derived from high completion + rating
      },
    ],
    
    // Behavioral intelligence
    behavioralData: {
      averageWatchTime: 120, // 2 hours per session
      skipRate: 0.15, // low skip rate indicates good taste matching
      bingePatterns: 'heavy', // enjoys long viewing sessions
      completionRate: 0.85, // high completion rate
      repeatWatching: 0.1, // occasionally rewatches favorites
      preferredWatchTimes: ['evening', 'night'],
      devicePreferences: { tv: 0.7, mobile: 0.2, tablet: 0.1 }
    },
    
    contextualCues: {
      timeOfDay: currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : currentHour < 21 ? 'evening' : 'night',
      deviceType: 'tv', // would be determined from request
      seasonalTrends: { 
        'horror': currentMonth === 9 ? 1.5 : 1.0, // October boost
        'family': currentMonth === 11 ? 1.3 : 1.0  // December boost
      },
      currentMood: 'thought-provoking',
      sessionContext: 'solo'
    },
    
    // Advanced preferences
    preferences: {
      mood: 'thought-provoking',
      themes: ['complex', 'dark', 'psychological'],
      contentComplexity: 'complex',
      pacePreference: 'medium',
      noveltySeeker: true,
      comfortWatcher: false
    },
    
    // Temporal intelligence
    temporalPatterns: {
      weekdayPreferences: {
        'monday': ['Comedy', 'Light Drama'],
        'friday': ['Action', 'Thriller'],
        'sunday': ['Documentary', 'Drama']
      },
      seasonalMoods: {
        '0': 'motivational', '1': 'romantic', '2': 'uplifting',
        '9': 'dark', '10': 'cozy', '11': 'nostalgic'
      },
      timeSlotPreferences: {
        'morning': ['News', 'Documentary'],
        'evening': ['Drama', 'Thriller'],
        'night': ['Comedy', 'Light Entertainment']
      }
    }
  };
}

/**
 * Fetch available shows for user (placeholder - replace with actual content catalog)
 */
async function getAvailableShowsForUser(userId: string): Promise<Show[]> {
  try {
    // TODO: Replace with actual content catalog/database call
    // For now, fetch some popular shows as available content
    const tmdbService = new TMDBService();
    const popularShows = await tmdbService.getPopular('tv');
    return popularShows.results || [];
  } catch (error) {
    console.error('❌ Error fetching available shows:', error);
    // Return some fallback shows if TMDB fails
    return [
      { id: 1399, name: 'Game of Thrones', genre_ids: [18, 10765], vote_average: 9.3, overview: 'Epic fantasy series' },
      { id: 66732, name: 'Stranger Things', genre_ids: [18, 10765, 9648], vote_average: 8.7, overview: 'Supernatural thriller' },
      { id: 85552, name: 'Euphoria', genre_ids: [18], vote_average: 8.4, overview: 'Teen drama series' }
    ];
  }
}

/**
 * Fetch TMDB details for a specific show/movie
 */
async function fetchTMDBDetails(tmdbId: number): Promise<any> {
  try {
    // Try TV show first
    const tvDetails = await tmdbService.getShowDetails(tmdbId);
    if (tvDetails) {
      return { 
        ...tvDetails, 
        type: 'tv',
        tmdbId: tmdbId
      };
    }
  } catch (error) {
    // If TV fails, try movie
    try {
      const movieDetails = await tmdbService.getMovieDetails(tmdbId);
      if (movieDetails) {
        return { 
          ...movieDetails, 
          type: 'movie',
          tmdbId: tmdbId
        };
      }
    } catch (movieError) {
      console.warn(`Failed to fetch TMDB details for ${tmdbId}:`, movieError);
    }
  }
  
  // Return basic info if both fail
  return {
    tmdbId: tmdbId,
    title: `Content ${tmdbId}`,
    name: `Content ${tmdbId}`,
    overview: 'Details not available',
    type: 'unknown'
  };
}

/**
 * Validate filter values with type safety
 */
function validateFilters(filters: any): any {
  const validated: any = {};
  
  // Validate and set basic filters
  if (filters.mood && typeof filters.mood === 'string') {
    validated.mood = filters.mood.trim();
  }
  
  // Validate arrays
  if (filters.genre) {
    validated.genre = Array.isArray(filters.genre) ? filters.genre : [filters.genre];
  }
  if (filters.platform) {
    validated.platform = Array.isArray(filters.platform) ? filters.platform : [filters.platform];
  }
  if (filters.language) {
    validated.language = Array.isArray(filters.language) ? filters.language : [filters.language];
  }
  
  // Validate country
  if (filters.country && typeof filters.country === 'string') {
    validated.country = filters.country.trim().toUpperCase();
  }
  
  // Validate runtime with type safety
  if (filters.runtime && VALID_RUNTIME_VALUES.includes(filters.runtime)) {
    validated.runtime = filters.runtime;
  } else if (filters.runtime) {
    console.warn(`Invalid runtime value: ${filters.runtime}. Using 'all'.`);
    validated.runtime = 'all';
  }
  
  // Validate content rating
  if (filters.contentRating && VALID_CONTENT_RATINGS.includes(filters.contentRating)) {
    validated.contentRating = filters.contentRating;
  }
  
  // Validate rating ranges
  if (typeof filters.minRating === 'number' && filters.minRating >= 0 && filters.minRating <= 10) {
    validated.minRating = filters.minRating;
  }
  if (typeof filters.maxRating === 'number' && filters.maxRating >= 0 && filters.maxRating <= 10) {
    validated.maxRating = filters.maxRating;
  }
  
  // Validate year range
  if (filters.yearRange && typeof filters.yearRange === 'object') {
    const currentYear = new Date().getFullYear();
    validated.yearRange = {
      min: typeof filters.yearRange.min === 'number' && filters.yearRange.min > 1900 ? filters.yearRange.min : undefined,
      max: typeof filters.yearRange.max === 'number' && filters.yearRange.max <= currentYear ? filters.yearRange.max : undefined
    };
  }
  
  // Validate sort with type safety
  if (filters.sortBy && VALID_SORT_VALUES.includes(filters.sortBy)) {
    validated.sortBy = filters.sortBy;
  } else if (filters.sortBy) {
    console.warn(`Invalid sortBy value: ${filters.sortBy}. Using 'relevance'.`);
    validated.sortBy = 'relevance';
  }
  
  // Validate limit
  if (typeof filters.limit === 'number') {
    validated.limit = Math.min(50, Math.max(1, filters.limit));
  }
  
  // Validate boolean
  if (typeof filters.hideWatched === 'boolean') {
    validated.hideWatched = filters.hideWatched;
  }
  
  return validated;
}

/**
 * TEST Enhanced recommendations endpoint (NO AUTH for testing)
 * POST /api/test-enhanced-recommendations
 */
router.post('/test-enhanced-recommendations', rateLimiter, async (req: Request, res: Response) => {
  try {
    const { userId, genres, history, moods, preferences } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    console.log("🧪 TEST Enhanced rec request:", {
      userId,
      genres,
      history,
      moods,
      preferences,
    });

    // 🔹 1. Grab real user behavior data
    const userBehavior = await db.getUserBehaviorAnalytics(userId, 100);

    // 🔹 2. Collab filtering: find similar users
    const similarUsers = await db.findSimilarUsers(userId);

    return res.json({
      success: true,
      message: "Enhanced recommendations with multi-system intelligence",
      payload: {
        userId,
        genres,
        history,
        moods,
        preferences,
        userBehavior: {
          totalViews: userBehavior.totalViews,
          favoriteGenres: userBehavior.favoriteGenres.slice(0, 3),
          completionRate: userBehavior.completionRate
        },
        similarUsers: similarUsers.slice(0, 3),
        analyticsStatus: "Database integration working"
      }
    });

  } catch (error) {
    console.error('🚨 TEST Enhanced recommendations error:', error);
    return res.status(500).json({ error: 'Failed to process enhanced recommendations' });
  }
});

/**
 * Enhanced recommendations endpoint with comprehensive multi-system intelligence
 * POST /api/enhanced-recommendations
 */
router.post('/enhanced-recommendations', rateLimiter, isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { userId, genres, history, moods, preferences } = req.body;
    const authenticatedUserId = (req as any).user?.uid;
    
    // Use provided userId or fall back to authenticated user
    const targetUserId = userId || authenticatedUserId;
    
    if (!targetUserId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    console.log("🤖 Enhanced rec request:", {
      userId: targetUserId,
      genres,
      history,
      moods,
      preferences,
    });

    // 🔹 1. Grab real user behavior data
    const userBehavior = await db.getUserBehaviorAnalytics(targetUserId, 100);

    // 🔹 2. Collab filtering: find similar users
    const similarUsers = await db.findSimilarUsers(targetUserId);

    // 🔹 3. Content metrics: popularity, engagement
    const metrics: any[] = [];
    for (const h of history || []) {
      const m = await db.getContentMetrics(h);
      if (m) metrics.push(m);
    }

    // 🔹 4. Build AI prompt with multi-system context
    const prompt = `
You are a streaming recommendation engine.
User context:
- Genres: ${genres?.join(", ") || "none"}
- Moods: ${moods?.join(", ") || "none"}  
- Preferences: ${JSON.stringify(preferences)}
- Viewing history (TMDB IDs): ${history?.join(", ") || "none"}
- Analytics: Views: ${userBehavior.totalViews}, Rating: ${userBehavior.averageRating}, Top genres: ${userBehavior.favoriteGenres.slice(0, 3).join(", ")}
- Similar users: ${similarUsers.map(u => `${u.userId} (similarity: ${u.similarity.toFixed(2)})`).join(", ")}
- Content metrics sample: ${JSON.stringify(metrics.slice(0, 5))}

Return 10 **specific TMDB show/movie IDs** that best match this user's profile.
Format as JSON: { "recommendations": [ { "tmdbId": 123, "reason": "why" }, ... ] }.
    `;

    let recs: { tmdbId: number; reason: string }[] = [];

    // 🔹 5. Call OpenAI if available
    if (openai) {
      try {
        const aiResponse = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4o",
          messages: [
            { role: "system", content: "You are a recommendation engine." }, 
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
        });

        const text = aiResponse.choices[0]?.message?.content || "{}";
        
        try {
          const parsed = JSON.parse(text);
          recs = parsed.recommendations || [];
        } catch (parseError) {
          console.error("❌ Failed to parse AI JSON:", text);
          recs = []; // Will fall back to heuristic recommendations
        }
      } catch (openaiError) {
        console.error("❌ OpenAI API error:", openaiError);
        recs = []; // Will fall back to heuristic recommendations  
      }
    }

    // 🔹 6. Fallback: Generate heuristic recommendations if AI failed
    if (recs.length === 0) {
      console.log("🔄 Using heuristic fallback recommendations");
      
      // Simple genre-based fallback
      const fallbackIds = [
        // Popular shows by genre
        ...(genres?.includes('Drama') ? [1399, 66732, 85552] : []),
        ...(genres?.includes('Sci-Fi') ? [95057, 60735, 85271] : []),
        ...(genres?.includes('Comedy') ? [2316, 1418, 456] : []),
        ...(genres?.includes('Thriller') ? [119051, 1402, 46648] : []),
        ...(genres?.includes('Action') ? [1399, 60574, 456] : []),
        // Default popular shows
        1399, 66732, 85552, 95057, 119051
      ].slice(0, 10);

      recs = fallbackIds.map((id, index) => ({
        tmdbId: id,
        reason: `Popular ${genres?.length > 0 ? genres.join('/') : 'content'} recommendation`
      }));
    }

    // 🔹 7. Fetch TMDB details for each rec
    const detailed = await Promise.all(
      recs.map(async (r) => {
        const tmdbData = await fetchTMDBDetails(r.tmdbId);
        return { ...tmdbData, reason: r.reason };
      })
    );

    console.log("✨ Enhanced recommendations generated:", {
      userId: targetUserId,
      count: detailed.length,
      sources: {
        aiGenerated: recs.length > 0 && openai ? true : false,
        heuristicFallback: !openai || recs.length === 0,
        realUserData: userBehavior.totalViews > 0,
        collaborativeFiltering: similarUsers.length > 0
      }
    });

    return res.status(200).json({ 
      success: true,
      recommendations: detailed,
      metadata: {
        userId: targetUserId,
        requestPayload: { genres, history, moods, preferences },
        dataSourcesUsed: {
          userBehaviorRecords: userBehavior.totalViews,
          similarUsers: similarUsers.length,
          contentMetrics: metrics.length,
          aiGenerated: recs.length > 0 && openai ? true : false
        }
      }
    });

  } catch (err: any) {
    console.error("❌ AI recommendation error:", err);
    return res.status(500).json({ 
      success: false,
      error: "Failed to generate recommendations",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

/**
 * Legacy enhanced recommendations endpoint with filtering support (for backward compatibility)
 * POST /api/enhanced-recommendations/filtered
 */
router.post('/enhanced-recommendations/filtered', rateLimiter, isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { filters = {} } = req.body;
    const userId = (req as any).user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    console.log('🎯 Legacy enhanced recommendations request:', {
      userId,
      filters: Object.keys(filters).filter(key => filters[key] !== undefined)
    });

    // Validate filter types with proper type safety
    const validatedFilters = validateFilters(filters);

    // Fetch real user profile and available shows
    const [userProfile, availableShows] = await Promise.all([
      getUserProfileFromDB(userId),
      getAvailableShowsForUser(userId)
    ]);

    console.log('📊 Data fetched:', {
      userProfileGenres: userProfile.favoriteGenres.length,
      availableShows: availableShows.length,
      currentlyWatching: userProfile.currentlyWatching.length,
      viewingHistory: userProfile.viewingHistory.length
    });

    // Extract exclude list from user's viewing history (if hideWatched is enabled)
    const excludeShows = validatedFilters.hideWatched 
      ? userProfile.viewingHistory.map(item => item.tmdbId)
      : [];

    // Get unified recommendations with filtering
    const result = await UnifiedRecommendationService.getUnifiedRecommendations(
      userProfile,
      availableShows,
      excludeShows,
      validatedFilters
    );

    // Add source breakdown per recommendation (enhancement)
    const enhancedRecommendations = result.recommendations.map(rec => ({
      ...rec,
      sources: {
        primary: rec.source || 'Unknown',
        isAI: rec.source?.includes('AI') || false,
        isTMDB: rec.source?.includes('tmdb') || rec.source?.includes('TMDB') || false,
        isTrending: rec.source?.includes('Trending') || false,
        isCollaborative: rec.source?.includes('Collaborative') || false
      }
    }));

    // Add metadata about applied filters
    const appliedFilters = Object.keys(validatedFilters).filter(
      key => validatedFilters[key] !== undefined && validatedFilters[key] !== null
    );

    console.log('✨ Legacy enhanced recommendations generated:', {
      userId,
      count: result.recommendations.length,
      confidence: Math.round(result.confidence * 100) + '%',
      appliedFilters,
      sources: result.sources
    });

    res.json({
      success: true,
      recommendations: enhancedRecommendations,
      confidence: result.confidence,
      sources: result.sources,
      performanceMetrics: result.performanceMetrics,
      metadata: {
        appliedFilters,
        totalResults: result.recommendations.length,
        excludedShows: excludeShows.length,
        userProfile: {
          favoriteGenres: userProfile.favoriteGenres,
          currentMood: userProfile.contextualCues.currentMood || userProfile.preferences?.mood,
          contentRating: userProfile.contentRating,
          behavioralType: userProfile.behavioralData.bingePatterns,
          noveltySeeker: userProfile.preferences.noveltySeeker,
          completionRate: userProfile.behavioralData.completionRate
        },
        filterSummary: {
          hasGenreFilter: Boolean(validatedFilters.genre?.length),
          hasPlatformFilter: Boolean(validatedFilters.platform?.length),
          hasMoodFilter: Boolean(validatedFilters.mood),
          hasRatingFilter: Boolean(validatedFilters.minRating || validatedFilters.maxRating),
          hideWatched: Boolean(validatedFilters.hideWatched),
          sortBy: validatedFilters.sortBy || 'relevance',
          limit: validatedFilters.limit || 12
        }
      }
    });

  } catch (error) {
    console.error('❌ Legacy enhanced recommendations error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: 'Failed to generate enhanced recommendations',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * Get available filter options
 * GET /api/enhanced-recommendations/filter-options
 */
router.get('/filter-options', async (req: Request, res: Response) => {
  try {
    // These should match your existing filter endpoints and be consistent with UnifiedRecommendationService
    const filterOptions = {
      moods: [
        { id: 'intense', label: 'Intense & Thrilling', description: 'Action, thriller, crime shows' },
        { id: 'light', label: 'Light & Fun', description: 'Comedy, family-friendly content' },
        { id: 'thought-provoking', label: 'Thought-Provoking', description: 'Drama, documentaries, mysteries' },
        { id: 'escapist', label: 'Escapist', description: 'Fantasy, sci-fi, adventure' },
        { id: 'action', label: 'Action-Packed', description: 'High energy, fast-paced content' },
        { id: 'comedy', label: 'Comedy', description: 'Humorous and entertaining' },
        { id: 'drama', label: 'Drama', description: 'Emotional and character-driven' },
        { id: 'horror', label: 'Horror', description: 'Scary and suspenseful' },
        { id: 'romance', label: 'Romance', description: 'Love stories and relationships' },
        { id: 'thriller', label: 'Thriller', description: 'Suspenseful and edge-of-your-seat' },
        { id: 'documentary', label: 'Documentary', description: 'Educational and informative' },
        { id: 'family', label: 'Family', description: 'Suitable for all ages' }
      ],
      genres: [
        'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 
        'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 
        'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'
      ],
      platforms: [
        { id: 'netflix', label: 'Netflix' },
        { id: 'prime', label: 'Amazon Prime Video' },
        { id: 'disney', label: 'Disney+' },
        { id: 'hbo', label: 'HBO Max' },
        { id: 'hulu', label: 'Hulu' },
        { id: 'apple', label: 'Apple TV+' },
        { id: 'paramount', label: 'Paramount+' },
        { id: 'peacock', label: 'Peacock' },
        { id: 'starz', label: 'STARZ' },
        { id: 'showtime', label: 'Showtime' },
        { id: 'max', label: 'Max' },
        { id: 'crave', label: 'Crave' }
      ],
      countries: [
        'US', 'UK', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'JP', 'KR', 'IN', 'MX', 'BR'
      ],
      runtimeOptions: [
        { id: 'all', label: 'Any Length' },
        { id: 'short', label: 'Short (< 30 min)' },
        { id: 'standard', label: 'Standard (30-60 min)' },
        { id: 'long', label: 'Long (> 60 min)' }
      ],
      contentRatings: VALID_CONTENT_RATINGS.map(rating => ({ id: rating, label: rating })),
      sortOptions: [
        { id: 'relevance', label: 'Most Relevant' },
        { id: 'rating', label: 'Highest Rated' },
        { id: 'popularity', label: 'Most Popular' },
        { id: 'recent', label: 'Most Recent' },
        { id: 'alphabetical', label: 'A-Z' }
      ],
      languages: [
        { id: 'en', label: 'English' },
        { id: 'es', label: 'Spanish' },
        { id: 'fr', label: 'French' },
        { id: 'de', label: 'German' },
        { id: 'it', label: 'Italian' },
        { id: 'ja', label: 'Japanese' },
        { id: 'ko', label: 'Korean' },
        { id: 'pt', label: 'Portuguese' },
        { id: 'ru', label: 'Russian' },
        { id: 'zh', label: 'Chinese' }
      ]
    };

    res.json({
      success: true,
      filterOptions,
      validation: {
        maxLimit: 50,
        defaultLimit: 12,
        ratingRange: { min: 0, max: 10 },
        validRuntimes: VALID_RUNTIME_VALUES,
        validSortOptions: VALID_SORT_VALUES,
        validContentRatings: VALID_CONTENT_RATINGS
      }
    });

  } catch (error) {
    console.error('❌ Filter options error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get filter options'
    });
  }
});

export function registerEnhancedRecommendationRoutes(app: any) {
  app.use('/api', router);
  console.log('🎯 Enhanced recommendation routes registered');
}
