import { useQuery } from '@tanstack/react-query';

interface Show {
  id: string;
  title: string;
  description: string;
  poster?: string;
}

interface ContinueWatchingItem {
  show: Show;
  progress: number;
  lastWatched: Date;
  episode?: string;
  season?: number;
  episodeNumber?: number;
}

interface ContinueWatchingResponse {
  show: Show;
  progress: number;
  lastWatched: string; // API returns ISO string
  episode?: string;
  season?: number;
  episodeNumber?: number;
}

export function useContinueWatching(userId?: string) {
  return useQuery({
    queryKey: ['continue-watching', userId],
    queryFn: async (): Promise<ContinueWatchingItem[]> => {
      if (!userId) return [];
      
      try {
        const res = await fetch(`/api/continue-watching?userId=${userId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch continue watching: ${res.status} ${res.statusText}`);
        }
        
        const data: ContinueWatchingResponse[] = await res.json();
        
        // Transform API response with proper date parsing and progress calculation
        return data.map((item) => ({
          ...item,
          lastWatched: new Date(item.lastWatched),
          // Ensure progress is a proper percentage (0-100)
          progress: Math.min(Math.max(item.progress || 0, 0), 100),
        }));
      } catch (error) {
        console.error('Error fetching continue watching data:', error);
        // Return empty array instead of throwing to prevent crashes
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Retry failed requests twice
  });
}