/**
 * Universal Media Normalization Types
 * 
 * Defines consistent interfaces for all media content across the application,
 * ensuring uniform handling of movies, TV shows, and sports content.
 */

export type MediaType = 'movie' | 'tv' | 'sports';

export interface StreamingPlatform {
  provider_id?: number;
  provider_name?: string;
  name?: string;
  logo_path?: string;
  source?: 'tmdb' | 'watchmode' | 'utelly' | 'streaming-availability';
}

export interface SportsInfo {
  sportsLeague?: string;
  homeTeam?: string;
  awayTeam?: string;
  matchTime?: string;
  isLive?: boolean;
  score?: string;
  venue?: string;
}

export interface AwardInfo {
  wins?: number;
  nominations?: number;
  type?: string;
  isWinner?: boolean;
  isAwardNominated?: boolean;
}

export interface RawMedia {
  // Common fields
  id: number | string;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  genre_ids?: number[];
  genres?: Array<{ id: number; name: string }>;
  
  // Date fields
  release_date?: string;
  first_air_date?: string;
  
  // Media type detection
  media_type?: string;
  episode_count?: number;
  number_of_episodes?: number;
  number_of_seasons?: number;
  
  // Streaming platforms - various formats from different APIs
  streamingPlatforms?: StreamingPlatform[];
  streaming?: StreamingPlatform[];
  streaming_platforms?: StreamingPlatform[];
  raw_streaming_platforms?: StreamingPlatform[];
  raw_streamingPlatforms?: StreamingPlatform[];
  
  // Sports-specific
  sportsLeague?: string;
  homeTeam?: string;
  awayTeam?: string;
  matchTime?: string;
  score?: string;
  venue?: string;
  
  // Awards and recommendations
  awards?: AwardInfo;
  personalizedScore?: number;
  reason?: string;
  priority?: number;
  
  // Additional metadata
  adult?: boolean;
  original_language?: string;
  origin_country?: string[];
  [key: string]: any; // Allow for additional properties
}

export interface NormalizedMedia {
  // Preserved original fields
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  genre_ids?: number[];
  genres?: Array<{ id: number; name: string }>;
  release_date?: string;
  first_air_date?: string;
  
  // Normalized fields
  type: MediaType;
  displayTitle: string;
  displayDate: string | null;
  normalizedProviders: string[];
  streaming: StreamingPlatform[];
  streaming_count: number;
  
  // Sports-specific normalized
  isLive: boolean;
  nextMatchTime: Date | null;
  sportsInfo?: SportsInfo;
  
  // Enhanced metadata
  isUpcoming: boolean;
  isAwardWinner: boolean;
  isAwardNominated: boolean;
  awards: AwardInfo;
  personalizedScore: number;
  reason: string;
  priority: number;
  
  // Original data preserved
  originalData: RawMedia;
}

export interface MediaFilters {
  network?: string;
  type?: MediaType;
  genre?: string | number;
  year?: string | number;
  sortBy?: 'popularity' | 'rating' | 'recent' | 'alphabetical' | 'live';
  includeUpcoming?: boolean;
  includeLive?: boolean;
  minRating?: number;
  maxRating?: number;
}

export interface FilteredMediaResult {
  items: NormalizedMedia[];
  totalCount: number;
  appliedFilters: MediaFilters;
  stats: {
    movies: number;
    tvShows: number;
    sports: number;
    liveContent: number;
    upcomingContent: number;
    withStreaming: number;
  };
}