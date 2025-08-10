// components/search/BrandedSearchDropdown.tsx - Enhanced BingeBoard Branded Dropdown
import React, { useEffect, useRef, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Play, Calendar, Plus, Video } from "lucide-react";
import { colors, gradients, radii, spacing, shadows } from "@/styles/tokens";

type SearchResult = {
  id: string;
  title: string;
  poster?: string | null;
  year?: number | string; // allow numeric year values provided by tests / API normalization
  genres?: number[];
  synopsis?: string;
  type?: string;
  vote_average?: number;
  trailerUrl?: string;
};

interface Props {
  results: SearchResult[];
  loading: boolean;
  highlightedIndex: number;
  onHoverIndex: (i: number) => void;
  onChoose: (r: SearchResult) => void;
  onWatchTrailer: (r: SearchResult) => void;
  onAddToWatchlist: (r: SearchResult) => void;
  listboxId?: string; // ARIA listbox id provided by parent
  optionIdForIndex?: (index: number) => string; // function to build option id
}

const BrandedSearchDropdown = forwardRef<HTMLDivElement, Props>(function BrandedSearchDropdownInner({
  results,
  loading,
  highlightedIndex,
  onHoverIndex,
  onChoose,
  onWatchTrailer,
  onAddToWatchlist,
  listboxId,
  optionIdForIndex,
}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll on mobile when dropdown open
  useEffect(() => {
    if (results.length > 0 || loading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [results.length, loading]);

  // Keyboard navigation handler on container level
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      onHoverIndex(Math.min(results.length - 1, highlightedIndex + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      onHoverIndex(Math.max(0, highlightedIndex - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[highlightedIndex]) {
        onChoose(results[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      // Optionally close dropdown or clear results here, if controlled outside
    }
  };

  // Loading skeleton placeholders
  const LoadingSkeleton = () => (
    <div className="p-4 space-y-4" data-testid="loading-skeleton" role="status" aria-live="polite">
      <div className="text-center text-sm font-medium" style={{ color: colors.textSecondary }}>
        Searching BingeBoard...
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div
            className="rounded-md"
            style={{
              width: 56,
              height: 80,
              backgroundColor: colors.secondaryLight,
            }}
          />
          <div className="flex flex-col flex-1 space-y-2">
            <div
              className="h-5 rounded w-3/4"
              style={{ backgroundColor: colors.secondaryLight }}
            />
            <div
              className="h-3 rounded w-1/4"
              style={{ backgroundColor: colors.secondaryLight }}
            />
            <div
              className="h-3 rounded w-full max-w-sm"
              style={{ backgroundColor: colors.secondaryLight }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      {(loading || results.length > 0) && (
        <motion.div
          ref={(node: HTMLDivElement) => {
            (containerRef as any).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref && typeof ref === 'object') (ref as any).current = node;
          }}
          tabIndex={0}
          role="listbox"
          id={listboxId}
          aria-label="Search Results"
          aria-activedescendant={optionIdForIndex ? optionIdForIndex(highlightedIndex) : `result-${highlightedIndex}`}
          onKeyDown={handleKeyDown}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute z-50 mt-3 w-full max-w-xl overflow-hidden max-h-[26rem] md:max-h-[30rem]"
          style={{
            background: `${colors.backgroundCard}dd`,
            backdropFilter: "blur(20px)",
            border: `1px solid ${colors.borderLight}`,
            borderRadius: radii["2xl"],
            boxShadow: shadows["2xl"],
            outline: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {loading && <LoadingSkeleton />}

          {!loading && results.length === 0 && (
            <div
              className="p-8 text-center text-sm font-medium"
              role="alert"
              aria-live="polite"
              style={{ color: colors.textMuted }}
            >
              <div className="mb-3">
                <div
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
                  style={{ backgroundColor: colors.secondaryLight }}
                >
                  <Play className="w-8 h-8" style={{ color: colors.textMuted }} />
                </div>
              </div>
              <p style={{ color: colors.textSecondary }}>No results found</p>
              <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                Try searching for a different show or movie
              </p>
            </div>
          )}

          <div
            className="max-h-[22rem] overflow-y-auto"
            style={{ scrollBehavior: "smooth" }}
          >
            {results.map((result, idx) => {
              const isHighlighted = idx === highlightedIndex;
              return (
                <motion.div
                  key={result.id}
                  id={optionIdForIndex ? optionIdForIndex(idx) : `result-${idx}`}
                  role="option"
                  aria-selected={isHighlighted}
                  tabIndex={isHighlighted ? 0 : -1}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  onMouseEnter={() => onHoverIndex(idx)}
                  onFocus={() => onHoverIndex(idx)}
                  onClick={() => onChoose(result)}
                  className="w-full cursor-pointer text-left flex gap-4 items-start p-4 transition-all duration-300 group relative overflow-hidden"
                  style={{
                    background: isHighlighted
                      ? `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.primaryLight}10 100%)`
                      : "transparent",
                    borderLeft: isHighlighted
                      ? `4px solid ${colors.primary}`
                      : "4px solid transparent",
                    outline: "none",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onChoose(result);
                    }
                  }}
                >
                  {isHighlighted && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: gradients.primary,
                        filter: "blur(20px)",
                        zIndex: 0,
                      }}
                      aria-hidden="true"
                    />
                  )}

                  {/* Poster image */}
                  <div className="relative flex-shrink-0 overflow-hidden shadow-lg">
                    <img
                      src={result.poster || "/placeholder.png"}
                      alt={result.title}
                      className="w-14 h-20 object-cover transition-transform duration-300 group-hover:scale-105"
                      style={{ borderRadius: radii.md }}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png";
                      }}
                    />
                    {/* Play overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        background: colors.backgroundOverlay,
                        borderRadius: radii.md,
                      }}
                      aria-hidden="true"
                    >
                      <Play
                        className="w-6 h-6"
                        style={{ color: colors.primary }}
                        fill="currentColor"
                      />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 relative z-10 select-none">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4
                        className="font-semibold text-base leading-tight truncate transition-colors duration-200"
                        style={{
                          color: isHighlighted ? colors.text : colors.text,
                          textShadow: isHighlighted
                            ? `0 0 10px ${colors.primary}40`
                            : "none",
                        }}
                      >
                        {result.title}
                      </h4>

                      {/* Type badge */}
                      {result.type && (
                        <span
                          className="px-2 py-1 text-xs font-medium uppercase tracking-wide flex-shrink-0"
                          style={{
                            backgroundColor:
                              result.type === "movie"
                                ? colors.accent
                                : colors.info,
                            color: colors.textDark,
                            borderRadius: radii.sm,
                          }}
                        >
                          {result.type}
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div
                      className="flex items-center gap-3 text-xs mb-2"
                      style={{ color: colors.textSecondary }}
                    >
                      {result.year && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {result.year}
                        </span>
                      )}

                      {result.vote_average && result.vote_average > 0 && (
                        <span className="flex items-center gap-1">
                          <Star
                            className="w-3 h-3 fill-yellow-400 text-yellow-400"
                            aria-label={`Rating: ${result.vote_average.toFixed(1)}`}
                          />
                          {result.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>

                    {/* Synopsis */}
                    {result.synopsis && (
                      <p
                        className="text-xs line-clamp-2 leading-relaxed transition-colors duration-200 mb-3"
                        style={{
                          color: isHighlighted
                            ? colors.textSecondary
                            : colors.textMuted,
                        }}
                      >
                        {result.synopsis.length > 120
                          ? `${result.synopsis.slice(0, 120)}...`
                          : result.synopsis}
                      </p>
                    )}

                    {/* Inline actions */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWatchTrailer(result);
                        }}
                        className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        style={{
                          color: colors.primary,
                          backgroundColor: `${colors.primary}15`,
                          border: `1px solid ${colors.primary}30`,
                        }}
                        aria-label={`Watch trailer for ${result.title}`}
                      >
                        <Video className="w-3 h-3" />
                        Trailer
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToWatchlist(result);
                        }}
                        className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        style={{
                          color: colors.accent,
                          backgroundColor: `${colors.accent}15`,
                          border: `1px solid ${colors.accent}30`,
                        }}
                        aria-label={`Add ${result.title} to watchlist`}
                      >
                        <Plus className="w-3 h-3" />
                        Watchlist
                      </button>
                    </div>
                  </div>

                  {/* Hover indicator */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: isHighlighted ? 1 : 0 }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full"
                    style={{ backgroundColor: colors.primary, width: 8, height: 8 }}
                    aria-hidden="true"
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Footer with shortcut hints */}
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="px-4 py-3 text-xs border-t select-none"
              style={{
                color: colors.textMuted,
                borderColor: colors.border,
                background: `${colors.backgroundCard}80`,
              }}
            >
              <div className="flex items-center justify-between">
                <span>Use ↑↓ to navigate</span>
                <span>Press Enter to select</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default BrandedSearchDropdown;
