import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { TopNav } from "@/components/top-nav";
import MobileNav from "@/components/mobile-nav";
import { useToast } from "@/hooks/use-toast";
import TrailerButton from "@/components/trailer-button";
import { 
  Play, 
  Pause,
  Clock, 
  CheckCircle,
  List,
  Star,
  Eye,
  Calendar,
  TrendingUp,
  Filter,
  Search,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  ArrowUp,
  ArrowDown
} from "lucide-react";

interface WatchlistItem {
  id: number;
  showId: number;
  userId: string;
  status: "watching" | "want_to_watch" | "finished" | "dropped" | "on_hold";
  rating?: string;
  currentSeason?: number;
  currentEpisode?: number;
  totalEpisodesWatched?: number;
  totalHoursWatched?: number;
  notes?: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt?: string;
  show: {
    id: number;
    tmdbId: number;
    title: string;
    overview?: string;
    posterPath?: string;
    backdropPath?: string;
    rating?: string;
    genres: string[];
    networks: string[];
    firstAirDate?: string;
    lastAirDate?: string;
    status?: string;
    numberOfSeasons?: number;
    numberOfEpisodes?: number;
  };
}

interface EpisodeProgress {
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
  watchedAt: string;
  duration?: number;
}

export default function Watchlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  
  // Get filter from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const initialFilter = urlParams.get('filter') || 'all';
  
  const [activeTab, setActiveTab] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedItem, setSelectedItem] = useState<WatchlistItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);

  // Fetch watchlist
  const { data: watchlist = [], isLoading, error } = useQuery<WatchlistItem[]>({
    queryKey: ["/api/watchlist"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!user, // Only fetch when user is authenticated
  });

  // Update watchlist item
  const updateItemMutation = useMutation({
    mutationFn: async (updates: { id: number; data: Partial<WatchlistItem> }) => {
      return fetch(`/api/watchlist/${updates.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates.data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({ title: "Updated successfully!" });
      setEditDialogOpen(false);
      setProgressDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to update", variant: "destructive" });
    },
  });

  // Remove from watchlist
  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return fetch(`/api/watchlist/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({ title: "Removed from watchlist" });
    },
    onError: () => {
      toast({ title: "Failed to remove", variant: "destructive" });
    },
  });

  // Filter and sort watchlist
  const filteredWatchlist = watchlist
    .filter((item: WatchlistItem) => {
      if (activeTab !== 'all') {
        // Map "completed" tab to "finished" status for uploaded viewing history
        const targetStatus = activeTab === 'completed' ? 'finished' : activeTab;
        console.log(`Filtering: activeTab=${activeTab}, targetStatus=${targetStatus}, item.status=${item.status}, match=${item.status === targetStatus}`);
        if (item.status !== targetStatus) return false;
      }
      if (searchQuery && !item.show.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a: WatchlistItem, b: WatchlistItem) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "title":
          aValue = a.show.title.toLowerCase();
          bValue = b.show.title.toLowerCase();
          break;
        case "rating":
          aValue = parseFloat(a.rating || "0");
          bValue = parseFloat(b.rating || "0");
          break;
        case "progress":
          aValue = a.totalEpisodesWatched || 0;
          bValue = b.totalEpisodesWatched || 0;
          break;
        case "dateAdded":
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Debug status distribution
  const statusCounts = watchlist.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log("Status distribution:", statusCounts);
  console.log("Active tab:", activeTab);
  console.log("Filtered list length:", filteredWatchlist.length);
  console.log("Sample watchlist items:", watchlist.slice(0, 3).map(item => ({ title: item.show.title, status: item.status })));

  // Calculate stats
  const stats = {
    watching: watchlist.filter((item: WatchlistItem) => item.status === 'watching').length,
    finished: watchlist.filter((item: WatchlistItem) => item.status === 'finished').length,
    planToWatch: watchlist.filter((item: WatchlistItem) => item.status === 'want_to_watch').length,
    dropped: watchlist.filter((item: WatchlistItem) => item.status === 'dropped').length,
    onHold: watchlist.filter((item: WatchlistItem) => item.status === 'on_hold').length,
    totalHours: watchlist.reduce((sum: number, item: WatchlistItem) => sum + (item.totalHoursWatched || 0), 0),
    totalEpisodes: watchlist.reduce((sum: number, item: WatchlistItem) => sum + (item.totalEpisodesWatched || 0), 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'watching': return 'bg-teal-500';
      case 'finished': return 'bg-green-500';
      case 'want_to_watch': return 'bg-blue-500';
      case 'dropped': return 'bg-red-500';
      case 'on_hold': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'watching': return 'Currently Watching';
      case 'finished': return 'Completed';
      case 'want_to_watch': return 'Plan to Watch';
      case 'dropped': return 'Dropped';
      case 'on_hold': return 'On Hold';
      default: return status;
    }
  };

  const calculateProgress = (item: WatchlistItem) => {
    if (!item.show.numberOfEpisodes || !item.totalEpisodesWatched) return 0;
    return Math.min(100, (item.totalEpisodesWatched / item.show.numberOfEpisodes) * 100);
  };

  const formatRuntime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-white">Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Watchlist</h1>
            <p className="text-gray-400">Track your shows and episodes</p>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-lg font-bold text-teal-400">{stats.watching}</div>
              <div className="text-xs text-gray-400">Watching</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-lg font-bold text-green-400">{stats.finished}</div>
              <div className="text-xs text-gray-400">Completed</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 col-span-2 sm:col-span-1">
              <div className="text-lg font-bold text-purple-400">{formatRuntime(stats.totalHours)}</div>
              <div className="text-xs text-gray-400">Total Time</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search your shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] bg-slate-800/50 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateAdded">Date Added</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="bg-slate-800/50 border-slate-700"
            >
              {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-slate-800/50">
            <TabsTrigger value="all" className="flex-1">
              All ({watchlist.length})
            </TabsTrigger>
            <TabsTrigger value="watching" className="flex-1">
              <Play className="h-4 w-4 mr-1" />
              Watching ({stats.watching})
            </TabsTrigger>
            <TabsTrigger value="want_to_watch" className="flex-1">
              <Clock className="h-4 w-4 mr-1" />
              Plan to Watch ({stats.planToWatch})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">
              <CheckCircle className="h-4 w-4 mr-1" />
              Completed ({stats.finished})
            </TabsTrigger>
          </TabsList>

          {/* Tab content for all tabs */}
          <TabsContent value="all" className="space-y-4">
            {activeTab === 'all' && (
              <>
                {filteredWatchlist.length === 0 ? (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="text-center py-12">
                      <List className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No shows found</h3>
                      <p className="text-gray-400 mb-4">Start adding shows to your watchlist!</p>
                      <Button onClick={() => window.location.href = '/discover'}>
                        <Plus className="h-4 w-4 mr-2" />
                        Discover Shows
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {filteredWatchlist.map((item: WatchlistItem) => (
                      <Card key={item.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-16 h-24 bg-slate-700 rounded-lg overflow-hidden">
                                {item.show.posterPath ? (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w154${item.show.posterPath}`}
                                    alt={item.show.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Play className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-lg mb-1">{item.show.title}</h3>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className={`${getStatusColor(item.status)} text-white`}>
                                      {getStatusLabel(item.status)}
                                    </Badge>
                                    {item.rating && (
                                      <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                        <span className="text-sm">{item.rating}/10</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setProgressDialogOpen(true);
                                    }}
                                    className="bg-slate-700/50 border-slate-600 h-8 w-8"
                                  >
                                    <BarChart3 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setEditDialogOpen(true);
                                    }}
                                    className="bg-slate-700/50 border-slate-600 h-8 w-8"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeItemMutation.mutate(item.id)}
                                    className="bg-slate-700/50 border-slate-600 h-8 w-8 hover:bg-red-600/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="watching" className="space-y-4">
            {activeTab === 'watching' && (
              <>
                {filteredWatchlist.length === 0 ? (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="text-center py-12">
                      <List className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No shows found</h3>
                      <p className="text-gray-400 mb-4">No shows in "Currently Watching" status.</p>
                      <Button onClick={() => window.location.href = '/discover'}>
                        <Plus className="h-4 w-4 mr-2" />
                        Discover Shows
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {filteredWatchlist.map((item: WatchlistItem) => (
                      <Card key={item.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-16 h-24 bg-slate-700 rounded-lg overflow-hidden">
                                {item.show.posterPath ? (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w154${item.show.posterPath}`}
                                    alt={item.show.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Play className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-lg mb-1">{item.show.title}</h3>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className={`${getStatusColor(item.status)} text-white`}>
                                      {getStatusLabel(item.status)}
                                    </Badge>
                                    {item.rating && (
                                      <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                        <span className="text-sm">{item.rating}/10</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setProgressDialogOpen(true);
                                    }}
                                    className="bg-slate-700/50 border-slate-600 h-8 w-8"
                                  >
                                    <BarChart3 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setEditDialogOpen(true);
                                    }}
                                    className="bg-slate-700/50 border-slate-600 h-8 w-8"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeItemMutation.mutate(item.id)}
                                    className="bg-slate-700/50 border-slate-600 h-8 w-8 hover:bg-red-600/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="want_to_watch" className="space-y-4">
            {activeTab === 'want_to_watch' && (
              <>
                {filteredWatchlist.length === 0 ? (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="text-center py-12">
                      <List className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No shows found</h3>
                      <p className="text-gray-400 mb-4">No shows in "Plan to Watch" status.</p>
                      <Button onClick={() => window.location.href = '/discover'}>
                        <Plus className="h-4 w-4 mr-2" />
                        Discover Shows
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {filteredWatchlist.map((item: WatchlistItem) => (
                      <Card key={item.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-16 h-24 bg-slate-700 rounded-lg overflow-hidden">
                                {item.show.posterPath ? (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w154${item.show.posterPath}`}
                                    alt={item.show.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Play className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-lg mb-1">{item.show.title}</h3>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className={`${getStatusColor(item.status)} text-white`}>
                                      {getStatusLabel(item.status)}
                                    </Badge>
                                    {item.rating && (
                                      <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                        <span className="text-sm">{item.rating}/10</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setProgressDialogOpen(true);
                                    }}
                                    className="bg-slate-700/50 border-slate-600 h-8 w-8"
                                  >
                                    <BarChart3 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setEditDialogOpen(true);
                                    }}
                                    className="bg-slate-700/50 border-slate-600 h-8 w-8"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeItemMutation.mutate(item.id)}
                                    className="bg-slate-700/50 border-slate-600 h-8 w-8 hover:bg-red-600/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {activeTab === 'completed' && (
              <>
                {filteredWatchlist.length === 0 ? (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="text-center py-12">
                      <List className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No shows found</h3>
                      <p className="text-gray-400 mb-4">No shows in "Completed" status.</p>
                      <Button onClick={() => window.location.href = '/discover'}>
                        <Plus className="h-4 w-4 mr-2" />
                        Discover Shows
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                {filteredWatchlist.map((item: WatchlistItem) => (
                  <Card key={item.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Poster */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-24 bg-slate-700 rounded-lg overflow-hidden">
                            {item.show.posterPath ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w154${item.show.posterPath}`}
                                alt={item.show.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Play className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">{item.show.title}</h3>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={`${getStatusColor(item.status)} text-white`}>
                                  {getStatusLabel(item.status)}
                                </Badge>
                                {item.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                    <span className="text-sm">{item.rating}/10</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setProgressDialogOpen(true);
                                }}
                                className="bg-slate-700/50 border-slate-600 h-8 w-8"
                              >
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setEditDialogOpen(true);
                                }}
                                className="bg-slate-700/50 border-slate-600 h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeItemMutation.mutate(item.id)}
                                className="bg-slate-700/50 border-slate-600 h-8 w-8 hover:bg-red-600/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Progress */}
                          {item.status === 'watching' && (
                            <div className="mb-3">
                              <div className="flex justify-between text-sm text-gray-400 mb-1">
                                <span>
                                  Progress: {item.currentSeason && item.currentEpisode 
                                    ? `S${item.currentSeason}E${item.currentEpisode}` 
                                    : 'Not started'
                                  }
                                </span>
                                <span>{item.totalEpisodesWatched || 0} / {item.show.numberOfEpisodes || '?'} episodes</span>
                              </div>
                              <Progress value={calculateProgress(item)} className="h-2" />
                            </div>
                          )}

                          {/* Stats */}
                          <div className="flex gap-4 text-sm text-gray-400">
                            {item.totalEpisodesWatched && (
                              <span>{item.totalEpisodesWatched} episodes watched</span>
                            )}
                            {item.totalHoursWatched && (
                              <span>{formatRuntime(item.totalHoursWatched)} watched</span>
                            )}
                            {item.show.genres?.length > 0 && (
                              <span>{item.show.genres.slice(0, 2).join(', ')}</span>
                            )}
                          </div>

                          {/* Notes */}
                          {item.notes && (
                            <div className="mt-2 text-sm text-gray-300 bg-slate-700/30 rounded p-2">
                              {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle>Edit {selectedItem?.show.title}</DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <EditItemForm
                item={selectedItem}
                onSave={(data) => updateItemMutation.mutate({ id: selectedItem.id, data })}
                onCancel={() => setEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Progress Dialog */}
        <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle>Update Progress - {selectedItem?.show.title}</DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <ProgressForm
                item={selectedItem}
                onSave={(data) => updateItemMutation.mutate({ id: selectedItem.id, data })}
                onCancel={() => setProgressDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <MobileNav />
    </div>
  );
}

// Edit Item Form Component
function EditItemForm({ 
  item, 
  onSave, 
  onCancel 
}: { 
  item: WatchlistItem; 
  onSave: (data: Partial<WatchlistItem>) => void;
  onCancel: () => void;
}) {
  const [status, setStatus] = useState(item.status);
  const [rating, setRating] = useState(item.rating || "");
  const [notes, setNotes] = useState(item.notes || "");
  const [isPublic, setIsPublic] = useState(item.isPublic || false);

  const handleSave = () => {
    onSave({
      status,
      rating: rating || undefined,
      notes: notes || undefined,
      isPublic,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Status</label>
        <Select value={status} onValueChange={(value: any) => setStatus(value)}>
          <SelectTrigger className="bg-slate-700 border-slate-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="watching">Currently Watching</SelectItem>
            <SelectItem value="want_to_watch">Plan to Watch</SelectItem>
            <SelectItem value="finished">Completed</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Rating (1-10)</label>
        <Input
          type="number"
          min="1"
          max="10"
          step="0.1"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          placeholder="Rate this show..."
          className="bg-slate-700 border-slate-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Notes</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add your thoughts..."
          className="bg-slate-700 border-slate-600"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="public"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="public" className="text-sm">Make this entry public</label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave} className="flex-1">Save Changes</Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
      </div>
    </div>
  );
}

// Progress Form Component
function ProgressForm({ 
  item, 
  onSave, 
  onCancel 
}: { 
  item: WatchlistItem; 
  onSave: (data: Partial<WatchlistItem>) => void;
  onCancel: () => void;
}) {
  const [currentSeason, setCurrentSeason] = useState(item.currentSeason || 1);
  const [currentEpisode, setCurrentEpisode] = useState(item.currentEpisode || 1);
  const [totalEpisodes, setTotalEpisodes] = useState(item.totalEpisodesWatched || 0);
  const [totalHours, setTotalHours] = useState(item.totalHoursWatched || 0);

  const handleSave = () => {
    onSave({
      currentSeason,
      currentEpisode,
      totalEpisodesWatched: totalEpisodes,
      totalHoursWatched: totalHours,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Current Season</label>
          <Input
            type="number"
            min="1"
            value={currentSeason}
            onChange={(e) => setCurrentSeason(parseInt(e.target.value) || 1)}
            className="bg-slate-700 border-slate-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Current Episode</label>
          <Input
            type="number"
            min="1"
            value={currentEpisode}
            onChange={(e) => setCurrentEpisode(parseInt(e.target.value) || 1)}
            className="bg-slate-700 border-slate-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Total Episodes Watched</label>
        <Input
          type="number"
          min="0"
          value={totalEpisodes}
          onChange={(e) => setTotalEpisodes(parseInt(e.target.value) || 0)}
          className="bg-slate-700 border-slate-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Total Hours Watched</label>
        <Input
          type="number"
          min="0"
          step="0.5"
          value={totalHours}
          onChange={(e) => setTotalHours(parseFloat(e.target.value) || 0)}
          className="bg-slate-700 border-slate-600"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave} className="flex-1">Update Progress</Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
      </div>
    </div>
  );
}