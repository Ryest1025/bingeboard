// Utility function to normalize multi-API and TMDB responses into consistent MediaItem format

export type MediaType = 'movie' | 'tv';

export interface StreamingProvider {
  provider_id?: number;
  provider_name?: string;
  name?: string;
  logo_path?: string;
  url?: string;
}

export interface MediaItem {
  id: number;
  title: string;
  name: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  vote_average?: number | null;
  overview?: string | null;
  genre_ids?: number[];
  streaming?: StreamingProvider[];
  streaming_platforms?: StreamingProvider[];
  streamingPlatforms?: StreamingProvider[];
  media_type: MediaType;
  popularity?: number | null;
  vote_count?: number | null;
  [k: string]: any;
}

/**
 * Normalize various API shapes (TMDB, Multi-API aggregated items, JustWatch, etc)
 * into a single MediaItem used across the application.
 */
export function formatApiItem(raw: any): MediaItem {
  if (!raw) {
    throw new Error('formatApiItem: raw item required');
  }

  const id = typeof raw.id === 'string' ? parseInt(raw.id, 10) : raw.id;
  
  const media_type = (
    raw.media_type ||
    (raw.first_air_date || raw.name ? 'tv' : 'movie')
  ) as MediaType;

  // Normalize streaming arrays - accept many shapes from different APIs
  const rawStreaming = raw.streaming || raw.streaming_platforms || raw.streamingPlatforms || raw.providers || raw.availability || [];
  const streaming = Array.isArray(rawStreaming) 
    ? rawStreaming.map((s: any) => ({
        provider_id: s.provider_id ?? s.id ?? s.provider ?? undefined,
        provider_name: s.provider_name ?? s.name ?? s.providerTitle ?? undefined,
        name: s.name ?? s.provider_name ?? undefined,
        logo_path: s.logo_path ?? s.logo ?? s.icon ?? undefined,
        url: s.url ?? s.watch_link ?? undefined
      }))
    : [];

  const title = (raw.title || raw.name || raw.original_title || raw.original_name || 'Unknown Title').toString();

  return {
    id: id || 0,
    title,
    name: title,
    poster_path: raw.poster_url ?? raw.poster_path ?? raw.poster ?? null,
    backdrop_path: raw.backdrop_url ?? raw.backdrop_path ?? raw.backdrop ?? null,
    release_date: raw.release_date ?? null,
    first_air_date: raw.first_air_date ?? null,
    vote_average: raw.vote_average ?? raw.rating ?? null,
    overview: raw.overview ?? raw.description ?? null,
    genre_ids: raw.genre_ids ?? raw.genres?.map((g: any) => g.id) ?? [],
    streaming,
    streaming_platforms: streaming,
    streamingPlatforms: streaming,
    media_type,
    popularity: raw.popularity ?? null,
    vote_count: raw.vote_count ?? null,
    ...raw
  } as MediaItem;
}

/**
 * Deduplicates media items by media_type and id
 */
export function dedupeMedia(items: MediaItem[]): MediaItem[] {
  const map = new Map<string, MediaItem>();
  for (const item of items) {
    const key = `${item.media_type}:${item.id}`;
    if (!map.has(key)) {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
}
