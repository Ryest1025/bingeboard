import { Request, Response } from 'express';

// TypeScript interfaces
export interface Award {
  id: string;
  name: string; // Using 'name' to match the frontend hook
  description?: string;
  icon?: string;
  earnedAt?: string; // ISO string for JSON serialization
  type?: 'milestone' | 'achievement' | 'badge';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  points?: number; // Award points for gamification
  category?: string; // e.g., 'watching', 'discovery', 'social'
}

interface AwardsResponse {
  awards: Award[];
  totalPoints: number;
  recentAwards: Award[];
  nextMilestone?: {
    name: string;
    description: string;
    progress: number; // 0-100
    requirement: number;
  };
}

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

// Mock awards data with proper typing
const MOCK_AWARDS: Award[] = [
  {
    id: '1',
    name: 'First Watch',
    description: 'Watched your first show',
    icon: '🎬',
    earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    type: 'milestone',
    rarity: 'common',
    points: 10,
    category: 'watching',
  },
  {
    id: '2',
    name: 'Binge Master',
    description: 'Watched 10 episodes in a row',
    icon: '�',
    earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    type: 'achievement',
    rarity: 'rare',
    points: 50,
    category: 'watching',
  },
  {
    id: '3',
    name: 'Genre Explorer',
    description: 'Watched shows from 5 different genres',
    icon: '🌟',
    earnedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    type: 'badge',
    rarity: 'epic',
    points: 75,
    category: 'discovery',
  },
  {
    id: '4',
    name: 'Night Owl',
    description: 'Watched a show after midnight',
    icon: '🦉',
    earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    type: 'badge',
    rarity: 'common',
    points: 15,
    category: 'watching',
  },
  {
    id: '5',
    name: 'Weekend Warrior',
    description: 'Watched 5+ hours on a weekend',
    icon: '⚔️',
    earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    type: 'achievement',
    rarity: 'rare',
    points: 40,
    category: 'watching',
  },
  {
    id: '6',
    name: 'Series Completionist',
    description: 'Completed an entire TV series',
    icon: '✅',
    earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    type: 'milestone',
    rarity: 'legendary',
    points: 100,
    category: 'completion',
  },
];

export const getAwards = async (
  req: Request, 
  res: Response<Award[] | AwardsResponse | ApiResponse>
) => {
  try {
    const { userId } = req.query;
    const includeMetadata = req.query.includeMetadata === 'true';

    // Validate required parameters
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid userId',
        message: 'User ID is required and must be a valid string' 
      });
    }

    // In production, this would query the database:
    // SELECT * FROM user_awards WHERE user_id = ? ORDER BY earned_at DESC

    // Sort awards by earned date (most recent first)
    const sortedAwards = [...MOCK_AWARDS].sort((a, b) => {
      if (!a.earnedAt && !b.earnedAt) return 0;
      if (!a.earnedAt) return 1;
      if (!b.earnedAt) return -1;
      return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
    });

    // If basic response requested, return just awards
    if (!includeMetadata) {
      return res.status(200).json(sortedAwards);
    }

    // Calculate metadata
    const totalPoints = sortedAwards.reduce((sum, award) => sum + (award.points || 0), 0);
    
    // Recent awards (last 7 days)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentAwards = sortedAwards.filter(award => 
      award.earnedAt && new Date(award.earnedAt) > oneWeekAgo
    );

    // Mock next milestone calculation
    const nextMilestone = {
      name: 'Marathon Master',
      description: 'Watch 50 episodes total',
      progress: 78, // 78% complete
      requirement: 50,
    };

    const response: AwardsResponse = {
      awards: sortedAwards,
      totalPoints,
      recentAwards,
      nextMilestone,
    };

    res.status(200).json(response);
    
  } catch (error) {
    console.error('Error fetching awards:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: `Failed to fetch awards: ${errorMessage}` 
    });
  }
};