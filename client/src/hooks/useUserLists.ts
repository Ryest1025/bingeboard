import { useQuery } from "@tanstack/react-query";

export function useUserLists() {
  return useQuery({
    queryKey: ["userLists"],
    queryFn: async () => {
      const res = await fetch("/api/user/lists", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user lists");
      return res.json();
    },
  });
}
