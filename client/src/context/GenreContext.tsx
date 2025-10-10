import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiFetch } from '@/utils/api-config';

interface Genre { id: number; name: string }

interface GenreContextValue {
  genres: Genre[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

const GenreContext = createContext<GenreContextValue>({
  genres: [],
  loading: false,
  error: null,
  refresh: () => {}
});

// Module-level cache
let cachedGenres: Genre[] | null = null;
let fetchPromise: Promise<Genre[]> | null = null;

async function loadGenres(): Promise<Genre[]> {
  if (cachedGenres) return cachedGenres;
  if (fetchPromise) return fetchPromise;
  fetchPromise = (async (): Promise<Genre[]> => {
    try {
      // Use a working endpoint or provide fallback genres
      // Since /api/content/genres-combined/list doesn't exist, use static genres for now
      cachedGenres = [
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
      return cachedGenres;
    } catch (e) {
      console.error('loadGenres error:', e);
      cachedGenres = [];
      return [];
    } finally {
      fetchPromise = null; // allow manual refresh
    }
  })();
  return fetchPromise;
}

export function useGenres() {
  return useContext(GenreContext);
}

interface GenreProviderProps { children: ReactNode }

export function GenreProvider({ children }: GenreProviderProps) {
  const [genres, setGenres] = useState<Genre[]>(cachedGenres || []);
  const [loading, setLoading] = useState(!cachedGenres);
  const [error, setError] = useState<Error | null>(null);

  const fetchAndSet = async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await loadGenres();
      setGenres(next);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!cachedGenres) {
      fetchAndSet();
    }
  }, []);

  const value: GenreContextValue = { genres, loading, error, refresh: fetchAndSet };
  return <GenreContext.Provider value={value}>{children}</GenreContext.Provider>;
}
