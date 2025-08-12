import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { SearchResultCard } from './SearchResultCard';
import { EnhancedSearchErrorUI } from './EnhancedSearchErrorUI';
import useEnhancedSearch from '@/hooks/useEnhancedSearch';
import { isSuccess, isFailure } from '@/lib/search-api';
import { Clock, Sparkles, TrendingUp } from 'lucide-react';
import { useGenres } from '@/context/GenreContext';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { RecentSearches } from './RecentSearches';
import { maybeDisableMotion } from './motionVariants';
import type { EnhancedShow } from '@/types/enhancedSearch';

interface SearchPreviewDropdownProps {
  query: string;
  isVisible: boolean;
  onSelectShow: (show: EnhancedShow) => void;
  onHoverShow: (show: EnhancedShow | null) => void;
  onClose: () => void;
  hoveredShow: EnhancedShow | null;
}

// Replaced inline SearchResult interface with EnhancedShow type

export function SearchPreviewDropdown({
  query,
  isVisible,
  onSelectShow,
  onHoverShow,
  onClose,
  hoveredShow
}: SearchPreviewDropdownProps) {
  const { genres, loading: genresLoading, error: genresError } = useGenres();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Use enhanced search hook with retry/backoff
  const {
    data: searchData,
    error,
    isLoading,
    refetch
  } = useEnhancedSearch({
    query: query.trim().length >= 2 ? query : undefined
  });

  // Extract results from the API result
  const results: EnhancedShow[] = useMemo(() => {
    const raw = (searchData && isSuccess(searchData) ? searchData.data.results : []) as EnhancedShow[];
    return raw.slice(0, 8);
  }, [searchData]);
  const searchError = error || (searchData && isFailure(searchData) ? searchData.error : null);

  // Reset selected index when results change (only if in results mode)
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = useCallback(() => {
    try {
      const saved = localStorage.getItem('bingeboard_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  const saveRecentSearch = useCallback((searchQuery: string) => {
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
  }, [recentSearches]);

  const handleRetry = () => {
    console.log('🔄 Manual retry triggered for enhanced search');
    refetch();
  };

  // Close when clicking outside
  useEffect(() => {
    if (!isVisible) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isVisible, onClose]);

  const prefersReducedMotion = !!useReducedMotion();
  const { containerMotion, itemMotion, listStagger } = maybeDisableMotion(prefersReducedMotion);

  const showRecentSearches = query.trim().length === 0 && recentSearches.length > 0;
  const activeCollectionLength = showRecentSearches ? recentSearches.length : results.length;

  // Unified keyboard handler on container (listbox)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isVisible) return;
    if (e.key === 'ArrowDown') {
      if (!activeCollectionLength) return;
      e.preventDefault();
      setSelectedIndex(prev => (prev >= activeCollectionLength - 1 ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      if (!activeCollectionLength) return;
      e.preventDefault();
      setSelectedIndex(prev => (prev <= 0 ? activeCollectionLength - 1 : prev - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        if (showRecentSearches) {
          const term = recentSearches[selectedIndex];
          if (term) {
            saveRecentSearch(term);
            onClose();
            window.location.href = `/discover?q=${encodeURIComponent(term)}`;
          }
          return;
        }
        if (results[selectedIndex]) {
          onSelectShow(results[selectedIndex]);
          saveRecentSearch(query);
          return;
        }
      }
      if (query.trim()) {
        window.location.href = `/discover?q=${encodeURIComponent(query)}`;
        saveRecentSearch(query);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Option id generator swaps namespace depending on mode
  const getOptionId = (index: number) => showRecentSearches
    ? `recent-searches-option-${index}`
    : `search-preview-dropdown-option-${index}`;
  const showResults = query.trim().length >= 2 && results.length > 0;
  const showError = query.trim().length >= 2 && searchError && !isLoading;
  const combinedLoading = isLoading || genresLoading;

  // Only calculate streaming data when results are shown (performance optimization)
  const hasStreamingData = useMemo(() => (
    showResults && searchData && isSuccess(searchData) &&
    (searchData.data.results as EnhancedShow[]).some(r => r.streaming?.length)
  ), [showResults, searchData]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="search-preview"
          ref={containerRef}
          role="listbox"
          tabIndex={0}
          aria-label="Search suggestions"
          aria-activedescendant={selectedIndex >= 0 ? getOptionId(selectedIndex) : undefined}
          onKeyDown={handleKeyDown}
          className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden backdrop-blur supports-[backdrop-filter]:bg-slate-800/95"
          {...containerMotion}
        >
          <AnimatePresence>
            {combinedLoading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto"></div>
                <p className="text-sm text-gray-400 mt-2">{isLoading ? 'Searching with enhanced streaming data...' : 'Loading genres...'}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {genresError && !isLoading && (
            <div className="px-3 py-2 text-xs text-amber-400 bg-amber-900/20 border-b border-amber-800">Genre data unavailable – continuing without genre names.</div>
          )}
          {showError && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3">
              <EnhancedSearchErrorUI error={searchError} isLoading={isLoading} onRetry={handleRetry} query={query} />
            </motion.div>
          )}
          {showRecentSearches && (
            <RecentSearches
              searches={recentSearches}
              listbox
              activeIndex={selectedIndex}
              baseId="recent-searches"
              onActiveChange={setSelectedIndex}
              onSelect={(s) => {
                saveRecentSearch(s);
                onClose();
                window.location.href = `/discover?q=${encodeURIComponent(s)}`;
              }}
            />
          )}
          {showResults && (
            <motion.div
              key="results"
              className="max-h-80 overflow-y-auto"
              id="search-preview-dropdown"
              aria-label="Enhanced search results"
              {...listStagger}
            >
              <div className="p-2">
                <motion.div className="flex items-center gap-2 mb-2 px-2" {...itemMotion}>
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-gray-400">Enhanced results for "{query}"</span>
                  {hasStreamingData && (<Badge variant="secondary" className="text-xs">With Streaming Data</Badge>)}
                </motion.div>
                {results.map((show, index) => (
                  <motion.div key={show.id} {...itemMotion}>
                    <SearchResultCard
                      id={getOptionId(index)}
                      show={show}
                      genres={genres}
                      onHover={(s) => {
                        if (s) setSelectedIndex(index);
                        onHoverShow(s as EnhancedShow | null);
                      }}
                      onClick={(selectedShow) => { onSelectShow(selectedShow); saveRecentSearch(query); }}
                      isHovered={selectedIndex === index || hoveredShow?.id === show.id}
                      active={selectedIndex === index}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          {query.trim().length >= 2 && results.length === 0 && !combinedLoading && !searchError && (
            <motion.div key="empty" {...itemMotion} className="p-4 text-center">
              <p className="text-gray-400 mb-2">No results found for "{query}"</p>
              <p className="text-sm text-gray-500">Press Enter to search all content</p>
            </motion.div>
          )}
          {query.trim().length >= 2 && !searchError && (
            <motion.div key="actions" {...itemMotion} className="border-t border-slate-700 p-3">
              <button
                onClick={() => { window.location.href = `/discover?q=${encodeURIComponent(query)}`; saveRecentSearch(query); }}
                className="w-full text-left px-3 py-2 text-sm text-cyan-400 hover:bg-slate-700 rounded flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                See all enhanced results for "{query}"
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
