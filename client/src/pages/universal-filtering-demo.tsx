import React, { useState } from 'react';
import { DiscoverList } from '@/components/discover/DiscoverList';
import { FilterControls } from '@/components/discover/FilterControls';
import { FilterOptions } from '@/hooks/useFilteredContent';

export default function UniversalFilteringDemo() {
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'popularity',
    sortOrder: 'desc'
  });

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎬 Universal BingeBoard Filtering System
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Complete TMDB integration with dynamic platform logos, award filtering, watchlist management, 
            and comprehensive content discovery. Built for any Discover/Dashboard page.
          </p>
        </div>

        {/* Features Overview */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-white mb-1">Smart Filtering</h3>
            <p className="text-sm text-gray-400">Platform, genre, rating, year, awards, and more</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl mb-2">🏢</div>
            <h3 className="font-semibold text-white mb-1">Dynamic Logos</h3>
            <p className="text-sm text-gray-400">TMDB integration with local fallbacks</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold text-white mb-1">Watchlist</h3>
            <p className="text-sm text-gray-400">Local storage with export/import</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="font-semibred text-white mb-1">Awards & More</h3>
            <p className="text-sm text-gray-400">Oscar, Emmy, upcoming releases</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FilterControls
              filters={filters}
              onFiltersChange={setFilters}
              className="sticky top-4"
            />
          </div>

          {/* Content Grid */}
          <div className="lg:col-span-3">
            <DiscoverList />
          </div>
        </div>

        {/* System Info */}
        <div className="mt-12 bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">🛠️ System Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Core Filtering</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>✓ Multi-platform support (Netflix, Prime, Disney+, etc.)</li>
                <li>✓ Genre-based filtering with TMDB mapping</li>
                <li>✓ Rating range sliders (0-10 scale)</li>
                <li>✓ Release year multi-select</li>
                <li>✓ Content type filtering (Movies, TV, Anime, Docs)</li>
                <li>✓ Language filtering with ISO codes</li>
                <li>✓ Advanced search across multiple fields</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Enhanced Features</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>✓ Award-winning content filtering (Oscar, Emmy, SAG)</li>
                <li>✓ Upcoming releases with countdown</li>
                <li>✓ Watchlist management with localStorage</li>
                <li>✓ Dynamic platform logos via TMDB API</li>
                <li>✓ Multiple sort options (popularity, rating, year)</li>
                <li>✓ Vote count and popularity thresholds</li>
                <li>✓ Real-time statistics and filter summaries</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-slate-700 rounded-lg">
            <h4 className="text-white font-semibold mb-2">🔌 Usage</h4>
            <code className="text-sm text-green-400 block">
              const &#123; filtered, logos, toggleWatchlist &#125; = useFilteredContent(items, filters);
            </code>
            <p className="text-xs text-gray-400 mt-2">
              Drop this hook into any component for instant filtering with TMDB integration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}