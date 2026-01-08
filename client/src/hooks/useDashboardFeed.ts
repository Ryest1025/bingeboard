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

      // Fetch from real API
      const res = await fetch(`/api/dashboard/feed?${params.toString()}`, {
        credentials: 'include'
      });

      if (!res.ok) {
        console.warn('⚠️ Dashboard feed API failed:', res.status);
        return { items: [], totalResults: 0, appliedFilters: debouncedFilters };
      }

      const data = await res.json();
      console.log('✅ Dashboard feed data received:', data);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
};
