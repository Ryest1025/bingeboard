/**
 * Utelly API Service
 * Provides streaming availability information for movies and TV shows
 */

const UTELLY_BASE_URL = 'https://utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com';
const UTELLY_API_KEY = import.meta.env.VITE_UTELLY_API_KEY;

export interface StreamingLocation {
  display_name: string;
  name: string;
  url: string;
  icon: string;
}

export interface UtellyResult {
  id: string;
  name: string;
  picture: string;
  locations: StreamingLocation[];
  weight: number;
}

export interface UtellyResponse {
  results: UtellyResult[];
  collection: {
    total_results: number;
  };
}

/**
 * Search for streaming availability by title
 */
export async function searchStreamingAvailability(
  title: string,
  country: string = 'us'
): Promise<UtellyResponse> {
  if (!UTELLY_API_KEY) {
    console.warn('Utelly API key not configured');
    return { results: [], collection: { total_results: 0 } };
  }

  try {
    const response = await fetch(
      `${UTELLY_BASE_URL}/lookup?term=${encodeURIComponent(title)}&country=${country}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': UTELLY_API_KEY,
          'X-RapidAPI-Host': 'utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Utelly API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching streaming availability:', error);
    return { results: [], collection: { total_results: 0 } };
  }
}

/**
 * Get streaming availability by IMDB ID
 */
export async function getStreamingByImdbId(
  imdbId: string,
  country: string = 'us'
): Promise<UtellyResponse> {
  if (!UTELLY_API_KEY) {
    console.warn('Utelly API key not configured');
    return { results: [], collection: { total_results: 0 } };
  }

  try {
    const response = await fetch(
      `${UTELLY_BASE_URL}/idlookup?source_id=${imdbId}&source=imdb&country=${country}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': UTELLY_API_KEY,
          'X-RapidAPI-Host': 'utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Utelly API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching streaming availability by IMDB ID:', error);
    return { results: [], collection: { total_results: 0 } };
  }
}

/**
 * Extract unique streaming services from results
 */
export function getUniqueStreamingServices(results: UtellyResult[]): StreamingLocation[] {
  const serviceMap = new Map<string, StreamingLocation>();

  results.forEach(result => {
    result.locations.forEach(location => {
      if (!serviceMap.has(location.name)) {
        serviceMap.set(location.name, location);
      }
    });
  });

  return Array.from(serviceMap.values());
}

/**
 * Popular streaming service names for filtering
 */
export const POPULAR_STREAMING_SERVICES = [
  'netflix',
  'hulu',
  'amazon_prime',
  'disney_plus',
  'hbo_max',
  'apple_tv_plus',
  'paramount_plus',
  'peacock',
  'youtube',
  'vudu',
  'crackle',
  'tubi',
];

/**
 * Filter results by streaming service
 */
export function filterByStreamingService(
  results: UtellyResult[],
  serviceName: string
): UtellyResult[] {
  return results.filter(result =>
    result.locations.some(location =>
      location.name.toLowerCase().includes(serviceName.toLowerCase())
    )
  );
}
