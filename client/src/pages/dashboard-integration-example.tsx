import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EnhancedFilterSystem from '@/components/common/EnhancedFilterSystem';
import { FilterBadges, type FilterValues } from '@/components/common/FilterBadges';
import { useDashboardContent } from '@/hooks/useFilteredContent';
import { getFilterSummary } from '@/utils/filterUtils';
import {
  Sparkles,
  Eye,
  Loader2,
  Filter,
  Play,
  Plus,
  Star,
  Clock
} from 'lucide-react';

/**
 * Complete Dashboard Integration Example
 * Shows how to use Enhanced Filter System with real content fetching
 */
export default function DashboardIntegrationExample() {
  const [showFilters, setShowFilters] = useState(false);

  // Use the specialized dashboard content hook
  const {
    content: dashboardContent,
    isLoading: contentLoading,
    isFetching,
    filters,
    appliedFilters,
    hasFilters,
    handleFiltersChange,
    handleFiltersApply,
    clearFilters
  } = useDashboardContent();

  const handleRemoveFilter = (type: keyof FilterValues, value: string) => {
    const newFilters = {
      ...appliedFilters,
      [type]: appliedFilters[type].filter(item => item !== value)
    };
    handleFiltersApply(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Dashboard Integration Example</h1>
          <p className="text-gray-400">
            Complete integration with Enhanced Filter System and content fetching
          </p>
        </div>

        {/* Smart Content Discovery Section */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Smart Content Discovery
              </CardTitle>
              <p className="text-gray-400 text-sm hidden md:block">
                Filter your AI recommendations and personalized "Because You Watched" results
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Filter Badges */}
            <FilterBadges
              filters={appliedFilters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={clearFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              className="mb-4"
            />

            {/* Filter Summary */}
            {hasFilters && (
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
                <p className="text-sm text-blue-300">
                  📊 Filtering by: {getFilterSummary(appliedFilters)}
                </p>
              </div>
            )}

            {/* Enhanced Filter System */}
            {showFilters && (
              <div className="bg-gray-800/50 rounded-lg border border-gray-700">
                <EnhancedFilterSystem
                  persistKey="dashboard-filters-example"
                  showAdvanced={true}
                  showFilterSummary={true}
                  onFiltersChange={handleFiltersChange}
                  onApply={handleFiltersApply}
                  className="border-none bg-transparent"
                />
              </div>
            )}

            {/* Content Loading State */}
            {contentLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading personalized content...</span>
              </div>
            )}

            {/* Fetching Indicator */}
            {isFetching && !contentLoading && (
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating results...
              </div>
            )}

            {/* Content Results */}
            {dashboardContent && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-400" />
                    {hasFilters ? 'Filtered' : 'Personalized'} Recommendations
                  </h3>
                  <Badge variant="outline">
                    {dashboardContent.results?.length || 0} results
                  </Badge>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {dashboardContent.results?.slice(0, 12).map((item: any, index: number) => (
                    <div key={item.id || index} className="group">
                      <div className="bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700 transition-colors">
                        {/* Mock poster */}
                        <div className="aspect-[2/3] bg-gray-600 rounded mb-2 flex items-center justify-center relative overflow-hidden">
                          {item.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                              alt={item.title || item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Play className="h-8 w-8 text-gray-400" />
                          )}

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="flex gap-1">
                              <Button size="sm" className="h-8 w-8 p-0">
                                <Play className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Content info */}
                        <h4 className="text-sm font-medium line-clamp-2 mb-1">
                          {item.title || item.name || `Content ${index + 1}`}
                        </h4>

                        <div className="flex items-center justify-between text-xs text-gray-400">
                          {item.vote_average && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {item.vote_average.toFixed(1)}
                            </div>
                          )}
                          {item.release_date && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(item.release_date).getFullYear()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )) || (
                      // Fallback content if no API data
                      Array.from({ length: 12 }, (_, index) => (
                        <div key={index} className="bg-gray-700/50 rounded-lg p-3">
                          <div className="aspect-[2/3] bg-gray-600 rounded mb-2 flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-gray-400" />
                          </div>
                          <h4 className="text-sm font-medium mb-1">
                            {hasFilters ? 'Filtered' : 'AI'} Recommendation {index + 1}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {hasFilters ? 'Matching your filters' : 'Personalized for you'}
                          </p>
                        </div>
                      ))
                    )}
                </div>

                {/* Load More */}
                {dashboardContent.results && dashboardContent.results.length > 12 && (
                  <div className="text-center pt-4">
                    <Button variant="outline">
                      Load More Recommendations
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {dashboardContent && (!dashboardContent.results || dashboardContent.results.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <Filter className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="mb-2">No content matches your current filters</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Integration Code Example */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>📋 Implementation Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300">
                {`// Dashboard Integration
const {
  content,
  isLoading,
  filters,
  appliedFilters,
  handleFiltersChange,
  handleFiltersApply,
  clearFilters
} = useDashboardContent();

return (
  <div>
    <FilterBadges 
      filters={appliedFilters}
      onRemoveFilter={handleRemoveFilter}
      onClearAll={clearFilters}
      onToggleFilters={() => setShowFilters(!showFilters)}
    />
    
    {showFilters && (
      <EnhancedFilterSystem
        persistKey="dashboard-filters"
        showAdvanced={true}
        onFiltersChange={handleFiltersChange}
        onApply={handleFiltersApply}
      />
    )}
    
    {/* Render filtered content */}
    {content?.results?.map(item => (
      <ContentCard key={item.id} item={item} />
    ))}
  </div>
);`}
              </pre>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
