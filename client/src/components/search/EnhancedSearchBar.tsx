import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { SearchPreviewDropdown } from './SearchPreviewDropdown';
import ShowDetailsModal from '@/components/show-details-modal';
import { useDebounce } from '@/hooks/useDebounce';

interface EnhancedSearchBarProps {
  placeholder?: string;
  className?: string;
  onAddToWatchlist?: (showId: number) => void;
  onWatchNow?: (show: any) => void;
}

export function EnhancedSearchBar({
  placeholder = "Search shows, movies...",
  className = "",
  onAddToWatchlist,
  onWatchNow
}: EnhancedSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedShow, setSelectedShow] = useState<any>(null);
  const [hoveredShow, setHoveredShow] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the search query to avoid too many API calls
  const debouncedQuery = useDebounce(query, 300);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
        setHoveredShow(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show dropdown when query changes or input is focused
  useEffect(() => {
    if (debouncedQuery.trim().length >= 0 && inputRef.current === document.activeElement) {
      setIsDropdownVisible(true);
    }
  }, [debouncedQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    setIsDropdownVisible(true);
  };

  const handleSelectShow = (show: any) => {
    setSelectedShow(show);
    setIsModalOpen(true);
    setIsDropdownVisible(false);
    setQuery(''); // Clear search after selection
  };

  const handleHoverShow = (show: any) => {
    setHoveredShow(show);
    if (show) {
      // Optional: Show modal on hover after a delay
      // You can implement this with a timeout if desired
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedShow(null);
    setHoveredShow(null);
  };

  const handleCloseDropdown = () => {
    setIsDropdownVisible(false);
    setHoveredShow(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/discover?q=${encodeURIComponent(query)}`;
      setIsDropdownVisible(false);
    }
  };

  return (
    <>
      <div ref={searchRef} className={`relative ${className}`}>
        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-400 pr-10 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
            autoComplete="off"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>

        <SearchPreviewDropdown
          query={debouncedQuery}
          isVisible={isDropdownVisible}
          onSelectShow={handleSelectShow}
          onHoverShow={handleHoverShow}
          onClose={handleCloseDropdown}
          hoveredShow={hoveredShow}
        />
      </div>

      <ShowDetailsModal
        show={selectedShow}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToWatchlist={onAddToWatchlist}
        onWatchNow={onWatchNow}
      />
    </>
  );
}
