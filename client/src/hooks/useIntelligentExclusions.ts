/**
 * useIntelligentExclusions Hook
 * 
 * Provides universal exclusion logic for filtering out media 
 * already in the user's watchlist or reminders.
 * 
 * Usage:
 * const { excludeUserShows, excludedIds, isLoading } = useIntelligentExclusions();
 * const filteredShows = excludeUserShows(allShows);
 */

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/utils/api-config';
import { useAuth } from './useAuth';

interface MediaItem {
  id: number | string;
  [key: string]: any;
}

export function useIntelligentExclusions() {
  const { user, isAuthenticated } = useAuth();
  const [excludedIds, setExcludedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's excluded show IDs
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setExcludedIds(new Set());
      setIsLoading(false);
      return;
    }

    const fetchExcludedIds = async () => {
      setIsLoading(true);
      try {
        const [watchlistRes, remindersRes] = await Promise.all([
          apiFetch('/api/user/watchlist').then(r => r.json()).catch(() => ({ items: [] })),
          apiFetch('/api/user/reminders').then(r => r.json()).catch(() => ({ items: [] })),
        ]);

        const allIds = new Set<number>();
        
        // Add watchlist IDs
        (watchlistRes?.items || []).forEach((item: any) => {
          const id = item.showId || item.id || item.tmdbId;
          if (id) allIds.add(Number(id));
        });
        
        // Add reminder IDs  
        (remindersRes?.items || []).forEach((item: any) => {
          const id = item.showId || item.id || item.tmdbId;
          if (id) allIds.add(Number(id));
        });
        
        setExcludedIds(allIds);
      } catch (error) {
        console.error('Error fetching excluded IDs:', error);
        setExcludedIds(new Set());
      } finally {
        setIsLoading(false);
      }
    };

    fetchExcludedIds();
  }, [isAuthenticated, user]);

  // Filter function to exclude user's shows
  const excludeUserShows = useCallback(<T extends MediaItem>(shows: T[]): T[] => {
    if (excludedIds.size === 0) return shows;
    
    return shows.filter(show => {
      const showId = typeof show.id === 'string' ? parseInt(show.id) : show.id;
      return !excludedIds.has(showId);
    });
  }, [excludedIds]);

  // Check if a specific show is excluded
  const isExcluded = useCallback((showId: number | string): boolean => {
    const id = typeof showId === 'string' ? parseInt(showId) : showId;
    return excludedIds.has(id);
  }, [excludedIds]);

  // Refresh excluded IDs (useful after adding/removing from watchlist)
  const refresh = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      const [watchlistRes, remindersRes] = await Promise.all([
        apiFetch('/api/user/watchlist').then(r => r.json()).catch(() => ({ items: [] })),
        apiFetch('/api/user/reminders').then(r => r.json()).catch(() => ({ items: [] })),
      ]);

      const allIds = new Set<number>();
      
      (watchlistRes?.items || []).forEach((item: any) => {
        const id = item.showId || item.id || item.tmdbId;
        if (id) allIds.add(Number(id));
      });
      
      (remindersRes?.items || []).forEach((item: any) => {
        const id = item.showId || item.id || item.tmdbId;
        if (id) allIds.add(Number(id));
      });
      
      setExcludedIds(allIds);
    } catch (error) {
      console.error('Error refreshing excluded IDs:', error);
    }
  }, [isAuthenticated, user]);

  return {
    excludeUserShows,
    isExcluded,
    excludedIds,
    isLoading,
    refresh,
  };
}
