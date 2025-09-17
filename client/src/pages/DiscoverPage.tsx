import React, { useState, useMemo } from 'react';import React, { useState } from 'react';

import { useQuery } from '@tanstack/react-query';import { useQuery } from '@tanstack/react-query';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';import { Badge } from '@/components/ui/badge';

import { Input } from '@/components/ui/input';import EnhancedFilterSystem from '@/components/common/EnhancedFilterSystem';

import { import { FilterBadges, type FilterValues } from '@/components/common/FilterBadges';

  Search, import { useFilters } from '@/hooks/useFilters';

  Filter, import { useLocalStorage } from '@/hooks/useLocalStorage';

  TrendingUp, import { Filter, Search, Sparkles, TrendingUp } from 'lucide-react';

  Star, 

  Calendar,export default function DiscoverPage() {

  Compass,  // Strategic filter management using custom hook with URL sync

  Sparkles,  const {

  Film,    filters,

  Tv,    setFilters,

  Globe    clearFilters,

} from 'lucide-react';    hasActiveFilters,

import { EnhancedShowCard } from '@/components/EnhancedShowCard';    activeFilterCount,

import { EnhancedFilterSystem, FilterState } from '@/components/EnhancedFilterSystem';    applyFilters

import { GRADIENTS, TRANSITIONS } from '@/styles/constants';  } = useFilters({

import { useAuth } from '@/hooks/useAuth';    persistKey: 'discover-filters',

    syncWithUrl: true, // Enable deep linking for Discover page

interface Show {    onFiltersChange: (newFilters) => {

  id: number;      console.log('🔍 Discover filters changed:', newFilters);

  title?: string;    }

  name?: string;  });

  poster_path?: string;

  backdrop_path?: string;  // UI state management

  vote_average?: number;  const [showFilters, setShowFilters] = useLocalStorage('discover-show-filters', false); // Collapsed by default on Discover

  genre_ids?: number[];  const [activeFilterTab, setActiveFilterTab] = useLocalStorage('discover-active-filter-tab', 'genres');

  overview?: string;  const [stickyFilterSummary, setStickyFilterSummary] = useState<JSX.Element | null>(null);

  release_date?: string;  const [searchQuery, setSearchQuery] = useState('');

  first_air_date?: string;

  media_type?: 'movie' | 'tv';  // Strategic API integration - filters drive the content

  streaming_platforms?: Array<{  const { data: discoverResults, isLoading, refetch } = useQuery({

    provider_name: string;    queryKey: ['discover-content', filters, searchQuery],

    logo_path?: string;    queryFn: async () => {

  }>;      const params = new URLSearchParams();

}

      // Build comprehensive query parameters

const DISCOVER_CATEGORIES = [      if (filters.genres.length) params.set('genres', filters.genres.join(','));

  { id: 'trending', name: 'Trending', icon: TrendingUp, color: 'text-purple-500' },      if (filters.platforms.length) params.set('platforms', filters.platforms.join(','));

  { id: 'popular', name: 'Popular', icon: Star, color: 'text-yellow-500' },      if (filters.countries.length) params.set('countries', filters.countries.join(','));

  { id: 'upcoming', name: 'Coming Soon', icon: Calendar, color: 'text-emerald-500' },      if (filters.sports.length) params.set('sports', filters.sports.join(','));

  { id: 'top_rated', name: 'Top Rated', icon: Sparkles, color: 'text-blue-500' },      if (searchQuery) params.set('query', searchQuery);

  { id: 'movies', name: 'Movies', icon: Film, color: 'text-red-500' },

  { id: 'tv', name: 'TV Shows', icon: Tv, color: 'text-indigo-500' },      params.set('limit', '50'); // More results for discovery

];

      const response = await fetch(`/api/content/discover?${params.toString()}`, {

export default function DiscoverPage() {        credentials: 'include'

  const { user } = useAuth();      });

  const [searchQuery, setSearchQuery] = useState('');

  const [showFilters, setShowFilters] = useState(false);      if (!response.ok) {

  const [activeCategory, setActiveCategory] = useState('trending');        throw new Error('Failed to fetch discover content');

  const [filters, setFilters] = useState<FilterState>({      }

    genre: 'all',

    year: 'all',      return response.json();

    rating: [0, 10],    },

    runtime: [0, 300],    enabled: hasActiveFilters || searchQuery.length > 0 // Only fetch when filters or search active

    platform: 'all',  });

    status: 'all',

    sortBy: 'popularity.desc',  const handleApplyFilters = (newFilters: FilterValues) => {

    hideWatched: false,    setFilters(newFilters);

    onlyWatchlist: false,    refetch(); // Immediate refetch on apply

    includeFriends: true,  };

    searchQuery: '',

    contentType: 'all'  const handleRemoveFilter = (type: keyof FilterValues, value: string) => {

  });    const newFilters = {

      ...filters,

  // Fetch discover content based on active category and filters      [type]: filters[type].filter(v => v !== value)

  const { data: discoverData, isLoading: discoverLoading, refetch: refetchDiscover } = useQuery({    };

    queryKey: ['discover', activeCategory, filters, searchQuery],    setFilters(newFilters);

    queryFn: async () => {  };

      const res = await fetch('/api/recommendations/unified', {

        method: 'POST',  return (

        headers: {    <div className="min-h-screen bg-gray-900 text-white">

          'Content-Type': 'application/json',      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        },

        body: JSON.stringify({        {/* Header */}

          filters: {        <div className="mb-6">

            ...filters,          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">

            genre: filters.genre === 'all' ? undefined : filters.genre,            <Search className="h-8 w-8 text-blue-400" />

            year: filters.year === 'all' ? undefined : filters.year,            Discover

            platform: filters.platform === 'all' ? undefined : filters.platform,          </h1>

            rating_gte: filters.rating[0] > 0 ? filters.rating[0] : undefined,          <p className="text-gray-400">Find your next favorite show or movie</p>

            rating_lte: filters.rating[1] < 10 ? filters.rating[1] : undefined,        </div>

            runtime_gte: filters.runtime[0] > 0 ? filters.runtime[0] : undefined,

            runtime_lte: filters.runtime[1] < 300 ? filters.runtime[1] : undefined,        {/* Sticky Filter Summary Bar - Mobile Optimized */}

            category: activeCategory,        {stickyFilterSummary && (

            search: searchQuery.trim() || undefined,          <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 py-3 mb-6 rounded-lg">

          },            <div className="flex items-center justify-between">

          userProfile: {              <div className="flex items-center gap-2 overflow-x-auto">

            favoriteGenres: user?.preferences?.favoriteGenres || [],                <Filter className="w-4 h-4 text-blue-400 flex-shrink-0" />

            preferredNetworks: user?.preferences?.preferredNetworks || [],                {stickyFilterSummary}

            viewingHistory: [],              </div>

            watchlist: [],              <div className="flex items-center gap-2 flex-shrink-0">

            currentlyWatching: [],                <Button

            recentlyWatched: []                  variant="outline"

          },                  size="sm"

          limit: 50                  onClick={() => setShowFilters(!showFilters)}

        })                  className="text-xs h-6"

      });                >

      if (!res.ok) throw new Error('Failed to fetch discover content');                  Edit

      return res.json();                </Button>

    },                <Button

    staleTime: 5 * 60 * 1000,                  variant="ghost"

  });                  size="sm"

                  onClick={clearFilters}

  // Fetch trending content for hero section                  className="text-red-400 hover:text-red-300 text-xs h-6"

  const { data: heroData } = useQuery({                >

    queryKey: ['discover-hero'],                  Clear

    queryFn: async () => {                </Button>

      const res = await fetch('/api/recommendations/unified', {              </div>

        method: 'POST',            </div>

        headers: {          </div>

          'Content-Type': 'application/json',        )}

        },

        body: JSON.stringify({        {/* Search Bar */}

          filters: { category: 'trending' },        <div className="mb-6">

          userProfile: {          <div className="relative">

            favoriteGenres: user?.preferences?.favoriteGenres || [],            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />

            preferredNetworks: user?.preferences?.preferredNetworks || [],            <input

            viewingHistory: [],              type="text"

            watchlist: [],              placeholder="Search movies and TV shows..."

            currentlyWatching: [],              value={searchQuery}

            recentlyWatched: []              onChange={(e) => setSearchQuery(e.target.value)}

          },              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"

          limit: 10            />

        })          </div>

      });        </div>

      if (!res.ok) throw new Error('Failed to fetch hero content');

      return res.json();        {/* Enhanced Filter System - Compact Mode for Discover */}

    },        <div className="mb-6">

    staleTime: 10 * 60 * 1000,          <Card className="bg-gray-850 border-gray-700">

  });            <CardHeader className="pb-4">

              <div className="flex items-center justify-between">

  const shows = useMemo(() => {                <CardTitle className="text-lg flex items-center gap-2">

    return discoverData?.recommendations || [];                  <Filter className="h-5 w-5 text-blue-400" />

  }, [discoverData]);                  Filters

                  {hasActiveFilters && (

  const heroShow = useMemo(() => {                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">

    return heroData?.recommendations?.[0] || null;                      {activeFilterCount} active

  }, [heroData]);                    </Badge>

                  )}

  // Handle filter changes                </CardTitle>

  const handleFiltersChange = (newFilters: FilterState) => {                <Button

    setFilters(newFilters);                  variant="ghost"

  };                  size="sm"

                  onClick={() => setShowFilters(!showFilters)}

  const handleApplyFilters = () => {                  className="text-gray-400 hover:text-white"

    refetchDiscover();                >

  };                  {showFilters ? 'Hide' : 'Show'}

                </Button>

  const handleResetFilters = () => {              </div>

    setFilters({            </CardHeader>

      genre: 'all',            {showFilters && (

      year: 'all',              <CardContent>

      rating: [0, 10],                <EnhancedFilterSystem

      runtime: [0, 300],                  persistKey="discover-filters"

      platform: 'all',                  compactMode={true} // Tight, mobile-friendly layout

      status: 'all',                  defaultExpanded={true}

      sortBy: 'popularity.desc',                  showFilterSummary={true}

      hideWatched: false,                  onFiltersChange={setFilters}

      onlyWatchlist: false,                  onApply={handleApplyFilters}

      includeFriends: true,                  activeTab={activeFilterTab}

      searchQuery: '',                  onActiveTabChange={setActiveFilterTab}

      contentType: 'all'                  onFilterSummaryRender={setStickyFilterSummary}

    });                />

  };              </CardContent>

            )}

  // Event handlers          </Card>

  const handleAddToWatchlist = async (show: Show) => {        </div>

    try {

      const res = await fetch('/api/watchlist/add', {        {/* Filter Badges */}

        method: 'POST',        {hasActiveFilters && (

        headers: { 'Content-Type': 'application/json' },          <div className="mb-6">

        body: JSON.stringify({             <FilterBadges

          tmdbId: show.id,              filters={filters}

          title: show.title || show.name,              onRemoveFilter={handleRemoveFilter}

          type: show.media_type || 'movie'              onClearAll={clearFilters}

        })              onToggleFilters={() => setShowFilters(!showFilters)}

      });            />

      if (!res.ok) throw new Error('Failed to add to watchlist');          </div>

    } catch (error) {        )}

      console.error('Error adding to watchlist:', error);

    }        {/* Results Section */}

  };        <div>

          {isLoading ? (

  const handleShareContent = async (show: Show) => {            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">

    if (navigator.share) {              {Array.from({ length: 12 }).map((_, i) => (

      try {                <div key={i} className="bg-gray-800 rounded-lg animate-pulse">

        await navigator.share({                  <div className="aspect-[2/3] bg-gray-700 rounded-t-lg"></div>

          title: show.title || show.name,                  <div className="p-3 space-y-2">

          text: `Check out ${show.title || show.name} on BingeBoard!`,                    <div className="h-4 bg-gray-700 rounded"></div>

          url: window.location.href                    <div className="h-3 bg-gray-700 rounded w-3/4"></div>

        });                  </div>

      } catch (error) {                </div>

        console.error('Error sharing:', error);              ))}

      }            </div>

    }          ) : discoverResults?.results?.length > 0 ? (

  };            <div>

              <div className="flex items-center justify-between mb-4">

  const handleShowClick = (show: Show) => {                <h2 className="text-xl font-semibold flex items-center gap-2">

    // Navigate to show detail page                  <Sparkles className="h-5 w-5 text-yellow-400" />

    console.log('Show clicked:', show);                  Discover Results

  };                  <span className="text-sm font-normal text-gray-400">

                    ({discoverResults.total_results} found)

  const handleCategoryChange = (categoryId: string) => {                  </span>

    setActiveCategory(categoryId);                </h2>

  };              </div>



  const handleSearchSubmit = (e: React.FormEvent) => {              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">

    e.preventDefault();                {discoverResults.results.map((item: any) => (

    refetchDiscover();                  <Card key={item.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">

  };                    <div className="aspect-[2/3] bg-gray-700 rounded-t-lg overflow-hidden">

                      {item.poster_path && (

  return (                        <img

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">                          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}

      <div className="container mx-auto px-4 py-8 space-y-8">                          alt={item.title || item.name}

                                  className="w-full h-full object-cover"

        {/* Header */}                        />

        <div className="text-center space-y-4">                      )}

          <div className="flex items-center justify-center gap-3 mb-4">                    </div>

            <Compass className="w-8 h-8 text-purple-500" />                    <CardContent className="p-3">

            <h1 className="text-4xl font-bold text-white">                      <h3 className="font-medium text-sm truncate">{item.title || item.name}</h3>

              Discover                      <p className="text-xs text-gray-400 mt-1">

            </h1>                        {item.release_date || item.first_air_date ?

          </div>                          new Date(item.release_date || item.first_air_date).getFullYear() : ''

          <p className="text-xl text-slate-400 max-w-2xl mx-auto">                        }

            Explore trending shows, discover hidden gems, and find your next binge-worthy series                      </p>

          </p>                    </CardContent>

        </div>                  </Card>

                ))}

        {/* Search and Filters */}              </div>

        <div className="flex flex-col lg:flex-row items-center gap-4">            </div>

          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl">          ) : hasActiveFilters || searchQuery ? (

            <div className="relative">            <div className="text-center py-12">

              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />              <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />

              <Input              <h3 className="text-lg font-medium text-gray-400 mb-2">No results found</h3>

                placeholder="Search for movies, TV shows, actors..."              <p className="text-gray-500">Try adjusting your filters or search terms</p>

                value={searchQuery}            </div>

                onChange={(e) => setSearchQuery(e.target.value)}          ) : (

                className="pl-12 h-12 text-lg bg-slate-800/50 border-slate-700 text-white placeholder-slate-400"            <div className="text-center py-12">

              />              <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />

            </div>              <h3 className="text-lg font-medium text-gray-400 mb-2">Start exploring</h3>

          </form>              <p className="text-gray-500">Use filters or search to discover new content</p>

                      </div>

          <Button          )}

            variant="outline"        </div>

            onClick={() => setShowFilters(!showFilters)}      </div>

            className="border-slate-700 text-slate-300 hover:bg-slate-800 px-6 h-12"    </div>

          >  );

            <Filter className="w-4 h-4 mr-2" />}

            Advanced Filters
          </Button>
        </div>

        {/* Enhanced Filter System */}
        {showFilters && (
          <EnhancedFilterSystem
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
            isLoading={discoverLoading}
            resultCount={shows.length}
          />
        )}

        {/* Hero Section */}
        {heroShow && !searchQuery && (
          <Card className="relative overflow-hidden bg-slate-800/50 border-slate-700">
            <div className="relative h-80 md:h-96">
              {/* Background Image */}
              {heroShow.backdrop_path && (
                <img
                  src={`https://image.tmdb.org/t/p/original${heroShow.backdrop_path}`}
                  alt={heroShow.title || heroShow.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
              
              {/* Content */}
              <div className="relative h-full flex items-center p-8">
                <div className="max-w-2xl space-y-6">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-400" />
                    <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                      Trending Worldwide
                    </Badge>
                  </div>
                  
                  <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                    {heroShow.title || heroShow.name}
                  </h2>
                  
                  <p className="text-slate-300 text-lg leading-relaxed line-clamp-3">
                    {heroShow.overview || 'Discover what everyone is watching right now.'}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <Button 
                      size="lg" 
                      className={`${GRADIENTS.premium} text-white font-semibold ${TRANSITIONS.button}`}
                      onClick={() => handleShowClick(heroShow)}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Learn More
                    </Button>
                    
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-slate-600 text-white hover:bg-slate-800"
                      onClick={() => handleAddToWatchlist(heroShow)}
                    >
                      <Star className="w-5 h-5 mr-2" />
                      Add to Watchlist
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          {DISCOVER_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => handleCategoryChange(category.id)}
                className={`${
                  activeCategory === category.id
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                } px-4 py-2`}
              >
                <Icon className={`w-4 h-4 mr-2 ${category.color}`} />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Results Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {searchQuery ? `Search Results for "${searchQuery}"` : 
               DISCOVER_CATEGORIES.find(cat => cat.id === activeCategory)?.name || 'Discover'}
            </h2>
            
            {shows.length > 0 && (
              <p className="text-slate-400">
                {shows.length} result{shows.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          {discoverLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : shows.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {shows.map((show: Show) => (
                <EnhancedShowCard
                  key={show.id}
                  show={show}
                  variant="detailed"
                  onAddToWatchlist={handleAddToWatchlist}
                  onShareContent={handleShareContent}
                  onCardClick={handleShowClick}
                  size="md"
                />
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-12 text-center">
                <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchQuery ? 'No results found' : 'No content available'}
                </h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  {searchQuery 
                    ? `Try adjusting your search terms or filters to find what you're looking for.`
                    : 'Content is being loaded. Please try again in a moment.'
                  }
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      handleResetFilters();
                    }}
                    className="mt-4 border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </section>

        {/* Load More Button */}
        {shows.length > 0 && shows.length >= 20 && (
          <div className="text-center">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 px-8 py-3"
              onClick={() => {
                // Implement load more functionality
                console.log('Load more clicked');
              }}
            >
              Load More Results
            </Button>
          </div>
        )}

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-slate-800/30 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>Active Category: {activeCategory}</div>
                <div>Search Query: {searchQuery || 'None'}</div>
                <div>Results: {shows.length}</div>
                <div>Filters Active: {Object.values(filters).filter(Boolean).length}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}