import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  scrollId: string;
}

export const HorizontalScrollContainer: React.FC<HorizontalScrollContainerProps> = ({ 
  children, 
  className = "",
  scrollId 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of one card plus gap
      const currentScroll = scrollRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <div className="relative group">
      {/* Left scroll arrow - positioned in top right area */}
      <div className="absolute top-0 right-16 z-10 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div
        ref={scrollRef}
        className={`overflow-x-auto scrollbar-hide ${className}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
};