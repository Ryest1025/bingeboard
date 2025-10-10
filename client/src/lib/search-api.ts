// NOTE: UI component (StreamingPlatformsDisplay) moved to dedicated React component file.
// This file now only exports data-fetching helpers to avoid esbuild parse errors.
// lib/search-api.ts - Enhanced search API with Multi-API integration (typed + result unions + runtime validation)
import { z } from 'zod';
import { apiFetch } from '@/utils/api-config';

// ---------------- Types ----------------
export interface RawSearchItem {
  id: number;
  title?: string; name?: string; poster_path?: string | null; backdrop_path?: string | null;
  release_date?: string; first_air_date?: string; genre_ids?: number[]; media_type?: string;
  overview?: string; vote_average?: number; popularity?: number; adult?: boolean;
}

// ---------------- Zod Schemas (runtime validation) ----------------
export const RawSearchItemSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  name: z.string().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  release_date: z.string().optional(),
  first_air_date: z.string().optional(),
  genre_ids: z.array(z.number()).optional(),
  media_type: z.string().optional(),
  overview: z.string().optional(),
  vote_average: z.number().optional(),
  popularity: z.number().optional(),
  adult: z.boolean().optional()
}).strip();

const SearchResultsEnvelopeSchema = z.object({
  results: z.array(RawSearchItemSchema).optional()
}).strip();

// TMDB show / movie details (subset of fields actually consumed)
const ShowDetailsRawSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  name: z.string().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  release_date: z.string().optional(),
  first_air_date: z.string().optional(),
  overview: z.string().nullable().optional(),
  genres: z.array(z.object({ id: z.number().optional(), name: z.string().optional() })).optional(),
  vote_average: z.number().optional(),
  popularity: z.number().optional(),
  adult: z.boolean().optional(),
  runtime: z.number().nullable().optional(),
  episode_run_time: z.array(z.number()).optional(),
  status: z.string().optional(),
  videos: z.object({ results: z.array(z.any()).optional() }).optional(),
  external_ids: z.object({ imdb_id: z.string().nullable().optional() }).optional(),
  homepage: z.string().nullable().optional(),
  tagline: z.string().nullable().optional(),
  production_companies: z.array(z.any()).optional(),
  credits: z.object({ cast: z.array(z.any()).optional(), crew: z.array(z.any()).optional() }).optional()
}).strip();

// ---------------- Streaming Availability (batch) Schemas ----------------
// NOTE: The server returns a map keyed by tmdbId -> comprehensive availability object plus order & stats metadata
// We define a conservative schema focusing on the fields we actually read; unknown fields are stripped but not rejected.
const StreamingPlatformSchema = z.object({
  provider_id: z.number().optional(),
  provider_name: z.string().optional(),
  logo_path: z.string().nullable().optional(),
  display_priority: z.number().optional(),
  // Some providers may include additional flags (free, ads, flatrate). Keep permissive.
  monetization_type: z.string().optional()
}).strip();

const ComprehensiveAvailabilitySchema = z.object({
  platforms: z.array(StreamingPlatformSchema).optional(),
  totalPlatforms: z.number().optional(),
  affiliatePlatforms: z.number().optional(),
  premiumPlatforms: z.number().optional(),
  freePlatforms: z.number().optional(),
  sources: z.record(z.any()).optional()
}).strip();

const BatchAvailabilityResponseSchema = z.object({
  results: z.record(z.any()).default({}), // permissive: each value should resemble ComprehensiveAvailabilitySchema
  order: z.array(z.number()).optional(),
  stats: z.object({
    requested: z.number().optional(),
    processed: z.number().optional(),
    returned: z.number().optional(),
    durationMs: z.number().optional()
  }).optional()
}).strip();

interface BatchAvailabilityResponse {
  results: Record<string, any>;
  order?: number[];
  stats?: { requested?: number; processed?: number; returned?: number; durationMs?: number };
}

export interface NormalizedShowSummary {
  id: string;
  title: string;
  poster: string | null;
  year: string;
  genres: number[];
  type: 'movie' | 'tv';
  synopsis: string;
  vote_average: number;
  popularity: number;
  adult: boolean;
}

export interface StreamingStats {
  totalPlatforms: number; affiliatePlatforms: number; premiumPlatforms: number; freePlatforms: number;
  sources: Record<string, any>;
}

export interface ShowDetails extends NormalizedShowSummary {
  backdrop: string | null;
  runtime: number | null;
  status: string;
  streaming: any[];
  streamingStats: StreamingStats | null;
  trailer: string | null;
  imdbId: string | null;
  homepage: string | null;
  tagline: string | null;
  productionCompanies: any[];
  cast: any[];
  crew: any[];
}

export type ApiSuccess<T> = { ok: true; data: T; fromCache?: boolean };
export type ApiFailure = { ok: false; error: Error };
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

// Type guard helpers for ergonomic narrowing
export function isSuccess<T>(r: ApiResult<T>): r is ApiSuccess<T> {
  return r.ok;
}
export function isFailure<T>(r: ApiResult<T>): r is ApiFailure {
  return !r.ok;
}

// Unwrap with fallback value
export function unwrapResult<T>(r: ApiResult<T>, fallback: T): T {
  return r.ok ? r.data : fallback;
}

// Unwrap returning undefined on failure
export function unwrapOrUndefined<T>(r: ApiResult<T>): T | undefined {
  return r.ok ? r.data : undefined;
}

// --------------- Helpers ---------------
function mapRawSearchItem(item: RawSearchItem): NormalizedShowSummary {
  return {
    id: item.id.toString(),
    title: item.title || item.name || 'Untitled',
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : null,
    year: (item.release_date || item.first_air_date || '').split('-')[0] || '',
    genres: item.genre_ids || [],
    type: (item.media_type === 'tv' || (!item.title && item.name)) ? 'tv' : 'movie',
    synopsis: item.overview || '',
    vote_average: item.vote_average || 0,
    popularity: item.popularity || 0,
    adult: item.adult || false
  };
}

async function safeJson(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
}

// Utility to validate using a schema and throw descriptive error
function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown, context: string): T {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Validation failed for ${context}: ${parsed.error.issues.map(i => i.path.join('.') + ' ' + i.message).slice(0, 5).join('; ')}`);
  }
  return parsed.data;
}

// ---------------- API Functions ----------------
export async function searchShowsApi(query: string): Promise<ApiResult<NormalizedShowSummary[]>> {
  try {
    if (!query || query.trim().length < 2) return { ok: true, data: [] };
    const res = await fetch(`/api/streaming/enhanced-search?query=${encodeURIComponent(query)}&type=multi`);
    const raw = await safeJson(res);
    const data = validateOrThrow(SearchResultsEnvelopeSchema, raw, 'searchShowsApi results');
    const mapped = (data.results || []).map((item) => mapRawSearchItem(item));
    return { ok: true, data: mapped };
  } catch (error: any) {
    return { ok: false, error };
  }
}

export async function fetchShowDetailsApi(id: string, type: 'movie' | 'tv' = 'movie'): Promise<ApiResult<ShowDetails>> {
  try {
    if (!id) throw new Error('Missing id');
    const res = await fetch(`/api/tmdb/${type}/${id}`);
    const raw = await safeJson(res);
    const data = validateOrThrow(ShowDetailsRawSchema, raw, 'fetchShowDetailsApi TMDB details');
    let streamingData: any = null;
    try {
      const streamingRes = await fetch(`/api/streaming/comprehensive/${type}/${id}?title=${encodeURIComponent(data.title || data.name || '')}&imdbId=${data.external_ids?.imdb_id || ''}`);
      if (streamingRes.ok) streamingData = await streamingRes.json();
    } catch (e) {
      console.warn('Failed to fetch streaming data:', e);
    }
    const normalized: ShowDetails = {
      id: data.id.toString(),
      title: data.title || data.name || 'Untitled',
      poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
      year: (data.release_date || data.first_air_date || '').split('-')[0] || '',
      genres: (data.genres?.map((g: any) => g.name) || []) as any,
      vote_average: data.vote_average || 0,
      synopsis: data.overview || '',
      popularity: data.popularity || 0,
      adult: data.adult || false,
      runtime: data.runtime || data.episode_run_time?.[0] || null,
      status: data.status || '',
      type,
      streaming: streamingData?.platforms || [],
      streamingStats: streamingData ? {
        totalPlatforms: streamingData.totalPlatforms,
        affiliatePlatforms: streamingData.affiliatePlatforms,
        premiumPlatforms: streamingData.premiumPlatforms,
        freePlatforms: streamingData.freePlatforms,
        sources: streamingData.sources
      } : null,
      trailer: data.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')?.key || null,
      imdbId: data.external_ids?.imdb_id || null,
      homepage: data.homepage || null,
      tagline: data.tagline || null,
      productionCompanies: data.production_companies || [],
      cast: data.credits?.cast?.slice(0, 10) || [],
      crew: data.credits?.crew?.filter((c: any) => ['Director', 'Producer', 'Executive Producer'].includes(c.job))?.slice(0, 5) || []
    };
    return { ok: true, data: normalized };
  } catch (error: any) {
    return { ok: false, error };
  }
}

// Enhanced search with filters using the multi-API system
export interface EnhancedSearchFilters { query?: string; genres?: string[]; ratingRange?: [number, number]; releaseYear?: number; providers?: string[]; sortBy?: string; }
export interface EnhancedSearchResult { results: NormalizedShowSummary[]; totalResults: number; }
export async function enhancedSearchApi(filters: EnhancedSearchFilters): Promise<ApiResult<EnhancedSearchResult>> {
  try {
    const res = await apiFetch('/api/content/enhanced-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filters) });
    const raw = await safeJson(res);
    // Re-use generic envelope schema for results array
    const data = validateOrThrow(SearchResultsEnvelopeSchema.extend({ totalResults: z.number().optional() }), raw, 'enhancedSearchApi results');
    const mapped: NormalizedShowSummary[] = (data.results || []).map((item) => mapRawSearchItem(item));
    return { ok: true, data: { results: mapped, totalResults: data.totalResults || 0 } };
  } catch (error: any) {
    return { ok: false, error };
  }
}

// Get batch streaming availability for multiple shows
export interface BatchStreamingItem { tmdbId: number; title: string; mediaType: 'movie' | 'tv'; imdbId?: string }
export async function getBatchStreamingApi(items: BatchStreamingItem[]): Promise<ApiResult<Map<number, any>>> {
  try {
    if (!items.length) return { ok: true, data: new Map() };
    const res = await fetch('/api/streaming/batch-availability', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) });
    if (res.status === 404) {
      // Fallback to sequential if batch endpoint not deployed yet
      const seq = new Map<number, any>();
      for (const it of items) {
        try {
          const r = await fetch(`/api/streaming/comprehensive/${it.mediaType}/${it.tmdbId}?title=${encodeURIComponent(it.title)}&imdbId=${it.imdbId || ''}`);
          if (r.ok) seq.set(it.tmdbId, await r.json());
        } catch { }
      }
      return { ok: true, data: seq };
    }
    const raw = await safeJson(res);
    let parsed: BatchAvailabilityResponse;
    try {
      parsed = validateOrThrow(BatchAvailabilityResponseSchema, raw, 'getBatchStreamingApi response') as BatchAvailabilityResponse;
    } catch (e: any) {
      // Surface validation error but still attempt to salvage data structure for resilience
      console.warn('[validation] Batch availability response failed validation:', e.message);
      parsed = { results: (raw as any)?.results || {} } as any;
    }
    const map = new Map<number, any>();
    Object.entries<any>(parsed.results || {}).forEach(([k, v]) => map.set(Number(k), v));
    return { ok: true, data: map };
  } catch (error: any) {
    return { ok: false, error };
  }
}
