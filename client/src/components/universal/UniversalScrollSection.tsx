import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
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

interface UniversalScrollSectionProps {
  /** Section title */
  title?: string;
  
  /** Media items to display */
  items: MediaItem[];
  
  /** Card variant to use */
  cardVariant?: 'vertical' | 'horizontal' | 'spotlight' | 'compact';
  
  /** Card size */
  cardSize?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Maximum number of items to show */
  maxItems?: number;
  
  /** Number of items to scroll by */
  scrollBy?: number;
  
  /** Show streaming logos on cards */
  showStreamingLogos?: boolean;
  
  /** Show ratings on cards */
  showRating?: boolean;
  
  /** Show genres on cards */
  showGenres?: boolean;
  
  /** Show release dates on cards */
  showReleaseDate?: boolean;
  
  /** Show descriptions on cards */
  showDescription?: boolean;
  
  /** Show view all button */
  showViewAll?: boolean;
  
  /** Available card actions */
  cardActions?: {
    watchNow?: boolean;
    trailer?: boolean;
    addToList?: boolean;
    share?: boolean;
  };
  
  /** Action callbacks */
  onAddToWatchlist?: (media: MediaItem) => void;
  onWatchTrailer?: (media: MediaItem) => void;
  onCardClick?: (media: MediaItem) => void;
  onShareContent?: (media: MediaItem) => void;
  onWatchNow?: (media: MediaItem) => void;
  onViewAll?: () => void;
  
  /** Custom className for container */
  className?: string;
  
  /** Custom gap between items */
  gap?: 'sm' | 'md' | 'lg';
  
  /** Enable auto-scrolling */
  autoScroll?: boolean;
  
  /** Auto-scroll interval in milliseconds */
  autoScrollInterval?: number;
}

const UniversalScrollSection: React.FC<UniversalScrollSectionProps> = ({
  title,
  items,
  cardVariant = 'vertical',
  cardSize = 'md',
  maxItems = 8,
  scrollBy,
  showStreamingLogos = true,
  showRating = true,
  showGenres = false,
  showReleaseDate = false,
  showDescription = false,
  showViewAll = true,
  cardActions = { watchNow: true, trailer: true, addToList: true },
  onAddToWatchlist,
  onWatchTrailer,
  onCardClick,
  onShareContent,
  onWatchNow,
  onViewAll,
  className = '',
  gap = 'md',
  autoScroll = false,
  autoScrollInterval = 5000
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Limit items to maxItems
  const displayItems = items.slice(0, maxItems);

  // Auto-determine scroll amount based on card variant and size
  const getScrollAmount = () => {
    if (scrollBy) return scrollBy;
    
    // Base scroll amounts for different card variants
    const baseScrollAmounts = {
      vertical: { sm: 140, md: 200, lg: 240, xl: 280 },
      horizontal: { sm: 300, md: 400, lg: 500, xl: 600 },
      compact: { sm: 250, md: 350, lg: 450, xl: 550 },
      spotlight: { sm: 300, md: 400, lg: 500, xl: 600 }
    };
    
    return baseScrollAmounts[cardVariant][cardSize] || 200;
  };

  // Gap mappings
  const gapConfig = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      const handleScroll = () => checkScrollability();
      container.addEventListener('scroll', handleScroll);
      
      // Check scrollability on resize
      const handleResize = () => {
        setTimeout(checkScrollability, 100);
      };
      window.addEventListener('resize', handleResize);
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [displayItems]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!autoScroll || isHovered) return;

    const interval = setInterval(() => {
      const container = scrollContainerRef.current;
      if (container && canScrollRight) {
        scroll('right');
      } else if (container && !canScrollRight && canScrollLeft) {
        // Reset to beginning when reaching the end
        container.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [autoScroll, autoScrollInterval, canScrollRight, canScrollLeft, isHovered]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = getScrollAmount();
      const targetScrollLeft = direction === 'left' 
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Don't render if no items
  if (!displayItems.length) return null;

  return (
    <div 
      className={`space-y-4 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      {(title || showViewAll) && (
        <div className="flex items-center justify-between">
          {title && (
            <h2 className="text-2xl font-bold text-white">
              {title}
            </h2>
          )}
          
          {showViewAll && onViewAll && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewAll}
              className="border-slate-500 text-slate-300 hover:bg-slate-700"
            >
              <Eye className="w-4 h-4 mr-1" />
              View All
            </Button>
          )}
        </div>
      )}

      {/* Scroll Container */}
      <div className="relative group">
        {/* Left scroll button */}
        {canScrollLeft && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 border-white/20 text-white hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}

        {/* Right scroll button */}
        {canScrollRight && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 border-white/20 text-white hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}

        {/* Items container */}
        <div
          ref={scrollContainerRef}
          className={`flex ${gapConfig[gap]} overflow-x-auto scrollbar-hide pb-4`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayItems.map((item) => (
            <div 
              key={item.id} 
              className="flex-shrink-0"
            >
              <UniversalMediaCard
                media={item}
                variant={cardVariant}
                size={cardSize}
                actions={cardActions}
                showStreamingLogos={showStreamingLogos}
                showRating={showRating}
                showGenres={showGenres}
                showReleaseDate={showReleaseDate}
                showDescription={showDescription}
                onAddToWatchlist={onAddToWatchlist}
                onWatchTrailer={onWatchTrailer}
                onCardClick={onCardClick}
                onShareContent={onShareContent}
                onWatchNow={onWatchNow}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UniversalScrollSection;