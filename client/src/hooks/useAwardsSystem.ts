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

export function useAwardsSystem(userId?: string): UseAwardsSystemResult {
  const { data: awards, isLoading, error } = useQuery({
    queryKey: ['awards', userId],
    queryFn: async (): Promise<Award[]> => {
      if (!userId) return [];
      
      try {
        const res = await fetch(`/api/awards?userId=${userId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          console.warn(`Awards API returned ${res.status}`);
          return [];
        }
        
        const data: AwardResponse[] = await res.json();
        
        // Transform API response with proper date parsing
        return data.map((award) => ({
          ...award,
          earnedAt: award.earnedAt ? new Date(award.earnedAt) : undefined,
        }));
      } catch (error) {
        console.error('Error fetching awards:', error);
        return [];
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