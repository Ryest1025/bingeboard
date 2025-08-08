import { useQuery } from '@tanstack/react-query';

export interface FilterOption {
  id: string | number;
  name: string;
  value?: string; // Make value optional since API doesn't always provide it
}

export interface FilterOptions {
  genres: FilterOption[];
  platforms: FilterOption[];
  countries: FilterOption[];
  sports: FilterOption[];
}

export interface UseFilterOptionsResult {
  filterOptions: FilterOptions;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch and cache all filter options from API endpoints
 * Provides reusable filter data across Dashboard and Discover pages
 */
export function useFilterOptions(): UseFilterOptionsResult {
  const {
    data: genres,
    isLoading: genresLoading,
    error: genresError,
    refetch: refetchGenres,
  } = useQuery<FilterOption[]>({
    queryKey: ['filters', 'genres'],
    queryFn: async () => {
      const response = await fetch('/api/filters/genres');
      if (!response.ok) {
        throw new Error(`Failed to fetch genres: ${response.statusText}`);
      }
      const data = await response.json();
      // Normalize the data structure - use name as value if value doesn't exist
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        value: item.value || item.name
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (renamed from cacheTime)
  });

  const {
    data: platforms,
    isLoading: platformsLoading,
    error: platformsError,
    refetch: refetchPlatforms,
  } = useQuery<FilterOption[]>({
    queryKey: ['filters', 'platforms'],
    queryFn: async () => {
      const response = await fetch('/api/filters/platforms');
      if (!response.ok) {
        throw new Error(`Failed to fetch platforms: ${response.statusText}`);
      }
      const data = await response.json();
      // Normalize the data structure - use name as value if value doesn't exist
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        value: item.value || item.name
      }));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const {
    data: countries,
    isLoading: countriesLoading,
    error: countriesError,
    refetch: refetchCountries,
  } = useQuery<FilterOption[]>({
    queryKey: ['filters', 'countries'],
    queryFn: async () => {
      const response = await fetch('/api/filters/countries');
      if (!response.ok) {
        throw new Error(`Failed to fetch countries: ${response.statusText}`);
      }
      const data = await response.json();
      // Normalize the data structure - use name as value if value doesn't exist
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        value: item.value || item.name
      }));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const {
    data: sports,
    isLoading: sportsLoading,
    error: sportsError,
    refetch: refetchSports,
  } = useQuery<FilterOption[]>({
    queryKey: ['filters', 'sports'],
    queryFn: async () => {
      const response = await fetch('/api/filters/sports');
      if (!response.ok) {
        throw new Error(`Failed to fetch sports: ${response.statusText}`);
      }
      const data = await response.json();
      // Normalize the data structure - use name as value if value doesn't exist
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        value: item.value || item.name
      }));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const filterOptions: FilterOptions = {
    genres: genres ?? [],
    platforms: platforms ?? [],
    countries: countries ?? [],
    sports: sports ?? [],
  };

  const isLoading = genresLoading || platformsLoading || countriesLoading || sportsLoading;
  const error = genresError || platformsError || countriesError || sportsError;

  const refetch = () => {
    refetchGenres();
    refetchPlatforms();
    refetchCountries();
    refetchSports();
  };

  return {
    filterOptions,
    isLoading,
    error,
    refetch,
  };
}
