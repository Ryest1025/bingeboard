/**
 * Client-side Streaming Availability API Service
 * Provides comprehensive streaming availability data for movies and TV shows
 */

const STREAMING_AVAILABILITY_BASE_URL = 'https://streaming-availability.p.rapidapi.com';
const STREAMING_AVAILABILITY_API_KEY = import.meta.env.VITE_STREAMING_AVAILABILITY_API_KEY;

export interface StreamingAvailabilityShow {
  id: string;
  imdbId: string;
  tmdbId: number;
  title: string;
  overview: string;
  releaseDate: string;
  originalLanguage: string;
  genres: Array<{
    id: number;
    name: string;
  }>;
  imageSet: {
    verticalPoster: {
      w240: string;
      w360: string;
      w480: string;
      w600: string;
      w720: string;
    };
    horizontalPoster: {
      w360: string;
      w480: string;
      w720: string;
      w1080: string;
      w1440: string;
    };
  };
  streamingOptions: {
    [countryCode: string]: Array<{
      service: {
        id: string;
        name: string;
        homePage: string;
        themeColorCode: string;
        imageSet: {
          lightThemeImage: string;
          darkThemeImage: string;
          whiteImage: string;
        };
      };
      type: 'subscription' | 'free' | 'buy' | 'rent' | 'ads';
      link: string;
      videoQuality: 'sd' | 'hd' | 'uhd';
      audios: Array<{
        language: string;
        region: string;
      }>;
      subtitles: Array<{
        locale: {
          language: string;
          region: string;
        };
        closedCaptions: boolean;
      }>;
      price?: {
        amount: string;
        currency: string;
        formatted: string;
      };
      expiresSoon: boolean;
      availableSince: number;
    }>;
  };
}

export interface StreamingAvailabilityResponse {
  result: StreamingAvailabilityShow[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface StreamingAvailabilitySearchResponse {
  shows: StreamingAvailabilityShow[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface StreamingService {
  id: string;
  name: string;
  homePage: string;
  themeColorCode: string;
  imageSet: {
    lightThemeImage: string;
    darkThemeImage: string;
    whiteImage: string;
  };
}

/**
 * Search for shows by title
 */
export async function searchShowsByTitle(
  title: string,
  country: string = 'us',
  showType?: 'movie' | 'series'
): Promise<StreamingAvailabilitySearchResponse> {
  if (!STREAMING_AVAILABILITY_API_KEY) {
    console.warn('Streaming Availability API key not configured');
    return { shows: [], hasMore: false };
  }

  try {
    const params = new URLSearchParams({
      country,
      title,
      ...(showType && { show_type: showType }),
      output_language: 'en'
    });

    const response = await fetch(
      `${STREAMING_AVAILABILITY_BASE_URL}/shows/search/title?${params}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': STREAMING_AVAILABILITY_API_KEY,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Streaming Availability API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching shows by title:', error);
    return { shows: [], hasMore: false };
  }
}

/**
 * Get show details by TMDB ID
 */
export async function getShowByTmdbId(
  tmdbId: number,
  country: string = 'us'
): Promise<StreamingAvailabilityShow | null> {
  if (!STREAMING_AVAILABILITY_API_KEY) {
    console.warn('Streaming Availability API key not configured');
    return null;
  }

  try {
    const params = new URLSearchParams({
      country,
      output_language: 'en'
    });

    const response = await fetch(
      `${STREAMING_AVAILABILITY_BASE_URL}/shows/${tmdbId}?${params}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': STREAMING_AVAILABILITY_API_KEY,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Show not found
      }
      throw new Error(`Streaming Availability API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching show by TMDB ID:', error);
    return null;
  }
}

/**
 * Get show details by IMDB ID
 */
export async function getShowByImdbId(
  imdbId: string,
  country: string = 'us'
): Promise<StreamingAvailabilityShow | null> {
  if (!STREAMING_AVAILABILITY_API_KEY) {
    console.warn('Streaming Availability API key not configured');
    return null;
  }

  try {
    const params = new URLSearchParams({
      country,
      output_language: 'en'
    });

    const response = await fetch(
      `${STREAMING_AVAILABILITY_BASE_URL}/shows/${imdbId}?${params}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': STREAMING_AVAILABILITY_API_KEY,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Show not found
      }
      throw new Error(`Streaming Availability API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching show by IMDB ID:', error);
    return null;
  }
}

/**
 * Get available streaming services for a country
 */
export async function getStreamingServices(
  country: string = 'us'
): Promise<StreamingService[]> {
  if (!STREAMING_AVAILABILITY_API_KEY) {
    console.warn('Streaming Availability API key not configured');
    return [];
  }

  try {
    const response = await fetch(
      `${STREAMING_AVAILABILITY_BASE_URL}/countries/${country}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': STREAMING_AVAILABILITY_API_KEY,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Streaming Availability API error: ${response.status}`);
    }

    const data = await response.json();
    return data.services || [];
  } catch (error) {
    console.error('Error fetching streaming services:', error);
    return [];
  }
}

/**
 * Popular streaming service IDs for Streaming Availability API
 */
export const POPULAR_STREAMING_SERVICES = [
  'netflix',
  'amazon-prime-video', 
  'hulu',
  'disney',
  'hbo-max',
  'apple-tv',
  'paramount-plus',
  'peacock',
  'crunchyroll',
  'discovery-plus',
  'espn-plus',
  'showtime',
  'starz'
];

/**
 * Convert Streaming Availability service names to display names
 */
export function getDisplayName(serviceName: string): string {
  const displayNames: Record<string, string> = {
    'netflix': 'Netflix',
    'amazon-prime-video': 'Amazon Prime Video',
    'hulu': 'Hulu',
    'disney': 'Disney+',
    'hbo-max': 'Max',
    'apple-tv': 'Apple TV+',
    'paramount-plus': 'Paramount+',
    'peacock': 'Peacock',
    'crunchyroll': 'Crunchyroll',
    'youtube-premium': 'YouTube Premium',
    'showtime': 'Showtime',
    'starz': 'Starz',
    'discovery-plus': 'Discovery+',
    'espn-plus': 'ESPN+',
    'fubo-tv': 'FuboTV',
    'sling-tv': 'Sling TV'
  };
  return displayNames[serviceName] || serviceName.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}
