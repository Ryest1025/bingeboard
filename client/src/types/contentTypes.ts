// BingeBoard Content Types - TMDB Integration Ready

export interface ContentItem {
  id: number;                     // internal DB ID
  tmdbId?: number;                // TMDB ID for API integration
  title: string;
  overview?: string;              // description/synopsis
  genres: string[];               // TMDB genre IDs as strings
  platform: string;               // 'netflix', 'hulu', 'prime', etc
  platformLogo?: string;          // dynamic logo URL
  rating: number;                 // 0-10 scale (TMDB rating)
  runtime: number;                // in minutes
  releaseYear: number;
  releaseDate?: string;           // ISO date string
  status?: 'plan-to-watch' | 'watching' | 'watched' | 'dropped';
  watched?: boolean;
  friendsRecommended?: boolean;
  type: 'movie' | 'tv' | 'documentary' | 'anime';
  upcomingRelease?: string;       // ISO date string
  posterPath?: string;            // TMDB poster path
  backdropPath?: string;          // TMDB backdrop path
  originalLanguage?: string;      // ISO language code
  adult?: boolean;                // adult content flag
  voteCount?: number;             // TMDB vote count
  awards?: {
    nominated?: boolean;
    won?: boolean;
    year?: number;
    category?: string;
    awardName?: string;           // Emmy, Oscar, etc.
  }[];
  popularity?: number;            // TMDB popularity score
  streamingPlatforms?: StreamingPlatform[]; // Multiple platform availability
  watchProviders?: WatchProvider[]; // TMDB watch provider data
  
  // TV Show specific fields
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  episodeRunTime?: number[];      // array for varying episode lengths
  
  // User interaction data
  addedToWatchlistAt?: string;    // ISO date string
  watchedAt?: string;             // ISO date string
  userRating?: number;            // User's personal rating 0-10
  notes?: string;                 // User notes
  
  // Social features
  friendsWatched?: number;        // count of friends who watched
  trendingScore?: number;         // internal trending calculation
}

export interface StreamingPlatform {
  provider_id: number;
  provider_name: string;
  logo_path?: string;
  display_priority?: number;      // for sorting platforms
}

export interface WatchProvider extends StreamingPlatform {
  link?: string;                  // deep link to content
  rent?: boolean;                 // available for rent
  buy?: boolean;                  // available for purchase
  flatrate?: boolean;             // included in subscription
  ads?: boolean;                  // available with ads
}

export interface Genre {
  id: number;
  name: string;
  tmdbId?: number;                // TMDB genre ID mapping
}

export interface Platform {
  id: string;                     // internal ID
  name: string;                   // display name
  tmdbProviderId?: number;        // TMDB provider ID
  logo_path?: string;             // local or remote logo path
  color?: string;                 // brand color
  category?: 'streaming' | 'rental' | 'purchase' | 'broadcast';
}

// Enhanced filter state to match BingeBoard needs
export interface Award {
  id: string;
  name: string;                   // "Academy Awards", "Emmy Awards", etc.
  category?: string;              // "Best Picture", "Best Actor", etc.
  year?: number;
}

export interface AwardFilter {
  nominated?: boolean;
  won?: boolean;
  year?: number;
  awardName?: string;
  category?: string;
}

// Content collection types
export interface ContentCollection {
  id: string;
  name: string;
  description?: string;
  items: ContentItem[];
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
  tags?: string[];
}

// Search and discovery types
export interface SearchFilters {
  query?: string;
  genres?: string[];
  platforms?: string[];
  releaseYearRange?: [number, number];
  ratingRange?: [number, number];
  runtimeRange?: [number, number];
  contentTypes?: ('movie' | 'tv' | 'documentary' | 'anime')[];
  languages?: string[];
  awards?: AwardFilter;
  sortBy?: 'popularity' | 'rating' | 'release_date' | 'title' | 'trending';
  sortOrder?: 'asc' | 'desc';
}

// API response types for TMDB integration
export interface TMDBMovieResult {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  popularity: number;
  poster_path: string | null;
  backdrop_path: string | null;
  adult: boolean;
  original_language: string;
  runtime?: number;
}

export interface TMDBTVResult {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  popularity: number;
  poster_path: string | null;
  backdrop_path: string | null;
  original_language: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
}

export interface TMDBWatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

// Utility type for unified TMDB results
export type TMDBContentResult = TMDBMovieResult | TMDBTVResult;

// Helper function to determine if result is a movie
export function isTMDBMovie(result: TMDBContentResult): result is TMDBMovieResult {
  return 'title' in result && 'release_date' in result;
}

// Helper function to determine if result is a TV show
export function isTMDBTV(result: TMDBContentResult): result is TMDBTVResult {
  return 'name' in result && 'first_air_date' in result;
}

// Convert TMDB result to ContentItem
export function tmdbToContentItem(
  result: TMDBContentResult, 
  platforms: StreamingPlatform[] = []
): ContentItem {
  const isMovie = isTMDBMovie(result);
  
  return {
    id: 0, // Will be set by backend
    tmdbId: result.id,
    title: isMovie ? result.title : result.name,
    overview: result.overview,
    genres: result.genre_ids.map(id => id.toString()),
    platform: platforms[0]?.provider_name.toLowerCase() || 'unknown',
    rating: Math.round(result.vote_average * 10) / 10,
    runtime: isMovie ? (result as TMDBMovieResult).runtime || 0 : 
             (result as TMDBTVResult).episode_run_time?.[0] || 0,
    releaseYear: new Date(
      isMovie ? (result as TMDBMovieResult).release_date : 
                (result as TMDBTVResult).first_air_date
    ).getFullYear(),
    releaseDate: isMovie ? (result as TMDBMovieResult).release_date : 
                          (result as TMDBTVResult).first_air_date,
    type: isMovie ? 'movie' : 'tv',
    posterPath: result.poster_path || undefined,
    backdropPath: result.backdrop_path || undefined,
    originalLanguage: result.original_language,
    adult: isMovie ? (result as TMDBMovieResult).adult : false,
    voteCount: result.vote_count,
    popularity: result.popularity,
    streamingPlatforms: platforms,
    numberOfSeasons: isMovie ? undefined : (result as TMDBTVResult).number_of_seasons,
    numberOfEpisodes: isMovie ? undefined : (result as TMDBTVResult).number_of_episodes,
    episodeRunTime: isMovie ? undefined : (result as TMDBTVResult).episode_run_time,
  };
}