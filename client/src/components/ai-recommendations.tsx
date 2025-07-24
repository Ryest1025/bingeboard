import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Brain, 
  ThumbsUp, 
  ThumbsDown, 
  X, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Zap,
  Eye,
  Heart,
  Star,
  Plus,
  Play,
  ExternalLink,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ListSelectorModal } from "@/components/list-selector-modal";
import StreamingLogos from "@/components/streaming-logos";

interface AiRecommendation {
  id: number;
  showId: number;
  score: number;
  reason: string;
  recommendationType: string;
  metadata: string;
  isViewed: boolean;
  isInteracted: boolean;
  feedback: string | null;
  createdAt: string;
  show: {
    tmdbId: number;
    title: string;
    overview: string;
    posterPath: string;
    backdropPath: string;
    rating: string;
    genres: string[];
    networks: string[];
    firstAirDate: string;
    status: string;
    mediaType: string;
    streamingAvailable?: boolean;
    streamingServices?: string[];
    whereToWatch?: string;
    streamingPlatforms?: Array<{
      provider_id: number;
      provider_name: string;
      logo_path?: string;
    }>;
    hasTrailer?: boolean;
    trailerKey?: string;
    trailerUrl?: string;
  };
}

const getRecommendationTypeIcon = (type: string) => {
  switch (type) {
    case "collaborative":
      return <Users className="h-4 w-4" />;
    case "content_based":
      return <Brain className="h-4 w-4" />;
    case "trending":
      return <TrendingUp className="h-4 w-4" />;
    case "similar_users":
      return <Heart className="h-4 w-4" />;
    default:
      return <Sparkles className="h-4 w-4" />;
  }
};

const getRecommendationTypeLabel = (type: string) => {
  switch (type) {
    case "collaborative":
      return "People Also Watched";
    case "content_based":
      return "Similar Content";
    case "trending":
      return "Trending Now";
    case "similar_users":
      return "Similar Tastes";
    default:
      return "AI Recommended";
  }
};

const getRecommendationTypeColor = (type: string) => {
  switch (type) {
    case "collaborative":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "content_based":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "trending":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "similar_users":
      return "bg-pink-500/10 text-pink-500 border-pink-500/20";
    default:
      return "bg-green-500/10 text-green-500 border-green-500/20";
  }
};

export function AiRecommendations({ compact = false, horizontal = false }: { compact?: boolean; horizontal?: boolean }) {
  const [selectedTab, setSelectedTab] = useState("all");
  const [listSelectorOpen, setListSelectorOpen] = useState(false);
  const [showToAddToList, setShowToAddToList] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // EMERGENCY LOGOUT FUNCTION - TEMPORARY
  const emergencyLogout = async () => {
    try {
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Call server logout
      await fetch('/api/logout', { method: 'GET', credentials: 'include' });
      
      // Force navigation to landing
      window.location.href = '/landing';
    } catch (error) {
      console.error('Emergency logout error:', error);
      // Force navigation anyway
      window.location.href = '/landing';
    }
  };

  // Fetch AI recommendations with error handling
  const { 
    data: apiResponse, 
    isLoading, 
    refetch,
    error 
  } = useQuery({
    queryKey: ["/api/ai-recommendations"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/ai-recommendations");
      const data = await response.json();
      console.log("🤖 AI Recommendations API Response:", data);
      return data;
    },
    retry: false,
  });

  // Generate new recommendations
  const generateMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/ai-recommendations/generate"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-recommendations"] });
      toast({
        title: "New Recommendations Generated",
        description: "Fresh AI recommendations based on your latest viewing activity.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Unable to generate new recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mark recommendation as viewed
  const markViewedMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/ai-recommendations/${id}/viewed`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-recommendations"] });
    },
  });

  // Provide feedback on recommendation
  const feedbackMutation = useMutation({
    mutationFn: ({ id, feedback }: { id: number; feedback: string }) =>
      apiRequest("POST", `/api/ai-recommendations/${id}/feedback`, { feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-recommendations"] });
      toast({
        title: "Feedback Recorded",
        description: "Your feedback helps improve future recommendations.",
      });
    },
  });

  // Dismiss recommendation
  const dismissMutation = useMutation({
    mutationFn: ({ id, feedback }: { id: number; feedback: string }) =>
      apiRequest("POST", `/api/ai-recommendations/${id}/feedback`, { feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-recommendations"] });
    },
  });

  // Extract recommendations from the API response
  const recommendations = Array.isArray(apiResponse?.recommendations) ? apiResponse.recommendations : [];
  const hasPreferences = apiResponse?.hasPreferences || false;
  const onboardingCompleted = apiResponse?.onboardingCompleted || false;
  const message = apiResponse?.message || "";

  console.log("🤖 AI Recommendations State:", {
    isLoading,
    error: !!error,
    recommendationsCount: recommendations.length,
    hasPreferences,
    onboardingCompleted,
    message
  });

  // Handle errors gracefully
  if (error) {
    console.error("AI Recommendations error:", error);
    return (
      <Card className="glass-effect border-slate-700/50">
        <CardContent className="p-6">
          <div className="text-center text-slate-400">
            <Brain className="h-12 w-12 mx-auto mb-4 text-slate-500" />
            <p>Unable to load AI recommendations</p>
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleAddToList = (show: any) => {
    setShowToAddToList(show);
    setListSelectorOpen(true);
  };

  const handleShowView = (recommendationId: number) => {
    if (!markViewedMutation.isPending) {
      markViewedMutation.mutate(recommendationId);
    }
  };

  const handleFeedback = (id: number, feedback: string) => {
    feedbackMutation.mutate({ id, feedback });
  };

  const handleDismiss = (id: number) => {
    dismissMutation.mutate({ id, feedback: "not_interested" });
  };

  // Handle trailer viewing with ads (monetization)
  const handleWatchTrailer = async (recommendation: AiRecommendation) => {
    const { show } = recommendation;
    
    if (!show.hasTrailer || !show.trailerKey) {
      toast({
        title: "No Trailer Available",
        description: "Sorry, no trailer is available for this content.",
        variant: "destructive",
      });
      return;
    }

    // Show monetization message
    toast({
      title: "🎬 Loading Trailer...",
      description: "Please wait while we load your trailer with a brief sponsor message.",
    });

    // Simulate ad viewing for monetization (3 seconds)
    setTimeout(async () => {
      // Track monetization
      try {
        await apiRequest("POST", "/api/monetization/trailer-view", {
          recommendationId: recommendation.id,
          showId: show.tmdbId,
          showTitle: show.title,
          trailerKey: show.trailerKey,
          adDuration: 3000
        });
      } catch (error) {
        console.warn("Failed to track trailer monetization:", error);
      }

      // Open trailer in new tab after "ad"
      window.open(show.trailerUrl, '_blank');
      
      // Mark as viewed for analytics
      handleShowView(recommendation.id);
      
      toast({
        title: "Enjoy the Trailer!",
        description: "Thanks for supporting BingeBoard! Ad revenue helps keep our service free.",
      });
    }, 3000);
  };

  // Handle watch button - direct to streaming platform
  const handleWatchNow = async (recommendation: AiRecommendation) => {
    const { show } = recommendation;
    
    if (!show.streamingAvailable || !show.streamingPlatforms?.length) {
      toast({
        title: "Not Available",
        description: "This content is not currently available on major streaming platforms.",
        variant: "destructive",
      });
      return;
    }

    // For now, open a search on the primary platform
    const primaryPlatform = show.streamingPlatforms[0];
    let searchUrl = "";
    
    switch (primaryPlatform.provider_name) {
      case 'Netflix':
        searchUrl = `https://www.netflix.com/search?q=${encodeURIComponent(show.title)}`;
        break;
      case 'Disney Plus':
        searchUrl = `https://www.disneyplus.com/search?q=${encodeURIComponent(show.title)}`;
        break;
      case 'Amazon Prime Video':
        searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(show.title)}&i=prime-instant-video`;
        break;
      case 'HBO Max':
      case 'Max':
        searchUrl = `https://www.max.com/search?q=${encodeURIComponent(show.title)}`;
        break;
      case 'Hulu':
        searchUrl = `https://www.hulu.com/search?q=${encodeURIComponent(show.title)}`;
        break;
      default:
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(show.title + ' watch online')}`;
    }

    // Track monetization
    try {
      await apiRequest("POST", "/api/monetization/platform-redirect", {
        recommendationId: recommendation.id,
        showId: show.tmdbId,
        showTitle: show.title,
        platform: primaryPlatform.provider_name,
        affiliateLink: null // Could be used for actual affiliate links
      });
    } catch (error) {
      console.warn("Failed to track platform redirect monetization:", error);
    }

    window.open(searchUrl, '_blank');
    
    // Mark as viewed for analytics
    handleShowView(recommendation.id);
    
    toast({
      title: "Redirecting to Streaming Platform",
      description: `Opening ${primaryPlatform.provider_name} to watch ${show.title}`,
    });
  };

  // Remove the duplicate safeRecommendations since we already have recommendations as an array

  // Filter recommendations by type
  const filteredRecommendations = recommendations.filter((rec: AiRecommendation) => {
    if (selectedTab === "all") return true;
    return rec.recommendationType === selectedTab;
  });

  // Group recommendations by type for stats
  const recommendationsByType = recommendations.reduce((acc: Record<string, number>, rec: AiRecommendation) => {
    acc[rec.recommendationType] = (acc[rec.recommendationType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Brain className="h-5 w-5 animate-pulse" />
            Loading AI recommendations...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-6"}>
      <Card className={compact ? "border-none shadow-none bg-transparent" : ""}>
        {!compact && (
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Recommendations
                {recommendations.length > 0 && (
                  <Badge variant="secondary">{recommendations.length} suggestions</Badge>
                )}
              </CardTitle>
              <div className="flex gap-2 flex-shrink-0">
                {/* EMERGENCY LOGOUT BUTTON - TEMPORARY */}
                <Button
                  onClick={emergencyLogout}
                  size="sm"
                  variant="destructive"
                  className="whitespace-nowrap"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Emergency Logout
                </Button>
                <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                size="sm"
                className="whitespace-nowrap"
              >
                {generateMutation.isPending ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate New
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        )}
        
        {recommendations.length === 0 ? (
          <CardContent className={compact ? "text-center py-6" : "text-center py-12"}>
            <div className="space-y-4">
              <Brain className={compact ? "h-8 w-8 mx-auto text-muted-foreground" : "h-12 w-12 mx-auto text-muted-foreground"} />
              <div>
                <h3 className={compact ? "text-base font-medium" : "text-lg font-medium"}>No recommendations yet</h3>
                <p className={compact ? "text-sm text-muted-foreground" : "text-muted-foreground"}>
                  {compact ? "Add shows to get AI recommendations" : "Add some shows to your watchlist to get personalized AI recommendations or use the \"Generate New\" button above."}
                </p>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent className={compact ? "p-3" : ""}>
            {horizontal ? (
              // Horizontal Scrolling Layout
              <div className="space-y-3">
                
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-4 pb-4">
                    {recommendations.map((recommendation: AiRecommendation) => (
                      <Card key={recommendation.id} className="flex-shrink-0 w-48 group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-card to-muted/10 relative overflow-hidden">
                        {!recommendation.isViewed && (
                          <div className="absolute top-3 right-3 z-10">
                            <Badge variant="destructive" className="text-xs shadow-lg">
                              ✨ New
                            </Badge>
                          </div>
                        )}
                        
                        <CardContent className="p-3">
                          <div className="space-y-3">
                            {/* Poster Image */}
                            <div className="relative">
                              <div 
                                className="cursor-pointer"
                                onClick={() => handleShowView(recommendation.id)}
                              >
                                <img
                                  src={recommendation.show.posterPath 
                                    ? `https://image.tmdb.org/t/p/w200${recommendation.show.posterPath}`
                                    : "/placeholder-poster.jpg"
                                  }
                                  alt={recommendation.show.title}
                                  className="w-full h-44 object-cover rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                                />
                              </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                              {/* Title and Score */}
                              <div className="space-y-1">
                                <h3 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                  {recommendation.show.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded-full">
                                    <Star className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs font-bold text-primary">
                                      {recommendation.show.rating || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Genres */}
                              <div className="flex flex-wrap gap-1">
                                {recommendation.show.genres?.slice(0, 1).map((genre: string) => (
                                  <Badge key={genre} variant="outline" className="text-xs px-1.5 py-0 text-gray-400 border-gray-600">
                                    {genre}
                                  </Badge>
                                ))}
                              </div>

                              {/* Streaming Services */}
                              {recommendation.show.streamingPlatforms && recommendation.show.streamingPlatforms.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-xs text-gray-400">Watch on:</p>
                                  <StreamingLogos providers={recommendation.show.streamingPlatforms} size="sm" maxDisplayed={3} />
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-1">
                                  {/* Eye Button */}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 text-gray-400 hover:text-teal-400"
                                    onClick={() => handleShowView(recommendation.id)}
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                  
                                  {/* Thumbs Up */}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`h-7 w-7 p-0 transition-all ${
                                      recommendation.feedback === 'like'
                                        ? 'text-green-400 bg-green-400/10'
                                        : 'text-gray-400 hover:text-green-400'
                                    }`}
                                    onClick={() => handleFeedback(recommendation.id, "like")}
                                  >
                                    <ThumbsUp className="h-3.5 w-3.5" />
                                  </Button>
                                  
                                  {/* Thumbs Down */}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`h-7 w-7 p-0 transition-all ${
                                      recommendation.feedback === 'dislike'
                                        ? 'text-red-400 bg-red-400/10'
                                        : 'text-gray-400 hover:text-red-400'
                                    }`}
                                    onClick={() => handleFeedback(recommendation.id, "dislike")}
                                  >
                                    <ThumbsDown className="h-3.5 w-3.5" />
                                  </Button>
                                </div>

                                {/* Add to List Button */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs px-2 py-1 h-7"
                                  onClick={() => {
                                    setShowToAddToList(recommendation.show);
                                    setListSelectorOpen(true);
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  List
                                </Button>
                              </div>

                              {/* Watch/Trailer Buttons */}
                              <div className="flex gap-1 pt-2">
                                {recommendation.show.hasTrailer && recommendation.show.trailerKey && (
                                  <Button
                                    size="sm"
                                    className="flex-1 h-6 text-xs bg-red-600 hover:bg-red-700 text-white px-1"
                                    onClick={() => handleWatchTrailer(recommendation)}
                                  >
                                    <Play className="h-2.5 w-2.5 mr-1" />
                                    Trailer
                                  </Button>
                                )}
                                
                                {recommendation.show.streamingAvailable && (
                                  <Button
                                    size="sm"
                                    className="flex-1 h-6 text-xs bg-green-600 hover:bg-green-700 px-1"
                                    onClick={() => handleWatchNow(recommendation)}
                                  >
                                    <ExternalLink className="h-2.5 w-2.5 mr-1" />
                                    Watch
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : compact ? (
              // Compact Layout - Simple list
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((recommendation: AiRecommendation) => (
                  <div key={recommendation.id} className="flex gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors group">
                    <img
                      src={recommendation.show.posterPath 
                        ? `https://image.tmdb.org/t/p/w92${recommendation.show.posterPath}`
                        : "/placeholder-poster.jpg"
                      }
                      alt={recommendation.show.title}
                      className="w-12 h-18 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm leading-tight text-white truncate">
                        {recommendation.show.title}
                      </h4>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-400">
                          {recommendation.show.rating}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {recommendation.reason}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-teal-400"
                                onClick={() => handleShowView(recommendation.id)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Mark as viewed</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-green-400"
                                onClick={() => handleFeedback(recommendation.id, "like")}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Like this recommendation</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                                onClick={() => handleFeedback(recommendation.id, "dislike")}
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Dislike this recommendation</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                ))}
                {recommendations.length > 3 && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-500">
                      +{recommendations.length - 3} more recommendations
                    </p>
                  </div>
                )}
              </div>
            ) : (
            // Full Layout - Existing tabs and cards
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">
                  All ({recommendations.length})
                </TabsTrigger>
                <TabsTrigger value="collaborative" className="flex-1">
                  <Users className="h-4 w-4 mr-1" />
                  Collaborative ({recommendationsByType.collaborative || 0})
                </TabsTrigger>
                <TabsTrigger value="content_based" className="flex-1">
                  <Brain className="h-4 w-4 mr-1" />
                  Similar ({recommendationsByType.content_based || 0})
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Trending ({recommendationsByType.trending || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="mt-6">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-6">
                    {filteredRecommendations.map((recommendation: AiRecommendation) => (
                      <Card key={recommendation.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-card to-muted/10 relative overflow-hidden">
                        {!recommendation.isViewed && (
                          <div className="absolute top-3 right-3 z-10">
                            <Badge variant="destructive" className="text-xs shadow-lg">
                              ✨ New
                            </Badge>
                          </div>
                        )}
                        
                        <CardContent className="p-6">
                          <div className="flex gap-5">
                            {/* Poster Image */}
                            <div className="flex-shrink-0">
                              <div 
                                className="cursor-pointer"
                                onClick={() => handleShowView(recommendation.id)}
                              >
                                <img
                                  src={recommendation.show.posterPath 
                                    ? `https://image.tmdb.org/t/p/w200${recommendation.show.posterPath}`
                                    : "/placeholder-poster.jpg"
                                  }
                                  alt={recommendation.show.title}
                                  className="w-24 h-36 object-cover rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                                />
                              </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 space-y-4">
                              {/* Header with Title and Score */}
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-4">
                                  <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors">
                                    {recommendation.show.title}
                                  </h3>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                      <span className="text-sm font-bold text-primary">
                                        {Math.round(recommendation.score * 100)}%
                                      </span>
                                    </div>
                                    {recommendation.show.rating && (
                                      <Badge variant="secondary" className="text-xs font-bold">
                                        ⭐ {recommendation.show.rating}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Type Badge */}
                                <Badge 
                                  variant="outline" 
                                  className={`${getRecommendationTypeColor(recommendation.recommendationType)} font-medium`}
                                >
                                  {getRecommendationTypeIcon(recommendation.recommendationType)}
                                  <span className="ml-2">
                                    {getRecommendationTypeLabel(recommendation.recommendationType)}
                                  </span>
                                </Badge>
                              </div>

                              {/* Overview */}
                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                {recommendation.show.overview}
                              </p>

                              {/* AI Reasoning - Redesigned */}
                              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
                                    <Brain className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-semibold text-primary mb-1">
                                      Why AI recommends this for you:
                                    </div>
                                    <div className="text-sm text-muted-foreground italic">
                                      "{recommendation.reason}"
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Genres and Networks */}
                              <div className="flex flex-wrap gap-2">
                                {recommendation.show.genres?.slice(0, 4).map((genre: any) => (
                                  <Badge key={genre} variant="secondary" className="text-xs hover:bg-secondary/80 transition-colors">
                                    {genre}
                                  </Badge>
                                ))}
                                {recommendation.show.networks?.slice(0, 2).map((network: any) => (
                                  <Badge key={network} variant="outline" className="text-xs border-primary/20">
                                    📺 {network}
                                  </Badge>
                                ))}
                              </div>

                              {/* Streaming Platforms - Redesigned */}
                              {recommendation.show.streamingPlatforms && recommendation.show.streamingPlatforms.length > 0 && (
                                <div className="bg-muted/30 rounded-lg p-3 border">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm font-medium text-green-600">
                                        🎬 Watch on:
                                      </span>
                                      <StreamingLogos 
                                        providers={recommendation.show.streamingPlatforms}
                                        size="sm"
                                        maxDisplayed={5}
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {recommendation.show.whereToWatch}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons - Redesigned Layout */}
                              <div className="flex items-center justify-between pt-2">
                                {/* Left side - Primary action buttons */}
                                <div className="flex items-center gap-2">
                                  {/* Watch Trailer Button with Ads */}
                                  {recommendation.show.hasTrailer && (
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleWatchTrailer(recommendation)}
                                      className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
                                    >
                                      <Play className="h-4 w-4 mr-2" />
                                      Trailer
                                    </Button>
                                  )}

                                  {/* Watch Now Button */}
                                  {recommendation.show.streamingAvailable && (
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleWatchNow(recommendation)}
                                      className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
                                    >
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Watch Now
                                    </Button>
                                  )}
                                  
                                  {/* Add to List Button - Made much smaller as requested */}
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => handleAddToList(recommendation.show)}
                                          className="h-8 px-2 border-teal-600/20 hover:bg-teal-50 hover:border-teal-600/40 transition-all"
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Add to watchlist</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                
                                {/* Right side - Feedback buttons */}
                                <div className="flex items-center gap-1">
                                  {!recommendation.feedback ? (
                                    <>
                                      {/* Eye button with tooltip explaining its purpose */}
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button 
                                              size="sm" 
                                              variant="ghost"
                                              onClick={() => handleShowView(recommendation.id)}
                                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                            >
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Mark as viewed (helps improve recommendations)</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      
                                      {/* Thumbs up - with better feedback handling */}
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => handleFeedback(recommendation.id, "like")}
                                              disabled={feedbackMutation.isPending}
                                              className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 transition-all"
                                            >
                                              <ThumbsUp className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>I like this recommendation</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      
                                      {/* Thumbs down - with better feedback handling */}
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => handleFeedback(recommendation.id, "dislike")}
                                              disabled={feedbackMutation.isPending}
                                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-all"
                                            >
                                              <ThumbsDown className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Not interested in this</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      
                                      {/* Dismiss button */}
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => handleDismiss(recommendation.id)}
                                              disabled={dismissMutation.isPending}
                                              className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-600 transition-all"
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Hide this recommendation</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </>
                                  ) : (
                                    <Badge 
                                      variant={recommendation.feedback === "like" ? "default" : "destructive"}
                                      className="shadow-sm"
                                    >
                                      {recommendation.feedback === "like" ? (
                                        <><ThumbsUp className="h-3 w-3 mr-1" /> Liked</>
                                      ) : recommendation.feedback === "dislike" ? (
                                        <><ThumbsDown className="h-3 w-3 mr-1" /> Disliked</>
                                      ) : (
                                        <><X className="h-3 w-3 mr-1" /> Dismissed</>
                                      )}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
            )}
          </CardContent>
        )}
      </Card>

      {/* Recommendation Insights */}
      {!compact && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(recommendations.reduce((sum: number, rec: AiRecommendation) => sum + rec.score, 0) / recommendations.length * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Average Match Score</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {recommendations.filter((rec: AiRecommendation) => !rec.isViewed).length}
                </div>
                <div className="text-sm text-muted-foreground">Unviewed Suggestions</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {recommendations.filter((rec: AiRecommendation) => rec.feedback === "liked").length}
                </div>
                <div className="text-sm text-muted-foreground">Liked Recommendations</div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="text-center text-sm text-muted-foreground">
              AI recommendations improve based on your viewing history, ratings, and feedback. 
              The more you interact with the platform, the better our suggestions become.
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* List Selector Modal */}
      <ListSelectorModal 
        isOpen={listSelectorOpen}
        onClose={() => setListSelectorOpen(false)}
        show={showToAddToList}
      />
    </div>
  );
}