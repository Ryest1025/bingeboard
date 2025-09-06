import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useStreamingEnrichedContent } from "@/hooks/useStreamingEnrichedContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
// // import { TopNav } from "@/components/top-nav"; // Auto-removed: TopNav handled by App.tsx // Auto-removed: TopNav handled by App.tsx
// import MobileNav from "@/components/mobile-nav"; // Auto-removed: MobileNav handled by App.tsx
import { HorizontalScrollContainer } from "@/components/ui/HorizontalScrollContainer";
import { ContentCard } from "@/components/ui/ContentCard";
import { StreamingLogos } from "@/components/ui/StreamingLogos";
import { StreamingPlatformSelector as UniversalStreamingPlatformSelector } from "@/components/ui/StreamingPlatformSelector";
import {
  Play,
  Plus,
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
  Heart,
  Share,
  X,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Trash2,
  Users,
  Lock,
  Globe,
  Bookmark
} from "lucide-react";

interface WatchlistItem {
  id: number;
  showId: number;
  title: string;
  poster_path: string;
  status: "watching" | "plan_to_watch" | "completed" | "dropped" | "on_hold";
  rating?: number;
  progress?: {
    currentSeason: number;
    currentEpisode: number;
    totalSeasons: number;
    totalEpisodes: number;
  };
  dateAdded: string;
  genre: string;
  year: number;
  network: string;
}

interface CustomList {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  isCollaborative: boolean;
  itemCount: number;
  collaborators?: number;
  createdAt: string;
  color: string;
}

export default function ModernLists() {
  const { isAuthenticated } = useAuth();
  const [selectedList, setSelectedList] = useState("currently-watching");
  const [filterGenre, setFilterGenre] = useState("all");

  // Helper function to add streaming data to items
  const addStreamingData = (item: any) => {
    const fallbackProviders = [
      {
        provider_id: 8,
        provider_name: "Netflix",
        name: "Netflix",
        logo_path: "/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg"
      },
      {
        provider_id: 384,
        provider_name: "HBO Max",
        name: "HBO Max",
        logo_path: "/Ajqyt5aNxNGjmF9uOfxArGrdf3X.jpg"
      },
      {
        provider_id: 337,
        provider_name: "Disney Plus",
        name: "Disney Plus",
        logo_path: "/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg"
      }
    ];

    return {
      ...item,
      streaming: fallbackProviders.slice(0, Math.floor(Math.random() * 3) + 1),
      streamingPlatforms: fallbackProviders.slice(0, Math.floor(Math.random() * 3) + 1)
    };
  };

  // Mock data - replace with real API calls
  const watchingList: WatchlistItem[] = [
    {
      id: 1,
      showId: 101,
      title: "The Bear",
      poster_path: "/poster1.jpg",
      status: "watching",
      rating: 5,
      progress: {
        currentSeason: 2,
        currentEpisode: 4,
        totalSeasons: 3,
        totalEpisodes: 28
      },
      dateAdded: "2024-01-15",
      genre: "Comedy-Drama",
      year: 2022,
      network: "FX"
    },
    {
      id: 2,
      showId: 102,
      title: "House of the Dragon",
      poster_path: "/poster2.jpg",
      status: "watching",
      rating: 4,
      progress: {
        currentSeason: 2,
        currentEpisode: 2,
        totalSeasons: 2,
        totalEpisodes: 18
      },
      dateAdded: "2024-01-10",
      genre: "Fantasy Drama",
      year: 2022,
      network: "HBO"
    }
  ];

  const planToWatchList: WatchlistItem[] = [
    {
      id: 3,
      showId: 103,
      title: "Severance",
      poster_path: "/poster3.jpg",
      status: "plan_to_watch",
      dateAdded: "2024-01-20",
      genre: "Psychological Thriller",
      year: 2022,
      network: "Apple TV+"
    },
    {
      id: 4,
      showId: 104,
      title: "The Last of Us",
      poster_path: "/poster4.jpg",
      status: "plan_to_watch",
      dateAdded: "2024-01-18",
      genre: "Post-Apocalyptic Drama",
      year: 2023,
      network: "HBO"
    }
  ];

  const completedList: WatchlistItem[] = [
    {
      id: 5,
      showId: 105,
      title: "Breaking Bad",
      poster_path: "/poster5.jpg",
      status: "completed",
      rating: 5,
      dateAdded: "2023-12-01",
      genre: "Crime Drama",
      year: 2008,
      network: "AMC"
    }
  ];

  const customLists: CustomList[] = [
    {
      id: 1,
      name: "Best of 2024",
      description: "My favorite shows from this year",
      isPublic: true,
      isCollaborative: false,
      itemCount: 12,
      createdAt: "2024-01-01",
      color: "bg-teal-500"
    },
    {
      id: 2,
      name: "Watch Party Queue",
      description: "Shows to watch with friends",
      isPublic: false,
      isCollaborative: true,
      itemCount: 8,
      collaborators: 3,
      createdAt: "2024-01-15",
      color: "bg-purple-500"
    },
    {
      id: 3,
      name: "Comfort Watches",
      description: "Feel-good shows for bad days",
      isPublic: true,
      isCollaborative: false,
      itemCount: 15,
      createdAt: "2023-12-20",
      color: "bg-orange-500"
    }
  ];

  const getListByStatus = (status: string): WatchlistItem[] => {
    switch (status) {
      case "watching":
        return watchingList;
      case "plan_to_watch":
        return planToWatchList;
      case "completed":
        return completedList;
      default:
        return [];
    }
  };

  const handleItemSelect = (itemId: number) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleStatusChange = (itemId: number, newStatus: string) => {
    // Handle status change logic
    console.log(`Moving item ${itemId} to ${newStatus}`);
  };

  const getProgressPercentage = (progress: WatchlistItem['progress']) => {
    if (!progress) return 0;
    const currentTotal = (progress.currentSeason - 1) * (progress.totalEpisodes / progress.totalSeasons) + progress.currentEpisode;
    return Math.round((currentTotal / progress.totalEpisodes) * 100);
  };

  const filteredItems = getListByStatus(activeTab).filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(228,25%,3%)] via-[hsl(226,22%,6%)] to-[hsl(224,20%,8%)] flex items-center justify-center p-4">
        <Card className="glass-effect border-slate-700 max-w-md mx-auto">
          <CardContent className="p-8 text-center space-y-4">
            <List className="h-16 w-16 text-teal-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Organize Your Viewing</h2>
            <p className="text-gray-300">
              Create custom lists, track your progress, and never lose track of what to watch next.
            </p>
            <Button asChild className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
              <Link href="/api/login">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* TopNav removed: handled by App.tsx */}

      <div className="pt-20 pb-24">
        <div className="container mx-auto px-4">

          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 justify-center">
                <span className="inline-flex items-center gap-1">
                  <img src="/bingeboard-logo.png" alt="BingeBoard Logo" className="w-7 h-7 rounded shadow-md" />
                  <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-black text-2xl">
                    inge
                  </span>
                </span>
                <span className="text-2xl font-bold text-white">Lists</span>
              </div>
            </div>
            <div className="flex justify-center">
              <Button className="bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 border-teal-500/50">
                <Plus className="h-4 w-4 mr-2" />
                Create List
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search your lists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-gray-400"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="watching" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
                <Play className="h-4 w-4 mr-2" />
                Watching
              </TabsTrigger>
              <TabsTrigger value="plan_to_watch" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
                <Clock className="h-4 w-4 mr-2" />
                Plan to Watch
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed
              </TabsTrigger>
              <TabsTrigger value="custom" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
                <Bookmark className="h-4 w-4 mr-2" />
                Custom
              </TabsTrigger>
            </TabsList>

            {/* Watching Tab - Universal Components */}
            <TabsContent value="watching" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                  Currently Watching ({watchingList.length})
                </h2>
                <Button variant="outline" size="sm" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </div>

              <HorizontalScrollContainer scrollId="watching-list">
                <div className="flex space-x-4 pb-4">
                  {filteredItems.slice(0, 4).map((item) => (
                    <ContentCard
                      key={item.id}
                      item={addStreamingData({
                        id: item.id,
                        title: item.title,
                        poster_path: item.poster_path,
                        vote_average: item.rating || 0,
                        overview: `${item.genre} • ${item.year} • ${item.network}`,
                        streamingPlatforms: []
                      })}
                      type="tv"
                      showStreamingLogos={true}
                      showTrailerButton={true}
                      showAffiliateLinks={true}
                      onWatchNow={() => console.log('Watch now:', item.title)}
                      onAddToWatchlist={() => console.log('Add to watchlist:', item.title)}
                    />
                  ))}
                </div>
              </HorizontalScrollContainer>

              {filteredItems.length > 4 && (
                <div className="text-center">
                  <Button variant="outline" className="border-teal-500 text-teal-400 hover:bg-teal-500/20">
                    View All {filteredItems.length} Shows
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Plan to Watch Tab - Universal Components */}
            <TabsContent value="plan_to_watch" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  Plan to Watch ({planToWatchList.length})
                </h2>
                <Button variant="outline" size="sm" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </div>

              <HorizontalScrollContainer scrollId="plan-to-watch-list">
                <div className="flex space-x-4 pb-4">
                  {planToWatchList.filter(item =>
                    item.title.toLowerCase().includes(searchQuery.toLowerCase())
                  ).slice(0, 4).map((item) => (
                    <ContentCard
                      key={item.id}
                      item={addStreamingData({
                        id: item.id,
                        title: item.title,
                        poster_path: item.poster_path,
                        vote_average: item.rating || 0,
                        overview: `${item.genre} • ${item.year} • ${item.network}`,
                        streamingPlatforms: []
                      })}
                      type="tv"
                      showStreamingLogos={true}
                      showTrailerButton={true}
                      showAffiliateLinks={true}
                      onWatchNow={() => console.log('Watch now:', item.title)}
                      onAddToWatchlist={() => console.log('Add to watchlist:', item.title)}
                    />
                  ))}
                </div>
              </HorizontalScrollContainer>

              {planToWatchList.length > 4 && (
                <div className="text-center">
                  <Button variant="outline" className="border-teal-500 text-teal-400 hover:bg-teal-500/20">
                    View All {planToWatchList.length} Shows
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Completed Tab - Universal Components */}
            <TabsContent value="completed" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  Completed ({completedList.length})
                </h2>
                <Button variant="outline" size="sm" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </div>

              <HorizontalScrollContainer scrollId="completed-list">
                <div className="flex space-x-4 pb-4">
                  {completedList.filter(item =>
                    item.title.toLowerCase().includes(searchQuery.toLowerCase())
                  ).slice(0, 4).map((item) => (
                    <ContentCard
                      key={item.id}
                      item={addStreamingData({
                        id: item.id,
                        title: item.title,
                        poster_path: item.poster_path,
                        vote_average: item.rating || 0,
                        overview: `${item.genre} • ${item.year} • ${item.network}`,
                        streamingPlatforms: []
                      })}
                      type="tv"
                      showStreamingLogos={true}
                      showTrailerButton={true}
                      showAffiliateLinks={true}
                      onWatchNow={() => console.log('Watch now:', item.title)}
                      onAddToWatchlist={() => console.log('Add to watchlist:', item.title)}
                    />
                  ))}
                </div>
              </HorizontalScrollContainer>

              {completedList.length > 4 && (
                <div className="text-center">
                  <Button variant="outline" className="border-teal-500 text-teal-400 hover:bg-teal-500/20">
                    View All {completedList.length} Shows
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Custom Lists Tab */}
            <TabsContent value="custom" className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Custom Lists ({customLists.length})
                </h2>
                <Button className="bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 border-teal-500/50">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New List
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customLists.map((list) => (
                  <Card key={list.id} className="glass-effect border-slate-700/50 hover:border-teal-500/50 transition-all duration-300 cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`w-3 h-3 rounded-full ${list.color}`}></div>
                        <div className="flex items-center gap-1">
                          {list.isPublic ? (
                            <Globe className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Lock className="h-4 w-4 text-gray-400" />
                          )}
                          {list.isCollaborative && (
                            <Users className="h-4 w-4 text-gray-400" />
                          )}
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-bold text-white text-lg">{list.name}</h3>
                          <p className="text-gray-400 text-sm line-clamp-2">{list.description}</p>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{list.itemCount} shows</span>
                          {list.isCollaborative && list.collaborators && (
                            <span className="text-gray-400">{list.collaborators} collaborators</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <Button size="sm" variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700 flex-1">
                            <Eye className="h-3 w-3 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                            <Share className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </div>

      {/* MobileNav removed: handled by App.tsx */}
    </div>
  );
}