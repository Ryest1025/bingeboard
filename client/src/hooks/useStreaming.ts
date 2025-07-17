import { useQuery } from '@tanstack/react-query';
import {
  searchStreamingAvailability,
  getStreamingByImdbId,
  UtellyResponse,
  StreamingLocation,
  getUniqueStreamingServices
} from '../services/utellyApi';

/**
 * Hook to search for streaming availability by title
 */
export function useStreamingAvailability(title: string, country = 'us') {
  return useQuery<UtellyResponse>({
    queryKey: ['streaming-availability', title, country],
    queryFn: () => searchStreamingAvailability(title, country),
    enabled: !!title && title.length > 2,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to get streaming availability by IMDB ID
 */
export function useStreamingByImdbId(imdbId: string, country = 'us') {
  return useQuery<UtellyResponse>({
    queryKey: ['streaming-imdb', imdbId, country],
    queryFn: () => getStreamingByImdbId(imdbId, country),
    enabled: !!imdbId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to get unique streaming services from search results
 */
export function useUniqueStreamingServices(title: string, country = 'us') {
  const { data, ...rest } = useStreamingAvailability(title, country);

  const streamingServices = data?.results ? getUniqueStreamingServices(data.results) : [];

  return {
    data: streamingServices,
    ...rest
  };
}
