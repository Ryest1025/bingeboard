import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, CheckCircle, Clock, Timer } from 'lucide-react';
import type { WatchlistFilters } from './types';

export interface WatchlistQuickFilterProps {
  onChange?: (filters: WatchlistFilters) => void;
  initialFilters?: WatchlistFilters;
  compact?: boolean;
}

const progressOptions = [
  { value: 'all', label: 'All Shows', icon: Play, color: 'gray' },
  { value: 'watching', label: 'Watching', icon: Play, color: 'green' },
  { value: 'paused', label: 'Paused', icon: Pause, color: 'yellow' },
  { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'blue' },
  { value: 'planned', label: 'Want to Watch', icon: Clock, color: 'purple' }
];

const runtimeOptions = [
  { value: 'all', label: 'Any Length', icon: Timer },
  { value: 'short', label: '< 30min', icon: Timer },
  { value: 'standard', label: '30-60min', icon: Timer },
  { value: 'long', label: '> 1hr', icon: Timer }
];

export const WatchlistQuickFilter: React.FC<WatchlistQuickFilterProps> = ({
  onChange,
  initialFilters = { progressStatus: 'all', runtime: 'all' },
  compact = true
}) => {
  const [filters, setFilters] = useState<WatchlistFilters>(initialFilters);

  const updateFilter = (key: keyof WatchlistFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { progressStatus: 'all' as const, runtime: 'all' as const };
    setFilters(clearedFilters);
    onChange?.(clearedFilters);
  };

  const hasActiveFilters = filters.progressStatus !== 'all' || filters.runtime !== 'all';

  return (
    <div className="space-y-3">
      {/* Progress Status Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {progressOptions.map(({ value, label, icon: Icon, color }) => {
          const isActive = filters.progressStatus === value;
          return (
            <Button
              key={value}
              variant="ghost"
              size={compact ? "sm" : "default"}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap
                ${isActive
                  ? `bg-${color}-500/20 text-${color}-300 border border-${color}-500/30`
                  : 'bg-gray-700/30 text-gray-400 hover:bg-gray-600/50 hover:text-gray-300'
                }
              `}
              onClick={() => updateFilter('progressStatus', value)}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{label}</span>
              {isActive && value !== 'all' && (
                <Badge variant="secondary" className={`ml-1 h-3 w-3 p-0 text-xs bg-${color}-500 text-white rounded-full`}>
                  •
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Runtime Filter - Only show if not showing all */}
      {filters.progressStatus !== 'all' && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-700/50">
          <span className="text-xs text-gray-400 font-medium">Runtime:</span>
          <div className="flex gap-1">
            {runtimeOptions.map(({ value, label, icon: Icon }) => {
              const isActive = filters.runtime === value;
              return (
                <Button
                  key={value}
                  variant="ghost"
                  size="sm"
                  className={`
                    flex items-center gap-1 px-2 py-1 rounded-md transition-all text-xs
                    ${isActive
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'bg-gray-700/30 text-gray-400 hover:bg-gray-600/50 hover:text-gray-300'
                    }
                  `}
                  onClick={() => updateFilter('runtime', value)}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </Button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-400 hover:text-white px-2 ml-auto"
            >
              <span className="text-xs">Clear</span>
            </Button>
          )}
        </div>
      )}

      {/* Quick stats summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
          <span>Filtered by:</span>
          {filters.progressStatus !== 'all' && (
            <Badge variant="secondary" className="text-xs bg-gray-600/50 text-gray-300">
              {progressOptions.find(opt => opt.value === filters.progressStatus)?.label}
            </Badge>
          )}
          {filters.runtime !== 'all' && (
            <Badge variant="secondary" className="text-xs bg-gray-600/50 text-gray-300">
              {runtimeOptions.find(opt => opt.value === filters.runtime)?.label}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
