// useDashboardFeed.ts - React Query hook for dashboard content with context filters
import { useQuery } from '@tanstack/react-query';
import { useDashboardFilters } from '@/components/dashboard/filters/DashboardFilterProvider';
import { useDebounce } from './useDebounce';

export const useDashboardFeed = () => {
  const filters = useDashboardFilters();

  // Debounce filters to prevent excessive API calls
  const debouncedFilters = useDebounce(filters, 300); // 300ms debounce

  return useQuery({
    queryKey: ['dashboard-feed', debouncedFilters],
    queryFn: async () => {
      // Build query parameters from debounced filters
      const params = new URLSearchParams();

      // Add filter arrays
      debouncedFilters.activePlatforms.forEach(platform =>
        params.append('platforms[]', platform)
      );
      debouncedFilters.preferredGenres.forEach(genre =>
        params.append('genres[]', genre)
      );

      // Add other filters
      if (debouncedFilters.userMood) {
        params.set('mood', debouncedFilters.userMood);
      }
      params.set('friendActivity', debouncedFilters.friendActivity);
      params.set('showPublicLists', debouncedFilters.showPublicLists.toString());
      params.set('showCollaborativeLists', debouncedFilters.showCollaborativeLists.toString());
      params.set('listSortBy', debouncedFilters.listSortBy);
      params.set('watchlistStatus', debouncedFilters.watchlistStatus);

      console.log('🎛️ Dashboard feed query:', params.toString());

      // Try to fetch from API
      try {
        const res = await fetch(`/api/dashboard/feed?${params.toString()}`, {
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          console.log('✅ Dashboard feed data received:', data);
          return data;
        }
      } catch (error) {
        console.warn('⚠️ Dashboard feed API failed, using mock data:', error);
      }

      // Return mock data as fallback
      return {
        items: [
          {
            id: 1,
            title: 'Mock Content 1',
            description: `Filtered by: ${debouncedFilters.friendActivity}, ${debouncedFilters.watchlistStatus}`,
            type: 'recommendation'
          },
          {
            id: 2,
            title: 'Mock Content 2',
            description: `Platforms: ${debouncedFilters.activePlatforms.join(', ') || 'All'}`,
            type: 'friend_activity'
          },
          {
            id: 3,
            title: 'Mock Content 3',
            description: `Genres: ${debouncedFilters.preferredGenres.join(', ') || 'All'}`,
            type: 'custom_list'
          }
        ],
        totalResults: 3,
        appliedFilters: debouncedFilters
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
};
