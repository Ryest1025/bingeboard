import React from 'react';
import { motion } from 'framer-motion';
import { Star, Play, PlayCircle, Plus, Clapperboard, Film } from 'lucide-react';

// Import modular components
import { CardWrapper } from '@/components/cards/CardWrapper';
import { ActionButton } from '@/components/cards/ActionButton';
import { RatingBadge } from '@/components/cards/RatingBadge';
import { PosterSection } from '@/components/cards/PosterSection';
import { InfoSection } from '@/components/cards/InfoSection';
import { BottomActionButtons } from '@/components/cards/BottomActionButtons';
import { StreamingLogosSection } from '@/components/cards/StreamingLogosSection';
import { CARD_VARIANTS, GENRE_NAMES } from '@/components/cards/cardVariants';
import StreamingLogos from '@/components/streaming-logos';

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
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  overview?: string;
  genre_ids?: number[];
  streaming_platforms?: StreamingPlatform[];
  streamingPlatforms?: StreamingPlatform[];
  streaming?: StreamingPlatform[];
  media_type?: 'movie' | 'tv';
}

interface ActionConfig {
  watchNow?: boolean;
  trailer?: boolean;
  addToList?: boolean;
  share?: boolean;
}

type SizeVariant = 'sm' | 'md' | 'lg' | 'xl';

interface UniversalMediaCardProps {
  media: MediaItem;
  variant?: 'vertical' | 'horizontal' | 'spotlight' | 'compact' | 'spotlight-polished' | 'vertical-polished' | 'spotlight-poster-backdrop';
  size?: SizeVariant;
  actions?: ActionConfig;
  showStreamingLogos?: boolean;
  showSecondaryPoster?: boolean;
  showStreamingLogoInButton?: boolean;
  hideStreamingLogos?: boolean;
  streamingLogoInWatchNow?: boolean;
  moveButtonsToBottom?: boolean;
  showRating?: boolean;
  showGenres?: boolean;
  showReleaseDate?: boolean;
  showDescription?: boolean;
  onAddToWatchlist?: (media: MediaItem) => void;
  onWatchTrailer?: (media: MediaItem) => void;
  onCardClick?: (media: MediaItem) => void;
  onShareContent?: (media: MediaItem) => void;
  onWatchNow?: (media: MediaItem) => void;
  genreMap?: Record<number, string>;
  className?: string;
}

const UniversalMediaCard: React.FC<UniversalMediaCardProps> = ({
  media,
  variant = 'vertical',
  size = 'md',
  actions = { watchNow: true, trailer: true, addToList: true },
  showStreamingLogos = true,
  showSecondaryPoster = false,
  showStreamingLogoInButton = false,
  hideStreamingLogos = false,
  streamingLogoInWatchNow = false,
  moveButtonsToBottom = false,
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
  
  // Get variant configuration
  const config = CARD_VARIANTS[variant] || CARD_VARIANTS.vertical;
  
  // Get first streaming logo for Watch Now button
  const firstStreamingLogo = (showStreamingLogoInButton || streamingLogoInWatchNow) && normalizedPlatforms.length > 0 
    ? normalizedPlatforms[0].logo_path 
      ? `https://image.tmdb.org/t/p/w200${normalizedPlatforms[0].logo_path}`
      : null
    : null;

  // Determine if we should move buttons to bottom (from props or variant config)
  const shouldMoveButtonsToBottom = moveButtonsToBottom || config.moveButtonsToBottom;

  // Variant-specific rendering methods (declared first to avoid hoisting issues)
  const renderVerticalCard = () => (
    <CardWrapper 
      variant={variant}
      className={`${config.width} min-h-fit ${className}`}
      onClick={() => onCardClick?.(media)}
    >
      <div className="flex flex-col h-full">
        <PosterSection
          posterUrl={posterUrl}
          backdropUrl={backdropUrl}
          showRating={showRating}
          rating={rating}
          actions={actions}
          onWatchNow={() => onWatchNow?.(media)}
          onAddToWatchlist={() => onAddToWatchlist?.(media)}
          onWatchTrailer={() => onWatchTrailer?.(media)}
          firstStreamingLogo={firstStreamingLogo}
          moveButtonsToBottom={shouldMoveButtonsToBottom}
          className={config.height}
          variant={variant}
        />
        
        <InfoSection
          title={title}
          year={year}
          genres={genres}
          showReleaseDate={showReleaseDate}
          showGenres={showGenres}
          showDescription={showDescription}
          description={media.overview}
          config={config}
        />
        
        {shouldMoveButtonsToBottom && (
          <BottomActionButtons
            actions={actions}
            firstStreamingLogo={firstStreamingLogo}
            onWatchNow={() => onWatchNow?.(media)}
            onAddToWatchlist={() => onAddToWatchlist?.(media)}
            onWatchTrailer={() => onWatchTrailer?.(media)}
          />
        )}
        
        {/* Streaming Logos - only show if not hidden and not in button */}
        {!hideStreamingLogos && showStreamingLogos && !streamingLogoInWatchNow && !shouldMoveButtonsToBottom && normalizedPlatforms.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700/50 px-3">
            <StreamingLogos 
              providers={normalizedPlatforms}
              maxDisplayed={3}
              size="sm"
            />
          </div>
        )}
      </div>
    </CardWrapper>
  );

  // Handle special layouts
  if (variant === 'horizontal') {
    return renderHorizontalCard();
  }
  
  if (variant.includes('spotlight')) {
    if (variant === 'spotlight-polished') {
      return renderSpotlightPolishedCard();
    }
    if (variant === 'spotlight-poster-backdrop') {
      return renderSpotlightPosterBackdropCard();
    }
    return renderSpotlightCard();
  }
  
  if (variant === 'compact') {
    return renderCompactCard();
  }

  // Default vertical layout
  return renderVerticalCard();

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
          {!hideStreamingLogos && showStreamingLogos && normalizedPlatforms.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <StreamingLogos 
                providers={normalizedPlatforms}
                maxDisplayed={3}
                size="sm"
              />
            </div>
          )}
        </div>
      </div>
    </CardWrapper>
  );

  const renderHorizontalCard = () => (
    <CardWrapper 
      variant="horizontal"
      className={`w-full max-w-md h-48 ${className}`}
      onClick={() => onCardClick?.(media)}
    >
      <div className="flex h-full">
        {/* Poster Section */}
        <div className="w-1/3 h-full relative flex-shrink-0">
          {posterUrl ? (
            <img 
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover rounded-l-2xl"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center rounded-l-2xl">
              <Clapperboard className="w-8 h-8 text-slate-400" />
            </div>
          )}
          
          {/* Rating Badge */}
          {showRating && rating && (
            <div className="absolute top-2 left-2">
              <RatingBadge rating={rating} />
            </div>
          )}

          {/* Floating Actions */}
          <motion.div 
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 rounded-l-2xl"
            initial={false}
            animate={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            {actions.watchNow && (
              <ActionButton
                onClick={(e) => {
                  e?.stopPropagation();
                  onWatchNow?.(media);
                }}
                variant="floating"
                size="sm"
              >
                <Play className="w-3 h-3" />
              </ActionButton>
            )}
            {actions.addToList && (
              <ActionButton
                onClick={(e) => {
                  e?.stopPropagation();
                  onAddToWatchlist?.(media);
                }}
                variant="floating"
                size="sm"
              >
                <Plus className="w-3 h-3" />
              </ActionButton>
            )}
          </motion.div>
        </div>
        
        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 group-hover:text-blue-300 transition-colors duration-300">
              {title}
            </h3>
            
            {showReleaseDate && year && (
              <p className="text-slate-400 text-xs">{year}</p>
            )}
            
            {showGenres && genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {genres.slice(0, 2).map((genre, index) => (
                  <span 
                    key={index}
                    className="px-1.5 py-0.5 bg-slate-700/70 text-slate-300 text-xs rounded"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
            
            {showDescription && media.overview && (
              <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed">
                {media.overview}
              </p>
            )}
          </div>
          
          {!hideStreamingLogos && showStreamingLogos && normalizedPlatforms.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-700/50">
              <StreamingLogos 
                providers={normalizedPlatforms}
                maxDisplayed={2}
                size="sm"
              />
            </div>
          )}
        </div>
      </div>
    </CardWrapper>
  );

  const renderSpotlightCard = () => {
    // Get first streaming logo for Watch Now button
    const firstStreamingLogo = (showStreamingLogoInButton || streamingLogoInWatchNow) && normalizedPlatforms.length > 0 
      ? normalizedPlatforms[0].logo_path 
        ? `https://image.tmdb.org/t/p/w200${normalizedPlatforms[0].logo_path}`
        : null
      : null;

    return (
      <CardWrapper 
        variant="spotlight"
        className={`relative h-96 w-full ${className}`}
        onClick={() => onCardClick?.(media)}
      >
        {/* Background Image */}
        {backdropUrl && (
          <img 
            src={backdropUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover rounded-3xl"
          />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent rounded-3xl" />
        
        {/* Content Container with Flexbox Layout */}
        <div className="absolute inset-0 flex flex-col md:flex-row items-center md:items-end justify-between h-full p-8 space-y-6 md:space-y-0">
          {/* Secondary Poster */}
          {showSecondaryPoster && posterUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-shrink-0"
            >
              <img
                src={posterUrl}
                alt={title}
                className="w-24 md:w-32 rounded-xl shadow-2xl border border-slate-700 object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </motion.div>
          )}

          {/* Info + Actions */}
          <div className="text-center md:text-left max-w-3xl md:ml-8 space-y-4">
            {/* Rating */}
            {showRating && rating && (
              <div className="flex items-center justify-center md:justify-start gap-2">
                <RatingBadge rating={rating} />
              </div>
            )}
            
            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-blue-300 transition-colors duration-300">
              {title}
            </h1>
            
            {/* Year and Genres */}
            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-slate-300">
              {showReleaseDate && year && <span>{year}</span>}
              {showGenres && genres.length > 0 && (
                <div className="flex gap-2">
                  {genres.slice(0, 3).map((genre, index) => (
                    <span key={index} className="px-2 py-1 bg-slate-700/70 rounded-md backdrop-blur-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Description */}
            {showDescription && media.overview && (
              <p className="text-slate-200 leading-relaxed line-clamp-3 max-w-2xl text-sm md:text-base">
                {media.overview}
              </p>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              {actions.watchNow && (
                <ActionButton
                  variant="primary"
                  size="lg"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onWatchNow?.(media);
                  }}
                  className="flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Watch Now
                  {firstStreamingLogo && (
                    <img
                      src={firstStreamingLogo}
                      alt="Streaming Logo"
                      className="w-5 h-5 rounded-sm bg-white p-0.5 ml-1"
                    />
                  )}
                </ActionButton>
              )}
              {actions.trailer && (
                <ActionButton
                  variant="secondary"
                  size="lg"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onWatchTrailer?.(media);
                  }}
                >
                  <PlayCircle className="w-5 h-5" />
                  Trailer
                </ActionButton>
              )}
              {actions.addToList && (
                <ActionButton
                  variant="secondary"
                  size="lg"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onAddToWatchlist?.(media);
                  }}
                >
                  <Plus className="w-5 h-5" />
                  Add to List
                </ActionButton>
              )}
            </div>
            
            {/* Streaming Logos - only show if not hidden and not in button */}
            {!hideStreamingLogos && showStreamingLogos && !showStreamingLogoInButton && !streamingLogoInWatchNow && normalizedPlatforms.length > 0 && (
              <div className="mt-4">
                <StreamingLogos 
                  providers={normalizedPlatforms}
                  maxDisplayed={4}
                  size="md"
                />
              </div>
            )}
          </div>
        </div>
      </CardWrapper>
    );
  };

  const renderCompactCard = () => (
    <CardWrapper 
      variant="compact"
      className={`flex items-center gap-3 p-3 w-full ${className}`}
      onClick={() => onCardClick?.(media)}
    >
      {/* Small Poster */}
      <div className="w-16 h-20 relative flex-shrink-0">
        {posterUrl ? (
          <img 
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center rounded-xl">
            <Clapperboard className="w-6 h-6 text-slate-400" />
          </div>
        )}
        {showRating && rating && (
          <div className="absolute -top-1 -right-1">
            <RatingBadge rating={rating} className="text-xs px-1.5 py-0.5" />
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="font-semibold text-white text-sm leading-tight line-clamp-1 group-hover:text-blue-300 transition-colors duration-300">
          {title}
        </h4>
        {showReleaseDate && year && (
          <p className="text-slate-400 text-xs">{year}</p>
        )}
        {showGenres && genres.length > 0 && (
          <p className="text-slate-300 text-xs line-clamp-1">
            {genres.slice(0, 2).join(', ')}
          </p>
        )}
        {!hideStreamingLogos && showStreamingLogos && normalizedPlatforms.length > 0 && (
          <StreamingLogos 
            providers={normalizedPlatforms}
            maxDisplayed={2}
            size="sm"
          />
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {actions.addToList && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToWatchlist?.(media);
            }}
            className="w-8 h-8 rounded-lg bg-black/70 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
        {actions.watchNow && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWatchNow?.(media);
            }}
            className="w-8 h-8 rounded-lg bg-black/70 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300"
          >
            <Play className="w-4 h-4" />
          </button>
        )}
      </div>
    </CardWrapper>
  );

  const renderSpotlightPolishedCard = () => {
    // Get first streaming logo for Watch Now button
    const firstStreamingLogo = streamingLogoInWatchNow && normalizedPlatforms.length > 0 
      ? normalizedPlatforms[0].logo_path 
        ? `https://image.tmdb.org/t/p/w200${normalizedPlatforms[0].logo_path}`
        : null
      : null;

    return (
      <CardWrapper 
        variant="spotlight-polished"
        className={`relative h-96 w-full ${className}`}
        onClick={() => onCardClick?.(media)}
      >
        {/* Background Image with cinematic scale */}
        {backdropUrl && (
          <motion.img
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            src={backdropUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover rounded-3xl shadow-2xl"
          />
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/10 rounded-3xl" />
        
        {/* Text + Buttons with staggered animations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute inset-0 p-6 flex flex-col justify-end space-y-4"
        >
          <div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl lg:text-5xl font-bold text-white"
            >
              {title}
            </motion.h2>
            {showGenres && genres.length > 0 && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-sm text-gray-300 mt-1"
              >
                {genres.slice(0, 3).join(', ')}
              </motion.p>
            )}
            {showReleaseDate && year && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.45 }}
                className="text-sm text-gray-400 mt-1"
              >
                {year}
              </motion.p>
            )}
            {showRating && rating && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-2"
              >
                <RatingBadge rating={rating} />
              </motion.div>
            )}
            {showDescription && media.overview && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.55 }}
                className="text-gray-200 mt-2 line-clamp-3 max-w-2xl"
              >
                {media.overview}
              </motion.p>
            )}
          </div>

          {/* Buttons with staggered slide-in */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.15 }
              }
            }}
            className="flex gap-3 mt-2"
          >
            {actions.watchNow && (
              <motion.div
                variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
              >
                <ActionButton
                  variant="primary"
                  size="lg"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onWatchNow?.(media);
                  }}
                  className="flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Watch Now
                  {firstStreamingLogo && (
                    <img
                      src={firstStreamingLogo}
                      alt="Streaming Logo"
                      className="w-5 h-5 rounded-sm bg-white p-0.5 ml-1"
                    />
                  )}
                </ActionButton>
              </motion.div>
            )}
            {actions.trailer && (
              <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                <ActionButton
                  variant="secondary"
                  size="lg"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onWatchTrailer?.(media);
                  }}
                >
                  <PlayCircle className="w-5 h-5" />
                  Trailer
                </ActionButton>
              </motion.div>
            )}
            {actions.addToList && (
              <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                <ActionButton
                  variant="secondary"
                  size="lg"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onAddToWatchlist?.(media);
                  }}
                >
                  <Plus className="w-5 h-5" />
                  Add to List
                </ActionButton>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </CardWrapper>
    );
  };

  const renderSpotlightPosterBackdropCard = () => {
    // Get first streaming logo for Watch Now button
    const firstStreamingLogo = streamingLogoInWatchNow && normalizedPlatforms.length > 0 
      ? normalizedPlatforms[0].logo_path 
        ? `https://image.tmdb.org/t/p/w200${normalizedPlatforms[0].logo_path}`
        : null
      : null;

    return (
      <CardWrapper 
        variant="spotlight-poster-backdrop"
        className={`relative h-96 w-full ${className}`}
        onClick={() => onCardClick?.(media)}
      >
        {/* Background Image with subtle overlay */}
        {backdropUrl && (
          <motion.div
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute inset-0 overflow-hidden"
          >
            <img
              src={backdropUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            {/* Subtle overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
          </motion.div>
        )}
        
        {/* Content Container */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 h-full p-6 flex items-center gap-6"
        >
          {/* Poster Image */}
          {posterUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex-shrink-0"
            >
              <img
                src={posterUrl}
                alt={title}
                className="w-32 md:w-40 lg:w-48 h-48 md:h-60 lg:h-72 object-cover rounded-2xl shadow-2xl border border-white/10"
              />
            </motion.div>
          )}

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex-1 space-y-4"
          >
            <div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white"
              >
                {title}
              </motion.h2>
              
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {showReleaseDate && year && (
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.55 }}
                    className="text-gray-300"
                  >
                    {year}
                  </motion.p>
                )}
                {showGenres && genres.length > 0 && (
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-gray-300"
                  >
                    {genres.slice(0, 3).join(', ')}
                  </motion.p>
                )}
                {showRating && rating && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.65 }}
                  >
                    <RatingBadge rating={rating} />
                  </motion.div>
                )}
              </div>
            </div>

            {showDescription && media.overview && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="text-gray-200 line-clamp-3 max-w-2xl"
              >
                {media.overview}
              </motion.p>
            )}

            {/* Action Buttons */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.15 }
                }
              }}
              className="flex gap-3 mt-4"
            >
              {actions.watchNow && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <ActionButton
                    variant="primary"
                    size="lg"
                    onClick={(e) => {
                      e?.stopPropagation();
                      onWatchNow?.(media);
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      {firstStreamingLogo && (
                        <img 
                          src={firstStreamingLogo} 
                          alt="Streaming platform" 
                          className="w-5 h-5 object-contain"
                        />
                      )}
                      <Play className="w-5 h-5" />
                      Watch Now
                    </div>
                  </ActionButton>
                </motion.div>
              )}

              {actions.trailer && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <ActionButton
                    variant="secondary"
                    size="lg"
                    onClick={(e) => {
                      e?.stopPropagation();
                      onWatchTrailer?.(media);
                    }}
                  >
                    <Film className="w-5 h-5" />
                    Trailer
                  </ActionButton>
                </motion.div>
              )}

              {actions.addToList && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <ActionButton
                    variant="secondary"
                    size="lg"
                    onClick={(e) => {
                      e?.stopPropagation();
                      onAddToWatchlist?.(media);
                    }}
                  >
                    <Plus className="w-5 h-5" />
                    Add to List
                  </ActionButton>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </CardWrapper>
    );
  };

  const renderVerticalPolishedCard = () => {
    // Get first streaming logo for Watch Now button
    const firstStreamingLogo = streamingLogoInWatchNow && normalizedPlatforms.length > 0 
      ? normalizedPlatforms[0].logo_path 
        ? `https://image.tmdb.org/t/p/w200${normalizedPlatforms[0].logo_path}`
        : null
      : null;

    return (
      <CardWrapper 
        variant="vertical-polished"
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
            
            {/* Floating action buttons overlay - only if not moving to bottom */}
            {!moveButtonsToBottom && (actions.watchNow || actions.addToList || actions.trailer) && (
              <motion.div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-t-2xl"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <div className="flex gap-3 items-center justify-center">
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
                      {firstStreamingLogo && (
                        <img
                          src={firstStreamingLogo}
                          alt="Streaming Logo"
                          className="w-4 h-4 rounded-sm bg-white p-0.5 ml-1"
                        />
                      )}
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
            )}
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
            
            {/* Bottom action buttons - Updated with blue Watch Now button */}
            {moveButtonsToBottom && (actions.watchNow || actions.addToList || actions.trailer) && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="flex gap-1.5 justify-center">
                  {actions.watchNow && (
                    <ActionButton
                      size="sm"
                      variant="primary"
                      onClick={(e) => {
                        e?.stopPropagation();
                        onWatchNow?.(media);
                      }}
                      className="flex items-center gap-1.5 flex-1 justify-center min-w-0"
                    >
                      <Play className="w-3 h-3" />
                      <span className="truncate text-xs font-medium">Watch Now</span>
                      {firstStreamingLogo && (
                        <img
                          src={firstStreamingLogo}
                          alt="Streaming Logo"
                          className="w-3 h-3 rounded-sm bg-white p-0.5 ml-0.5 flex-shrink-0"
                        />
                      )}
                    </ActionButton>
                  )}
                  {actions.trailer && (
                    <ActionButton 
                      size="sm" 
                      variant="secondary" 
                      onClick={(e) => {
                        e?.stopPropagation();
                        onWatchTrailer?.(media);
                      }}
                      className="flex items-center gap-1.5 flex-1 justify-center min-w-0 bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
                    >
                      <PlayCircle className="w-3 h-3" />
                      <span className="truncate text-xs font-medium">Trailer</span>
                    </ActionButton>
                  )}
                  {actions.addToList && (
                    <ActionButton 
                      size="sm" 
                      variant="secondary" 
                      onClick={(e) => {
                        e?.stopPropagation();
                        onAddToWatchlist?.(media);
                      }}
                      className="flex items-center gap-1.5 flex-1 justify-center min-w-0 bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
                    >
                      <Plus className="w-3 h-3" />
                      <span className="truncate text-xs font-medium">Add</span>
                    </ActionButton>
                  )}
                </div>
              </div>
            )}
            
            {/* Streaming Logos - only show if not hidden and not in button */}
            {!hideStreamingLogos && showStreamingLogos && !streamingLogoInWatchNow && !moveButtonsToBottom && normalizedPlatforms.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <StreamingLogos 
                  providers={normalizedPlatforms}
                  maxDisplayed={3}
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>
      </CardWrapper>
    );
  };

  // Return the appropriate variant
  switch (variant) {
    case 'horizontal':
      return renderHorizontalCard();
    case 'spotlight':
      return renderSpotlightCard();
    case 'spotlight-polished':
      return renderSpotlightPolishedCard();
    case 'spotlight-poster-backdrop':
      return renderSpotlightPosterBackdropCard();
    case 'compact':
      return renderCompactCard();
    case 'vertical-polished':
      return renderVerticalPolishedCard();
    case 'vertical':
    default:
      return renderVerticalCard();
  }
};

const MemoizedUniversalMediaCard = React.memo(UniversalMediaCard);

export default MemoizedUniversalMediaCard;
export { UniversalMediaCard, MemoizedUniversalMediaCard };
