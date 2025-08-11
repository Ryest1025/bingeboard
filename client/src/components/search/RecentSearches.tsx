import React, { memo, useState, useEffect, useCallback, KeyboardEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecentSearchesProps {
  searches: string[];
  onSelect: (value: string) => void;
  listbox?: boolean;
  activeIndex?: number; // controlled active index
  baseId?: string;
  onActiveChange?: (index: number) => void; // notify parent when navigation changes
}

const RecentSearchesComponent: React.FC<RecentSearchesProps> = ({ searches, onSelect, listbox, activeIndex: controlledActiveIndex, baseId = 'recent-searches', onActiveChange }) => {
  if (!searches.length) return null;

  const [internalActive, setInternalActive] = useState(-1);
  const activeIndex = controlledActiveIndex ?? internalActive;

  useEffect(() => {
    // reset internal index when search list changes
    setInternalActive(-1);
  }, [searches]);

  const setActive = useCallback((idx: number) => {
    setInternalActive(idx);
    onActiveChange?.(idx);
  }, [onActiveChange]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (!listbox || !searches.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = activeIndex >= searches.length - 1 ? 0 : activeIndex + 1;
      setActive(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = activeIndex <= 0 ? searches.length - 1 : activeIndex - 1;
      setActive(next);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < searches.length) {
        onSelect(searches[activeIndex]);
      }
    }
  }, [listbox, searches, activeIndex, setActive, onSelect]);
  return (
    <motion.div
      className="p-3 border-b border-slate-700"
      role={listbox ? 'listbox' : 'list'}
      id={listbox ? baseId : undefined}
      aria-label={listbox ? 'Recent searches' : 'Recent Searches'}
      aria-activedescendant={listbox && activeIndex >= 0 ? `${baseId}-option-${activeIndex}` : undefined}
      tabIndex={listbox ? 0 : undefined}
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-center gap-2 mb-2 select-none">
        <Clock className="w-4 h-4 text-gray-400" aria-hidden="true" />
        <span className="text-sm font-medium text-gray-400">Recent Searches</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((s, i) => {
          const active = i === activeIndex;
            const id = listbox ? `${baseId}-option-${i}` : undefined;
          return (
            <motion.div
              key={`recent-search-${i}-${s}`}
              role={listbox ? 'option' : 'listitem'}
              id={id}
              aria-selected={listbox ? active : undefined}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              onMouseEnter={() => { if (listbox) setActive(i); }}
            >
              <Badge
                variant="outline"
                tabIndex={listbox ? -1 : 0}
                aria-label={`Search ${s}`}
                className={`cursor-pointer hover:bg-slate-700 text-gray-300 border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:ring-offset-0 ${active ? 'ring-2 ring-cyan-500/60' : ''}`}
                onClick={() => onSelect(s)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(s);
                  }
                }}
              >
                {s}
              </Badge>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export const RecentSearches = memo(
  RecentSearchesComponent,
  (prev, next) => prev.searches.join('|') === next.searches.join('|')
);

