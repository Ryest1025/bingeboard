import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Plus, Play, Calendar, Clock, Share2, Clapperboard } from 'lucide-react';
import StreamingLogos from '@/components/streaming-logos';
import TrailerButton from '@/components/trailer-button';

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
  streaming_platforms?: Array<{ provider_id?: number; provider_name?: string; name?: string; logo_path?: string }>;
  streamingPlatforms?: Array<{ provider_id?: number; provider_name?: string; name?: string; logo_path?: string }>;
  streaming?: Array<{ provider_id?: number; provider_name?: string; name?: string; logo_path?: string }>;
}

interface EnhancedShowCardProps {
  show: Show;
  layout?: "vertical" | "horizontal" | "spotlight";
  actions?: {
    watchNow?: boolean;
    trailer?: boolean;
    addToList?: boolean;
    share?: boolean;
  };
  showStreamingLogos?: boolean;
  onAddToWatchlist?: (show: Show) => void;
  onWatchTrailer?: (show: Show) => void;
  onCardClick?: (show: Show) => void;
  onShareContent?: (show: Show) => void;
  onWatchNow?: (show: Show) => void;
  genreMap?: Record<number, string>;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed' | 'trending' | 'upcoming' | 'search' | 'award'; // Legacy support
}

// Genre mapping
const GENRE_NAMES: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
};

const getRatingColor = (rating: number) => {
  if (rating >= 9) return 'text-yellow-300';
  if (rating >= 8) return 'text-yellow-400';
  if (rating >= 7) return 'text-yellow-500';
  return 'text-slate-400';
};

// Helper to normalize streaming platforms
const getNormalizedPlatforms = (show: Show) => {
  const showWithStreaming = show as any;
  
  const streamingSources = [
    ...(show.streamingPlatforms || []),
    ...(showWithStreaming.streaming || []),
    ...(show.streaming_platforms || [])
  ];
  
  const seen = new Set<string>();
  return streamingSources
    .map((p, i) => ({
      provider_id: p.provider_id ?? i + 1,
      provider_name: p.provider_name || p.name || `Platform ${i + 1}`,
      logo_path: p.logo_path || null
    }))
    .filter(p => {
      const key = `${p.provider_id}-${p.provider_name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

// Loading skeleton for spotlight layout
function SpotlightSkeleton() {
  return (
    <Card className="bg-slate-900 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative h-80 animate-pulse">
          <div className="absolute inset-0 bg-slate-700"></div>
          <div className="relative z-10 p-8 h-full flex flex-col justify-center">
            <div className="mb-4">
              <div className="bg-slate-600 h-5 w-24"></div>
            </div>
            <div className="bg-slate-600 h-10 w-64 mb-4"></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-slate-600 h-4 w-20"></div>
              <div className="bg-slate-600 h-4 w-12"></div>
              <div className="bg-slate-600 h-4 w-16"></div>
            </div>
            <div className="bg-slate-600 h-12 w-32"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const EnhancedShowCard: React.FC<EnhancedShowCardProps> = ({
  show,
  layout = "vertical",
  actions = { watchNow: true, trailer: true, addToList: true },
  showStreamingLogos = true,
  onAddToWatchlist,
  onWatchTrailer,
  onCardClick,
  onShareContent,
  onWatchNow,
  size = 'md',
  genreMap,
  variant // Legacy support
}) => {
  if (!show) return layout === "spotlight" ? <SpotlightSkeleton /> : null;

  const title = show.title || show.name || 'Unknown Title';
  const releaseDate = show.release_date || show.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "Unknown";
  const rating = show.vote_average ? show.vote_average.toFixed(1) : "N/A";
  const isUpcoming = releaseDate && new Date(releaseDate) > new Date();

  const posterUrl = show.poster_path ? `https://image.tmdb.org/t/p/w342${show.poster_path}` : null;
  const backdropUrl = show.backdrop_path ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` : posterUrl;

  const providers = getNormalizedPlatforms(show);
  const genresToShow = show.genre_ids?.slice(0, 2) || [];

  // Event handlers
  const handleCardClick = () => onCardClick?.(show);
  const handleAddToWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToWatchlist) {
      onAddToWatchlist(show);
    } else {
      // Default watchlist implementation
      try {
        const response = await fetch('/api/watchlist/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: show.id,
            title: title,
            poster_path: show.poster_path,
            media_type: show.media_type || 'tv',
            vote_average: show.vote_average,
            overview: show.overview
          }),
          credentials: 'include'
        });
        
        if (response.ok) {
          console.log(`Added "${title}" to watchlist!`);
        } else {
          console.error('Failed to add to watchlist');
        }
      } catch (error) {
        console.error('Error adding to watchlist:', error);
      }
    }
  };

  const handleWatchTrailer = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWatchTrailer?.(show);
  };

  const handleWatchNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWatchNow) {
      onWatchNow(show);
    } else {
      console.log(`Watch Now: ${title}`);
    }
  };

  const handleShareContent = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShareContent?.(show);
  };

  // SPOTLIGHT LAYOUT - Hero/featured banner
  if (layout === "spotlight") {
    return (
      <Card className="bg-slate-900 overflow-hidden group hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-0">
          <div className="relative h-[360px] overflow-hidden group rounded-lg">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-600 z-0"></div>

            {/* Backdrop */}
            {backdropUrl && (
              <img
                src={backdropUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  if (show.backdrop_path && show.poster_path && !e.currentTarget.src.includes(show.poster_path)) {
                    e.currentTarget.src = `https://image.tmdb.org/t/p/w780${show.poster_path}`;
                  } else {
                    e.currentTarget.style.display = "none";
                  }
                }}
              />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 z-10"></div>

            {/* Content */}
            <div className="relative z-20 flex h-full items-center p-8 gap-6" onClick={handleCardClick}>
              {/* Small Poster */}
              {posterUrl && (
                <img
                  src={posterUrl}
                  alt={`${title} Poster`}
                  className="w-28 md:w-36 h-auto object-contain rounded-lg shadow-lg flex-shrink-0 z-20"
                />
              )}

              {/* Text & Buttons */}
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-4xl font-bold text-white mb-4">{title}</h2>

                <div className="flex flex-wrap items-center gap-2 mb-4 text-sm text-gray-300">
                  <span>{show.media_type === "tv" ? "TV Series" : "Movie"}</span>
                  <span>•</span>
                  <span>{year}</span>
                  <span>•</span>
                  <span>⭐ {rating}</span>
                </div>

                <p className="text-gray-200 mb-6 max-w-2xl text-base leading-relaxed">
                  {show.overview || "No description available."}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-4">
                  {actions.watchNow && (
                    <button 
                      onClick={handleWatchNow}
                      className="bg-white text-black px-6 py-3 font-medium flex items-center gap-2 hover:bg-gray-200 hover:scale-105 transition-all duration-200 rounded shadow-lg hover:shadow-xl"
                    >
                      <Play className="w-5 h-5" />
                      {providers.length > 0 ? (
                        <span className="flex items-center gap-2">
                          Watch Now On
                          <StreamingLogos 
                            providers={[providers[0]]}
                            size="sm"
                            maxDisplayed={1}
                          />
                        </span>
                      ) : (
                        'Watch Now'
                      )}
                    </button>
                  )}

                  {actions.trailer && (
                    <TrailerButton 
                      show={{
                        id: show.id,
                        tmdbId: show.id,
                        title: title
                      }}
                      variant="secondary"
                      className="bg-gray-700/80 text-white px-6 py-3 font-medium hover:bg-gray-600 hover:scale-105 transition-all duration-200 rounded shadow-lg hover:shadow-xl backdrop-blur-sm border-none"
                      showLabel={true}
                    />
                  )}

                  {actions.addToList && (
                    <button 
                      onClick={handleAddToWatchlist}
                      className="bg-gray-700/80 text-white px-6 py-3 font-medium flex items-center gap-2 hover:bg-gray-600 hover:scale-105 transition-all duration-200 rounded shadow-lg hover:shadow-xl backdrop-blur-sm"
                    >
                      <Plus className="w-5 h-5" />
                      Add to List
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // HORIZONTAL LAYOUT - Continue watching / list rows
  if (layout === "horizontal") {
    return (
      <Card 
        className="group overflow-hidden cursor-pointer border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-lg"
        onClick={handleCardClick}
      >
        <CardContent className="p-0">
          <div className="flex items-center">
            {posterUrl && (
              <img
                src={posterUrl}
                alt={title}
                className="w-24 h-36 object-cover rounded-l-lg flex-shrink-0"
                loading="lazy"
              />
            )}
            <div className="p-4 flex-1">
              <h3 className="text-lg font-semibold text-white mb-2 truncate">
                {title}
              </h3>
              <div className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                <span>{year}</span>
                <span>•</span>
                <span className={getRatingColor(parseFloat(rating))}>⭐ {rating}</span>
                {isUpcoming && (
                  <>
                    <span>•</span>
                    <span className="text-yellow-400">Upcoming</span>
                  </>
                )}
              </div>
              
              {/* Streaming logos */}
              {showStreamingLogos && providers.length > 0 && (
                <div className="mb-3">
                  <StreamingLogos providers={providers} size="sm" maxDisplayed={1} />
                </div>
              )}

              <div className="flex gap-2">
                {actions.watchNow && (
                  <Button size="sm" onClick={handleWatchNow} className="bg-white text-black hover:bg-gray-200">
                    <Play className="w-4 h-4 mr-1" />
                    {providers.length > 0 ? (
                      <span className="flex items-center gap-1">
                        Watch On
                        <StreamingLogos 
                          providers={[providers[0]]}
                          size="sm"
                          maxDisplayed={1}
                        />
                      </span>
                    ) : (
                      'Watch'
                    )}
                  </Button>
                )}
                {actions.addToList && (
                  <Button size="sm" variant="ghost" onClick={handleAddToWatchlist} className="text-slate-300 hover:text-white hover:bg-slate-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                )}
                {actions.trailer && (
                  <Button size="sm" variant="ghost" onClick={handleWatchTrailer} className="text-slate-300 hover:text-white hover:bg-slate-700">
                    <Clapperboard className="w-4 h-4 mr-1" />
                    Trailer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // VERTICAL LAYOUT - Default grid/carousel style
  return (
    <Card 
      className="group overflow-hidden cursor-pointer border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-lg h-full flex flex-col"
      onClick={handleCardClick}
    >
      <CardContent className="p-0 h-full flex flex-col">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={`Poster for ${title}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-2 left-2 right-2">
              {show.vote_average && (
                <div className={`flex items-center gap-1 mb-2 ${getRatingColor(show.vote_average)}`}>
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs font-medium text-white">{show.vote_average.toFixed(1)}</span>
                </div>
              )}
              {isUpcoming && (
                <div className="flex items-center gap-1 text-yellow-400 mb-1">
                  <Calendar className="w-3 h-3" />
                  <span className="text-xs">Upcoming</span>
                </div>
              )}
            </div>
          </div>

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button size="sm" className="bg-white/90 text-black hover:bg-white">
              <Play className="w-4 h-4 mr-1" />
              {providers.length > 0 ? (
                <span className="flex items-center gap-1">
                  Watch On
                  <StreamingLogos 
                    providers={[providers[0]]}
                    size="sm"
                    maxDisplayed={1}
                  />
                </span>
              ) : (
                'Watch'
              )}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 flex-1 flex flex-col">
          <div className="space-y-2 flex-1">
            <h3 className="font-semibold text-sm line-clamp-2 leading-tight text-white">{title}</h3>

            {/* Year and rating */}
            <div className="text-xs text-gray-400">
              {year} • ⭐ {rating}
            </div>

            {/* Genres */}
            {genresToShow.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {genresToShow.map(genreId => (
                  <Badge
                    key={genreId}
                    variant="outline"
                    className="text-xs px-1.5 py-0.5 border-slate-600 text-slate-300"
                  >
                    {genreMap?.[genreId] || GENRE_NAMES[genreId] || `Genre ${genreId}`}
                  </Badge>
                ))}
              </div>
            )}

            {/* Streaming */}
            {showStreamingLogos && providers.length > 0 && (
              <div className="mb-1">
                <StreamingLogos providers={providers} size="sm" maxDisplayed={1} />
              </div>
            )}

            {/* Overview for detailed variant */}
            {(variant === 'detailed' || layout === 'vertical') && show.overview && (
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{show.overview}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/50">
            <div className="flex gap-1">
              {actions.addToList && (
                <Button size="sm" variant="ghost" onClick={handleAddToWatchlist} className="text-xs px-2 py-1 h-auto text-slate-300 hover:text-white hover:bg-slate-700">
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              )}
              {actions.trailer && (
                <Button size="sm" variant="ghost" onClick={handleWatchTrailer} className="text-xs px-2 py-1 h-auto text-slate-300 hover:text-white hover:bg-slate-700">
                  <Clapperboard className="w-3 h-3 mr-1" />
                  Trailer
                </Button>
              )}
              {actions.share && onShareContent && (
                <Button size="sm" variant="ghost" onClick={handleShareContent} className="text-xs px-2 py-1 h-auto text-slate-300 hover:text-white hover:bg-slate-700">
                  <Share2 className="w-3 h-3 mr-1" />
                  Share
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedShowCard;
