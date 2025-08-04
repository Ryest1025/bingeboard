
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, Check, Share, Eye, Heart, ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { useRecommendationActions } from "@/hooks/useRecommendationActions";
import { useQuickFeedback } from "@/components/common/UserFeedback";

export interface Show {
  tmdbId: number;
  title: string;
  overview?: string;
  posterPath?: string;
  rating?: string | number;
  streamingPlatforms?: Array<{ 
    provider_id: number; 
    provider_name: string; 
    logo_path?: string 
  }>;
  hasTrailer?: boolean;
  trailerKey?: string;
  trailerUrl?: string;
}

export interface RecommendationCardProps {
  show: Show;
  isInWatchlist?: boolean;
  isSeen?: boolean;
  // Optional custom handlers (if you need to override the default behavior)
  customActions?: {
    onAddToWatchlist?: (tmdbId: number) => void;
    onMarkAsSeen?: (tmdbId: number) => void;
    onShare?: (tmdbId: number) => void;
    onPlayTrailer?: (trailerUrl: string) => void;
  };
  // Style variants
  variant?: 'default' | 'compact' | 'large';
  // Optional click tracking
  onInteraction?: (action: string, tmdbId: number) => void;
}

export default function RecommendationCard({
  show,
  isInWatchlist = false,
  isSeen = false,
  customActions,
  variant = 'default',
  onInteraction,
}: RecommendationCardProps) {
  const [hovered, setHovered] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // Use centralized actions unless custom ones are provided
  const actions = useRecommendationActions({
    onSuccess: (action) => onInteraction?.(action, show.tmdbId),
  });

  // Quick feedback functionality
  const { submitQuickFeedback, isSubmitting } = useQuickFeedback();

  const handleAddToWatchlist = () => {
    if (customActions?.onAddToWatchlist) {
      customActions.onAddToWatchlist(show.tmdbId);
    } else {
      actions.addToWatchlist(show.tmdbId);
    }
  };

  const handleMarkAsSeen = () => {
    if (customActions?.onMarkAsSeen) {
      customActions.onMarkAsSeen(show.tmdbId);
    } else {
      actions.markAsSeen(show.tmdbId);
    }
  };

  const handleShare = () => {
    if (customActions?.onShare) {
      customActions.onShare(show.tmdbId);
    } else {
      actions.share(show.tmdbId);
    }
  };

  const handleQuickFeedback = (feedbackType: 'like' | 'dislike' | 'love' | 'recommend') => {
    submitQuickFeedback({
      contentId: show.tmdbId,
      contentType: 'movie', // You might want to determine this based on the show data
      feedbackType,
      rating: feedbackType === 'love' ? 9 : feedbackType === 'like' ? 7 : feedbackType === 'recommend' ? 8 : 3
    });
    onInteraction?.(feedbackType, show.tmdbId);
  };

  const handlePlayTrailer = () => {
    if (customActions?.onPlayTrailer && show.trailerUrl) {
      customActions.onPlayTrailer(show.trailerUrl);
    } else if (show.trailerUrl) {
      actions.playTrailer(show.trailerUrl);
    }
  };

  const handlePosterClick = () => {
    window.location.href = `/show/${show.tmdbId}`;
    onInteraction?.('navigate', show.tmdbId);
  };

  // Style variants
  const getCardStyles = () => {
    const baseStyles = "recommendation-card glass-effect border-white/10 flex-shrink-0 transition-all duration-300 hover:scale-105 cursor-pointer group";
    
    switch (variant) {
      case 'compact':
        return `${baseStyles} w-36 md:w-40`;
      case 'large':
        return `${baseStyles} w-52 md:w-56`;
      default:
        return `${baseStyles} w-44 md:w-48`;
    }
  };

  const getImageHeight = () => {
    switch (variant) {
      case 'compact':
        return 'h-48';
      case 'large':
        return 'h-80';
      default:
        return 'h-64';
    }
  };

  return (
    <Card
      className={getCardStyles()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <CardContent className="p-0">
        <div className="relative" onClick={handlePosterClick} role="button" tabIndex={-1}>
          {show.posterPath ? (
            <img
              src={show.posterPath}
              alt={`${show.title} poster`}
              className={`w-full ${getImageHeight()} object-cover rounded-t-lg`}
            />
          ) : (
            <div className={`w-full ${getImageHeight()} bg-binge-gray rounded-t-lg flex items-center justify-center`}>
              <Play className="w-12 h-12 text-gray-400" />
            </div>
          )}
          {/* Quick Actions Overlay */}
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
                onClick={handleAddToWatchlist}
                disabled={isInWatchlist || actions.isLoading.addToWatchlist}
              >
                {isInWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </Button>
              {show.hasTrailer && show.trailerUrl && (
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  title="Play Trailer"
                  onClick={handlePlayTrailer}
                >
                  <Play className="w-5 h-5" />
                </Button>
              )}
              <Button
                size="icon"
                variant={isSeen ? "secondary" : "outline"}
                className="rounded-full"
                title={isSeen ? "Seen" : "Mark as Seen"}
                onClick={handleMarkAsSeen}
                disabled={isSeen || actions.isLoading.markAsSeen}
              >
                <Eye className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Quick Feedback Row */}
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="outline"
                className="rounded-full h-8 w-8 text-pink-500 hover:bg-pink-500/20"
                title="Love It"
                onClick={() => handleQuickFeedback('love')}
                disabled={isSubmitting}
              >
                <Heart className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="rounded-full h-8 w-8 text-green-500 hover:bg-green-500/20"
                title="Like It"
                onClick={() => handleQuickFeedback('like')}
                disabled={isSubmitting}
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="rounded-full h-8 w-8 text-yellow-500 hover:bg-yellow-500/20"
                title="Recommend"
                onClick={() => handleQuickFeedback('recommend')}
                disabled={isSubmitting}
              >
                <Star className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="rounded-full h-8 w-8"
                title="Share"
                onClick={handleShare}
              >
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-semibold mb-1 truncate cursor-pointer hover:text-binge-purple transition-colors" onClick={handlePosterClick}>
            {show.title}
          </h3>
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
