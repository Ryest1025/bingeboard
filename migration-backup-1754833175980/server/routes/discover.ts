import express from 'express';
import { z } from 'zod';

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        uid: string;
        [key: string]: any;
      };
    }
  }
}

const router = express.Router();

// Enhanced discover endpoint with comprehensive filtering
const discoverQuerySchema = z.object({
  genres: z.string().optional(),
  platforms: z.string().optional(),
  countries: z.string().optional(),
  sports: z.string().optional(),
  query: z.string().optional(),
  limit: z.string().optional(),
  page: z.string().optional(),
  sort_by: z.enum(['popularity.desc', 'popularity.asc', 'release_date.desc', 'release_date.asc', 'vote_average.desc']).optional()
});

router.get('/discover', async (req, res) => {
  try {
    const validated = discoverQuerySchema.parse(req.query);
    
    // Parse filter arrays
    const genres = validated.genres ? validated.genres.split(',').map(g => g.trim()) : [];
    const platforms = validated.platforms ? validated.platforms.split(',').map(p => p.trim()) : [];
    const countries = validated.countries ? validated.countries.split(',').map(c => c.trim()) : [];
    const sports = validated.sports ? validated.sports.split(',').map(s => s.trim()) : [];
    
    const limit = parseInt(validated.limit || '20');
    const page = parseInt(validated.page || '1');
    const sortBy = validated.sort_by || 'popularity.desc';
    
    // Build TMDB API request parameters
    const tmdbParams = new URLSearchParams({
      api_key: process.env.TMDB_API_KEY!,
      page: page.toString(),
      sort_by: sortBy,
      include_adult: 'false',
      include_video: 'false'
    });
    
    // Add genre filtering
    if (genres.length > 0) {
      // Map genre names to TMDB genre IDs (simplified mapping)
      const genreMapping: Record<string, string> = {
        'action': '28',
        'adventure': '12',
        'animation': '16',
        'comedy': '35',
        'crime': '80',
        'documentary': '99',
        'drama': '18',
        'family': '10751',
        'fantasy': '14',
        'history': '36',
        'horror': '27',
        'music': '10402',
        'mystery': '9648',
        'romance': '10749',
        'science fiction': '878',
        'tv movie': '10770',
        'thriller': '53',
        'war': '10752',
        'western': '37'
      };
      
      const genreIds = genres
        .map(genre => genreMapping[genre.toLowerCase()])
        .filter(Boolean);
      
      if (genreIds.length > 0) {
        tmdbParams.set('with_genres', genreIds.join(','));
      }
    }
    
    // Add country filtering
    if (countries.length > 0) {
      // Use ISO country codes for TMDB
      tmdbParams.set('with_origin_country', countries.join(','));
    }
    
    // Handle search query vs discover
    let tmdbUrl: string;
    if (validated.query) {
      // Use search endpoint for text queries
      tmdbUrl = `https://api.themoviedb.org/3/search/multi?${tmdbParams.toString()}&query=${encodeURIComponent(validated.query)}`;
    } else {
      // Use discover endpoint for filtered browsing
      tmdbUrl = `https://api.themoviedb.org/3/discover/movie?${tmdbParams.toString()}`;
    }
    
    console.log('🔍 Discover API request:', tmdbUrl);
    
    const tmdbResponse = await fetch(tmdbUrl);
    
    if (!tmdbResponse.ok) {
      throw new Error(`TMDB API error: ${tmdbResponse.status}`);
    }
    
    const tmdbData = await tmdbResponse.json();
    
    // Enhanced results with platform availability (mock data for now)
    const enhancedResults = tmdbData.results.map((item: any) => ({
      ...item,
      // Mock platform availability - in real implementation, integrate with JustWatch API
      available_platforms: platforms.length > 0 ? platforms : ['netflix', 'hulu', 'disney+'],
      // Add sports categorization for sports content
      sports_categories: item.genre_ids?.includes(99) ? sports : [], // Documentary genre as sports proxy
      // Enhanced metadata
      popularity_score: Math.round(item.popularity),
      content_type: item.media_type || (item.title ? 'movie' : 'tv'),
      // User context (if user is authenticated)
      user_context: req.user ? {
        in_watchlist: false, // Check user's watchlist
        watched: false, // Check watch history
        user_rating: null // User's rating if any
      } : null
    }));
    
    // Apply platform filtering on enhanced results
    const filteredResults = platforms.length > 0 
      ? enhancedResults.filter((item: any) => 
          item.available_platforms.some((platform: string) => 
            platforms.includes(platform.toLowerCase())
          )
        )
      : enhancedResults;
    
    // Apply sports filtering
    const sportsFilteredResults = sports.length > 0
      ? filteredResults.filter((item: any) =>
          item.sports_categories.some((sport: string) =>
            sports.includes(sport.toLowerCase())
          )
        )
      : filteredResults;
    
    const response = {
      results: sportsFilteredResults.slice(0, limit),
      total_results: sportsFilteredResults.length,
      total_pages: Math.ceil(sportsFilteredResults.length / limit),
      page: page,
      filters_applied: {
        genres: genres.length > 0 ? genres : null,
        platforms: platforms.length > 0 ? platforms : null,
        countries: countries.length > 0 ? countries : null,
        sports: sports.length > 0 ? sports : null,
        search_query: validated.query || null
      },
      metadata: {
        api_source: validated.query ? 'tmdb_search' : 'tmdb_discover',
        processing_time: Date.now(),
        has_user_context: !!req.user
      }
    };
    
    console.log('✅ Discover response:', {
      results_count: response.results.length,
      filters: response.filters_applied,
      user: req.user?.email || 'anonymous'
    });
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Discover API error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: error.errors
      });
    }
    
    res.status(500).json({
      error: 'Failed to fetch discover content',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get filter options for discover page
router.get('/discover/filters', async (req, res) => {
  try {
    // In a real implementation, these would come from your database or external APIs
    const filterOptions = {
      genres: [
        { value: 'action', label: 'Action', count: 1250 },
        { value: 'adventure', label: 'Adventure', count: 890 },
        { value: 'animation', label: 'Animation', count: 450 },
        { value: 'comedy', label: 'Comedy', count: 2100 },
        { value: 'crime', label: 'Crime', count: 680 },
        { value: 'documentary', label: 'Documentary', count: 340 },
        { value: 'drama', label: 'Drama', count: 3200 },
        { value: 'family', label: 'Family', count: 520 },
        { value: 'fantasy', label: 'Fantasy', count: 410 },
        { value: 'horror', label: 'Horror', count: 780 },
        { value: 'mystery', label: 'Mystery', count: 290 },
        { value: 'romance', label: 'Romance', count: 650 },
        { value: 'science fiction', label: 'Sci-Fi', count: 590 },
        { value: 'thriller', label: 'Thriller', count: 920 }
      ],
      platforms: [
        { value: 'netflix', label: 'Netflix', count: 1800 },
        { value: 'hulu', label: 'Hulu', count: 1200 },
        { value: 'disney+', label: 'Disney+', count: 800 },
        { value: 'amazon prime', label: 'Amazon Prime', count: 2200 },
        { value: 'hbo max', label: 'HBO Max', count: 950 },
        { value: 'apple tv+', label: 'Apple TV+', count: 180 },
        { value: 'paramount+', label: 'Paramount+', count: 420 },
        { value: 'peacock', label: 'Peacock', count: 350 }
      ],
      countries: [
        { value: 'US', label: 'United States', count: 5200 },
        { value: 'GB', label: 'United Kingdom', count: 890 },
        { value: 'CA', label: 'Canada', count: 340 },
        { value: 'AU', label: 'Australia', count: 210 },
        { value: 'JP', label: 'Japan', count: 650 },
        { value: 'KR', label: 'South Korea', count: 420 },
        { value: 'FR', label: 'France', count: 380 },
        { value: 'DE', label: 'Germany', count: 290 }
      ],
      sports: [
        { value: 'football', label: 'Football', count: 120 },
        { value: 'basketball', label: 'Basketball', count: 95 },
        { value: 'baseball', label: 'Baseball', count: 78 },
        { value: 'soccer', label: 'Soccer', count: 156 },
        { value: 'hockey', label: 'Hockey', count: 45 },
        { value: 'tennis', label: 'Tennis', count: 32 },
        { value: 'golf', label: 'Golf', count: 28 },
        { value: 'boxing', label: 'Boxing', count: 67 }
      ]
    };
    
    console.log('✅ Filter options fetched for discover');
    res.json(filterOptions);
    
  } catch (error) {
    console.error('❌ Failed to fetch filter options:', error);
    res.status(500).json({
      error: 'Failed to fetch filter options',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
