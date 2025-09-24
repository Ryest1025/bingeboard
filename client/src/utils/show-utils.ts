// Show utility functions

export const getShowTitle = (show: any): string => {
  // Handle nested show structure from AI recommendations
  const showData = show?.show || show;
  return showData?.name || showData?.title || 'Unknown Title';
};

export const getShowPosterUrl = (show: any, size: string = 'w500'): string => {
  // Handle nested show structure from AI recommendations
  const showData = show?.show || show;
  if (showData?.poster_path || showData?.posterPath) {
    const posterPath = showData.poster_path || showData.posterPath;
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  }
  return 'https://via.placeholder.com/500x750/1f2937/white?text=No+Image';
};

export const getShowBackdropUrl = (show: any, size: string = 'w1280'): string => {
  // Handle nested show structure from AI recommendations
  const showData = show?.show || show;
  if (showData?.backdrop_path || showData?.backdropPath) {
    const backdropPath = showData.backdrop_path || showData.backdropPath;
    return `https://image.tmdb.org/t/p/${size}${backdropPath}`;
  }
  return 'https://via.placeholder.com/1280x720/1f2937/white?text=No+Image';
};

export const getStreamingPlatforms = (show: any): any[] => {
  // Handle nested show structure from AI recommendations
  const showData = show?.show || show;

  // Try multiple possible property names for streaming platforms
  // Prioritize the new streamingPlatforms array from enhanced API
  const platforms = showData?.streamingPlatforms ||
    showData?.streaming_platforms ||
    showData?.streamingProviders ||
    showData?.watchProviders?.results?.US?.flatrate ||
    showData?.watch_providers?.results?.US?.flatrate ||
    [];

  return Array.isArray(platforms) ? platforms : [];
};

// Utility to get streaming platform logo with fallbacks
export const getStreamingLogo = (platform: any): string => {
  // Use the centralized platform logo system
  const { getPlatformLogo } = require('@/utils/platformLogos');
  
  // Pass the entire platform object so getPlatformLogo can access all properties
  return getPlatformLogo(platform);
};

export const formatRating = (rating: number | string | null | undefined): string => {
  if (!rating) return '0.0';
  const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  return !isNaN(numRating) ? numRating.toFixed(1) : '0.0';
};

export const getShowRating = (show: any): number | string | null => {
  // Handle nested show structure from AI recommendations
  const showData = show?.show || show;
  return showData?.vote_average || showData?.rating || null;
};

export const getShowOverview = (show: any): string => {
  // Handle nested show structure from AI recommendations
  const showData = show?.show || show;
  return showData?.overview || 'No description available';
};

export const getShowId = (show: any): number => {
  // Handle nested show structure from AI recommendations
  const showData = show?.show || show;
  return showData?.id || showData?.tmdbId || 0;
};

// Analytics tracking utility
export const trackEvent = (event: string, properties: Record<string, any> = {}) => {
  // TODO: Implement analytics tracking
  console.log('Analytics Event:', event, properties);

  // Example implementation for future:
  // if (window.gtag) {
  //   window.gtag('event', event, properties);
  // }
  // 
  // if (window.analytics) {
  //   window.analytics.track(event, properties);
  // }
};
