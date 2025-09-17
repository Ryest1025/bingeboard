import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import NavigationHeader from '@/components/navigation-header';
import { useAuth } from '@/hooks/useAuth';
import { useStreamingEnrichedContent } from '@/hooks/useStreamingEnrichedContent';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { useFilters } from '@/hooks/useFilters';
import EnhancedFilterSystem from '@/components/common/EnhancedFilterSystem';
import {
  FilterBadges,
  type FilterValues,
} from '@/components/common/FilterBadges';
import { useLocalStorage } from '@/hooks/useLocalStorage';
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
  Sparkles,
  Heart,
  Zap,
  Moon,
  Sun,
  Coffee,
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
  ExternalLink,
  Calendar,
  Bell,
  MessageSquare,
  Tv,
  Film,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  ArrowRight,
  Flame,
  Crown,
} from 'lucide-react'; // Universal Components for BingeBoard Rules
import { HorizontalScrollContainer } from '@/components/ui/HorizontalScrollContainer';
import { ContentCard } from '@/components/ui/ContentCard';
import { StreamingLogos } from '@/components/ui/StreamingLogos';
import { StreamingPlatformSelector } from '@/components/ui/StreamingPlatformSelector';

// Awards filters for prestigious award winners
const awardsFilters = [
  {
    id: 'oscar',
    label: 'Oscar Winners',
    icon: Crown,
    gradient: 'from-yellow-400 to-amber-500',
    description: 'Academy Award winners',
    count: '350+ titles',
  },
  {
    id: 'emmy',
    label: 'Emmy Winners',
    icon: Tv,
    gradient: 'from-purple-500 to-indigo-500',
    description: 'Emmy Award winners',
    count: '420+ shows',
  },
  {
    id: 'golden-globe',
    label: 'Golden Globe',
    icon: Sparkles,
    gradient: 'from-orange-500 to-red-500',
    description: 'Golden Globe winners',
    count: '280+ titles',
  },
  {
    id: 'sag',
    label: 'SAG Awards',
    icon: Star,
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Screen Actors Guild winners',
    count: '190+ titles',
  },
];

const trendingSearches = [
  'House of the Dragon',
  'The Bear',
  'Wednesday',
  'Stranger Things',
  'The Last of Us',
  'Avatar: The Last Airbender',
];

// Removed duplicate StreamingLogos component - now imported from @/components/ui/StreamingLogos

// Removed duplicate HorizontalScrollContainer component - now imported from @/components/ui/HorizontalScrollContainer

// Removed duplicate StreamingPlatformSelector component - now imported from @/components/ui/StreamingPlatformSelector

// Removed duplicate ContentCard component - now imported from @/components/ui/ContentCard

// Skeleton loading component
const ContentSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex gap-4 p-4">
      <div className="w-20 h-28 bg-slate-700 rounded-lg"></div>
      <div className="flex-1 space-y-3">
        <div className="h-6 bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        <div className="h-4 bg-slate-700 rounded w-full"></div>
        <div className="flex gap-2">
          <div className="h-8 bg-slate-700 rounded w-20"></div>
          <div className="h-8 bg-slate-700 rounded w-24"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function ModernDiscover() {
  const [selectedAward, setSelectedAward] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceSearch, setIsVoiceSearch] = useState(false);
  const [showTrending, setShowTrending] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showQuickFilters, setShowQuickFilters] = useState(false);
  const { user } = useAuth();

  // Strategic Filter Management using custom hook with URL sync for Discover
  const {
    filters: discoverFilters,
    setFilters: setDiscoverFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    applyFilters,
  } = useFilters({
    persistKey: 'discover-filters',
    syncWithUrl: true, // Enable deep linking for Discover page
    onFiltersChange: (newFilters) => {
      console.log('🔍 Discover filters changed:', newFilters);
    },
  });

  // UI state management with localStorage persistence
  const [showAdvancedFilters, setShowAdvancedFilters] = useLocalStorage(
    'discover-show-filters',
    false
  );
  const [activeFilterTab, setActiveFilterTab] = useLocalStorage(
    'discover-active-filter-tab',
    'genres'
  );
  const [stickyFilterSummary, setStickyFilterSummary] =
    useState<JSX.Element | null>(null);
  const { filterOptions, isLoading: filterOptionsLoading } = useFilterOptions();

  // Initialize search query from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('q') || urlParams.get('search'); // Fix: Check 'q' parameter first
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  // Enhanced search with debouncing
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Strategic Discover Filter Handlers
  const handleDiscoverFiltersChange = (filters: FilterValues) => {
    setDiscoverFilters(filters);
    // Real-time filter updates - could trigger immediate UI updates
  };

  const handleDiscoverFiltersApply = (filters: FilterValues) => {
    setDiscoverFilters(filters); // Update state and trigger the filter change
    // Trigger filtered content fetch
    console.log('🎯 Applying discover filters:', filters);
  };

  const handleRemoveDiscoverFilter = (
    type: keyof FilterValues,
    value: string
  ) => {
    const newFilters = {
      ...discoverFilters,
      [type]: discoverFilters[type].filter((item) => item !== value),
    };
    setDiscoverFilters(newFilters);
  };

  const handleClearAllDiscoverFilters = () => {
    clearFilters(); // Use the strategic clear function from the hook
  };

  // Fetch trending shows from TMDB with real streaming data (Utelly + TMDB + Watchmode)
  const { data: trendingData } = useQuery({
    queryKey: ['/api/trending/tv/week?includeStreaming=true'],
    queryFn: async () => {
      const response = await fetch(
        '/api/trending/tv/week?includeStreaming=true'
      );
      if (!response.ok) throw new Error('Failed to fetch trending shows');
      return response.json();
    },
    staleTime: 300000,
  });

  // Enrich trending data with comprehensive streaming info
  const { data: enrichedTrendingData } = useStreamingEnrichedContent(
    (trendingData as any)?.results || [],
    !!(trendingData as any)?.results
  );

  // Fetch popular shows from TMDB
  const { data: popularData } = useQuery({
    queryKey: ['/api/streaming/enhanced-search?type=tv'],
    queryFn: async () => {
      const response = await fetch(
        '/api/streaming/enhanced-search?type=tv&includeStreaming=true'
      );
      if (!response.ok) throw new Error('Failed to fetch popular shows');
      return response.json();
    },
    staleTime: 300000,
  });

  // Enrich popular data with streaming info
  const { data: enrichedPopularData } = useStreamingEnrichedContent(
    (popularData as any)?.results || [],
    !!(popularData as any)?.results
  ); // Search functionality using TMDB (more reliable than Watchmode API)
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['/api/streaming/enhanced-search', searchQuery],
    queryFn: () => {
      if (!searchQuery.trim()) return null;
      return fetch(
        `/api/streaming/enhanced-search?query=${encodeURIComponent(searchQuery)}&mediaType=tv`
      ).then((res) => res.json());
    },
    enabled: !!searchQuery.trim(),
    staleTime: 300000,
  });

  // Awards-specific content from prestigious award winners
  const { data: awardsSpecificData } = useQuery({
    queryKey: ['/api/tmdb/awards-content', selectedAward],
    queryFn: () => {
      if (!selectedAward) return null;
      return fetch(`/api/tmdb/awards-content?award=${selectedAward}`).then((res) =>
        res.json()
      );
    },
    enabled: !!selectedAward,
    staleTime: 300000,
  });

  // Upcoming movies data
  const { data: upcomingMoviesData } = useQuery({
    queryKey: ['/api/streaming/comprehensive/movie/upcoming'],
    queryFn: () =>
      fetch('/api/streaming/comprehensive/movie/upcoming').then((res) =>
        res.json()
      ),
    staleTime: 300000,
  });

  // Enrich upcoming movies with streaming info
  const { data: enrichedUpcomingMovies } = useStreamingEnrichedContent(
    upcomingMoviesData?.results || [],
    !!upcomingMoviesData?.results
  );

  // Upcoming shows query for calendar reminders
  const { data: upcomingData } = useQuery({
    queryKey: ['/api/upcoming-releases'],
    queryFn: () => fetch('/api/upcoming-releases').then((res) => res.json()),
    staleTime: 300000,
  });

  // Enrich upcoming shows with streaming info
  const { data: enrichedUpcomingShows } = useStreamingEnrichedContent(
    upcomingData || [],
    !!upcomingData
  );

  // Separate upcoming releases into TV and movies with null safety
  const upcomingShows = Array.isArray(upcomingData)
    ? upcomingData.filter((item: any) => item?.releaseType !== 'movie')
    : [];
  const upcomingMovies = Array.isArray(upcomingData)
    ? upcomingData.filter((item: any) => item?.releaseType === 'movie')
    : [];

  const topPicksToday = (trendingData as any)?.results?.slice(0, 4) || [];

  // Fetch user preferences for AI-powered recommendations
  const { data: userPreferences } = useQuery({
    queryKey: ['/api/user-preferences'],
    queryFn: async () => {
      const response = await fetch('/api/user-preferences');
      if (!response.ok) throw new Error('Failed to fetch user preferences');
      return response.json();
    },
    enabled: !!user,
    staleTime: 600000, // Cache for 10 minutes
  });

  // ENHANCED: AI-powered Hidden Gems based on user onboarding preferences
  const hiddenGems = useMemo(() => {
    const allContent = [
      ...(enrichedTrendingData || []),
      ...(enrichedPopularData || []),
    ];

    if (!allContent.length) return [];

    // Filter by user's favorite genres if available
    let filtered = allContent.filter((show) => {
      const rating = show.vote_average || 0;
      const popularity = show.popularity || 0;

      // Base quality filter: good ratings but not super mainstream
      const qualityFilter =
        rating >= 7.0 && popularity > 20 && popularity < 500;

      // AI Enhancement: Match user's preferred genres from onboarding
      if ((userPreferences as any)?.favoriteGenres?.length) {
        const showGenres = show.genre_ids || [];
        const genreMatch = (userPreferences as any).favoriteGenres.some(
          (genre: string) => {
            // Map genre names to TMDB IDs
            const genreMap: { [key: string]: number } = {
              Action: 28,
              Adventure: 12,
              Animation: 16,
              Comedy: 35,
              Crime: 80,
              Documentary: 99,
              Drama: 18,
              Family: 10751,
              Fantasy: 14,
              History: 36,
              Horror: 27,
              Music: 10402,
              Mystery: 9648,
              Romance: 10749,
              'Science Fiction': 878,
              Thriller: 53,
              War: 10752,
              Western: 37,
            };
            return showGenres.includes(genreMap[genre]);
          }
        );

        return qualityFilter && genreMatch;
      }

      return qualityFilter;
    });

    // If no genre matches found, fall back to quality-based filtering
    if (filtered.length === 0) {
      filtered = allContent.filter((show) => {
        const rating = show.vote_average || 0;
        const popularity = show.popularity || 0;
        return rating >= 7.0 && popularity > 20 && popularity < 500;
      });
    }

    return filtered
      .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
      .slice(0, 4);
  }, [enrichedTrendingData, enrichedPopularData, userPreferences]);

  const searchResults = searchData?.results || [];

  const handleAwardFilter = (awardId: string) => {
    setSelectedAward(selectedAward === awardId ? null : awardId);
    setShowTrending(false); // Reset trending view when award is selected
  };

  const handleVoiceSearch = () => {
    setIsVoiceSearch(!isVoiceSearch);
    // Voice search implementation would go here
  };

  // Handle functions for Watch Now and Add to List
  const handleWatchNow = (show: any, platform: any) => {
    console.log(
      'Opening:',
      platform.provider_name,
      'for show:',
      show.title || show.name
    );
    window.open(
      `https://www.${platform.provider_name.toLowerCase().replace(/\s+/g, '')}.com`,
      '_blank'
    );
  };

  const handleAddToWatchlist = (show: any) => {
    console.log('Adding to watchlist:', show.title || show.name);
    // This would connect to the actual watchlist API
  };

  const handleMoreFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
    console.log('🎯 Toggling advanced filters:', !showAdvancedFilters);
  };

  const handleTrendingView = () => {
    console.log("What's Trending clicked - showing trending content");
    setSelectedAward(null);
    setSearchQuery('');
    // Toggle trending view - if already showing trending, go back to default
    setShowTrending(!showTrending);
  };

  // Handle adding calendar reminders for upcoming shows
  const handleAddCalendarReminder = (show: any) => {
    const releaseDate = new Date(show.releaseDate || show.first_air_date);
    const showTitle = show.title || show.name;

    // Create calendar event URL (Google Calendar)
    const startDate =
      releaseDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate =
      new Date(releaseDate.getTime() + 60 * 60 * 1000)
        .toISOString()
        .replace(/[-:]/g, '')
        .split('.')[0] + 'Z';

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${showTitle} - New Episode`)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(`New episode of ${showTitle} releases today!`)}&location=Streaming`;

    window.open(calendarUrl, '_blank');
    console.log('Opening calendar reminder for:', showTitle);
  };

  // Handle text notification opt-in for upcoming shows
  const handleTextReminders = async (show: any) => {
    const showTitle = show.title || show.name;

    try {
      // Add to release reminders in database
      const response = await fetch('/api/release-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId: show.id,
          tmdbId: show.id,
          title: showTitle,
          releaseDate: show.releaseDate || show.first_air_date,
          notificationMethods: ['push', 'email'], // Can add SMS later
        }),
      });

      if (response.ok) {
        console.log('Text reminders enabled for:', showTitle);
        // Could show a toast notification here
      }
    } catch (error) {
      console.error('Error setting up text reminders:', error);
    }
  };

  // FIXED: Content display logic with proper mood-specific and trending handling
  const filteredContent = (() => {
    // If user is actively searching, show search results
    if (searchQuery.trim() && searchResults.length > 0) {
      console.log('Showing search results for:', searchQuery);
      return searchResults.slice(0, 4);
    }

    // If award filter is selected, use award-specific API data
    if (selectedAward && awardsSpecificData?.results) {
      console.log(
        `Using latest ${selectedAward} winners:`,
        awardsSpecificData.results.length,
        'titles'
      );
      return awardsSpecificData.results.slice(0, 4);
    }

    // If trending view is active, show trending content
    if (showTrending && (trendingData as any)?.results) {
      console.log("Showing What's Trending content");
      return (trendingData as any).results.slice(0, 4);
    }

    // Default: show top picks (trending subset)
    return topPicksToday;
  })();

  return (
    <div className="min-h-screen bg-black">
      <NavigationHeader />

      <div className="pt-28 pb-24">
        <div className="container mx-auto px-4 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-white">
                Discover What to
              </span>
              <span className="inline-flex items-center gap-1">
                {/* TV Logo matching homepage */}
                <div className="relative inline-block">
                  {/* TV Frame */}
                  <div className="w-8 h-6 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
                    {/* TV Screen */}
                    <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
                      <div
                        className="text-xs font-bold text-white drop-shadow-lg"
                        style={{
                          textShadow:
                            '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)',
                        }}
                      >
                        B
                      </div>
                    </div>
                    {/* TV Base */}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-slate-700 rounded-sm"></div>
                    {/* TV Legs */}
                    <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-slate-600 rounded-sm"></div>
                  </div>
                </div>
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-black text-2xl">
                  inge
                </span>
              </span>
            </div>
          </div>

          {/* Awards-Based Filters */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-400" />
              Award Winners
            </h2>

            <div className="w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-3">
                {awardsFilters.map((award) => {
                  const Icon = award.icon;
                  const isSelected = selectedAward === award.id;

                  return (
                    <Button
                      key={award.id}
                      variant="outline"
                      onClick={() => handleAwardFilter(award.id)}
                      className={`bg-gradient-to-r ${award.gradient} ${
                        isSelected ? 'ring-2 ring-teal-400' : ''
                      } flex items-center gap-2 whitespace-nowrap transition-all duration-200 hover:scale-105 text-sm`}
                    >
                      <Icon className="h-4 w-4" />
                      {award.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STRATEGIC FILTER SYSTEM INTEGRATION */}
          <div className="space-y-4">
            {/* Sticky Filter Summary Bar */}
            {stickyFilterSummary && (
              <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 py-3 mb-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <Filter className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    {stickyFilterSummary}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setShowAdvancedFilters(!showAdvancedFilters)
                      }
                      className="text-xs h-6"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAllDiscoverFilters}
                      className="text-red-400 hover:text-red-300 text-xs h-6"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-400" />
                Find Something to Watch
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-500/20 text-blue-300 ml-2"
                  >
                    {activeFilterCount} active
                  </Badge>
                )}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-gray-400 hover:text-white"
              >
                {showAdvancedFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>

            {/* Filter Badges - Show active filters */}
            {hasActiveFilters && (
              <FilterBadges
                filters={discoverFilters}
                onRemoveFilter={handleRemoveDiscoverFilter}
                onClearAll={handleClearAllDiscoverFilters}
                onToggleFilters={() =>
                  setShowAdvancedFilters(!showAdvancedFilters)
                }
                className="mb-4"
              />
            )}

            {/* Enhanced Filter System - Compact Mode for Discover */}
            {showAdvancedFilters && (
              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 backdrop-blur-sm">
                <EnhancedFilterSystem
                  persistKey="discover-filters"
                  compactMode={true}
                  defaultExpanded={true}
                  showFilterSummary={true}
                  onFiltersChange={handleDiscoverFiltersChange}
                  onApply={handleDiscoverFiltersApply}
                  activeTab={activeFilterTab}
                  onActiveTabChange={setActiveFilterTab}
                  onFilterSummaryRender={setStickyFilterSummary}
                  className="w-full"
                />
              </div>
            )}

            {/* Filtered Content Preview */}
            {hasActiveFilters && (
              <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700/50 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-teal-400" />
                  Filtered Discovery Results
                </h4>
                <p className="text-gray-400 text-sm mb-3">
                  {discoverFilters.genres.length > 0 &&
                    `Genres: ${discoverFilters.genres.join(', ')}`}
                  {discoverFilters.genres.length > 0 &&
                    discoverFilters.platforms.length > 0 &&
                    ' • '}
                  {discoverFilters.platforms.length > 0 &&
                    `Platforms: ${discoverFilters.platforms.join(', ')}`}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* This would be replaced with actual filtered content */}
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="bg-gray-800/50 rounded-lg p-4 text-center backdrop-blur-sm"
                    >
                      <div className="w-full h-32 bg-gray-700 rounded mb-2 flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-300">
                        Filtered Content {item}
                      </p>
                      <p className="text-xs text-gray-500">
                        Powered by your filters
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Top Picks Today */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-400" />
                {searchQuery.trim()
                  ? `Search Results for "${searchQuery}"`
                  : selectedAward
                    ? `${awardsFilters.find((a) => a.id === selectedAward)?.label} Winners`
                    : 'Top Picks Today'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={handleMoreFilters}
              >
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>

            <div className="grid gap-4">
              {searchLoading && searchQuery.trim() ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-400">
                    Searching for "{searchQuery}"...
                  </div>
                </div>
              ) : filteredContent.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {searchQuery.trim()
                    ? `No results found for "${searchQuery}"`
                    : 'No content available'}
                </div>
              ) : (
                filteredContent.slice(0, 4).map((show: any) => {
                  return (
                    <Card
                      key={show.id}
                      className="glass-effect border-slate-700/50 hover:border-teal-500/50 transition-all duration-300 group"
                      onClick={async () => {
                        // Fetch real streaming data when card is interacted with
                        if (!show.streamingProviders) {
                          const mediaType = show.title ? 'movie' : 'tv';
                          try {
                            const response = await fetch(
                              `/api/tmdb/${mediaType}/${show.id}/watch/providers?region=US`
                            );
                            if (response.ok) {
                              const data = await response.json();
                              const regionData = data.results?.US;
                              if (regionData) {
                                show.streamingProviders = [
                                  ...(regionData.flatrate || []),
                                  ...(regionData.rent || []),
                                  ...(regionData.buy || []),
                                ].filter(
                                  (provider, index, self) =>
                                    self.findIndex(
                                      (p) =>
                                        p.provider_id === provider.provider_id
                                    ) === index
                                );
                              }
                            }
                          } catch (error) {
                            console.error(
                              'Error fetching streaming data:',
                              error
                            );
                          }
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4 items-start">
                          <div className="w-20 h-28 bg-slate-700 rounded-lg flex-shrink-0 overflow-hidden group-hover:ring-2 group-hover:ring-teal-400 transition-all">
                            {show.poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w185${show.poster_path}`}
                                alt={show.name || show.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Play className="h-8 w-8 text-slate-500 group-hover:text-white transition-colors" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                  {show.name || show.title}
                                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    Trending
                                  </Badge>
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm text-gray-400">
                                    {show.first_air_date
                                      ? new Date(
                                          show.first_air_date
                                        ).getFullYear()
                                      : show.release_date
                                        ? new Date(
                                            show.release_date
                                          ).getFullYear()
                                        : ''}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-yellow-400">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="font-medium">
                                  {show.vote_average?.toFixed(1)}
                                </span>
                              </div>
                            </div>

                            <p className="text-gray-300 text-sm line-clamp-2">
                              {show.overview}
                            </p>

                            {/* Display streaming platforms */}
                            {show.streamingProviders &&
                            show.streamingProviders.length > 0 ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                  Available on:
                                </span>
                                <div className="flex gap-1.5">
                                  {show.streamingProviders
                                    .slice(0, 4)
                                    .map((platform: any, index: number) => (
                                      <div
                                        key={index}
                                        className="w-5 h-5 rounded bg-white p-0.5 flex-shrink-0 border border-gray-200"
                                      >
                                        <img
                                          src={
                                            platform.logo_path
                                              ? `https://image.tmdb.org/t/p/w45${platform.logo_path}`
                                              : platform.logoPath
                                          }
                                          alt={
                                            platform.provider_name ||
                                            platform.name
                                          }
                                          className="w-full h-full object-contain rounded"
                                        />
                                      </div>
                                    ))}
                                  {show.streamingProviders.length > 4 && (
                                    <span className="text-xs text-gray-400">
                                      +{show.streamingProviders.length - 4} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                  Streaming info loading...
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50"
                                onClick={() =>
                                  window.open(
                                    `https://www.youtube.com/results?search_query=${encodeURIComponent((show.title || show.name) + ' trailer')}`,
                                    '_blank'
                                  )
                                }
                              >
                                <Play className="h-3 w-3 mr-2" />
                                Trailer
                              </Button>
                              <Button
                                size="sm"
                                className="bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 border-teal-500/50"
                                onClick={() => handleAddToWatchlist(show)}
                              >
                                <Plus className="h-3 w-3 mr-2" />
                                Add to List
                              </Button>
                              {show.streamingProviders &&
                              show.streamingProviders.length > 0 ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-600 text-gray-300 hover:bg-slate-700"
                                  onClick={() =>
                                    handleWatchNow(
                                      show,
                                      show.streamingProviders[0]
                                    )
                                  }
                                >
                                  <Eye className="h-3 w-3 mr-2" />
                                  Watch on{' '}
                                  {show.streamingProviders[0].provider_name ||
                                    show.streamingProviders[0].name}
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-600 text-gray-300 hover:bg-slate-700"
                                  onClick={() => {
                                    console.log(
                                      'No streaming data available for:',
                                      show.name || show.title
                                    );
                                    // Fallback search on Google
                                    window.open(
                                      `https://www.google.com/search?q=where+to+watch+${encodeURIComponent(show.name || show.title)}`,
                                      '_blank'
                                    );
                                  }}
                                >
                                  <Eye className="h-3 w-3 mr-2" />
                                  Find Streaming
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* What's Trending Section - Moved below Top Picks */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  What's Trending
                </h2>
              </div>
              <Button
                variant="ghost"
                className="text-teal-400 hover:text-teal-300"
                onClick={handleTrendingView}
              >
                View All
              </Button>
            </div>

            <HorizontalScrollContainer scrollId="whats-trending">
              {enrichedTrendingData?.slice(0, 4).map((show: any) => (
                <ContentCard
                  key={show.id}
                  item={show}
                  type="grid"
                  showStreamingLogos={true}
                  showTrailerButton={true}
                  showAffiliateLinks={true}
                  showWatchNow={true}
                  onWatchNow={handleWatchNow}
                  onAddToWatchlist={handleAddToWatchlist}
                />
              ))}
            </HorizontalScrollContainer>
          </div>

          {/* Upcoming TV Shows Section */}
          {upcomingShows && upcomingShows.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Tv className="h-4 w-4 text-white" />
                  </div>
                  Coming Soon - TV Shows
                </h2>
                <Link to="/upcoming-releases">
                  <Button
                    variant="ghost"
                    className="text-teal-400 hover:text-teal-300"
                  >
                    View All
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingShows.slice(0, 6).map((show: any) => (
                  <Card
                    key={show.id}
                    className="glass-effect border-slate-700/50 hover:border-teal-500/50 transition-all duration-300"
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="relative flex-shrink-0">
                          <img
                            src={
                              show.posterPath
                                ? `https://image.tmdb.org/t/p/w200${show.posterPath}`
                                : '/placeholder-poster.png'
                            }
                            alt={show.title || show.name}
                            className="w-16 h-24 object-cover rounded-md opacity-0 transition-opacity duration-300"
                            onLoad={(e) => {
                              e.currentTarget.style.opacity = '1';
                            }}
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-poster.png';
                              e.currentTarget.style.opacity = '1';
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm mb-1 truncate">
                            {show.title || show.name}
                          </h3>
                          <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                            <span>
                              {show.releaseDate
                                ? new Date(
                                    show.releaseDate
                                  ).toLocaleDateString()
                                : 'TBA'}
                            </span>
                            <Badge className="bg-teal-500 text-xs">
                              {show.releaseType === 'movie'
                                ? 'Movie'
                                : show.releaseType?.includes('season')
                                  ? show.releaseType.replace('_', ' ')
                                  : show.releaseType?.includes('premiere')
                                    ? show.releaseType.replace('_', ' ')
                                    : 'Series'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-300 mb-2 line-clamp-2">
                            {show.description ||
                              show.overview ||
                              'New episode coming soon!'}
                          </p>

                          {/* Streaming Platform Logos */}
                          {show.streamingProviders &&
                            show.streamingProviders.length > 0 && (
                              <div className="flex items-center gap-1 mb-2">
                                <span className="text-xs text-gray-400">
                                  Available on:
                                </span>
                                {show.streamingProviders
                                  .slice(0, 3)
                                  .map((provider: any) => (
                                    <img
                                      key={provider.provider_id}
                                      src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                      alt={provider.provider_name}
                                      className="w-4 h-4 rounded-sm"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  ))}
                              </div>
                            )}

                          <div className="flex gap-1 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-6 px-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
                              onClick={() =>
                                window.open(
                                  `https://www.youtube.com/results?search_query=${encodeURIComponent((show.title || show.name) + ' trailer')}`,
                                  '_blank'
                                )
                              }
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Trailer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-6 px-2 border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                              onClick={() => handleAddCalendarReminder(show)}
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              Calendar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-6 px-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                              onClick={() => handleTextReminders(show)}
                            >
                              <Bell className="h-3 w-3 mr-1" />
                              Notify
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-6 px-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                              onClick={() => handleAddToWatchlist(show)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              List
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Movies Section */}
          {upcomingMovies && upcomingMovies.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Film className="h-4 w-4 text-white" />
                  </div>
                  Coming Soon - Movies
                </h2>
                <Link to="/upcoming-releases">
                  <Button
                    variant="ghost"
                    className="text-teal-400 hover:text-teal-300"
                  >
                    View All
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingMovies.slice(0, 4).map((movie: any) => (
                  <Card
                    key={movie.id}
                    className="glass-effect border-slate-700/50 hover:border-teal-500/50 transition-all duration-300"
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="relative flex-shrink-0">
                          <img
                            src={
                              movie.posterPath
                                ? `https://image.tmdb.org/t/p/w200${movie.posterPath}`
                                : '/placeholder-poster.png'
                            }
                            alt={movie.title || movie.name}
                            className="w-16 h-24 object-cover rounded-md opacity-0 transition-opacity duration-300"
                            onLoad={(e) => {
                              e.currentTarget.style.opacity = '1';
                            }}
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-poster.png';
                              e.currentTarget.style.opacity = '1';
                            }}
                          />
                          <Badge className="absolute -top-1 -right-1 bg-orange-500 text-xs">
                            Movie
                          </Badge>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm mb-1 truncate">
                            {movie.title || movie.name}
                          </h3>
                          <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                            <span>
                              {movie.releaseDate
                                ? new Date(
                                    movie.releaseDate
                                  ).toLocaleDateString()
                                : 'TBA'}
                            </span>
                            <Badge className="bg-teal-500 text-xs">
                              {movie.releaseType === 'movie'
                                ? 'Movie'
                                : movie.releaseType?.includes('season')
                                  ? movie.releaseType.replace('_', ' ')
                                  : movie.releaseType?.includes('premiere')
                                    ? movie.releaseType.replace('_', ' ')
                                    : 'Movie'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-300 mb-2 line-clamp-2">
                            {movie.description ||
                              movie.overview ||
                              'New movie coming soon!'}
                          </p>

                          {/* Streaming Platform Logos */}
                          {movie.streamingProviders &&
                            movie.streamingProviders.length > 0 && (
                              <div className="flex items-center gap-1 mb-2">
                                <span className="text-xs text-gray-400">
                                  Available on:
                                </span>
                                {movie.streamingProviders
                                  .slice(0, 3)
                                  .map((provider: any) => (
                                    <img
                                      key={provider.provider_id}
                                      src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                      alt={provider.provider_name}
                                      className="w-4 h-4 rounded-sm"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  ))}
                              </div>
                            )}

                          <div className="flex gap-1 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-6 px-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
                              onClick={() =>
                                window.open(
                                  `https://www.youtube.com/results?search_query=${encodeURIComponent((movie.title || movie.name) + ' trailer')}`,
                                  '_blank'
                                )
                              }
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Trailer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-6 px-2 border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                              onClick={() => handleAddCalendarReminder(movie)}
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              Calendar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-6 px-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                              onClick={() => handleTextReminders(movie)}
                            >
                              <Bell className="h-3 w-3 mr-1" />
                              Notify
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-6 px-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                              onClick={() => handleAddToWatchlist(movie)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              List
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Coming Soon - Movies Section - After TV Shows */}
          {upcomingMoviesData?.results?.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Film className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Coming Soon - Movies
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  className="text-teal-400 hover:text-teal-300"
                  onClick={() => (window.location.href = '/upcoming-releases')}
                >
                  View All
                </Button>
              </div>

              <HorizontalScrollContainer scrollId="upcoming-movies">
                {enrichedUpcomingMovies?.slice(0, 4).map((movie: any) => (
                  <ContentCard
                    key={movie.id}
                    item={movie}
                    type="grid"
                    showStreamingLogos={true}
                    showTrailerButton={true}
                    showAffiliateLinks={true}
                    showWatchNow={true}
                    onWatchNow={handleWatchNow}
                    onAddToWatchlist={handleAddToWatchlist}
                  />
                ))}
              </HorizontalScrollContainer>
            </div>
          )}

          {/* Hidden Gems - Last Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Hidden Gems</h2>
              </div>
              <Button
                variant="ghost"
                className="text-teal-400 hover:text-teal-300"
              >
                View All
              </Button>
            </div>

            <HorizontalScrollContainer scrollId="hidden-gems">
              {hiddenGems.slice(0, 4).map((show: any) => (
                <ContentCard
                  key={show.id}
                  item={show}
                  type="compact"
                  showStreamingLogos={true}
                  showTrailerButton={true}
                  showAffiliateLinks={true}
                  onWatchNow={handleWatchNow}
                  onAddToWatchlist={handleAddToWatchlist}
                />
              ))}
            </HorizontalScrollContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
