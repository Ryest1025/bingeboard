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
  
  // Debug streaming platforms for this media item
  if (process.env.NODE_ENV === 'development' && normalizedPlatforms.length > 0) {
    console.log(`🎬 "${title}" streaming platforms:`, normalizedPlatforms.map(p => ({
      name: p.provider_name,
      logo_path: p.logo_path,
      hasLogo: !!p.logo_path
    })));
  }
  
  // Get genres
  const genres = media.genre_ids?.slice(0, 3).map(id => genreMap[id]).filter(Boolean) || [];
  
  // Get variant configuration
  const config = CARD_VARIANTS[variant] || CARD_VARIANTS.vertical;
  
  // Get first streaming logo for corner badges (for listings) and Watch Now button (for spotlight)
  const firstStreamingLogo = normalizedPlatforms.length > 0 && normalizedPlatforms[0].logo_path
    ? normalizedPlatforms[0].logo_path.startsWith('http')
      ? normalizedPlatforms[0].logo_path
      : `https://image.tmdb.org/t/p/w200${normalizedPlatforms[0].logo_path}`
    : null;

  // Determine if we should move buttons to bottom (from props or variant config)
  const shouldMoveButtonsToBottom = moveButtonsToBottom || config.moveButtonsToBottom;

  // Render spotlight variants with special layouts
  const renderSpotlight = () => {
    if (variant === 'spotlight-poster-backdrop') {
      return (
        <CardWrapper variant={variant} className={`relative h-96 w-full ${className}`} onClick={() => onCardClick?.(media)}>
          {/* Background Image with subtle overlay */}
          {backdropUrl && (
            <motion.div
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-0 overflow-hidden"
            >
              <img src={backdropUrl} alt={title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
            </motion.div>
          )}
          
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
            <div className="flex-1 space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">{title}</h2>
              
              <div className="flex flex-wrap items-center gap-4">
                {showReleaseDate && year && <p className="text-gray-300">{year}</p>}
                {showGenres && genres.length > 0 && <p className="text-gray-300">{genres.slice(0, 3).join(', ')}</p>}
                {showRating && rating && <RatingBadge rating={rating} />}
              </div>

              {showDescription && media.overview && (
                <p className="text-gray-200 line-clamp-3 max-w-2xl">{media.overview}</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                {actions.watchNow && (
                  <ActionButton
                    variant="primary"
                    size="lg"
                    onClick={(e) => { e?.stopPropagation(); onWatchNow?.(media); }}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      {firstStreamingLogo && (
                        <img 
                          src={firstStreamingLogo} 
                          alt="Streaming platform" 
                          className="w-5 h-5 object-contain rounded-sm bg-white p-0.5" 
                        />
                      )}
                      <Play className="w-5 h-5" />
                      Watch Now
                    </div>
                  </ActionButton>
                )}
                
                {actions.trailer && (
                  <ActionButton variant="secondary" size="lg" onClick={(e) => { e?.stopPropagation(); onWatchTrailer?.(media); }}>
                    <Film className="w-5 h-5" />
                    Trailer
                  </ActionButton>
                )}
                
                {actions.addToList && (
                  <ActionButton variant="secondary" size="lg" onClick={(e) => { e?.stopPropagation(); onAddToWatchlist?.(media); }}>
                    <Plus className="w-5 h-5" />
                    Add to List
                  </ActionButton>
                )}
              </div>
            </div>
          </motion.div>
        </CardWrapper>
      );
    }

    // Default spotlight layout
    return (
      <CardWrapper variant={variant} className={`relative h-96 w-full ${className}`} onClick={() => onCardClick?.(media)}>
        {/* Background Image */}
        {backdropUrl && <img src={backdropUrl} alt={title} className="absolute inset-0 w-full h-full object-cover rounded-3xl" />}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent rounded-3xl" />
        
        {/* Content Container */}
        <div className="absolute inset-0 flex flex-col md:flex-row items-center md:items-end justify-between h-full p-8 space-y-6 md:space-y-0">
          {/* Secondary Poster */}
          {showSecondaryPoster && posterUrl && (
            <img src={posterUrl} alt={title} className="w-24 md:w-32 rounded-xl shadow-2xl border border-slate-700 object-cover" />
          )}

          {/* Info + Actions */}
          <div className="text-center md:text-left max-w-3xl md:ml-8 space-y-4">
            {showRating && rating && <RatingBadge rating={rating} />}
            
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-blue-300 transition-colors duration-300">
              {title}
            </h1>
            
            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-slate-300">
              {showReleaseDate && year && <span>{year}</span>}
              {showGenres && genres.length > 0 && (
                <div className="flex gap-2">
                  {genres.slice(0, 3).map((genre, index) => (
                    <span key={index} className="px-2 py-1 bg-slate-700/70 rounded-md backdrop-blur-sm">{genre}</span>
                  ))}
                </div>
              )}
            </div>
            
            {showDescription && media.overview && (
              <p className="text-slate-200 leading-relaxed line-clamp-3 max-w-2xl text-sm md:text-base">{media.overview}</p>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              {actions.watchNow && (
                <ActionButton
                  variant="primary"
                  size="lg"
                  onClick={(e) => { e?.stopPropagation(); onWatchNow?.(media); }}
                  className="flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Watch Now
                  {firstStreamingLogo && showStreamingLogoInButton && (
                    <img 
                      src={firstStreamingLogo} 
                      alt="Streaming Logo" 
                      className="w-5 h-5 rounded-sm bg-white p-0.5" 
                    />
                  )}
                </ActionButton>
              )}
              
              {actions.trailer && (
                <ActionButton variant="secondary" size="lg" onClick={(e) => { e?.stopPropagation(); onWatchTrailer?.(media); }}>
                  <PlayCircle className="w-5 h-5" />
                  Trailer
                </ActionButton>
              )}
              
              {actions.addToList && (
                <ActionButton variant="secondary" size="lg" onClick={(e) => { e?.stopPropagation(); onAddToWatchlist?.(media); }}>
                  <Plus className="w-5 h-5" />
                  Add to List
                </ActionButton>
              )}
            </div>
            
            {/* Streaming Logos - only show if not in button */}
            {!hideStreamingLogos && showStreamingLogos && !showStreamingLogoInButton && normalizedPlatforms.length > 0 && (
              <div className="mt-4">
                <StreamingLogos providers={normalizedPlatforms} maxDisplayed={4} size="md" />
              </div>
            )}
          </div>
        </div>
      </CardWrapper>
    );
  };

  // Handle special variant layouts
  if (variant?.includes('spotlight')) {
    return renderSpotlight();
  }

  // Default modular card for vertical variants
  return (
    <CardWrapper 
      variant={variant}
      className={`w-full min-h-fit ${className}`}
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
          showStreamingLogoInButton={showStreamingLogoInButton}
          moveButtonsToBottom={shouldMoveButtonsToBottom}
          className="flex-shrink-0 aspect-[2/3] w-full"
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
            showStreamingLogoInButton={showStreamingLogoInButton}
            onWatchNow={() => onWatchNow?.(media)}
            onAddToWatchlist={() => onAddToWatchlist?.(media)}
            onWatchTrailer={() => onWatchTrailer?.(media)}
          />
        )}
        
        {/* Streaming Logos - only show if not in button */}
        {!hideStreamingLogos && showStreamingLogos && !showStreamingLogoInButton && !shouldMoveButtonsToBottom && normalizedPlatforms.length > 0 && (
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
};

const MemoizedUniversalMediaCard = React.memo(UniversalMediaCard);

export default MemoizedUniversalMediaCard;
export { UniversalMediaCard, MemoizedUniversalMediaCard };