// Enhanced show details with comprehensive streaming data
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Plus, Star, Calendar, Clock, ExternalLink, X } from 'lucide-react';
import { getStreamingPlatforms, getStreamingLogo } from '@/utils/show-utils';
import { StreamingPlatformsDisplay } from '@/components/streaming/StreamingPlatformsDisplay';

const fetchEnhancedShowDetails = async (id: number, type: 'tv' | 'movie', title: string) => {
  const response = await fetch(`/api/streaming/comprehensive/${type}/${id}?title=${encodeURIComponent(title)}&includeAffiliate=true`);

  if (!response.ok) {
    throw new Error('Failed to fetch enhanced show details');
  }

  return response.json();
};

interface ShowDetailsModalProps {
  show: any;
  isOpen: boolean;
  onClose: () => void;
  onAddToWatchlist?: (showId: number) => void;
  onWatchNow?: (show: any) => void;
}

export function ShowDetailsModal({ show, isOpen, onClose, onAddToWatchlist, onWatchNow }: ShowDetailsModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && show) {
      fetchShowDetails();
    }
  }, [isOpen, show]);

  const fetchShowDetails = async () => {
    if (!show) return;

    setLoading(true);
    try {
      const mediaType = show.media_type || (show.title ? 'movie' : 'tv');
      const response = await fetch(`/api/tmdb/${mediaType}/${show.id}`);
      if (response.ok) {
        const data = await response.json();
        setDetails(data);
      }
    } catch (error) {
      console.error('Failed to fetch show details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const title = show.title || show.name || 'Unknown Title';
  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : null;
  const backdropUrl = (details?.backdrop_path || show.backdrop_path)
    ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path || show.backdrop_path}`
    : null;

  const releaseDate = details?.release_date || details?.first_air_date || show.release_date || show.first_air_date;
  const rating = details?.vote_average || show.vote_average;
  const runtime = details?.runtime || details?.episode_run_time?.[0];
  const genres = details?.genres || [];
  const overview = details?.overview || show.overview;

  const streamingPlatforms = getStreamingPlatforms(details || show);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        {/* Header with backdrop */}
        <div className="relative -m-6 mb-4">
          {backdropUrl && (
            <div className="relative h-64 overflow-hidden rounded-t-lg">
              <img
                src={backdropUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
            </div>
          )}

          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex gap-6">
          {/* Poster */}
          <div className="flex-shrink-0">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={title}
                className="w-48 h-72 object-cover rounded-lg"
              />
            ) : (
              <div className="w-48 h-72 bg-slate-700 rounded-lg flex items-center justify-center">
                <Play className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-bold text-white mb-2">{title}</DialogTitle>

              {/* Meta info */}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                {releaseDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(releaseDate).getFullYear()}
                  </div>
                )}
                {rating && rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {rating.toFixed(1)}
                  </div>
                )}
                {runtime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {runtime}m
                  </div>
                )}
                {show.media_type && (
                  <Badge variant="outline" className="text-gray-400 border-gray-600">
                    {show.media_type === 'tv' ? 'TV Series' : 'Movie'}
                  </Badge>
                )}
              </div>
            </DialogHeader>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre: any) => (
                    <Badge key={genre.id} variant="secondary" className="bg-slate-700 text-gray-300">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Overview */}
            {overview && (
              <div className="mb-6">
                <p className="text-gray-300 leading-relaxed">{overview}</p>
              </div>
            )}

            {/* Streaming Platforms */}
            {streamingPlatforms.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Available on:</h4>
                <StreamingPlatformsDisplay platforms={streamingPlatforms} />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => onWatchNow?.(show)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Now
              </Button>

              <Button
                variant="outline"
                onClick={() => onAddToWatchlist?.(show.id)}
                className="border-gray-600 text-gray-300 hover:bg-slate-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Watchlist
              </Button>

              <Button
                variant="ghost"
                onClick={() => window.open(`/show/${show.id}`, '_blank')}
                className="text-gray-400 hover:text-white hover:bg-slate-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Full Details
              </Button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
