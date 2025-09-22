import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { searchShowsApi } from '@/lib/search-api';
import { NormalizedShowSummary } from '@/lib/search-api';
import EnhancedShowCard from '@/components/EnhancedShowCard';

export default function SearchResultsPage() {
  const [location] = useLocation();
  const [results, setResults] = useState<NormalizedShowSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Extract query from URL
  const queryParams = new URLSearchParams(location.split('?')[1] || '');
  const query = queryParams.get('query') || '';

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        if (query.trim() !== '') {
          const result = await searchShowsApi(query);
          if (result.ok) {
            setResults(result.data);
          } else {
            console.error('Search results fetch error:', result.error);
            setResults([]);
          }
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Search results fetch error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleAddToWatchlist = (show: any) => {
    console.log('Add to watchlist:', show);
    // TODO: Implement watchlist functionality
  };

  const handleWatchTrailer = (show: any) => {
    console.log('Watch trailer:', show);
    // TODO: Implement trailer functionality
  };

  const handleCardClick = (show: any) => {
    console.log('Card clicked:', show);
    // TODO: Navigate to show details page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading results for "{query}"...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Search Results</h1>
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-400 mb-2">No results found for "{query}"</p>
            <p className="text-gray-500">Try searching with different keywords</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-gray-400">
            Found {results.length} result{results.length === 1 ? '' : 's'} for "{query}"
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {results.map((show) => (
            <EnhancedShowCard
              key={show.id}
              show={{
                id: parseInt(show.id),
                title: show.title,
                poster_path: show.poster?.replace('https://image.tmdb.org/t/p/w300', ''),
                vote_average: show.vote_average,
                genre_ids: show.genres,
                overview: show.synopsis,
                media_type: show.type,
                release_date: show.year ? `${show.year}-01-01` : undefined,
                first_air_date: show.type === 'tv' && show.year ? `${show.year}-01-01` : undefined,
              }}
              variant="search"
              onAddToWatchlist={handleAddToWatchlist}
              onWatchTrailer={handleWatchTrailer}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}