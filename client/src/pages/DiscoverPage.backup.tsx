import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EnhancedFilterSystem from '@/components/common/EnhancedFilterSystem';
import { FilterBadges, type FilterValues } from '@/components/common/FilterBadges';
import { useFilters } from '@/hooks/useFilters';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Filter, Search, Sparkles, TrendingUp } from 'lucide-react';

export default function DiscoverPage() {
  // Strategic filter management using custom hook with URL sync
  const {
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    applyFilters
  } = useFilters({
    persistKey: 'discover-filters',
    syncWithUrl: true, // Enable deep linking for Discover page
    onFiltersChange: (newFilters) => {
      console.log('🔍 Discover filters changed:', newFilters);
    }
  });

  // UI state management
  const [showFilters, setShowFilters] = useLocalStorage('discover-show-filters', false); // Collapsed by default on Discover
  const [activeFilterTab, setActiveFilterTab] = useLocalStorage('discover-active-filter-tab', 'genres');
  const [stickyFilterSummary, setStickyFilterSummary] = useState<JSX.Element | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Strategic API integration - filters drive the content
  const { data: discoverResults, isLoading, refetch } = useQuery({
    queryKey: ['discover-content', filters, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();

      // Build comprehensive query parameters
      if (filters.genres.length) params.set('genres', filters.genres.join(','));
      if (filters.platforms.length) params.set('platforms', filters.platforms.join(','));
      if (filters.countries.length) params.set('countries', filters.countries.join(','));
      if (filters.sports.length) params.set('sports', filters.sports.join(','));
      if (searchQuery) params.set('query', searchQuery);

      params.set('limit', '50'); // More results for discovery

      const response = await fetch(`/api/content/discover?${params.toString()}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch discover content');
      }

      return response.json();
    },
    enabled: hasActiveFilters || searchQuery.length > 0 // Only fetch when filters or search active
  });

  const handleApplyFilters = (newFilters: FilterValues) => {
    setFilters(newFilters);
    refetch(); // Immediate refetch on apply
  };

  const handleRemoveFilter = (type: keyof FilterValues, value: string) => {
    const newFilters = {
      ...filters,
      [type]: filters[type].filter(v => v !== value)
    };
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Search className="h-8 w-8 text-blue-400" />
            Discover
          </h1>
          <p className="text-gray-400">Find your next favorite show or movie</p>
        </div>

        {/* Sticky Filter Summary Bar - Mobile Optimized */}
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
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-xs h-6"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-400 hover:text-red-300 text-xs h-6"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search movies and TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Enhanced Filter System - Compact Mode for Discover */}
        <div className="mb-6">
          <Card className="bg-gray-850 border-gray-700">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-400" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                      {activeFilterCount} active
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-gray-400 hover:text-white"
                >
                  {showFilters ? 'Hide' : 'Show'}
                </Button>
              </div>
            </CardHeader>
            {showFilters && (
              <CardContent>
                <EnhancedFilterSystem
                  persistKey="discover-filters"
                  compactMode={true} // Tight, mobile-friendly layout
                  defaultExpanded={true}
                  showFilterSummary={true}
                  onFiltersChange={setFilters}
                  onApply={handleApplyFilters}
                  activeTab={activeFilterTab}
                  onActiveTabChange={setActiveFilterTab}
                  onFilterSummaryRender={setStickyFilterSummary}
                />
              </CardContent>
            )}
          </Card>
        </div>

        {/* Filter Badges */}
        {hasActiveFilters && (
          <div className="mb-6">
            <FilterBadges
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={clearFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />
          </div>
        )}

        {/* Results Section */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg animate-pulse">
                  <div className="aspect-[2/3] bg-gray-700 rounded-t-lg"></div>
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : discoverResults?.results?.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  Discover Results
                  <span className="text-sm font-normal text-gray-400">
                    ({discoverResults.total_results} found)
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {discoverResults.results.map((item: any) => (
                  <Card key={item.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                    <div className="aspect-[2/3] bg-gray-700 rounded-t-lg overflow-hidden">
                      {item.poster_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                          alt={item.title || item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm truncate">{item.title || item.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {item.release_date || item.first_air_date ?
                          new Date(item.release_date || item.first_air_date).getFullYear() : ''
                        }
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : hasActiveFilters || searchQuery ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No results found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">Start exploring</h3>
              <p className="text-gray-500">Use filters or search to discover new content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
