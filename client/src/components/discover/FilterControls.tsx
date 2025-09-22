import React, { useState } from 'react';
import { FilterOptions } from '@/hooks/useFilteredContent';

interface FilterControlsProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableGenres?: string[];
  availablePlatforms?: string[];
  availableLanguages?: string[];
  className?: string;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFiltersChange,
  availableGenres = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance', 'Thriller', 'Animation', 'Documentary'],
  availablePlatforms = ['Netflix', 'Prime Video', 'Disney+', 'HBO Max', 'Hulu', 'Apple TV+', 'Paramount+'],
  availableLanguages = ['en', 'es', 'fr', 'de', 'ja', 'ko', 'it', 'pt'],
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: keyof FilterOptions, value: any) => {
    const currentArray = (filters[key] as any[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      sortBy: 'popularity',
      sortOrder: 'desc'
    });
    setSearchQuery('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.platform?.length) count++;
    if (filters.genres?.length) count++;
    if (filters.type?.length) count++;
    if (filters.rating && (filters.rating[0] > 0 || filters.rating[1] < 10)) count++;
    if (filters.releaseYear?.length) count++;
    if (filters.language?.length) count++;
    if (filters.awardWinning) count++;
    if (filters.upcoming) count++;
    if (filters.inWatchlist !== undefined) count++;
    if (filters.searchQuery?.trim()) count++;
    if (filters.minVoteCount && filters.minVoteCount > 0) count++;
    return count;
  };

  const activeCount = getActiveFilterCount();

  return (
    <div className={`bg-slate-800 rounded-xl border border-slate-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white">Filters</h3>
            {activeCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {activeCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar - Always visible */}
      <div className="p-4 border-b border-slate-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Search titles, genres, or platforms..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              updateFilter('searchQuery', e.target.value);
            }}
            className="w-full px-4 py-2 pl-10 bg-slate-700 text-white rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>
      </div>

      {/* Expandable Filters */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Quick Toggles */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white">Quick Filters</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter('awardWinning', !filters.awardWinning)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.awardWinning
                    ? 'bg-yellow-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                🏆 Award Winners
              </button>
              <button
                onClick={() => updateFilter('upcoming', !filters.upcoming)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.upcoming
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                ⏳ Coming Soon
              </button>
              <button
                onClick={() => updateFilter('inWatchlist', filters.inWatchlist === true ? undefined : true)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.inWatchlist === true
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                📋 In Watchlist
              </button>
              <button
                onClick={() => updateFilter('adult', !filters.adult)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.adult
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                🔞 Adult Content
              </button>
            </div>
          </div>

          {/* Content Type */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white">Content Type</h4>
            <div className="flex flex-wrap gap-2">
              {['movie', 'tv', 'anime', 'documentary'].map(type => (
                <button
                  key={type}
                  onClick={() => toggleArrayFilter('type', type)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors capitalize ${
                    filters.type?.includes(type as any)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {type === 'tv' ? 'TV Shows' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white">Platforms</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availablePlatforms.map(platform => (
                <button
                  key={platform}
                  onClick={() => toggleArrayFilter('platform', platform)}
                  className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                    filters.platform?.includes(platform)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white">Genres</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableGenres.map(genre => (
                <button
                  key={genre}
                  onClick={() => toggleArrayFilter('genres', genre)}
                  className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                    filters.genres?.includes(genre)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Range */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white">Rating</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{filters.rating?.[0] || 0}</span>
                <span>{filters.rating?.[1] || 10}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={filters.rating?.[0] || 0}
                onChange={(e) => {
                  const min = parseFloat(e.target.value);
                  const max = filters.rating?.[1] || 10;
                  updateFilter('rating', [min, max]);
                }}
                className="w-full"
              />
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={filters.rating?.[1] || 10}
                onChange={(e) => {
                  const max = parseFloat(e.target.value);
                  const min = filters.rating?.[0] || 0;
                  updateFilter('rating', [min, max]);
                }}
                className="w-full"
              />
            </div>
          </div>

          {/* Year Filter */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white">Release Years</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
              {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <button
                  key={year}
                  onClick={() => toggleArrayFilter('releaseYear', year.toString())}
                  className={`px-2 py-1 rounded text-sm transition-colors ${
                    filters.releaseYear?.includes(year)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white">Languages</h4>
            <div className="grid grid-cols-4 gap-2">
              {availableLanguages.map(lang => (
                <button
                  key={lang}
                  onClick={() => toggleArrayFilter('language', lang)}
                  className={`px-2 py-1 rounded text-sm transition-colors ${
                    filters.language?.includes(lang)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white">Sort By</h4>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={filters.sortBy || 'popularity'}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500"
              >
                <option value="popularity">Popularity</option>
                <option value="rating">Rating</option>
                <option value="releaseYear">Release Year</option>
                <option value="title">Title</option>
                <option value="dateAdded">Date Added</option>
              </select>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => updateFilter('sortOrder', e.target.value)}
                className="px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white">Advanced</h4>
            <div className="space-y-2">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Minimum Vote Count</span>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  step="100"
                  value={filters.minVoteCount || 0}
                  onChange={(e) => updateFilter('minVoteCount', parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 bg-slate-700 text-white rounded border border-slate-600 focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;