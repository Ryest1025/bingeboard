import React, { useState, useEffect } from 'react';
import { Play, Bell, ChevronLeft, ChevronRight, Star, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import TrailerButton from '@/components/trailer-button';
import { PlatformLogo, getPlatformLogo } from '@/utils/platformLogos';
import StreamingLogos from '@/components/streaming-logos';
import type { NormalizedMedia } from '@/types/media';

interface HeroCarouselProps {
  shows: NormalizedMedia[];
}

// Genre mapping for IDs
const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics'
};

const getGenreName = (genreId: number): string => {
  return GENRE_MAP[genreId] || 'Unknown';
};

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
      
      {/* Main content */}
      <div className="absolute inset-0 flex items-end z-10">
        <div className="flex w-full p-8 gap-8">
          {/* Left side - Text content */}
          <div className="flex-1 max-w-2xl">
            {/* Trending badge */}
            <div className="mb-4">
              <Badge className="bg-red-600 text-white px-3 py-1 text-sm font-medium">
                #{currentIndex + 1} TRENDING NOW
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {featuredShow.displayTitle}
            </h1>

            {/* Meta info */}
            <div className="flex items-center gap-4 mb-4 text-white/80">
              {featuredShow.vote_average && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current text-yellow-400" />
                  <span className="font-medium">{featuredShow.vote_average.toFixed(1)}</span>
                </div>
              )}
              {(featuredShow.first_air_date || featuredShow.release_date) && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(featuredShow.first_air_date || featuredShow.release_date || '').getFullYear()}</span>
                </div>
              )}
              {featuredShow.genre_ids && featuredShow.genre_ids.length > 0 && (
                <div className="flex gap-2">
                  {featuredShow.genre_ids.slice(0, 2).map((genreId: number) => (
                    <Badge key={genreId} variant="outline" className="border-white/30 text-white/80">
                      {getGenreName(genreId)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Streaming platforms */}
            {featuredShow.streaming && featuredShow.streaming.length > 0 && (
              <div className="mb-4">
                <StreamingLogos 
                  providers={featuredShow.streaming.map((platform: any) => ({
                    provider_id: platform.provider_id || 0,
                    provider_name: platform.provider_name || platform.name || '',
                    logo_path: platform.logo_path
                  }))}
                  size="md"
                  maxDisplayed={4}
                />
              </div>
            )}

            {featuredShow.overview && (
              <p className="text-lg text-gray-200 mb-6 line-clamp-3 max-w-xl leading-relaxed">
                {featuredShow.overview}
              </p>
            )}

            <div className="flex items-center gap-3">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-semibold">
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

          {/* Right side - Poster image */}
          {featuredShow.poster_path && (
            <div className="hidden lg:block flex-shrink-0">
              <img
                src={`https://image.tmdb.org/t/p/w500${featuredShow.poster_path}`}
                alt={`${featuredShow.displayTitle} poster`}
                className="w-64 h-96 object-cover rounded-lg shadow-2xl border-4 border-white/10"
                loading="lazy"
              />
            </div>
          )}
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