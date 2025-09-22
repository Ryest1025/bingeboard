import { useState, useEffect, useCallback } from 'react';

export interface FilterOptionsState {
  genre: string;
  year: string;
  platform: string;
}

export interface UseFilterOptionsResult {
  filterOptions: FilterOptionsState;
  setFilterOptions: (options: FilterOptionsState | Partial<FilterOptionsState>) => void;
  updateFilterOption: <K extends keyof FilterOptionsState>(key: K, value: FilterOptionsState[K]) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTER_OPTIONS: FilterOptionsState = {
  genre: 'All',
  year: 'All',
  platform: 'All',
};

export function useFilterOptions(): UseFilterOptionsResult {
  const [filterOptions, setFilterOptionsState] = useState<FilterOptionsState>(DEFAULT_FILTER_OPTIONS);

  // Load saved filter options from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('filterOptions');
    if (saved) {
      try {
        const parsedOptions = JSON.parse(saved);
        // Validate that parsed options match expected structure
        if (parsedOptions && typeof parsedOptions === 'object') {
          setFilterOptionsState({
            ...DEFAULT_FILTER_OPTIONS,
            ...parsedOptions,
          });
        }
      } catch (error) {
        console.error('Failed to parse filter options from localStorage:', error);
        // Keep default options if parsing fails
      }
    }
  }, []);

  // Save filter options to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('filterOptions', JSON.stringify(filterOptions));
    } catch (error) {
      console.error('Failed to save filter options to localStorage:', error);
    }
  }, [filterOptions]);

  // Set filter options (supports both full and partial updates)
  const setFilterOptions = useCallback((options: FilterOptionsState | Partial<FilterOptionsState>) => {
    if ('genre' in options && 'year' in options && 'platform' in options) {
      // Full update
      setFilterOptionsState(options as FilterOptionsState);
    } else {
      // Partial update
      setFilterOptionsState(prev => ({
        ...prev,
        ...options,
      }));
    }
  }, []);

  // Update a single filter option
  const updateFilterOption = useCallback(<K extends keyof FilterOptionsState>(
    key: K, 
    value: FilterOptionsState[K]
  ) => {
    setFilterOptionsState(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Reset all filters to default
  const resetFilters = useCallback(() => {
    setFilterOptionsState(DEFAULT_FILTER_OPTIONS);
  }, []);

  return { 
    filterOptions, 
    setFilterOptions,
    updateFilterOption,
    resetFilters,
  };
}
