import { useQuery } from '@tanstack/react-query';
import { forceSparse, isDebugEnabled, recordDebugEvent } from '@/utils/debugSparse';

export interface HybridFilterState {
  mood?: string | null;
  genre?: string | null;
  platforms?: string[];
  country?: string | null;
  year?: string | null;
  sort?: string | null;
}

export interface HybridRecommendationMeta {
  source: 'primary' | 'movie+tv' | 'trending-fallback' | 'error';
  stagesTried?: string[]; // ordered list of stages evaluated
  // Legacy per-stage timing fields (maintained for backwards compatibility) represent stage durations
  primaryTime?: number;      // stage duration (== primaryDuration)
  tvTime?: number;           // stage duration (== tvDuration)
  trendingTime?: number;     // stage duration (== trendingDuration)
  // New normalized timing fields
  primaryDuration?: number;      // duration of primary stage (since stage start)
  primarySinceStart?: number;    // cumulative elapsed since t0 (same as primaryDuration for first stage)
  tvDuration?: number;           // duration of tv stage only
  tvSinceStart?: number;         // cumulative elapsed since t0 when tv stage finished
  trendingDuration?: number;     // duration of trending stage only
  trendingSinceStart?: number;   // cumulative elapsed since t0 when trending stage finished
  primaryUrl?: string;
  tvUrl?: string;
  trendingUrl?: string;
  primarySample?: any[]; // always length <=5
  tvSample?: any[];
  trendingSample?: any[];
  combinedSample?: any[]; // movie+tv merged sample (<=5) when applicable
  error?: string;        // present when source==='error'
  lastSuccess?: 'primary' | 'tv' | null; // last successful stage prior to error (if any)
  debugEnabled?: boolean; // whether debug mode was active during generation
}

export interface HybridRecommendationResult<T=any> {
  data: T[] | undefined;
  isLoading: boolean;
  error: unknown;
  meta?: HybridRecommendationMeta;
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...init });
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  return res.json();
}

function mapTmdbItem(raw: any) {
  if (!raw || raw.id == null) return null;
  const mediaType = raw.media_type || (raw.first_air_date ? 'tv' : 'movie');
  const id = `${mediaType}-${raw.id}`; // unified prefixed id
  return {
    id,
    mediaType,
    title: raw.title || raw.name || 'Untitled',
    overview: raw.overview || '',
    posterPath: raw.poster_path || raw.posterPath || raw.image,
    backdropPath: raw.backdrop_path || raw.backdropPath,
    popularity: raw.popularity,
    rating: raw.vote_average || raw.rating,
    voteCount: raw.vote_count,
    genres: Array.isArray(raw.genre_ids) ? raw.genre_ids : raw.genres,
    releaseDate: raw.release_date || raw.first_air_date,
    runtime: raw.runtime,
    providers: raw.streamingPlatforms || raw.providers || raw.watchProviders,
    platform: raw.platform,
    streamingPlatforms: raw.streamingPlatforms || raw.streaming_platforms || raw.providers || [],
    logoUrl: raw.logoUrl || (raw.logo_path ? `https://image.tmdb.org/t/p/w300${raw.logo_path}` : undefined)
  };
}

function mapTmdbResponse(payload: any) {
  if (!payload) return [] as any[];
  const arr = Array.isArray(payload) ? payload : Array.isArray(payload.results) ? payload.results : [];
  return arr.map(mapTmdbItem).filter(Boolean);
}

type HybridRecommendationArray = any[] & { __meta?: HybridRecommendationMeta };

export async function getHybridRecommendations(filters: HybridFilterState): Promise<HybridRecommendationArray> {
  try {
    const debug = typeof window !== 'undefined' && isDebugEnabled();
    const t0 = performance.now();
    const params: string[] = ['includeStreaming=true'];
    const moodGenreMap: Record<string, string[]> = {
      'Cerebral': ['99','18','53','9648','36'],
      'Feel-good': ['35','10749','10751','10402','16'],
      'Edge-of-seat': ['28','53','27','80','10752','12']
    };
    const moodGenres = filters.mood ? moodGenreMap[filters.mood] || [] : [];
    if (filters.genre) params.push(`with_genres=${encodeURIComponent(filters.genre)}`);
    else if (moodGenres.length) params.push(`with_genres=${moodGenres.join(',')}`);
    if (filters.platforms && filters.platforms.length > 0) {
      params.push(`with_watch_providers=${filters.platforms.join('|')}`);
    }
    if (filters.country) params.push(`region=${filters.country}`);
    if (filters.year) params.push(`primary_release_year=${filters.year}`);
    if (filters.sort) params.push(`sort_by=${encodeURIComponent(filters.sort)}.desc`);

    const base = '/api/tmdb/discover/movie';
    const url = `${base}?${params.join('&')}`;
    if (debug) {
      recordDebugEvent('hybrid-params', {
        filters,
        params: [...params],
        baseUrl: base,
        fullUrl: url.length > 500 ? url.slice(0, 500) + '…' : url
      });
    }
    // PRIMARY STAGE
    let mapped: any[] = [];
    let primaryTime = 0; // stage duration
    let primarySinceStart = 0; // cumulative (same as duration for first stage)
    let prePrimaryCount = 0;
    recordDebugEvent('stage-start', { stage: 'primary', url });
    try {
      const raw = await fetchJSON<any>(url);
      prePrimaryCount = Array.isArray(raw?.results) ? raw.results.length : Array.isArray(raw) ? raw.length : 0;
      mapped = mapTmdbResponse(raw);
      const afterPrimaryMap = mapped.length;
      const sparseAppliedBefore = mapped.length;
      mapped = forceSparse(mapped, 'primary');
      if (debug && (prePrimaryCount !== mapped.length || afterPrimaryMap !== mapped.length)) {
        recordDebugEvent('sparse-applied', { stage: 'primary', before: prePrimaryCount, afterMap: afterPrimaryMap, afterSparse: mapped.length });
      }
      primaryTime = +(performance.now() - t0).toFixed(1);
      primarySinceStart = primaryTime; // identical here
      if (debug) recordDebugEvent('hybrid-primary', {
        stage: 'primary',
        counts: { primary: mapped.length },
        times: { primaryDuration: primaryTime, primarySinceStart },
        urls: { primaryUrl: url }
      });
      recordDebugEvent('stage-complete', { stage: 'primary', success: mapped.length >= 6, count: mapped.length, time: primaryTime, url });
  if (mapped.length >= 6) return Object.assign(mapped.slice(0, 20), { __meta: { source: 'primary' as const, stagesTried: ['primary'], primaryTime, primaryDuration: primaryTime, primarySinceStart, primaryUrl: url, primarySample: mapped.slice(0,5), lastSuccess: 'primary' as const, debugEnabled: debug } });
    } catch (err) {
      primaryTime = +(performance.now() - t0).toFixed(1);
      primarySinceStart = primaryTime;
      recordDebugEvent('stage-error', { stage: 'primary', error: (err as Error).message, time: primaryTime, url });
    }

    // TV SUPPLEMENT STAGE
    const tvUrl = url.replace('/movie', '/tv');
    let tvMapped: any[] = [];
    let tvTime = 0; // stage duration
    let tvSinceStart = 0; // cumulative
    recordDebugEvent('stage-start', { stage: 'tv', url: tvUrl });
    try {
      const tvStart = performance.now();
      const tvRaw = await fetchJSON<any>(tvUrl);
      const preTvCount = Array.isArray(tvRaw?.results) ? tvRaw.results.length : Array.isArray(tvRaw) ? tvRaw.length : 0;
      tvMapped = mapTmdbResponse(tvRaw);
      const afterTvMap = tvMapped.length;
      tvMapped = forceSparse(tvMapped, 'tv');
      if (debug && (preTvCount !== tvMapped.length || afterTvMap !== tvMapped.length)) {
        recordDebugEvent('sparse-applied', { stage: 'tv', before: preTvCount, afterMap: afterTvMap, afterSparse: tvMapped.length });
      }
      tvTime = +(performance.now() - tvStart).toFixed(1); // stage duration
      tvSinceStart = +(performance.now() - t0).toFixed(1);
      const combined = [...mapped, ...tvMapped].filter((v, i, a) => a.findIndex(x => x.id === v.id) === i);
      if (debug) recordDebugEvent('hybrid-movie+tv', {
        stage: 'movie+tv',
        counts: { primary: mapped.length, tv: tvMapped.length, combined: combined.length },
        times: { primaryDuration: primaryTime, primarySinceStart: primarySinceStart, tvDuration: tvTime, tvSinceStart },
        urls: { primaryUrl: url, tvUrl }
      });
      const success = combined.length >= 6;
      recordDebugEvent('stage-complete', { stage: 'tv', success, count: combined.length, time: tvTime, url: tvUrl });
  if (success) return Object.assign(combined.slice(0, 20), { __meta: { source: 'movie+tv' as const, stagesTried: ['primary','tv'], primaryTime, tvTime, primaryDuration: primaryTime, primarySinceStart, tvDuration: tvTime, tvSinceStart, primaryUrl: url, tvUrl, primarySample: mapped.slice(0,5), tvSample: tvMapped.slice(0,5), combinedSample: combined.slice(0,5), lastSuccess: 'tv' as const, debugEnabled: debug } });
    } catch (err) {
      tvTime = +(performance.now() - t0).toFixed(1); // relative total, acceptable
      recordDebugEvent('stage-error', { stage: 'tv', error: (err as Error).message, time: tvTime, url: tvUrl });
    }

    // TRENDING FALLBACK STAGE
    const trendingUrl = '/api/content/trending-enhanced?mediaType=all&includeStreaming=true&limit=40';
    recordDebugEvent('stage-start', { stage: 'trending', url: trendingUrl });
    try {
      const trendingStart = performance.now();
      const trendingRaw = await fetchJSON<any>(trendingUrl);
      const preTrendingCount = Array.isArray(trendingRaw?.results) ? trendingRaw.results.length : Array.isArray(trendingRaw) ? trendingRaw.length : 0;
      let trendingMapped: any[] = mapTmdbResponse(trendingRaw);
      const afterTrendingMap = trendingMapped.length;
      trendingMapped = forceSparse(trendingMapped, 'trending');
      if (debug && (preTrendingCount !== trendingMapped.length || afterTrendingMap !== trendingMapped.length)) {
        recordDebugEvent('sparse-applied', { stage: 'trending', before: preTrendingCount, afterMap: afterTrendingMap, afterSparse: trendingMapped.length });
      }
      const trendingTime = +(performance.now() - trendingStart).toFixed(1); // stage duration
      const trendingSinceStart = +(performance.now() - t0).toFixed(1);
      if (debug) recordDebugEvent('hybrid-trending-fallback', {
        stage: 'trending-fallback',
        counts: { primary: mapped.length, tv: tvMapped.length, trending: trendingMapped.length },
        times: {
          primaryDuration: primaryTime,
          primarySinceStart: primarySinceStart || primaryTime,
          tvDuration: tvTime,
          tvSinceStart: tvSinceStart || tvTime,
          trendingDuration: trendingTime,
          trendingSinceStart
        },
        urls: { primaryUrl: url, tvUrl, trendingUrl }
      });
      recordDebugEvent('stage-complete', { stage: 'trending', success: true, count: trendingMapped.length, time: trendingTime, url: trendingUrl });
  return Object.assign(trendingMapped.slice(0, 20), { __meta: { source: 'trending-fallback' as const, stagesTried: ['primary','tv','trending'], primaryTime, tvTime, trendingTime, primaryDuration: primaryTime, primarySinceStart: primarySinceStart || primaryTime, tvDuration: tvTime, tvSinceStart: tvSinceStart || tvTime, trendingDuration: trendingTime, trendingSinceStart, trendingUrl, primaryUrl: url, primarySample: mapped.slice(0,5), tvSample: tvMapped.slice(0,5), trendingSample: trendingMapped.slice(0,5), lastSuccess: (tvMapped.length ? 'tv' : (mapped.length ? 'primary' : null)) as ('primary' | 'tv' | null), debugEnabled: debug } });
    } catch (err) {
      recordDebugEvent('stage-error', { stage: 'trending', error: (err as Error).message, url: trendingUrl });
      // final fallback: return what we have (could be empty) with error meta
  return Object.assign([] as any[], { __meta: { source: 'error' as const, error: (err as Error).message, stagesTried: ['primary','tv','trending'], lastSuccess: (tvMapped.length ? 'tv' : (mapped.length ? 'primary' : null)) as ('primary' | 'tv' | null), debugEnabled: debug } });
    }
  } catch (e) {
    const message = (e as Error).message;
    recordDebugEvent('hybrid-error', { error: message });
  return Object.assign([] as any[], { __meta: { source: 'error' as const, error: message, stagesTried: [], lastSuccess: null, debugEnabled: (typeof window !== 'undefined' && isDebugEnabled()) } });
  }
}

export function useHybridRecommendations(filters: HybridFilterState): HybridRecommendationResult {
  const debug = typeof window !== 'undefined' && isDebugEnabled();
  const { data, isLoading, error } = useQuery({
    queryKey: ['hybrid-recommendations', filters],
    queryFn: () => getHybridRecommendations(filters),
  staleTime: debug ? 0 : 1000 * 60 * 5,
  refetchOnWindowFocus: debug,
  });
  const meta = (data as any)?.__meta as HybridRecommendationMeta | undefined;
  const normalizedError = error instanceof Error ? error.message : error;
  return { data: data as any[] | undefined, isLoading, error: normalizedError, meta };
}
