import { useQuery } from '@tanstack/react-query';
import { fetchUpcomingContent, UpcomingParams, UpcomingResponse } from '../lib/api/upcoming';

const UPCOMING_KEY = (params: UpcomingParams) => [
  'upcoming',
  params.days || 90,
  params.mediaType || 'all',
  params.limit || 40
];

export function useUpcomingContent(params: UpcomingParams = {}) {
  return useQuery<UpcomingResponse>({
    queryKey: UPCOMING_KEY(params),
    queryFn: () => fetchUpcomingContent(params),
    staleTime: 1000 * 60 * 5
  });
}
