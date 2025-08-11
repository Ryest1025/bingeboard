import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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
      const res = await fetch('/api/content/genres-combined/list');
      if (!res.ok) throw new Error('Failed to fetch genres');
      const data = await res.json();
  cachedGenres = data.genres || [];
  return cachedGenres ?? [];
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
