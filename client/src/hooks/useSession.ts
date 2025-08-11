// hooks/useSession.ts - Centralized session management with caching
import { useQuery } from '@tanstack/react-query';

interface SessionUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  onboardingCompleted?: boolean;
  preferredGenres?: string[];
  preferredNetworks?: string[];
}

interface SessionData {
  authenticated: boolean;
  user?: SessionUser;
  message?: string;
}

/* ignore-unused-export (shared hook consumed by UI even if pruning heuristic flags) */
export const useSession = () => {
  return useQuery<SessionData>({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await fetch('/api/auth/session');
      if (!res.ok) {
        if (res.status === 401) {
          return { authenticated: false };
        }
        throw new Error(`Session check failed: ${res.status}`);
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in memory for 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 (unauthorized)
      if (error?.status === 401) return false;
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 5000),
  });
};

// Utility hook for just checking authentication status
// Internal helpers (not exported) retained for potential future use
const useIsAuthenticated = () => { const { data } = useSession(); return data?.authenticated ?? false; };
const useCurrentUser = () => { const { data } = useSession(); return data?.user; };
const invalidateSession = (queryClient: any) => { queryClient.invalidateQueries(['session']); };

// No default export – use named import only.
