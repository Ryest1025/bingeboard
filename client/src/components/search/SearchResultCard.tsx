import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Play } from 'lucide-react';

interface SearchResultCardProps {
  show: {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    genre_ids?: number[];
    media_type?: 'movie' | 'tv';
    overview?: string;
  };
  genres: { id: number; name: string }[];
  onHover: (show: any) => void;
  onClick: (show: any) => void;
  isHovered?: boolean;
}

export function SearchResultCard({ show, genres, onHover, onClick, isHovered }: SearchResultCardProps) {
  const title = show.title || show.name || 'Unknown Title';
  const posterUrl = show.poster_path 
    ? `https://image.tmdb.org/t/p/w92${show.poster_path}`
    : null;
  const releaseYear = show.release_date || show.first_air_date 
    ? new Date(show.release_date || show.first_air_date!).getFullYear()
    : null;
  
  const showGenres = show.genre_ids?.slice(0, 2).map(id => 
    genres.find(g => g.id === id)?.name
  ).filter(Boolean) || [];

  return (
    <div
      className={`flex items-center gap-3 p-3 cursor-pointer transition-all duration-200 rounded-lg ${
        isHovered ? 'bg-white/10' : 'hover:bg-white/5'
      }`}
      onMouseEnter={() => onHover(show)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(show)}
    >
      {/* Poster */}
      <div className="flex-shrink-0 w-12 h-16 bg-slate-700 rounded overflow-hidden">
        {posterUrl ? (
          <img 
            src={posterUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-white truncate">{title}</h4>
          {releaseYear && (
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {releaseYear}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-1">
          {show.vote_average && show.vote_average > 0 && (
            <div className="flex items-center gap-1 text-yellow-400 text-xs">
              <Star className="w-3 h-3 fill-current" />
              {show.vote_average.toFixed(1)}
            </div>
          )}
          {show.media_type && (
            <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
              {show.media_type === 'tv' ? 'TV' : 'Movie'}
            </Badge>
          )}
        </div>

        {showGenres.length > 0 && (
          <div className="flex gap-1">
            {showGenres.map((genre, index) => (
              <span key={index} className="text-xs text-gray-400">
                {genre}{index < showGenres.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hover indicator */}
      {isHovered && (
        <div className="flex-shrink-0 text-cyan-400">
          <Play className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
