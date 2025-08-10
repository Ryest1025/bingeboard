import { Request, Response } from 'express';

// Mock data for demonstration - replace with real database queries
const mockContent = [
  {
    id: 1,
    title: "The Matrix",
    poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    vote_average: 8.7,
    release_date: "1999-03-30",
    genre_ids: [28, 878],
    overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers."
  },
  {
    id: 2,
    title: "Inception",
    poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    vote_average: 8.8,
    release_date: "2010-07-16",
    genre_ids: [28, 878, 53],
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology."
  },
  {
    id: 3,
    title: "Breaking Bad",
    name: "Breaking Bad",
    poster_path: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    vote_average: 9.5,
    first_air_date: "2008-01-20",
    genre_ids: [18, 80],
    overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine."
  },
  {
    id: 4,
    title: "Stranger Things",
    name: "Stranger Things",
    poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    vote_average: 8.7,
    first_air_date: "2016-07-15",
    genre_ids: [18, 9648, 878],
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl."
  }
];

const genreMap: Record<string, number[]> = {
  'Action': [28],
  'Drama': [18],
  'Science Fiction': [878],
  'Thriller': [53],
  'Crime': [80],
  'Mystery': [9648]
};

const platformMap: Record<string, string[]> = {
  'Netflix': ['netflix'],
  'Disney+': ['disney'],
  'HBO Max': ['hbo'],
  'Amazon Prime': ['amazon'],
  'Hulu': ['hulu']
};

/**
 * Dashboard content endpoint with enhanced filter support
 * Supports both comma-separated and array parameter formats
 */
export const getDashboardContent = async (req: Request, res: Response) => {
  try {
    const {
      genres, platforms, countries, sports,
      'genres[]': genresArray, 'platforms[]': platformsArray,
      'countries[]': countriesArray, 'sports[]': sportsArray,
      limit = '20', include_user_context = 'false'
    } = req.query;

    console.log('🎯 Dashboard content request:', {
      genres, platforms, countries, sports,
      genresArray, platformsArray, countriesArray, sportsArray
    });

    // Helper function to safely extract filter values (supports both formats)
    const extractFilterValues = (singleParam: any, arrayParam: any): string[] => {
      // Priority: array format > comma-separated format
      if (arrayParam) {
        return Array.isArray(arrayParam) ? arrayParam : [arrayParam];
      }
      if (typeof singleParam === 'string') {
        return singleParam.split(',').map(s => s.trim()).filter(s => s);
      }
      return [];
    };

    // Get filter values with support for both formats
    const genreList = extractFilterValues(genres, genresArray);
    const platformList = extractFilterValues(platforms, platformsArray);
    const countryList = extractFilterValues(countries, countriesArray);
    const sportsList = extractFilterValues(sports, sportsArray);

    console.log('🔍 Parsed filters:', { genreList, platformList, countryList, sportsList });

    // Start with base content
    let filteredContent = [...mockContent];

    // Filter by genres
    if (genreList.length > 0) {
      const genreIds = genreList.flatMap(genre => genreMap[genre.trim()] || []);

      if (genreIds.length > 0) {
        filteredContent = filteredContent.filter(item =>
          item.genre_ids.some(id => genreIds.includes(id))
        );
        console.log(`🎭 Filtered by genres [${genreList.join(', ')}]: ${filteredContent.length} results`);
      }
    }

    // Filter by platforms (enhanced for future integration)
    if (platformList.length > 0) {
      console.log('🎬 Platform filtering requested:', platformList);
      // Mock platform availability - in real implementation, integrate with JustWatch or similar
      const platformMockData: Record<string, number[]> = {
        'netflix': [1, 3, 4], // Mock show IDs available on Netflix
        'hulu': [2, 3],
        'disney+': [4],
        'amazon prime': [1, 2, 3, 4]
      };

      const availableIds = new Set<number>();
      platformList.forEach(platform => {
        const ids = platformMockData[platform.toLowerCase()] || [];
        ids.forEach((id: number) => availableIds.add(id));
      });

      if (availableIds.size > 0) {
        filteredContent = filteredContent.filter(item => availableIds.has(item.id));
        console.log(`📺 Filtered by platforms [${platformList.join(', ')}]: ${filteredContent.length} results`);
      }
    }

    // Filter by countries (mock implementation)
    if (countryList.length > 0) {
      console.log('🌍 Country filtering requested:', countryList);
      // For now, keep all content since mock data doesn't have country info
    }

    // Filter by sports (mock implementation)
    if (sportsList.length > 0) {
      console.log('⚽ Sports filtering requested:', sportsList);
      // For now, keep all content since mock data doesn't have sports categorization
    }

    // Limit results
    const limitNum = parseInt(limit as string);
    if (filteredContent.length > limitNum) {
      filteredContent = filteredContent.slice(0, limitNum);
    }

    // Enhanced results with user context
    const cleanResults = filteredContent.map((item, index) => ({
      ...item,
      id: item.id || index + 1,
      title: item.title || item.name,
      name: item.name || item.title,
      // Add user context if requested
      ...(include_user_context === 'true' && req.user ? {
        user_context: {
          in_watchlist: false, // Check user's watchlist
          watched: false, // Check watch history
          user_rating: null // User's rating if any
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
        type: 'filtered_recommendations',
        timestamp: new Date().toISOString(),
        source: 'enhanced_mock_data',
        has_user_context: include_user_context === 'true' && !!req.user,
        processing_time: Date.now()
      }
    };

    console.log('✅ Dashboard content filtered:', {
      total: response.total_results,
      filters: response.filters_applied,
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
 * Discover content endpoint with filter support
 */
export const getDiscoverContent = async (req: Request, res: Response) => {
  try {
    const { genres, platforms, countries, sports, limit = '50', sort_by = 'popularity.desc' } = req.query;

    console.log('🔍 Discover content request:', { genres, platforms, countries, sports, sort_by });

    let filteredContent = [...mockContent];

    // Helper function to safely split query params
    const safeStringSplit = (param: any): string[] => {
      if (typeof param === 'string') {
        return param.split(',');
      }
      return [];
    };

    // Apply same filtering logic as dashboard
    if (genres && typeof genres === 'string') {
      const genreList = safeStringSplit(genres);
      const genreIds = genreList.flatMap(genre => genreMap[genre.trim()] || []);

      if (genreIds.length > 0) {
        filteredContent = filteredContent.filter(item =>
          item.genre_ids.some(id => genreIds.includes(id))
        );
      }
    }

    // Sort results
    if (sort_by === 'vote_average.desc') {
      filteredContent.sort((a, b) => b.vote_average - a.vote_average);
    } else if (sort_by === 'release_date.desc') {
      filteredContent.sort((a, b) => {
        const dateA = new Date(a.release_date || a.first_air_date || '1970-01-01');
        const dateB = new Date(b.release_date || b.first_air_date || '1970-01-01');
        return dateB.getTime() - dateA.getTime();
      });
    }

    // Generate more results for discover
    const extendedContent = [];
    const limitNum = parseInt(limit as string);

    for (let i = 0; i < limitNum; i++) {
      const baseItem = filteredContent[i % filteredContent.length];
      extendedContent.push({
        ...baseItem,
        id: baseItem.id + i * 200, // Ensure unique IDs
        title: baseItem.title || baseItem.name,
        name: baseItem.name || baseItem.title
      });
    }

    const response = {
      results: extendedContent,
      total_results: extendedContent.length,
      filters_applied: {
        genres: safeStringSplit(genres),
        platforms: safeStringSplit(platforms),
        countries: safeStringSplit(countries),
        sports: safeStringSplit(sports)
      },
      metadata: {
        endpoint: 'discover',
        sort_by,
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
 * Search content with filters
 */
export const getSearchContent = async (req: Request, res: Response) => {
  try {
    const { q, genres, platforms, countries, sports, limit = '30' } = req.query;

    console.log('🔎 Search content request:', { q, genres, platforms, countries, sports });

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    // Helper function to safely split query params
    const safeStringSplit = (param: any): string[] => {
      if (typeof param === 'string') {
        return param.split(',');
      }
      return [];
    };

    let filteredContent = mockContent.filter(item => {
      const title = (item.title || item.name || '').toLowerCase();
      const overview = (item.overview || '').toLowerCase();
      const searchTerm = q.toLowerCase();

      return title.includes(searchTerm) || overview.includes(searchTerm);
    });

    // Apply filter logic (same as above)
    if (genres && typeof genres === 'string') {
      const genreList = safeStringSplit(genres);
      const genreIds = genreList.flatMap(genre => genreMap[genre.trim()] || []);

      if (genreIds.length > 0) {
        filteredContent = filteredContent.filter(item =>
          item.genre_ids.some(id => genreIds.includes(id))
        );
      }
    }

    const response = {
      results: filteredContent.slice(0, parseInt(limit as string)),
      total_results: filteredContent.length,
      query: q,
      filters_applied: {
        genres: safeStringSplit(genres),
        platforms: safeStringSplit(platforms),
        countries: safeStringSplit(countries),
        sports: safeStringSplit(sports)
      },
      metadata: {
        endpoint: 'search',
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
