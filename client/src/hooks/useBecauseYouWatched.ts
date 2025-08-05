import { useQuery } from "@tanstack/react-query";

export function useBecauseYouWatched() {
  return useQuery({
    queryKey: ["becauseYouWatched"],
    queryFn: async () => {
      const res = await fetch("/api/recommendations/because-you-watched", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return res.json();
    },
  });
}
