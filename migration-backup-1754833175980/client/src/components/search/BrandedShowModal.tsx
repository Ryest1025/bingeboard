// components/search/BrandedShowModal.tsx - BingeBoard Branded Show Modal
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Clock, Play, Plus, ExternalLink, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactPlayer from "react-player";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useShowDetails from "@/hooks/useShowDetails";
import { colors, gradients, radii, spacing, shadows } from "@/styles/tokens";

interface Props {
  showId: string | null;
  showType: string;
  open: boolean;
  onClose: () => void;
  onAddToWatchlist?: (showId: number) => void;
  onWatchNow?: (show: any) => void;
}

export default function BrandedShowModal({
  showId,
  showType = 'movie',
  open,
  onClose,
  onAddToWatchlist,
  onWatchNow,
}: Props) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const queryClient = useQueryClient();

  const { data: show, isLoading } = useShowDetails(showId, showType);

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
    }
  };

  const handleWatchTrailer = () => {
    setShowTrailer(true);
  };

  const handleWatchNow = () => {
    if (show) {
      onWatchNow?.(show);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent 
        className="max-w-6xl p-0 border-0 overflow-hidden"
        style={{
          backgroundColor: colors.background,
          borderRadius: radii['2xl'],
          boxShadow: shadows['2xl'],
        }}
      >
        <AnimatePresence>
          {isLoading || !show ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 text-center"
            >
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
                        {show.overview}
                      </p>
                    </motion.div>

                    {/* Genres */}
                    {show.genres && show.genres.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                        className="flex flex-wrap gap-3"
                      >
                        {show.genres.map((genre: string) => (
                          <Badge 
                            key={genre} 
                            variant="secondary" 
                            className="px-3 py-1 text-sm font-medium"
                            style={{
                              backgroundColor: colors.secondaryLight,
                              color: colors.text,
                              border: `1px solid ${colors.border}`,
                              borderRadius: radii.lg,
                            }}
                          >
                            {genre}
                          </Badge>
                        ))}
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
                          backgroundColor: colors.backgroundCard,
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                          borderRadius: radii.xl,
                        }}
                        onClick={handleAddToWatchlist}
                        disabled={isAddingToWatchlist}
                      >
                        {isAddingToWatchlist ? (
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Heart className="w-5 h-5" />
                        )}
                        {isAddingToWatchlist ? 'Adding...' : 'Add to Watchlist'}
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
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {show.streaming.slice(0, 8).map((platform: any, index: number) => (
                            <motion.div
                              key={platform.provider_id || index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.8 + index * 0.1, duration: 0.2 }}
                              className="group cursor-pointer"
                            >
                              <div 
                                className="relative p-3 rounded-lg transition-all duration-200 hover:scale-105 text-center"
                                style={{
                                  backgroundColor: colors.backgroundCard,
                                  border: `1px solid ${colors.border}`,
                                }}
                              >
                                {platform.logo_path ? (
                                  <img 
                                    src={platform.logo_path.startsWith('http') 
                                      ? platform.logo_path 
                                      : `https://image.tmdb.org/t/p/w92${platform.logo_path}`
                                    } 
                                    alt={platform.provider_name} 
                                    className="w-8 h-8 object-contain mx-auto mb-2" 
                                  />
                                ) : (
                                  <div 
                                    className="w-8 h-8 rounded mx-auto mb-2 flex items-center justify-center text-xs font-bold"
                                    style={{ 
                                      backgroundColor: colors.primary,
                                      color: colors.textDark 
                                    }}
                                  >
                                    {platform.provider_name.charAt(0)}
                                  </div>
                                )}
                                
                                <p 
                                  className="text-xs font-medium leading-tight"
                                  style={{ color: colors.textSecondary }}
                                >
                                  {platform.provider_name}
                                </p>
                                
                                {platform.type && (
                                  <div className="mt-1">
                                    <span 
                                      className="text-xs px-1 py-0.5 rounded"
                                      style={{
                                        backgroundColor: platform.type === 'free' 
                                          ? colors.success + '20' 
                                          : colors.accent + '20',
                                        color: platform.type === 'free' 
                                          ? colors.success 
                                          : colors.accent
                                      }}
                                    >
                                      {platform.type}
                                    </span>
                                  </div>
                                )}
                                
                                {/* Affiliate badge */}
                                {platform.affiliate_supported && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                                    style={{ backgroundColor: colors.success }}
                                    title="Affiliate supported"
                                  />
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        
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
              {show?.trailer ? (
                <ReactPlayer
                  url={`https://www.youtube.com/watch?v=${show.trailer}`}
                  playing
                  controls
                  width="100%"
                  height="100%"
                  style={{ borderRadius: radii.xl }}
                  config={{
                    youtube: {
                      playerVars: { 
                        showinfo: 1,
                        modestbranding: 1,
                        rel: 0
                      }
                    }
                  }}
                />
              ) : (
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
              )}
              
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
