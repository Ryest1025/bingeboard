/**
 * INTEGRATION EXAMPLES - These are code snippets showing how to use the Universal Filtering System
 * Note: This file contains example code with intentional TypeScript errors for demonstration
 * Replace placeholder variables (dashboardContent, searchResults, etc.) with your actual data
 */

import React, { useState } from 'react';
import { useFilteredContent, ContentItem, FilterOptions } from '@/hooks/useFilteredContent';
import { FilterControls } from '@/components/discover/FilterControls';
import { useWatchlist } from '@/hooks/useWatchlist';

// Example 1: Basic Integration
function MyDiscoverPage() {
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'popularity',
    sortOrder: 'desc'
  });

  // Your content data (could come from API, props, etc.)
  const contentItems: ContentItem[] = [
    {
      id: '1',
      title: 'Stranger Things',
      platform: 'Netflix',
      genres: ['Sci-Fi', 'Horror'],
      releaseYear: 2019,
      rating: 8.7,
      type: 'tv',
      isAwardWinning: true
    }
    // ... more items
  ];

  const { 
    filtered, 
    getPlatformLogo,
    toggleWatchlist,
    isInWatchlist,
    getFilterStats 
  } = useFilteredContent(contentItems, filters);

  return (
    <div className="flex gap-6">
      {/* Filter Sidebar */}
      <div className="w-80">
        <FilterControls
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Content Grid */}
      <div className="flex-1">
        <div className="grid grid-cols-4 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-slate-800 rounded-lg p-4">
              {/* Platform Logo */}
              <img 
                src={getPlatformLogo({provider_name: item.platform})} 
                alt={item.platform}
                className="w-8 h-8 mb-2" 
              />
              
              {/* Content */}
              <h3 className="text-white font-semibold">{item.title}</h3>
              <p className="text-gray-400">{item.platform} • {item.releaseYear}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-400">⭐ {item.rating}</span>
                {item.isAwardWinning && <span className="text-yellow-400">🏆</span>}
                {item.isUpcoming && <span className="text-blue-400">⏳</span>}
              </div>
              
              {/* Watchlist Button */}
              <button
                onClick={() => toggleWatchlist(item)}
                className={`mt-2 px-3 py-1 rounded ${
                  isInWatchlist(item.id) 
                    ? 'bg-green-600 text-white' 
                    : 'bg-slate-600 text-gray-300'
                }`}
              >
                {isInWatchlist(item.id) ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Example 2: Dashboard Integration
function MyDashboard() {
  const [filters] = useState<FilterOptions>({
    awardWinning: true,
    rating: [8.0, 10.0],
    sortBy: 'rating',
    platform: ['Netflix', 'HBO Max']
  });

  const { filtered, logos } = useFilteredContent(dashboardContent, filters);

  return (
    <div>
      <h2>Top Rated Award Winners</h2>
      <div className="grid grid-cols-5 gap-3">
        {filtered.slice(0, 10).map(item => (
          <ContentCard key={item.id} item={item} logo={logos[item.platform.toLowerCase()]} />
        ))}
      </div>
    </div>
  );
}

// Example 3: Search Results with Filters
function SearchResults({ searchQuery }: { searchQuery: string }) {
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery,
    sortBy: 'popularity'
  });

  const { filtered, getFilterStats } = useFilteredContent(searchResults, filters);
  const stats = getFilterStats();

  return (
    <div>
      <div className="mb-4 text-gray-400">
        Found {stats.filtered} results for "{searchQuery}"
      </div>
      
      {/* Quick Filters */}
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setFilters(prev => ({ 
            ...prev, 
            type: prev.type?.includes('movie') ? [] : ['movie'] 
          }))}
          className={filters.type?.includes('movie') ? 'bg-blue-600' : 'bg-slate-600'}
        >
          Movies
        </button>
        <button 
          onClick={() => setFilters(prev => ({ 
            ...prev, 
            type: prev.type?.includes('tv') ? [] : ['tv'] 
          }))}
          className={filters.type?.includes('tv') ? 'bg-blue-600' : 'bg-slate-600'}
        >
          TV Shows
        </button>
        <button 
          onClick={() => setFilters(prev => ({ 
            ...prev, 
            awardWinning: !prev.awardWinning 
          }))}
          className={filters.awardWinning ? 'bg-yellow-600' : 'bg-slate-600'}
        >
          🏆 Award Winners
        </button>
      </div>

      <SearchResultsGrid items={filtered} />
    </div>
  );
}

// Example 4: Advanced Watchlist Page
function WatchlistPage() {
  const [filters, setFilters] = useState<FilterOptions>({
    inWatchlist: true,
    sortBy: 'dateAdded',
    sortOrder: 'desc'
  });

  const { filtered } = useFilteredContent(allContent, filters);
  
  // Access watchlist functions directly from the hook
  const { getWatchlistStats, exportWatchlist, clearWatchlist } = useWatchlist();
  const stats = getWatchlistStats();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>My Watchlist ({stats.total} items)</h1>
        <div className="flex gap-2">
          <button onClick={() => exportWatchlist()}>Export</button>
          <button onClick={() => clearWatchlist()}>Clear All</button>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-400">
        Recent: {stats.recentlyAdded.length} • 
        Movies: {stats.byType.movie || 0} • 
        TV: {stats.byType.tv || 0} • 
        Netflix: {stats.byPlatform.Netflix || 0}
      </div>

      <FilterControls 
        filters={filters} 
        onFiltersChange={setFilters}
        className="mb-6" 
      />

      <WatchlistGrid items={filtered} />
    </div>
  );
}

export { MyDiscoverPage, MyDashboard, SearchResults, WatchlistPage };