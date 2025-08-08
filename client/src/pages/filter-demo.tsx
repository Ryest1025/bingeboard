import React, { useState } from 'react';
import EnhancedFilterSystem from '../components/common/EnhancedFilterSystem';

interface Filters {
  genre: string[];
  platform: string[];
  country: string[];
  sport: string[];
}

export default function FilterExample() {
  const [filters, setFilters] = useState<Filters>({
    genre: [],
    platform: [],
    country: [],
    sport: []
  });

  const [appliedFilters, setAppliedFilters] = useState<Filters | null>(null);

  const handleFiltersChange = (newFilters: Filters) => {
    console.log('🔍 Filters changed:', newFilters);
    setFilters(newFilters);
  };

  const handleApplyFilters = (filtersToApply: Filters) => {
    console.log('✅ Filters applied:', filtersToApply);
    setAppliedFilters(filtersToApply);

    // Here you would typically:
    // 1. Update URL params for deep linking
    // 2. Trigger API calls with the new filters
    // 3. Update content display

    // Example URL encoding (optional):
    const params = new URLSearchParams();
    if (filtersToApply.genre.length > 0) {
      params.set('genre', filtersToApply.genre.join(','));
    }
    if (filtersToApply.platform.length > 0) {
      params.set('platform', filtersToApply.platform.join(','));
    }
    if (filtersToApply.country.length > 0) {
      params.set('country', filtersToApply.country.join(','));
    }
    if (filtersToApply.sport.length > 0) {
      params.set('sport', filtersToApply.sport.join(','));
    }

    // Update URL without page reload
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">
          🎯 Enhanced Filter System Demo
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <EnhancedFilterSystem
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onApply={handleApplyFilters}
            />
          </div>

          {/* Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Filter State */}
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🔄 Current Filter State</h3>
              <div className="text-sm space-y-2">
                <div>
                  <span className="text-gray-400">Genres:</span>
                  <span className="ml-2">{filters.genre.length > 0 ? filters.genre.join(', ') : 'None'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Platforms:</span>
                  <span className="ml-2">{filters.platform.length > 0 ? filters.platform.join(', ') : 'None'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Country:</span>
                  <span className="ml-2">{filters.country.length > 0 ? filters.country.join(', ') : 'None'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Sports:</span>
                  <span className="ml-2">{filters.sport.length > 0 ? filters.sport.join(', ') : 'None'}</span>
                </div>
              </div>
            </div>

            {/* Applied Filters */}
            {appliedFilters && (
              <div className="bg-teal-900/30 border border-teal-500/30 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-teal-300">✅ Applied Filters</h3>
                <div className="text-sm space-y-2">
                  <div>
                    <span className="text-teal-400">Active Genres:</span>
                    <span className="ml-2">{appliedFilters.genre.length > 0 ? appliedFilters.genre.join(', ') : 'All'}</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Active Platforms:</span>
                    <span className="ml-2">{appliedFilters.platform.length > 0 ? appliedFilters.platform.join(', ') : 'All'}</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Active Country:</span>
                    <span className="ml-2">{appliedFilters.country.length > 0 ? appliedFilters.country.join(', ') : 'All'}</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Active Sports:</span>
                    <span className="ml-2">{appliedFilters.sport.length > 0 ? appliedFilters.sport.join(', ') : 'All'}</span>
                  </div>
                </div>
                <p className="text-xs text-teal-400 mt-3">
                  💡 Filters are persisted in localStorage and will be restored on page reload
                </p>
              </div>
            )}

            {/* Sample Content */}
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">📺 Filtered Content</h3>
              <p className="text-gray-400 text-sm">
                This is where your filtered content would appear. The EnhancedFilterSystem component:
              </p>
              <ul className="text-sm text-gray-300 mt-3 space-y-1 list-disc list-inside">
                <li>✅ Loads dynamic data from API endpoints</li>
                <li>✅ Persists selections in localStorage</li>
                <li>✅ Triggers onChange for real-time updates</li>
                <li>✅ Provides onApply for manual filter application</li>
                <li>✅ Ready for URL parameter encoding</li>
                <li>✅ Fully controlled component pattern</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
