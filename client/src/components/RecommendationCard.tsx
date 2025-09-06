
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, Check, Share, Eye } from "lucide-react";

interface RecommendationCardProps {
  show: {
    tmdbId: number;
    title: string;
    overview?: string;
    posterPath?: string;
    rating?: string | number;
    streamingPlatforms?: Array<{ provider_id: number; provider_name: string; logo_path?: string }>;
    hasTrailer?: boolean;
    trailerKey?: string;
    trailerUrl?: string;
  };
  onAddToWatchlist?: (tmdbId: number) => void;
  onMarkAsSeen?: (tmdbId: number) => void;
  onShare?: (tmdbId: number) => void;
  onPlayTrailer?: (trailerUrl: string) => void;
  onInteraction?: (action: string, tmdbId: number) => void;
  isInWatchlist?: boolean;
  isSeen?: boolean;
  variant?: 'default' | 'compact';
}

export default function RecommendationCard({
  show,
  onAddToWatchlist,
  onMarkAsSeen,
  onShare,
  onPlayTrailer,
  onInteraction,
  isInWatchlist = false,
  isSeen = false,
  variant = 'default',
}: RecommendationCardProps) {
  const [hovered, setHovered] = useState(false);

  const handlePosterClick = () => {
    window.location.href = `/show/${show.tmdbId}`;
  };

  return (
    <Card
      className="recommendation-card glass-effect border-white/10 flex-shrink-0 w-44 md:w-48 transition-all duration-300 hover:scale-105 cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <CardContent className="p-0">
        <div
          className="relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--bb-focus-ring)]"
          onClick={handlePosterClick}
          role="button"
          tabIndex={0}
          aria-label={`Open details for ${show.title}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handlePosterClick();
            }
          }}
        >
          {show.posterPath ? (
            <img
              src={show.posterPath}
              alt={`${show.title} poster`}
              className="w-full h-64 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-64 bg-binge-gray rounded-t-lg flex items-center justify-center">
              <Play className="w-12 h-12 text-gray-400" />
            </div>
          )}
          {/* Quick Actions Overlay - Only show for default variant (authorized users) */}
          {variant === 'default' && (
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 rounded-t-lg transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none md:group-hover:opacity-100 md:pointer-events-auto'}`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant={isInWatchlist ? "secondary" : "outline"}
                  className="rounded-full"
                  title={isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
                  onClick={() => onAddToWatchlist && onAddToWatchlist(show.tmdbId)}
                  disabled={isInWatchlist}
                >
                  {isInWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </Button>
                {show.hasTrailer && show.trailerUrl && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full"
                    title="Play Trailer"
                    onClick={() => onPlayTrailer && onPlayTrailer(show.trailerUrl!)}
                  >
                    <Play className="w-5 h-5" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant={isSeen ? "secondary" : "outline"}
                  className="rounded-full"
                  title={isSeen ? "Seen" : "Mark as Seen"}
                  onClick={() => onMarkAsSeen && onMarkAsSeen(show.tmdbId)}
                  disabled={isSeen}
                >
                  <Eye className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  title="Share"
                  onClick={() => onShare && onShare(show.tmdbId)}
                >
                  <Share className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="p-3">
          <button
            type="button"
            className="font-semibold mb-1 truncate cursor-pointer hover:text-binge-purple transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--bb-focus-ring)]"
            onClick={handlePosterClick}
            aria-label={`Open details for ${show.title}`}
          >
            {show.title}
          </button>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400 font-medium">
              {show.rating ? <>{show.rating}★</> : null}
            </span>
            {/* Streaming Platforms */}
            {show.streamingPlatforms && show.streamingPlatforms.length > 0 && (
              <div className="flex items-center space-x-1">
                {show.streamingPlatforms.slice(0, 2).map((platform, idx) => (
                  <div key={idx} className="w-6 h-4 rounded bg-white p-0.5 flex-shrink-0">
                    {platform.logo_path ? (
                      <img src={platform.logo_path} alt={platform.provider_name} className="w-full h-full object-contain rounded" />
                    ) : (
                      <span className="text-[7px] font-bold text-gray-700">{platform.provider_name?.charAt(0) || '?'}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
