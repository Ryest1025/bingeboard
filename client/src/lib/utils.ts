import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// TMDB image URL helpers
export function createPosterUrl(posterPath: string | null, size: string = 'w500'): string {
  if (!posterPath) return '/placeholder-poster.jpg';
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}

export function createBackdropUrl(backdropPath: string | null, size: string = 'w1280'): string {
  if (!backdropPath) return '/placeholder-backdrop.jpg';
  return `https://image.tmdb.org/t/p/${size}${backdropPath}`;
}

// Show title helper
export function getShowTitle(show: any): string {
  return show?.title || show?.name || show?.original_title || show?.original_name || 'Untitled';
}

// Type definitions
export interface Show {
  id: string | number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  vote_average?: number;
  genre_ids?: number[];
  genres?: Genre[];
  first_air_date?: string;
  release_date?: string;
  original_language?: string;
  isAI?: boolean;
  reason?: string;
  source?: string;
  confidence?: number;
  streamingPlatforms?: any[];
  streaming_platforms?: any[];
  watchProviders?: any[];
  // Filter-critical fields
  popularity?: number;
  year?: number | null;
  media_type?: 'movie' | 'tv';
  runtime?: number | null;
  number_of_seasons?: number | null;
  number_of_episodes?: number | null;
  status?: string;
  // Dashboard-specific fields
  trending?: boolean;
  aiScore?: number;
  friendsWatching?: number;
  friendRecommendations?: string[];
  personalizedScore?: number;
  recommendationReason?: string;
  intelligenceScore?: number;
  sources?: string[];
  isSpotlight?: boolean;
  spotlight_type?: string;
  spotlight_label?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  watchProgress?: number;
  totalEpisodes?: number;
}

export interface Genre {
  id: number;
  name: string;
}
