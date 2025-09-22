import React, { useState, useEffect } from 'react';
import { Play, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TrailerButton from '@/components/trailer-button';
import type { NormalizedMedia } from '@/types/media';

interface HeroCarouselProps {
  shows: NormalizedMedia[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ shows }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 6 seconds
  useEffect(() => {
    if (!shows?.length) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % shows.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [shows.length]);

  if (!shows?.length) {
    return (
      <div className="relative w-full h-96 bg-slate-800 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-700 animate-pulse">
          <div className="absolute bottom-8 left-8 space-y-4">
            <div className="h-8 bg-slate-600 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-slate-600 rounded w-96 animate-pulse"></div>
            <div className="h-4 bg-slate-600 rounded w-80 animate-pulse"></div>
            <div className="flex gap-3 mt-6">
              <div className="h-12 w-32 bg-slate-600 rounded animate-pulse"></div>
              <div className="h-12 w-40 bg-slate-600 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const featuredShow = shows[currentIndex];

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + shows.length) % shows.length);
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % shows.length);
  };

  return (
    <div className="relative h-96 rounded-lg overflow-hidden bg-slate-800">
      {/* Background Image */}
      {featuredShow.backdrop_path && (
        <img
          src={`https://image.tmdb.org/t/p/w1280${featuredShow.backdrop_path}`}
          alt={featuredShow.displayTitle}
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out"
        />
      )}
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      
      {/* Slide content */}
      <div className="absolute bottom-8 left-8 max-w-2xl z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {featuredShow.displayTitle}
        </h1>
        {featuredShow.overview && (
          <p className="text-lg text-gray-200 mb-6 line-clamp-3 max-w-xl">
            {featuredShow.overview}
          </p>
        )}
        <div className="flex items-center gap-3">
          <Button size="lg" className="bg-white text-black hover:bg-gray-200">
            <Play className="w-5 h-5 mr-2" />
            Watch Now
          </Button>
          <TrailerButton 
            show={{
              id: featuredShow.id,
              tmdbId: featuredShow.id,
              title: featuredShow.displayTitle
            }} 
            variant="outline" 
            size="lg"
            className="border-white text-white hover:bg-white/10"
          />
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
            <Bell className="w-5 h-5 mr-2" />
            Add to Watchlist
          </Button>
        </div>
      </div>
      
      {/* Navigation Arrows */}
      {shows.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full z-20 transition-colors"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full z-20 transition-colors"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}
      
      {/* Slide indicators */}
      {shows.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {shows.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-3 h-3 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-white' : 'bg-gray-500 hover:bg-gray-300'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};