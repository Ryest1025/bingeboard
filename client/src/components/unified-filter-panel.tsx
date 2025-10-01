import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft } from "lucide-react";

export interface FilterOption {
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  type?: 'chips' | 'select';
  maxVisible?: number;
}

interface UnifiedFilterPanelProps {
  title: string;
  filters: FilterOption[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

// Subtle, integrated filter chips that feel like navigation
const FilterChip: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: 'default' | 'subtle';
}> = ({ label, active, onClick, variant = 'subtle' }) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onClick}
    className={`min-w-fit h-8 px-3 text-sm font-medium transition-all duration-200 ${
      active 
        ? 'text-white bg-white/10 backdrop-blur-sm' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
    }`}
    aria-pressed={active}
    role="switch"
  >
    {label}
  </Button>
);

const FilterGroup: React.FC<{
  filter: FilterOption;
}> = ({ filter }) => {
  const { name, options, value, onChange, type = 'chips', maxVisible = 4 } = filter;
  const [showAll, setShowAll] = useState(false);
  
  const visibleOptions = showAll ? options : options.slice(0, maxVisible);
  const hasMore = options.length > maxVisible;

  return (
    <div className="space-y-2">
      <span className="text-xs text-slate-500">{name}</span>
      <div className="flex gap-1 flex-wrap">
        {visibleOptions.map(option => (
          <FilterChip
            key={option.value}
            label={option.label}
            active={value === option.value}
            onClick={() => onChange(option.value)}
          />
        ))}
        {hasMore && !showAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(true)}
            className="h-8 px-2 text-xs text-slate-500 hover:text-slate-300"
          >
            +{options.length - maxVisible} more
          </Button>
        )}
        {showAll && hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(false)}
            className="h-8 px-2 text-xs text-slate-500 hover:text-slate-300"
          >
            Show less
          </Button>
        )}
      </div>
    </div>
  );
};

export const UnifiedFilterPanel: React.FC<UnifiedFilterPanelProps> = ({ 
  title, 
  filters, 
  collapsible = true,
  defaultExpanded = false,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!collapsible) {
    return (
      <div className={`bg-slate-900/20 rounded-md p-3 space-y-4 border border-slate-700/30 ${className}`}>
        <h4 className="text-sm font-medium text-slate-300">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filters.map((filter) => (
            <FilterGroup key={filter.name} filter={filter} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-slate-400 hover:text-slate-200 mb-2 h-auto p-1"
      >
        {isExpanded ? <ChevronLeft className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
        <span className="text-xs">{title}</span>
      </Button>
      
      {isExpanded && (
        <div className="bg-slate-900/20 rounded-md p-3 space-y-3 border border-slate-700/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <FilterGroup key={filter.name} filter={filter} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Predefined filter option sets for consistency
export const FILTER_OPTIONS = {
  MEDIA_TYPES: [
    { value: 'all', label: 'All' },
    { value: 'movie', label: 'Movies' },
    { value: 'tv', label: 'Shows' }
  ],
  
  TIMEFRAMES: [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' }
  ],
  
  AWARDS: [
    { value: 'all', label: 'All' },
    { value: 'oscars', label: 'Oscars' },
    { value: 'emmys', label: 'Emmys' },
    { value: 'golden-globes', label: 'Globes' },
    { value: 'sag', label: 'SAG' },
    { value: 'bafta', label: 'BAFTA' }
  ],
  
  RELEASE_WINDOWS: [
    { value: 'all', label: 'All' },
    { value: 'this-month', label: 'This Month' },
    { value: 'next-3-months', label: 'Next 3M' },
    { value: 'this-year', label: 'This Year' },
    { value: 'next-year', label: 'Next Year' }
  ],
  
  GENRES: [
    { value: 'all', label: 'All Genres' },
    { value: '28', label: 'Action' },
    { value: '12', label: 'Adventure' },
    { value: '16', label: 'Animation' },
    { value: '35', label: 'Comedy' },
    { value: '80', label: 'Crime' },
    { value: '99', label: 'Documentary' },
    { value: '18', label: 'Drama' },
    { value: '14', label: 'Fantasy' },
    { value: '27', label: 'Horror' },
    { value: '10749', label: 'Romance' },
    { value: '878', label: 'Sci-Fi' },
    { value: '53', label: 'Thriller' }
  ]
};