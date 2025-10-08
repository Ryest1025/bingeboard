import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Calendar, Info, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import UniversalMediaCard from './UniversalMediaCard';

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
  streaming_platforms?: Array<{ provider_id?: number; provider_name?: string; name?: string; logo_path?: string }>;
  streamingPlatforms?: Array<{ provider_id?: number; provider_name?: string; name?: string; logo_path?: string }>;
  streaming?: Array<{ provider_id?: number; provider_name?: string; name?: string; logo_path?: string }>;
}

interface UniversalHeroCarouselProps {
  /** Media items for hero display */
  items: MediaItem[];
  
  /** Auto-advance carousel */
  autoAdvance?: boolean;
  
  /** Auto-advance interval in milliseconds */
  autoAdvanceInterval?: number;
  
  /** Show navigation dots */
  showDots?: boolean;
  
  /** Show navigation arrows */
  showArrows?: boolean;
  
  /** Hero height */
  height?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Show overlay content */
  showOverlay?: boolean;
  
  /** Show ratings */
  showRating?: boolean;
  
  /** Show genres */
  showGenres?: boolean;
  
  /** Show release date */
  showReleaseDate?: boolean;
  
  /** Show description */
  showDescription?: boolean;
  
  /** Show streaming logos */
  showStreamingLogos?: boolean;
  
  /** Available actions */
  actions?: {
    watchNow?: boolean;
    trailer?: boolean;
    addToList?: boolean;
    moreInfo?: boolean;
  };
  
  /** Action callbacks */
  onAddToWatchlist?: (media: MediaItem) => void;
  onWatchTrailer?: (media: MediaItem) => void;
  onCardClick?: (media: MediaItem) => void;
  onWatchNow?: (media: MediaItem) => void;
  onMoreInfo?: (media: MediaItem) => void;
  
  /** Custom className */
  className?: string;
  
  /** Custom genre mapping */
  genreMap?: Record<number, string>;
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

const UniversalHeroCarousel: React.FC<UniversalHeroCarouselProps> = ({
  items,
  autoAdvance = true,
  autoAdvanceInterval = 7000,
  showDots = true,
  showArrows = true,
  height = 'lg',
  showOverlay = true,
  showRating = true,
  showGenres = true,
  showReleaseDate = true,
  showDescription = true,
  showStreamingLogos = true,
  actions = { watchNow: true, trailer: true, addToList: true, moreInfo: true },
  onAddToWatchlist,
  onWatchTrailer,
  onCardClick,
  onWatchNow,
  onMoreInfo,
  className = '',
  genreMap = GENRE_NAMES
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Don't render if no items
  if (!items.length) return null;

  const currentItem = items[currentIndex];

  // Height configurations
  const heightConfig = {
    sm: 'h-64',
    md: 'h-80',
    lg: 'h-[28rem]', // Increased from h-96 to h-[28rem] for better content spacing
    xl: 'h-[36rem]'  // Increased from h-[32rem] to h-[36rem]
  };

  // Auto-advance functionality
  useEffect(() => {
    if (!autoAdvance || isHovered || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === items.length - 1 ? 0 : prevIndex + 1
      );
    }, autoAdvanceInterval);

    return () => clearInterval(interval);
  }, [autoAdvance, autoAdvanceInterval, isHovered, items.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? items.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === items.length - 1 ? 0 : currentIndex + 1);
  };

  // Extract current item properties
  const title = currentItem.title || currentItem.name || 'Unknown Title';
  const releaseDate = currentItem.release_date || currentItem.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const rating = currentItem.vote_average ? Number(currentItem.vote_average).toFixed(1) : null;
  const backdropUrl = currentItem.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${currentItem.backdrop_path}`
    : null;
  
  // Normalize streaming platforms
  const streamingPlatforms = currentItem.streaming_platforms || currentItem.streamingPlatforms || currentItem.streaming || [];
  
  // Get genres
  const genres = currentItem.genre_ids?.slice(0, 3).map(id => genreMap[id]).filter(Boolean) || [];

  return (
    <div 
      className={`relative ${heightConfig[height]} overflow-hidden rounded-lg ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-600" />
        )}
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Navigation Arrows */}
      {showArrows && items.length > 1 && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 border-white/20 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 border-white/20 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Content Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 z-10 flex items-end">
          <div className="p-8 lg:p-12 max-w-2xl">
            {/* Title */}
            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 line-clamp-2">
              {title}
            </h1>

            {/* Metadata */}
            <div className="flex items-center gap-4 mb-6">
              {showRating && rating && (
                <Badge className="bg-yellow-500/90 text-black border-0">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  {rating}
                </Badge>
              )}
              
              {showReleaseDate && year && (
                <span className="text-white/90 font-medium">{year}</span>
              )}
              
              {showGenres && genres.length > 0 && (
                <span className="text-white/80">{genres.slice(0, 2).join(' • ')}</span>
              )}
            </div>

            {/* Description */}
            {showDescription && currentItem.overview && (
              <p className="text-white/90 text-lg mb-8 line-clamp-3 max-w-xl">
                {currentItem.overview}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 mb-6">
              {/* Watch Now Button with streaming integration */}
              {actions.watchNow && (
                <Button
                  size="lg"
                  onClick={() => onWatchNow?.(currentItem)}
                  className="bg-white text-black hover:bg-gray-200 font-semibold px-8"
                >
                  <span className="flex items-center gap-2">
                    <Play className="w-5 h-5 mr-1" />
                    Watch Now
                    {showStreamingLogos && streamingPlatforms.length > 0 && (
                      <span className="flex items-center gap-1">
                        On
                        <img
                          src={`https://image.tmdb.org/t/p/w92${streamingPlatforms[0].logo_path}`}
                          alt={streamingPlatforms[0].provider_name || streamingPlatforms[0].name}
                          className="h-5 w-auto"
                        />
                      </span>
                    )}
                  </span>
                </Button>
              )}

              {actions.moreInfo && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onMoreInfo?.(currentItem) || onCardClick?.(currentItem)}
                  className="border-white/50 text-white hover:bg-white/10 font-semibold px-6"
                >
                  <Info className="w-5 h-5 mr-2" />
                  More Info
                </Button>
              )}

              {actions.addToList && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onAddToWatchlist?.(currentItem)}
                  className="border-white/50 text-white hover:bg-white/10 font-semibold px-6"
                >
                  + My List
                </Button>
              )}
            </div>

            {/* Additional Streaming Platforms */}
            {showStreamingLogos && streamingPlatforms.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm">Also available on:</span>
                <div className="flex items-center gap-2">
                  {streamingPlatforms.slice(1, 4).map((platform, index) => (
                    <img
                      key={index}
                      src={`https://image.tmdb.org/t/p/w92${platform.logo_path}`}
                      alt={platform.provider_name || platform.name}
                      className="h-6 w-auto opacity-80 hover:opacity-100 transition-opacity"
                    />
                  ))}
                  {streamingPlatforms.length > 4 && (
                    <span className="text-white/60 text-sm">+{streamingPlatforms.length - 4} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dots Navigation */}
      {showDots && items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Indicator */}
      {items.length > 1 && (
        <div className="absolute top-4 right-4 z-20 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
          {currentIndex + 1} / {items.length}
        </div>
      )}
    </div>
  );
};

export default UniversalHeroCarousel;