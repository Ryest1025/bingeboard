import React from 'react';
import { motion } from 'framer-motion';
import { Play, PlayCircle, Plus, Clapperboard } from 'lucide-react';
import { ActionButton } from './ActionButton';
import { RatingBadge } from './RatingBadge';

interface ActionConfig {
  watchNow?: boolean;
  trailer?: boolean;
  addToList?: boolean;
}

interface PosterSectionProps {
  posterUrl?: string | null;
  backdropUrl?: string | null;
  showRating?: boolean;
  rating?: string | null;
  actions?: ActionConfig;
  onWatchNow?: () => void;
  onAddToWatchlist?: () => void;
  onWatchTrailer?: () => void;
  firstStreamingLogo?: string | null;
  showStreamingLogoInButton?: boolean;
  moveButtonsToBottom?: boolean;
  className?: string;
  variant?: 'vertical' | 'horizontal' | 'spotlight' | 'compact' | 'spotlight-polished' | 'vertical-polished' | 'spotlight-poster-backdrop';
}

export const PosterSection: React.FC<PosterSectionProps> = ({
  posterUrl,
  backdropUrl,
  showRating = true,
  rating,
  actions = { watchNow: true, trailer: true, addToList: true },
  onWatchNow,
  onAddToWatchlist,
  onWatchTrailer,
  firstStreamingLogo,
  showStreamingLogoInButton = false,
  moveButtonsToBottom = false,
  className = '',
  variant = 'vertical'
}) => {
  const isSpotlight = variant?.includes('spotlight');
  const imageUrl = isSpotlight ? backdropUrl : posterUrl;
  const fallbackIcon = <Clapperboard className="w-12 h-12 text-slate-400" />;
  
  return (
    <div className={`relative w-full flex-shrink-0 ${className}`}>
      {/* Main Image */}
      {imageUrl ? (
        <motion.img
          src={imageUrl}
          alt="Media poster"
          className="w-full h-full object-cover object-center rounded-t-2xl transition-transform duration-700 group-hover:scale-110"
          style={{
            aspectRatio: isSpotlight ? '16/9' : '2/3',
            objectPosition: 'center top'
          }}
          loading="lazy"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.7 }}
        />
      ) : (
        <div 
          className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center rounded-t-2xl"
          style={{
            aspectRatio: isSpotlight ? '16/9' : '2/3'
          }}
        >
          {fallbackIcon}
        </div>
      )}
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500 rounded-t-2xl" />
      
      {/* Rating badge */}
      {showRating && rating && (
        <div className="absolute top-3 left-3">
          <RatingBadge rating={rating} />
        </div>
      )}
      
      {/* Streaming logo badge - only show as corner badge when NOT showing in button */}
      {firstStreamingLogo && !showStreamingLogoInButton && (
        <div className="absolute top-3 right-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-1.5 shadow-lg border border-white/20">
            <img
              src={firstStreamingLogo}
              alt="Available on streaming platform"
              className="w-6 h-6 rounded-sm object-contain"
            />
          </div>
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
                  onWatchNow?.();
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
                  onAddToWatchlist?.();
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
                  onWatchTrailer?.();
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
  );
};