import { apiFetch, buildQuery } from './fetcher';

export interface DiscoverResult {
  tmdbId: number;
  mediaType: string;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  popularity: number;
  voteAverage: number;
  voteCount: number;
  firstAirDate?: string;
  releaseDate?: string;
  genreIds?: number[];
  originCountry?: string[];
  originalLanguage?: string;
  streamingPlatforms?: any[] | null;
  streamingStats?: { totalPlatforms: number; lastUpdated: string } | null;
  streamingError?: string | null;
}

export interface DiscoverMeta {
  mediaType: string;
  sort: string;
  genres: string | null;
  year: number | null;
  platform: string | null;
  includeStreaming: boolean;
  elapsedMs: number;
}

export interface DiscoverResponse {
  page: number;
  totalPages: number;
  totalResults: number;
  results: DiscoverResult[];
  meta: DiscoverMeta;
}

export interface DiscoverSearchParams {
  mediaType?: 'tv' | 'movie';
  genres?: string; // comma-separated
  year?: number;
  platform?: string; // watch provider id
  providerIds?: string[]; // future multi-provider support (placeholder, not yet sent)
  sort?: string;
  page?: number;
  includeStreaming?: boolean;
}

export async function discoverSearch(params: DiscoverSearchParams): Promise<DiscoverResponse> {
  const query = buildQuery({
    mediaType: params.mediaType,
    genres: params.genres,
    year: params.year,
    platform: params.platform,
    sort: params.sort,
    page: params.page,
    includeStreaming: params.includeStreaming ? 'true' : undefined
  });
  return apiFetch<DiscoverResponse>(`/api/discover/search${query}`);
}
