// components/search/EnhancedSearchDropdown.tsx
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

type SearchResult = {
  id: string;
  title: string;
  poster?: string | null;
  year?: string;
  genres?: number[];
  synopsis?: string;
  type?: string;
  vote_average?: number;
};

interface Props {
  results: SearchResult[];
  loading: boolean;
  highlightedIndex: number;
  onHoverIndex: (i: number) => void;
  onChoose: (r: SearchResult) => void;
}

export default function EnhancedSearchDropdown({
  results,
  loading,
  highlightedIndex,
  onHoverIndex,
  onChoose,
}: Props) {
  useEffect(() => {
    // Prevent body scroll when dropdown is open on small screens if needed
    return () => { };
  }, []);

  return (
    <AnimatePresence>
      {(loading || results.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute z-50 mt-2 w-full max-w-xl bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
        >
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 text-sm text-slate-400 flex items-center gap-2"
            >
              <div className="animate-spin w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full" />
              Searching...
            </motion.div>
          )}

          {results.map((r, idx) => {
            const isHighlighted = idx === highlightedIndex;
            return (
              <motion.button
                key={r.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.2 }}
                onMouseEnter={() => onHoverIndex(idx)}
                onClick={() => onChoose(r)}
                className={`w-full text-left flex gap-3 items-start p-3 transition-all duration-200 ${isHighlighted
                    ? "bg-cyan-500/20 border-l-2 border-cyan-500"
                    : "hover:bg-slate-800/60 border-l-2 border-transparent"
                  }`}
              >
                <img
                  src={r.poster || "/placeholder.png"}
                  alt={r.title}
                  className="w-12 h-16 object-cover rounded-md flex-shrink-0 shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.png";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate">
                      <div className="font-medium text-sm text-white">{r.title}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {r.year && <span>{r.year}</span>}
                        {r.type && <span className="capitalize">• {r.type}</span>}
                        {r.vote_average && r.vote_average > 0 && (
                          <span className="flex items-center gap-1">
                            • <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {r.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {r.synopsis && (
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {r.synopsis.length > 100 ? `${r.synopsis.slice(0, 100)}...` : r.synopsis}
                    </p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
