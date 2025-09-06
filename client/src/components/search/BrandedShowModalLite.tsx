// components/search/BrandedShowModalLite.tsx - Lightweight modal for A/B testing (mobile/App Store friendly)
import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, ExternalLink, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useShowDetails from '@/hooks/useShowDetails';
import useTrailer from '@/hooks/useTrailer';
import { StreamingPlatformsDisplay } from '@/components/streaming/StreamingPlatformsDisplay';
import { useDashboardFilters } from '@/components/dashboard/filters/DashboardFilterProvider';
import { colors, gradients, radii, shadows } from '@/styles/tokens';
import { useModalVariant } from '@/context/ModalVariantContext';
import { trackEvent } from '@/lib/analytics';

interface Props {
  showId: string | null;
  showType: string;
  open: boolean;
  onClose: () => void;
  onAddToWatchlist?: (showId: number) => void;
  onWatchNow?: (show: any) => void;
}

export default function BrandedShowModalLite({
  showId,
  showType = 'movie',
  open,
  onClose,
  onAddToWatchlist,
  onWatchNow,
}: Props) {
  const [showTrailer, setShowTrailer] = useState(false);
  const queryClient = useQueryClient();
  const { activePlatforms, preferredGenres, userMood } = useDashboardFilters();
  const { data: show, isLoading } = useShowDetails(showId, showType);
  const { data: trailerData, isLoading: loadingTrailer } = useTrailer(show ? show.id : null, showType, show?.title);
  const { variant } = useModalVariant();

  const addToWatchlistMutation = useMutation({
    mutationFn: async (sid: number) => {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showId: sid }),
      });
      if (!response.ok) throw new Error('Failed to add to watchlist');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  const handleAddToWatchlist = () => {
    if (show) {
      addToWatchlistMutation.mutate(parseInt(show.id));
      onAddToWatchlist?.(parseInt(show.id));
  trackEvent('watchlist_add', { showId: show.id, showTitle: show.title, variant });
    }
  };

  const prioritizedPlatforms = useMemo(() => {
    if (!show?.streaming) return [];
    const activeSet = new Set(activePlatforms);
    return [...show.streaming].sort((a: any, b: any) => {
      const aActive = activeSet.has(a.provider_name);
      const bActive = activeSet.has(b.provider_name);
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      return 0;
    });
  }, [show?.streaming, activePlatforms]);

  const matchesUserFilters = useMemo(() => {
    if (!show) return false;
    // We currently don't have mood tags on ShowDetails; treat mood always matching until tagging is added
    const moodMatch = true;
    const genreMatch = preferredGenres.length === 0 || (show as any).genres?.some?.((g: any) => preferredGenres.includes(g.name || g));
    const platformMatch = activePlatforms.length === 0 || (show as any).streaming?.some?.((p: any) => activePlatforms.includes(p.provider_name));
    return moodMatch && genreMatch && platformMatch;
  }, [show, preferredGenres, activePlatforms]);

  // Fire modal_open when it becomes visible with a show
  useEffect(() => {
    if (open && show) {
      trackEvent('modal_open', { showId: show.id, showTitle: show.title, variant });
    }
  }, [open, show, variant]);

  const handleWatchTrailer = () => {
    setShowTrailer(true);
    if (show) {
      trackEvent('watch_trailer', { showId: show.id, showTitle: show.title, variant });
    }
  };

  const handleWatchNow = () => {
    if (show) {
      onWatchNow?.(show);
      trackEvent('watch_click', { showId: show.id, showTitle: show.title, variant });
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent
        className="max-w-4xl p-0 border-0 overflow-hidden"
        style={{ backgroundColor: colors.background, borderRadius: radii['2xl'], boxShadow: shadows['2xl'] }}
      >
  {/* TODO: Add explicit platform redirect buttons to enable 'platform_redirect' analytics in lite variant */}
        <AnimatePresence>
          {isLoading || !show ? (
            <div className="p-8 text-center">Loading...</div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="relative">
                {show.backdrop && (
                  <div
                    className="h-64 bg-cover bg-center"
                    style={{ backgroundImage: `url(${show.backdrop})`, borderRadius: `${radii['2xl']} ${radii['2xl']} 0 0` }}
                  />
                )}
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/50">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">{show.title}</DialogTitle>
                  {matchesUserFilters && <Badge variant="outline">Matches your filters</Badge>}
                  <DialogDescription>{show.synopsis}</DialogDescription>
                </DialogHeader>

                {show.genres?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {show.genres.map((g: any) => (
                      <Badge key={g.id || g} variant="secondary">{g.name || g}</Badge>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button size="lg" onClick={handleWatchTrailer} style={{ background: gradients.primary }}>
                    <Play className="w-5 h-5" /> Watch Trailer
                  </Button>
                  <Button size="lg" variant="secondary" onClick={handleAddToWatchlist} disabled={addToWatchlistMutation.isPending}>
                    <Heart className="w-5 h-5" /> {addToWatchlistMutation.isPending ? 'Adding...' : 'Add to Watchlist'}
                  </Button>
                  <Button size="lg" variant="outline" onClick={handleWatchNow}>
                    <ExternalLink className="w-5 h-5" /> Watch Now
                  </Button>
                </div>

                {prioritizedPlatforms.length > 0 && (
                  <div className="pt-4 border-t border-gray-700">
                    <h4 className="font-semibold mb-2">Available on</h4>
                    <StreamingPlatformsDisplay
                      platforms={prioritizedPlatforms}
                      onPlatformClick={(p:any) => {
                        if (show) {
                          trackEvent('platform_redirect', { showId: show.id, showTitle: show.title, platform: p.provider_name, variant });
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Dialog open={showTrailer} onOpenChange={setShowTrailer}>
          <DialogContent className="max-w-3xl p-0 border-0 bg-black">
            {loadingTrailer ? (
              <div className="flex items-center justify-center h-64">Loading trailer...</div>
            ) : trailerData?.primaryTrailer?.embeddableUrl ? (
              <iframe
                src={trailerData.primaryTrailer.embeddableUrl}
                title="Trailer"
                allow="autoplay; encrypted-media"
                allowFullScreen
                loading="lazy"
                className="w-full aspect-video"
              />
            ) : (
              <div className="p-6 text-center">No trailer available</div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
