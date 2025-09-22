/**
 * Streaming Availability API Client
 * Provides comprehensive streaming availability information for movies and TV shows
 */

const STREAMING_AVAILABILITY_BASE_URL = 'https://streaming-availability.p.rapidapi.com';
const STREAMING_AVAILABILITY_API_KEY = process.env.STREAMING_AVAILABILITY_API_KEY || '0a414365a8msh0926992abc957eap16760ejsnf587f56570da';

export interface StreamingAvailabilityService {
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

export interface StreamingAvailabilityOption {
  service: StreamingAvailabilityService;
  type: 'subscription' | 'buy' | 'rent' | 'free';
  link: string;
  videoLink?: string;
  quality?: string;
  audios?: Array<{
    language: string;
    region: string;
  }>;
  subtitles?: Array<{
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
}

export interface StreamingAvailabilityShow {
  id: string;
  title: string;
  overview: string;
  releaseYear?: number;
  genres: Array<{
    id: string;
    name: string;
  }>;
  directors?: string[];
  cast?: string[];
  rating?: number;
  streamingOptions: {
    [country: string]: StreamingAvailabilityOption[];
  };
  tmdbId?: string;
  imdbId?: string;
}

export interface StreamingAvailabilityResponse {
  show?: StreamingAvailabilityShow;
  error?: string;
}

/**
 * Get show details by TMDB ID
 */
export async function getShowByTmdbId(
  type: 'movie' | 'tv',
  tmdbId: number,
  country: string = 'us'
): Promise<StreamingAvailabilityResponse> {
  if (!STREAMING_AVAILABILITY_API_KEY) {
    console.warn('Streaming Availability API key not configured');
    return { error: 'API key not configured' };
  }

  try {
    const response = await fetch(
      `${STREAMING_AVAILABILITY_BASE_URL}/shows/${type}/${tmdbId}?country=${country}&output_language=en`,
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
        return { error: 'Show not found' };
      }
      throw new Error(`Streaming Availability API error: ${response.status}`);
    }

    const data = await response.json();
    return { show: data };
  } catch (error) {
    console.error('Error fetching streaming availability by TMDB ID:', error);
    return { error: (error as Error).message };
  }
}

/**
 * Search for shows by title
 */
export async function searchShows(
  title: string,
  country: string = 'us',
  type?: 'movie' | 'series'
): Promise<StreamingAvailabilityShow[]> {
  if (!STREAMING_AVAILABILITY_API_KEY) {
    console.warn('Streaming Availability API key not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      country,
      title,
      output_language: 'en'
    });
    
    if (type) {
      params.append('show_type', type);
    }

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
    return data.shows || [];
  } catch (error) {
    console.error('Error searching streaming availability:', error);
    return [];
  }
}

/**
 * Convert streaming availability options to our platform format
 */
export function convertStreamingAvailabilityToPlatforms(
  options: StreamingAvailabilityOption[]
): Array<{
  provider_id: string;
  provider_name: string;
  logo_path?: string;
  type: 'sub' | 'buy' | 'rent' | 'free';
  web_url?: string;
  source: 'streaming-availability';
  affiliate_supported: boolean;
  price?: number;
}> {
  return options.map((option, index) => {
    // Map streaming availability types to our format
    let type: 'sub' | 'buy' | 'rent' | 'free';
    switch (option.type) {
      case 'subscription':
        type = 'sub';
        break;
      case 'buy':
        type = 'buy';
        break;
      case 'rent':
        type = 'rent';
        break;
      case 'free':
        type = 'free';
        break;
      default:
        type = 'sub';
    }

    return {
      provider_id: option.service.id || `sa-${index}`,
      provider_name: option.service.name,
      logo_path: option.service.imageSet?.lightThemeImage,
      type,
      web_url: option.link,
      source: 'streaming-availability' as const,
      affiliate_supported: false, // Can be updated based on service
      price: option.price ? parseFloat(option.price.amount) : undefined
    };
  });
}

/**
 * Get popular streaming services for filtering
 */
export const POPULAR_STREAMING_SERVICES = [
  'netflix',
  'prime',
  'hulu',
  'disney',
  'hbo',
  'apple',
  'paramount',
  'peacock',
  'showtime',
  'starz',
  'crunchyroll',
  'funimation'
];