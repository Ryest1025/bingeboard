// DashboardFilterProvider.tsx - Context for cross-section filter state with persistence
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useMemo,
} from 'react';

export type FriendActivity = 'All' | 'Lists' | 'Comments' | 'Ratings' | 'Reactions';
export type ListSortBy = 'date' | 'name' | 'popularity';
export type WatchlistStatus = 'Watching' | 'Paused' | 'Completed' | 'Want to Watch';

export interface RecommendationFilters {
  mood?: string;
  genre?: string;
  platform?: string;
  rating?: string;
  year?: string;
  language?: string;
  hideWatched?: boolean;
}

interface FiltersState {
  activePlatforms: string[];
  preferredGenres: string[];
  userMood: string | null;
  friendActivity: FriendActivity;
  showPublicLists: boolean;
  showCollaborativeLists: boolean;
  listSortBy: ListSortBy;
  watchlistStatus: WatchlistStatus;
  recommendationFilters: RecommendationFilters;
}

const defaultFilters: FiltersState = {
  activePlatforms: [],
  preferredGenres: [],
  userMood: null,
  friendActivity: 'All',
  showPublicLists: true,
  showCollaborativeLists: true,
  listSortBy: 'date',
  watchlistStatus: 'Watching',
  recommendationFilters: {
    hideWatched: false,
  },
};

type Action =
  | { type: 'SET_FILTER'; key: keyof FiltersState; value: FiltersState[keyof FiltersState] }
  | { type: 'RESET_FILTERS' }
  | { type: 'RESET_RECOMMENDATION_FILTERS_ONLY' }
  | { type: 'RESET_ALL_EXCEPT_RECOMMENDATIONS' };

const reducer = (state: FiltersState, action: Action): FiltersState => {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, [action.key]: action.value };
    case 'RESET_FILTERS':
      return { ...defaultFilters }; // Spread to prevent reference sharing
    case 'RESET_RECOMMENDATION_FILTERS_ONLY':
      return { ...state, recommendationFilters: { ...defaultFilters.recommendationFilters } };
    case 'RESET_ALL_EXCEPT_RECOMMENDATIONS':
      return { ...defaultFilters, recommendationFilters: state.recommendationFilters };
    default:
      return state;
  }
};

interface DashboardFilterContextProps extends FiltersState {
  /** Type-safe filter setter that ensures value matches the key type */
  setFilter: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
  /** Get a specific filter value in a type-safe way */
  getFilter: <K extends keyof FiltersState>(key: K) => FiltersState[K];
  /** Reset all filters to default values */
  resetFilters: () => void;
  /** Reset only recommendation filters, keeping other filters intact */
  resetRecommendationFilters: () => void;
  /** Reset all filters except recommendation filters */
  resetAllExceptRecommendations: () => void;
  /** Update recommendation filters with partial values (merges with existing) */
  updateRecommendationFilters: (filters: Partial<RecommendationFilters>) => void;
}

const LOCAL_STORAGE_KEY = 'dashboardFilters';

// Type-safe validation helper
const isValidRecommendationFilters = (value: unknown): value is RecommendationFilters => {
  if (typeof value !== 'object' || value === null) return false;
  
  const v = value as Record<string, unknown>;
  return (
    (v.mood === undefined || typeof v.mood === 'string') &&
    (v.genre === undefined || typeof v.genre === 'string') &&
    (v.platform === undefined || typeof v.platform === 'string') &&
    (v.rating === undefined || typeof v.rating === 'string') &&
    (v.year === undefined || typeof v.year === 'string') &&
    (v.language === undefined || typeof v.language === 'string') &&
    (v.hideWatched === undefined || typeof v.hideWatched === 'boolean')
  );
};

const isValidFilterValue = (key: keyof FiltersState, value: unknown): value is FiltersState[keyof FiltersState] => {
  switch (key) {
    case 'activePlatforms':
    case 'preferredGenres':
      return Array.isArray(value) && value.every(item => typeof item === 'string');
    case 'userMood':
      return value === null || typeof value === 'string';
    case 'friendActivity':
      return ['All', 'Lists', 'Comments', 'Ratings', 'Reactions'].includes(value as string);
    case 'showPublicLists':
    case 'showCollaborativeLists':
      return typeof value === 'boolean';
    case 'listSortBy':
      return ['date', 'name', 'popularity'].includes(value as string);
    case 'watchlistStatus':
      return ['Watching', 'Paused', 'Completed', 'Want to Watch'].includes(value as string);
    case 'recommendationFilters':
      return isValidRecommendationFilters(value);
    default:
      return false;
  }
};

const DashboardFilterContext = createContext<
  DashboardFilterContextProps | undefined
>(undefined);

export const DashboardFilterProvider = ({
  children,
  userId,
}: {
  children: ReactNode;
  userId?: string; // Optional user ID for user-specific persistence
}) => {
  const [filters, dispatch] = useReducer(reducer, defaultFilters);

  // Create user-specific localStorage key
  const localStorageKey = userId 
    ? `dashboardFilters_${userId}` 
    : LOCAL_STORAGE_KEY;

  // Load from localStorage on mount with proper validation
  useEffect(() => {
    try {
      const saved = localStorage.getItem(localStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<FiltersState>;
        
        // Validate and apply each filter value
        Object.entries(parsed).forEach(([key, value]) => {
          const filterKey = key as keyof FiltersState;
          if (filterKey in defaultFilters && isValidFilterValue(filterKey, value)) {
            dispatch({
              type: 'SET_FILTER',
              key: filterKey,
              value: value as FiltersState[keyof FiltersState],
            });
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load dashboard filters from localStorage:', error);
      console.log('🔄 Using default filter values');
    }
  }, [localStorageKey]);

  // Persist to localStorage on filters change
  useEffect(() => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(filters));
    } catch (error) {
      console.warn('Failed to save dashboard filters to localStorage:', error);
    }
  }, [filters, localStorageKey]);

  const setFilter = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
    dispatch({ type: 'SET_FILTER', key, value });
  };

  const getFilter = <K extends keyof FiltersState>(key: K): FiltersState[K] => {
    return filters[key];
  };

  const resetFilters = () => dispatch({ type: 'RESET_FILTERS' });

  const resetRecommendationFilters = () => {
    dispatch({ type: 'RESET_RECOMMENDATION_FILTERS_ONLY' });
  };

  const resetAllExceptRecommendations = () => {
    dispatch({ type: 'RESET_ALL_EXCEPT_RECOMMENDATIONS' });
  };

  const updateRecommendationFilters = (newFilters: Partial<RecommendationFilters>) => {
    dispatch({
      type: 'SET_FILTER',
      key: 'recommendationFilters',
      value: { ...filters.recommendationFilters, ...newFilters }
    });
  };

  const value = useMemo(
    () => ({
      ...filters,
      setFilter,
      getFilter,
      resetFilters,
      resetRecommendationFilters,
      resetAllExceptRecommendations,
      updateRecommendationFilters,
    }),
    [filters]
  );

  return (
    <DashboardFilterContext.Provider value={value}>
      {children}
    </DashboardFilterContext.Provider>
  );
};

export const useDashboardFilters = () => {
  const context = useContext(DashboardFilterContext);
  if (!context) {
    throw new Error(
      'useDashboardFilters must be used within a DashboardFilterProvider'
    );
  }
  return context;
};
