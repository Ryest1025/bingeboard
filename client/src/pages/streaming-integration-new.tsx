import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
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
  Info,
  RotateCcw,
  User,
  LogOut
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
  const { user } = useAuth();
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/streaming/integrations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/streaming/integrations"] });
      toast({
        title: "Integration Removed",
        description: "Streaming platform integration has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove integration.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isIntegrationActive = (platform: Platform) => {
    return integrations.find((integration: StreamingIntegration) => 
      integration.platform === platform.id && integration.isActive
    );
  };

  if (platformsLoading || integrationsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-binge-dark text-white pb-20 md:pb-0">
      {/* Top Navigation */}
      <div className="nav-opaque border-b border-binge-gray sticky top-0 z-[60]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <Tv className="w-8 h-8 text-binge-purple" />
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-0.5 text-xs font-bold text-white">B</span>
              </div>
              <h1 className="text-2xl font-bold">BingeBoard</h1>
            </Link>
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex space-x-6">
                <Link href="/discover" className="hover:text-binge-purple transition-colors">Discover</Link>
                <Link href="/upcoming" className="hover:text-binge-purple transition-colors">Upcoming</Link>
                <Link href="/friends" className="hover:text-binge-purple transition-colors">Binge Friends</Link>
              </nav>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.profileImageUrl} />
                        <AvatarFallback className="bg-gradient-purple text-white">
                          {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block text-sm">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.email || 'User'
                        }
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-binge-charcoal border-white/10">
                    <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = '/streaming'}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => window.location.href = '/login'} className="bg-binge-purple hover:bg-binge-purple/80">
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Import Viewing History</h1>
          <p className="text-muted-foreground mt-2">
            Import your viewing history from streaming platforms to get personalized recommendations and track your progress.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            if (user) {
              // Clear onboarding completion flag to trigger modal again
              localStorage.removeItem(`onboarding-completed-${(user as any).id}`);
              toast({
                title: "Onboarding Reset",
                description: "Refresh the page to see the onboarding guide again.",
              });
            }
          }}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Show Onboarding Guide
        </Button>
      </div>



      {/* Manual Data Import */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Download className="h-5 w-5" />
          Manual Data Import
        </h2>
        <p className="text-muted-foreground">
          Export your viewing history from streaming platforms and upload the files here. Follow the platform-specific instructions below.
        </p>
        
        {/* Platform Export Instructions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                Netflix
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>1. Go to netflix.com/viewingactivity</p>
              <p>2. Click "Download all" at the bottom</p>
              <p>3. Save the CSV file</p>
              <p>4. Upload the file below</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                Disney+
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>1. Go to Account Settings</p>
              <p>2. Select "Privacy and Data"</p>
              <p>3. Click "Request Data Download"</p>
              <p>4. Wait for email with download link</p>
              <p>5. Extract and upload viewing data</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                Paramount+
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>1. Go to Account Settings</p>
              <p>2. Select "Privacy Settings"</p>
              <p>3. Click "Download My Data"</p>
              <p>4. Request viewing history export</p>
              <p>5. Upload the received CSV file</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                Peacock
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>1. Go to peacocktv.com/account</p>
              <p>2. Select "Privacy & Data"</p>
              <p>3. Click "Export My Data"</p>
              <p>4. Choose "Viewing History"</p>
              <p>5. Download and upload the file</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                Hulu
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>1. Go to Hulu Account page</p>
              <p>2. Select "Privacy and Data"</p>
              <p>3. Click "Export Data"</p>
              <p>4. Request viewing activity</p>
              <p>5. Upload the CSV when ready</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                Max (HBO Max)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>1. Go to max.com/settings</p>
              <p>2. Select "Privacy Settings"</p>
              <p>3. Click "Request Data Export"</p>
              <p>4. Choose "Viewing Activity"</p>
              <p>5. Download and upload the file</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                Other Platforms
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>Create a CSV with columns:</p>
              <p><code>title,date_watched,platform</code></p>
              <p>Or JSON with same fields</p>
              <p>Date format: YYYY-MM-DD</p>
            </CardContent>
          </Card>
        </div>

        <ViewingHistoryUpload />
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
            <Card>
              <CardHeader>
                <CardTitle>Upload Complete</CardTitle>
                <CardDescription>
                  Your viewing history has been uploaded above. Switch to "View Patterns" to see your viewing analytics.
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
          
          <TabsContent value="patterns" className="space-y-4">
            {viewingPatterns && !patternsLoading && (
              <div className="space-y-4">
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
                      <CardTitle className="text-sm font-medium">Platforms</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {viewingPatterns.preferredPlatforms.slice(0, 3).map((platform: string) => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {viewingPatterns.viewingTimes.slice(0, 3).map((time: string) => (
                          <Badge key={time} variant="outline" className="text-xs">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Completion: {Math.round(viewingPatterns.completionRate * 100)}%
                      </p>
                      <p className="text-sm">
                        Average rating: {viewingPatterns.averageRating.toFixed(1)}/5
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Viewing History */}
                {viewingHistory.length > 0 && !historyLoading && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Recent Viewing History
                    </h3>
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
                AI analyzes your viewing history to suggest shows you'll actually want to watch.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Unified Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                See all your viewing activity across platforms in one place.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Smart Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Discover your viewing patterns and get personalized stats.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}