import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/utils/api-config';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Filter, 
  X, 
  Star, 
  Calendar, 
  Clock, 
  Users,
  Sparkles,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Enhanced TypeScript interfaces for better type safety
export type SortOption = 'newest' | 'oldest' | 'rating' | 'popularity' | 'alphabetical';
export type ContentType = 'all' | 'movie' | 'tv' | 'documentary' | 'anime';
export type ContentStatus = 'all' | 'watching' | 'completed' | 'plan-to-watch' | 'dropped';
export type RuntimeRange = [number, number];
export type RatingRange = [number, number];

export interface FilterState {
  genre: string;
  year: string;
  rating: RatingRange;
  runtime: RuntimeRange;
  platform: string;
  status: ContentStatus;
  sortBy: SortOption;
  hideWatched: boolean;
  onlyWatchlist: boolean;
  includeFriends: boolean;
  searchQuery: string;
  contentType: ContentType;
}

interface EnhancedFilterSystemProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  isLoading?: boolean;
  resultCount?: number;
  className?: string;
  enableDynamicData?: boolean; // Enable React Query data fetching
}

// Dynamic filter data interfaces
interface Genre {
  id: number;
  name: string;
}

interface Platform {
  id: string;
  name: string;
  logo_path?: string;
}

// Configuration-driven filter system
interface FilterOption {
  value: string;
  label: string;
  icon?: string | React.ComponentType<any>;
  description?: string;
  category?: string;
}



interface FilterSectionConfig {
  key: keyof FilterState;
  label: string;
  icon: React.ComponentType<any>;
  type: 'select' | 'slider' | 'switch' | 'input' | 'multiselect';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  description?: string;
  validation?: (value: any) => boolean;
  transform?: (value: any) => any;
}

// Centralized filter configuration
// Loading skeleton component with optional text
const FilterSkeleton: React.FC<{ text?: string }> = ({ text }) => (
  <div className="animate-pulse space-y-2">
    {text && <div className="h-3 bg-slate-600 rounded w-16 mb-1"></div>}
    <div className="h-4 bg-slate-600 rounded w-24"></div>
    <div className="h-10 bg-slate-600 rounded"></div>
  </div>
);

// Error component for filter sections with better accessibility
const FilterError: React.FC<{ 
  error: string; 
  onRetry?: () => void;
  filterName: string;
}> = ({ error, onRetry, filterName }) => (
  <Alert 
    className="border-red-500/50 bg-red-950/20"
    role="alert"
    aria-live="polite"
  >
    <AlertCircle className="h-4 w-4 text-red-400" aria-hidden="true" />
    <AlertTitle className="text-red-300">Error loading {filterName}</AlertTitle>
    <AlertDescription className="text-red-200 mt-1">
      {error}
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-2 border-red-500 text-red-300 hover:bg-red-900/20"
          aria-label={`Retry loading ${filterName}`}
        >
          <RefreshCw className="w-3 h-3 mr-1" aria-hidden="true" />
          Retry
        </Button>
      )}
    </AlertDescription>
  </Alert>
);

// Global loading state component
const FilterSystemLoading: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={`w-full bg-slate-800/50 border-slate-700 ${className}`}>
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-purple-400" aria-hidden="true" />
          <span className="text-slate-300">Loading filter options...</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <FilterSkeleton key={i} />
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Global error state component
const FilterSystemError: React.FC<{ 
  className?: string;
  onRetryAll: () => void;
}> = ({ className, onRetryAll }) => (
  <Card className={`w-full bg-slate-800/50 border-slate-700 ${className}`}>
    <CardContent className="p-6">
      <Alert className="border-red-500/50 bg-red-950/20" role="alert">
        <AlertCircle className="h-4 w-4 text-red-400" aria-hidden="true" />
        <AlertTitle className="text-red-300">Unable to load filter options</AlertTitle>
        <AlertDescription className="text-red-200 mt-2">
          There was a problem loading the filter options. You can still use basic filters, or try refreshing the page.
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetryAll}
              className="border-red-500 text-red-300 hover:bg-red-900/20"
              aria-label="Retry loading all filter options"
            >
              <RefreshCw className="w-3 h-3 mr-1" aria-hidden="true" />
              Retry All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="border-slate-500 text-slate-300 hover:bg-slate-700"
            >
              Refresh Page
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
);

const FILTER_CONFIG: Record<string, FilterSectionConfig> = {
  searchQuery: {
    key: 'searchQuery',
    label: 'Search',
    icon: Search,
    type: 'input',
    placeholder: 'Search titles, actors, directors...',
    description: 'Search across all content metadata'
  },
  genre: {
    key: 'genre',
    label: 'Genre',
    icon: Star,
    type: 'select',
    options: [
      { value: 'all', label: 'All Genres', icon: '🎭' },
      { value: '28', label: 'Action', icon: '💥', category: 'Adventure' },
      { value: '12', label: 'Adventure', icon: '🗺️', category: 'Adventure' },
      { value: '16', label: 'Animation', icon: '🎨', category: 'Family' },
      { value: '35', label: 'Comedy', icon: '😂', category: 'Entertainment' },
      { value: '80', label: 'Crime', icon: '🔍', category: 'Drama' },
      { value: '99', label: 'Documentary', icon: '📚', category: 'Educational' },
      { value: '18', label: 'Drama', icon: '🎭', category: 'Drama' },
      { value: '10751', label: 'Family', icon: '👨‍👩‍👧‍👦', category: 'Family' },
      { value: '14', label: 'Fantasy', icon: '🧙‍♂️', category: 'Adventure' },
      { value: '27', label: 'Horror', icon: '👻', category: 'Thriller' },
      { value: '10402', label: 'Music', icon: '🎵', category: 'Entertainment' },
      { value: '9648', label: 'Mystery', icon: '🕵️', category: 'Thriller' },
      { value: '10749', label: 'Romance', icon: '💕', category: 'Drama' },
      { value: '878', label: 'Sci-Fi', icon: '🚀', category: 'Adventure' },
      { value: '53', label: 'Thriller', icon: '😱', category: 'Thriller' },
      { value: '10752', label: 'War', icon: '⚔️', category: 'Drama' },
      { value: '37', label: 'Western', icon: '🤠', category: 'Adventure' }
    ]
  },
  platform: {
    key: 'platform',
    label: 'Platform',
    icon: Star,
    type: 'select',
    options: [
      { value: 'all', label: 'All Platforms', icon: '📺' },
      { value: 'netflix', label: 'Netflix', icon: '🔴', description: 'Netflix Originals and Licensed Content' },
      { value: 'disney', label: 'Disney+', icon: '🏰', description: 'Disney, Marvel, Star Wars, Pixar' },
      { value: 'hbo', label: 'HBO Max', icon: '🎬', description: 'HBO Originals and Warner Bros' },
      { value: 'amazon', label: 'Prime Video', icon: '📦', description: 'Amazon Prime Video Content' },
      { value: 'apple', label: 'Apple TV+', icon: '🍎', description: 'Apple Original Productions' },
      { value: 'hulu', label: 'Hulu', icon: '🟢', description: 'Current TV and Originals' },
      { value: 'paramount', label: 'Paramount+', icon: '⛰️', description: 'CBS, Paramount, Nickelodeon' },
      { value: 'peacock', label: 'Peacock', icon: '🦚', description: 'NBC Universal Content' }
    ]
  },
  sortBy: {
    key: 'sortBy',
    label: 'Sort By',
    icon: TrendingUp,
    type: 'select',
    options: [
      { value: 'popularity.desc', label: 'Most Popular', icon: TrendingUp, description: 'Trending and popular content' },
      { value: 'vote_average.desc', label: 'Highest Rated', icon: Star, description: 'Top rated by critics and users' },
      { value: 'release_date.desc', label: 'Newest First', icon: Calendar, description: 'Recently released content' },
      { value: 'release_date.asc', label: 'Oldest First', icon: Clock, description: 'Classic and vintage content' },
      { value: 'title.asc', label: 'A-Z', icon: Search, description: 'Alphabetical order' }
    ]
  },
  rating: {
    key: 'rating',
    label: 'Rating Range',
    icon: Star,
    type: 'slider',
    min: 0,
    max: 10,
    step: 0.1,
    description: 'Filter by IMDb/TMDB rating',
    validation: (value: number[]) => value[0] <= value[1]
  },
  runtime: {
    key: 'runtime',
    label: 'Runtime (minutes)',
    icon: Clock,
    type: 'slider',
    min: 0,
    max: 300,
    step: 5,
    description: 'Filter by episode/movie length',
    validation: (value: number[]) => value[0] <= value[1]
  },
  year: {
    key: 'year',
    label: 'Release Year',
    icon: Calendar,
    type: 'select',
    options: [
      { value: 'all', label: 'Any Year' },
      ...Array.from({ length: 30 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { value: year.toString(), label: year.toString() };
      })
    ]
  },
  contentType: {
    key: 'contentType',
    label: 'Content Type',
    icon: Sparkles,
    type: 'select',
    options: [
      { value: 'all', label: 'Movies & TV Shows', description: 'All content types' },
      { value: 'movie', label: 'Movies Only', description: 'Feature films only' },
      { value: 'tv', label: 'TV Shows Only', description: 'Series and episodes' }
    ]
  },
  hideWatched: {
    key: 'hideWatched',
    label: 'Hide Watched',
    icon: X,
    type: 'switch',
    description: 'Hide content you\'ve already watched'
  },
  onlyWatchlist: {
    key: 'onlyWatchlist',
    label: 'Watchlist Only',
    icon: Star,
    type: 'switch',
    description: 'Show only items in your watchlist'
  },
  includeFriends: {
    key: 'includeFriends',
    label: 'Friends\' Picks',
    icon: Users,
    type: 'switch',
    description: 'Include recommendations from friends'
  }
};

// Reusable filter component renderer with performance optimizations
interface FilterComponentProps {
  config: FilterSectionConfig;
  value: any;
  onChange: (value: any) => void;
  className?: string;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

const FilterComponent = React.memo<FilterComponentProps>(({ 
  config, 
  value, 
  onChange, 
  className, 
  isLoading = false, 
  error,
  onRetry 
}) => {
  const IconComponent = config.icon;
  const inputId = `filter-${config.key}`;
  const descriptionId = `${inputId}-description`;

  // Show loading skeleton for select components with dynamic data
  if (isLoading && (config.type === 'select' || config.type === 'multiselect')) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <IconComponent className="w-4 h-4" aria-hidden="true" />
          {config.label}
        </Label>
        <FilterSkeleton />
      </div>
    );
  }

  // Show error state for components with loading errors
  if (error && (config.type === 'select' || config.type === 'multiselect')) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <IconComponent className="w-4 h-4" aria-hidden="true" />
          {config.label}
        </Label>
        <FilterError 
          error={error} 
          filterName={config.label}
          onRetry={onRetry}
        />
      </div>
    );
  }

  switch (config.type) {
    case 'input':
      return (
        <div className={`space-y-2 ${className}`}>
          <Label 
            htmlFor={inputId}
            className="text-sm font-medium text-slate-300 flex items-center gap-2"
          >
            <IconComponent className="w-4 h-4" aria-hidden="true" />
            {config.label}
          </Label>
          <div className="relative">
            <IconComponent 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" 
              aria-hidden="true" 
            />
            <Input
              id={inputId}
              placeholder={config.placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              aria-describedby={config.description ? descriptionId : undefined}
              disabled={isLoading}
            />
          </div>
          {config.description && (
            <p id={descriptionId} className="text-xs text-slate-500">
              {config.description}
            </p>
          )}
        </div>
      );

    case 'select':
      return (
        <div className={`space-y-2 ${className}`}>
          <Label 
            htmlFor={inputId}
            className="text-sm font-medium text-slate-300 flex items-center gap-2"
          >
            <IconComponent className="w-4 h-4" aria-hidden="true" />
            {config.label}
          </Label>
          <Select 
            value={value} 
            onValueChange={onChange}
            disabled={isLoading}
          >
            <SelectTrigger 
              id={inputId}
              className="bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              aria-describedby={config.description ? descriptionId : undefined}
              aria-label={`Select ${config.label.toLowerCase()}`}
            >
              <SelectValue placeholder={config.placeholder} />
            </SelectTrigger>
            <SelectContent 
              className="bg-slate-800 border-slate-700 max-h-60"
              position="popper"
            >
              {config.options?.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-white hover:bg-slate-700 focus:bg-slate-700"
                >
                  <div className="flex items-center gap-2">
                    {typeof option.icon === 'string' ? (
                      <span aria-hidden="true">{option.icon}</span>
                    ) : option.icon ? (
                      <option.icon className="w-4 h-4" aria-hidden="true" />
                    ) : null}
                    <span>{option.label}</span>
                    {option.description && (
                      <span className="sr-only"> - {option.description}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {config.description && (
            <p id={descriptionId} className="text-xs text-slate-500">
              {config.description}
            </p>
          )}
        </div>
      );

    case 'slider':
      const formatValue = (val: number) => {
        if (config.key === 'rating') return val.toFixed(1);
        return config.key === 'runtime' ? `${val}min` : val.toString();
      };

      return (
        <div className={`space-y-3 ${className}`}>
          <Label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <IconComponent className="w-4 h-4" aria-hidden="true" />
            {config.label}
          </Label>
          <div className="px-2">
            <Slider
              value={value}
              onValueChange={onChange}
              min={config.min}
              max={config.max}
              step={config.step}
              className="w-full"
              aria-label={`${config.label} range from ${formatValue(value[0])} to ${formatValue(value[1])}`}
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1" role="status" aria-live="polite">
              <span>
                {config.key === 'rating' 
                  ? `${value[0].toFixed(1)}+` 
                  : `${value[0]}${config.key === 'runtime' ? 'min' : ''}`
                }
              </span>
              <span>
                {config.key === 'rating' 
                  ? `up to ${value[1].toFixed(1)}` 
                  : `${value[1]}${config.key === 'runtime' ? 'min+' : ''}`
                }
              </span>
            </div>
          </div>
          {config.description && (
            <p id={descriptionId} className="text-xs text-slate-500">
              {config.description}
            </p>
          )}
        </div>
      );

    case 'switch':
      return (
        <div className={`flex items-center space-x-2 ${className}`}>
          <Switch
            id={inputId}
            checked={value}
            onCheckedChange={onChange}
            className="data-[state=checked]:bg-purple-600 focus:ring-2 focus:ring-purple-500"
            aria-describedby={config.description ? descriptionId : undefined}
            disabled={isLoading}
          />
          <Label 
            htmlFor={inputId} 
            className="text-sm text-slate-300 flex items-center gap-2 cursor-pointer"
          >
            <IconComponent className="w-4 h-4" aria-hidden="true" />
            {config.label}
            <span className="sr-only">
              {value ? 'enabled' : 'disabled'}
            </span>
          </Label>
          {config.description && (
            <span id={descriptionId} className="text-xs text-slate-500 ml-2">
              ({config.description})
            </span>
          )}
        </div>
      );

    default:
      return null;
  }
});

FilterComponent.displayName = 'FilterComponent';

// Custom hook for filter state management (can be extracted to separate file)
export const useFilterManagement = (
  filters: FilterState,
  onFiltersChange: (filters: FilterState) => void
) => {
  const { toast } = useToast();

  // Optimized update function with reduced object recreation
  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    // Only update if value actually changed
    if (filters[key] === value) return;
    
    onFiltersChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFiltersChange]);

  // Filter handlers for better organization
  const filterHandlers = useMemo(() => ({
    search: (query: string) => updateFilter('searchQuery', query),
    genre: (genre: string) => updateFilter('genre', genre),
    platform: (platform: string) => updateFilter('platform', platform),
    contentType: (type: ContentType) => updateFilter('contentType', type),
    year: (year: string) => updateFilter('year', year),
    rating: (rating: RatingRange) => updateFilter('rating', rating),
    runtime: (runtime: RuntimeRange) => updateFilter('runtime', runtime),
    sortBy: (sort: SortOption) => updateFilter('sortBy', sort),
    status: (status: ContentStatus) => updateFilter('status', status),
    hideWatched: (hide: boolean) => updateFilter('hideWatched', hide),
    onlyWatchlist: (only: boolean) => updateFilter('onlyWatchlist', only),
    includeFriends: (include: boolean) => updateFilter('includeFriends', include),
  }), [updateFilter]);

  // Reset all filters to defaults
  const resetFilters = useCallback(() => {
    const defaultFilters: FilterState = {
      genre: '',
      year: '',
      rating: [0, 10],
      runtime: [0, 300],
      platform: '',
      status: 'all',
      sortBy: 'newest',
      hideWatched: false,
      onlyWatchlist: false,
      includeFriends: false,
      searchQuery: '',
      contentType: 'all',
    };
    onFiltersChange(defaultFilters);
    toast({
      title: "Filters reset",
      description: "All filters have been cleared",
    });
  }, [onFiltersChange, toast]);

  return {
    filterHandlers,
    resetFilters,
    updateFilter
  };
};

export const EnhancedFilterSystem = React.memo<EnhancedFilterSystemProps>(({
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
  isLoading = false,
  resultCount,
  className = '',
  enableDynamicData = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  // React Query integration for dynamic filter data
  const dynamicDataQueries = useQueries({
    queries: [
      {
        queryKey: ['filter-genres'],
        queryFn: async (): Promise<Genre[]> => {
          // Use static genre data since /api/content/genres doesn't exist
          return [
            { id: 10759, name: 'Action & Adventure' },
            { id: 16, name: 'Animation' },
            { id: 35, name: 'Comedy' },
            { id: 80, name: 'Crime' },
            { id: 99, name: 'Documentary' },
            { id: 18, name: 'Drama' },
            { id: 10751, name: 'Family' },
            { id: 10762, name: 'Kids' },
            { id: 9648, name: 'Mystery' },
            { id: 10763, name: 'News' },
            { id: 10764, name: 'Reality' },
            { id: 10765, name: 'Sci-Fi & Fantasy' },
            { id: 10766, name: 'Soap' },
            { id: 10767, name: 'Talk' },
            { id: 10768, name: 'War & Politics' },
            { id: 37, name: 'Western' }
          ];
        },
        enabled: enableDynamicData,
        staleTime: 1000 * 60 * 30, // 30 minutes
        retry: false, // Don't retry for static data

      },
      {
        queryKey: ['filter-platforms'],
        queryFn: async (): Promise<Platform[]> => {
          // Use static platform data since /api/content/platforms doesn't exist
          return [
            { id: 'netflix', name: 'Netflix' },
            { id: 'disney', name: 'Disney+' },
            { id: 'hbo', name: 'HBO Max' },
            { id: 'amazon', name: 'Prime Video' },
            { id: 'apple', name: 'Apple TV+' },
            { id: 'hulu', name: 'Hulu' },
            { id: 'paramount', name: 'Paramount+' },
            { id: 'peacock', name: 'Peacock' },
            { id: 'youtube', name: 'YouTube TV' },
            { id: 'crunchyroll', name: 'Crunchyroll' }
          ];
        },
        enabled: enableDynamicData,
        staleTime: 1000 * 60 * 60, // 1 hour
        retry: false, // Don't retry for static data

      }
    ]
  });

  const [genresQuery, platformsQuery] = dynamicDataQueries;
  const genresData = genresQuery.data;
  const platformsData = platformsQuery.data;
  const isLoadingData = genresQuery.isLoading || platformsQuery.isLoading;

  // Retry functions for failed queries
  const retryGenres = useCallback(() => {
    genresQuery.refetch();
  }, [genresQuery]);

  const retryPlatforms = useCallback(() => {
    platformsQuery.refetch();
  }, [platformsQuery]);

  // Handle query errors with useEffect
  React.useEffect(() => {
    if (genresQuery.error) {
      toast({
        title: "Failed to load genres",
        description: "Using default genre list",
        variant: "destructive",
      });
    }
  }, [genresQuery.error, toast]);

  React.useEffect(() => {
    if (platformsQuery.error) {
      toast({
        title: "Failed to load platforms", 
        description: "Using default platform list",
        variant: "destructive",
      });
    }
  }, [platformsQuery.error, toast]);

  // Optimized update function with reduced object recreation
  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    // Only update if value actually changed
    if (filters[key] === value) return;
    
    onFiltersChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFiltersChange]);

  // Memoized filter handlers for different types
  const filterHandlers = useMemo(() => ({
    search: (value: string) => updateFilter('searchQuery', value),
    genre: (value: string) => updateFilter('genre', value),
    platform: (value: string) => updateFilter('platform', value),
    sortBy: (value: string) => updateFilter('sortBy', value as SortOption),
    rating: (value: number[]) => updateFilter('rating', value as RatingRange),
    runtime: (value: number[]) => updateFilter('runtime', value as RuntimeRange),
    year: (value: string) => updateFilter('year', value),
    contentType: (value: 'all' | 'movie' | 'tv') => updateFilter('contentType', value),
    hideWatched: (value: boolean) => updateFilter('hideWatched', value),
    onlyWatchlist: (value: boolean) => updateFilter('onlyWatchlist', value),
    includeFriends: (value: boolean) => updateFilter('includeFriends', value)
  }), [updateFilter]);

  // Dynamic configuration that merges static config with fetched data
  const dynamicConfig = useMemo(() => {
    const config = { ...FILTER_CONFIG };
    
    // Update genre options with fetched data
    if (genresData && Array.isArray(genresData) && genresData.length > 0) {
      config.genre = {
        ...config.genre,
        options: [
          { value: 'all', label: 'All Genres', icon: '🎭' },
          ...(genresData as Genre[]).map((genre: Genre) => ({
            value: genre.id.toString(),
            label: genre.name,
            icon: getGenreIcon(genre.name)
          }))
        ]
      };
    }
    
    // Update platform options with fetched data
    if (platformsData && Array.isArray(platformsData) && platformsData.length > 0) {
      config.platform = {
        ...config.platform,
        options: [
          { value: 'all', label: 'All Platforms', icon: '📺' },
          ...(platformsData as Platform[]).map((platform: Platform) => ({
            value: platform.id,
            label: platform.name,
            icon: getPlatformIcon(platform.name)
          }))
        ]
      };
    }
    
    return config;
  }, [genresData, platformsData]);

  // Helper functions for icons
  const getGenreIcon = (genreName: string): string => {
    const iconMap: Record<string, string> = {
      'Action': '💥', 'Adventure': '🗺️', 'Animation': '🎨', 'Comedy': '😂',
      'Crime': '🔍', 'Documentary': '📚', 'Drama': '🎭', 'Family': '👨‍👩‍👧‍👦',
      'Fantasy': '🧙‍♂️', 'Horror': '👻', 'Music': '🎵', 'Mystery': '🕵️',
      'Romance': '💕', 'Science Fiction': '🚀', 'Thriller': '😱', 'War': '⚔️', 'Western': '🤠'
    };
    return iconMap[genreName] || '🎬';
  };

  const getPlatformIcon = (platformName: string): string => {
    const iconMap: Record<string, string> = {
      'Netflix': '🔴', 'Disney+': '🏰', 'HBO Max': '🎬', 'Prime Video': '📦',
      'Apple TV+': '🍎', 'Hulu': '🟢', 'Paramount+': '⛰️', 'Peacock': '🦚'
    };
    return iconMap[platformName] || '📺';
  };

  // Configuration-driven active filter count calculation
  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    
    Object.entries(dynamicConfig).forEach(([key, config]) => {
      const filterKey = key as keyof FilterState;
      const value = filters[filterKey];
      
      switch (config.type) {
        case 'select':
          if (value !== 'all' && value !== '') count++;
          break;
        case 'slider':
          const sliderValue = value as number[];
          if (config.key === 'rating' && (sliderValue[0] > 0 || sliderValue[1] < 10)) count++;
          if (config.key === 'runtime' && (sliderValue[0] > 0 || sliderValue[1] < 300)) count++;
          break;
        case 'switch':
          if (value === true) count++;
          break;
        case 'input':
          if (value && typeof value === 'string' && value.trim()) count++;
          break;
      }
    });
    
    return count;
  }, [filters, dynamicConfig]);

  const activeFilterCount = getActiveFilterCount();

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Close expanded filters on Escape
      if (isExpanded) {
        setIsExpanded(false);
        e.preventDefault();
      }
    }
  }, [isExpanded]);

  // Show global loading state while critical data is loading
  if (genresQuery.isLoading && platformsQuery.isLoading && enableDynamicData) {
    return <FilterSystemLoading className={className} />;
  }

  // Show critical error state if both queries failed
  const hasCriticalError = genresQuery.error && platformsQuery.error && enableDynamicData;
  if (hasCriticalError) {
    return (
      <FilterSystemError 
        className={className}
        onRetryAll={() => {
          retryGenres();
          retryPlatforms();
        }}
      />
    );
  }

  return (
    <Card 
      className={`w-full bg-slate-800/50 border-slate-700 ${className}`}
      role="region"
      aria-label="Content filters"
      onKeyDown={handleKeyDown}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" aria-hidden="true" />
            <CardTitle className="text-lg font-semibold text-white">
              Filters
            </CardTitle>
            {activeFilterCount > 0 && (
              <Badge 
                variant="secondary" 
                className="bg-purple-600 text-white"
                aria-label={`${activeFilterCount} active filters`}
              >
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {resultCount !== undefined && (
              <span 
                className="text-sm text-slate-400"
                role="status"
                aria-live="polite"
                aria-label={`${resultCount.toLocaleString()} results found`}
              >
                {resultCount.toLocaleString()} results
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-white focus:ring-2 focus:ring-purple-500"
              aria-expanded={isExpanded}
              aria-controls="expanded-filters"
              aria-label={isExpanded ? 'Hide advanced filters' : 'Show advanced filters'}
            >
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Filters Row - Configuration Driven with Loading States */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Filter */}
          <div className="col-span-2 md:col-span-1">
            <FilterComponent
              config={dynamicConfig.searchQuery}
              value={filters.searchQuery}
              onChange={filterHandlers.search}
            />
          </div>

          {/* Genre Filter with Loading */}
          <div className="relative">
            {isLoadingData && (
              <div className="absolute top-0 right-2 z-10 mt-2">
                <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
              </div>
            )}
            <FilterComponent
              config={dynamicConfig.genre}
              value={filters.genre}
              onChange={filterHandlers.genre}
              isLoading={genresQuery.isLoading}
              error={genresQuery.error?.message}
              onRetry={retryGenres}
            />
          </div>

          {/* Platform Filter with Loading */}
          <div className="relative">
            {isLoadingData && (
              <div className="absolute top-0 right-2 z-10 mt-2">
                <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
              </div>
            )}
            <FilterComponent
              config={dynamicConfig.platform}
              value={filters.platform}
              onChange={filterHandlers.platform}
              isLoading={platformsQuery.isLoading}
              error={platformsQuery.error?.message}
              onRetry={retryPlatforms}
            />
          </div>

          {/* Sort Filter */}
          <FilterComponent
            config={dynamicConfig.sortBy}
            value={filters.sortBy}
            onChange={filterHandlers.sortBy}
          />
        </div>

        {/* Loading indicator for dynamic data */}
        {isLoadingData && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading filter options...
          </div>
        )}

        {/* Quick Toggle Switches - Configuration Driven */}
        <div className="flex flex-wrap gap-6">
          <FilterComponent
            config={dynamicConfig.hideWatched}
            value={filters.hideWatched}
            onChange={filterHandlers.hideWatched}
          />

          <FilterComponent
            config={dynamicConfig.onlyWatchlist}
            value={filters.onlyWatchlist}
            onChange={filterHandlers.onlyWatchlist}
          />

          <FilterComponent
            config={dynamicConfig.includeFriends}
            value={filters.includeFriends}
            onChange={filterHandlers.includeFriends}
          />
        </div>

        {/* Expanded Filters - Configuration Driven */}
        {isExpanded && (
          <>
            <Separator className="bg-slate-700" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rating Range */}
              <FilterComponent
                config={dynamicConfig.rating}
                value={filters.rating}
                onChange={filterHandlers.rating}
              />

              {/* Runtime Range */}
              <FilterComponent
                config={dynamicConfig.runtime}
                value={filters.runtime}
                onChange={filterHandlers.runtime}
              />

              {/* Release Year */}
              <FilterComponent
                config={dynamicConfig.year}
                value={filters.year}
                onChange={filterHandlers.year}
              />

              {/* Content Type */}
              <FilterComponent
                config={dynamicConfig.contentType}
                value={filters.contentType}
                onChange={filterHandlers.contentType}
              />
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2" role="group" aria-label="Filter actions">
          <Button
            onClick={onApplyFilters}
            disabled={isLoading || isLoadingData}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            aria-describedby={activeFilterCount > 0 ? "active-filters-status" : undefined}
          >
            {isLoading ? (
              <>
                <div 
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" 
                  aria-hidden="true"
                />
                <span>Filtering...</span>
                <span className="sr-only">Please wait while filters are being applied</span>
              </>
            ) : (
              <>
                <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
                Apply Filters
              </>
            )}
          </Button>
          
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              onClick={onResetFilters}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white focus:ring-2 focus:ring-purple-500"
              aria-label={`Reset all ${activeFilterCount} active filters`}
            >
              <X className="w-4 h-4 mr-2" aria-hidden="true" />
              Reset
            </Button>
          )}
          
          {/* Screen reader status for active filters */}
          {activeFilterCount > 0 && (
            <span id="active-filters-status" className="sr-only">
              {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'} currently active
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

EnhancedFilterSystem.displayName = 'EnhancedFilterSystem';

export default EnhancedFilterSystem;