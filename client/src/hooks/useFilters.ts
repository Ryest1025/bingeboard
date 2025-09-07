import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { FilterValues } from '@/components/common/FilterBadges';

interface UseFiltersOptions {
  persistKey?: string;
  onFiltersChange?: (filters: FilterValues) => void;
  syncWithUrl?: boolean;
}

interface UseFiltersResult {
  filters: FilterValues;
  setFilters: (filters: FilterValues) => void;
  updateFilter: (type: keyof FilterValues, values: string[]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  applyFilters: () => void;
}

/**
 * Custom hook for managing filter state with URL sync and localStorage persistence
 * Provides unified filter management across Dashboard and Discover pages
 */
export function useFilters({
  persistKey = 'app-filters',
  onFiltersChange,
  syncWithUrl = false
}: UseFiltersOptions = {}): UseFiltersResult {
  // Persistent filter state
  const [filters, setPersistedFilters] = useLocalStorage<FilterValues>(persistKey, {
    genres: [],
    platforms: [],
    countries: [],
    sports: []
  });

  // URL synchronization
  useEffect(() => {
    if (syncWithUrl && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlFilters: FilterValues = {
        genres: params.get('genres')?.split(',').filter(Boolean) || [],
        platforms: params.get('platforms')?.split(',').filter(Boolean) || [],
        countries: params.get('countries')?.split(',').filter(Boolean) || [],
        sports: params.get('sports')?.split(',').filter(Boolean) || []
      };

      // Only update if URL has filter params
      const hasUrlFilters = Object.values(urlFilters).some(arr => arr.length > 0);
      if (hasUrlFilters) {
        setPersistedFilters(urlFilters);
      }
    }
  }, [syncWithUrl, setPersistedFilters]);

  // Update URL when filters change (if enabled)
  useEffect(() => {
    if (syncWithUrl && typeof window !== 'undefined') {
      const params = new URLSearchParams();

      if (filters.genres.length > 0) params.set('genres', filters.genres.join(','));
      if (filters.platforms.length > 0) params.set('platforms', filters.platforms.join(','));
      if (filters.countries.length > 0) params.set('countries', filters.countries.join(','));
      if (filters.sports.length > 0) params.set('sports', filters.sports.join(','));

      const newUrl = params.toString() ?
        `${window.location.pathname}?${params.toString()}` :
        window.location.pathname;

      window.history.replaceState({}, '', newUrl);
    }
  }, [filters, syncWithUrl]);

  // Notify parent of filter changes
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  // Helper functions
  const updateFilter = useCallback((type: keyof FilterValues, values: string[]) => {
    setPersistedFilters(prev => ({ ...prev, [type]: values }));
  }, [setPersistedFilters]);

  const clearFilters = useCallback(() => {
    const emptyFilters: FilterValues = {
      genres: [],
      platforms: [],
      countries: [],
      sports: []
    };
    setPersistedFilters(emptyFilters);
  }, [setPersistedFilters]);

  const applyFilters = useCallback(() => {
    // Trigger any apply callbacks
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  // Computed values
  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);
  const activeFilterCount = Object.values(filters).flat().length;

  return {
    filters,
    setFilters: setPersistedFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    applyFilters
  };
}
