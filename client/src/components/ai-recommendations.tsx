import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  ThumbsUp, 
  ThumbsDown, 
  X, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Zap,
  RefreshCw,
  Eye,
  Heart,
  Star,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ListSelectorModal } from "@/components/list-selector-modal";

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

export function AiRecommendations() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [listSelectorOpen, setListSelectorOpen] = useState(false);
  const [showToAddToList, setShowToAddToList] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch AI recommendations with error handling
  const { 
    data: recommendationsData, 
    isLoading, 
    refetch,
    error 
  } = useQuery<AiRecommendation[]>({
    queryKey: ["/api/ai-recommendations"],
    retry: false,
  });

  // Ensure recommendations is always an array
  const recommendations = Array.isArray(recommendationsData) ? recommendationsData : [];

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

  // Remove the duplicate safeRecommendations since we already have recommendations as an array

  // Filter recommendations by type
  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedTab === "all") return true;
    return rec.recommendationType === selectedTab;
  });

  // Group recommendations by type for stats
  const recommendationsByType = recommendations.reduce((acc, rec) => {
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
    <div className="space-y-6">
      <Card>
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
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4" />
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
        
        {recommendations.length === 0 ? (
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">No recommendations yet</h3>
                <p className="text-muted-foreground">
                  Add some shows to your watchlist to get personalized AI recommendations or use the "Generate New" button above.
                </p>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent>
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
                    {filteredRecommendations.map((recommendation) => (
                      <Card key={recommendation.id} className="relative">
                        {!recommendation.isViewed && (
                          <div className="absolute top-2 right-2 z-10">
                            <Badge variant="destructive" className="text-xs">
                              New
                            </Badge>
                          </div>
                        )}
                        
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {/* Show Poster */}
                            <div 
                              className="flex-shrink-0 cursor-pointer"
                              onClick={() => handleShowView(recommendation.id)}
                            >
                              <img
                                src={recommendation.show.posterPath 
                                  ? `https://image.tmdb.org/t/p/w200${recommendation.show.posterPath}`
                                  : "/placeholder-poster.jpg"
                                }
                                alt={recommendation.show.title}
                                className="w-20 h-30 object-cover rounded-md shadow-sm hover:shadow-md transition-shadow"
                              />
                            </div>

                            {/* Show Details */}
                            <div className="flex-1 space-y-3">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {recommendation.show.title}
                                </h3>
                                
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant="outline" 
                                    className={getRecommendationTypeColor(recommendation.recommendationType)}
                                  >
                                    {getRecommendationTypeIcon(recommendation.recommendationType)}
                                    <span className="ml-1">
                                      {getRecommendationTypeLabel(recommendation.recommendationType)}
                                    </span>
                                  </Badge>
                                  
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    <span className="text-sm text-muted-foreground">
                                      {Math.round(recommendation.score * 100)}% match
                                    </span>
                                  </div>
                                  
                                  {recommendation.show.rating && (
                                    <Badge variant="secondary" className="text-xs">
                                      {recommendation.show.rating}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {recommendation.show.overview}
                              </p>

                              {/* AI Reasoning */}
                              <div className="bg-muted/50 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                  <Brain className="h-4 w-4 mt-0.5 text-primary" />
                                  <div>
                                    <div className="text-sm font-medium">Why we recommend this:</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {recommendation.reason}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Show Metadata */}
                              <div className="flex flex-wrap gap-1">
                                {recommendation.show.genres?.slice(0, 3).map(genre => (
                                  <Badge key={genre} variant="secondary" className="text-xs">
                                    {genre}
                                  </Badge>
                                ))}
                                {recommendation.show.networks?.slice(0, 2).map(network => (
                                  <Badge key={network} variant="outline" className="text-xs">
                                    {network}
                                  </Badge>
                                ))}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 pt-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleAddToList(recommendation.show)}
                                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add to List
                                </Button>
                                
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleShowView(recommendation.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                
                                {!recommendation.feedback && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleFeedback(recommendation.id, "liked")}
                                      disabled={feedbackMutation.isPending}
                                    >
                                      <ThumbsUp className="h-4 w-4" />
                                    </Button>
                                    
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleFeedback(recommendation.id, "disliked")}
                                      disabled={feedbackMutation.isPending}
                                    >
                                      <ThumbsDown className="h-4 w-4" />
                                    </Button>
                                    
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDismiss(recommendation.id)}
                                      disabled={dismissMutation.isPending}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                
                                {recommendation.feedback && (
                                  <Badge 
                                    variant={recommendation.feedback === "liked" ? "default" : "secondary"}
                                    className="ml-auto"
                                  >
                                    {recommendation.feedback === "liked" ? (
                                      <><ThumbsUp className="h-3 w-3 mr-1" /> Liked</>
                                    ) : recommendation.feedback === "disliked" ? (
                                      <><ThumbsDown className="h-3 w-3 mr-1" /> Disliked</>
                                    ) : (
                                      "Dismissed"
                                    )}
                                  </Badge>
                                )}
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
          </CardContent>
        )}
      </Card>

      {/* Recommendation Insights */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(recommendations.reduce((sum, rec) => sum + rec.score, 0) / recommendations.length * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Average Match Score</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {recommendations.filter(rec => !rec.isViewed).length}
                </div>
                <div className="text-sm text-muted-foreground">Unviewed Suggestions</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {recommendations.filter(rec => rec.feedback === "liked").length}
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