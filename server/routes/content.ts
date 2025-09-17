import { Request, Response } from 'express';
import { TMDBService } from '../services/tmdb.js';
import { MultiAPIStreamingService } from '../services/multiAPIStreamingService.js';

// Initialize TMDB service
const tmdbService = new TMDBService();

// Genre mapping for better filtering
const genreMap: Record<string, number[]> = {
  'Action': [28],
  'Adventure': [12],
  'Animation': [16],
  'Comedy': [35],
  'Crime': [80],
  'Documentary': [99],
  'Drama': [18],
  'Family': [10751],
  'Fantasy': [14],
  'History': [36],
  'Horror': [27],
  'Music': [10402],
  'Mystery': [9648],
  'Romance': [10749],
  'Science Fiction': [878],
  'TV Movie': [10770],
  'Thriller': [53],
  'War': [10752],
  'Western': [37]
};

// Helper function to add streaming data to content items
async function enhanceWithStreamingData(items: any[], batchSize: number = 5): Promise<any[]> {
  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  const enhancedItems = [];
  for (const batch of batches) {
    const batchPromises = batch.map(async (item: any) => {
      try {
        const mediaType = item.name ? 'tv' : 'movie';
        const title = item.title || item.name;
        const streamingData = await MultiAPIStreamingService.getComprehensiveAvailability(
          item.id,
          title,
          mediaType,
          item.external_ids?.imdb_id
        );

        return {
          ...item,
          streaming_platforms: streamingData.platforms.slice(0, 5), // Top 5 platforms
          streaming_available: streamingData.totalPlatforms > 0,
          affiliate_supported: streamingData.affiliatePlatforms > 0,
          streaming_count: streamingData.totalPlatforms,
          free_platforms: streamingData.freePlatforms,
          premium_platforms: streamingData.premiumPlatforms
        };
      } catch (error) {
        console.warn(`Failed to get streaming data for ${item.title || item.name}:`, error);
        return {
          ...item,
          streaming_available: false,
          streaming_count: 0,
          streaming_platforms: []
        };
      }
    });

    const enhancedBatch = await Promise.all(batchPromises);
    enhancedItems.push(...enhancedBatch);
  }

  return enhancedItems;
}

/**
 * Dashboard content endpoint with real TMDB data and streaming integration
 */
export const getDashboardContent = async (req: Request, res: Response) => {
  try {
    const {
      genres, platforms, countries, sports,
      'genres[]': genresArray, 'platforms[]': platformsArray,
      'countries[]': countriesArray, 'sports[]': sportsArray,
      limit = '20', include_user_context = 'false', include_streaming = 'true'
    } = req.query;

    console.log('🎯 Dashboard content request with real data:', {
      genres, platforms, countries, sports,
      genresArray, platformsArray, countriesArray, sportsArray,
      include_streaming
    });

    // Helper function to safely extract filter values
    const extractFilterValues = (singleParam: any, arrayParam: any): string[] => {
      if (arrayParam) {
        return Array.isArray(arrayParam) ? arrayParam : [arrayParam];
      }
      if (typeof singleParam === 'string') {
        return singleParam.split(',').map(s => s.trim()).filter(s => s);
      }
      return [];
    };

    // Get filter values
    const genreList = extractFilterValues(genres, genresArray);
    const platformList = extractFilterValues(platforms, platformsArray);
    const countryList = extractFilterValues(countries, countriesArray);
    const sportsList = extractFilterValues(sports, sportsArray);

    console.log('🔍 Parsed filters:', { genreList, platformList, countryList, sportsList });

    // Fetch real data from TMDB
    let content: any[] = [];
    
    try {
      // Get trending content as base
      const trendingTV = await tmdbService.getTrending('tv', 'week');
      const trendingMovies = await tmdbService.getTrending('movie', 'week');
      const popularTV = await tmdbService.getPopular('tv');
      const popularMovies = await tmdbService.getPopular('movie');

      // Combine and deduplicate
      const allContent = [
        ...trendingTV.results.slice(0, 5),
        ...trendingMovies.results.slice(0, 5),
        ...popularTV.results.slice(0, 5),
        ...popularMovies.results.slice(0, 5)
      ];

      // Remove duplicates based on ID and type
      const contentMap = new Map();
      allContent.forEach(item => {
        const hasName = 'name' in item && item.name;
        const key = `${item.id}-${hasName ? 'tv' : 'movie'}`;
        if (!contentMap.has(key)) {
          contentMap.set(key, {
            ...item,
            media_type: hasName ? 'tv' : 'movie'
          });
        }
      });

      content = Array.from(contentMap.values());
    } catch (error) {
      console.error('Error fetching TMDB data:', error);
      // Fall back to minimal mock data if TMDB fails
      content = [
        {
          id: 1,
          title: "Popular Content",
          overview: "Real-time content fetching temporarily unavailable",
          vote_average: 7.5,
          media_type: "movie"
        }
      ];
    }

    // Apply genre filtering
    if (genreList.length > 0) {
      const genreIds = genreList.flatMap(genre => genreMap[genre.trim()] || []);
      if (genreIds.length > 0) {
        content = content.filter((item: any) =>
          item.genre_ids?.some((id: number) => genreIds.includes(id)) || false
        );
        console.log(`🎭 Filtered by genres [${genreList.join(', ')}]: ${content.length} results`);
      }
    }

    // Apply platform filtering with real streaming data
    if (platformList.length > 0 && content.length > 0) {
      console.log('🎬 Applying real platform filtering:', platformList);
      
      // Get streaming data for filtering
      const contentWithStreaming = await enhanceWithStreamingData(content.slice(0, 10)); // Limit for performance
      
      content = contentWithStreaming.filter((item: any) => {
        return item.streaming_platforms?.some((platform: any) => 
          platformList.some(filterPlatform => 
            platform.provider_name.toLowerCase().includes(filterPlatform.toLowerCase()) ||
            filterPlatform.toLowerCase().includes(platform.provider_name.toLowerCase())
          )
        ) || false;
      });
      
      console.log(`📺 Filtered by platforms [${platformList.join(', ')}]: ${content.length} results`);
    } else if (include_streaming === 'true' && content.length > 0) {
      // Add streaming data even without platform filtering
      content = await enhanceWithStreamingData(content.slice(0, parseInt(limit as string)));
    }

    // Limit results
    const limitNum = parseInt(limit as string);
    if (content.length > limitNum) {
      content = content.slice(0, limitNum);
    }

    // Clean and enhance results
    const cleanResults = content.map((item: any, index: number) => ({
      ...item,
      id: item.id || index + 1,
      title: item.title || item.name,
      name: item.name || item.title,
      poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      backdrop_url: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : null,
      release_year: item.release_date ? new Date(item.release_date).getFullYear() : 
                   item.first_air_date ? new Date(item.first_air_date).getFullYear() : null,
      // Add user context if requested
      ...(include_user_context === 'true' && req.user ? {
        user_context: {
          in_watchlist: false, // TODO: Check user's watchlist from database
          watched: false, // TODO: Check watch history from database
          user_rating: null // TODO: User's rating if any
        }
      } : {})
    }));

    const response = {
      results: cleanResults,
      total_results: cleanResults.length,
      page: 1,
      filters_applied: {
        genres: genreList.length > 0 ? genreList : null,
        platforms: platformList.length > 0 ? platformList : null,
        countries: countryList.length > 0 ? countryList : null,
        sports: sportsList.length > 0 ? sportsList : null
      },
      metadata: {
        endpoint: 'dashboard',
        type: 'real_time_recommendations',
        timestamp: new Date().toISOString(),
        source: 'tmdb_multi_api',
        has_user_context: include_user_context === 'true' && !!req.user,
        streaming_enhanced: include_streaming === 'true',
        processing_time: Date.now()
      }
    };

    console.log('✅ Dashboard content with real data:', {
      total: response.total_results,
      filters: response.filters_applied,
      streaming_enhanced: include_streaming === 'true',
      user: req.user?.email || 'anonymous'
    });

    res.json(response);
  } catch (error) {
    console.error('❌ Dashboard content error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard content',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Discover content endpoint with real TMDB data and streaming integration
 */
export const getDiscoverContent = async (req: Request, res: Response) => {
  try {
    const { 
      genres, platforms, countries, sports, 
      limit = '50', 
      sort_by = 'popularity.desc',
      media_type = 'all',
      include_streaming = 'true'
    } = req.query;

    console.log('🔍 Discover content request with real data:', { 
      genres, platforms, countries, sports, sort_by, media_type 
    });

    // Helper function to safely split query params
    const safeStringSplit = (param: any): string[] => {
      if (typeof param === 'string') {
        return param.split(',').map(s => s.trim()).filter(s => s);
      }
      return [];
    };

    let content: any[] = [];

    try {
      // Build discover query based on filters
      const discoverParams: any = {
        sort_by: sort_by as string,
        'vote_count.gte': 100, // Minimum votes for quality
        page: 1
      };

      // Add genre filtering
      const genreList = safeStringSplit(genres);
      if (genreList.length > 0) {
        const genreIds = genreList.flatMap(genre => genreMap[genre.trim()] || []);
        if (genreIds.length > 0) {
          discoverParams.with_genres = genreIds.join(',');
        }
      }

      // Fetch based on media type
      if (media_type === 'tv' || media_type === 'all') {
        const tvResults = await tmdbService.discover('tv', discoverParams);
        content.push(...tvResults.results.map((item: any) => ({ ...item, media_type: 'tv' })));
      }

      if (media_type === 'movie' || media_type === 'all') {
        const movieResults = await tmdbService.discover('movie', discoverParams);
        content.push(...movieResults.results.map((item: any) => ({ ...item, media_type: 'movie' })));
      }

      // Sort combined results
      if (sort_by === 'vote_average.desc') {
        content.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      } else if (sort_by === 'popularity.desc') {
        content.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      } else if (sort_by === 'release_date.desc') {
        content.sort((a, b) => {
          const dateA = new Date(a.release_date || a.first_air_date || '1970-01-01');
          const dateB = new Date(b.release_date || b.first_air_date || '1970-01-01');
          return dateB.getTime() - dateA.getTime();
        });
      }

    } catch (error) {
      console.error('Error fetching TMDB discover data:', error);
      // Fallback to trending if discover fails
      try {
        const trending = await tmdbService.getTrending('all', 'week');
        content = trending.results;
      } catch (fallbackError) {
        console.error('Error fetching trending fallback:', fallbackError);
        content = [];
      }
    }

    // Apply platform filtering with streaming data
    const platformList = safeStringSplit(platforms);
    if (platformList.length > 0 && content.length > 0) {
      console.log('🎬 Applying platform filtering to discover results:', platformList);
      
      const contentWithStreaming = await enhanceWithStreamingData(content.slice(0, 20)); // Limit for performance
      
      content = contentWithStreaming.filter((item: any) => {
        return item.streaming_platforms?.some((platform: any) => 
          platformList.some(filterPlatform => 
            platform.provider_name.toLowerCase().includes(filterPlatform.toLowerCase()) ||
            filterPlatform.toLowerCase().includes(platform.provider_name.toLowerCase())
          )
        ) || false;
      });
    } else if (include_streaming === 'true' && content.length > 0) {
      // Add streaming data even without platform filtering
      const limitNum = Math.min(parseInt(limit as string), content.length);
      content = await enhanceWithStreamingData(content.slice(0, limitNum));
    }

    // Limit results
    const limitNum = parseInt(limit as string);
    content = content.slice(0, limitNum);

    const response = {
      results: content.map((item: any) => ({
        ...item,
        title: item.title || item.name,
        name: item.name || item.title,
        poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        backdrop_url: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : null
      })),
      total_results: content.length,
      filters_applied: {
        genres: safeStringSplit(genres),
        platforms: safeStringSplit(platforms), 
        countries: safeStringSplit(countries),
        sports: safeStringSplit(sports)
      },
      metadata: {
        endpoint: 'discover',
        sort_by,
        media_type,
        source: 'tmdb_multi_api',
        streaming_enhanced: include_streaming === 'true',
        timestamp: new Date().toISOString()
      }
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Discover content error:', error);
    res.status(500).json({
      error: 'Failed to fetch discover content',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Search content with real TMDB data and streaming integration
 */
export const getSearchContent = async (req: Request, res: Response) => {
  try {
    const { 
      q, genres, platforms, countries, sports, 
      limit = '30', 
      include_streaming = 'true'
    } = req.query;

    console.log('🔎 Search content request with real data:', { 
      q, genres, platforms, countries, sports 
    });

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    // Helper function to safely split query params
    const safeStringSplit = (param: any): string[] => {
      if (typeof param === 'string') {
        return param.split(',').map(s => s.trim()).filter(s => s);
      }
      return [];
    };

    let content: any[] = [];

    try {
      // Search both movies and TV shows
      const [movieResults, tvResults] = await Promise.all([
        tmdbService.search(q as string, { mediaType: 'movie' }),
        tmdbService.search(q as string, { mediaType: 'tv' })
      ]);

      content = [
        ...movieResults.results.map((item: any) => ({ ...item, media_type: 'movie' })),
        ...tvResults.results.map((item: any) => ({ ...item, media_type: 'tv' }))
      ];

      // Sort by popularity/relevance
      content.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    } catch (error) {
      console.error('Error searching TMDB:', error);
      content = [];
    }

    // Apply genre filtering
    const genreList = safeStringSplit(genres);
    if (genreList.length > 0) {
      const genreIds = genreList.flatMap(genre => genreMap[genre.trim()] || []);
      if (genreIds.length > 0) {
        content = content.filter((item: any) =>
          item.genre_ids?.some((id: number) => genreIds.includes(id)) || false
        );
      }
    }

    // Apply platform filtering with streaming data
    const platformList = safeStringSplit(platforms);
    if (platformList.length > 0 && content.length > 0) {
      console.log('🎬 Applying platform filtering to search results:', platformList);
      
      const contentWithStreaming = await enhanceWithStreamingData(content.slice(0, 15)); // Limit for performance
      
      content = contentWithStreaming.filter((item: any) => {
        return item.streaming_platforms?.some((platform: any) => 
          platformList.some(filterPlatform => 
            platform.provider_name.toLowerCase().includes(filterPlatform.toLowerCase()) ||
            filterPlatform.toLowerCase().includes(platform.provider_name.toLowerCase())
          )
        ) || false;
      });
    } else if (include_streaming === 'true' && content.length > 0) {
      // Add streaming data even without platform filtering
      const limitNum = Math.min(parseInt(limit as string), content.length);
      content = await enhanceWithStreamingData(content.slice(0, limitNum));
    }

    // Limit final results
    content = content.slice(0, parseInt(limit as string));

    const response = {
      results: content.map((item: any) => ({
        ...item,
        title: item.title || item.name,
        name: item.name || item.title,
        poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        backdrop_url: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : null
      })),
      total_results: content.length,
      query: q,
      filters_applied: {
        genres: genreList,
        platforms: platformList,
        countries: safeStringSplit(countries),
        sports: safeStringSplit(sports)
      },
      metadata: {
        endpoint: 'search',
        source: 'tmdb_multi_api',
        streaming_enhanced: include_streaming === 'true',
        timestamp: new Date().toISOString()
      }
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Search content error:', error);
    res.status(500).json({
      error: 'Failed to search content',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Mock network data for testing
const MOCK_NETWORKS = [
  'Netflix',
  'Disney+',
  'Amazon Prime Video',
  'HBO Max',
  'Hulu',
  'Apple TV+',
  'Paramount+',
  'Peacock'
];

const MOCK_GENRES = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' }
];

// Helper function to generate mock trending content
function generateMockTrendingContent(network: string, count: number = 10) {
  const titles = [
    'The Crown', 'Stranger Things', 'House of Cards', 'Breaking Bad',
    'Game of Thrones', 'The Office', 'Friends', 'The Bear', 'Wednesday',
    'House of the Dragon', 'The Last of Us', 'Euphoria', 'The Boys',
    'Succession', 'Better Call Saul', 'The Mandalorian', 'Squid Game',
    'Bridgerton', 'The Witcher', 'Money Heist'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: Math.random() * 100000,
    name: titles[Math.floor(Math.random() * titles.length)],
    title: titles[Math.floor(Math.random() * titles.length)],
    overview: `A captivating series exclusive to ${network} that has been trending among viewers worldwide.`,
    poster_path: `/poster${(i % 10) + 1}.jpg`,
    backdrop_path: `/backdrop${(i % 10) + 1}.jpg`,
    vote_average: 7.5 + Math.random() * 2,
    first_air_date: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString().split('T')[0],
    genre_ids: [MOCK_GENRES[Math.floor(Math.random() * MOCK_GENRES.length)].id],
    popularity: 80 + Math.random() * 20,
    streaming_platform: network
  }));
}

// Helper function to generate mock upcoming content
function generateMockUpcomingContent(count: number = 20) {
  const titles = [
    'Avatar: The Last Airbender', 'The Rings of Power S2', 'House of the Dragon S2',
    'Stranger Things S5', 'The Bear S4', 'Wednesday S2', 'The Boys S5',
    'Euphoria S3', 'The Mandalorian S4', 'Bridgerton S4'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: Math.random() * 100000,
    name: titles[Math.floor(Math.random() * titles.length)],
    title: titles[Math.floor(Math.random() * titles.length)],
    overview: `An upcoming series that promises to deliver exceptional entertainment.`,
    poster_path: `/poster${(i % 10) + 1}.jpg`,
    backdrop_path: `/backdrop${(i % 10) + 1}.jpg`,
    vote_average: 8.0 + Math.random() * 1.5,
    first_air_date: new Date(2024, 6 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 28)).toISOString().split('T')[0],
    release_date: new Date(2024, 6 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 28)).toISOString().split('T')[0],
    genre_ids: [MOCK_GENRES[Math.floor(Math.random() * MOCK_GENRES.length)].id],
    popularity: 70 + Math.random() * 30,
    streaming_platform: MOCK_NETWORKS[Math.floor(Math.random() * MOCK_NETWORKS.length)]
  }));
}

/**
 * Get trending content by streaming network
 */
export const getTrendingByNetwork = async (req: Request, res: Response) => {
  try {
    // For now, return mock data organized by network
    const trendingByNetwork: Record<string, any[]> = {};
    
    MOCK_NETWORKS.forEach(network => {
      trendingByNetwork[network] = generateMockTrendingContent(network, 10);
    });

    res.json(trendingByNetwork);
  } catch (error) {
    console.error('Error fetching trending by network:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get upcoming releases
 */
export const getUpcoming = async (req: Request, res: Response) => {
  try {
    const results = generateMockUpcomingContent(20);
    
    res.json({
      results,
      total_results: results.length,
      total_pages: 1,
      page: 1
    });
  } catch (error) {
    console.error('Error fetching upcoming releases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get available streaming networks
 */
export const getNetworks = async (req: Request, res: Response) => {
  try {
    res.json(MOCK_NETWORKS);
  } catch (error) {
    console.error('Error fetching networks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get available genres
 */
export const getGenres = async (req: Request, res: Response) => {
  try {
    res.json(MOCK_GENRES);
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
