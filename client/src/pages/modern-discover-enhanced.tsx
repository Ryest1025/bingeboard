import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useQueries } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TopNav } from '@/components/top-nav';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { EnhancedShowCard } from '../components/EnhancedShowCard';
import '../styles/discover-enhanced.css';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Mic,
  Star,
  TrendingUp,
  Plus,
  Filter,
  Play,
  X,
  ArrowRight,
  Share2,
  Info,
  Tv,
  Calendar,
} from 'lucide-react';

// Types
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
  streaming_platform?: string;
  streaming_platforms?: { provider_name: string; logo_path?: string }[];
  award_won?: string[];
  award_nominated?: string[];
}

interface SearchResponse {
  results: ContentItem[];
}



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



// Enhanced search suggestions - memoized to prevent re-creation on every render
const searchSuggestions = [
  'House of the Dragon',
  'The Bear',
  'Wednesday',
  'Stranger Things',
  'The Last of Us',
  'Avatar: The Last Airbender',
  'Breaking Bad',
  'The Office',
  'Friends',
  'Game of Thrones',
] as const;

// Platform logos and configuration
// Platform logo configuration with image URLs and emoji fallbacks
const PLATFORM_LOGOS: Record<string, { logo: string; emoji: string; color: string }> = {
  'Netflix': { 
    logo: 'https://logoeps.com/wp-content/uploads/2013/03/netflix-vector-logo.png',
    emoji: '🔴',
    color: 'bg-red-600'
  },
  'Disney+': { 
    logo: 'https://cnbl-cdn.bamgrid.com/assets/7ecc8bcb60ad77193058d63e321bd1fd.png',
    emoji: '🏰',
    color: 'bg-blue-600'
  },
  'HBO Max': { 
    logo: 'https://logos-world.net/wp-content/uploads/2021/08/HBO-Max-Logo.png',
    emoji: '🎬',
    color: 'bg-purple-600'
  },
  'Amazon Prime Video': { 
    logo: 'https://m.media-amazon.com/images/G/01/digital/video/web/Logo-min.png',
    emoji: '📦',
    color: 'bg-blue-500'
  },
  'Apple TV+': { 
    logo: 'https://www.apple.com/apple-tv-plus/shared/images/meta/apple-tv-plus__b64h3z4x9yuu_og.png',
    emoji: '🍎',
    color: 'bg-gray-800'
  },
  'Hulu': { 
    logo: 'https://logos-world.net/wp-content/uploads/2020/05/Hulu-Logo.png',
    emoji: '🟢',
    color: 'bg-green-500'
  },
  'Paramount+': { 
    logo: 'https://logoeps.com/wp-content/uploads/2021/05/paramount-plus-vector-logo.png',
    emoji: '⛰️',
    color: 'bg-blue-500'
  },
  'Peacock': { 
    logo: 'https://logos-world.net/wp-content/uploads/2021/02/Peacock-Logo.png',
    emoji: '🦚',
    color: 'bg-indigo-600'
  },
} as const;

// Platform Logo Component with fallback
interface PlatformLogoProps {
  platform: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PlatformLogo: React.FC<PlatformLogoProps> = ({ platform, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const logoConfig = PLATFORM_LOGOS[platform];
  
  if (!logoConfig) {
    return <span className={className}>📺</span>;
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  if (imageError) {
    return <span className={className}>{logoConfig.emoji}</span>;
  }

  return (
    <img
      src={logoConfig.logo}
      alt={`${platform} logo`}
      className={`${sizeClasses[size]} object-contain ${className}`}
      onError={() => setImageError(true)}
      onLoad={() => setImageError(false)}
    />
  );
};

// Genre mapping for better display
const GENRE_MAP: Record<number, string> = {
  10759: 'Action & Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  10762: 'Kids',
  9648: 'Mystery',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
  37: 'Western',
  28: 'Action',
  12: 'Adventure',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
};

export default function ModernDiscoverEnhanced() {
  // Local storage keys for persistence
  const PREFERENCES_KEY = 'bingeboard-discover-preferences';
  
  // Helper functions for localStorage
  const loadPreferences = () => {
    try {
      const saved = localStorage.getItem(PREFERENCES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const savePreferences = (prefs: any) => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    } catch {
      // Silently fail if localStorage is not available
    }
  };

  // Load initial preferences
  const initialPrefs = loadPreferences();

  // State management with localStorage persistence
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isVoiceSearch, setIsVoiceSearch] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(initialPrefs.selectedNetwork || null);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(initialPrefs.selectedGenre || null);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Debounce search query to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);



  // Batched main data queries for better performance
  const queries = useQueries({
    queries: [
      {
        queryKey: ['/api/content/trending-by-network'],
        queryFn: async () => {
          const response = await fetch('/api/content/trending-by-network');
          if (!response.ok) {
            throw new Error(`Failed to load trending content: ${response.status}`);
          }
          return response.json();
        },
        staleTime: 300000,
        retry: 2,
        initialData: null,

      },
      {
        queryKey: ['/api/content/upcoming'],
        queryFn: async () => {
          const response = await fetch('/api/content/upcoming');
          if (!response.ok) {
            throw new Error(`Failed to load upcoming content: ${response.status}`);
          }
          return response.json();
        },
        staleTime: 300000,
        retry: 2,
        initialData: { results: [] },

      },
    ],
  });

  const [trendingQuery, upcomingQuery] = queries;
  const trendingByNetwork = trendingQuery.data;
  const trendingLoading = trendingQuery.isLoading;
  const trendingError = trendingQuery.error;
  const upcomingData = upcomingQuery.data;
  const upcomingLoading = upcomingQuery.isLoading;
  const upcomingError = upcomingQuery.error;

  const { data: searchData, isLoading: searchLoading, error: searchError } = useQuery<SearchResponse>({
    queryKey: ['/api/streaming/enhanced-search', debouncedSearchQuery],
    queryFn: async (): Promise<SearchResponse> => {
      if (!debouncedSearchQuery.trim()) return Promise.resolve({ results: [] });
      const response = await fetch(
        `/api/streaming/enhanced-search?query=${encodeURIComponent(debouncedSearchQuery)}&mediaType=tv`
      );
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!debouncedSearchQuery.trim(),
    staleTime: 300000,
  });

  // Handle all API errors with comprehensive error handling
  useEffect(() => {
    if (searchError) {
      toast({
        title: "Search failed",
        description: `Unable to search for "${debouncedSearchQuery}". Please try again.`,
        variant: "destructive",
      });
    }
  }, [searchError, debouncedSearchQuery, toast]);

  useEffect(() => {
    if (trendingError) {
      toast({
        title: "Failed to load trending content",
        description: "Unable to fetch trending shows. Some content may be unavailable.",
        variant: "destructive",
      });
    }
  }, [trendingError, toast]);

  useEffect(() => {
    if (upcomingError) {
      toast({
        title: "Failed to load upcoming releases",
        description: "Unable to fetch upcoming shows. Please check back later.",
        variant: "destructive",
      });
    }
  }, [upcomingError, toast]);



  // Filter data queries
  const { data: networksData, error: networksError } = useQuery({
    queryKey: ['/api/content/networks'],
    queryFn: async () => {
      const response = await fetch('/api/content/networks');
      if (!response.ok) throw new Error(`Failed to load networks: ${response.status}`);
      return response.json();
    },
    staleTime: 600000,
    initialData: [],
  });

  // Dynamic search suggestions
  const { data: trendingSearches } = useQuery({
    queryKey: ['/api/content/trending-searches'],
    queryFn: async () => {
      const response = await fetch('/api/content/trending-searches');
      if (!response.ok) return searchSuggestions;
      const data = await response.json();
      return data.searches || searchSuggestions;
    },
    staleTime: 1800000, // 30 minutes
    initialData: searchSuggestions,
  });

  const { data: genresData, error: genresError } = useQuery({
    queryKey: ['/api/content/genres'],
    queryFn: async () => {
      const response = await fetch('/api/content/genres');
      if (!response.ok) throw new Error(`Failed to load genres: ${response.status}`);
      return response.json();
    },
    staleTime: 600000,
    initialData: [],
  });

  // Handle filter data errors
  useEffect(() => {
    if (networksError) {
      toast({
        title: "Failed to load streaming networks",
        description: "Network filters may not be available right now.",
        variant: "destructive",
      });
    }
  }, [networksError, toast]);

  useEffect(() => {
    if (genresError) {
      toast({
        title: "Failed to load genres",
        description: "Genre filters may not be available right now.",
        variant: "destructive",
      });
    }
  }, [genresError, toast]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    const preferences = {
      selectedNetwork,
      selectedGenre,
      timestamp: Date.now()
    };
    savePreferences(preferences);
  }, [selectedNetwork, selectedGenre]);

  // Seasonal header colors (optional enhancement)
  const getSeasonalColor = () => {
    const month = new Date().getMonth();
    switch (Math.floor(month / 3)) {
      case 0: return 'from-blue-600 to-cyan-600'; // Winter
      case 1: return 'from-green-600 to-emerald-600'; // Spring
      case 2: return 'from-orange-600 to-red-600'; // Summer
      case 3: return 'from-amber-600 to-orange-600'; // Fall
      default: return 'from-teal-600 to-cyan-600';
    }
  };

  // Filtered content for search
  const filteredContent = useMemo(() => {
    if (debouncedSearchQuery.trim() && searchData?.results) {
      return searchData.results.slice(0, 8);
    }
    return [];
  }, [debouncedSearchQuery, searchData]);

  // Filtered trending by network - optimized with better memoization
  const filteredTrending = useMemo(() => {
    if (!trendingByNetwork) return {};
    
    // If no filters are applied, return all data (limited to 10 per network)
    if (!selectedNetwork && !selectedGenre) {
      const result: Record<string, ContentItem[]> = {};
      Object.entries(trendingByNetwork).forEach(([network, shows]) => {
        const showsArray = shows as ContentItem[];
        result[network] = showsArray.slice(0, 10);
      });
      return result;
    }
    
    const result: Record<string, ContentItem[]> = {};
    
    Object.entries(trendingByNetwork).forEach(([network, shows]) => {
      // Early return if network filter doesn't match
      if (selectedNetwork && selectedNetwork !== network) return;
      
      const showsArray = shows as ContentItem[];
      let filtered = showsArray;
      
      // Apply genre filter if selected
      if (selectedGenre) {
        filtered = filtered.filter((show: ContentItem) => 
          show.genre_ids?.includes(selectedGenre)
        );
      }
      
      if (filtered.length > 0) {
        result[network] = filtered.slice(0, 10);
      }
    });
    
    return result;
  }, [trendingByNetwork, selectedNetwork, selectedGenre]);

  // Filtered upcoming releases
  const filteredUpcoming = useMemo(() => {
    if (!upcomingData?.results) return [];
    
    return (upcomingData.results as ContentItem[])
      .filter((show: ContentItem) => !selectedNetwork || show.streaming_platform === selectedNetwork)
      .filter((show: ContentItem) => !selectedGenre || show.genre_ids?.includes(selectedGenre))
      .slice(0, 12);
  }, [upcomingData, selectedNetwork, selectedGenre]);

  // Handlers
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setShowSearchSuggestions(true);
  };

  const handleSearchBlur = (e: React.FocusEvent) => {
    // Check if focus is moving to a suggestion button
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget?.closest('[data-search-suggestions]')) {
      return; // Don't close if focusing on a suggestion
    }
    setIsSearchFocused(false);
    setShowSearchSuggestions(false);
  };

  const handleSearchSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSearchSuggestions(false);
    searchRef.current?.blur();
  };

  const handleVoiceSearch = () => {
    setIsVoiceSearch(!isVoiceSearch);
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchRef.current?.focus();
  };

  const clearFilters = () => {
    setSelectedNetwork(null);
    setSelectedGenre(null);
  };

  const handleAddToWatchlist = useCallback((show: ContentItem) => {
    console.log('Adding to watchlist:', show.title || show.name);
    // TODO: Implement actual watchlist API call
  }, []);

  const handleShareContent = useCallback((show: ContentItem) => {
    const title = show.title || show.name;
    if (navigator.share) {
      navigator.share({
        title: `Check out ${title} on BingeBoard`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`Check out ${title} on BingeBoard!`);
    }
  }, []);

  const handleCardClick = useCallback((show: ContentItem) => {
    // Navigate to show details page
    const showId = show.id;
    const showType = show.name ? 'tv' : 'movie'; // Basic detection based on whether it has a 'name' (TV) or 'title' (movie)
    const path = `/show/${showType}/${showId}`;
    
    // Use wouter navigation
    setLocation(path);
  }, [setLocation]);

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
                    <div className="text-lg font-black text-white drop-shadow-lg">
                      B
                    </div>
                  </div>
                </div>
              </div>
              <h1 className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${getSeasonalColor()} via-white to-teal-200 bg-clip-text text-transparent`}>
                Discover
              </h1>
            </div>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Find your next binge-worthy obsession with personalized
              recommendations
            </p>

            {/* Award Season Banner */}
            {new Date().getMonth() + 1 >= 1 && new Date().getMonth() + 1 <= 3 && (
              <div className="max-w-4xl mx-auto mt-8">
                <div className="bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full p-2">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-yellow-400">🏆 Award Season Special</h3>
                  </div>
                  <p className="text-slate-300 text-center">
                    Discover Oscar winners, Emmy nominees, and critically acclaimed shows highlighted throughout our listings
                  </p>
                  <div className="flex justify-center gap-2 mt-4">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">
                      🏆 Winners
                    </Badge>
                    <Badge className="bg-gradient-to-r from-gray-600 to-gray-700 text-white border border-gray-500">
                      🎯 Nominees
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Search Section */}
          <div className="space-y-6">
            <div className="relative max-w-2xl mx-auto">
              <div
                className={`relative transition-all duration-300 ${isSearchFocused ? 'transform scale-105' : ''}`}
              >
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 z-10" />
                <Input
                  ref={searchRef}
                  placeholder="Search shows, movies, actors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  aria-label="Search for shows, movies, or actors"
                  role="searchbox"
                  aria-describedby="search-description"
                  className={`pl-12 pr-20 bg-slate-800/50 backdrop-blur-sm border-slate-600 text-white placeholder-slate-400 h-14 text-lg rounded-2xl transition-all duration-300 ${
                    isSearchFocused
                      ? 'border-teal-400 bg-slate-800/70 shadow-lg shadow-teal-400/20'
                      : 'hover:border-slate-500'
                  }`}
                />
                <div id="search-description" className="sr-only">
                  Type to search for shows, movies, or actors. Use voice search or browse trending content.
                </div>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleVoiceSearch}
                    className={`h-8 w-8 p-0 rounded-full transition-colors ${
                      isVoiceSearch
                        ? 'text-teal-400 bg-teal-400/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                    aria-label={isVoiceSearch ? 'Stop voice search' : 'Start voice search'}
                    aria-pressed={isVoiceSearch}
                  >
                    <Mic className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {/* Enhanced Search Suggestions */}
              {showSearchSuggestions && !searchQuery && (
                <div 
                  className="absolute top-full mt-2 w-full bg-slate-800/95 backdrop-blur-md border border-slate-600 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in"
                  data-search-suggestions
                >
                  <div className="p-4 space-y-4">
                    {/* Categories Section */}
                    <div>
                      <div className="text-sm text-slate-400 mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Quick Categories
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['Trending Now', 'Award Winners', 'New Releases', 'Popular Tonight'].map((category, index) => (
                          <button
                            key={`category-${category}-${index}`}
                            type="button"
                            onClick={() => handleSearchSuggestion(category)}
                            onMouseDown={(e) => e.preventDefault()}
                            className="text-left px-3 py-2 text-white hover:bg-slate-700/50 rounded-lg transition-colors flex items-center gap-2 text-sm"
                          >
                            <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Popular Searches */}
                    <div>
                      <div className="text-sm text-slate-400 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Popular searches
                      </div>
                      <div className="space-y-1">
                        {trendingSearches?.slice(0, 6).map((suggestion: string, index: number) => (
                          <button
                            key={`suggestion-${suggestion}-${index}`}
                            type="button"
                            onClick={() => handleSearchSuggestion(suggestion)}
                            onMouseDown={(e) => e.preventDefault()}
                            className="w-full text-left px-3 py-2 text-white hover:bg-slate-700/50 rounded-lg transition-colors flex items-center gap-3"
                          >
                            <Search className="h-4 w-4 text-slate-400" />
                            <span className="flex-1">{suggestion}</span>
                            {index < 3 && (
                              <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-300 border-orange-500/30">
                                Hot
                              </Badge>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Filters */}
          {!searchQuery && (
            <div className="flex flex-wrap gap-4 mb-6 justify-center" role="toolbar" aria-label="Content filters">
              {/* Network Filter */}
              <DropdownMenu onOpenChange={setIsNetworkDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    aria-label={`Filter by streaming network. Currently selected: ${selectedNetwork || 'All Networks'}`}
                    aria-haspopup="true"
                    aria-expanded={isNetworkDropdownOpen}
                    type="button"
                  >
                    <span className="mr-2" aria-hidden="true">
                      {selectedNetwork ? <PlatformLogo platform={selectedNetwork} size="sm" /> : '📺'}
                    </span>
                    {selectedNetwork || 'All Networks'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-600" role="menu">
                  <DropdownMenuItem 
                    onClick={() => setSelectedNetwork(null)}
                    role="menuitem"
                    className="flex items-center gap-2"
                  >
                    <span>📺</span>
                    All Networks
                  </DropdownMenuItem>
                  {networksData?.map((network: string) => (
                    <DropdownMenuItem
                      key={network}
                      onClick={() => setSelectedNetwork(network)}
                      role="menuitem"
                      className="flex items-center gap-2"
                    >
                      <PlatformLogo platform={network} size="sm" />
                      {network}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Genre Filter */}
              <DropdownMenu onOpenChange={setIsGenreDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    aria-label={`Filter by genre. Currently selected: ${selectedGenre ? genresData?.find((g: { id: number; name: string }) => g.id === selectedGenre)?.name : 'All Genres'}`}
                    aria-haspopup="true"
                    aria-expanded={isGenreDropdownOpen}
                    type="button"
                  >
                    <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
                    {selectedGenre ? genresData?.find((g: { id: number; name: string }) => g.id === selectedGenre)?.name : 'All Genres'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-600 max-h-64 overflow-y-auto" role="menu">
                  <DropdownMenuItem 
                    onClick={() => setSelectedGenre(null)}
                    role="menuitem"
                  >
                    All Genres
                  </DropdownMenuItem>
                  {genresData?.map((genre: { id: number; name: string }) => (
                    <DropdownMenuItem
                      key={genre.id}
                      onClick={() => setSelectedGenre(genre.id)}
                      role="menuitem"
                    >
                      {genre.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Clear Filters */}
              {(selectedNetwork || selectedGenre) && (
                <Button 
                  variant="ghost" 
                  onClick={clearFilters}
                  className="text-teal-400 hover:text-teal-300 hover:bg-teal-400/10"
                  aria-label="Clear all active filters"
                >
                  <X className="h-4 w-4 mr-2" aria-hidden="true" />
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* Applied Filter Chips */}
          {!searchQuery && (selectedNetwork || selectedGenre) && (
            <div className="flex flex-wrap gap-2 justify-center animate-fade-in">
              <div className="text-sm text-slate-400 flex items-center gap-2">
                <span>Active filters:</span>
                <div className="flex items-center gap-1 text-xs text-teal-400 opacity-75">
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"></div>
                  Preferences saved
                </div>
                {selectedNetwork && (
                  <Badge 
                    variant="secondary" 
                    className="bg-blue-500/20 text-blue-300 border-blue-500/30 cursor-pointer hover:bg-blue-500/30 transition-colors flex items-center gap-1"
                    onClick={() => setSelectedNetwork(null)}
                  >
                    {selectedNetwork && <PlatformLogo platform={selectedNetwork} size="sm" className="mr-1" />}
                    {selectedNetwork}
                    <X className="h-3 w-3 ml-1 hover:text-blue-100" />
                  </Badge>
                )}
                {selectedGenre && genresData && (
                  <Badge 
                    variant="secondary" 
                    className="bg-purple-500/20 text-purple-300 border-purple-500/30 cursor-pointer hover:bg-purple-500/30 transition-colors flex items-center gap-1"
                    onClick={() => setSelectedGenre(null)}
                  >
                    {genresData.find((g: { id: number; name: string }) => g.id === selectedGenre)?.name}
                    <X className="h-3 w-3 ml-1 hover:text-purple-100" />
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchQuery && (
            <div id="filtered-content" className="space-y-6" aria-live="polite">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Search className="h-4 w-4 text-white" />
                  </div>
                  Results for "{searchQuery}"
                </h2>
              </div>

              {/* Search Content Grid */}
              <div className="space-y-4 content-grid animate-fade-in">
                {searchLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <ContentSkeleton key={`search-skeleton-${i}`} />
                  ))
                ) : filteredContent.length === 0 ? (
                  <div className="text-center py-16 page-transition">
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full animate-pulse opacity-60"></div>
                      <div className="relative w-32 h-32 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center">
                        <div className="text-4xl">🤷‍♂️</div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-3 animate-fade-in">
                      No shows found for "{searchQuery}"
                    </h3>
                    <p className="text-slate-400 mb-6 animate-fade-in-delay max-w-md mx-auto">
                      Don't give up! Try searching for actors, directors, or different keywords.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                      <Button
                        onClick={clearSearch}
                        className="bg-teal-500 hover:bg-teal-600 enhanced-button transform hover:scale-105 transition-all duration-200"
                      >
                        Try New Search
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSearchSuggestion('Trending Now')}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Discover AI Picks
                      </Button>
                    </div>
                    <div className="mt-6 text-sm text-slate-500">
                      Popular right now: 
                      {trendingSearches?.slice(0, 3).map((suggestion: string, index: number) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSearchSuggestion(suggestion)}
                          className="ml-2 text-teal-400 hover:text-teal-300 underline"
                        >
                          {suggestion}{index < 2 ? ',' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  filteredContent.map((show: ContentItem) => (
                    <EnhancedShowCard
                      key={show.id}
                      show={show}
                      variant="search"
                      genreMap={GENRE_MAP}
                      onCardClick={handleCardClick}
                      onAddToWatchlist={handleAddToWatchlist}
                      onShareContent={handleShareContent}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Top 10 Trending by Streaming Network */}
          {!searchQuery && (
            <div className="space-y-12" role="region" aria-label="Trending content by streaming network">
              {trendingLoading ? (
                <div className="space-y-8">
                  {Array.from({ length: 3 }).map((_, networkIndex) => (
                    <div key={`trending-network-skeleton-${networkIndex}`} className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-700/50 rounded-lg animate-pulse"></div>
                        <div className="h-6 bg-slate-700/50 rounded w-48 animate-pulse"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <ContentSkeleton key={`trending-content-skeleton-${networkIndex}-${i}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : Object.keys(filteredTrending).length === 0 ? (
                <div className="text-center py-16 animate-fade-in">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full animate-pulse opacity-60"></div>
                    <div className="relative w-32 h-32 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center">
                      <div className="text-4xl">📺</div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">
                    No trending shows for these filters
                  </h3>
                  <p className="text-slate-400 mb-6 max-w-md mx-auto">
                    {selectedNetwork && selectedGenre 
                      ? `Not much ${genresData?.find((g: { id: number; name: string }) => g.id === selectedGenre)?.name} content on ${selectedNetwork} right now, but check out these alternatives:`
                      : "Try adjusting your filters or explore other networks."
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                    <Button 
                      onClick={clearFilters} 
                      className="bg-teal-500 hover:bg-teal-600 transform hover:scale-105 transition-all duration-300"
                    >
                      Clear Filters
                    </Button>
                    {selectedNetwork && (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedNetwork(null)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                      >
                        Try Other Networks
                      </Button>
                    )}
                  </div>
                  {selectedNetwork && networksData && (
                    <div className="mt-6 text-sm text-slate-500">
                      Alternative networks: 
                      {networksData?.filter((n: string) => n !== selectedNetwork).slice(0, 3).map((network: string, index: number) => (
                        <button
                          key={network}
                          onClick={() => setSelectedNetwork(network)}
                          className="ml-2 text-teal-400 hover:text-teal-300 underline"
                        >
                          {network}{index < 2 ? ',' : ''}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                Object.entries(filteredTrending).map(([network, shows]) => (
                  <section key={network} className="space-y-6" aria-labelledby={`trending-${network.replace(/\s+/g, '-').toLowerCase()}`}>
                    <div className="flex items-center justify-between">
                      <h2 id={`trending-${network.replace(/\s+/g, '-').toLowerCase()}`} className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <Tv className="h-4 w-4 text-white" aria-hidden="true" />
                        </div>
                        Top 10 on {network}
                      </h2>
                      <Link href={`/platform/${network.toLowerCase().replace(/\s+/g, '-')}`}>
                        <Button
                          variant="ghost"
                          className="text-teal-400 hover:text-teal-300"
                          aria-label={`View all trending content on ${network}`}
                        >
                          View All
                          <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
                        </Button>
                      </Link>
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-grid">
                    {trendingLoading
                      ? Array.from({ length: 4 }).map((_, i) => (
                          <ContentSkeleton key={`trending-show-skeleton-${network}-${i}`} />
                        ))
                      : shows.map((show: ContentItem) => (
                          <EnhancedShowCard
                            key={show.id}
                            show={show}
                            variant="trending"
                            onAddToWatchlist={handleAddToWatchlist}
                            onShareContent={handleShareContent}
                            onCardClick={handleCardClick}
                            genreMap={GENRE_MAP}
                          />
                        ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          )}

          {/* Upcoming Releases */}
          {!searchQuery && (
            <section className="space-y-6 mt-12" role="region" aria-labelledby="upcoming-releases" aria-live="polite">
              <div className="flex items-center justify-between">
                <h2 id="upcoming-releases" className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-white" aria-hidden="true" />
                  </div>
                  Upcoming Releases
                </h2>
                <Link href="/upcoming">
                  <Button
                    variant="ghost"
                    className="text-teal-400 hover:text-teal-300"
                    aria-label="View all upcoming releases"
                  >
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
                  </Button>
                </Link>
              </div>

              {upcomingLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ContentSkeleton key={`upcoming-skeleton-${i}`} />
                  ))}
                </div>
              ) : filteredUpcoming.length === 0 ? (
                <div className="text-center py-16 animate-fade-in">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full animate-pulse opacity-60"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-slate-400 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No upcoming releases found
                  </h3>
                  <p className="text-slate-400 mb-4">
                    {selectedNetwork || selectedGenre 
                      ? 'Try adjusting your filters to see more upcoming content.'
                      : 'Check back later for new upcoming releases.'
                    }
                  </p>
                  {(selectedNetwork || selectedGenre) && (
                    <Button 
                      onClick={clearFilters} 
                      className="bg-teal-500 hover:bg-teal-600 transform hover:scale-105 transition-all duration-300"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredUpcoming.map((show: ContentItem) => (
                    <EnhancedShowCard
                      key={show.id}
                      show={show}
                      variant="upcoming"
                      onAddToWatchlist={handleAddToWatchlist}
                      onShareContent={handleShareContent}
                      onCardClick={handleCardClick}
                      genreMap={GENRE_MAP}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
