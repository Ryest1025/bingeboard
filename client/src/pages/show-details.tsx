import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import AppLayout from "@/components/layouts/AppLayout";
import WatchNowButton, { StreamingBadges } from "@/components/watch-now-button";
import SocialShareButtons from "@/components/social-share-buttons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Plus, 
  Star, 
  Calendar, 
  Film, 
  Users, 
  Share, 
  ArrowLeft 
} from "lucide-react";

// Minimal shape for show details (all optional for resilience to partial payloads)
interface StreamingPlatformInfo { id?: number | string; logoPath?: string; name?: string }
interface ShowInfo {
  title?: string;
  overview?: string;
  rating?: number | string;
  firstAirDate?: string;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  status?: string;
  backdropPath?: string;
  posterPath?: string;
  tmdbId?: number;
  genres?: string[];
  streamingPlatforms?: StreamingPlatformInfo[];
}

export default function ShowDetails() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  // Fetch show details
  const { data: show, isLoading: showLoading } = useQuery<ShowInfo | null>({
    queryKey: [`/api/shows/${id}`],
    enabled: !!id,
  });

  // Add to watchlist mutation
  const addToWatchlist = useMutation({
    mutationFn: async (data: { tmdbId?: number; status: string }) => {
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
          window.location.href = "/login";
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

  if (showLoading) {
    return (
      <AppLayout>
        <div className="pt-4">
          <div className="h-96 md:h-[500px] relative">
            <Skeleton className="w-full h-full" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-8 w-64 mb-4" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-3/4 mb-6" />
                <div className="flex space-x-4 mb-6">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
              <div className="lg:col-span-1">
                <Skeleton className="w-full h-96" />
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!show) {
    return (
      <AppLayout>
        <div className="pt-4 flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Show Not Found</h1>
            <p className="text-gray-400 mb-6">The show you're looking for doesn't exist.</p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 w-4 h-4" />
              Go Back
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="pt-4 min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="h-96 md:h-[500px] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-binge-dark via-transparent to-binge-dark z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-binge-dark via-transparent to-transparent z-10"></div>
            
      {show?.backdropPath ? (
              <img 
        src={show.backdropPath} 
        alt={`${show.title || 'Show'} backdrop`} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-binge-gray flex items-center justify-center">
                <Film className="w-16 h-16 text-gray-400" />
              </div>
            )}
            
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-3xl">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    {show?.title}
                  </h1>
                  <p className="text-lg md:text-xl text-gray-300 mb-6 leading-relaxed">
                    {show?.overview || "No description available."}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mb-8">
                    {show?.rating && (
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-semibold">{show.rating}</span>
                      </div>
                    )}
                    {show?.firstAirDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-400">{new Date(show.firstAirDate).getFullYear()}</span>
                      </div>
                    )}
                    {show?.numberOfSeasons && (
                      <div className="flex items-center space-x-2">
                        <Film className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-400">{show.numberOfSeasons} Season{show.numberOfSeasons !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {show?.status && (
                      <Badge variant="outline" className="text-binge-green border-binge-green">
                        {show.status}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Streaming Platforms */}
                  {show?.streamingPlatforms && show.streamingPlatforms.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-3">Available On</h4>
                      <div className="flex flex-wrap gap-3">
                        {show.streamingPlatforms.map((platform: StreamingPlatformInfo) => (
                          <div 
                            key={String(platform.id)}
                            className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur"
                          >
                            <img
                              src={platform.logoPath || ''}
                              alt={platform.name || 'Platform'}
                              className="w-6 h-6 rounded"
                            />
                            <span className="text-sm font-medium">{platform.name || 'Unknown'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-3">
                    {/* Watch Now Button - Priority placement */}
                    <WatchNowButton 
                      show={{
                        title: show?.title || 'Untitled',
                        tmdbId: show?.tmdbId,
                        // Normalize to expected shape (provider_id, provider_name, logo_path)
                        streamingPlatforms: (show?.streamingPlatforms || []).map(p => ({
                          provider_id: p.id ?? p.name ?? 'unknown',
                          provider_name: p.name ?? 'Unknown',
                          logo_path: p.logoPath || ''
                        })) as any
                      }}
                      variant="default"
                      size="lg"
                      className="bg-gradient-purple hover:opacity-90 px-6 py-3 rounded-lg font-semibold"
                    />
                    
                    <Button 
                      onClick={() => addToWatchlist.mutate({ tmdbId: show?.tmdbId, status: 'want_to_watch' })}
                      disabled={addToWatchlist.isPending}
                      variant="outline"
                      className="glass-effect hover:bg-white/10 px-6 py-3 rounded-lg font-semibold"
                    >
                      <Plus className="mr-2 w-4 h-4" />
                      {addToWatchlist.isPending ? 'Adding...' : 'Add to Watchlist'}
                    </Button>
                    
                    <Button variant="outline" className="glass-effect hover:bg-white/10 px-6 py-3 rounded-lg font-semibold">
                      <Play className="mr-2 w-4 h-4" />
                      Watch Trailer
                    </Button>
                    <SocialShareButtons
                      title={show.title || 'Untitled'}
                      description={show.overview || "Check out this show on BingeBoard!"}
                      type="show"
                      compact={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2">
              
              {/* Genres */}
              {show?.genres && show.genres.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Genres</h2>
                  <div className="flex flex-wrap gap-3">
                    {show.genres.map((genre: string, index: number) => (
                      <Badge key={index} variant="secondary" className="glass-effect">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Show Details */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {show?.firstAirDate && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">First Air Date</div>
                      <div className="font-medium">{new Date(show.firstAirDate).toLocaleDateString()}</div>
                    </div>
                  )}
                  {show?.numberOfSeasons && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Number of Seasons</div>
                      <div className="font-medium">{show.numberOfSeasons}</div>
                    </div>
                  )}
                  {show?.numberOfEpisodes && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Total Episodes</div>
                      <div className="font-medium">{show.numberOfEpisodes}</div>
                    </div>
                  )}
                  {show?.status && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Status</div>
                      <div className="font-medium">{show.status}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Activity */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">What Friends Are Saying</h2>
                <Card className="glass-effect border-white/10">
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-400">No friend activity for this show yet</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              
              {/* Poster */}
              <Card className="glass-effect border-white/10 mb-6">
                <CardContent className="p-0">
                  {show?.posterPath ? (
                    <img 
                      src={show.posterPath} 
                      alt={`${show.title} poster`} 
                      className="w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-full h-96 bg-binge-gray rounded-lg flex items-center justify-center">
                      <Film className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="glass-effect border-white/10 mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rating</span>
                      <span className="font-medium">{show?.rating || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Year</span>
                      <span className="font-medium">
                        {show?.firstAirDate ? new Date(show.firstAirDate).getFullYear() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Seasons</span>
                      <span className="font-medium">{show?.numberOfSeasons || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Episodes</span>
                      <span className="font-medium">{show?.numberOfEpisodes || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Streaming Platforms */}
              <Card className="glass-effect border-white/10">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Where to Watch</h3>
                  <div className="text-center text-gray-400 py-4">
                    <p className="text-sm">Streaming information not available</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
