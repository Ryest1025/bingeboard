import { Request, Response } from 'express';

// TypeScript interfaces
export interface Show {
  id: string;
  title: string;
  description: string;
  poster?: string;
  genre?: string[];
  releaseYear?: number;
  rating?: number;
}

export interface ContinueWatchingItem {
  show: Show;
  progress: number; // 0-100 percentage
  lastWatched: string; // ISO string for JSON serialization
  episode?: string;
  season?: number;
  episodeNumber?: number;
  totalEpisodes?: number;
  estimatedTimeLeft?: number; // in minutes
}

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

// Mock data with proper typing
const MOCK_CONTINUE_WATCHING: ContinueWatchingItem[] = [
  {
    show: {
      id: '1',
      title: 'Breaking Bad',
      description: 'A high school chemistry teacher diagnosed with lung cancer teams up with a former student to cook and sell methamphetamine.',
      poster: '/api/placeholder/300/450',
      genre: ['Drama', 'Crime', 'Thriller'],
      releaseYear: 2008,
      rating: 9.5,
    },
    progress: 75,
    lastWatched: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    episode: 'S5 E14 - Ozymandias',
    season: 5,
    episodeNumber: 14,
    totalEpisodes: 16,
    estimatedTimeLeft: 12, // 12 minutes left in episode
  },
  {
    show: {
      id: '2',
      title: 'The Office',
      description: 'A mockumentary sitcom about the everyday lives of office employees working at Dunder Mifflin Paper Company.',
      poster: '/api/placeholder/300/450',
      genre: ['Comedy', 'Mockumentary'],
      releaseYear: 2005,
      rating: 9.0,
    },
    progress: 42,
    lastWatched: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    episode: 'S3 E8 - The Convention',
    season: 3,
    episodeNumber: 8,
    totalEpisodes: 14,
    estimatedTimeLeft: 13, // 13 minutes left in episode
  },
  {
    show: {
      id: '3',
      title: 'Stranger Things',
      description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments and supernatural forces.',
      poster: '/api/placeholder/300/450',
      genre: ['Sci-Fi', 'Horror', 'Drama'],
      releaseYear: 2016,
      rating: 8.7,
    },
    progress: 98,
    lastWatched: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    episode: 'S4 E9 - The Piggyback',
    season: 4,
    episodeNumber: 9,
    totalEpisodes: 9,
    estimatedTimeLeft: 1, // Almost finished
  },
];

export const getContinueWatching = async (
  req: Request, 
  res: Response<ContinueWatchingItem[] | ApiResponse>
) => {
  try {
    const { userId } = req.query;
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;

    // Validate required parameters
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid userId',
        message: 'User ID is required and must be a valid string' 
      });
    }

    if (limit < 1 || limit > 50) {
      return res.status(400).json({ 
        error: 'Invalid limit',
        message: 'Limit must be between 1 and 50' 
      });
    }

    // In production, this would query the database with pagination
    // SELECT * FROM user_progress WHERE user_id = ? AND progress > 5 AND progress < 95
    // ORDER BY last_watched DESC LIMIT ? OFFSET ?

    // Filter out completed shows (>95%) and barely started shows (<5%)
    const activeShows = MOCK_CONTINUE_WATCHING.filter(item => 
      item.progress > 5 && item.progress < 95
    );

    // Sort by last watched (most recent first)
    const sortedShows = activeShows.sort((a, b) => 
      new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime()
    );

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedShows = sortedShows.slice(startIndex, startIndex + limit);

    // Return with metadata
    res.status(200).json(paginatedShows);
    
  } catch (error) {
    console.error('Error fetching continue watching:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: `Failed to fetch continue watching: ${errorMessage}` 
    });
  }
};