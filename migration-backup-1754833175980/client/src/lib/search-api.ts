// lib/search-api.ts - Enhanced search API with Multi-API integration
export async function searchShowsApi(query: string) {
  if (!query || query.length < 2) return [];
  
  // Use the enhanced TMDB search with better results
  const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(query)}&type=multi`);
  if (!res.ok) throw new Error("Search failed");
  
  const data = await res.json();
  
  // Transform TMDB response to our expected format with enhanced data
  return data.results?.map((item: any) => ({
    id: item.id.toString(),
    title: item.title || item.name,
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : null,
    year: (item.release_date || item.first_air_date)?.split('-')[0] || '',
    genres: item.genre_ids || [],
    type: item.media_type || (item.title ? 'movie' : 'tv'),
    synopsis: item.overview || '',
    vote_average: item.vote_average || 0,
    // Add enhanced fields for better search results
    popularity: item.popularity || 0,
    adult: item.adult || false
  })) || [];
}

export async function fetchShowDetailsApi(id: string, type: string = 'movie') {
  if (!id) throw new Error("Missing id");
  
  // Use the enhanced show details endpoint
  const res = await fetch(`/api/tmdb/${type}/${id}`);
  if (!res.ok) throw new Error("Fetch details failed");
  
  const data = await res.json();
  
  // Get comprehensive streaming availability using multi-API service
  let streamingData = null;
  try {
    const streamingRes = await fetch(
      `/api/streaming/comprehensive/${type}/${id}?title=${encodeURIComponent(data.title || data.name)}&imdbId=${data.external_ids?.imdb_id || ''}`
    );
    if (streamingRes.ok) {
      streamingData = await streamingRes.json();
    }
  } catch (error) {
    console.warn('Failed to fetch streaming data:', error);
  }
  
  // Transform to expected format with multi-API enhancements
  return {
    id: data.id.toString(),
    title: data.title || data.name,
    poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
    backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
    overview: data.overview || '',
    year: (data.release_date || data.first_air_date)?.split('-')[0] || '',
    genres: data.genres?.map((g: any) => g.name) || [],
    vote_average: data.vote_average || 0,
    runtime: data.runtime || data.episode_run_time?.[0] || null,
    status: data.status || '',
    type: type,
    // Enhanced streaming data from multi-API service
    streaming: streamingData?.platforms || [],
    streamingStats: streamingData ? {
      totalPlatforms: streamingData.totalPlatforms,
      affiliatePlatforms: streamingData.affiliatePlatforms,
      premiumPlatforms: streamingData.premiumPlatforms,
      freePlatforms: streamingData.freePlatforms,
      sources: streamingData.sources
    } : null,
    // Trailer data from TMDB
    trailer: data.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')?.key || null,
    // Additional metadata
    imdbId: data.external_ids?.imdb_id || null,
    homepage: data.homepage || null,
    tagline: data.tagline || null,
    productionCompanies: data.production_companies || [],
    cast: data.credits?.cast?.slice(0, 10) || [],
    crew: data.credits?.crew?.filter((c: any) => ['Director', 'Producer', 'Executive Producer'].includes(c.job))?.slice(0, 5) || []
  };
}

// Enhanced search with filters using the multi-API system
export async function enhancedSearchApi(filters: {
  query?: string;
  genres?: string[];
  ratingRange?: [number, number];
  releaseYear?: number;
  providers?: string[];
  sortBy?: string;
}) {
  const res = await fetch('/api/content/enhanced-search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filters),
  });
  
  if (!res.ok) throw new Error("Enhanced search failed");
  
  const data = await res.json();
  
  // Transform results with enhanced data
  return {
    results: data.results?.map((item: any) => ({
      id: item.id.toString(),
      title: item.title || item.name,
      poster: item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : null,
      backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : null,
      year: (item.release_date || item.first_air_date)?.split('-')[0] || '',
      genres: item.genre_ids || [],
      type: item.media_type || (item.title ? 'movie' : 'tv'),
      synopsis: item.overview || '',
      vote_average: item.vote_average || 0,
      popularity: item.popularity || 0
    })) || [],
    totalResults: data.totalResults || 0
  };
}

// Get batch streaming availability for multiple shows
export async function getBatchStreamingApi(titles: Array<{
  tmdbId: number;
  title: string;
  mediaType: 'movie' | 'tv';
  imdbId?: string;
}>) {
  // This would use the MultiAPIStreamingService.getBatchAvailability method
  // For now, we'll fetch individually but could be optimized with a batch endpoint
  const results = new Map();
  
  for (const title of titles) {
    try {
      const res = await fetch(
        `/api/streaming/comprehensive/${title.mediaType}/${title.tmdbId}?title=${encodeURIComponent(title.title)}&imdbId=${title.imdbId || ''}`
      );
      if (res.ok) {
        const data = await res.json();
        results.set(title.tmdbId, data);
      }
    } catch (error) {
      console.warn(`Failed to fetch streaming for ${title.title}:`, error);
    }
  }
  
  return results;
}
