import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import WatchNowButton, { StreamingBadges } from "@/components/watch-now-button";
import { 
  Star, 
  Plus, 
  Share, 
  Film,
  Play
} from "lucide-react";

interface ShowCardProps {
  show: any;
  variant?: "default" | "continue";
}

export default function ShowCard({ show, variant = "default" }: ShowCardProps) {
  const { toast } = useToast();

  // Add to watchlist mutation
  const addToWatchlist = useMutation({
    mutationFn: async (data: { tmdbId: number; status: string }) => {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
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
    },
  });

  const getPlatformBadge = (platform?: string) => {
    const platformColors: Record<string, string> = {
      "Netflix": "bg-netflix-red",
      "Disney+": "bg-disney-blue", 
      "Prime Video": "bg-prime-blue",
      "HBO Max": "bg-hbo-purple",
      "Apple TV+": "bg-gray-700",
      "Hulu": "bg-green-600",
    };

    const color = platformColors[platform || ""] || "bg-gray-600";
    return `platform-badge ${color} text-white`;
  };

  const getProgressPercentage = () => {
    if (!show.totalEpisodesWatched || !show.show?.numberOfEpisodes) return 0;
    return Math.round((show.totalEpisodesWatched / show.show.numberOfEpisodes) * 100);
  };

  if (variant === "continue") {
    return (
      <Card className="show-card glass-effect border-white/10 flex-shrink-0 w-80 transition-all duration-300 hover:scale-105 cursor-pointer">
        <CardContent className="p-0">
          <div className="flex">
            <div className="relative">
              {show.show?.posterPath ? (
                <img 
                  src={show.show.posterPath} 
                  alt={`${show.show.title} poster`} 
                  className="w-20 h-28 object-cover"
                />
              ) : (
                <div className="w-20 h-28 bg-binge-gray flex items-center justify-center">
                  <Film className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Play className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="p-4 flex-1">
              <h3 className="font-semibold mb-1 truncate">{show.show?.title || "Unknown Show"}</h3>
              <p className="text-sm text-gray-400 mb-2">
                S{show.currentSeason || 1} E{show.currentEpisode || 1} • Next Episode
              </p>
              <div className="flex items-center space-x-2 mb-3">
                <Badge className={getPlatformBadge("Netflix")}>
                  Netflix
                </Badge>
              </div>
              <div className="space-y-1">
                <Progress value={getProgressPercentage()} className="h-2" />
                <p className="text-xs text-gray-400">{getProgressPercentage()}% complete</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant for trending/discover
  return (
    <Card className="show-card glass-effect border-white/10 flex-shrink-0 w-48 transition-all duration-300 hover:scale-105 cursor-pointer">
      <CardContent className="p-0">
        <div className="relative">
          {show.posterPath ? (
            <img 
              src={show.posterPath} 
              alt={`${show.title} poster`} 
              className="w-full h-72 object-cover rounded-t-lg"
              onClick={() => window.location.href = `/show/${show.tmdbId}`}
            />
          ) : (
            <div 
              className="w-full h-72 bg-binge-gray rounded-t-lg flex items-center justify-center cursor-pointer"
              onClick={() => window.location.href = `/show/${show.tmdbId}`}
            >
              <Film className="w-16 h-16 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-t-lg">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="p-4">
          <h3 
            className="font-semibold mb-2 truncate cursor-pointer hover:text-binge-purple transition-colors" 
            onClick={() => window.location.href = `/show/${show.tmdbId}`}
          >
            {show.title}
          </h3>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm">{show.rating || 'N/A'}</span>
            </div>
            {/* Streaming Platforms */}
            <StreamingBadges 
              platforms={show.streamingPlatforms || []} 
              maxShow={2}
            />
          </div>
          <div className="space-y-2">
            {/* Watch Now Button - Priority placement */}
            <WatchNowButton 
              show={{
                title: show.title,
                tmdbId: show.tmdbId,
                streamingPlatforms: show.streamingPlatforms
              }}
              variant="default"
              size="sm"
              className="w-full bg-gradient-purple hover:opacity-90 text-sm font-medium transition-all"
            />
            
            {/* Secondary Actions */}
            <div className="flex items-center space-x-2">
              <Button 
                size="sm"
                onClick={() => addToWatchlist.mutate({ tmdbId: show.tmdbId, status: 'want_to_watch' })}
                disabled={addToWatchlist.isPending}
                variant="outline"
                className="glass-effect hover:bg-white/10 text-sm font-medium transition-all flex-1"
              >
                <Plus className="w-3 h-3 mr-1" />
                {addToWatchlist.isPending ? 'Adding...' : 'Add'}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="glass-effect hover:bg-white/10 transition-all px-2"
              >
                <Share className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
