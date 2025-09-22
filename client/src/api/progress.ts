import { NextApiRequest, NextApiResponse } from 'next';

// TypeScript interfaces for better type safety
export interface ProgressItem {
  id: string;
  showId: string;
  showTitle: string;
  showImage?: string;
  showType: 'tv' | 'movie';
  currentTime: number; // in seconds
  totalTime: number; // in seconds
  lastWatched: string; // ISO string
  season?: number;
  episode?: number;
  episodeTitle?: string;
  completed: boolean;
  percentage: number; // 0-100
}

export interface UpdateProgressRequest {
  showId: string;
  currentTime: number;
  totalTime: number;
  season?: number;
  episode?: number;
  completed?: boolean;
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

// Mock data with proper TypeScript typing
const MOCK_PROGRESS_DATA: ProgressItem[] = [
  {
    id: '1',
    showId: '1',
    showTitle: 'Breaking Bad',
    showImage: '/api/placeholder/300/450',
    showType: 'tv',
    currentTime: 1800, // 30 minutes
    totalTime: 2700, // 45 minutes
    lastWatched: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    season: 5,
    episode: 14,
    episodeTitle: 'Ozymandias',
    completed: false,
    percentage: 67
  },
  {
    id: '2',
    showId: '2',
    showTitle: 'The Office',
    showImage: '/api/placeholder/300/450',
    showType: 'tv',
    currentTime: 600, // 10 minutes
    totalTime: 1320, // 22 minutes
    lastWatched: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    season: 3,
    episode: 8,
    episodeTitle: 'The Convention',
    completed: false,
    percentage: 45
  },
  {
    id: '3',
    showId: '3',
    showTitle: 'Stranger Things',
    showImage: '/api/placeholder/300/450',
    showType: 'tv',
    currentTime: 2640, // 44 minutes
    totalTime: 2700, // 45 minutes
    lastWatched: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    season: 4,
    episode: 9,
    episodeTitle: 'The Piggyback',
    completed: false,
    percentage: 98
  }
];

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ProgressItem[] | ApiResponse>
) {
  try {
    if (req.method === 'GET') {
      // Get user progress data
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ 
          error: 'Missing userId parameter',
          message: 'userId is required to fetch progress data' 
        });
      }
      
      // In production, this would query the database
      // For now, return mock data with calculated percentages
      const progressData = MOCK_PROGRESS_DATA.map(item => ({
        ...item,
        percentage: item.totalTime > 0 ? Math.round((item.currentTime / item.totalTime) * 100) : 0
      }));

      res.status(200).json(progressData);
      
    } else if (req.method === 'POST') {
      // Update progress
      const updateData: UpdateProgressRequest = req.body;
      
      // Validate required fields
      const { showId, currentTime, totalTime } = updateData;
      
      if (!showId) {
        return res.status(400).json({ 
          error: 'Missing showId',
          message: 'showId is required to update progress' 
        });
      }
      
      if (currentTime == null || totalTime == null) {
        return res.status(400).json({ 
          error: 'Missing time data',
          message: 'currentTime and totalTime are required' 
        });
      }
      
      if (currentTime < 0 || totalTime <= 0) {
        return res.status(400).json({ 
          error: 'Invalid time values',
          message: 'currentTime must be >= 0 and totalTime must be > 0' 
        });
      }
      
      // Calculate completion percentage
      const percentage = Math.round((currentTime / totalTime) * 100);
      
      // In production, this would update the database
      console.log('Updating progress:', {
        ...updateData,
        percentage,
        timestamp: new Date().toISOString()
      });
      
      res.status(200).json({ 
        message: 'Progress updated successfully',
        data: {
          showId,
          currentTime,
          totalTime,
          percentage,
          completed: updateData.completed || percentage >= 90
        }
      });
      
    } else if (req.method === 'DELETE') {
      // Remove progress entry
      const progressId = req.query.id as string;
      
      if (!progressId) {
        return res.status(400).json({ 
          error: 'Missing progress ID',
          message: 'Progress ID is required for deletion' 
        });
      }
      
      // In production, this would delete from database
      console.log('Removing progress entry:', progressId);
      
      res.status(200).json({ 
        message: 'Progress entry removed successfully' 
      });
      
    } else {
      res.status(405).json({ 
        error: 'Method not allowed',
        message: `HTTP method ${req.method} is not supported on this endpoint` 
      });
    }
  } catch (error) {
    console.error('Error handling progress request:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: `Failed to handle progress request: ${errorMessage}` 
    });
  }
}