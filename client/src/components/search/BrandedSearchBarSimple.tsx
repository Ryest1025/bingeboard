import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { searchShowsApi } from '@/lib/search-api';

interface SearchItem {
  id: string;
  title: string;
  type: 'movie' | 'tv';
}

export default function BrandedSearchBarSimple() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchItem[]>([]);
  const [, navigate] = useLocation();

  // Fetch live suggestions
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === '') {
      setSuggestions([]);
      return;
    }

    try {
      const result = await searchShowsApi(value);
      if (result.ok) {
        const searchItems: SearchItem[] = result.data.map(item => ({
          id: item.id,
          title: item.title,
          type: item.type
        }));
        setSuggestions(searchItems);
      } else {
        console.error('Search fetch error:', result.error);
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Search fetch error:', err);
      setSuggestions([]);
    }
  };

  // Handle Enter press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim() !== '') {
        // Navigate to search results page with query
        navigate(`/search?query=${encodeURIComponent(query.trim())}`);
        setSuggestions([]); // Close suggestions
      }
    }
  };

  const handleSuggestionClick = (item: SearchItem) => {
    navigate(`/show/${item.id}`);
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search shows..."
        className="w-full p-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
      />

      {/* Live suggestions dropdown */}
      {suggestions.length > 0 && (
        <ul className="absolute z-50 w-full bg-gray-800 border border-gray-600 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((item) => (
            <li
              key={item.id}
              className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0 text-white"
              onClick={() => handleSuggestionClick(item)}
            >
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-gray-400 capitalize">{item.type}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}