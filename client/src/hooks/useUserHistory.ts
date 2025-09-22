import { useState, useEffect } from 'react';
import { Show } from '@/lib/utils';

interface UserHistory {
  watchedShows: Show[];
  watchlistedShows: Show[];
  ratedShows: Show[];
}

/**
 * Hook to manage user viewing history
 * TODO: Connect to actual backend API endpoints
 */
export const useUserHistory = () => {
  const [history, setHistory] = useState<UserHistory>({
    watchedShows: [],
    watchlistedShows: [],
    ratedShows: []
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch user history from API
    const fetchUserHistory = async () => {
      try {
        // For now, return empty arrays
        // In the future, call actual API endpoints:
        // const watched = await fetch('/api/user/watched').then(r => r.json());
        // const watchlisted = await fetch('/api/user/watchlist').then(r => r.json());
        // const rated = await fetch('/api/user/ratings').then(r => r.json());
        
        setHistory({
          watchedShows: [],
          watchlistedShows: [],
          ratedShows: []
        });
      } catch (error) {
        console.error('Error fetching user history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserHistory();
  }, []);

  const markAsWatched = (show: Show) => {
    setHistory(prev => ({
      ...prev,
      watchedShows: [...prev.watchedShows, show]
    }));
  };

  const addToWatchlist = (show: Show) => {
    setHistory(prev => ({
      ...prev,
      watchlistedShows: [...prev.watchlistedShows, show]
    }));
  };

  const rateShow = (show: Show, rating: number) => {
    const ratedShow = { ...show, userRating: rating };
    setHistory(prev => ({
      ...prev,
      ratedShows: [...prev.ratedShows.filter(s => s.id !== show.id), ratedShow]
    }));
  };

  return {
    history,
    isLoading,
    markAsWatched,
    addToWatchlist,
    rateShow,
    // Helper getters
    getAllWatchedIds: () => history.watchedShows.map(s => s.id),
    getAllWatchedShows: () => history.watchedShows,
    isWatched: (showId: number) => history.watchedShows.some(s => s.id === showId),
    isWatchlisted: (showId: number) => history.watchlistedShows.some(s => s.id === showId)
  };
};