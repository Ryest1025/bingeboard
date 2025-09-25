import { apiFetch, buildQuery } from './fetcher';

export interface UpcomingLocalItem {
  source: 'local';
  releaseId: number;
  showId: number;
  seasonNumber: number | null;
  episodeNumber: number | null;
  releaseDate: string;
  releaseType: string;
  title?: string | null;
  description?: string | null;
  isConfirmed: boolean;
  hasReminder: boolean;
  reminder: any | null;
}

export interface UpcomingRemoteItem {
  source: 'tmdb';
  tmdbId: number;
  mediaType: string;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  popularity: number;
  voteAverage: number;
  releaseDate: string;
  originalLanguage: string;
}

export type UpcomingItem = UpcomingLocalItem | UpcomingRemoteItem;

export interface UpcomingResponse {
  windowDays: number;
  total: number;
  results: UpcomingItem[];
  localCount: number;
  remoteCount: number;
  reminderCount: number;
}

export interface UpcomingParams {
  days?: number;
  mediaType?: 'tv' | 'movie' | 'all';
  limit?: number;
}

export async function fetchUpcomingContent(params: UpcomingParams = {}): Promise<UpcomingResponse> {
  const query = buildQuery({
    days: params.days,
    mediaType: params.mediaType,
    limit: params.limit
  });
  return apiFetch<UpcomingResponse>(`/api/content/upcoming${query}`);
}
