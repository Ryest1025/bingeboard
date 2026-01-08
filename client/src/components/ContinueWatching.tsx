import React, { useState, useRef, useEffect } from 'react';
import { Play, X, Clock, ChevronLeft, ChevronRight, Info, Check, Calendar } from 'lucide-react';
import { useContinueWatching } from '@/hooks/useViewingHistory';
import { useWatchStatus } from '@/hooks/useWatchStatus';
import { useTrailer } from '@/hooks/useTrailer';
import { getPlatformLogo } from '@/utils/platformLogos';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import StreamingLogos from '@/components/streaming-logos';

interface ContinueWatchingItemProps {
  id: string;
  title: string;
  episode?: string;
  platform: string | { provider_name?: string; name?: string; logo_path?: string };
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
  const [showTrailerPreview, setShowTrailerPreview] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Fetch trailer data from multiAPI system
  const { data: trailerData } = useTrailer(id, mediaType, title);
  
  // Watch status management
  const { markAsCompleted, removeFromContinueWatching, isLoading: statusLoading } = useWatchStatus();
  
  const percent = Math.min((progress / duration) * 100, 100);
  
  // Premium image selection - prioritize backdrop for cinematic feel
  const imageUrl = backdrop_path 
    ? `https://image.tmdb.org/t/p/w780${backdrop_path}` // Higher resolution for premium feel
    : poster_path 
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : thumbnail;

  const platformLogo = getPlatformLogo(platform as any);

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

  // Premium trailer preview with delay
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isHovered && trailerData?.primaryTrailer?.embeddableUrl) {
      timeoutId = setTimeout(() => {
        setShowTrailerPreview(true);
      }, 800); // Reduced delay for more responsive feel
    } else {
      setShowTrailerPreview(false);
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
      className="relative w-80 flex-shrink-0 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main card with cinematic styling */}
      <div className="relative rounded-xl overflow-hidden shadow-2xl bg-slate-900 transition-all duration-500 ease-out group-hover:scale-105 group-hover:shadow-3xl">
        
        {/* Thumbnail container */}
        <div className="relative w-full h-44 overflow-hidden">
          {!imageLoaded && (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse" />
          )}
          
          {/* Main thumbnail */}
          <img
            src={imageUrl}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-700 ease-out ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${isHovered ? 'scale-110' : 'scale-100'} ${
              showTrailerPreview ? 'opacity-20' : 'opacity-100'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              
              // First try poster if backdrop failed
              if (target.src.includes('backdrop') && poster_path) {
                target.src = `https://image.tmdb.org/t/p/w500${poster_path}`;
                return;
              }
              
              // If both fail, use placeholder
              target.src = `data:image/svg+xml;base64,${btoa(`
                <svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#374151;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#1f2937;stop-opacity:1" />
                    </linearGradient>
                  </defs>
                  <rect width="400" height="225" fill="url(#grad)" rx="8"/>
                  <text x="200" y="112" font-family="Arial, sans-serif" font-size="16" 
                        text-anchor="middle" fill="#9ca3af" opacity="0.7">No Image</text>
                </svg>
              `)}`;
            }}
          />

          {/* Trailer preview overlay */}
          {showTrailerPreview && trailerData?.primaryTrailer?.embeddableUrl && (
            <div className="absolute inset-0 bg-black/20">
              <iframe
                ref={iframeRef}
                src={`${trailerData.primaryTrailer.embeddableUrl}?autoplay=1&mute=1&controls=0&loop=1&modestbranding=1&rel=0`}
                className="w-full h-full object-cover"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={`${title} trailer`}
              />
            </div>
          )}

          {/* Platform logos - premium corner placement */}
          <div className="absolute top-3 right-3">
            <StreamingLogos 
              providers={typeof platform === 'string' 
                ? [{ provider_id: 1, provider_name: platform }] 
                : [{ 
                    provider_id: 1, 
                    provider_name: platform?.provider_name || platform?.name || 'Platform', 
                    logo_path: platform?.logo_path 
                  }]
              }
              size="sm"
              maxDisplayed={1}
            />
          </div>

          {/* Progress bar - cinematic red accent */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-black/60 to-black/40">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-red-500 shadow-lg transition-all duration-700 ease-out" 
              style={{ width: `${percent}%` }} 
            />
          </div>

          {/* Premium hover overlay */}
          <div 
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Action buttons - Enhanced with new features */}
            <div className="absolute bottom-4 left-4 flex gap-3">
              <button
                onClick={handlePlay}
                className="w-10 h-10 rounded-full bg-white text-black hover:bg-gray-200 transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-110"
                title={`Continue watching on ${typeof platform === 'string' ? platform : platform?.provider_name || 'Platform'}`}
              >
                <Play size={18} fill="currentColor" />
              </button>
              
              {/* Simplified action buttons - working version */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markAsCompleted(parseInt(id));
                }}
                className="w-10 h-10 rounded-full bg-green-600/90 backdrop-blur-sm text-white hover:bg-green-500 transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-110 border border-white/20"
                title="Mark as completed"
                disabled={statusLoading}
              >
                <Check size={16} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromContinueWatching(parseInt(id));
                  onRemove(id);
                }}
                className="w-10 h-10 rounded-full bg-slate-800/90 backdrop-blur-sm text-white hover:bg-red-600 transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-110 border border-white/20"
                title="Remove from continue watching"
                disabled={statusLoading}
              >
                <X size={16} />
              </button>
              
              <button
                className="w-10 h-10 rounded-full bg-slate-800/90 backdrop-blur-sm text-white hover:bg-slate-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-110 border border-white/20"
                title="Show info"
              >
                <Info size={16} />
              </button>
            </div>

            {/* Enhanced time indicators */}
            <div className="absolute top-4 left-4 flex gap-2">
              {/* Time remaining indicator */}
              <div className="bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-white/90 flex items-center gap-2 border border-white/10">
                <Clock size={12} />
                <span className="font-medium">{timeLeft}</span>
              </div>
              
              {/* Days since last watched */}
              {(() => {
                const lastWatchedDate = new Date('2025-08-04T15:30:00Z'); // TODO: Use real lastWatched date
                const daysSince = Math.floor((Date.now() - lastWatchedDate.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysSince > 0) {
                  return (
                    <Badge 
                      variant={daysSince > 7 ? "destructive" : daysSince > 3 ? "secondary" : "default"}
                      className="text-xs px-2 py-1 bg-black/60 backdrop-blur-sm border border-white/10"
                    >
                      <Calendar size={10} className="mr-1" />
                      {daysSince}d ago
                    </Badge>
                  );
                }
                return null;
              })()}
            </div>

            {/* Trailer indicator */}
            {trailerData?.primaryTrailer && !showTrailerPreview && (
              <div className="absolute bottom-4 right-4 bg-red-600/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-semibold tracking-wide shadow-lg">
                🎬 TRAILER
              </div>  
            )}
          </div>

          {/* Cinematic vignette effect */}
          <div 
            className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30 transition-opacity duration-500 ${
              isHovered ? 'opacity-60' : 'opacity-30'
            }`} 
          />
        </div>

        {/* Premium content section */}
        <div className="p-4 bg-gradient-to-t from-slate-900 to-slate-800 border-t border-white/5">
          <div className="space-y-3">
            {/* Title and episode */}
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base truncate leading-tight">
                {title}
              </h3>
              {episodeInfo && (
                <p className="text-sm text-slate-300 truncate font-medium">
                  {episodeInfo}
                </p>
              )}
            </div>

            {/* Enhanced progress section with more details */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">{Math.round(percent)}% watched</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-500 font-medium">{timeLeft}</span>
                </div>
                {totalEpisodes && (
                  <span className="text-slate-500 font-medium">
                    Episode {episodeNumber}/{totalEpisodes}
                  </span>
                )}
              </div>
              
              {/* Enhanced progress bar with better visual feedback */}
              <div className="relative w-full bg-slate-700/50 rounded-full h-2 overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-400 transition-all duration-1000 ease-out rounded-full shadow-lg" 
                  style={{ width: `${percent}%` }} 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 rounded-full" />
                
                {/* Progress milestone indicators */}
                <div className="absolute inset-0 flex justify-between items-center px-1">
                  {[25, 50, 75].map((milestone) => (
                    <div 
                      key={milestone}
                      className={`w-0.5 h-1 rounded-full transition-colors duration-300 ${
                        percent >= milestone ? 'bg-white/40' : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Additional episode info for TV shows */}
              {mediaType === 'tv' && seasonNumber && (
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Season {seasonNumber}</span>
                  {totalEpisodes && (
                    <span>
                      {Math.round((episodeNumber || 1) / totalEpisodes * 100)}% of season
                    </span>
                  )}
                </div>
              )}
            </div>
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

  // Debug logging
  console.log('ContinueWatching component:', { 
    itemCount: items?.length, 
    isLoading, 
    hasError: !!error,
    items: items?.map(i => ({ id: i.showId, title: i.title }))
  });

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
    <section className={`space-y-6 ${className}`}>
      {/* Premium Header with subtle elegance */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Continue Watching
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            Pick up where you left off
          </p>
        </div>
        
        {/* Elegant scroll controls */}
        <div className="hidden lg:flex gap-2">
          <button
            className={`p-3 rounded-full bg-slate-800/50 backdrop-blur-sm text-white hover:bg-slate-700 transition-all duration-300 border border-slate-600/50 ${
              !canScrollLeft ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'
            }`}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className={`p-3 rounded-full bg-slate-800/50 backdrop-blur-sm text-white hover:bg-slate-700 transition-all duration-300 border border-slate-600/50 ${
              !canScrollRight ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'
            }`}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Netflix-style Horizontal Scroll Container */}
      <div className="relative group">
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scroll-smooth pb-6 scrollbar-none"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          } as React.CSSProperties}
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
              duration={item.currentEpisode?.duration || 3600}
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
        
        {/* Cinematic fade edge effects */}
        <div className="absolute left-0 top-0 bottom-6 w-8 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-6 w-16 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
};

export default ContinueWatching;