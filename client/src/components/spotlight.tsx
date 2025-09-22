// spotlight.tsx - Sept 12, 11:20 AM
import React, { useState, useEffect } from 'react';
import { Play, Plus, Info, Star, Clock, Calendar, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface SpotlightShow {
  id: string;
  title: string;
  description: string;
  image: string;
  backdropImage: string;
  rating: number;
  year: number;
  genre: string[];
  runtime?: number;
  network?: string;
  type: 'movie' | 'tv';
  featured?: boolean;
  trending?: boolean;
  new?: boolean;
  aiRecommended?: boolean;
}

interface SpotlightProps {
  shows?: SpotlightShow[];
  onWatchNow?: (show: SpotlightShow) => void;
  onAddToWatchlist?: (show: SpotlightShow) => void;
  onShowDetails?: (show: SpotlightShow) => void;
}

// Mock spotlight data with trending and featured content
const mockSpotlightShows: SpotlightShow[] = [
  {
    id: '1',
    title: 'The Last of Us',
    description: 'Twenty years after modern civilization has been destroyed, Joel must smuggle Ellie, a fourteen-year-old girl, out of an oppressive quarantine zone. What starts as a small job soon becomes a brutal, heartbreaking journey.',
    image: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
    backdropImage: 'https://image.tmdb.org/t/p/w1280/5DUMPBSnHOZsbBv81GFXZXvDpo6.jpg',
    rating: 8.7,
    year: 2023,
    genre: ['Drama', 'Sci-Fi', 'Thriller'],
    runtime: 60,
    network: 'HBO',
    type: 'tv',
    featured: true,
    trending: true,
    aiRecommended: true
  },
  {
    id: '2',
    title: 'Wednesday',
    description: 'Smart, sarcastic and a little dead inside, Wednesday Addams investigates a murder spree while making new friends — and foes — at Nevermore Academy.',
    image: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
    backdropImage: 'https://image.tmdb.org/t/p/w1280/iHSwvRVsRyxpX5jag2mBrUUf6HT.jpg',
    rating: 8.1,
    year: 2022,
    genre: ['Comedy', 'Crime', 'Family'],
    runtime: 50,
    network: 'Netflix',
    type: 'tv',
    trending: true,
    new: true
  },
  {
    id: '3',
    title: 'Avatar: The Way of Water',
    description: 'Set more than a decade after the events of the first film, Avatar: The Way of Water begins to tell the story of the Sully family, the trouble that follows them, and the lengths they go to keep each other safe.',
    image: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    backdropImage: 'https://image.tmdb.org/t/p/w1280/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
    rating: 7.6,
    year: 2022,
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    runtime: 192,
    type: 'movie',
    featured: true,
    new: true
  }
];

export function Spotlight({ 
  shows = mockSpotlightShows, 
  onWatchNow, 
  onAddToWatchlist, 
  onShowDetails 
}: SpotlightProps) {
  const [currentShowIndex, setCurrentShowIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const currentShow = shows[currentShowIndex];

  // Auto-rotate spotlight shows
  useEffect(() => {
    if (!isAutoPlaying || shows.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentShowIndex((prevIndex) => (prevIndex + 1) % shows.length);
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, shows.length]);

  const handleWatchNow = () => {
    if (onWatchNow && currentShow) {
      onWatchNow(currentShow);
    }
  };

  const handleAddToWatchlist = () => {
    if (onAddToWatchlist && currentShow) {
      onAddToWatchlist(currentShow);
    }
  };

  const handleShowDetails = () => {
    if (onShowDetails && currentShow) {
      onShowDetails(currentShow);
    }
  };

  const formatRuntime = (minutes?: number) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const goToShow = (index: number) => {
    setCurrentShowIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10 seconds
  };

  if (!currentShow) return null;

  return (
    <div className="relative w-full h-[70vh] min-h-[600px] overflow-hidden rounded-xl">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${currentShow.backdropImage})` }}
      />
      
      {/* Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex items-center h-full px-8 lg:px-16">
        <div className="max-w-2xl space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {currentShow.featured && (
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1">
                <Zap className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {currentShow.trending && (
              <Badge className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
            {currentShow.new && (
              <Badge className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-3 py-1">
                New
              </Badge>
            )}
            {currentShow.aiRecommended && (
              <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1">
                AI Pick
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight">
            {currentShow.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-gray-300">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="text-white font-semibold">{currentShow.rating}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{currentShow.year}</span>
            </div>
            {currentShow.runtime && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{formatRuntime(currentShow.runtime)}</span>
              </div>
            )}
            {currentShow.network && (
              <Badge variant="outline" className="border-white/30 text-white">
                {currentShow.network}
              </Badge>
            )}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2">
            {currentShow.genre.slice(0, 3).map((genre) => (
              <Badge key={genre} variant="secondary" className="bg-white/10 text-white border-white/20">
                {genre}
              </Badge>
            ))}
          </div>

          {/* Description */}
          <p className="text-lg text-gray-200 leading-relaxed max-w-xl line-clamp-3">
            {currentShow.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Button 
              size="lg" 
              onClick={handleWatchNow}
              className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-3 text-lg"
            >
              <Play className="h-5 w-5 mr-2 fill-current" />
              Watch Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleAddToWatchlist}
              className="border-white/50 text-white hover:bg-white/10 font-semibold px-8 py-3 text-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              My List
            </Button>
            <Button 
              size="lg" 
              variant="ghost" 
              onClick={handleShowDetails}
              className="text-white hover:bg-white/10 font-semibold px-8 py-3 text-lg"
            >
              <Info className="h-5 w-5 mr-2" />
              More Info
            </Button>
          </div>
        </div>
      </div>

      {/* Show Navigation Dots */}
      {shows.length > 1 && (
        <div className="absolute bottom-8 left-8 flex space-x-3 z-20">
          {shows.map((_, index) => (
            <button
              key={index}
              onClick={() => goToShow(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentShowIndex 
                  ? 'bg-white scale-110' 
                  : 'bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to show ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {isAutoPlaying && shows.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all duration-8000 ease-linear"
            style={{ 
              width: '100%',
              animation: 'progress 8s linear infinite'
            }}
          />
        </div>
      )}

      {/* Poster on the right (for larger screens) */}
      <div className="hidden lg:block absolute right-16 top-1/2 transform -translate-y-1/2 z-10">
        <img
          src={currentShow.image}
          alt={currentShow.title}
          className="w-80 h-auto rounded-lg shadow-2xl border-4 border-white/20"
        />
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}