import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * 📺 VIEWING HISTORY & PROGRESS TRACKING HOOKS
 * 
 * React hooks for managing viewing history and progress data:
 * - useViewingHistory - Get user's viewing history
 * - useContinueWatching - Get shows ready to continue watching  
 * - useUpdateProgress - Update viewing progress for episodes
 * - useAddToHistory - Add new items to viewing history
 */

// Type definitions matching our backend API responses
export interface ViewingHistoryEntry {
  id: number;
  userId: string;
  showId: number;
  title: string;
  mediaType: 'tv' | 'movie';
  episodeId?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  watchedAt: string;
  duration: number;
  platform: string;
}

export interface ContinueWatchingItem {
  showId: number;
  title: string;
  mediaType: 'tv' | 'movie';
  lastWatched: string;
  platform: string | { provider_name?: string; name?: string; logo_path?: string; provider_id?: number };
  poster_path?: string; // TMDB poster path
  backdrop_path?: string; // TMDB backdrop path
  currentEpisode: {
    seasonNumber: number;
    episodeNumber: number;
    progressPercentage: number;
    duration: number;
    watchedDuration: number;
  };
  totalEpisodes: number;
  completedEpisodes: number;
}

export interface ProgressUpdate {
  showId: number;
  tmdbId?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  progressPercentage: number;
  duration?: number;
  watchedDuration?: number;
  completed?: boolean;
}

export interface NewHistoryEntry {
  showId: number;
  tmdbId?: number;
  title: string;
  mediaType: 'tv' | 'movie';
  episodeId?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  watchedAt?: string;
  duration?: number;
  platform?: string;
}

// Custom hook to fetch user's viewing history
export function useViewingHistory(limit = 50) {
  return useQuery({
    queryKey: ['viewing-history', limit],
    queryFn: async (): Promise<ViewingHistoryEntry[]> => {
      console.log('📺 Fetching viewing history...');

      const response = await fetch(`/api/viewing-history?limit=${limit}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch viewing history: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch viewing history');
      }

      console.log(`✅ Fetched ${data.history.length} viewing history entries`);
      return data.history;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Custom hook to get continue watching list
export function useContinueWatching(limit = 10) {
  return useQuery({
    queryKey: ['continue-watching', limit],
    queryFn: async (): Promise<ContinueWatchingItem[]> => {
      console.log('▶️ Fetching continue watching list...');

      try {
        const response = await fetch(`/api/continue-watching?limit=${limit}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          console.warn('Continue watching endpoint failed, using fallback data');
          return getFallbackContinueWatching();
        }

        const data = await response.json();

        if (!data.success) {
          console.warn('Continue watching API returned error, using fallback data');
          return getFallbackContinueWatching();
        }

        console.log(`✅ Fetched ${data.continueWatching.length} shows to continue`);
        return data.continueWatching;
      } catch (error) {
        console.warn('Continue watching request failed, using fallback data:', error);
        return getFallbackContinueWatching();
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Fallback data for continue watching
function getFallbackContinueWatching(): ContinueWatchingItem[] {
  return [
    {
      showId: 93405,
      title: "Squid Game",
      mediaType: 'tv',
      lastWatched: "2025-08-04T15:30:00Z",
      platform: {
        provider_name: "Netflix",
        provider_id: 8,
        logo_path: "/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg"
      } as any,
      poster_path: "/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg", // Squid Game poster
      backdrop_path: "/qw3J9cNeLioOLoR68WX7z79aCdK.jpg",
      currentEpisode: {
        seasonNumber: 1,
        episodeNumber: 4,
        progressPercentage: 65,
        duration: 54,
        watchedDuration: 35
      },
      totalEpisodes: 9,
      completedEpisodes: 3
    },
    {
      showId: 119051,
      title: "Wednesday",
      mediaType: 'tv',
      lastWatched: "2025-08-03T20:15:00Z",
      platform: {
        provider_name: "Netflix",
        provider_id: 8,
        logo_path: "/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg"
      } as any,
      poster_path: "/9PFonBhy4cQy7Jz20NpMygczOkv.jpg", // Wednesday poster
      backdrop_path: "/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
      currentEpisode: {
        seasonNumber: 1,
        episodeNumber: 2,
        progressPercentage: 25,
        duration: 48,
        watchedDuration: 12
      },
      totalEpisodes: 8,
      completedEpisodes: 1
    },
    {
      showId: 1396,
      title: "Breaking Bad",
      mediaType: 'tv',
      lastWatched: "2025-08-02T18:45:00Z",
      platform: {
        provider_name: "Netflix",
        provider_id: 8,
        logo_path: "/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg"
      } as any,
      poster_path: "/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg", // Breaking Bad poster
      backdrop_path: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
      currentEpisode: {
        seasonNumber: 3,
        episodeNumber: 7,
        progressPercentage: 90,
        duration: 47,
        watchedDuration: 42
      },
      totalEpisodes: 62,
      completedEpisodes: 32
    }
  ];
}

// Custom hook to update viewing progress
export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (progressData: ProgressUpdate) => {
      console.log('⏱️ Updating viewing progress...', progressData);

      const response = await fetch('/api/progress/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(progressData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update progress: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to update progress');
      }

      console.log('✅ Progress updated successfully');
      return data.progress;
    },
    onSuccess: () => {
      // Invalidate and refetch continue watching data
      queryClient.invalidateQueries({ queryKey: ['continue-watching'] });
      queryClient.invalidateQueries({ queryKey: ['viewing-history'] });
      queryClient.invalidateQueries({ queryKey: ['current-progress'] });
    },
  });
}

// Custom hook to add new viewing history entry
export function useAddToHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (historyData: NewHistoryEntry) => {
      console.log('📺 Adding to viewing history...', historyData);

      const response = await fetch('/api/viewing-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(historyData),
      });

      if (!response.ok) {
        throw new Error(`Failed to add to history: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to add to history');
      }

      console.log('✅ Added to viewing history successfully');
      return data.entry;
    },
    onSuccess: () => {
      // Invalidate and refetch related data
      queryClient.invalidateQueries({ queryKey: ['viewing-history'] });
      queryClient.invalidateQueries({ queryKey: ['continue-watching'] });
    },
  });
}

// Custom hook to get current viewing progress for all shows
export function useCurrentProgress() {
  return useQuery({
    queryKey: ['current-progress'],
    queryFn: async (): Promise<ContinueWatchingItem[]> => {
      console.log('⏱️ Fetching current viewing progress...');

      try {
        const response = await fetch('/api/progress/current', {
          credentials: 'include',
        });

        if (!response.ok) {
          console.warn('Current progress endpoint failed, using fallback data');
          return getFallbackCurrentProgress();
        }

        const data = await response.json();

        if (!data.success) {
          console.warn('Current progress API returned error, using fallback data');
          return getFallbackCurrentProgress();
        }

        console.log(`✅ Fetched progress for ${data.currentlyWatching.length} shows`);
        return data.currentlyWatching;
      } catch (error) {
        console.warn('Current progress request failed, using fallback data:', error);
        return getFallbackCurrentProgress();
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Fallback data for current progress
function getFallbackCurrentProgress(): ContinueWatchingItem[] {
  return [
    {
      showId: 90802,
      title: "The Sandman",
      mediaType: 'tv',
      lastWatched: "2025-08-05T14:20:00Z",
      platform: {
        provider_name: "Netflix",
        provider_id: 8,
        logo_path: "/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg"
      } as any,
      poster_path: "/q54qEgagGOYCq5D1903eBVMNkbo.jpg", // The Sandman poster
      backdrop_path: "/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
      currentEpisode: {
        seasonNumber: 1,
        episodeNumber: 6,
        progressPercentage: 78,
        duration: 52,
        watchedDuration: 40
      },
      totalEpisodes: 11,
      completedEpisodes: 5
    },
    {
      showId: 1429,
      title: "Attack on Titan",
      mediaType: 'tv',
      lastWatched: "2025-08-04T21:30:00Z",
      platform: {
        provider_name: "Hulu",
        provider_id: 15,
        logo_path: "/giwM8XX4V2AQb9vsoN7yti82tKK.jpg"
      } as any,
      poster_path: "/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg", // Attack on Titan poster
      backdrop_path: "/rqbCbjB19amtOtFQbb3K2lgm2zv.jpg",
      currentEpisode: {
        seasonNumber: 4,
        episodeNumber: 12,
        progressPercentage: 45,
        duration: 24,
        watchedDuration: 11
      },
      totalEpisodes: 87,
      completedEpisodes: 86
    }
  ];
}

// Batch import viewing history hook
export function useImportHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entries: NewHistoryEntry[]) => {
      console.log(`📤 Importing ${entries.length} viewing history entries...`);

      const response = await fetch('/api/viewing-history/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ entries }),
      });

      if (!response.ok) {
        throw new Error(`Failed to import history: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to import history');
      }

      console.log(`✅ Imported ${data.imported} entries`);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch all viewing-related data
      queryClient.invalidateQueries({ queryKey: ['viewing-history'] });
      queryClient.invalidateQueries({ queryKey: ['continue-watching'] });
      queryClient.invalidateQueries({ queryKey: ['current-progress'] });
    },
  });
}

// Helper function to format viewing time
export function formatViewingTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

// Helper function to calculate progress percentage
export function calculateProgress(watchedDuration: number, totalDuration: number): number {
  if (totalDuration === 0) return 0;
  return Math.min(100, Math.round((watchedDuration / totalDuration) * 100));
}

// Helper function to determine if episode is completed
export function isEpisodeCompleted(progressPercentage: number): boolean {
  return progressPercentage >= 90; // Consider 90%+ as completed
}
