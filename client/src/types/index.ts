export type Show = {
  id: string | number;
  title: string;
  posterUrl?: string;
  poster?: string;
  backdrop?: string;
  overview?: string;
  genres?: string[];
  rating?: number;
  mediaType?: string;
  year?: number;
  runtime?: number;
  platform?: string;
  streamingPlatforms?: Array<{
    provider_id: number;
    provider_name: string;
    logo_path?: string;
    type?: 'sub' | 'buy' | 'rent' | 'free';
    source?: 'tmdb' | 'watchmode' | 'utelly' | 'streaming-availability';
    affiliate_supported?: boolean;
    commission_rate?: number;
    video_quality?: 'sd' | 'hd' | 'uhd';
    expires_soon?: boolean;
    web_url?: string;
    price?: number;
  }>;
  logoUrl?: string;
  releaseDate?: string;
};
