import { useQuery } from '@tanstack/react-query';
import { BatchStreamingItem, getBatchStreamingApi, ApiResult, isSuccess } from '../lib/search-api';

export interface UseBatchStreamingResult {
  data: Map<number, any> | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseBatchStreamingOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export function useBatchStreaming(items: BatchStreamingItem[], opts: UseBatchStreamingOptions = {}): UseBatchStreamingResult {
  const queryEnabled = (opts.enabled ?? true) && items.length > 0;
  const queryKey = ['batch-streaming', items.map(i => i.tmdbId).sort().join('-')];

  const query = useQuery<Map<number, any>, Error>({
    queryKey,
    enabled: queryEnabled,
    staleTime: opts.staleTime ?? 60_000, // 1 min default
    gcTime: opts.cacheTime, // react-query v5 renamed cacheTime -> gcTime
    queryFn: async () => {
      const result: ApiResult<Map<number, any>> = await getBatchStreamingApi(items);
      if (!isSuccess(result)) throw result.error;
      return result.data;
    }
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: (query.error as Error) || null,
    refetch: () => { query.refetch(); }
  };
}
