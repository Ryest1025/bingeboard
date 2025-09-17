import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Plus, Star, X, ExternalLink } from 'lucide-react';
import type { Show } from '@/lib/utils';
import {
  getShowTitle,
  getShowPosterUrl,
  getShowOverview,
  getShowRating,
  getStreamingPlatforms,
} from '@/utils/show-utils';

interface RecommendationModalProps {
  show: Show | null;
  open: boolean;
  onClose: () => void;
  onAddToList?: (show: Show) => void;
  onWatchNow?: (show: Show) => void;
}

export default function RecommendationModal({
  show,
  open,
  onClose,
  onAddToList,
  onWatchNow,
}: RecommendationModalProps) {
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);

  if (!show) return null;

  const title = getShowTitle(show);
  const poster = getShowPosterUrl(show);
  const overview = getShowOverview(show);
  const rating = getShowRating(show);
  const streamingPlatforms = getStreamingPlatforms(show);

  const handleWatchNow = () => {
    if (onWatchNow) {
      onWatchNow(show);
    }
    onClose();
  };

  const handleAddToList = () => {
    if (onAddToList) {
      onAddToList(show);
    }
  };

  const handleTrailerClick = () => {
    setTrailerModalOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl bg-slate-900 text-white border border-slate-700">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-white mb-2">
                {title}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex flex-col lg:flex-row gap-6">
            <img
              src={poster || '/placeholder.jpg'}
              alt={title}
              className="w-full lg:w-1/3 rounded-lg object-cover"
            />

            <div className="flex flex-col gap-4 lg:w-2/3">
              <p className="text-gray-300 text-sm line-clamp-6">
                {overview || 'No description available'}
              </p>

              <div className="flex items-center gap-4 flex-wrap">
                <Button
                  className="bg-cyan-600 hover:bg-cyan-700"
                  onClick={handleWatchNow}
                >
                  <Play className="w-4 h-4 mr-2" /> Watch Now
                </Button>

                <Button
                  variant="outline"
                  className="border-slate-600 text-white hover:border-slate-400"
                  onClick={handleAddToList}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add to List
                </Button>

                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={handleTrailerClick}
                >
                  <Play className="w-4 h-4 mr-2" /> Trailer
                </Button>
              </div>

              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <Star className="w-4 h-4" />
                <span>{rating || 'N/A'}</span>
              </div>

              <div className="text-sm text-gray-400">
                Genre:{' '}
                {show.genre_ids
                  ?.map((id: number) => `Genre ${id}`)
                  .join(', ') || 'Unknown'}
              </div>

              {/* Streaming Platforms */}
              {streamingPlatforms && streamingPlatforms.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-300">
                    Available on:
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {streamingPlatforms
                      .slice(0, 6)
                      .map((platform: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2"
                        >
                          {platform.logo_path && (
                            <img
                              src={`https://image.tmdb.org/t/p/w45${platform.logo_path}`}
                              alt={platform.provider_name}
                              className="w-5 h-5 rounded"
                            />
                          )}
                          <span className="text-xs text-gray-300">
                            {platform.provider_name}
                          </span>
                          {platform.link && (
                            <ExternalLink className="w-3 h-3 text-gray-500" />
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trailer Modal */}
      <Dialog open={trailerModalOpen} onOpenChange={setTrailerModalOpen}>
        <DialogContent className="max-w-4xl bg-slate-900 text-white border border-slate-700">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-white">
                {title} - Trailer
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTrailerModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
            {/* Placeholder for trailer video */}
            <div className="text-center text-gray-400">
              <Play className="w-12 h-12 mx-auto mb-2" />
              <p>Trailer would load here</p>
              <p className="text-sm">(Integration with video API needed)</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
