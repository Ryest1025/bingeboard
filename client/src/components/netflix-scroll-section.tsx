import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EnhancedShowCard } from '@/components/EnhancedShowCard';

interface NetflixScrollSectionProps {
  title: string;
  shows: any[];
  onAddToWatchlist: (show: any) => void;
  onCardClick: (show: any) => void;
  onViewAll?: () => void;
  maxItems?: number;
  variant?: 'default' | 'compact' | 'detailed' | 'award';
}

export default function NetflixScrollSection({
  title,
  shows,
  onAddToWatchlist,
  onCardClick,
  onViewAll,
  maxItems = 8,
  variant = 'default'
}: NetflixScrollSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Display only the specified number of items
  const displayShows = shows.slice(0, maxItems);

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      return () => container.removeEventListener('scroll', checkScrollability);
    }
  }, [displayShows]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of container width
      const targetScrollLeft = direction === 'left' 
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (!displayShows.length) return null;

  return (
    <section className="space-y-4 group">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="flex items-center gap-2">
          {/* Scroll Controls */}
          {(canScrollLeft || canScrollRight) && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 transition-all duration-200 ${
                  !canScrollLeft ? 'opacity-40' : 'hover:scale-110'
                }`}
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 transition-all duration-200 ${
                  !canScrollRight ? 'opacity-40' : 'hover:scale-110'
                }`}
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </Button>
            </div>
          )}
          
          {/* See All Button */}
          {onViewAll && shows.length > maxItems && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-400 hover:text-white"
              onClick={onViewAll}
            >
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Content Row */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          } as React.CSSProperties & { scrollbarWidth: string; msOverflowStyle: string }}
        >
          {displayShows.map((show, index) => (
            <div key={show.id} className="flex-shrink-0 w-48">
              <EnhancedShowCard
                show={show}
                onAddToWatchlist={onAddToWatchlist}
                onCardClick={onCardClick}
                variant={variant}
              />
            </div>
          ))}
        </div>

        {/* Show count indicator */}
        {shows.length > maxItems && (
          <div className="absolute top-2 right-2 bg-slate-800/80 text-white text-xs px-2 py-1 rounded-full">
            {maxItems} of {shows.length}
          </div>
        )}
      </div>
    </section>
  );
}