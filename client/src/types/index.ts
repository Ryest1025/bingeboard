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
    type?: string;
  }>;
  logoUrl?: string;
  releaseDate?: string;
};
