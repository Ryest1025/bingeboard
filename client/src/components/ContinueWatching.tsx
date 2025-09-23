import React, { useState, useRef, useEffect } from 'react';
import { Play, X, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useContinueWatching } from '@/hooks/useViewingHistory';
import { useTrailer } from '@/hooks/useTrailer';
import { getPlatformLogo } from '@/utils/platformLogos';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ContinueWatchingItemProps {
  id: string;
  title: string;
  episode?: string;
  platform: string;
  thumbnail: string;
  backdrop_path?: string;
  poster_path?: string;
  duration: number;
  progress: number; // seconds watched
  mediaType: 'tv' | 'movie';
  seasonNumber?: number;
  episodeNumber?: number;
  totalEpisodes?: number;
  onPlay: (item: any) => void;
  onRemove: (itemId: string) => void;
}

const ContinueWatchingCard: React.FC<ContinueWatchingItemProps> = ({
  id,
  title,
  episode,
  platform,
  thumbnail,
  backdrop_path,
  poster_path,
  duration,
  progress,
  mediaType,
  seasonNumber,
  episodeNumber,
  totalEpisodes,
  onPlay,
  onRemove
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [trailerPlaying, setTrailerPlaying] = useState(false);
  const [showTrailerPreview, setShowTrailerPreview] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Fetch trailer data
  const { data: trailerData } = useTrailer(id, mediaType, title);
  
  const percent = Math.min((progress / duration) * 100, 100);
  
  // Use backdrop if available, fallback to poster, then thumbnail
  const imageUrl = backdrop_path 
    ? `https://image.tmdb.org/t/p/w500${backdrop_path}`
    : poster_path 
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : thumbnail;

  const platformLogo = getPlatformLogo(platform);

  // Format episode info
  const episodeInfo = mediaType === 'tv' && seasonNumber && episodeNumber 
    ? `S${seasonNumber}E${episodeNumber}${episode ? ` • ${episode}` : ''}`
    : episode;

  // Format remaining time
  const remainingSeconds = duration - progress;
  const remainingMinutes = Math.ceil(remainingSeconds / 60);
  const timeLeft = remainingMinutes > 60 
    ? `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m left`
    : `${remainingMinutes}m left`;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isHovered && trailerData?.primaryTrailer) {
      // Delay trailer preview to prevent accidental triggers
      timeoutId = setTimeout(() => {
        setShowTrailerPreview(true);
        setTrailerPlaying(true);
      }, 1200); // Increased delay for better UX
    } else {
      setShowTrailerPreview(false);
      setTrailerPlaying(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isHovered, trailerData]);

  const handlePlay = () => {
    onPlay({
      id,
      title,
      episode: episodeInfo,
      platform,
      mediaType,
      seasonNumber,
      episodeNumber,
      progress
    });
  };

  return (
    <div
      className="relative w-80 sm:w-72 md:w-80 flex-shrink-0 group rounded-xl overflow-hidden shadow-lg bg-slate-900 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main thumbnail with trailer preview */}
      <div className="relative w-full h-44 sm:h-40 md:h-44 overflow-hidden">
        {!imageLoaded && (
          <Skeleton className="w-full h-full" />
        )}
        
        {/* Main image */}
        <img
          src={imageUrl}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${isHovered ? 'scale-110' : 'scale-100'} ${
            showTrailerPreview ? 'opacity-30' : 'opacity-100'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            // Fallback to poster if backdrop fails
            if (backdrop_path && poster_path) {
              (e.target as HTMLImageElement).src = `https://image.tmdb.org/t/p/w500${poster_path}`;
            }
          }}
        />

        {/* Trailer preview iframe */}
        {showTrailerPreview && trailerData?.primaryTrailer?.embeddableUrl && (
          <iframe
            ref={iframeRef}
            src={`${trailerData.primaryTrailer.embeddableUrl}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerData.primaryTrailer.key}`}
            className="absolute inset-0 w-full h-full object-cover"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={`${title} trailer`}
          />
        )}

        {/* Platform logo - top right corner */}
        <div className="absolute top-2 right-2 w-8 h-8 bg-black/70 rounded-md p-1 flex items-center justify-center">
          <img
            src={platformLogo}
            alt={platform}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* Progress bar - bottom of image */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-black/60">
          <div 
            className="h-full bg-red-500 transition-all duration-300" 
            style={{ width: `${percent}%` }} 
          />
        </div>

        {/* Hover overlay with controls */}
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Control buttons */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            <Button
              size="sm"
              className="p-2 rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
              onClick={handlePlay}
            >
              <Play size={16} fill="currentColor" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="p-2 rounded-full bg-gray-700/90 text-white hover:bg-red-500 transition-colors"
              onClick={() => onRemove(id)}
            >
              <X size={16} />
            </Button>
          </div>

          {/* Time remaining indicator */}
          <div className="absolute top-3 left-3 bg-black/70 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
            <Clock size={12} />
            {timeLeft}
          </div>

          {/* Trailer available indicator */}
          {trailerData?.primaryTrailer && !showTrailerPreview && (
            <div className="absolute bottom-3 right-3 bg-red-600/90 px-2 py-1 rounded text-xs text-white font-semibold">
              TRAILER
            </div>  
          )}
        </div>
      </div>

      {/* Content info */}
      <div className="p-3 space-y-2">
        <div className="space-y-1">
          <h3 className="font-semibold text-white text-sm truncate leading-tight">
            {title}
          </h3>
          {episodeInfo && (
            <p className="text-xs text-gray-400 truncate">
              {episodeInfo}
            </p>
          )}
        </div>

        {/* Enhanced progress info */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>{Math.round(percent)}% watched</span>
            {totalEpisodes && (
              <span>{episodeNumber}/{totalEpisodes} episodes</span>
            )}
          </div>
          
          {/* Enhanced progress bar */}
          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 ease-out rounded-full" 
              style={{ width: `${percent}%` }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface ContinueWatchingProps {
  limit?: number;
  className?: string;
}

const ContinueWatching: React.FC<ContinueWatchingProps> = ({ limit = 10, className = '' }) => {
  const { data: items = [], isLoading, error } = useContinueWatching(limit);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      const resizeObserver = new ResizeObserver(checkScrollButtons);
      resizeObserver.observe(container);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        resizeObserver.disconnect();
      };
    }
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Card width + gap
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handlePlay = (item: any) => {
    console.log('Playing:', item);
    // Navigate to watch page or show modal
    // For now, show an alert with item details
    alert(`Resume watching: ${item.title}\n${item.episode ? `Episode: ${item.episode}` : ''}\nPlatform: ${item.platform}`);
  };

  const handleRemove = async (itemId: string) => {
    console.log('Removing from continue watching:', itemId);
    // Show confirmation and remove item
    if (confirm('Remove this item from Continue Watching?')) {
      try {
        const response = await fetch(`/api/continue-watching/${itemId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        
        if (response.ok) {
          // Refresh continue watching data
          window.location.reload();
        } else {
          console.error('Failed to remove item');
        }
      } catch (error) {
        console.error('Error removing item:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <section className={`space-y-4 ${className}`}>
        <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-80 flex-shrink-0">
              <Skeleton className="w-full h-44 rounded-t-xl" />
              <div className="bg-slate-900 p-3 rounded-b-xl space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-1.5 w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || !items?.length) {
    return null; // Don't show section if no continue watching items
  }

  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
        
        {/* Scroll controls - hidden on mobile, visible on larger screens */}
        <div className="hidden md:flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`p-2 rounded-full text-white hover:bg-slate-800 transition-colors ${
              !canScrollLeft ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
          >
            <ChevronLeft size={20} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`p-2 rounded-full text-white hover:bg-slate-800 transition-colors ${
              !canScrollRight ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      {/* Horizontal scrolling container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {items.map((item: any) => (
            <ContinueWatchingCard
              key={item.showId || item.id}
              id={item.showId?.toString() || item.id?.toString() || ''}
              title={item.title}
              episode={item.currentEpisode ? `Episode ${item.currentEpisode.episodeNumber}` : undefined}
              platform={item.platform}
              thumbnail={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : ''}
              backdrop_path={item.backdrop_path}
              poster_path={item.poster_path}
              duration={item.currentEpisode?.duration || 3600} // Default 1 hour if not specified
              progress={item.currentEpisode?.watchedDuration || 0}
              mediaType={item.mediaType}
              seasonNumber={item.currentEpisode?.seasonNumber}
              episodeNumber={item.currentEpisode?.episodeNumber}
              totalEpisodes={item.totalEpisodes}
              onPlay={handlePlay}
              onRemove={handleRemove}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContinueWatching;