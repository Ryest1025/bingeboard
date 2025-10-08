import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Plus, Play, Calendar, Clock, Share2, Clapperboard, Heart, Bookmark } from 'lucide-react';
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

// Shared styling components for unified design
const RatingBadge: React.FC<{ rating: string; className?: string }> = ({ rating, className = '' }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.3 }}
    className={`inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400/90 to-amber-500/90 backdrop-blur-sm shadow-lg border border-yellow-300/30 ${className}`}
  >
    <Star className="w-3 h-3 mr-1 fill-yellow-900 text-yellow-900" />
    <span className="text-xs font-semibold text-yellow-900">{rating}</span>
  </motion.div>
);

const ActionButton: React.FC<{
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ children, onClick, variant = 'secondary', size = 'md', className = '' }) => {
  const baseClasses = "transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-lg backdrop-blur-sm";
  
  const variants = {
    primary: "bg-gradient-to-r from-white to-gray-100 text-black hover:from-gray-100 hover:to-white hover:shadow-xl hover:scale-105 border border-white/20",
    secondary: "bg-gradient-to-r from-slate-800/90 to-slate-700/90 text-white hover:from-slate-700/90 hover:to-slate-600/90 hover:shadow-xl hover:scale-105 border border-slate-500/30",
    floating: "bg-gradient-to-r from-black/80 to-slate-900/80 text-white hover:from-black/90 hover:to-slate-800/90 hover:shadow-2xl hover:scale-110 border border-white/10 backdrop-blur-md"
  };
  
  const sizes = {
    sm: "px-3 py-2 text-xs rounded-lg",
    md: "px-4 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-xl"
  };
  
  return (
    <motion.button
      whileHover={{ scale: variant === 'floating' ? 1.1 : 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

const CardWrapper: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'vertical' | 'horizontal' | 'spotlight' | 'compact';
}> = ({ children, onClick, className = '', variant = 'vertical' }) => {
  const variantClasses = {
    vertical: "group cursor-pointer rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 hover:border-slate-500/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-visible",
    horizontal: "group cursor-pointer rounded-2xl bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-slate-700/50 hover:border-slate-500/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] overflow-visible",
    spotlight: "group cursor-pointer rounded-3xl bg-gradient-to-br from-slate-900/95 to-black/95 border border-slate-600/30 hover:border-slate-400/50 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:scale-[1.01] overflow-hidden",
    compact: "group cursor-pointer rounded-xl bg-gradient-to-r from-slate-800/60 to-slate-900/60 border border-slate-700/30 hover:border-slate-500/50 shadow-lg hover:shadow-xl transition-all duration-400 hover:scale-[1.01] overflow-visible"
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      className={`${variantClasses[variant]} ${className}`}
    >
      {children}
    </motion.div>
  );
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
    <CardWrapper 
      variant="vertical"
      className={`${config.width} min-h-fit ${className}`}
      onClick={() => onCardClick?.(media)}
    >
      <div className="flex flex-col h-full">
        {/* Poster Section */}
        <div className={`relative ${config.height} w-full flex-shrink-0`}>
          {posterUrl ? (
            <motion.img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover rounded-t-2xl transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.7 }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center rounded-t-2xl">
              <Clapperboard className="w-12 h-12 text-slate-400" />
            </div>
          )}
          
          {/* Premium gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500 rounded-t-2xl" />
          
          {/* Rating badge - floating style */}
          {showRating && rating && (
            <div className="absolute top-3 left-3">
              <RatingBadge rating={rating} />
            </div>
          )}
          
          {/* Floating action buttons overlay */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-t-2xl"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            <div className="flex gap-3">
              {actions.watchNow && (
                <ActionButton
                  variant="floating"
                  size="md"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onWatchNow?.(media);
                  }}
                >
                  <Play className="w-4 h-4" />
                  <span className="hidden sm:inline">Watch</span>
                </ActionButton>
              )}
              
              {actions.addToList && (
                <ActionButton
                  variant="floating"
                  size="md"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onAddToWatchlist?.(media);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add</span>
                </ActionButton>
              )}
              
              {actions.trailer && (
                <ActionButton
                  variant="floating"
                  size="md"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onWatchTrailer?.(media);
                  }}
                >
                  <PlayCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Trailer</span>
                </ActionButton>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Content Section - Now properly positioned below poster */}
        <div className={`${config.padding} flex-grow flex flex-col justify-between min-h-0`}>
          <div className="space-y-2 flex-grow">
            {/* Title */}
            <h3 className={`${config.titleSize} font-bold text-white leading-tight line-clamp-2 group-hover:text-blue-300 transition-colors duration-300`}>
              {title}
            </h3>
            
            {/* Release Year */}
            {showReleaseDate && year && (
              <p className={`${config.textSize} text-slate-400`}>
                {year}
              </p>
            )}
            
            {/* Genres */}
            {showGenres && genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {genres.map((genre, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-slate-700/70 text-slate-300 text-xs rounded-md backdrop-blur-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
            
            {/* Description */}
            {showDescription && media.overview && (
              <p className={`${config.textSize} text-slate-300 line-clamp-3 leading-relaxed`}>
                {media.overview}
              </p>
            )}
          </div>
          
          {/* Streaming Logos */}
          {showStreamingLogos && normalizedPlatforms.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <StreamingLogos 
                platforms={normalizedPlatforms}
                limit={3}
                size="sm"
                className="justify-start"
              />
            </div>
          )}
        </div>
      </div>
    </CardWrapper>
  );
                    );

  const renderHorizontalCard = () => (
          <motion.h3 
            className={`font-bold text-white ${config.titleSize} mb-2 line-clamp-2 group-hover:text-blue-200 transition-colors duration-300`}
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1 }}
          >
            {title}
          </motion.h3>
          
          {showReleaseDate && year && (
            <p className={`text-slate-400 ${config.textSize} mb-3 font-medium`}>
              {year}
            </p>
          )}
          
          {showGenres && genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {genres.map((genre, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge 
                    variant="outline" 
                    className={`${config.textSize} border-blue-500/30 text-blue-200 bg-blue-500/10 hover:bg-blue-500/20 transition-colors duration-300`}
                  >
                    {genre}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
          
          {showDescription && media.overview && (
            <p className={`text-slate-300 ${config.textSize} line-clamp-3 mb-3 leading-relaxed`}>
              {media.overview}
            </p>
          )}
          
          {showStreamingLogos && normalizedPlatforms.length > 0 && (
            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StreamingLogos 
                providers={normalizedPlatforms} 
                size="sm"
                maxDisplayed={3}
              />
            </motion.div>
          )}

          {/* Bottom action bar - always visible with premium styling */}
          {(actions.watchNow || actions.addToList || actions.trailer) && (
            <div className="flex items-center gap-2 pt-3 border-t border-slate-600/30">
              {actions.watchNow && (
                <ActionButton
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onWatchNow?.(media);
                  }}
                  className="flex-1"
                >
                  <Play className="w-3 h-3" />
                  <span>Watch</span>
                </ActionButton>
              )}
              
              {actions.addToList && (
                <ActionButton
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onAddToWatchlist?.(media);
                  }}
                >
                  <Plus className="w-3 h-3" />
                </ActionButton>
              )}

              {actions.trailer && (
                <TrailerButton 
                  show={{
                    id: media.id,
                    tmdbId: media.id,
                    title: title
                  }}
                  size="sm"
                  className="text-xs border-slate-500/30 hover:border-slate-400/50 hover:bg-slate-600/30"
                  showLabel={false}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </CardWrapper>
  );

  const renderHorizontalCard = () => (
    <CardWrapper 
      variant="horizontal"
      className={className}
      onClick={() => onCardClick?.(media)}
    >
      <div className="flex">
        {/* Poster with enhanced styling */}
        <div className="relative w-24 h-36 flex-shrink-0 overflow-hidden">
          {posterUrl ? (
            <motion.img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.5 }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <Clapperboard className="w-6 h-6 text-slate-400" />
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 group-hover:to-black/10 transition-all duration-500" />
        </div>
        
        {/* Content with premium styling */}
        <div className="flex-1 p-4 bg-gradient-to-r from-slate-800/30 to-transparent">
          <div className="flex items-start justify-between h-full">
            <div className="flex-1 min-w-0">
              <motion.h3 
                className="font-bold text-white text-base mb-2 line-clamp-2 group-hover:text-blue-200 transition-colors duration-300"
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
              >
                {title}
              </motion.h3>
              
              <div className="flex items-center gap-3 mb-3">
                {showRating && rating && (
                  <RatingBadge rating={rating} className="scale-90" />
                )}
                
                {showReleaseDate && year && (
                  <span className="text-slate-400 text-sm font-medium">{year}</span>
                )}
              </div>
              
              {showDescription && media.overview && (
                <p className="text-slate-300 text-sm line-clamp-2 mb-3 leading-relaxed">
                  {media.overview}
                </p>
              )}
              
              {showStreamingLogos && normalizedPlatforms.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <StreamingLogos 
                    providers={normalizedPlatforms} 
                    size="sm"
                    maxDisplayed={3}
                  />
                </motion.div>
              )}
            </div>
            
            {/* Action buttons with enhanced styling */}
            <div className="flex flex-col gap-2 ml-4">
              {actions.watchNow && (
                <ActionButton
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onWatchNow?.(media);
                  }}
                >
                  <Play className="w-4 h-4" />
                  <span>Watch</span>
                </ActionButton>
              )}
              
              {actions.addToList && (
                <ActionButton
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onAddToWatchlist?.(media);
                  }}
                >
                  <Plus className="w-4 h-4" />
                </ActionButton>
              )}
              
              {actions.trailer && (
                <ActionButton
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onWatchTrailer?.(media);
                  }}
                >
                  <Play className="w-4 h-4" />
                </ActionButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </CardWrapper>
  );

  const renderSpotlightCard = () => (
    <CardWrapper 
      variant="spotlight"
      className={className}
      onClick={() => onCardClick?.(media)}
    >
      <div className="relative h-80">
        {/* Premium background with parallax effect */}
        {backdropUrl ? (
          <motion.img
            src={backdropUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            loading="lazy"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 1 }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900" />
        )}
        
        {/* Premium multi-layer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 group-hover:from-black/80 group-hover:via-black/40 group-hover:to-black/10 transition-all duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Content with enhanced animations */}
        <div className="relative z-10 p-8 h-full flex flex-col justify-center">
          <motion.h3 
            className="text-4xl font-black text-white mb-4 line-clamp-2 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h3>
          
          <motion.div 
            className="flex items-center gap-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {showRating && rating && (
              <RatingBadge rating={rating} className="scale-110" />
            )}
            
            {showReleaseDate && year && (
              <span className="text-white/90 text-lg font-semibold px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                {year}
              </span>
            )}
            
            {showGenres && genres.length > 0 && (
              <div className="flex gap-2">
                {genres.slice(0, 3).map((genre, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="text-blue-200 text-sm font-medium px-2 py-1 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-400/30"
                  >
                    {genre}
                  </motion.span>
                ))}
              </div>
            )}
          </motion.div>
          
          {showDescription && media.overview && (
            <motion.p 
              className="text-white/95 text-lg mb-8 line-clamp-3 max-w-3xl leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {media.overview}
            </motion.p>
          )}
          
          {/* Premium action buttons */}
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {actions.watchNow && (
              <ActionButton
                variant="primary"
                size="lg"
                onClick={(e) => {
                  e?.stopPropagation();
                  onWatchNow?.(media);
                }}
                className="shadow-2xl hover:shadow-white/20"
              >
                <Play className="w-5 h-5" />
                <span className="font-bold">Watch Now</span>
              </ActionButton>
            )}
            
            {actions.trailer && (
              <ActionButton
                variant="floating"
                size="lg"
                onClick={(e) => {
                  e?.stopPropagation();
                  onWatchTrailer?.(media);
                }}
                className="border-white/30 hover:border-white/50"
              >
                <Play className="w-5 h-5" />
                <span>Trailer</span>
              </ActionButton>
            )}
            
            {actions.addToList && (
              <ActionButton
                variant="floating"
                size="lg"
                onClick={(e) => {
                  e?.stopPropagation();
                  onAddToWatchlist?.(media);
                }}
                className="border-white/30 hover:border-white/50"
              >
                <Plus className="w-5 h-5" />
                <span>My List</span>
              </ActionButton>
            )}
            
            {actions.share && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onShareContent?.(media);
                }}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 shadow-lg"
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
            )}
          </motion.div>
          
          {showStreamingLogos && normalizedPlatforms.length > 1 && (
            <motion.div 
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <p className="text-white/70 text-sm mb-3 font-medium">Also available on:</p>
              <StreamingLogos 
                providers={normalizedPlatforms.slice(1)} 
                size="sm"
                maxDisplayed={5}
              />
            </motion.div>
          )}
        </div>
        
        {/* Floating corner actions */}
        <motion.div
          className="absolute top-6 right-6 flex gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onAddToWatchlist?.(media);
            }}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg"
          >
            <Bookmark className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </CardWrapper>
  );

  const renderCompactCard = () => (
    <CardWrapper 
      variant="compact"
      className={className}
      onClick={() => onCardClick?.(media)}
    >
      <div className="p-3 flex items-center gap-3">
        {/* Enhanced mini poster */}
        <div className="relative w-14 h-20 flex-shrink-0 overflow-hidden rounded-lg">
          {posterUrl ? (
            <motion.img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <Clapperboard className="w-4 h-4 text-slate-400" />
            </div>
          )}
          
          {/* Mini gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        {/* Content with enhanced typography */}
        <div className="flex-1 min-w-0">
          <motion.h4 
            className="font-bold text-white text-sm mb-1 truncate group-hover:text-blue-200 transition-colors duration-300"
            initial={{ opacity: 0.9 }}
            whileHover={{ opacity: 1 }}
          >
            {title}
          </motion.h4>
          
          <div className="flex items-center gap-2 mb-1">
            {showRating && rating && (
              <motion.span 
                className="text-yellow-400 text-xs flex items-center font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Star className="w-3 h-3 mr-1 fill-current" />
                {rating}
              </motion.span>
            )}
            
            {showReleaseDate && year && (
              <span className="text-slate-400 text-xs font-medium">{year}</span>
            )}
          </div>
          
          {showStreamingLogos && normalizedPlatforms.length > 0 && (
            <motion.div 
              className="mt-1"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <StreamingLogos 
                providers={normalizedPlatforms} 
                size="sm"
                maxDisplayed={2}
              />
            </motion.div>
          )}
        </div>
        
        {/* Enhanced action buttons */}
        <div className="flex items-center gap-1">
          {actions.addToList && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onAddToWatchlist?.(media);
              }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur-sm border border-slate-600/50 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-400/70 hover:from-slate-600/80 hover:to-slate-700/80 transition-all duration-300 shadow-lg"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          )}
          
          {actions.watchNow && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onWatchNow?.(media);
              }}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-white/90 to-gray-100/90 text-black text-xs font-bold flex items-center gap-1 hover:from-white hover:to-white hover:shadow-lg transition-all duration-300"
            >
              <Play className="w-3 h-3" />
              <span className="hidden sm:inline">Play</span>
            </motion.button>
          )}
        </div>
      </div>
    </CardWrapper>
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