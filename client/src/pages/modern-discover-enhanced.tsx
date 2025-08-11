import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TopNav } from "@/components/top-nav";
import { useAuth } from "@/hooks/useAuth";
import "../styles/discover-enhanced.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Mic,
  Star,
  TrendingUp,
  Sparkles,
  Heart,
  Zap,
  Moon,
  Sun,
  Smile,
  Skull,
  Laugh,
  Drama,
  Swords,
  Rocket,
  Plus,
  Filter,
  Play,
  Eye,
  Clock,
  Calendar,
  Bell,
  Tv,
  Film,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  ArrowRight,
  Bookmark,
  Share2,
  Info
} from "lucide-react";

// Types for better TypeScript support
interface TMDBResponse {
  results?: any[];
  total_pages?: number;
  total_results?: number;
}

interface ContentItem {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  first_air_date?: string;
  release_date?: string;
  genre_ids?: number[];
  popularity?: number;
}

// Enhanced mood filters with better categorization and icons
const moodFilters = [
  {
    id: "feelgood",
    label: "Feel Good",
    icon: Heart,
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    textColor: "text-pink-400"
  },
  {
    id: "comedy",
    label: "Comedy",
    icon: Laugh,
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    textColor: "text-yellow-400"
  },
  {
    id: "action",
    label: "Action",
    icon: Swords,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    textColor: "text-red-400"
  },
  {
    id: "drama",
    label: "Drama",
    icon: Drama,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    textColor: "text-blue-400"
  },
  {
    id: "scifi",
    label: "Sci-Fi",
    icon: Rocket,
    color: "from-purple-500 to-indigo-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    textColor: "text-purple-400"
  },
  {
    id: "dark",
    label: "Dark & Intense",
    icon: Moon,
    color: "from-gray-700 to-gray-900",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/20",
    textColor: "text-gray-400"
  },
  {
    id: "bingeable",
    label: "Binge-worthy",
    icon: Zap,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    textColor: "text-emerald-400"
  },
  {
    id: "chill",
    label: "Chill Vibes",
    icon: Sun,
    color: "from-cyan-500 to-blue-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    textColor: "text-cyan-400"
  }
];

// Enhanced skeleton components
const ContentSkeleton = () => (
  <Card className="bg-slate-800/30 border-slate-700/50 animate-pulse">
    <CardContent className="p-4">
      <div className="flex gap-4">
        <div className="w-20 h-28 bg-slate-700/50 rounded-lg"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-slate-700/50 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700/30 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-700/30 rounded"></div>
            <div className="h-3 bg-slate-700/30 rounded w-4/5"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-slate-700/30 rounded"></div>
            <div className="h-6 w-20 bg-slate-700/30 rounded"></div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const MoodFilterSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="h-12 bg-slate-700/30 rounded-xl animate-pulse"></div>
    ))}
  </div>
);

// Enhanced search suggestions
const searchSuggestions = [
  "House of the Dragon", "The Bear", "Wednesday", "Stranger Things",
  "The Last of Us", "Avatar: The Last Airbender", "Breaking Bad",
  "The Office", "Friends", "Game of Thrones"
];

export default function ModernDiscoverEnhanced() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVoiceSearch, setIsVoiceSearch] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Enhanced queries with better error handling
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["/api/content/trending-enhanced"],
    staleTime: 300000,
    retry: 2
  });

  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: ["/api/streaming/enhanced-search?type=tv"],
    staleTime: 300000,
    retry: 2
  });

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["/api/streaming/enhanced-search", searchQuery],
    queryFn: () => {
      if (!searchQuery.trim()) return Promise.resolve({ results: [] });
      return fetch(`/api/streaming/enhanced-search?query=${encodeURIComponent(searchQuery)}&mediaType=tv`).then(res => res.json());
    },
    enabled: !!searchQuery.trim(),
    staleTime: 300000
  });

  const { data: moodSpecificData, isLoading: moodLoading } = useQuery({
    queryKey: ["/api/tmdb/mood-content", selectedMood],
    queryFn: () => {
      if (!selectedMood) return Promise.resolve({ results: [] });
      return fetch(`/api/tmdb/mood-content?mood=${selectedMood}`).then(res => res.json());
    },
    enabled: !!selectedMood,
    staleTime: 300000
  });

  const { data: userPreferences } = useQuery({
    queryKey: ["/api/user-preferences"],
    enabled: !!user,
    staleTime: 600000
  });

  // Enhanced content filtering logic
  const filteredContent = useMemo(() => {
    if (searchQuery.trim() && searchData?.results) {
      return searchData.results.slice(0, 8);
    }

    if (selectedMood && moodSpecificData?.results) {
      return moodSpecificData.results.slice(0, 8);
    }

    return (trendingData as any)?.results?.slice(0, 8) || [];
  }, [searchQuery, searchData, selectedMood, moodSpecificData, trendingData]);

  // Enhanced hidden gems algorithm
  const hiddenGems = useMemo(() => {
    const allContent = [
      ...((trendingData as any)?.results || []),
      ...((popularData as any)?.results || [])
    ];

    if (!allContent.length) return [];

    return allContent
      .filter(show => {
        const rating = show.vote_average || 0;
        const popularity = show.popularity || 0;
        return rating >= 7.0 && popularity > 20 && popularity < 500;
      })
      .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
      .slice(0, 6);
  }, [trendingData, popularData]);

  // Enhanced handlers
  const handleMoodFilter = (moodId: string) => {
    setSelectedMood(selectedMood === moodId ? null : moodId);
    setActiveFilter(moodId);
    setSearchQuery("");

    // Smooth scroll to content
    setTimeout(() => {
      const contentSection = document.getElementById('filtered-content');
      contentSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setShowSearchSuggestions(true);
  };

  const handleSearchBlur = () => {
    // Delay to allow clicking on suggestions
    setTimeout(() => {
      setIsSearchFocused(false);
      setShowSearchSuggestions(false);
    }, 200);
  };

  const handleSearchSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSearchSuggestions(false);
    setSelectedMood(null);
    searchRef.current?.blur();
  };

  const handleVoiceSearch = () => {
    setIsVoiceSearch(!isVoiceSearch);
    // Voice search implementation would go here
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedMood(null);
    setActiveFilter(null);
    searchRef.current?.focus();
  };

  // Enhanced action handlers
  const handleWatchNow = (show: any) => {
    console.log("Watch now:", show.title || show.name);
    // Implementation for watch now
  };

  const handleAddToWatchlist = async (show: any) => {
    console.log("Adding to watchlist:", show.title || show.name);
    // Implementation for adding to watchlist with success animation
  };

  const handleShareContent = (show: any) => {
    const title = show.title || show.name;
    if (navigator.share) {
      navigator.share({
        title: `Check out ${title} on BingeBoard`,
        url: window.location.href
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`Check out ${title} on BingeBoard!`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <TopNav />

      <div className="pt-20 pb-24">
        <div className="container mx-auto px-4 space-y-8">

          {/* Enhanced Header with Animation */}
          <div className="text-center space-y-6 mb-12">
            <div className="flex items-center justify-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-xl blur-lg opacity-30 animate-pulse"></div>
                <div className="relative w-12 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl shadow-2xl border-2 border-slate-600">
                  <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <div className="text-lg font-black text-white drop-shadow-lg">B</div>
                  </div>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                Discover
              </h1>
            </div>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Find your next binge-worthy obsession with personalized recommendations
            </p>
          </div>

          {/* Enhanced Search Section */}
          <div className="space-y-6">
            <div className="relative max-w-2xl mx-auto">
              <div className={`relative transition-all duration-300 ${isSearchFocused ? 'transform scale-105' : ''}`}>
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 z-10" />
                <Input
                  ref={searchRef}
                  placeholder="Search shows, movies, actors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  className={`pl-12 pr-20 bg-slate-800/50 backdrop-blur-sm border-slate-600 text-white placeholder-slate-400 h-14 text-lg rounded-2xl transition-all duration-300 ${isSearchFocused ? 'border-teal-400 bg-slate-800/70 shadow-lg shadow-teal-400/20' : 'hover:border-slate-500'
                    }`}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleVoiceSearch}
                    className={`h-8 w-8 p-0 rounded-full transition-colors ${isVoiceSearch ? "text-teal-400 bg-teal-400/20" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                      }`}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Enhanced Search Suggestions */}
              {showSearchSuggestions && !searchQuery && (
                <div className="absolute top-full mt-2 w-full bg-slate-800/95 backdrop-blur-md border border-slate-600 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4">
                    <div className="text-sm text-slate-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Popular searches
                    </div>
                    <div className="space-y-1">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearchSuggestion(suggestion)}
                          className="w-full text-left px-3 py-2 text-white hover:bg-slate-700/50 rounded-lg transition-colors flex items-center gap-3"
                        >
                          <Search className="h-4 w-4 text-slate-400" />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Mood Filters */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                What's Your Mood?
              </h2>
              {activeFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedMood(null);
                    setActiveFilter(null);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  Clear Filter
                </Button>
              )}
            </div>

            {trendingLoading ? (
              <MoodFilterSkeleton />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {moodFilters.map((mood) => {
                  const Icon = mood.icon;
                  const isSelected = selectedMood === mood.id;

                  return (
                    <Button
                      key={mood.id}
                      variant="outline"
                      onClick={() => handleMoodFilter(mood.id)}
                      className={`relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 h-12 ${isSelected
                          ? `bg-gradient-to-r ${mood.color} border-transparent text-white shadow-lg`
                          : `${mood.bgColor} ${mood.borderColor} ${mood.textColor} hover:${mood.bgColor} hover:border-opacity-50`
                        }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {mood.label}
                      {isSelected && (
                        <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                      )}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Enhanced Content Display */}
          <div id="filtered-content" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  {searchQuery.trim() ? <Search className="h-4 w-4 text-white" /> :
                    selectedMood ? <Sparkles className="h-4 w-4 text-white" /> :
                      <TrendingUp className="h-4 w-4 text-white" />}
                </div>
                {searchQuery.trim() ? `Results for "${searchQuery}"` :
                  selectedMood ? `${moodFilters.find(m => m.id === selectedMood)?.label} Picks` :
                    "Trending Now"}
              </h2>

              {!searchQuery && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-800 border-slate-600">
                    <DropdownMenuItem>Highest Rated</DropdownMenuItem>
                    <DropdownMenuItem>Most Popular</DropdownMenuItem>
                    <DropdownMenuItem>Recently Added</DropdownMenuItem>
                    <DropdownMenuItem>Ending Soon</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Enhanced Content Grid */}
            <div className="space-y-4 content-grid">
              {(searchLoading || moodLoading) ? (
                Array.from({ length: 4 }).map((_, i) => <ContentSkeleton key={i} />)
              ) : filteredContent.length === 0 ? (
                <div className="text-center py-16 page-transition">
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 float">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {searchQuery.trim() ? `No results for "${searchQuery}"` : "No content available"}
                  </h3>
                  <p className="text-slate-400 mb-4">Try a different search term or explore our trending content</p>
                  {searchQuery && (
                    <Button onClick={clearSearch} className="bg-teal-500 hover:bg-teal-600 enhanced-button">
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                filteredContent.map((show: any, index: number) => (
                  <Card key={show.id} className="group discover-card glass-enhanced border-slate-700/50 hover:border-teal-500/50 transition-all duration-300 hover:bg-slate-800/50 hover:shadow-xl hover:shadow-teal-500/10">
                    <CardContent className="p-6">
                      <div className="flex gap-4 items-start">
                        {/* Enhanced Poster */}
                        <div className="relative w-24 h-36 bg-slate-700 rounded-lg flex-shrink-0 overflow-hidden group-hover:ring-2 group-hover:ring-teal-400/50 transition-all duration-300">
                          {show.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${show.poster_path}`}
                              alt={show.name || show.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-600 to-slate-700">
                              <Play className="h-8 w-8 text-slate-400 group-hover:text-white transition-colors" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                          {/* Floating rating badge */}
                          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-white font-medium">{show.vote_average?.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Enhanced Content Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-white text-lg group-hover:text-teal-300 transition-colors flex items-center gap-2">
                                {show.name || show.title}
                                {show.vote_average >= 8.0 && (
                                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs animate-pulse">
                                    <Star className="h-3 w-3 mr-1 fill-current" />
                                    Highly Rated
                                  </Badge>
                                )}
                              </h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-slate-400">
                                  {show.first_air_date ? new Date(show.first_air_date).getFullYear() :
                                    show.release_date ? new Date(show.release_date).getFullYear() : ''}
                                </span>
                                <div className="flex items-center gap-1 text-yellow-400">
                                  <Star className="h-4 w-4 fill-current" />
                                  <span className="font-medium">{show.vote_average?.toFixed(1)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="text-slate-300 text-sm line-clamp-2 leading-relaxed">
                            {show.overview}
                          </p>

                          {/* Enhanced Action Buttons */}
                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg enhanced-button transition-all duration-300 hover:scale-105"
                              onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent((show.title || show.name) + ' trailer')}`, '_blank')}
                            >
                              <Play className="h-3 w-3 mr-2" />
                              Trailer
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg enhanced-button transition-all duration-300 hover:scale-105"
                              onClick={() => handleAddToWatchlist(show)}
                            >
                              <Plus className="h-3 w-3 mr-2" />
                              Watchlist
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500 enhanced-button transition-all duration-300 hover:scale-105"
                              onClick={() => handleShareContent(show)}
                            >
                              <Share2 className="h-3 w-3 mr-2" />
                              Share
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500 enhanced-button transition-all duration-300 hover:scale-105"
                            >
                              <Info className="h-3 w-3 mr-2" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Enhanced Trending Section */}
          {!searchQuery && !selectedMood && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  What's Trending
                </h2>
                <Button variant="ghost" className="text-teal-400 hover:text-teal-300">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingLoading ? (
                  Array.from({ length: 6 }).map((_, i) => <ContentSkeleton key={i} />)
                ) : (
                  (trendingData as any)?.results?.slice(0, 6).map((show: any) => (
                    <Card key={show.id} className="group bg-slate-800/30 border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:bg-slate-800/50 hover:shadow-xl hover:shadow-purple-500/10">
                      <CardContent className="p-4">
                        <div className="aspect-video bg-slate-700 rounded-lg mb-4 overflow-hidden">
                          {show.backdrop_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w500${show.backdrop_path}`}
                              alt={show.name || show.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-600 to-slate-700">
                              <Tv className="h-8 w-8 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                          {show.name || show.title}
                        </h3>
                        <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                          {show.overview}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-medium">{show.vote_average?.toFixed(1)}</span>
                          </div>
                          <Button size="sm" variant="ghost" className="text-purple-400 hover:text-white hover:bg-purple-500/20">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Enhanced Hidden Gems */}
          {!searchQuery && !selectedMood && hiddenGems.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  Hidden Gems
                </h2>
                <Button variant="ghost" className="text-teal-400 hover:text-teal-300">
                  Discover More
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {hiddenGems.map((show: any) => (
                  <Card key={show.id} className="group bg-slate-800/20 border-slate-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:bg-slate-800/40">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <img
                          src={`https://image.tmdb.org/t/p/w92${show.poster_path}`}
                          alt={show.name || show.title}
                          className="w-16 h-24 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white text-sm mb-1 line-clamp-1 group-hover:text-emerald-300 transition-colors">
                            {show.name || show.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Star className="h-3 w-3 fill-current" />
                              <span className="text-xs font-medium">{show.vote_average?.toFixed(1)}</span>
                            </div>
                            <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                              Hidden Gem
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-xs line-clamp-2">
                            {show.overview}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
