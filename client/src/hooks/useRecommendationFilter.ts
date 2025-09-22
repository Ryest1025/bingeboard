import { useMemo } from 'react';
import { Show } from '@/lib/utils';
import { getRecommendedShows, NormalizedShow } from '@/lib/recommendationUtils';

interface UseRecommendationFilterOptions {
  includeNonStreaming?: boolean;
  maxResults?: number;
  sortBy?: 'awards' | 'streaming' | 'recent' | 'personalized';
}

/**
 * Custom hook to get filtered and sorted recommended shows from existing data
 */
export const useRecommendationFilter = (
  allShows: Show[],
  options?: UseRecommendationFilterOptions
): NormalizedShow[] => {
  return useMemo(() => {
    if (!allShows || allShows.length === 0) return [];
    
    return getRecommendedShows(allShows, options);
  }, [allShows, options]);
};

/**
 * Hook specifically for dashboard recommendations
 */
export const useDashboardRecommendations = (allShows: Show[]): {
  awardWinners: NormalizedShow[];
  highlyAvailable: NormalizedShow[];
  recent: NormalizedShow[];
  all: NormalizedShow[];
} => {
  return useMemo(() => {
    if (!allShows || allShows.length === 0) {
      return {
        awardWinners: [],
        highlyAvailable: [],
        recent: [],
        all: []
      };
    }

    const all = getRecommendedShows(allShows, { maxResults: 50 });
    
    return {
      awardWinners: all.filter(show => 
        show.awards && (show.awards.wins || 0) > 0
      ).slice(0, 10),
      
      highlyAvailable: all.filter(show => 
        show.streaming && show.streaming.length >= 3
      ).slice(0, 15),
      
      recent: all.filter(show => {
        const releaseDate = show.release_date || show.first_air_date;
        if (!releaseDate) return false;
        const date = new Date(releaseDate);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return date > oneYearAgo;
      }).slice(0, 12),
      
      all: all.slice(0, 20)
    };
  }, [allShows]);
};