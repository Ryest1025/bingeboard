// Helper to map camelCase discover filter keys to TMDB snake_case query params
// Keeps a strict whitelist to avoid accidental leakage of unsupported params.

export interface DiscoverFiltersCamel {
  sortBy?: string;
  genres?: string; // mapped to with_genres
  networks?: string; // mapped to with_networks
  companies?: string; // with_companies
  keywords?: string; // with_keywords
  voteAverageGte?: number; // vote_average.gte or vote_average.gte equivalent (API param is vote_average.gte? actual typical param is vote_average.gte or vote_average.gte style) using vote_average.gte alias vote_average.gte is not standard; fallback to vote_average.gte if needed
  voteAverageLte?: number; // vote_average.lte
  firstAirDateYear?: number; // first_air_date_year
  firstAirDateGte?: string; // first_air_date.gte
  firstAirDateLte?: string; // first_air_date.lte
  withRuntimeGte?: number; // with_runtime.gte
  withRuntimeLte?: number; // with_runtime.lte
  page?: number;
  watchProviders?: string; // with_watch_providers
  watchRegion?: string; // watch_region
  originalLanguage?: string; // with_original_language
}

const keyMap: Record<keyof DiscoverFiltersCamel, string> = {
  sortBy: 'sort_by',
  genres: 'with_genres',
  networks: 'with_networks',
  companies: 'with_companies',
  keywords: 'with_keywords',
  voteAverageGte: 'vote_average.gte',
  voteAverageLte: 'vote_average.lte',
  firstAirDateYear: 'first_air_date_year',
  firstAirDateGte: 'first_air_date.gte',
  firstAirDateLte: 'first_air_date.lte',
  withRuntimeGte: 'with_runtime.gte',
  withRuntimeLte: 'with_runtime.lte',
  page: 'page',
  watchProviders: 'with_watch_providers',
  watchRegion: 'watch_region',
  originalLanguage: 'with_original_language'
};

export function mapDiscoverFilters(filters: DiscoverFiltersCamel = {}): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([camelKey, value]) => {
    if (value === undefined || value === null) return;
    const mapped = keyMap[camelKey as keyof DiscoverFiltersCamel];
    if (mapped) params.append(mapped, String(value));
  });
  return params;
}
