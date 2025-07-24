import { useQuery } from '@tanstack/react-query';
import { addStreamingDataBatch } from '@/lib/realStreamingData';

export function useStreamingEnrichedContent(items: any[], enabled: boolean = true) {
  return useQuery({
    queryKey: ['streaming-enriched-content', items.map(item => item.id).join(',')],
    queryFn: async () => {
      if (!items || items.length === 0) return [];
      return await addStreamingDataBatch(items);
    },
    enabled: enabled && items && items.length > 0,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}
