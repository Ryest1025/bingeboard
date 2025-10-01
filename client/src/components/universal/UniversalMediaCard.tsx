import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Plus, Play, Calendar, Clock, Share2, Clapperboard } from 'lucide-react';
import StreamingLogos from '@/components/streaming-logos';
import TrailerButton from '@/components/trailer-button';

interface StreamingPlatform {
  provider_id?: number;
  provider_name?: string;
  name?: string;
  logo_path?: string;
}

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  genre_ids?: number[];
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv';
  streaming_platforms?: StreamingPlatform[];
  streamingPlatforms?: StreamingPlatform[];
  streaming?: StreamingPlatform[];
}

interface UniversalMediaCardProps {
  /** Media item data */
  media: MediaItem;
  
  /** Card layout variant */
  variant?: 'vertical' | 'horizontal' | 'spotlight' | 'hero' | 'compact';
  
  /** Card size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Available actions */
  actions?: {
    watchNow?: boolean;
    trailer?: boolean;
    addToList?: boolean;
    share?: boolean;
  };
  
  /** Show streaming platform logos */
  showStreamingLogos?: boolean;
  
  /** Show rating badge */
  showRating?: boolean;
  
  /** Show genre badges */
  showGenres?: boolean;
  
  /** Show release date */
  showReleaseDate?: boolean;
  
  /** Show description */
  showDescription?: boolean;
  
  /** Action callbacks */
  onAddToWatchlist?: (media: MediaItem) => void;
  onWatchTrailer?: (media: MediaItem) => void;
  onCardClick?: (media: MediaItem) => void;
  onShareContent?: (media: MediaItem) => void;
  onWatchNow?: (media: MediaItem) => void;
  
  /** Custom genre mapping */
  genreMap?: Record<number, string>;
  
  /** Custom className */
  className?: string;
}

// Genre mapping
const GENRE_NAMES: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
  10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
};

const UniversalMediaCard: React.FC<UniversalMediaCardProps> = ({
  media,
  variant = 'vertical',
  size = 'md',
  actions = { watchNow: true, trailer: true, addToList: true },
  showStreamingLogos = true,
  showRating = true,
  showGenres = false,
  showReleaseDate = false,
  showDescription = false,
  onAddToWatchlist,
  onWatchTrailer,
  onCardClick,
  onShareContent,
  onWatchNow,
  genreMap = GENRE_NAMES,
  className = ''
}) => {
  // Extract media properties
  const title = media.title || media.name || 'Unknown Title';
  const releaseDate = media.release_date || media.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const rating = media.vote_average ? Number(media.vote_average).toFixed(1) : null;
  const posterUrl = media.poster_path 
    ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
    : null;
  const backdropUrl = media.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${media.backdrop_path}`
    : null;
  
  // Normalize streaming platforms from various possible sources
  const streamingPlatforms = media.streaming_platforms || media.streamingPlatforms || media.streaming || [];
  
  // Normalize streaming platforms to match StreamingLogos props interface
  const normalizedPlatforms = streamingPlatforms.map(platform => ({
    provider_id: platform.provider_id || 0,
    provider_name: platform.provider_name || platform.name || 'Unknown',
    logo_path: platform.logo_path
  })).filter(platform => platform.provider_id > 0);
  
  // Get genres
  const genres = media.genre_ids?.slice(0, 3).map(id => genreMap[id]).filter(Boolean) || [];

  // Size mappings
  const sizeConfig = {
    sm: {
      width: 'w-32',
      height: 'h-48',
      textSize: 'text-xs',
      titleSize: 'text-sm',
      padding: 'p-2'
    },
    md: {
      width: 'w-48',
      height: 'h-72',
      textSize: 'text-sm',
      titleSize: 'text-base',
      padding: 'p-3'
    },
    lg: {
      width: 'w-56',
      height: 'h-84',
      textSize: 'text-base',
      titleSize: 'text-lg',
      padding: 'p-4'
    },
    xl: {
      width: 'w-64',
      height: 'h-96',
      textSize: 'text-lg',
      titleSize: 'text-xl',
      padding: 'p-6'
    }
  };

  const config = sizeConfig[size];

  // Variant-specific rendering
  const renderVerticalCard = () => (
    <Card 
      className={`bg-slate-800 hover:bg-slate-700 transition-all duration-300 cursor-pointer group border-slate-600 hover:border-slate-500 ${config.width} ${className}`}
      onClick={() => onCardClick?.(media)}
    >
      <CardContent className="p-0">
        {/* Poster */}
        <div className={`relative ${config.height} overflow-hidden rounded-t-lg`}>
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-slate-700 flex items-center justify-center">
              <Clapperboard className="w-12 h-12 text-slate-500" />
            </div>
          )}
          
          {/* Rating badge */}
          {showRating && rating && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2 bg-black/70 text-yellow-400 border-yellow-400/30"
            >
              <Star className="w-3 h-3 mr-1 fill-current" />
              {rating}
            </Badge>
          )}
          
          {/* Action overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex gap-2">
              {actions.watchNow && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onWatchNow?.(media);
                  }}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  <Play className="w-4 h-4 mr-1" />
                  {streamingPlatforms.length > 0 ? (
                    <span className="flex items-center gap-1">
                      Watch Now On
                      <StreamingLogos 
                        providers={normalizedPlatforms} 
                        size="sm" 
                        maxDisplayed={1}
                      />
                    </span>
                  ) : (
                    'Watch Now'
                  )}
                </Button>
              )}
              
              {actions.addToList && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToWatchlist?.(media);
                  }}
                  className="border-white/50 text-white hover:bg-white/10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className={config.padding}>
          <h3 className={`font-semibold text-white ${config.titleSize} mb-1 line-clamp-2`}>
            {title}
          </h3>
          
          {showReleaseDate && year && (
            <p className={`text-slate-400 ${config.textSize} mb-2`}>
              {year}
            </p>
          )}
          
          {showGenres && genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {genres.map((genre, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className={`${config.textSize} border-slate-600 text-slate-300`}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          )}
          
          {showDescription && media.overview && (
            <p className={`text-slate-400 ${config.textSize} line-clamp-3 mb-2`}>
              {media.overview}
            </p>
          )}
          
          {showStreamingLogos && streamingPlatforms.length > 0 && (
            <div className="mt-2">
              <StreamingLogos 
                providers={normalizedPlatforms} 
                size="sm"
                maxDisplayed={4}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderHorizontalCard = () => (
    <Card 
      className={`bg-slate-800 hover:bg-slate-700 transition-all duration-300 cursor-pointer group border-slate-600 hover:border-slate-500 ${className}`}
      onClick={() => onCardClick?.(media)}
    >
      <CardContent className="p-0 flex">
        {/* Poster */}
        <div className="relative w-24 h-36 flex-shrink-0 overflow-hidden rounded-l-lg">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-slate-700 flex items-center justify-center">
              <Clapperboard className="w-6 h-6 text-slate-500" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-white text-base mb-1 line-clamp-1">
                {title}
              </h3>
              
              <div className="flex items-center gap-2 mb-2">
                {showRating && rating && (
                  <Badge variant="secondary" className="bg-black/50 text-yellow-400 border-yellow-400/30">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    {rating}
                  </Badge>
                )}
                
                {showReleaseDate && year && (
                  <span className="text-slate-400 text-sm">{year}</span>
                )}
              </div>
              
              {showDescription && media.overview && (
                <p className="text-slate-400 text-sm line-clamp-2 mb-2">
                  {media.overview}
                </p>
              )}
              
              {showStreamingLogos && streamingPlatforms.length > 0 && (
                <StreamingLogos 
                  providers={normalizedPlatforms} 
                  size="sm"
                  maxDisplayed={3}
                />
              )}
            </div>
            
            {/* Actions */}
            <div className="flex flex-col gap-2 ml-4">
              {actions.watchNow && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onWatchNow?.(media);
                  }}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Watch Now
                </Button>
              )}
              
              {actions.addToList && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToWatchlist?.(media);
                  }}
                  className="border-slate-500 text-white hover:bg-white/10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSpotlightCard = () => (
    <Card 
      className={`bg-slate-900 hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden ${className}`}
      onClick={() => onCardClick?.(media)}
    >
      <CardContent className="p-0">
        <div className="relative h-80">
          {/* Background */}
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-700" />
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          
          {/* Content */}
          <div className="relative z-10 p-8 h-full flex flex-col justify-center">
            <h3 className="text-3xl font-bold text-white mb-4 line-clamp-2">
              {title}
            </h3>
            
            <div className="flex items-center gap-4 mb-6">
              {showRating && rating && (
                <Badge variant="secondary" className="bg-black/50 text-yellow-400 border-yellow-400/30">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  {rating}
                </Badge>
              )}
              
              {showReleaseDate && year && (
                <span className="text-white/80">{year}</span>
              )}
              
              {showGenres && genres.length > 0 && (
                <span className="text-white/80">{genres.join(' • ')}</span>
              )}
            </div>
            
            {showDescription && media.overview && (
              <p className="text-white/90 text-lg mb-6 line-clamp-3 max-w-2xl">
                {media.overview}
              </p>
            )}
            
            {/* Actions */}
            <div className="flex items-center gap-4">
              {actions.watchNow && (
                <Button
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onWatchNow?.(media);
                  }}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {streamingPlatforms.length > 0 ? (
                    <span className="flex items-center gap-2">
                      Watch Now On
                      <StreamingLogos 
                        providers={normalizedPlatforms} 
                        size="sm" 
                        maxDisplayed={1}
                      />
                    </span>
                  ) : (
                    'Watch Now'
                  )}
                </Button>
              )}
              
              {actions.trailer && (
                <TrailerButton 
                  show={{ 
                    id: media.id, 
                    title: title, 
                    tmdbId: media.id 
                  }} 
                  size="lg"
                  variant="outline"
                  className="border-white/50 text-white hover:bg-white/10"
                />
              )}
              
              {actions.addToList && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToWatchlist?.(media);
                  }}
                  className="border-white/50 text-white hover:bg-white/10"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  My List
                </Button>
              )}
            </div>
            
            {showStreamingLogos && streamingPlatforms.length > 1 && (
              <div className="mt-4">
                <p className="text-white/60 text-sm mb-2">Also available on:</p>
                <StreamingLogos 
                  providers={normalizedPlatforms.slice(1)} 
                  size="sm"
                  maxDisplayed={5}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCompactCard = () => (
    <Card 
      className={`bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300 cursor-pointer group border-slate-600/50 hover:border-slate-500/50 ${className}`}
      onClick={() => onCardClick?.(media)}
    >
      <CardContent className="p-3 flex items-center gap-3">
        {/* Small poster */}
        <div className="relative w-12 h-18 flex-shrink-0 overflow-hidden rounded">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-slate-700 flex items-center justify-center">
              <Clapperboard className="w-4 h-4 text-slate-500" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white text-sm mb-1 truncate">
            {title}
          </h4>
          
          <div className="flex items-center gap-2">
            {showRating && rating && (
              <span className="text-yellow-400 text-xs flex items-center">
                <Star className="w-3 h-3 mr-1 fill-current" />
                {rating}
              </span>
            )}
            
            {showReleaseDate && year && (
              <span className="text-slate-400 text-xs">{year}</span>
            )}
          </div>
          
          {showStreamingLogos && streamingPlatforms.length > 0 && (
            <div className="mt-1">
              <StreamingLogos 
                providers={normalizedPlatforms} 
                size="sm"
                maxDisplayed={3}
              />
            </div>
          )}
        </div>
        
        {/* Actions */}
        {actions.addToList && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onAddToWatchlist?.(media);
            }}
            className="flex-shrink-0 text-slate-400 hover:text-white hover:bg-white/10"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );

  // Render based on variant
  switch (variant) {
    case 'horizontal':
      return renderHorizontalCard();
    case 'spotlight':
    case 'hero':
      return renderSpotlightCard();
    case 'compact':
      return renderCompactCard();
    case 'vertical':
    default:
      return renderVerticalCard();
  }
};

export default UniversalMediaCard;