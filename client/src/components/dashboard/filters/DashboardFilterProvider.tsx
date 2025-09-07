// DashboardFilterProvider.tsx - Context for cross-section filter state with persistence
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useMemo,
} from 'react';

type FriendActivity = 'All' | 'Lists' | 'Comments';
type ListSortBy = 'date' | 'name' | 'popularity';
type WatchlistStatus = 'Watching' | 'Completed' | 'Plan to Watch';

interface FiltersState {
  activePlatforms: string[];
  preferredGenres: string[];
  userMood: string | null;
  friendActivity: FriendActivity;
  showPublicLists: boolean;
  showCollaborativeLists: boolean;
  listSortBy: ListSortBy;
  watchlistStatus: WatchlistStatus;
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
};

type Action =
  | { type: 'SET_FILTER'; key: keyof FiltersState; value: any }
  | { type: 'RESET_FILTERS' };

const reducer = (state: FiltersState, action: Action): FiltersState => {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, [action.key]: action.value };
    case 'RESET_FILTERS':
      return defaultFilters;
    default:
      return state;
  }
};

interface DashboardFilterContextProps extends FiltersState {
  setFilter: (key: keyof FiltersState, value: any) => void;
  resetFilters: () => void;
}

const LOCAL_STORAGE_KEY = 'dashboardFilters';

const DashboardFilterContext = createContext<DashboardFilterContextProps | undefined>(undefined);

export const DashboardFilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, dispatch] = useReducer(reducer, defaultFilters);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'RESET_FILTERS' }); // Reset first just in case
        Object.entries(parsed).forEach(([key, value]) => {
          if (key in defaultFilters) {
            dispatch({ type: 'SET_FILTER', key: key as keyof FiltersState, value });
          }
        });
      }
    } catch {
      console.log('🔄 Using default filter values');
    }
  }, []);

  // Persist to localStorage on filters change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const setFilter = (key: keyof FiltersState, value: any) => {
    dispatch({ type: 'SET_FILTER', key, value });
  };

  const resetFilters = () => dispatch({ type: 'RESET_FILTERS' });

  const value = useMemo(
    () => ({
      ...filters,
      setFilter,
      resetFilters,
    }),
    [filters]
  );

  return <DashboardFilterContext.Provider value={value}>{children}</DashboardFilterContext.Provider>;
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
