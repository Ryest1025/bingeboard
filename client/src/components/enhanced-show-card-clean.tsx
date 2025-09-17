import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Star, Plus, Share2, Calendar, Clock } from 'lucide-react';
import { GRADIENTS, POSTER_SIZES, getRatingColor, getPlatformColor, getVariantStyles } from '@/styles/constants';
import { StreamingBadges } from './StreamingBadges';

interface ContentItem {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  first_air_date?: string;
  release_date?: string;
  genre_ids?: number[];
  streaming_platforms?: { provider_name: string; logo_path?: string }[];
  award?: string; // e.g., "Oscar Best Picture 2025"
}

interface EnhancedShowCardProps {
  show: ContentItem;
  variant?: 'trending' | 'upcoming' | 'search' | 'award';
  onAddToWatchlist: (show: ContentItem) => void;
  onShareContent: (show: ContentItem) => void;
  onCardClick?: (show: ContentItem) => void;
  genreMap?: Record<number, string>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Helper to calculate days until release
const getDaysUntilRelease = (releaseDate?: string): number | null => {
  if (!releaseDate) return null;
  const diffTime = new Date(releaseDate).getTime() - new Date().getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const EnhancedShowCard = memo(({
  show,
  variant = 'trending',
  onAddToWatchlist,
  onShareContent,
  onCardClick,
  genreMap,
  size = 'md',
  className = '',
}: EnhancedShowCardProps) => {
  const title = show.title || show.name || 'Untitled';
  const year = show.first_air_date
    ? new Date(show.first_air_date).getFullYear()
    : show.release_date
    ? new Date(show.release_date).getFullYear()
    : null;

  const rating = show.vote_average || 0;
  const hasHighRating = rating >= 8.0;

  const genreNames = genreMap && show.genre_ids
    ? show.genre_ids.map(id => genreMap[id]).filter(Boolean).slice(0, 2)
    : [];

  const releaseDate = show.release_date || show.first_air_date;
  const daysUntilRelease = releaseDate && variant === 'upcoming'
    ? getDaysUntilRelease(releaseDate)
    : null;

  const variantStyles = getVariantStyles(variant);

  const handleCardClick = () => {
    if (onCardClick) onCardClick(show);
  };

  const posterSize = POSTER_SIZES[size] || POSTER_SIZES.md;

  return (
    <Card
      className={`group discover-card glass-enhanced border-slate-700/50 ${variantStyles.border} transition-all duration-500 hover:bg-slate-800/60 hover:shadow-2xl hover:shadow-teal-500/10 hover:border-slate-600/70 hover:-translate-y-1 hover:scale-[1.02] ${variantStyles.shadow} ${onCardClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onCardClick ? handleCardClick : undefined}
      role={onCardClick ? 'button' : 'article'}
      tabIndex={onCardClick ? 0 : undefined}
      onKeyDown={onCardClick ? (e) => e.key === 'Enter' && handleCardClick() : undefined}
    >
      <CardContent className="p-4 flex gap-4 items-start">
        <div className="relative w-24 h-36 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0 group-hover:shadow-lg transition-shadow duration-300">
          {show.poster_path ? (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-slate-700 animate-pulse" />
              <img
                src={`https://image.tmdb.org/t/p/${posterSize}${show.poster_path}`}
                alt={`${title} poster`}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                loading="lazy"
                onLoad={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '1';
                  const placeholder = (e.target as HTMLImageElement).previousElementSibling;
                  if (placeholder) placeholder.remove();
                }}
                style={{ opacity: 0 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-600 to-slate-700 group-hover:from-slate-500 group-hover:to-slate-600 transition-all duration-300">
              <Play className="h-8 w-8 text-slate-400 group-hover:text-slate-300 group-hover:scale-110 transition-all duration-300" aria-hidden="true" />
            </div>
          )}

          {hasHighRating && (
            <div className={`absolute top-2 right-2 ${GRADIENTS.highRating} rounded-full p-1 shadow-lg hover:shadow-yellow-500/50 hover:scale-110 transition-all duration-300`}>
              <Star className="h-4 w-4 fill-current text-white animate-pulse" aria-hidden="true" />
            </div>
          )}

          {variant === 'award' && show.award && (
            <div className={`absolute top-2 left-2 ${GRADIENTS.highRating} text-xs px-2 py-1 rounded`}>
              {show.award}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <h3 className={`text-white font-bold text-lg ${variantStyles.title} transition-all duration-300 group-hover:text-teal-300 flex items-center gap-2 flex-wrap line-clamp-2`}>
            {title}
          </h3>

          {year && <span className="text-sm text-slate-500">{year}</span>}

          <div className="flex items-center gap-1 flex-wrap">
            {genreNames.map((genre, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="border-slate-600 text-slate-300 hover:border-teal-500/50 hover:text-teal-300 hover:bg-teal-500/10 transition-all duration-300 cursor-pointer"
              >
                {genre}
              </Badge>
            ))}
          </div>

          {show.overview && <p className="text-slate-300 text-sm line-clamp-2">{show.overview}</p>}

          <StreamingBadges platforms={show.streaming_platforms} maxShow={3} />

          {variant === 'upcoming' && releaseDate && daysUntilRelease !== null && (
            <div className="absolute bottom-2 left-2 bg-emerald-600/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 text-xs text-white">
              <Clock className="h-3 w-3" />
              {daysUntilRelease > 0 ? `${daysUntilRelease} days` : 'Releases today!'}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <Button
              size="sm"
              className={`${GRADIENTS.watchlist} text-white border-0 shadow-lg enhanced-button transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 opacity-80 group-hover:opacity-100`}
              onClick={(e) => {
                e.stopPropagation();
                onAddToWatchlist(show);
              }}
              aria-label={`Add ${title} to watchlist`}
            >
              <Plus className="h-3 w-3 mr-2 transition-transform duration-300 hover:rotate-90" />
              Watchlist
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500 hover:text-white enhanced-button transition-all duration-300 hover:scale-105 active:scale-95 opacity-80 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onShareContent(show);
              }}
              aria-label={`Share ${title}`}
            >
              <Share2 className="h-3 w-3 mr-2 transition-transform duration-300 hover:scale-110" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

EnhancedShowCard.displayName = 'EnhancedShowCard';