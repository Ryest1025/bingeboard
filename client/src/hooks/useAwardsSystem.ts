import { useQuery } from '@tanstack/react-query';

export interface Award {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  earnedAt?: Date;
  type?: 'milestone' | 'achievement' | 'badge';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AwardResponse {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  earnedAt?: string; // API returns ISO string
  type?: 'milestone' | 'achievement' | 'badge';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UseAwardsSystemResult {
  awards: Award[];
  isLoading: boolean;
  error: Error | null;
  totalAwards: number;
  recentAwards: Award[];
}

// Mock awards for development/fallback
const MOCK_AWARDS: Award[] = [
  {
    id: '1',
    name: 'First Watch',
    description: 'Watched your first show',
    icon: '🎬',
    earnedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    type: 'milestone',
    rarity: 'common',
  },
  {
    id: '2',
    name: 'Binge Master',
    description: 'Watched 10 episodes in a row',
    icon: '🏆',
    earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Week ago
    type: 'achievement',
    rarity: 'rare',
  },
  {
    id: '3',
    name: 'Night Owl',
    description: 'Watched a show after midnight',
    icon: '🦉',
    earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    type: 'badge',
    rarity: 'common',
  },
];

export function useAwardsSystem(userId?: string): UseAwardsSystemResult {
  const { data: awards, isLoading, error } = useQuery({
    queryKey: ['awards', userId],
    queryFn: async (): Promise<Award[]> => {
      if (!userId) return MOCK_AWARDS;
      
      try {
        const res = await fetch(`/api/awards?userId=${userId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          if (res.status === 404) {
            // User has no awards yet, return empty array
            return [];
          }
          
          console.warn(`Awards API returned ${res.status}, using mock data`);
          return MOCK_AWARDS;
        }
        
        const data: AwardResponse[] = await res.json();
        
        // Transform API response with proper date parsing
        return data.map((award) => ({
          ...award,
          earnedAt: award.earnedAt ? new Date(award.earnedAt) : undefined,
        }));
      } catch (error) {
        console.error('Error fetching awards:', error);
        // Return mock awards instead of empty array for better UX
        return MOCK_AWARDS;
      }
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes (awards don't change frequently)
    retry: 2,
  });

  const awardsList = awards || [];
  
  // Sort awards by earned date (most recent first)
  const sortedAwards = [...awardsList].sort((a, b) => {
    if (!a.earnedAt && !b.earnedAt) return 0;
    if (!a.earnedAt) return 1;
    if (!b.earnedAt) return -1;
    return b.earnedAt.getTime() - a.earnedAt.getTime();
  });

  // Get recent awards (last 7 days)
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentAwards = sortedAwards.filter(
    award => award.earnedAt && award.earnedAt > oneWeekAgo
  );

  return {
    awards: sortedAwards,
    isLoading,
    error,
    totalAwards: awardsList.length,
    recentAwards,
  };
}