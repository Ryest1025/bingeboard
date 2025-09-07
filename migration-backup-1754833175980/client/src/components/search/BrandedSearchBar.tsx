// components/search/BrandedSearchBar.tsx - BingeBoard Branded Search
import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import useSearchShows from "@/hooks/useSearchShows";
import BrandedSearchDropdown from "@/components/search/BrandedSearchDropdown";
import BrandedShowModal from "@/components/search/BrandedShowModal";
import { colors, gradients, radii, spacing } from "@/styles/tokens";
import { tw } from "@/styles/theme";

interface Props {
  placeholder?: string;
  className?: string;
  onAddToWatchlist?: (showId: number) => void;
  onWatchNow?: (show: any) => void;
}

export default function BrandedSearchBar({
  placeholder = "Search shows, movies, people...",
  className = "",
  onAddToWatchlist,
  onWatchNow,
}: Props) {
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("movie");
  const [modalOpen, setModalOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const qc = useQueryClient();

  const { data: results = [], isFetching } = useSearchShows(query);

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlighted(0);
  }, [results]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation (up/down/enter/esc)
  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!results || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((prev) => Math.min(prev + 1, results.length - 1));
      setDropdownOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((prev) => Math.max(prev - 1, 0));
      setDropdownOpen(true);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const chosen = results[highlighted];
      if (chosen) {
        openShowModal(chosen.id, chosen.type || 'movie');
      }
    } else if (e.key === "Escape") {
      setDropdownOpen(false);
      setModalOpen(false);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  }

  function openShowModal(id: string, type: string = 'movie') {
    setSelectedId(id);
    setSelectedType(type);
    setModalOpen(true);
    setDropdownOpen(false);
    
    // Prefetch details with react-query for instant modal loading
    qc.prefetchQuery({
      queryKey: ["show-details", id, type],
      queryFn: () => fetch(`/api/tmdb/${type}/${id}`).then(r => r.json()),
      staleTime: 1000 * 60 * 10,
    });
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    setDropdownOpen(!!value.trim());
  }

  function handleInputFocus() {
    setIsFocused(true);
    if (query.trim()) {
      setDropdownOpen(true);
    }
  }

  const handleWatchTrailer = (result: any) => {
    openShowModal(result.id, result.type || 'movie');
  };

  const handleAddToWatchlist = (result: any) => {
    // Call the parent's watchlist handler if provided
    if (onAddToWatchlist && result.id) {
      onAddToWatchlist(result.id);
    }
    
    // Provide visual feedback
    // You could add a toast notification here
    console.log(`Added ${result.title} to watchlist`);
  };

  function handleChoose(result: any) {
    openShowModal(result.id, result.type || 'movie');
    setQuery(''); // Clear search after selection
  }

  return (
    <div ref={containerRef} className={`relative w-full max-w-xl ${className}`}>
      <motion.div 
        className="relative"
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Search 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 z-10" 
          size={18} 
        />
        <motion.div
          className="relative"
          style={{
            background: isFocused 
              ? `linear-gradient(135deg, ${colors.backgroundCard} 0%, ${colors.secondaryLight} 100%)`
              : colors.backgroundCard,
            borderRadius: radii.xl,
            border: `1px solid ${isFocused ? colors.primary : colors.border}`,
            boxShadow: isFocused ? `0 0 20px ${colors.focus}` : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          <Input
            ref={inputRef}
            value={query}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            onFocus={handleInputFocus}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="pl-12 pr-4 py-3 bg-transparent border-0 text-white placeholder-slate-400 focus:ring-0 focus:outline-none"
            style={{
              borderRadius: radii.xl,
              fontSize: '16px',
            }}
            autoComplete="off"
          />
          
          {/* Loading indicator */}
          {isFetching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
            >
              <div 
                className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{
                  borderColor: colors.primary,
                  borderTopColor: 'transparent',
                }}
              />
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Enhanced Dropdown */}
      {dropdownOpen && (
        <BrandedSearchDropdown
          results={results}
          loading={isFetching}
          highlightedIndex={highlighted}
          onHoverIndex={(i: number) => setHighlighted(i)}
          onChoose={handleChoose}
          onWatchTrailer={handleWatchTrailer}
          onAddToWatchlist={handleAddToWatchlist}
        />
      )}

      {/* Enhanced Modal */}
      <BrandedShowModal 
        showId={selectedId} 
        showType={selectedType}
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
        onAddToWatchlist={onAddToWatchlist}
        onWatchNow={onWatchNow}
      />
    </div>
  );
}
