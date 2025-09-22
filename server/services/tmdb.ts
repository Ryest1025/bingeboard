import fetch from 'node-fetch';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Get API key dynamically to ensure proper environment loading
const getTMDBAPIKey = () => {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    console.warn('TMDB_API_KEY not found in environment variables');
  }
  return key;
};

interface TMDBShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  first_air_date: string;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  popularity: number;
  vote_count: number;
}

interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  original_language: string;
  popularity: number;
  vote_count: number;
}

interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export class TMDBService {
  private async makeRequest<T>(endpoint: string): Promise<T> {
    const TMDB_API_KEY = getTMDBAPIKey();
    if (!TMDB_API_KEY) {
      throw new Error('TMDB API key not configured');
    }

    const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json() as Promise<T>;
  }

  // Enhanced trending with more granular data
  async getTrending(mediaType: 'tv' | 'movie' | 'all' = 'tv', timeWindow: 'day' | 'week' = 'week') {
    return this.makeRequest<TMDBResponse<TMDBShow | TMDBMovie>>(`/trending/${mediaType}/${timeWindow}`);
  }

  // Popular shows with region support (better than Trakt)
  async getPopular(mediaType: 'tv' | 'movie' = 'tv', region?: string) {
    const regionParam = region ? `&region=${region}` : '';
    return this.makeRequest<TMDBResponse<TMDBShow | TMDBMovie>>(`/${mediaType}/popular?${regionParam}`);
  }

  // Top rated with advanced filtering
  async getTopRated(mediaType: 'tv' | 'movie' = 'tv') {
    return this.makeRequest<TMDBResponse<TMDBShow | TMDBMovie>>(`/${mediaType}/top_rated`);
  }

  // Advanced search with filters (way better than Trakt's basic search)
  async search(query: string, options: {
    mediaType?: 'tv' | 'movie' | 'multi';
    page?: number;
    includeAdult?: boolean;
    region?: string;
    year?: number;
    firstAirDateYear?: number;
  } = {}) {
    const {
      mediaType = 'multi',
      page = 1,
      includeAdult = false,
      region,
      year,
      firstAirDateYear
    } = options;

    let endpoint = `/search/${mediaType}?query=${encodeURIComponent(query)}&page=${page}&include_adult=${includeAdult}`;
    
    if (region) endpoint += `&region=${region}`;
    if (year) endpoint += `&year=${year}`;
    if (firstAirDateYear) endpoint += `&first_air_date_year=${firstAirDateYear}`;

    return this.makeRequest<TMDBResponse<TMDBShow | TMDBMovie>>(endpoint);
  }

  // Discover with advanced filters (Trakt doesn't have this)
  async discover(mediaType: 'tv' | 'movie' = 'tv', filters: {
    sortBy?: string;
    genres?: string;
    with_genres?: string;
    networks?: string;
    companies?: string;
    keywords?: string;
    voteAverageGte?: number;
    voteAverageLte?: number;
    firstAirDateGte?: string;
    firstAirDateLte?: string;
    withRuntimeGte?: number;
    withRuntimeLte?: number;
    with_watch_providers?: string;
    watch_region?: string;
    with_networks?: string;
    with_original_language?: string;
    first_air_date_year?: number;
    page?: number;
  } = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        const paramKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        params.append(paramKey, value.toString());
      }
    });

    return this.makeRequest<TMDBResponse<TMDBShow | TMDBMovie>>(`/discover/${mediaType}?${params.toString()}`);
  }

  // Get detailed show info with credits, keywords, recommendations
  async getShowDetails(showId: number) {
    return this.makeRequest(`/tv/${showId}?append_to_response=credits,keywords,recommendations,watch/providers,external_ids,content_ratings`);
  }

  // Get movie details with similar comprehensive data
  async getMovieDetails(movieId: number) {
    return this.makeRequest(`/movie/${movieId}?append_to_response=credits,keywords,recommendations,watch/providers,external_ids,release_dates`);
  }

  // Watch providers (streaming availability) - Trakt doesn't have this
  async getWatchProviders(mediaType: 'tv' | 'movie', id: number, region = 'US') {
    return this.makeRequest(`/${mediaType}/${id}/watch/providers?region=${region}`);
  }

  // Get recommendations based on a show/movie
  async getRecommendations(mediaType: 'tv' | 'movie', id: number, page = 1) {
    return this.makeRequest<TMDBResponse<TMDBShow | TMDBMovie>>(`/${mediaType}/${id}/recommendations?page=${page}`);
  }

  // Get similar shows/movies
  async getSimilar(mediaType: 'tv' | 'movie', id: number, page = 1) {
    return this.makeRequest<TMDBResponse<TMDBShow | TMDBMovie>>(`/${mediaType}/${id}/similar?page=${page}`);
  }

  // Get genres list
  async getGenres(mediaType: 'tv' | 'movie' = 'tv') {
    return this.makeRequest(`/genre/${mediaType}/list`);
  }

  // Get networks (for TV shows)
  async getNetworks() {
    return this.makeRequest('/configuration/networks');
  }

  // Trending people (actors, directors) - for enhanced recommendations
  async getTrendingPeople(timeWindow: 'day' | 'week' = 'week') {
    return this.makeRequest(`/trending/person/${timeWindow}`);
  }

  // Get airing today
  async getAiringToday() {
    return this.makeRequest<TMDBResponse<TMDBShow>>('/tv/airing_today');
  }

  // Get on the air (currently airing series)
  async getOnTheAir() {
    return this.makeRequest<TMDBResponse<TMDBShow>>('/tv/on_the_air');
  }

  // Advanced multi-search with person, company, keyword results
  async multiSearch(query: string, page = 1) {
    return this.makeRequest(`/search/multi?query=${encodeURIComponent(query)}&page=${page}`);
  }

  // Get collection details (for movie franchises)
  async getCollection(collectionId: number) {
    return this.makeRequest(`/collection/${collectionId}`);
  }

  // Get season details for TV shows
  async getSeasonDetails(showId: number, seasonNumber: number) {
    return this.makeRequest(`/tv/${showId}/season/${seasonNumber}?append_to_response=credits,external_ids`);
  }

  // Get episode details
  async getEpisodeDetails(showId: number, seasonNumber: number, episodeNumber: number) {
    return this.makeRequest(`/tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}`);
  }

  // Get videos (trailers, teasers, etc.)
  async getVideos(mediaType: 'tv' | 'movie', id: number) {
    return this.makeRequest(`/${mediaType}/${id}/videos`);
  }

  // Advanced search method that routes were expecting
  async advancedSearch(params: {
    query?: string;
    genre?: string;
    year?: number;
    rating?: number;
    network?: string;
    language?: string;
    page?: number;
  }) {
    const { query, genre, year, rating, network, language, page = 1 } = params;
    
    if (query) {
      return this.search(query, { page, year });
    }
    
    // Use discover endpoint for filtered searches
    return this.discover('tv', {
      with_genres: genre,
      first_air_date_year: year,
      voteAverageGte: rating,
      with_networks: network,
      with_original_language: language,
      page
    });
  }

  // Search by streaming platform
  async searchByStreamingPlatform(platform: string, page = 1) {
    return this.discover('tv', { 
      with_watch_providers: platform,
      watch_region: 'US',
      page 
    });
  }

  // Get shows by genre
  async getShowsByGenre(genreId: string, page = 1) {
    return this.discover('tv', { 
      with_genres: genreId,
      page 
    });
  }

  // Basic search method that was being called
  async searchShows(query: string, page = 1) {
    return this.search(query, { mediaType: 'tv', page });
  }
}

export const tmdbService = new TMDBService();