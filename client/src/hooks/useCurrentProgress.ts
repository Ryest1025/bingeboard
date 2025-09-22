// useCurrentProgress.ts - Sept 14, 4:30 PM
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export interface ProgressEntry {
  id: string;
  showId: string;
  showTitle: string;
  showImage?: string;
  showType: 'movie' | 'tv';
  currentTime: number;
  totalTime: number;
  lastWatched: string;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  completed: boolean;
  percentage: number;
}

export interface WatchingSession {
  showId: string;
  season?: number;
  episode?: number;
  startTime: number;
  currentTime: number;
  totalTime: number;
  isActive: boolean;
}

interface UseCurrentProgressResult {
  // Progress data
  progressEntries: ProgressEntry[];
  currentlyWatching: ProgressEntry[];
  recentlyWatched: ProgressEntry[];
  
  // Current session
  activeSession: WatchingSession | null;
  isWatching: boolean;
  
  // Loading states
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  startWatching: (showId: string, season?: number, episode?: number, totalTime?: number) => void;
  updateProgress: (currentTime: number) => void;
  pauseWatching: () => void;
  resumeWatching: () => void;
  stopWatching: (completed?: boolean) => void;
  markAsWatched: (showId: string, season?: number, episode?: number) => void;
  removeFromProgress: (progressId: string) => void;
  
  // Utilities
  getShowProgress: (showId: string) => ProgressEntry | null;
  hasWatchedShow: (showId: string) => boolean;
  getContinueWatchingPosition: (showId: string) => number;
}

const PROGRESS_UPDATE_INTERVAL = 10000; // 10 seconds
const MINIMUM_WATCH_TIME = 30; // 30 seconds minimum to save progress

export function useCurrentProgress(): UseCurrentProgressResult {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [activeSession, setActiveSession] = useState<WatchingSession | null>(null);
  const [progressUpdateTimer, setProgressUpdateTimer] = useState<NodeJS.Timeout | null>(null);

  // Fetch user's progress data
  const { 
    data: progressEntries = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/progress', user?.uid],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      
      try {
        const response = await fetch('/api/progress', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch progress');
        }
        
        const data = await response.json();
        return data.map((entry: any) => ({
          ...entry,
          percentage: entry.totalTime > 0 ? Math.round((entry.currentTime / entry.totalTime) * 100) : 0
        }));
      } catch (error) {
        console.error('Failed to fetch progress:', error);
        return [];
      }
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute when watching
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (progressData: {
      showId: string;
      currentTime: number;
      totalTime: number;
      season?: number;
      episode?: number;
      completed?: boolean;
    }) => {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(progressData),
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch progress data
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
    },
  });

  // Mark as watched mutation
  const markAsWatchedMutation = useMutation({
    mutationFn: async (watchData: {
      showId: string;
      season?: number;
      episode?: number;
    }) => {
      const response = await fetch('/api/progress/mark-watched', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(watchData),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as watched');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
    },
  });

  // Remove progress mutation
  const removeProgressMutation = useMutation({
    mutationFn: async (progressId: string) => {
      const response = await fetch(`/api/progress/${progressId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to remove progress');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
    },
  });

  // Start watching session
  const startWatching = (showId: string, season?: number, episode?: number, totalTime: number = 0) => {
    if (!isAuthenticated) return;

    // Clear any existing timer first to avoid duplicates
    if (progressUpdateTimer) {
      clearInterval(progressUpdateTimer);
    }

    const session: WatchingSession = {
      showId,
      season,
      episode,
      startTime: Date.now(),
      currentTime: 0,
      totalTime,
      isActive: true,
    };

    setActiveSession(session);

    // Start progress update timer with accurate time calculation
    const timer = setInterval(() => {
      if (session.isActive) {
        const accurateCurrentTime = Math.floor((Date.now() - session.startTime) / 1000);
        updateProgress(accurateCurrentTime);
      }
    }, PROGRESS_UPDATE_INTERVAL);

    setProgressUpdateTimer(timer);
  };

  // Update current progress
  const updateProgress = (currentTime: number) => {
    if (!activeSession || !isAuthenticated) return;

    // Only save progress if watched for minimum time
    if (currentTime < MINIMUM_WATCH_TIME) return;

    const updatedSession = {
      ...activeSession,
      currentTime,
    };

    setActiveSession(updatedSession);

    // Save to server
    updateProgressMutation.mutate({
      showId: activeSession.showId,
      currentTime,
      totalTime: activeSession.totalTime,
      season: activeSession.season,
      episode: activeSession.episode,
    });
  };

  // Pause watching
  const pauseWatching = () => {
    if (activeSession) {
      setActiveSession({
        ...activeSession,
        isActive: false,
      });
    }

    if (progressUpdateTimer) {
      clearInterval(progressUpdateTimer);
      setProgressUpdateTimer(null);
    }
  };

  // Resume watching
  const resumeWatching = () => {
    if (activeSession) {
      // Clear any existing timer first
      if (progressUpdateTimer) {
        clearInterval(progressUpdateTimer);
      }

      setActiveSession({
        ...activeSession,
        isActive: true,
      });

      // Restart timer with accurate time calculation
      const timer = setInterval(() => {
        if (activeSession.isActive) {
          const accurateCurrentTime = Math.floor((Date.now() - activeSession.startTime) / 1000);
          updateProgress(accurateCurrentTime);
        }
      }, PROGRESS_UPDATE_INTERVAL);

      setProgressUpdateTimer(timer);
    }
  };

  // Stop watching session
  const stopWatching = (completed: boolean = false) => {
    if (!activeSession) return;

    // Final progress update
    const finalProgress = {
      showId: activeSession.showId,
      currentTime: activeSession.currentTime,
      totalTime: activeSession.totalTime,
      season: activeSession.season,
      episode: activeSession.episode,
      completed,
    };

    updateProgressMutation.mutate(finalProgress);

    // Clear session
    setActiveSession(null);

    if (progressUpdateTimer) {
      clearInterval(progressUpdateTimer);
      setProgressUpdateTimer(null);
    }
  };

  // Mark show/episode as watched
  const markAsWatched = (showId: string, season?: number, episode?: number) => {
    if (!isAuthenticated) return;

    markAsWatchedMutation.mutate({
      showId,
      season,
      episode,
    });
  };

  // Remove progress entry
  const removeFromProgress = (progressId: string) => {
    if (!isAuthenticated) return;

    removeProgressMutation.mutate(progressId);
  };

  // Utility functions
  const getShowProgress = (showId: string): ProgressEntry | null => {
    return progressEntries.find((entry: ProgressEntry) => entry.showId === showId) || null;
  };

  const hasWatchedShow = (showId: string): boolean => {
    const progress = getShowProgress(showId);
    return progress ? progress.completed : false;
  };

  const getContinueWatchingPosition = (showId: string): number => {
    const progress = getShowProgress(showId);
    return progress ? progress.currentTime : 0;
  };

  // Filter progress entries
  const currentlyWatching = progressEntries.filter(
    (entry: ProgressEntry) => !entry.completed && entry.percentage > 5 && entry.percentage < 90
  ).sort((a: ProgressEntry, b: ProgressEntry) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime());

  const recentlyWatched = progressEntries.filter(
    (entry: ProgressEntry) => entry.completed || entry.percentage >= 90
  ).sort((a: ProgressEntry, b: ProgressEntry) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime()).slice(0, 10);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressUpdateTimer) {
        clearInterval(progressUpdateTimer);
      }
    };
  }, [progressUpdateTimer]);

  // Auto-save progress when page is closed
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeSession && activeSession.currentTime > MINIMUM_WATCH_TIME) {
        // Use navigator.sendBeacon for reliable data sending during page unload
        if (navigator.sendBeacon) {
          const data = JSON.stringify({
            showId: activeSession.showId,
            currentTime: activeSession.currentTime,
            totalTime: activeSession.totalTime,
            season: activeSession.season,
            episode: activeSession.episode,
          });

          navigator.sendBeacon('/api/progress', data);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeSession]);

  return {
    // Progress data
    progressEntries,
    currentlyWatching,
    recentlyWatched,
    
    // Current session
    activeSession,
    isWatching: activeSession?.isActive || false,
    
    // Loading states
    isLoading,
    error,
    
    // Actions
    startWatching,
    updateProgress,
    pauseWatching,
    resumeWatching,
    stopWatching,
    markAsWatched,
    removeFromProgress,
    
    // Utilities
    getShowProgress,
    hasWatchedShow,
    getContinueWatchingPosition,
  };
}