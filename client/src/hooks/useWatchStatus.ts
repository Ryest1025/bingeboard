// hooks/useWatchStatus.ts - Hook for managing watch status and progress
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type WatchStatus = 'watching' | 'completed' | 'paused' | 'dropped' | 'plan_to_watch';

interface WatchStatusData {
  showId: number;
  status: WatchStatus;
  currentEpisode?: number;
  currentSeason?: number;
  progressPercent?: number;
  lastWatched?: string;
  rating?: number;
}

interface UseWatchStatusReturn {
  updateWatchStatus: (data: WatchStatusData) => void;
  markAsCompleted: (showId: number) => void;
  markAsWatching: (showId: number, episode?: number, season?: number) => void;
  removeFromContinueWatching: (showId: number) => void;
  updateProgress: (showId: number, progressPercent: number, episodeNumber?: number) => void;
  isLoading: boolean;
  error: Error | null;
}

export function useWatchStatus(): UseWatchStatusReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  // Mock API function - replace with real API call
  const updateWatchStatusAPI = async (data: WatchStatusData) => {
    // For now, just log and simulate API call
    console.log('📝 Updating watch status:', data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // TODO: Replace with actual API call
    // const response = await fetch('/api/viewing-history/update', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Failed to update watch status');
    // }
    // 
    // return response.json();
    
    return { success: true, data };
  };

  const mutation = useMutation({
    mutationFn: updateWatchStatusAPI,
    onSuccess: () => {
      // Invalidate and refetch continue watching data
      queryClient.invalidateQueries({ queryKey: ['continue-watching'] });
      queryClient.invalidateQueries({ queryKey: ['viewing-history'] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error);
      console.error('Failed to update watch status:', error);
    },
  });

  const updateWatchStatus = useCallback((data: WatchStatusData) => {
    mutation.mutate(data);
  }, [mutation]);

  const markAsCompleted = useCallback((showId: number) => {
    updateWatchStatus({
      showId,
      status: 'completed',
      progressPercent: 100,
      lastWatched: new Date().toISOString(),
    });
  }, [updateWatchStatus]);

  const markAsWatching = useCallback((showId: number, episode?: number, season?: number) => {
    updateWatchStatus({
      showId,
      status: 'watching',
      currentEpisode: episode,
      currentSeason: season,
      lastWatched: new Date().toISOString(),
    });
  }, [updateWatchStatus]);

  const removeFromContinueWatching = useCallback((showId: number) => {
    updateWatchStatus({
      showId,
      status: 'paused',
      lastWatched: new Date().toISOString(),
    });
  }, [updateWatchStatus]);

  const updateProgress = useCallback((
    showId: number, 
    progressPercent: number, 
    episodeNumber?: number
  ) => {
    updateWatchStatus({
      showId,
      status: 'watching',
      progressPercent: Math.max(0, Math.min(100, progressPercent)),
      currentEpisode: episodeNumber,
      lastWatched: new Date().toISOString(),
    });
  }, [updateWatchStatus]);

  return {
    updateWatchStatus,
    markAsCompleted,
    markAsWatching,
    removeFromContinueWatching,
    updateProgress,
    isLoading: mutation.isPending,
    error: mutation.error || error,
  };
}

// Utility function to get watch status color
export function getWatchStatusColor(status: WatchStatus): string {
  switch (status) {
    case 'watching':
      return 'bg-blue-600';
    case 'completed':
      return 'bg-green-600';
    case 'paused':
      return 'bg-yellow-600';
    case 'dropped':
      return 'bg-red-600';
    case 'plan_to_watch':
      return 'bg-purple-600';
    default:
      return 'bg-gray-600';
  }
}

// Utility function to get watch status label
export function getWatchStatusLabel(status: WatchStatus): string {
  switch (status) {
    case 'watching':
      return 'Watching';
    case 'completed':
      return 'Completed';
    case 'paused':
      return 'Paused';
    case 'dropped':
      return 'Dropped';
    case 'plan_to_watch':
      return 'Plan to Watch';
    default:
      return 'Unknown';
  }
}