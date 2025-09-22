import { Request, Response } from 'express';

// TypeScript interfaces
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  poster?: string;
  rating?: number;
  genre?: string[];
  releaseYear?: number;
  platform?: string[];
  isNewSeason?: boolean;
  seasonNumber?: number;
  nextSeasonReleaseDate?: string;
  aiScore?: number; // 0-100 AI recommendation confidence
  matchReason?: string; // Why this was recommended
  similarShows?: string[]; // IDs of similar shows
  trendingScore?: number; // Current popularity score
}

interface RecommendationsQuery {
  userId: string;
  limit?: number;
  genres?: string[];
  minRating?: number;
  includeNewSeasons?: boolean;
  sortBy?: 'aiScore' | 'rating' | 'trending' | 'releaseDate';
}

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  metadata?: {
    total: number;
    aiRecommendations: number;
    newSeasons: number;
    trending: number;
  };
}

// Mock AI recommendations
const MOCK_AI_RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    title: 'Breaking Bad',
    description: 'A high school chemistry teacher diagnosed with lung cancer teams up with a former student to cook and sell methamphetamine.',
    poster: '/api/placeholder/300/450',
    rating: 9.5,
    genre: ['Drama', 'Crime', 'Thriller'],
    releaseYear: 2008,
    platform: ['Netflix', 'Amazon Prime'],
    aiScore: 95,
    matchReason: 'Based on your interest in crime dramas',
    similarShows: ['Better Call Saul', 'Ozark'],
    trendingScore: 88,
  },
  {
    id: '2',
    title: 'The Office',
    description: 'A mockumentary sitcom about the everyday lives of office employees working at Dunder Mifflin Paper Company.',
    poster: '/api/placeholder/300/450',
    rating: 9.0,
    genre: ['Comedy', 'Mockumentary'],
    releaseYear: 2005,
    platform: ['Peacock', 'Amazon Prime'],
    aiScore: 87,
    matchReason: 'Perfect for comedy lovers',
    similarShows: ['Parks and Recreation', 'Brooklyn Nine-Nine'],
    trendingScore: 92,
  },
  {
    id: '4',
    title: 'The Crown',
    description: 'Chronicles the life of Queen Elizabeth II from the 1940s to modern times.',
    poster: '/api/placeholder/300/450',
    rating: 8.7,
    genre: ['Drama', 'Historical', 'Biography'],
    releaseYear: 2016,
    platform: ['Netflix'],
    aiScore: 82,
    matchReason: 'Based on your viewing history',
    similarShows: ['Downton Abbey', 'Victoria'],
    trendingScore: 75,
  },
];

// Mock upcoming seasons
const MOCK_UPCOMING_SEASONS: Recommendation[] = [
  {
    id: '3',
    title: 'Stranger Things',
    description: 'Kids in a small town encounter supernatural forces and government conspiracies.',
    poster: '/api/placeholder/300/450',
    rating: 8.7,
    genre: ['Sci-Fi', 'Horror', 'Drama'],
    releaseYear: 2016,
    platform: ['Netflix'],
    isNewSeason: true,
    seasonNumber: 5,
    nextSeasonReleaseDate: '2024-07-15',
    aiScore: 90,
    matchReason: 'New season of a show you love',
    trendingScore: 95,
  },
  {
    id: '5',
    title: 'The Boys',
    description: 'A group of vigilantes set out to take down corrupt superheroes.',
    poster: '/api/placeholder/300/450',
    rating: 8.8,
    genre: ['Action', 'Comedy', 'Superhero'],
    releaseYear: 2019,
    platform: ['Amazon Prime'],
    isNewSeason: true,
    seasonNumber: 5,
    nextSeasonReleaseDate: '2024-06-13',
    aiScore: 88,
    matchReason: 'New season alert!',
    trendingScore: 93,
  },
];

export const getRecommendations = async (
  req: Request, 
  res: Response<Recommendation[] | ApiResponse>
) => {
  try {
    const {
      userId,
      limit = 10,
      genres,
      minRating = 0,
      includeNewSeasons = true,
      sortBy = 'aiScore'
    } = req.query as Partial<RecommendationsQuery> & { [key: string]: any };

    // Validate required parameters
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid userId',
        message: 'User ID is required and must be a valid string' 
      });
    }

    const limitNum = parseInt(String(limit));
    const minRatingNum = parseFloat(String(minRating));

    if (limitNum < 1 || limitNum > 50) {
      return res.status(400).json({ 
        error: 'Invalid limit',
        message: 'Limit must be between 1 and 50' 
      });
    }

    // In production, this would query user preferences and watching history
    // to generate personalized recommendations

    let recommendations: Recommendation[] = [];

    // Add upcoming seasons if requested
    if (includeNewSeasons) {
      recommendations.push(...MOCK_UPCOMING_SEASONS);
    }

    // Add AI recommendations
    recommendations.push(...MOCK_AI_RECOMMENDATIONS);

    // Apply genre filter
    if (genres && Array.isArray(genres) && genres.length > 0) {
      recommendations = recommendations.filter(rec => 
        rec.genre?.some(g => genres.includes(g))
      );
    }

    // Apply rating filter
    if (minRatingNum > 0) {
      recommendations = recommendations.filter(rec => 
        (rec.rating || 0) >= minRatingNum
      );
    }

    // Sort recommendations
    recommendations.sort((a, b) => {
      // New seasons always come first
      if (a.isNewSeason && !b.isNewSeason) return -1;
      if (!a.isNewSeason && b.isNewSeason) return 1;
      
      // Then sort by specified criteria
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'trending':
          return (b.trendingScore || 0) - (a.trendingScore || 0);
        case 'releaseDate':
          return (b.releaseYear || 0) - (a.releaseYear || 0);
        case 'aiScore':
        default:
          return (b.aiScore || 0) - (a.aiScore || 0);
      }
    });

    // Apply limit
    const limitedRecommendations = recommendations.slice(0, limitNum);

    // Calculate metadata
    const metadata = {
      total: limitedRecommendations.length,
      aiRecommendations: limitedRecommendations.filter(r => !r.isNewSeason).length,
      newSeasons: limitedRecommendations.filter(r => r.isNewSeason).length,
      trending: limitedRecommendations.filter(r => (r.trendingScore || 0) > 80).length,
    };

    res.status(200).json(limitedRecommendations);
    
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: `Failed to fetch recommendations: ${errorMessage}` 
    });
  }
};