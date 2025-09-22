import React, { useState } from 'react';
import { useFilteredContent, ContentItem, FilterOptions } from '@/hooks/useFilteredContent';

// Mock data for demonstration
const mockItems: ContentItem[] = [
  {
    id: '1',
    title: 'Stranger Things',
    platform: 'Netflix',
    genres: ['Sci-Fi', 'Horror', 'Drama'],
    releaseYear: 2019,
    rating: 8.7,
    type: 'tv',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments.',
    runtime: 51,
    isAwardWinning: true,
    posterUrl: '/posters/stranger-things.jpg',
    popularity: 85.4,
    voteCount: 4820,
    originalLanguage: 'en',
    awards: [
      { name: 'Emmy', category: 'Outstanding Drama Series', year: 2017, won: false, nominated: true },
      { name: 'SAG Award', category: 'Outstanding Performance', year: 2017, won: true, nominated: true }
    ]
  },
  {
    id: '2',
    title: 'The Boys',
    platform: 'Prime Video',
    genres: ['Action', 'Comedy', 'Crime'],
    releaseYear: 2022,
    rating: 8.8,
    type: 'tv',
    overview: 'A group of vigilantes set out to take down corrupt superheroes.',
    runtime: 60,
    isUpcoming: true,
    releaseDate: '2025-11-10',
    posterUrl: '/posters/the-boys.jpg',
    popularity: 78.2,
    voteCount: 3654,
    originalLanguage: 'en'
  },
  {
    id: '3',
    title: 'Dune',
    platform: 'HBO Max',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    releaseYear: 2021,
    rating: 8.0,
    type: 'movie',
    overview: 'Feature adaptation of Frank Herbert\'s science fiction novel.',
    runtime: 155,
    isAwardWinning: true,
    posterUrl: '/posters/dune.jpg',
    popularity: 92.1,
    voteCount: 7890,
    originalLanguage: 'en',
    awards: [
      { name: 'Oscar', category: 'Best Cinematography', year: 2022, won: true, nominated: true },
      { name: 'Oscar', category: 'Best Visual Effects', year: 2022, won: true, nominated: true }
    ]
  },
  {
    id: '4',
    title: 'Spirited Away',
    platform: 'Netflix',
    genres: ['Animation', 'Family', 'Fantasy'],
    releaseYear: 2001,
    rating: 9.3,
    type: 'anime',
    overview: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods and witches.',
    runtime: 125,
    isAwardWinning: true,
    posterUrl: '/posters/spirited-away.jpg',
    popularity: 67.8,
    voteCount: 12450,
    originalLanguage: 'ja',
    awards: [
      { name: 'Oscar', category: 'Best Animated Feature', year: 2003, won: true, nominated: true }
    ]
  },
  {
    id: '5',
    title: 'The Mandalorian',
    platform: 'Disney+',
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    releaseYear: 2019,
    rating: 8.6,
    type: 'tv',
    overview: 'The travels of a lone bounty hunter in the outer reaches of the galaxy.',
    runtime: 40,
    posterUrl: '/posters/mandalorian.jpg',
    popularity: 88.9,
    voteCount: 5643,
    originalLanguage: 'en'
  },
  {
    id: '6',
    title: 'Avatar: The Way of Water',
    platform: 'Disney+',
    genres: ['Action', 'Adventure', 'Fantasy'],
    releaseYear: 2022,
    rating: 7.8,
    type: 'movie',
    overview: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.',
    runtime: 192,
    isUpcoming: false,
    posterUrl: '/posters/avatar-2.jpg',
    popularity: 95.6,
    voteCount: 8921,
    originalLanguage: 'en'
  }
];

interface DiscoverListProps {
  className?: string;
}

export const DiscoverList: React.FC<DiscoverListProps> = ({ className = '' }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    platform: [],
    genres: [],
    type: [],
    rating: [0, 10],
    sortBy: 'popularity',
    sortOrder: 'desc'
  });

  const { 
    filtered, 
    logos, 
    logoLoading, 
    getPlatformLogo,
    isInWatchlist, 
    toggleWatchlist,
    getFilterStats 
  } = useFilteredContent(mockItems, filters);

  const stats = getFilterStats();

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatReleaseDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Discover</h2>
        <p className="text-gray-400">
          Showing {stats.filtered} of {stats.total} items
          {stats.filtered !== stats.total && ` (${stats.filtered - stats.total} filtered)`}
        </p>
      </div>

      {/* Quick Filter Bar */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="popularity">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="releaseYear">Newest</option>
          <option value="title">Alphabetical</option>
        </select>

        <select
          value={filters.type?.[0] || 'all'}
          onChange={(e) => handleFilterChange('type', e.target.value === 'all' ? [] : [e.target.value as any])}
          className="px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="movie">Movies</option>
          <option value="tv">TV Shows</option>
          <option value="anime">Anime</option>
          <option value="documentary">Documentaries</option>
        </select>

        <select
          value={filters.platform?.[0] || 'all'}
          onChange={(e) => handleFilterChange('platform', e.target.value === 'all' ? [] : [e.target.value])}
          className="px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Platforms</option>
          {stats.platforms.map(platform => (
            <option key={platform} value={platform}>{platform}</option>
          ))}
        </select>

        <button
          onClick={() => handleFilterChange('awardWinning', !filters.awardWinning)}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            filters.awardWinning
              ? 'bg-yellow-600 border-yellow-500 text-white'
              : 'bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600'
          }`}
        >
          🏆 Award Winners
        </button>

        <button
          onClick={() => handleFilterChange('upcoming', !filters.upcoming)}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            filters.upcoming
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600'
          }`}
        >
          ⏳ Coming Soon
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filtered.map(item => {
          const inWatchlist = isInWatchlist(item.id);
          const platformLogo = getPlatformLogo(item.platform);
          
          return (
            <div key={item.id} className="group relative bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all duration-300 hover:scale-[1.02]">
              {/* Poster */}
              <div className="aspect-[2/3] bg-slate-700 relative overflow-hidden">
                {item.posterUrl ? (
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/posters/default.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎬</div>
                      <div className="text-sm">No Poster</div>
                    </div>
                  </div>
                )}
                
                {/* Platform Logo */}
                <div className="absolute top-3 right-3">
                  <img
                    src={platformLogo}
                    alt={item.platform}
                    className="w-8 h-8 rounded bg-white/90 p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logos/default.png';
                    }}
                  />
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {item.isAwardWinning && (
                    <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                      🏆 AWARD
                    </span>
                  )}
                  {item.isUpcoming && (
                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                      ⏳ SOON
                    </span>
                  )}
                </div>

                {/* Watchlist Button */}
                <button
                  onClick={() => toggleWatchlist(item)}
                  className={`absolute bottom-3 right-3 p-2 rounded-full transition-all duration-300 ${
                    inWatchlist
                      ? 'bg-green-500 text-white scale-100'
                      : 'bg-black/60 text-white scale-0 group-hover:scale-100'
                  }`}
                  title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                >
                  {inWatchlist ? '✓' : '+'}
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2">
                  {item.title}
                </h3>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span className="capitalize">{item.type}</span>
                  <span>{item.releaseYear}</span>
                </div>

                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-white font-medium">{item.rating}</span>
                    {item.voteCount && (
                      <span className="text-gray-500">({item.voteCount.toLocaleString()})</span>
                    )}
                  </div>
                  {item.runtime && (
                    <span className="text-gray-400">{item.runtime}min</span>
                  )}
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.genres.slice(0, 3).map(genre => (
                    <span
                      key={genre}
                      className="text-xs bg-slate-600 text-gray-300 px-2 py-1 rounded"
                    >
                      {genre}
                    </span>
                  ))}
                  {item.genres.length > 3 && (
                    <span className="text-xs bg-slate-600 text-gray-300 px-2 py-1 rounded">
                      +{item.genres.length - 3}
                    </span>
                  )}
                </div>

                {/* Overview */}
                {item.overview && (
                  <p className="text-sm text-gray-400 line-clamp-3 mb-3">
                    {item.overview}
                  </p>
                )}

                {/* Upcoming Release Date */}
                {item.isUpcoming && item.releaseDate && (
                  <div className="text-sm text-blue-400 font-medium">
                    Releases {formatReleaseDate(item.releaseDate)}
                  </div>
                )}

                {/* Awards */}
                {item.awards && item.awards.length > 0 && (
                  <div className="mt-2 text-xs text-yellow-400">
                    {item.awards.filter(award => award.won).length > 0 && (
                      <span>🏆 {item.awards.filter(award => award.won).length} wins</span>
                    )}
                    {item.awards.filter(award => award.nominated && !award.won).length > 0 && (
                      <span className="ml-2">🎖️ {item.awards.filter(award => award.nominated && !award.won).length} nominations</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 text-slate-600">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Content Found</h3>
          <p className="text-gray-400 mb-4">Try adjusting your filters to see more results.</p>
          <button
            onClick={() => setFilters({ sortBy: 'popularity', sortOrder: 'desc' })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Loading State for Logos */}
      {logoLoading && (
        <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg">
          Loading platform logos...
        </div>
      )}
    </div>
  );
};

export default DiscoverList;