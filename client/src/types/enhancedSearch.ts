/* ignore-unused-export (value shape referenced indirectly in API results) */
export interface StreamingSource {
  providerId?: string;
  name?: string;
  type?: string; // subscription, rent, buy, free, etc.
  logoPath?: string;
  region?: string;
}

export interface EnhancedShow {
  id: number | string;
  title?: string;
  name?: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  media_type?: 'movie' | 'tv';
  overview?: string;
  streaming?: StreamingSource[];
}
