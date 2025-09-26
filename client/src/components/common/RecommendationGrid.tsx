import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Plus, Play } from 'lucide-react';
import { NormalizedShow, getAwardDisplayInfo, getPrimaryStreamingPlatform } from '@/lib/recommendationUtils';

interface RecommendationGridProps {
  shows: NormalizedShow[];
  title?: string;
  onShowClick?: (show: NormalizedShow) => void;
  onAddToWatchlist?: (show: NormalizedShow) => void;
  onWatchTrailer?: (show: NormalizedShow) => void;
  className?: string;
}

const RecommendationGrid: React.FC<RecommendationGridProps> = ({
  shows,
  title,
  onShowClick,
  onAddToWatchlist,
  onWatchTrailer,
  className = ''
}) => {
  const getShowTitle = (show: NormalizedShow) => 
    show.title || show.name || show.original_title || show.original_name || 'Unknown Title';

  const getPosterUrl = (show: NormalizedShow) => {
    if (!show.poster_path) return '/placeholder.png';
    return show.poster_path.startsWith('http') 
      ? show.poster_path 
      : `https://image.tmdb.org/t/p/w500${show.poster_path}`;
  };

  const getReleaseYear = (show: NormalizedShow) => {
    const date = show.release_date || show.first_air_date;
    return date ? new Date(date).getFullYear() : null;
  };

  if (!shows || shows.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>No recommendations available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {title && (
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {shows.map(show => {
          const showTitle = getShowTitle(show);
          const posterUrl = getPosterUrl(show);
          const releaseYear = getReleaseYear(show);
          const awardInfo = getAwardDisplayInfo(show);
          const primaryPlatform = getPrimaryStreamingPlatform(show);

          return (
            <Card 
              key={show.id} 
              className="relative overflow-hidden bg-slate-800 border-slate-700 hover:border-slate-600 transition-all cursor-pointer group"
              onClick={() => onShowClick?.(show)}
            >
              {/* Award Badge */}
              {awardInfo.hasAwards && (
                <Badge className={`absolute top-2 left-2 z-10 ${awardInfo.badgeColor} font-semibold text-xs shadow-lg`}>
                  {awardInfo.emoji} {awardInfo.badgeText}
                </Badge>
              )}

              {/* Streaming Platform Badge */}
              {primaryPlatform && (
                <Badge className="absolute top-2 right-2 z-10 bg-black/70 text-white text-xs">
                  {primaryPlatform.provider_name}
                </Badge>
              )}

              <CardContent className="p-0">
                {/* Poster Image */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={posterUrl}
                    alt={showTitle}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.png';
                    }}
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-2">
                      {onWatchTrailer && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onWatchTrailer(show);
                          }}
                          className="text-xs"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Play
                        </Button>
                      )}
                      {onAddToWatchlist && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToWatchlist(show);
                          }}
                          className="text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Show Info */}
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1">
                    {showTitle}
                  </h3>
                  
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    {releaseYear && (
                      <span>{releaseYear}</span>
                    )}
                    
                    {show.vote_average && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{show.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Streaming Count */}
                  {show.streaming && show.streaming.length > 1 && (
                    <div className="text-xs text-slate-500 mt-1">
                      +{show.streaming.length - 1} more platforms
                    </div>
                  )}

                  {/* Personalized Reason */}
                  {show.reason && (
                    <div className="text-xs text-blue-400 mt-1 line-clamp-1">
                      {show.reason}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationGrid;