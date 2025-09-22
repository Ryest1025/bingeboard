import { useState, useEffect, useCallback } from 'react';

export interface WatchlistItem {
  id: string;
  title: string;
  platform: string;
  addedAt: Date;
  type: 'movie' | 'tv' | 'documentary' | 'anime';
}

const WATCHLIST_STORAGE_KEY = 'bingeboard-watchlist';

/**
 * Hook for managing user's watchlist with local storage persistence
 */
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setWatchlist(data.ids || []);
        setWatchlistItems(data.items || []);
      }
    } catch (error) {
      console.error('Error loading watchlist from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify({
          ids: watchlist,
          items: watchlistItems,
          updatedAt: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error saving watchlist to localStorage:', error);
      }
    }
  }, [watchlist, watchlistItems, isLoading]);

  /**
   * Add item to watchlist
   */
  const addToWatchlist = useCallback((item: Omit<WatchlistItem, 'addedAt'>) => {
    if (watchlist.includes(item.id)) {
      return; // Already in watchlist
    }

    const newItem: WatchlistItem = {
      ...item,
      addedAt: new Date()
    };

    setWatchlist(prev => [...prev, item.id]);
    setWatchlistItems(prev => [...prev, newItem]);
  }, [watchlist]);

  /**
   * Remove item from watchlist
   */
  const removeFromWatchlist = useCallback((itemId: string) => {
    setWatchlist(prev => prev.filter(id => id !== itemId));
    setWatchlistItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  /**
   * Toggle item in watchlist
   */
  const toggleWatchlist = useCallback((item: string | Omit<WatchlistItem, 'addedAt'>) => {
    if (typeof item === 'string') {
      // Simple toggle by ID (for existing items)
      if (watchlist.includes(item)) {
        removeFromWatchlist(item);
      } else {
        console.warn('Cannot add item to watchlist: item details required');
      }
    } else {
      // Toggle with full item details
      if (watchlist.includes(item.id)) {
        removeFromWatchlist(item.id);
      } else {
        addToWatchlist(item);
      }
    }
  }, [watchlist, addToWatchlist, removeFromWatchlist]);

  /**
   * Check if item is in watchlist
   */
  const isInWatchlist = useCallback((itemId: string): boolean => {
    return watchlist.includes(itemId);
  }, [watchlist]);

  /**
   * Clear entire watchlist
   */
  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
    setWatchlistItems([]);
  }, []);

  /**
   * Get watchlist statistics
   */
  const getWatchlistStats = useCallback(() => {
    const typeCount = watchlistItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const platformCount = watchlistItems.reduce((acc, item) => {
      acc[item.platform] = (acc[item.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: watchlist.length,
      byType: typeCount,
      byPlatform: platformCount,
      recentlyAdded: watchlistItems
        .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
        .slice(0, 5)
    };
  }, [watchlist.length, watchlistItems]);

  /**
   * Export watchlist data
   */
  const exportWatchlist = useCallback(() => {
    return {
      ids: watchlist,
      items: watchlistItems,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }, [watchlist, watchlistItems]);

  /**
   * Import watchlist data
   */
  const importWatchlist = useCallback((data: any) => {
    try {
      if (data.ids && Array.isArray(data.ids) && data.items && Array.isArray(data.items)) {
        setWatchlist(data.ids);
        setWatchlistItems(data.items.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        })));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing watchlist:', error);
      return false;
    }
  }, []);

  return {
    // State
    watchlist,
    watchlistItems,
    isLoading,
    
    // Actions
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    clearWatchlist,
    
    // Utilities
    isInWatchlist,
    getWatchlistStats,
    exportWatchlist,
    importWatchlist,
  };
}

export default useWatchlist;