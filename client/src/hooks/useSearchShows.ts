// hooks/useSearchShows.ts
import { useQuery } from "@tanstack/react-query";
import useDebouncedValue from "./useDebouncedValue";
import { searchShowsApi, NormalizedShowSummary, ApiResult, unwrapResult } from "@/lib/search-api";

export default function useSearchShows(rawQuery: string) {
  const query = useDebouncedValue(rawQuery, 300);

  return useQuery<NormalizedShowSummary[]>({
    queryKey: ["search-shows", query],
    // Unwrap ApiResult so existing components can still expect an array while we migrate them.
    queryFn: async () => unwrapResult<NormalizedShowSummary[]>(await searchShowsApi(query), []),
    enabled: !!query && query.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (replaces cacheTime)
  });
}
