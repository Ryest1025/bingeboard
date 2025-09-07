import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';

export interface FilterValues {
  genres: string[];
  platforms: string[];
  countries: string[];
  sports: string[];
}

interface FilterBadgesProps {
  filters: FilterValues;
  onRemoveFilter: (type: keyof FilterValues, value: string) => void;
  onClearAll: () => void;
  onToggleFilters?: () => void;
  className?: string;
}

/**
 * Smart component that displays active filters as removable badges
 * Shows count of active filters and provides clear all functionality
 */
export function FilterBadges({
  filters,
  onRemoveFilter,
  onClearAll,
  onToggleFilters,
  className = ''
}: FilterBadgesProps) {
  const activeFilters = React.useMemo(() => {
    const items: Array<{ type: keyof FilterValues; value: string; label: string }> = [];

    filters.genres.forEach(genre => {
      items.push({ type: 'genres', value: genre, label: genre });
    });

    filters.platforms.forEach(platform => {
      items.push({ type: 'platforms', value: platform, label: platform });
    });

    filters.countries.forEach(country => {
      items.push({ type: 'countries', value: country, label: country });
    });

    filters.sports.forEach(sport => {
      items.push({ type: 'sports', value: sport, label: sport });
    });

    return items;
  }, [filters]);

  const totalActiveFilters = activeFilters.length;

  if (totalActiveFilters === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Filter toggle button with count */}
      {onToggleFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className="h-8 px-3 text-sm bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          <Filter className="w-4 h-4 mr-1" />
          🎯 {totalActiveFilters} Filter{totalActiveFilters !== 1 ? 's' : ''} Active
        </Button>
      )}

      {/* Active filter badges */}
      <div className="flex flex-wrap gap-1 max-w-full">
        {activeFilters.slice(0, 5).map((filter, index) => (
          <Badge
            key={`${filter.type}-${filter.value}-${index}`}
            variant="secondary"
            className="h-8 px-2 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            {filter.label}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveFilter(filter.type, filter.value)}
              className="p-0 ml-1 w-4 h-4 hover:bg-gray-300 rounded-full"
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))}

        {/* Show "and X more" if there are more than 5 filters */}
        {totalActiveFilters > 5 && (
          <Badge variant="outline" className="h-8 px-2 text-xs text-gray-600">
            +{totalActiveFilters - 5} more
          </Badge>
        )}
      </div>

      {/* Clear all button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        Clear All
      </Button>
    </div>
  );
}
