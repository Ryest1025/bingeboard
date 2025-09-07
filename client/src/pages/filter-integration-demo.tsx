import React, { useState } from 'react';
import EnhancedFilterSystem from '@/components/common/EnhancedFilterSystem';
import { FilterBadges, type FilterValues } from '@/components/common/FilterBadges';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Eye,
  Monitor,
  Smartphone,
  Settings,
  Code,
  CheckCircle,
  Filter,
  Users,
  TrendingUp,
  Play
} from 'lucide-react';

/**
 * Comprehensive Integration Demo & Documentation
 * Shows best practices for Dashboard and Discover page integration
 */
export default function FilterIntegrationDemo() {
  // Dashboard Integration State
  const [dashboardFilters, setDashboardFilters] = useState<FilterValues>({
    genres: [],
    platforms: [],
    countries: [],
    sports: []
  });
  const [showDashboardFilters, setShowDashboardFilters] = useState(false);

  // Discover Integration State
  const [discoverFilters, setDiscoverFilters] = useState<FilterValues>({
    genres: [],
    platforms: [],
    countries: [],
    sports: []
  });
  const [showDiscoverFilters, setShowDiscoverFilters] = useState(true);

  const { filterOptions, isLoading } = useFilterOptions();

  // Dashboard Handlers
  const handleDashboardFiltersChange = (filters: FilterValues) => {
    setDashboardFilters(filters);
    console.log('🔄 Dashboard filters changed:', filters);
  };

  const handleRemoveDashboardFilter = (type: keyof FilterValues, value: string) => {
    setDashboardFilters(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== value)
    }));
  };

  const handleClearDashboardFilters = () => {
    setDashboardFilters({ genres: [], platforms: [], countries: [], sports: [] });
  };

  // Discover Handlers
  const handleDiscoverFiltersChange = (filters: FilterValues) => {
    setDiscoverFilters(filters);
    console.log('🔄 Discover filters changed (real-time):', filters);
  };

  const handleDiscoverFiltersApply = (filters: FilterValues) => {
    setDiscoverFilters(filters);
    console.log('🎯 Discover filters applied:', filters);
    // This would trigger a filtered content fetch
  };

  const handleRemoveDiscoverFilter = (type: keyof FilterValues, value: string) => {
    setDiscoverFilters(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== value)
    }));
  };

  const handleClearDiscoverFilters = () => {
    setDiscoverFilters({ genres: [], platforms: [], countries: [], sports: [] });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            Enhanced Filter System Integration
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Production-ready filter system integration for Dashboard and Discover pages with UX best practices,
            layout placement, and data synchronization.
          </p>
        </div>

        {/* Feature Overview */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Implementation Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-blue-400" />
                  <span className="font-semibold">Dynamic Data Loading</span>
                </div>
                <p className="text-sm text-gray-400">4 API endpoints with React Query caching</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-green-400" />
                  <span className="font-semibold">localStorage Persistence</span>
                </div>
                <p className="text-sm text-gray-400">Cross-session state management</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-purple-400" />
                  <span className="font-semibold">Mobile Optimized</span>
                </div>
                <p className="text-sm text-gray-400">Responsive design with collapsible sections</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-orange-400" />
                  <span className="font-semibold">TypeScript Ready</span>
                </div>
                <p className="text-sm text-gray-400">Full type safety and error handling</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Integration Demo */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              Dashboard Integration: "Smart Content Discovery"
            </CardTitle>
            <p className="text-gray-400">
              Placement: Below Spotlight section • Purpose: Filter AI recommendations and "Because You Watched" results
            </p>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Dashboard Implementation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  Smart Content Discovery
                </h3>
                <p className="text-gray-400 text-sm hidden md:block">
                  Filter your AI recommendations and personalized "Because You Watched" results
                </p>
              </div>

              <FilterBadges
                filters={dashboardFilters}
                onRemoveFilter={handleRemoveDashboardFilter}
                onClearAll={handleClearDashboardFilters}
                onToggleFilters={() => setShowDashboardFilters(!showDashboardFilters)}
                className="mb-4"
              />

              {showDashboardFilters && (
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <EnhancedFilterSystem
                    persistKey="dashboard-filters-demo"
                    showAdvanced={true}
                    onFiltersChange={handleDashboardFiltersChange}
                    className="w-full"
                  />
                </div>
              )}

              {(dashboardFilters.genres.length > 0 || dashboardFilters.platforms.length > 0) && (
                <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-400" />
                    Filtered Dashboard Results
                  </h4>
                  <p className="text-gray-400 text-sm mb-3">
                    {dashboardFilters.genres.length > 0 && `Genres: ${dashboardFilters.genres.join(', ')}`}
                    {dashboardFilters.genres.length > 0 && dashboardFilters.platforms.length > 0 && ' • '}
                    {dashboardFilters.platforms.length > 0 && `Platforms: ${dashboardFilters.platforms.join(', ')}`}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="bg-gray-700/50 rounded-lg p-4 text-center">
                        <div className="w-full h-32 bg-gray-600 rounded mb-2 flex items-center justify-center">
                          <Sparkles className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-300">AI Recommendation {item}</p>
                        <p className="text-xs text-gray-500">Personalized for you</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Code Example */}
            <details className="bg-gray-900 rounded-lg p-4">
              <summary className="cursor-pointer text-sm font-semibold text-blue-400 mb-2">
                📋 Dashboard Integration Code
              </summary>
              <pre className="text-xs text-gray-300 overflow-x-auto">
                {`<EnhancedFilterSystem
  persistKey="dashboard-filters"
  showAdvanced={true}
  onFiltersChange={(filters) => {
    setDashboardFilters(filters);
    refetchDashboardContent();
  }}
  className="w-full"
/>`}
              </pre>
            </details>
          </CardContent>
        </Card>

        {/* Discover Integration Demo */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-400" />
              Discover Integration: "Find Something to Watch"
            </CardTitle>
            <p className="text-gray-400">
              Placement: Top of page as primary interface • Purpose: Core discovery tool for all content exploration
            </p>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Discover Implementation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-400" />
                  Find Something to Watch
                </h3>
                <p className="text-gray-400 text-sm hidden md:block">
                  Core discovery tool for exploring all content types
                </p>
              </div>

              <FilterBadges
                filters={discoverFilters}
                onRemoveFilter={handleRemoveDiscoverFilter}
                onClearAll={handleClearDiscoverFilters}
                onToggleFilters={() => setShowDiscoverFilters(!showDiscoverFilters)}
                className="mb-4"
              />

              <div className={`transition-all duration-300 ${showDiscoverFilters ? 'max-h-none opacity-100' : 'max-h-96 opacity-90'}`}>
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 backdrop-blur-sm">
                  <EnhancedFilterSystem
                    persistKey="discover-filters-demo"
                    showAdvanced={true}
                    defaultExpanded={showDiscoverFilters}
                    onFiltersChange={handleDiscoverFiltersChange}
                    onApply={handleDiscoverFiltersApply}
                    className="w-full"
                  />
                </div>
              </div>

              {(discoverFilters.genres.length > 0 || discoverFilters.platforms.length > 0) && (
                <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700/50 backdrop-blur-sm">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-teal-400" />
                    Filtered Discovery Results
                  </h4>
                  <p className="text-gray-400 text-sm mb-3">
                    {discoverFilters.genres.length > 0 && `Genres: ${discoverFilters.genres.join(', ')}`}
                    {discoverFilters.genres.length > 0 && discoverFilters.platforms.length > 0 && ' • '}
                    {discoverFilters.platforms.length > 0 && `Platforms: ${discoverFilters.platforms.join(', ')}`}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="bg-gray-800/50 rounded-lg p-4 text-center backdrop-blur-sm">
                        <div className="w-full h-32 bg-gray-700 rounded mb-2 flex items-center justify-center">
                          <Play className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-300">Discovery Result {item}</p>
                        <p className="text-xs text-gray-500">Powered by your filters</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Code Example */}
            <details className="bg-gray-900 rounded-lg p-4">
              <summary className="cursor-pointer text-sm font-semibold text-teal-400 mb-2">
                📋 Discover Integration Code
              </summary>
              <pre className="text-xs text-gray-300 overflow-x-auto">
                {`<EnhancedFilterSystem
  persistKey="discover-filters"
  showAdvanced={true}
  defaultExpanded={true}
  onApply={(filters) => {
    setDiscoverFilters(filters);
    fetchFilteredContent(filters);
  }}
  onFiltersChange={handleLiveUpdates}
  className="w-full"
/>`}
              </pre>
            </details>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Implementation Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* UX Guidelines */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white">📱 UX & Layout</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• <Badge variant="outline" className="mr-2">Dashboard</Badge> Collapsible filters below recommendations</li>
                  <li>• <Badge variant="outline" className="mr-2">Discover</Badge> Primary interface at top of page</li>
                  <li>• <Badge variant="outline" className="mr-2">Mobile</Badge> Expandable sections for smaller screens</li>
                  <li>• <Badge variant="outline" className="mr-2">Badges</Badge> Show active filter count with chip-style removal</li>
                  <li>• <Badge variant="outline" className="mr-2">Persistence</Badge> Separate localStorage keys for each page</li>
                </ul>
              </div>

              {/* Technical Implementation */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white">⚙️ Technical</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• <Badge variant="outline" className="mr-2">Hooks</Badge> useFilterOptions for reusable data fetching</li>
                  <li>• <Badge variant="outline" className="mr-2">Query</Badge> React Query for caching & background refetch</li>
                  <li>• <Badge variant="outline" className="mr-2">State</Badge> Real-time onChange + apply button for batch updates</li>
                  <li>• <Badge variant="outline" className="mr-2">API</Badge> 4 endpoints: genres, platforms, countries, sports</li>
                  <li>• <Badge variant="outline" className="mr-2">Types</Badge> Full TypeScript support with proper interfaces</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-400" />
            <span className="text-lg font-semibold text-green-400">Implementation Complete</span>
          </div>
          <p className="text-gray-400">
            Enhanced filter system is production-ready with dynamic data loading, localStorage persistence,
            and comprehensive UX flow for both Dashboard and Discover pages.
          </p>
        </div>

      </div>
    </div>
  );
}
