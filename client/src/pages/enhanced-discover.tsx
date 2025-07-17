import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import StreamingAvailability from "@/components/StreamingAvailability";
import { useAuth } from "@/hooks/useAuth";
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
  Laugh,
  Drama,
  Swords,
  Rocket,
  Plus,
  Filter,
  Play,
  Eye,
  Calendar,
  Bell,
  Tv,
  Film,
  X,
  Loader2,
  ArrowRight,
  Flame,
  Crown,
  ChevronRight
} from "lucide-react";

// Enhanced mood filters with modern design
const moodFilters = [
  {
    id: "light",
    label: "Light & Fun",
    icon: Sun,
    gradient: "from-yellow-400 via-orange-400 to-orange-500",
    description: "Comedy & feel-good shows",
    count: "2.1k"
  },
  {
    id: "bingeable",
    label: "Bingeable",
    icon: Zap,
    gradient: "from-orange-500 via-red-500 to-pink-500",
    description: "Can't-stop-watching series",
    count: "850"
  },
  {
    id: "feelgood",
    label: "Feel-Good",
    icon: Heart,
    gradient: "from-pink-500 via-rose-500 to-red-500",
    description: "Uplifting & heartwarming",
    count: "1.5k"
  },
  {
    id: "dark",
    label: "Dark & Intense",
    icon: Moon,
    gradient: "from-purple-600 via-indigo-600 to-blue-600",
    description: "Thrillers & dark dramas",
    count: "920"
  },
  {
    id: "comedy",
    label: "Comedy",
    icon: Laugh,
    gradient: "from-green-400 via-emerald-500 to-teal-500",
    description: "Laugh-out-loud moments",
    count: "1.8k"
  },
  {
    id: "drama",
    label: "Drama",
    icon: Drama,
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    description: "Emotional storytelling",
    count: "2.5k"
  },
  {
    id: "action",
    label: "Action",
    icon: Swords,
    gradient: "from-red-500 via-pink-500 to-purple-500",
    description: "High-octane adventures",
    count: "1.2k"
  },
  {
    id: "scifi",
    label: "Sci-Fi",
    icon: Rocket,
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    description: "Future & beyond",
    count: "680"
  },
];

const trendingSearches = [
  "House of the Dragon", "The Bear", "Wednesday", "Stranger Things", "The Last of Us", "Avatar"
];

// Skeleton loading component
const ContentSkeleton = () => (
  <div className="animate-pulse">
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="w-24 h-36 bg-slate-700 rounded-xl"></div>
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            <div className="h-4 bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-slate-700 rounded w-20"></div>
              <div className="h-8 bg-slate-700 rounded w-24"></div>
              <div className="h-8 bg-slate-700 rounded w-28"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Mock data for demonstration
const mockTrendingData = [
  {
    id: 1,
    name: "House of the Dragon",
    overview: "The Targaryen civil war comes to the Seven Kingdoms.",
    poster_path: "/z2yahl2uefxDCl0nogcRBstwruJ.jpg",
    vote_average: 8.4,
    first_air_date: "2022-08-21",
    genre_ids: [18, 10759, 9648]
  },
  {
    id: 2,
    name: "The Bear",
    overview: "A young chef from the fine dining world comes home to Chicago to run his family sandwich shop.",
    poster_path: "/sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg",
    vote_average: 8.7,
    first_air_date: "2022-06-23",
    genre_ids: [35, 18]
  },
  {
    id: 3,
    name: "Wednesday",
    overview: "Smart, sarcastic and a little dead inside, Wednesday Addams investigates a murder spree while making new friends.",
    poster_path: "/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
    vote_average: 8.5,
    first_air_date: "2022-11-23",
    genre_ids: [35, 80, 9648]
  },
  {
    id: 4,
    name: "Stranger Things",
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments.",
    poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    vote_average: 8.7,
    first_air_date: "2016-07-15",
    genre_ids: [18, 10765, 9648]
  }
];

export default function ModernDiscover() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isVoiceSearch, setIsVoiceSearch] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { user } = useAuth();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Mock API calls - replace with real API calls
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["/api/tmdb/trending"],
    queryFn: () => Promise.resolve({ results: mockTrendingData }),
    staleTime: 300000
  });

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["/api/tmdb/search", debouncedSearchQuery],
    queryFn: () => {
      if (!debouncedSearchQuery.trim()) return null;
      // Mock search results
      return Promise.resolve({
        results: mockTrendingData.filter(show =>
          show.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        )
      });
    },
    enabled: !!debouncedSearchQuery.trim(),
    staleTime: 300000
  });

  const { data: moodData, isLoading: moodLoading } = useQuery({
    queryKey: ["/api/tmdb/mood-content", selectedMood],
    queryFn: () => {
      if (!selectedMood) return null;
      // Mock mood-based results
      return Promise.resolve({ results: mockTrendingData });
    },
    enabled: !!selectedMood,
    staleTime: 300000
  });

  const handleMoodFilter = (moodId: string) => {
    setSelectedMood(selectedMood === moodId ? null : moodId);
  };

  const handleVoiceSearch = () => {
    setIsVoiceSearch(!isVoiceSearch);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  const handleWatchNow = (show: any) => {
    console.log("Opening watch options for:", show.name);
  };

  const handleAddToWatchlist = (show: any) => {
    console.log("Adding to watchlist:", show.name);
  };

  // Determine what content to show
  const getDisplayContent = () => {
    if (debouncedSearchQuery.trim() && searchData?.results) {
      return { content: searchData.results, title: `Search Results for "${debouncedSearchQuery}"`, icon: Search };
    }
    if (selectedMood && moodData?.results) {
      const mood = moodFilters.find(m => m.id === selectedMood);
      return { content: moodData.results, title: `${mood?.label} Picks`, icon: mood?.icon };
    }
    return { content: trendingData?.results || [], title: "Top Picks Today", icon: TrendingUp };
  };

  const { content, title, icon: TitleIcon } = getDisplayContent();
  const isLoading = trendingLoading || searchLoading || moodLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 pb-16 sm:pb-24">
        <div className="container mx-auto px-4 space-y-8 sm:space-y-12">

          {/* Enhanced Hero Header - Mobile optimized */}
          <div className="text-center space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 group">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Discover What to
              </h1>
              <div className="flex items-center gap-2">
                {/* Enhanced BingeBoard Logo - Smaller on mobile */}
                <div className="relative">
                  <div className="w-10 h-8 sm:w-12 sm:h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl shadow-2xl border-2 border-slate-600 relative group-hover:scale-110 transition-transform duration-500">
                    <div className="absolute inset-1 bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-base sm:text-lg font-black text-white drop-shadow-lg">B</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                </div>
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent font-black text-4xl md:text-5xl lg:text-6xl">
                  inge
                </span>
              </div>
            </div>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Discover your next obsession with AI-powered recommendations tailored just for you
            </p>
          </div>

          {/* Enhanced Search Section - Mobile optimized */}
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
            <div className={`relative transition-all duration-500 ${isSearchFocused ? 'transform scale-105' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 rounded-2xl blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <div className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-2 group hover:border-teal-400/50 transition-all duration-300">
                <div className="flex items-center gap-2 sm:gap-4">
                  <Search className="ml-2 sm:ml-4 h-5 w-5 sm:h-6 sm:w-6 text-slate-400 group-hover:text-teal-400 transition-colors duration-300 flex-shrink-0" />
                  <Input
                    placeholder="Search shows, movies, actors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="flex-1 bg-transparent border-0 text-white placeholder-slate-400 text-base sm:text-lg focus:ring-0 focus:outline-none"
                  />
                  <div className="flex items-center gap-1 sm:gap-2 mr-1 sm:mr-2">
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="p-2 hover:bg-slate-700/50 rounded-xl transition-all duration-200 group"
                      >
                        <X className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-hover:text-white transition-colors duration-200" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleVoiceSearch}
                      className={`p-2 sm:p-3 rounded-xl transition-all duration-300 ${isVoiceSearch
                          ? "text-teal-400 bg-teal-400/10 ring-2 ring-teal-400/30"
                          : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                        }`}
                    >
                      <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Search Loading Indicator */}
              {searchLoading && debouncedSearchQuery && (
                <div className="absolute top-full left-0 right-0 mt-4 p-4 bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Loader2 className="h-5 w-5 animate-spin text-teal-400" />
                    <span>Searching for "{debouncedSearchQuery}"...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Trending Search Terms */}
            {!searchQuery && (
              <div className="text-center space-y-4">
                <p className="text-sm text-slate-400 font-medium">Trending searches:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {trendingSearches.map((term, index) => (
                    <Button
                      key={term}
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery(term)}
                      className="bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-teal-500/10 hover:border-teal-400/50 hover:text-teal-300 transition-all duration-300 rounded-full px-4 py-2 hover:scale-105"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Mood Filters */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                What's Your Mood?
              </h2>
              <Button
                variant="ghost"
                className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {moodFilters.map((mood, index) => {
                const Icon = mood.icon;
                const isSelected = selectedMood === mood.id;

                return (
                  <Button
                    key={mood.id}
                    variant="outline"
                    onClick={() => handleMoodFilter(mood.id)}
                    className={`relative h-auto p-4 flex flex-col items-center gap-3 bg-slate-800/50 border-slate-700/50 hover:scale-105 transition-all duration-500 rounded-2xl group overflow-hidden ${isSelected
                        ? `bg-gradient-to-br ${mood.gradient} text-white border-transparent shadow-2xl shadow-current/20`
                        : "hover:bg-slate-700/50 hover:border-slate-600/50"
                      }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Background gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${mood.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                    <Icon className={`h-6 w-6 transition-all duration-300 ${isSelected ? "text-white" : "text-slate-300 group-hover:text-white"
                      }`} />

                    <div className="text-center space-y-1 relative z-10">
                      <div className={`text-sm font-semibold transition-colors duration-300 ${isSelected ? "text-white" : "text-slate-300 group-hover:text-white"
                        }`}>
                        {mood.label}
                      </div>
                      <div className={`text-xs transition-colors duration-300 ${isSelected ? "text-white/80" : "text-slate-400 group-hover:text-slate-300"
                        }`}>
                        {mood.count} shows
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute inset-0 ring-2 ring-white/30 rounded-2xl"></div>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Enhanced Content Display */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white flex items-center gap-4">
                {TitleIcon && (
                  <div className={`w-10 h-10 bg-gradient-to-br ${selectedMood ? moodFilters.find(m => m.id === selectedMood)?.gradient : 'from-orange-500 to-red-500'
                    } rounded-xl flex items-center justify-center shadow-lg`}>
                    <TitleIcon className="h-5 w-5 text-white" />
                  </div>
                )}
                {title}
              </h2>

              {!debouncedSearchQuery && !selectedMood && (
                <Button
                  variant="ghost"
                  className="text-teal-400 hover:text-teal-300 transition-colors duration-200 flex items-center gap-2"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Content Grid */}
            <div className="space-y-6">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <ContentSkeleton key={i} />
                ))
              ) : content.length === 0 ? (
                <div className="text-center py-16 space-y-6">
                  <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto">
                    <Search className="h-10 w-10 text-slate-500" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-white">
                      {debouncedSearchQuery ? `No results found for "${debouncedSearchQuery}"` : "No content available"}
                    </h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                      {debouncedSearchQuery
                        ? "Try adjusting your search terms or browse our trending content below"
                        : "Check back later for new recommendations"
                      }
                    </p>
                  </div>
                  {debouncedSearchQuery && (
                    <Button
                      onClick={clearSearch}
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                content.slice(0, 6).map((show: any, index: number) => (
                  <Card
                    key={show.id}
                    className="group bg-slate-800/30 backdrop-blur-sm border-slate-700/50 hover:border-teal-400/50 hover:bg-slate-800/50 transition-all duration-500 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-teal-400/10"
                    style={{
                      animationDelay: `${index * 150}ms`,
                      animation: 'fadeInUp 0.6s ease-out both'
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-6 items-start">
                        {/* Enhanced Poster */}
                        <div className="relative flex-shrink-0">
                          <div className="w-28 h-40 bg-slate-700 rounded-2xl overflow-hidden group-hover:ring-2 group-hover:ring-teal-400/50 transition-all duration-500 hover:scale-105">
                            {show.poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w300${show.poster_path}`}
                                alt={show.name || show.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                                <Play className="h-12 w-12 text-slate-500 group-hover:text-white transition-colors duration-300" />
                              </div>
                            )}
                          </div>

                          {/* Trending badge */}
                          <div className="absolute -top-2 -right-2">
                            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg animate-pulse px-2 py-1">
                              <Flame className="h-3 w-3 mr-1" />
                              Hot
                            </Badge>
                          </div>
                        </div>

                        {/* Enhanced Content Info */}
                        <div className="flex-1 space-y-4">
                          <div className="space-y-3">
                            <h3 className="font-bold text-white text-2xl group-hover:text-teal-300 transition-colors duration-300 leading-tight">
                              {show.name || show.title}
                            </h3>

                            <div className="flex items-center gap-4 flex-wrap">
                              <span className="text-slate-400 font-medium">
                                {show.first_air_date ? new Date(show.first_air_date).getFullYear() :
                                  show.release_date ? new Date(show.release_date).getFullYear() : ''}
                              </span>

                              <div className="flex items-center gap-1 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold text-yellow-400">{show.vote_average?.toFixed(1)}</span>
                              </div>

                              <Badge variant="outline" className="border-slate-600 text-slate-300 bg-slate-800/50">
                                {show.media_type || 'TV Series'}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-slate-300 text-base leading-relaxed line-clamp-3">
                            {show.overview}
                          </p>

                          {/* Streaming Availability */}
                          <div className="py-3">
                            <StreamingAvailability
                              title={show.title || show.name}
                              compact={false}
                              className="space-y-2"
                            />
                          </div>

                          {/* Enhanced Action Buttons */}
                          <div className="flex items-center gap-3 pt-4">
                            <Button
                              size="default"
                              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6"
                              onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent((show.title || show.name) + ' trailer')}`, '_blank')}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Watch Trailer
                            </Button>

                            <Button
                              size="default"
                              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6"
                              onClick={() => handleAddToWatchlist(show)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add to List
                            </Button>

                            <Button
                              variant="outline"
                              size="default"
                              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 transition-all duration-300 hover:scale-105 px-6"
                              onClick={() => handleWatchNow(show)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Watch Now
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

          {/* Additional Trending Section (if not searching/filtering) */}
          {!debouncedSearchQuery && !selectedMood && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  Hidden Gems
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-3 py-1">
                    AI Curated
                  </Badge>
                </h2>
                <Button
                  variant="ghost"
                  className="text-teal-400 hover:text-teal-300 transition-colors duration-200 flex items-center gap-2"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Horizontal scrolling content cards */}
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {mockTrendingData.map((show, index) => (
                  <Card
                    key={`hidden-${show.id}`}
                    className="flex-shrink-0 w-80 bg-slate-800/30 backdrop-blur-sm border-slate-700/50 hover:border-purple-400/50 hover:bg-slate-800/50 transition-all duration-300 rounded-2xl overflow-hidden group"
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={`https://image.tmdb.org/t/p/w200${show.poster_path}`}
                          alt={show.name}
                          className="w-16 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="flex-1 space-y-2">
                          <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors duration-300">
                            {show.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-yellow-400 font-medium">{show.vote_average}</span>
                          </div>
                          <p className="text-sm text-slate-300 line-clamp-2">{show.overview}</p>

                          {/* Streaming Availability */}
                          <div className="py-2">
                            <StreamingAvailability
                              title={show.name}
                              compact={true}
                              className="text-xs"
                            />
                          </div>

                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white w-full mt-2"
                            onClick={() => handleAddToWatchlist(show)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add to List
                          </Button>
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

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
