import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { SearchResultCard } from './SearchResultCard';
import { Clock, Sparkles, TrendingUp } from 'lucide-react';

interface SearchPreviewDropdownProps {
  query: string;
  isVisible: boolean;
  onSelectShow: (show: any) => void;
  onHoverShow: (show: any) => void;
  onClose: () => void;
  hoveredShow: any;
}

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  media_type?: 'movie' | 'tv';
  overview?: string;
}

export function SearchPreviewDropdown({ 
  query, 
  isVisible, 
  onSelectShow, 
  onHoverShow, 
  onClose,
  hoveredShow 
}: SearchPreviewDropdownProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Load genres and recent searches on mount
  useEffect(() => {
    fetchGenres();
    loadRecentSearches();
  }, []);

  // Search when query changes
  useEffect(() => {
    if (query.trim().length >= 2) {
      searchShows(query);
    } else {
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          onSelectShow(results[selectedIndex]);
          saveRecentSearch(query);
        } else if (query.trim()) {
          // Navigate to discover page
          window.location.href = `/discover?q=${encodeURIComponent(query)}`;
          saveRecentSearch(query);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, selectedIndex, results, query, onSelectShow, onClose]);

  const fetchGenres = async () => {
    try {
      const [tvGenres, movieGenres] = await Promise.all([
        fetch('/api/tmdb/genre/tv/list').then(r => r.json()),
        fetch('/api/tmdb/genre/movie/list').then(r => r.json())
      ]);
      
      const allGenres = [
        ...(tvGenres.genres || []),
        ...(movieGenres.genres || [])
      ];
      
      // Remove duplicates
      const uniqueGenres = allGenres.filter((genre, index, arr) => 
        arr.findIndex(g => g.id === genre.id) === index
      );
      
      setGenres(uniqueGenres);
    } catch (error) {
      console.error('Failed to fetch genres:', error);
    }
  };

  const searchShows = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tmdb/search?query=${encodeURIComponent(searchQuery)}&type=multi`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results?.slice(0, 8) || []);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem('bingeboard_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const saveRecentSearch = (searchQuery: string) => {
    try {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      const updated = [
        trimmed,
        ...recentSearches.filter(s => s !== trimmed)
      ].slice(0, 5);
      
      setRecentSearches(updated);
      localStorage.setItem('bingeboard_recent_searches', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  if (!isVisible) return null;

  const showRecentSearches = query.trim().length === 0 && recentSearches.length > 0;
  const showResults = query.trim().length >= 2 && results.length > 0;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
      {loading && (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-sm text-gray-400 mt-2">Searching...</p>
        </div>
      )}

      {/* Recent Searches */}
      {showRecentSearches && (
        <div className="p-3 border-b border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">Recent Searches</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-slate-700 text-gray-300 border-gray-600"
                onClick={() => {
                  // Trigger search with recent query
                  window.location.href = `/discover?q=${encodeURIComponent(search)}`;
                }}
              >
                {search}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div className="max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center gap-2 mb-2 px-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-gray-400">
                Results for "{query}"
              </span>
            </div>
            
            {results.map((show, index) => (
              <SearchResultCard
                key={show.id}
                show={show}
                genres={genres}
                onHover={onHoverShow}
                onClick={(selectedShow) => {
                  onSelectShow(selectedShow);
                  saveRecentSearch(query);
                }}
                isHovered={selectedIndex === index || hoveredShow?.id === show.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {query.trim().length >= 2 && results.length === 0 && !loading && (
        <div className="p-4 text-center">
          <p className="text-gray-400 mb-2">No results found for "{query}"</p>
          <p className="text-sm text-gray-500">
            Press Enter to search all content
          </p>
        </div>
      )}

      {/* Quick Actions */}
      {query.trim().length >= 2 && (
        <div className="border-t border-slate-700 p-3">
          <button
            onClick={() => {
              window.location.href = `/discover?q=${encodeURIComponent(query)}`;
              saveRecentSearch(query);
            }}
            className="w-full text-left px-3 py-2 text-sm text-cyan-400 hover:bg-slate-700 rounded flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            See all results for "{query}"
          </button>
        </div>
      )}
    </div>
  );
}
