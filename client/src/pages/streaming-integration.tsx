import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ExternalLink, 
  Calendar, 
  BarChart3, 
  Settings, 
  Trash2, 
  Link2, 
  Download,
  Tv,
  Eye,
  TrendingUp,
  Info
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ViewingHistoryUpload from "@/components/viewing-history-upload";

interface Platform {
  id: string;
  name: string;
  displayName: string;
}

interface StreamingIntegration {
  id: number;
  platform: string;
  isActive: boolean;
  lastSync: string;
  createdAt: string;
}

interface ViewingPattern {
  favoriteGenres: string[];
  preferredPlatforms: string[];
  viewingTimes: string[];
  completionRate: number;
  averageRating: number;
}

export default function StreamingIntegration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);

  const { data: platforms = [], isLoading: platformsLoading } = useQuery({
    queryKey: ["/api/streaming/platforms"],
  });

  const { data: integrations = [], isLoading: integrationsLoading } = useQuery({
    queryKey: ["/api/streaming/integrations"],
  });

  const { data: viewingHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ["/api/viewing-history"],
  });

  const { data: viewingPatterns, isLoading: patternsLoading } = useQuery({
    queryKey: ["/api/viewing-patterns"],
  });

  const connectMutation = useMutation({
    mutationFn: async (platform: string) => {
      const response = await apiRequest("GET", `/api/streaming/auth/${platform}`);
      const data = await response.json();
      
      // Open OAuth popup
      window.open(data.authUrl, '_blank', 'width=600,height=700');
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Authentication Started",
        description: "Complete the authentication in the popup window.",
      });
    },
    onError: (error) => {
      const isCredentialError = error.message.includes('OAuth credentials');
      toast({
        title: isCredentialError ? "Setup Required" : "Connection Failed",
        description: isCredentialError 
          ? "This platform requires OAuth setup. Contact your administrator to configure API credentials."
          : error.message,
        variant: "destructive",
      });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async ({ platform }: { platform: string }) => {
      const response = await apiRequest("POST", `/api/streaming/sync/${platform}`, {
        limit: 200
      });
      return await response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Sync Complete",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/viewing-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/viewing-patterns"] });
      setSyncingPlatform(null);
    },
    onError: (error, variables) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
      setSyncingPlatform(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (integrationId: number) => {
      await apiRequest("DELETE", `/api/streaming/integrations/${integrationId}`);
    },
    onSuccess: () => {
      toast({
        title: "Integration Removed",
        description: "Streaming platform integration has been disconnected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/streaming/integrations"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Remove",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConnect = (platform: string) => {
    connectMutation.mutate(platform);
  };

  const handleSync = (platform: string) => {
    setSyncingPlatform(platform);
    syncMutation.mutate({ platform });
  };

  const handleDelete = (integrationId: number) => {
    deleteMutation.mutate(integrationId);
  };

  const getIntegrationForPlatform = (platformId: string) => {
    return integrations.find((integration: StreamingIntegration) => 
      integration.platform === platformId
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
    return capitalizeFirst(timeString);
  };

  if (platformsLoading || integrationsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Streaming Integration</h1>
            <p className="text-muted-foreground">
              Connect your streaming accounts to get personalized recommendations based on your viewing history.
            </p>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Setup Information</AlertTitle>
            <AlertDescription>
              Some streaming platforms require OAuth credentials to be configured by an administrator. 
              If you encounter connection errors, this typically means the platform's API credentials need to be set up.
            </AlertDescription>
          </Alert>
        </div>

        {/* Available Platforms */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Available Platforms
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {platforms.map((platform: Platform) => {
              const integration = getIntegrationForPlatform(platform.id);
              const isConnected = !!integration;

              return (
                <Card key={platform.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{platform.displayName}</CardTitle>
                      {isConnected && (
                        <Badge variant="default" className="bg-green-600">
                          Connected
                        </Badge>
                      )}
                    </div>
                    {isConnected && integration && (
                      <CardDescription>
                        Last synced: {formatDate(integration.lastSync)}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!isConnected ? (
                      <Button 
                        onClick={() => handleConnect(platform.id)}
                        disabled={connectMutation.isPending}
                        className="w-full"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Connect Account
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync(platform.id)}
                            disabled={syncingPlatform === platform.id}
                            className="flex-1"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {syncingPlatform === platform.id ? "Syncing..." : "Sync Data"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(integration!.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Auto-sync</span>
                          <Switch 
                            checked={integration.isActive} 
                            disabled 
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Viewing Data Management */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Viewing Data Management
          </h2>
          
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Import Data</TabsTrigger>
              <TabsTrigger value="patterns">View Patterns</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <ViewingHistoryUpload />
            </TabsContent>
            
            <TabsContent value="patterns" className="space-y-4">
              {viewingPatterns && !patternsLoading && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Favorite Genres</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {viewingPatterns.favoriteGenres.slice(0, 3).map((genre: string) => (
                            <Badge key={genre} variant="secondary" className="text-xs">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Preferred Platforms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {viewingPatterns.preferredPlatforms.map((platform: string) => (
                      <Badge key={platform} variant="outline" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Viewing Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {viewingPatterns.viewingTimes.map((time: string) => (
                      <Badge key={time} variant="outline" className="text-xs">
                        {formatTime(time)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(viewingPatterns.completionRate * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average rating: {viewingPatterns.averageRating.toFixed(1)}/5
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Recent Viewing History */}
        {viewingHistory.length > 0 && !historyLoading && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Viewing History
            </h2>
            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {viewingHistory.slice(0, 10).map((record: any, index: number) => (
                    <div key={record.id}>
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <Tv className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {record.showTitle || "Unknown Show"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {record.platform} • {formatDate(record.watchedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {Math.round((record.completionPercentage || 0) * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {record.watchDuration || 0}min
                          </p>
                        </div>
                      </div>
                      {index < viewingHistory.slice(0, 10).length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Benefits Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            How It Improves Your Experience
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Better Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get personalized show suggestions based on your actual viewing history and preferences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Smart Filtering</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automatically filter out shows you've already watched when browsing.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Viewing Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Understand your viewing patterns and discover new genres you might enjoy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}