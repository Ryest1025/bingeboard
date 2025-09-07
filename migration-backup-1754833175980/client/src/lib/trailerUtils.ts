// Real trailer API integration using TMDB

interface TrailerVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
  size: number;
}

interface TrailerResponse {
  id: number;
  results: TrailerVideo[];
}

// Get trailer videos from TMDB API
export async function getTrailerVideos(
  tmdbId: number, 
  mediaType: 'movie' | 'tv' = 'tv'
): Promise<TrailerVideo[]> {
  try {
    const response = await fetch(`/api/tmdb/${mediaType}/${tmdbId}/videos`);
    if (!response.ok) {
      throw new Error(`Failed to fetch trailer videos: ${response.status}`);
    }
    
    const data: TrailerResponse = await response.json();
    
    // Filter for trailers and teasers, prioritize official content
    const trailers = data.results.filter(video => 
      video.site === 'YouTube' && 
      (video.type === 'Trailer' || video.type === 'Teaser')
    ).sort((a, b) => {
      // Prioritize official trailers
      if (a.official && !b.official) return -1;
      if (!a.official && b.official) return 1;
      
      // Then prioritize trailers over teasers
      if (a.type === 'Trailer' && b.type === 'Teaser') return -1;
      if (a.type === 'Teaser' && b.type === 'Trailer') return 1;
      
      // Finally, prioritize by size (higher quality)
      return b.size - a.size;
    });
    
    return trailers;
  } catch (error) {
    console.error('Error fetching trailer videos:', error);
    return [];
  }
}

// Get the best trailer for a show
export async function getBestTrailer(
  tmdbId: number, 
  mediaType: 'movie' | 'tv' = 'tv'
): Promise<TrailerVideo | null> {
  const trailers = await getTrailerVideos(tmdbId, mediaType);
  return trailers.length > 0 ? trailers[0] : null;
}

// Get YouTube embed URL for trailer
export function getYouTubeEmbedUrl(videoKey: string, autoplay: boolean = false): string {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    controls: '1',
    showinfo: '0',
    fs: '1',
    cc_load_policy: '0',
    iv_load_policy: '3',
    autohide: '0'
  });
  
  if (autoplay) {
    params.append('autoplay', '1');
  }
  
  return `https://www.youtube.com/embed/${videoKey}?${params.toString()}`;
}

// Check if trailer is available for a show
export async function hasTrailer(
  tmdbId: number, 
  mediaType: 'movie' | 'tv' = 'tv'
): Promise<boolean> {
  const trailers = await getTrailerVideos(tmdbId, mediaType);
  return trailers.length > 0;
}

// Get trailer thumbnail URL
export function getTrailerThumbnail(videoKey: string, quality: 'default' | 'hq' | 'max' = 'hq'): string {
  const qualityMap = {
    'default': 'default.jpg',
    'hq': 'hqdefault.jpg',
    'max': 'maxresdefault.jpg'
  };
  
  return `https://img.youtube.com/vi/${videoKey}/${qualityMap[quality]}`;
}

// Track trailer view for analytics
export async function trackTrailerView(
  tmdbId: number,
  videoKey: string,
  userId: string,
  showTitle: string,
  hasAds: boolean
): Promise<void> {
  try {
    await fetch('/api/analytics/trailer-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        tmdbId,
        videoKey,
        userId,
        showTitle,
        hasAds,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Failed to track trailer view:', error);
  }
}

// Get multiple trailers for a show (for carousel/selection)
export async function getAllTrailers(
  tmdbId: number, 
  mediaType: 'movie' | 'tv' = 'tv'
): Promise<TrailerVideo[]> {
  const trailers = await getTrailerVideos(tmdbId, mediaType);
  return trailers.slice(0, 5); // Return up to 5 trailers
}

// Format trailer duration from YouTube API (if available)
export function formatTrailerDuration(durationISO8601: string): string {
  // Parse ISO 8601 duration format (PT1M30S = 1 minute 30 seconds)
  const match = durationISO8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Get trailer metadata for display
export interface TrailerMetadata {
  title: string;
  description: string;
  duration: string;
  publishedAt: string;
  thumbnailUrl: string;
  embedUrl: string;
  youtubeUrl: string;
}

export async function getTrailerMetadata(
  tmdbId: number,
  mediaType: 'movie' | 'tv' = 'tv'
): Promise<TrailerMetadata | null> {
  const trailer = await getBestTrailer(tmdbId, mediaType);
  if (!trailer) return null;
  
  return {
    title: trailer.name,
    description: `Official ${trailer.type.toLowerCase()} for this ${mediaType}`,
    duration: formatTrailerDuration('PT2M30S'), // Mock duration - would need YouTube API for real duration
    publishedAt: new Date(trailer.published_at).toLocaleDateString(),
    thumbnailUrl: getTrailerThumbnail(trailer.key),
    embedUrl: getYouTubeEmbedUrl(trailer.key),
    youtubeUrl: `https://www.youtube.com/watch?v=${trailer.key}`
  };
}