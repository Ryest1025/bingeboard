import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Plus, Share2, Play, Calendar, Clock } from 'lucide-react';

interface Show {
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
  streaming_platforms?: Array<{
    provider_name: string;
    logo_path?: string;
  }>;
}

interface EnhancedShowCardProps {
  show: Show;
  variant?: 'default' | 'compact' | 'detailed' | 'spotlight';
  onAddToWatchlist?: (show: Show) => void;
  onShareContent?: (show: Show) => void;
  onCardClick?: (show: Show) => void;
  size?: 'sm' | 'md' | 'lg';
}

// Genre mapping
const GENRE_NAMES: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
};

// Platform colors
const PLATFORM_COLORS: Record<string, string> = {
  'Netflix': 'bg-red-600 text-white',
  'Disney+': 'bg-blue-600 text-white',
  'Amazon Prime Video': 'bg-blue-500 text-white',
  'HBO Max': 'bg-purple-600 text-white',
  'Hulu': 'bg-green-600 text-white',
  'Apple TV+': 'bg-gray-700 text-white',
  'Paramount+': 'bg-blue-500 text-white',
  'Peacock': 'bg-yellow-500 text-black',
};

const getRatingColor = (rating: number): string => {
  if (rating >= 9) return 'text-yellow-300';
  if (rating >= 8) return 'text-yellow-400';
  if (rating >= 7) return 'text-yellow-500';
  return 'text-slate-400';
};

const getPlatformColor = (platformName: string): string => {
  return PLATFORM_COLORS[platformName] || 'bg-slate-600 text-white';
};

const StreamingBadges = ({ 
  platforms, 
  maxShow = 3 
}: { 
  platforms?: Array<{ provider_name: string; logo_path?: string }>; 
  maxShow?: number; 
}) => {
  if (!platforms?.length) return null;
  
  const visiblePlatforms = platforms.slice(0, maxShow);
  const remainingCount = platforms.length - maxShow;
  
  return (
    <div className="flex flex-wrap gap-1">
      {visiblePlatforms.map((platform, index) => (
        <Badge
          key={index}
          className={`text-xs px-2 py-1 ${getPlatformColor(platform.provider_name)}`}
        >
          {platform.provider_name}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs px-2 py-1">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
};

export const EnhancedShowCard: React.FC<EnhancedShowCardProps> = ({
  show,
  variant = 'default',
  onAddToWatchlist,
  onShareContent,
  onCardClick,
  size = 'md'
}) => {
  const title = show.title || show.name || 'Unknown Title';
  const releaseDate = show.release_date || show.first_air_date;
  const isUpcoming = releaseDate && new Date(releaseDate) > new Date();

  const handleCardClick = () => {
    onCardClick?.(show);
  };

  const handleAddToWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToWatchlist?.(show);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShareContent?.(show);
  };

  return (
    <Card 
      className="group overflow-hidden cursor-pointer border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-lg"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Poster Image */}
        <div className="relative aspect-[2/3] overflow-hidden">
          {show.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-2 left-2 right-2">
              {/* Rating */}
              {show.vote_average && show.vote_average > 0 && (
                <div className={`flex items-center gap-1 mb-2 ${getRatingColor(show.vote_average)}`}>
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs font-medium text-white">
                    {show.vote_average.toFixed(1)}
                  </span>
                </div>
              )}
              
              {/* Upcoming indicator */}
              {isUpcoming && releaseDate && (
                <div className="flex items-center gap-1 text-yellow-400 mb-1">
                  <Calendar className="w-3 h-3" />
                  <span className="text-xs">Upcoming</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button size="sm" className="bg-white/90 text-black hover:bg-white">
              <Play className="w-4 h-4 mr-1" />
              Watch
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-3">
          <div className="space-y-2">
            {/* Title */}
            <h3 className="font-semibold text-sm line-clamp-2 leading-tight text-white">
              {title}
            </h3>
            
            {/* Genres */}
            {show.genre_ids && show.genre_ids.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {show.genre_ids.slice(0, 2).map((genreId: number) => (
                  <Badge
                    key={genreId}
                    variant="outline"
                    className="text-xs px-1.5 py-0.5 border-slate-600 text-slate-300"
                  >
                    {GENRE_NAMES[genreId] || `Genre ${genreId}`}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Streaming platforms */}
            <StreamingBadges platforms={show.streaming_platforms} maxShow={2} />
            
            {/* Overview for detailed variant */}
            {variant === 'detailed' && show.overview && (
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {show.overview}
              </p>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/50">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAddToWatchlist}
              className="text-xs px-2 py-1 h-auto text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleShare}
              className="text-xs px-2 py-1 h-auto text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <Share2 className="w-3 h-3 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedShowCard;