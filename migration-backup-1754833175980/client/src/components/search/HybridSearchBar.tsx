// components/search/HybridSearchBar.tsx - Enhanced search with React Query and Framer Motion
import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import useSearchShows from "@/hooks/useSearchShows";
import EnhancedSearchDropdown from "@/components/search/EnhancedSearchDropdown";
import EnhancedShowModal from "@/components/search/EnhancedShowModal";

interface Props {
  placeholder?: string;
  className?: string;
  onAddToWatchlist?: (showId: number) => void;
  onWatchNow?: (show: any) => void;
}

export default function HybridSearchBar({
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
    if (query.trim()) {
      setDropdownOpen(true);
    }
  }

  function handleChoose(result: any) {
    openShowModal(result.id, result.type || 'movie');
    setQuery(''); // Clear search after selection
  }

  return (
    <div ref={containerRef} className={`relative w-full max-w-xl ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="pl-10 pr-4 py-3 rounded-xl bg-white/5 border-white/10 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
          autoComplete="off"
        />
      </div>

      {/* Enhanced Dropdown */}
      {dropdownOpen && (
        <EnhancedSearchDropdown
          results={results}
          loading={isFetching}
          highlightedIndex={highlighted}
          onHoverIndex={(i) => setHighlighted(i)}
          onChoose={handleChoose}
        />
      )}

      {/* Enhanced Modal */}
      <EnhancedShowModal 
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
