// components/search/BrandedShowModal.tsx - BingeBoard Branded Show Modal
// TODO (A/B Experiment Prep): Once all redesigned pages are finalized, wire an experiment toggle
// to switch between this full modal and BrandedShowModalLite across Dashboard & Discover.
// Include instrumentation: modal_open, watchlist_add, watch_click with { variant: 'full' | 'lite' }.
// Ensure DashboardFilterProvider wraps routes before enabling Lite variant globally.
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Clock, Play, Plus, ExternalLink, X, Heart, Bell, BellOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// @ts-ignore - react-player types sometimes mismatch default export in our build setup
import ReactPlayer from "react-player";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useShowDetails from "@/hooks/useShowDetails";
import { useUserActions } from "@/hooks/useUserActions";
import { colors, gradients, radii, spacing, shadows } from "@/styles/tokens";
import useTrailer from '@/hooks/useTrailer';
import { StreamingPlatformsDisplay } from '@/components/streaming/StreamingPlatformsDisplay';
import { trackEvent } from '@/lib/analytics';

const fetchEnhancedShowDetails = async (id: number, type: 'tv' | 'movie', title: string) => {
  const response = await fetch(`/api/streaming/comprehensive/${type}/${id}?title=${encodeURIComponent(title)}&includeAffiliate=true`);

  if (!response.ok) {
    throw new Error('Failed to fetch enhanced show details');
  }

  return response.json();
};

interface Props {
  showId: string | null;
  showType: string;
  open: boolean;
  onClose: () => void;
  onAddToWatchlist?: (showId: number) => void;
  onWatchNow?: (show: any) => void;
  // Optional editorial/contextual reason to display in the modal
  reason?: string;
}

export default function BrandedShowModal({
  showId,
  showType = 'movie',
  open,
  onClose,
  onAddToWatchlist,
  onWatchNow,
  reason,
}: Props) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const queryClient = useQueryClient();
  
  // Enhanced user actions with optimistic updates
  const { addToList, removeFromList, toggleRemind, isInList, isReminded } = useUserActions();

  const { data: show, isLoading } = useShowDetails(showId, showType);

  // Fire modal_open when it becomes visible with a show
  useEffect(() => {
    if (open && show) {
      trackEvent('modal_open', { showId: show.id, showTitle: show.title, variant: 'full' });
    }
  }, [open, show]);

  // Watchlist mutation with optimistic updates
  const addToWatchlistMutation = useMutation({
    mutationFn: async (showId: number) => {
      setIsAddingToWatchlist(true);
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showId }),
      });
      if (!response.ok) throw new Error('Failed to add to watchlist');
      return response.json();
    },
    onMutate: async (showId: number) => {
      await queryClient.cancelQueries({ queryKey: ['watchlist'] });
      const previousWatchlist = queryClient.getQueryData(['watchlist']);

      queryClient.setQueryData(['watchlist'], (old: any) => [
        ...(old || []),
        { id: showId, pending: true, title: show?.title }
      ]);

      return { previousWatchlist };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['watchlist'], context?.previousWatchlist);
    },
    onSettled: () => {
      setIsAddingToWatchlist(false);
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const handleAddToWatchlist = () => {
    if (show) {
      addToWatchlistMutation.mutate(parseInt(show.id));
      onAddToWatchlist?.(parseInt(show.id));
  trackEvent('watchlist_add', { showId: show.id, showTitle: show.title, variant: 'full' });
    }
  };

  // Trailer data via hook
  const { data: trailerData, isLoading: loadingTrailer } = useTrailer(
    show ? show.id : null,
    showType,
    show?.title
  );

  const handleWatchTrailer = () => {
    setShowTrailer(true);
    if (show) {
      trackEvent('watch_trailer', { showId: show.id, showTitle: show.title, variant: 'full' });
    }
  };

  const handleWatchNow = () => {
    if (show) {
      onWatchNow?.(show);
  trackEvent('watch_click', { showId: show.id, showTitle: show.title, variant: 'full' });
    }
  };

  const mainDescriptionId = showId ? `show-${showId}-description` : 'show-generic-description';

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent
        className="max-w-6xl p-0 border-0 overflow-hidden"
        style={{
          backgroundColor: colors.background,
          borderRadius: radii['2xl'],
          boxShadow: shadows['2xl'],
        }}
        aria-describedby={mainDescriptionId}
      >
        <AnimatePresence>
          {isLoading || !show ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 text-center"
            >
              <DialogHeader>
                <DialogTitle className="sr-only">Loading show details</DialogTitle>
                {/* Provide description node early so aria-describedby always points to an existing element */}
                <DialogDescription id={mainDescriptionId} className="sr-only">
                  Loading show details
                </DialogDescription>
              </DialogHeader>
              <div
                className="animate-spin w-12 h-12 border-4 rounded-full mx-auto mb-6"
                style={{
                  borderColor: colors.primary,
                  borderTopColor: 'transparent',
                }}
              />
              <p style={{ color: colors.textSecondary }}>Loading show details...</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Header with backdrop */}
              {show.backdrop && (
                <div
                  className="relative h-80 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${show.backdrop})`,
                    borderRadius: `${radii['2xl']} ${radii['2xl']} 0 0`,
                  }}
                >
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to bottom, transparent 0%, ${colors.background}40 50%, ${colors.background} 100%)`,
                      borderRadius: `${radii['2xl']} ${radii['2xl']} 0 0`,
                    }}
                  />

                  {/* Close button */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full transition-all duration-200 z-10"
                    aria-label="Close dialog"
                    title="Close"
                    style={{
                      backgroundColor: `${colors.background}80`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <X className="w-6 h-6" style={{ color: colors.text }} />
                  </motion.button>

                  {/* Title and metadata overlay */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="absolute bottom-8 left-8 right-8"
                  >
                    <DialogHeader>
                      <DialogTitle
                        className="text-4xl font-bold mb-4"
                        style={{
                          color: colors.text,
                          textShadow: `0 2px 10px ${colors.background}80`,
                        }}
                      >
                        {show.title}
                        {show.year && (
                          <span
                            className="text-2xl font-normal ml-3"
                            style={{ color: colors.textSecondary }}
                          >
                            ({show.year})
                          </span>
                        )}
                      </DialogTitle>
                      {/* Accessible description (Radix compliant) */}
                      <DialogDescription id={mainDescriptionId} className="sr-only">
                        {show.synopsis || 'Show details dialog'}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center gap-6 text-lg">
                      {show.vote_average > 0 && (
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span style={{ color: colors.text, fontWeight: 600 }}>
                            {show.vote_average.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {show.runtime && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5" style={{ color: colors.textSecondary }} />
                          <span style={{ color: colors.textSecondary }}>
                            {show.runtime} min
                          </span>
                        </div>
                      )}

                      {show.year && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" style={{ color: colors.textSecondary }} />
                          <span style={{ color: colors.textSecondary }}>
                            {show.year}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Content section */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Poster (if no backdrop) */}
                  {!show.backdrop && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="lg:col-span-1"
                    >
                      <img
                        src={show.poster || "/placeholder.png"}
                        alt={show.title}
                        className="w-full h-auto object-cover shadow-2xl"
                        style={{ borderRadius: radii.xl }}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />
                    </motion.div>
                  )}

                  {/* Details */}
                  <div className={`${!show.backdrop ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
                    {!show.backdrop && (
                      <DialogHeader>
                        <DialogTitle
                          className="text-3xl font-bold"
                          style={{ color: colors.text }}
                        >
                          {show.title}
                          {show.year && (
                            <span
                              className="text-xl font-normal ml-3"
                              style={{ color: colors.textSecondary }}
                            >
                              ({show.year})
                            </span>
                          )}
                        </DialogTitle>
                      </DialogHeader>
                    )}

                    {/* Overview */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                    >
                      <p
                        className="text-lg leading-relaxed"
                        style={{ color: colors.textSecondary }}
                      >
                        {show.synopsis}
                      </p>
                    </motion.div>

                    {/* Genres */}
                    {Array.isArray(show.genres) && show.genres.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                        className="flex flex-wrap gap-3"
                      >
                        {show.genres.map((raw: any) => {
                          const key = typeof raw === 'object' ? (raw.id ?? raw.name) : raw;
                          const label = typeof raw === 'object' ? (raw.name || raw.id) : raw;
                          return (
                            <Badge
                              key={key}
                              variant="secondary"
                              className="px-3 py-1 text-sm font-medium"
                              style={{
                                backgroundColor: colors.secondaryLight,
                                color: colors.text,
                                border: `1px solid ${colors.border}`,
                                borderRadius: radii.lg,
                              }}
                            >
                              {label}
                            </Badge>
                          );
                        })}
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.3 }}
                      className="flex flex-col sm:flex-row gap-4"
                    >
                      <Button
                        size="lg"
                        className="gap-3 text-lg font-semibold px-8 py-4 transition-all duration-200 hover:scale-105"
                        style={{
                          background: gradients.primary,
                          color: colors.text,
                          borderRadius: radii.xl,
                          boxShadow: shadows.glow,
                        }}
                        onClick={handleWatchTrailer}
                      >
                        <Play className="w-5 h-5" fill="currentColor" />
                        Watch Trailer
                      </Button>

                      <Button
                        size="lg"
                        variant="secondary"
                        className="gap-3 text-lg font-semibold px-8 py-4 transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: isInList(showId || '') ? (colors.primary + '20') : colors.backgroundCard,
                          color: isInList(showId || '') ? colors.primary : colors.text,
                          border: `1px solid ${colors.border}`,
                          borderRadius: radii.xl,
                        }}
                        onClick={async () => {
                          if (!showId) return;
                          if (isInList(showId)) {
                            await removeFromList(showId);
                          } else {
                            await addToList(showId, showType);
                            onAddToWatchlist?.(parseInt(showId));
                          }
                          if (show) {
                            // Only track adds to align with current analytics schema
                            if (!isInList(showId)) {
                              trackEvent('watchlist_add', {
                                showId: show.id,
                                showTitle: show.title,
                                variant: 'full'
                              });
                            }
                          }
                        }}
                      >
                        {isInList(showId || '') ? (
                          <Heart className="w-5 h-5 fill-current" />
                        ) : (
                          <Heart className="w-5 h-5" />
                        )}
                        {isInList(showId || '') ? 'In Watchlist' : 'Add to Watchlist'}
                      </Button>

                      {/* Reminder Button */}
                      <Button
                        size="lg"
                        variant="outline"
                        className="gap-3 text-lg font-semibold px-8 py-4 transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: isReminded(showId || '') ? (colors.accent + '20') : 'transparent',
                          borderColor: colors.border,
                          color: isReminded(showId || '') ? colors.accent : colors.textSecondary,
                          borderRadius: radii.xl,
                        }}
                        onClick={async () => {
                          if (!showId) return;
                          await toggleRemind(showId);
                          // No analytics event here yet; reserved for future schema
                        }}
                      >
                        {isReminded(showId || '') ? (
                          <BellOff className="w-5 h-5" />
                        ) : (
                          <Bell className="w-5 h-5" />
                        )}
                        {isReminded(showId || '') ? 'Reminder Set' : 'Remind Me'}
                      </Button>

                      <Button
                        size="lg"
                        variant="outline"
                        className="gap-3 text-lg font-semibold px-8 py-4 transition-all duration-200 hover:scale-105"
                        style={{
                          borderColor: colors.border,
                          color: colors.textSecondary,
                          borderRadius: radii.xl,
                        }}
                        onClick={handleWatchNow}
                      >
                        <ExternalLink className="w-5 h-5" />
                        Watch Now
                      </Button>
                    </motion.div>

                    {/* Streaming platforms with multi-API data */}
                    {show.streaming && show.streaming.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.3 }}
                        className="pt-6 border-t"
                        style={{ borderColor: colors.border }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4
                            className="text-lg font-semibold"
                            style={{ color: colors.text }}
                          >
                            Available on
                          </h4>
                          {show.streamingStats && (
                            <div className="flex gap-2 text-xs">
                              <span
                                className="px-2 py-1 rounded"
                                style={{
                                  backgroundColor: colors.success + '20',
                                  color: colors.success
                                }}
                              >
                                {show.streamingStats.freePlatforms} Free
                              </span>
                              <span
                                className="px-2 py-1 rounded"
                                style={{
                                  backgroundColor: colors.accent + '20',
                                  color: colors.accent
                                }}
                              >
                                {show.streamingStats.affiliatePlatforms} Affiliate
                              </span>
                            </div>
                          )}
                        </div>

                        <StreamingPlatformsDisplay platforms={show.streaming} />

                        {/* Multi-API source attribution */}
                        {show.streamingStats?.sources && (
                          <div className="mt-3 text-xs text-center">
                            <span style={{ color: colors.textMuted }}>
                              Data from: {Object.entries(show.streamingStats.sources)
                                .filter(([_, enabled]) => enabled)
                                .map(([source]) => source.toUpperCase())
                                .join(', ')}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Why we recommend this (editorial/contextual) */}
                    {reason && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.3 }}
                        role="note"
                        aria-label="Why we recommend this"
                      >
                        <div
                          className="mt-6 p-4"
                          style={{
                            backgroundColor: colors.backgroundCard,
                            border: `1px solid ${colors.border}`,
                            borderRadius: radii.lg,
                          }}
                        >
                          <h4 className="text-base font-semibold mb-1" style={{ color: colors.text }}>
                            Why we recommend this
                          </h4>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>
                            {reason}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trailer Modal */}
        <Dialog open={showTrailer} onOpenChange={setShowTrailer}>
          <DialogContent
            className="max-w-4xl p-0 border-0"
            style={{
              backgroundColor: colors.background,
              borderRadius: radii.xl,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative aspect-video"
            >
              {loadingTrailer && (
                <div className="flex items-center justify-center h-full" style={{ backgroundColor: colors.backgroundCard }}>
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
                    <p style={{ color: colors.textSecondary }}>Loading trailer...</p>
                  </div>
                </div>
              )}
              {!loadingTrailer && trailerData?.primaryTrailer ? (
                React.createElement(ReactPlayer as any, {
                  url: trailerData.primaryTrailer.url,
                  playing: true,
                  controls: true,
                  width: '100%',
                  height: '100%',
                  style: { borderRadius: radii.xl },
                  config: {
                    youtube: {
                      playerVars: {
                        modestbranding: 1,
                        rel: 0
                      }
                    }
                  }
                })
              ) : (!loadingTrailer && (
                <div
                  className="flex items-center justify-center h-full"
                  style={{ backgroundColor: colors.backgroundCard }}
                >
                  <div className="text-center">
                    <Play className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
                    <p style={{ color: colors.textSecondary }}>
                      No trailer available for this title
                    </p>
                  </div>
                </div>
              ))}

              {/* Enhanced Watch Now overlay with affiliate support */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-4 left-4 right-4"
              >
                {show?.streaming && show.streaming.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {show.streaming.slice(0, 2).map((platform: any, index: number) => (
                      <Button
                        key={platform.provider_id || index}
                        size="lg"
                        className="gap-3 text-base font-semibold py-3"
                        style={{
                          background: index === 0 ? gradients.accent : gradients.primary,
                          color: colors.textDark,
                          borderRadius: radii.xl,
                          boxShadow: index === 0 ? shadows.glowAccent : shadows.glow,
                        }}
                        onClick={() => {
                          if (platform.web_url) {
                            // Track platform redirect with variant
                            if (show) {
                              trackEvent('platform_redirect', {
                                showId: show.id,
                                showTitle: show.title,
                                platform: platform.provider_name,
                                variant: 'full',
                              });
                            }
                            window.open(platform.web_url, '_blank');
                          } else {
                            handleWatchNow();
                          }
                        }}
                      >
                        {platform.logo_path ? (
                          <img
                            src={platform.logo_path.startsWith('http')
                              ? platform.logo_path
                              : `https://image.tmdb.org/t/p/w92${platform.logo_path}`
                            }
                            alt={platform.provider_name}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <ExternalLink className="w-5 h-5" />
                        )}
                        Watch on {platform.provider_name}
                        {platform.affiliate_supported && (
                          <span className="text-xs opacity-75">(Earn rewards)</span>
                        )}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <Button
                    size="lg"
                    className="w-full gap-3 text-lg font-semibold py-4"
                    style={{
                      background: gradients.accent,
                      color: colors.textDark,
                      borderRadius: radii.xl,
                      boxShadow: shadows.glowAccent,
                    }}
                    onClick={handleWatchNow}
                  >
                    <ExternalLink className="w-5 h-5" />
                    Find Where to Watch
                  </Button>
                )}
              </motion.div>
            </motion.div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
