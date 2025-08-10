// hooks/useShowDetails.ts
import { useQuery } from "@tanstack/react-query";
import { fetchShowDetailsApi, ShowDetails, ApiResult, unwrapOrUndefined } from "@/lib/search-api";

export default function useShowDetails(id: string | null, type: string = 'movie') {
  return useQuery<ShowDetails | undefined>({
    queryKey: ["show-details", id, type],
    queryFn: async () => unwrapOrUndefined<ShowDetails>(await fetchShowDetailsApi(id!, type as any)),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}
