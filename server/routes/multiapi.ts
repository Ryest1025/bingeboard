import express from 'express';
import { tmdbService } from '../services/tmdb';

const router = express.Router();

// Define trailer sources with fallback priority
const TRAILER_SOURCES = [
  { 
    name: 'TMDB', 
    fetchFn: async (showId: string) => {
      try {
        const tmdbData = await tmdbService.getVideos('tv', parseInt(showId));
        const trailer = (tmdbData as any).results?.find((v: any) => 
          v.type === 'Trailer' && v.site === 'YouTube'
        );
        return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
      } catch (error) {
        console.warn('TMDB fetch failed:', error);
        return null;
      }
    }
  },
  { 
    name: 'OMDb', 
    fetchFn: async (showId: string) => {
      try {
        // Mock OMDb API call - replace with actual implementation
        const response = await fetch(`https://www.omdbapi.com/?i=${showId}&apikey=${process.env.OMDB_API_KEY || 'demo_key'}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.trailerUrl || null;
      } catch (error) {
        console.warn('OMDb fetch failed:', error);
        return null;
      }
    }
  },
  { 
    name: 'CustomCDN', 
    fetchFn: async (showId: string) => {
      try {
        // Mock custom CDN call - replace with actual implementation
        const mockTrailers = [
          `https://cdn.bingewatch.com/trailers/${showId}.mp4`,
          `https://www.youtube.com/watch?v=sample_trailer_${showId}`
        ];
        return mockTrailers[Math.floor(Math.random() * mockTrailers.length)];
      } catch (error) {
        console.warn('CustomCDN fetch failed:', error);
        return null;
      }
    }
  }
];

// Pre-roll ad configuration
const AD_VIDEO_URL = 'https://cdn.bingewatch.com/ads/preroll.mp4';

interface TrailerResponse {
  trailerUrl: string;
  adUrl?: string;
  source: string;
}

// Multi-API trailer endpoint with fallback and monetization
router.get('/trailer/:showId', async (req, res) => {
  const { showId } = req.params;
  
  if (!showId || typeof showId !== 'string') {
    return res.status(400).json({ error: 'Invalid showId' });
  }

  let trailer: { url: string; source: string } | null = null;

  // Try each trailer source in order until one succeeds
  for (const source of TRAILER_SOURCES) {
    try {
      const url = await source.fetchFn(showId);
      if (url) {
        trailer = { url, source: source.name };
        break;
      }
    } catch (error) {
      console.error(`Failed to fetch trailer from ${source.name}:`, error);
    }
  }

  if (!trailer) {
    return res.status(404).json({ error: 'Trailer not found' });
  }

  // Determine if we should show a pre-roll ad
  const shouldShowAd = Math.random() > 0.3; // 70% chance for demo
  
  const response: TrailerResponse = {
    trailerUrl: trailer.url,
    adUrl: shouldShowAd ? AD_VIDEO_URL : undefined,
    source: trailer.source
  };

  return res.status(200).json(response);
});

export default router;