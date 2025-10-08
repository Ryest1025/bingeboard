/**
 * Media Actions Hook
 * Centralized hook for all media interaction functionality
 */

import { useState, useCallback, useEffect } from 'react';
import { userActionsService, type MediaItem } from '../services/userActions';
import { streamingService, type WatchOption } from '../services/streaming';
import { trailerService, type TrailerResult } from '../services/trailer';
import { useAuth } from './useAuth';

export interface UseMediaActionsOptions {
  autoLoadWatchlist?: boolean;
  autoLoadReminders?: boolean;
  cacheResults?: boolean;
}

export interface MediaActionsState {
  watchlist: MediaItem[];
  reminders: any[];
  isLoading: boolean;
  error: string | null;
}

export interface MediaActionHandlers {
  // Watchlist actions
  addToWatchlist: (media: MediaItem) => Promise<boolean>;
  removeFromWatchlist: (mediaId: string, mediaType: string) => Promise<boolean>;
  isInWatchlist: (mediaId: string, mediaType: string) => Promise<boolean>;
  toggleWatchlist: (media: MediaItem) => Promise<boolean>;

  // Streaming actions
  watchNow: (media: MediaItem) => Promise<boolean>;
  getStreamingOptions: (media: MediaItem) => Promise<WatchOption[]>;
  getBestWatchOption: (media: MediaItem) => Promise<WatchOption | null>;

  // Trailer actions
  watchTrailer: (media: MediaItem, inModal?: boolean) => Promise<boolean>;
  getTrailers: (media: MediaItem) => Promise<TrailerResult[]>;
  getBestTrailer: (media: MediaItem) => Promise<TrailerResult | null>;

  // Reminder actions
  setReminder: (media: MediaItem, remindAt?: string, type?: 'release' | 'custom' | 'episode') => Promise<boolean>;
  removeReminder: (mediaId: string, mediaType: string, reminderType: string) => Promise<boolean>;
  hasReminder: (mediaId: string, mediaType: string) => boolean;

  // Data management
  refreshData: () => Promise<void>;
  clearCache: () => void;
}

export function useMediaActions(options: UseMediaActionsOptions = {}): MediaActionsState & MediaActionHandlers {
  const { autoLoadWatchlist = true, autoLoadReminders = true, cacheResults = true } = options;
  const { user } = useAuth();

  // State
  const [state, setState] = useState<MediaActionsState>({
    watchlist: [],
    reminders: [],
    isLoading: false,
    error: null,
  });

  // Cache for performance
  const [cache, setCache] = useState<Map<string, any>>(new Map());

  // Initialize services with user
  useEffect(() => {
    if (user?.id) {
      userActionsService.setUserId(user.id);
    }
  }, [user?.id]);

  // Load initial data
  useEffect(() => {
    if (autoLoadWatchlist || autoLoadReminders) {
      refreshData();
    }
  }, [autoLoadWatchlist, autoLoadReminders, user?.id]);

  // Get from cache or execute function
  const withCache = useCallback(async <T>(
    key: string,
    fn: () => Promise<T>,
    ttlMs: number = 300000 // 5 minutes default
  ): Promise<T> => {
    if (!cacheResults) {
      return await fn();
    }

    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttlMs) {
      return cached.data;
    }

    const data = await fn();
    setCache(prev => new Map(prev).set(key, { data, timestamp: Date.now() }));
    return data;
  }, [cache, cacheResults]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const promises: Promise<any>[] = [];

      if (autoLoadWatchlist) {
        promises.push(userActionsService.getWatchlist());
      }

      if (autoLoadReminders) {
        promises.push(userActionsService.getReminders());
      }

      const results = await Promise.allSettled(promises);
      
      const newState: Partial<MediaActionsState> = { isLoading: false };

      if (autoLoadWatchlist && results[0]?.status === 'fulfilled') {
        newState.watchlist = results[0].value;
      }

      if (autoLoadReminders) {
        const reminderIndex = autoLoadWatchlist ? 1 : 0;
        if (results[reminderIndex]?.status === 'fulfilled') {
          newState.reminders = results[reminderIndex].value;
        }
      }

      setState(prev => ({ ...prev, ...newState }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load data' 
      }));
    }
  }, [autoLoadWatchlist, autoLoadReminders]);

  // Watchlist handlers
  const addToWatchlist = useCallback(async (media: MediaItem): Promise<boolean> => {
    try {
      const success = await userActionsService.addToWatchlist(media);
      if (success && autoLoadWatchlist) {
        const updatedWatchlist = await userActionsService.getWatchlist();
        setState(prev => ({ ...prev, watchlist: updatedWatchlist }));
      }
      return success;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
  }, [autoLoadWatchlist]);

  const removeFromWatchlist = useCallback(async (mediaId: string, mediaType: string): Promise<boolean> => {
    try {
      const success = await userActionsService.removeFromWatchlist(mediaId, mediaType);
      if (success && autoLoadWatchlist) {
        setState(prev => ({
          ...prev,
          watchlist: prev.watchlist.filter(item => !(item.id === mediaId && item.type === mediaType))
        }));
      }
      return success;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
  }, [autoLoadWatchlist]);

  const isInWatchlist = useCallback(async (mediaId: string, mediaType: string): Promise<boolean> => {
    // Check local state first for better performance
    if (autoLoadWatchlist && state.watchlist.length > 0) {
      return state.watchlist.some(item => item.id === mediaId && item.type === mediaType);
    }
    return await userActionsService.isInWatchlist(mediaId, mediaType);
  }, [state.watchlist, autoLoadWatchlist]);

  const toggleWatchlist = useCallback(async (media: MediaItem): Promise<boolean> => {
    const inWatchlist = await isInWatchlist(media.id, media.type);
    
    if (inWatchlist) {
      return await removeFromWatchlist(media.id, media.type);
    } else {
      return await addToWatchlist(media);
    }
  }, [isInWatchlist, removeFromWatchlist, addToWatchlist]);

  // Streaming handlers
  const watchNow = useCallback(async (media: MediaItem): Promise<boolean> => {
    try {
      return await streamingService.launchWatch(media);
    } catch (error) {
      console.error('Error watching now:', error);
      return false;
    }
  }, []);

  const getStreamingOptions = useCallback(async (media: MediaItem): Promise<WatchOption[]> => {
    const cacheKey = `streaming_${media.type}_${media.id}`;
    return await withCache(cacheKey, () => streamingService.getStreamingOptions(media));
  }, [withCache]);

  const getBestWatchOption = useCallback(async (media: MediaItem): Promise<WatchOption | null> => {
    const cacheKey = `best_watch_${media.type}_${media.id}`;
    return await withCache(cacheKey, () => streamingService.getBestWatchOption(media));
  }, [withCache]);

  // Trailer handlers
  const watchTrailer = useCallback(async (media: MediaItem, inModal: boolean = false): Promise<boolean> => {
    try {
      return await trailerService.launchTrailer(media, inModal);
    } catch (error) {
      console.error('Error watching trailer:', error);
      return false;
    }
  }, []);

  const getTrailers = useCallback(async (media: MediaItem): Promise<TrailerResult[]> => {
    const cacheKey = `trailers_${media.type}_${media.id}`;
    return await withCache(cacheKey, () => trailerService.getTrailers(media));
  }, [withCache]);

  const getBestTrailer = useCallback(async (media: MediaItem): Promise<TrailerResult | null> => {
    const cacheKey = `best_trailer_${media.type}_${media.id}`;
    return await withCache(cacheKey, () => trailerService.getBestTrailer(media));
  }, [withCache]);

  // Reminder handlers
  const setReminder = useCallback(async (
    media: MediaItem,
    remindAt?: string,
    type: 'release' | 'custom' | 'episode' = 'release'
  ): Promise<boolean> => {
    try {
      // Default to 1 day before release if no date provided
      let reminderDate = remindAt;
      if (!reminderDate) {
        const releaseDate = media.release_date || media.first_air_date;
        if (releaseDate) {
          const release = new Date(releaseDate);
          release.setDate(release.getDate() - 1); // 1 day before
          reminderDate = release.toISOString();
        } else {
          // Default to 1 week from now for custom reminders
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          reminderDate = nextWeek.toISOString();
        }
      }

      const success = await userActionsService.setReminder(media, reminderDate, type);
      if (success && autoLoadReminders) {
        const updatedReminders = await userActionsService.getReminders();
        setState(prev => ({ ...prev, reminders: updatedReminders }));
      }
      return success;
    } catch (error) {
      console.error('Error setting reminder:', error);
      return false;
    }
  }, [autoLoadReminders]);

  const removeReminder = useCallback(async (
    mediaId: string,
    mediaType: string,
    reminderType: string
  ): Promise<boolean> => {
    try {
      const success = await userActionsService.removeReminder(mediaId, mediaType, reminderType);
      if (success && autoLoadReminders) {
        setState(prev => ({
          ...prev,
          reminders: prev.reminders.filter(
            item => !(item.id === mediaId && item.type === mediaType && item.reminderType === reminderType)
          )
        }));
      }
      return success;
    } catch (error) {
      console.error('Error removing reminder:', error);
      return false;
    }
  }, [autoLoadReminders]);

  const hasReminder = useCallback((mediaId: string, mediaType: string): boolean => {
    if (!autoLoadReminders) return false;
    return state.reminders.some(
      item => item.id === mediaId && item.type === mediaType && item.isActive
    );
  }, [state.reminders, autoLoadReminders]);

  // Utility handlers
  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  return {
    // State
    ...state,

    // Watchlist actions
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,

    // Streaming actions
    watchNow,
    getStreamingOptions,
    getBestWatchOption,

    // Trailer actions
    watchTrailer,
    getTrailers,
    getBestTrailer,

    // Reminder actions
    setReminder,
    removeReminder,
    hasReminder,

    // Data management
    refreshData,
    clearCache,
  };
}

export default useMediaActions;