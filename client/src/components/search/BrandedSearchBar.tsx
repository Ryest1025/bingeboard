// components/search/BrandedSearchBar.tsx - BingeBoard Branded Search
import React, { useState, useRef, useEffect, KeyboardEvent, useId } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import useSearchShows from "@/hooks/useSearchShows";
import BrandedSearchDropdown from "@/components/search/BrandedSearchDropdown";
import BrandedShowModal from "@/components/search/BrandedShowModal";
import BrandedShowModalLite from "@/components/search/BrandedShowModalLite";
import { useOpenShowModal } from '@/hooks/useOpenShowModal';
import { colors, gradients, radii, spacing } from "@/styles/tokens";
import { tw } from "@/styles/theme";
import { StreamingPlatformsDisplay } from '@/components/streaming/StreamingPlatformsDisplay';

interface Props {
  placeholder?: string;
  className?: string;
  onAddToWatchlist?: (showId: number) => void;
  onWatchNow?: (show: any) => void;
  onQueryChange?: (value: string) => void;
  onShowSelected?: (show: any) => void;
}

export default function BrandedSearchBar({
  placeholder = "Search shows, movies, people...",
  className = "",
  onAddToWatchlist,
  onWatchNow,
  onQueryChange,
  onShowSelected,
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
  const uid = useId();
  const listboxId = `${uid}-search-results`;
  const inputId = `${uid}-search-input`;
  const statusId = `${uid}-search-status`;
  const instructionsId = `${uid}-search-instructions`;
  const optionId = (index: number) => `${listboxId}-option-${index}`;
  const [resultCountMsg, setResultCountMsg] = useState("");

  const { data: results = [], isFetching } = useSearchShows(query);
  const { openModal, Modal } = useOpenShowModal({ onAddToWatchlist, onWatchNow, source: 'search' });

  // Reset highlighted index & update status when results change
  useEffect(() => {
    setHighlighted(0);
    if (results.length > 0) {
      setResultCountMsg(`${results.length} result${results.length === 1 ? '' : 's'} available. Use up and down arrow keys to navigate.`);
    } else if (query.trim().length >= 2) {
      setResultCountMsg('No results.');
    } else {
      setResultCountMsg('');
    }
  }, [results, query]);

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
    if (e.key === 'Escape') {
      setDropdownOpen(false);
      setIsFocused(false);
      inputRef.current?.blur();
      return;
    }
    if (!results || results.length === 0) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlighted(prev => Math.min(prev + 1, results.length - 1));
        setDropdownOpen(true);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlighted(prev => Math.max(prev - 1, 0));
        setDropdownOpen(true);
        break;
      case 'Home':
        e.preventDefault();
        setHighlighted(0);
        break;
      case 'End':
        e.preventDefault();
        setHighlighted(results.length - 1);
        break;
      case 'PageDown':
        e.preventDefault();
        setHighlighted(prev => Math.min(prev + 5, results.length - 1));
        break;
      case 'PageUp':
        e.preventDefault();
        setHighlighted(prev => Math.max(prev - 5, 0));
        break;
      case 'Enter':
        e.preventDefault();
        const chosen = results[highlighted];
        if (chosen) {
          openShowModal(chosen.id, chosen.type || 'movie');
        }
        break;
    }
  }

  function openShowModal(id: string, type: string = 'movie') {
    setSelectedId(id);
    setSelectedType(type);
    setDropdownOpen(false);
    openModal(id, type);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    setDropdownOpen(!!value.trim());
  onQueryChange?.(value);
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
  };

  function handleChoose(result: any) {
    openShowModal(result.id, result.type || 'movie');
    setQuery(''); // Clear search after selection
  onShowSelected?.(result);
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
            role="combobox"
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded={dropdownOpen}
            aria-activedescendant={dropdownOpen && results.length > 0 ? optionId(highlighted) : undefined}
            aria-describedby={`${instructionsId} ${statusId}`}
            id={inputId}
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
          /* unique listbox id for ARIA */
          listboxId={listboxId}
          optionIdForIndex={optionId}
          onHoverIndex={(i: number) => setHighlighted(i)}
          onChoose={handleChoose}
          onWatchTrailer={handleWatchTrailer}
          onAddToWatchlist={handleAddToWatchlist}
        />
      )}

  {/* Centralized Modal Renderer (variant-aware) */}
  <Modal />

      {/* Streaming Platforms Display - Moved here from show modal for enhanced visibility */}
      {selectedId && (
        <div className="mt-4">
          {(() => {
            const sel = results.find((r: any) => r.id === selectedId);
            // Normalized summaries don't include streaming platform details; hide component if absent.
            if (!sel || !('streaming_platforms' in sel)) return null;
            return (
              <StreamingPlatformsDisplay
                platforms={(sel as any).streaming_platforms}
                compact={true}
              />
            );
          })()}
        </div>
      )}

      {/* Visually hidden instructions & status */}
      <div id={instructionsId} className="sr-only">
        Type to search. Results will update as you type.
      </div>
      <div id={statusId} className="sr-only" role="status" aria-live="polite">
        {resultCountMsg}
      </div>
    </div>
  );
}
