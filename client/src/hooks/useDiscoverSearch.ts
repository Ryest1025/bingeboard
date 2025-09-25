import { useQuery } from '@tanstack/react-query';
import { discoverSearch, DiscoverSearchParams, DiscoverResponse } from '../lib/api/discover';

const DISCOVER_KEY = (p: DiscoverSearchParams) => [
  'discover',
  p.mediaType || 'tv',
  p.genres || 'all',
  p.year || 'any',
  p.platform || 'any',
  p.sort || 'popularity.desc',
  p.includeStreaming ? 'streaming' : 'no-streaming',
  p.page || 1
];

export function useDiscoverSearch(params: DiscoverSearchParams) {
  return useQuery<DiscoverResponse>({
    queryKey: DISCOVER_KEY(params),
    queryFn: () => discoverSearch(params),
    staleTime: 1000 * 60 * 2
  });
}
