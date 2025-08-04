import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface UseRecommendationActionsOptions {
  onSuccess?: (action: string) => void;
  onError?: (error: Error, action: string) => void;
}

export function useRecommendationActions(options: UseRecommendationActionsOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: async (data: { tmdbId: number; status?: string }) => {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...data, status: data.status || 'want_to_watch' }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('401: Unauthorized');
        }
        throw new Error('Failed to add to watchlist');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      toast({
        title: "Success",
        description: "Added to your watchlist!",
      });
      options.onSuccess?.('addToWatchlist');
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add to watchlist",
        variant: "destructive",
      });
      options.onError?.(error as Error, 'addToWatchlist');
    },
  });

  // Mark as seen mutation
  const markAsSeenMutation = useMutation({
    mutationFn: async (data: { tmdbId: number }) => {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...data, status: 'watched' }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('401: Unauthorized');
        }
        throw new Error('Failed to mark as seen');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      toast({
        title: "Success",
        description: "Marked as seen!",
      });
      options.onSuccess?.('markAsSeen');
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to mark as seen",
        variant: "destructive",
      });
      options.onError?.(error as Error, 'markAsSeen');
    },
  });

  // Share action (can be extended later for actual sharing API)
  const handleShare = async (tmdbId: number) => {
    try {
      const url = `${window.location.origin}/show/${tmdbId}`;
      if (navigator.share) {
        await navigator.share({
          title: "Check out this show!",
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Success",
          description: "Link copied to clipboard!",
        });
      }
      options.onSuccess?.('share');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share",
        variant: "destructive",
      });
      options.onError?.(error as Error, 'share');
    }
  };

  // Play trailer action
  const handlePlayTrailer = (trailerUrl: string) => {
    try {
      window.open(trailerUrl, '_blank');
      options.onSuccess?.('playTrailer');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open trailer",
        variant: "destructive",
      });
      options.onError?.(error as Error, 'playTrailer');
    }
  };

  return {
    addToWatchlist: (tmdbId: number) => addToWatchlistMutation.mutate({ tmdbId }),
    markAsSeen: (tmdbId: number) => markAsSeenMutation.mutate({ tmdbId }),
    share: handleShare,
    playTrailer: handlePlayTrailer,
    isLoading: {
      addToWatchlist: addToWatchlistMutation.isPending,
      markAsSeen: markAsSeenMutation.isPending,
    }
  };
}
