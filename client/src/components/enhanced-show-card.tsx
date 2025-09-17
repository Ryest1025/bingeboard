import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Share2, Clock, Star, Award, Trophy } from 'lucide-react';
import { StreamingBadges } from './StreamingBadges';
import { 
  POSTER_SIZES, 
  GRADIENTS, 
  getVariantStyles, 
  getRatingColor, 
  getDaysUntilRelease,
  isAwardSeason,
  getAwardBadgeStyles,
  AWARD_GRADIENTS
} from '@/styles/constants';

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
  award_won?: string[];
  award_nominated?: string[];
}

interface EnhancedShowCardProps {
  show: ContentItem;
  variant?: 'trending' | 'upcoming' | 'search';
  onAddToWatchlist: (show: ContentItem) => void;
  onShareContent: (show: ContentItem) => void;
  onCardClick?: (show: ContentItem) => void;
  genreMap?: Record<number, string>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  awardSeasonActive?: boolean;
}

export const EnhancedShowCard = memo(({
  show,
  variant = 'trending',
  onAddToWatchlist,
  onShareContent,
  onCardClick,
  genreMap,
  size = 'md',
  className = '',
  awardSeasonActive = isAwardSeason(new Date())
}: EnhancedShowCardProps) => {
  const variantStyles = getVariantStyles(variant);
  const title = show.name || show.title || 'Untitled';
  const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() :
               show.release_date ? new Date(show.release_date).getFullYear() : null;
  const rating = show.vote_average || 0;
  const hasHighRating = rating >= 8.0;
  const releaseDate = show.release_date || show.first_air_date;
  const daysUntilRelease = releaseDate && variant === 'upcoming' ? getDaysUntilRelease(releaseDate) : null;
  const genreNames = genreMap && show.genre_ids ? show.genre_ids.map(id => genreMap[id]).filter(Boolean).slice(0, 2) : [];

  const hasAwardWon = show.award_won && show.award_won.length > 0;
  const hasAwardNominated = show.award_nominated && show.award_nominated.length > 0;
  const showAwardBadges = awardSeasonActive && (hasAwardWon || hasAwardNominated);

  const getPosterSize = () => POSTER_SIZES[size] || POSTER_SIZES.md;

  const handleCardClick = () => {
    if (onCardClick) onCardClick(show);
  };

  return (
    <Card
      className={`group discover-card glass-enhanced border-slate-700/50 ${variantStyles.border} transition-all duration-300 hover:bg-slate-800/50 hover:shadow-xl ${variantStyles.shadow} ${onCardClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onCardClick ? handleCardClick : undefined}
      role={onCardClick ? 'button' : 'article'}
      tabIndex={onCardClick ? 0 : undefined}
      onKeyDown={onCardClick ? (e) => e.key === 'Enter' && handleCardClick() : undefined}
    >
      <CardContent className="p-4 flex gap-4 items-start">
        <div className="relative w-24 h-36 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
          {show.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/${getPosterSize()}${show.poster_path}`}
              alt={`${title} poster`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-600 to-slate-700">
              <Clock className="h-8 w-8 text-slate-400" />
            </div>
          )}

          {hasHighRating && (
            <div className={`absolute top-2 right-2 ${GRADIENTS.highRating} rounded-full p-1`}>
              <Star className="h-3 w-3 text-white fill-current" />
            </div>
          )}

          {/* Award Season Badge */}
          {showAwardBadges && (
            <div className="absolute top-2 left-2">
              {hasAwardWon ? (
                <div className={`${AWARD_GRADIENTS.winner} rounded-full p-1.5 shadow-lg`} title="Award Winner">
                  <Trophy className="h-3 w-3 text-white" />
                </div>
              ) : hasAwardNominated ? (
                <div className={`${AWARD_GRADIENTS.nominee} rounded-full p-1.5 shadow-lg`} title="Award Nominated">
                  <Award className="h-3 w-3 text-white" />
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`text-white font-bold ${variantStyles.title} flex items-center gap-2 flex-wrap`}>
              {title}
              {/* Award Season Title Badge */}
              {showAwardBadges && awardSeasonActive && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${hasAwardWon ? 'border-yellow-500 text-yellow-500' : 'border-gray-500 text-gray-400'}`}
                >
                  {hasAwardWon ? 'Winner' : 'Nominated'}
                </Badge>
              )}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {year && <span className="text-sm text-slate-500">{year}</span>}
            {genreNames.map((genre, idx) => (
              <span key={idx} className="text-sm text-slate-400">{genre}</span>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium ${getRatingColor(rating)}`}>{rating > 0 ? rating.toFixed(1) : 'N/A'}</span>
            <StreamingBadges platforms={show.streaming_platforms} maxShow={3} />
          </div>

          <p className="text-slate-300 text-sm line-clamp-2">{show.overview || 'No description available.'}</p>

          {/* Award Details */}
          {showAwardBadges && (hasAwardWon || hasAwardNominated) && (
            <div className="flex flex-wrap gap-1 mt-2">
              {hasAwardWon && show.award_won?.slice(0, 2).map((award, idx) => (
                <Badge 
                  key={`won-${idx}`} 
                  className={`text-xs ${getAwardBadgeStyles(true)}`}
                >
                  🏆 {award}
                </Badge>
              ))}
              {hasAwardNominated && show.award_nominated?.slice(0, 2).map((award, idx) => (
                <Badge 
                  key={`nom-${idx}`} 
                  className={`text-xs ${getAwardBadgeStyles(false)}`}
                >
                  🎯 {award}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <Button
              size="sm"
              className={`${GRADIENTS.watchlist} text-white border-0 shadow-lg enhanced-button`}
              onClick={(e) => { e.stopPropagation(); onAddToWatchlist(show); }}
              aria-label={`Add ${title} to watchlist`}
            >
              <Plus className="h-3 w-3 mr-2" />
              Watchlist
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700/50 enhanced-button"
              onClick={(e) => { e.stopPropagation(); onShareContent(show); }}
              aria-label={`Share ${title}`}
            >
              <Share2 className="h-3 w-3 mr-2" />
              Share
            </Button>
          </div>

          {variant === 'upcoming' && releaseDate && daysUntilRelease !== null && (
            <div className="absolute bottom-2 left-2 bg-emerald-600/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 text-xs text-white">
              <Clock className="h-3 w-3" />
              {daysUntilRelease > 0 ? `${daysUntilRelease} days` : 'Releases today!'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

EnhancedShowCard.displayName = 'EnhancedShowCard';
