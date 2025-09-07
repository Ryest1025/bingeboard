// components/search/EnhancedShowModal.tsx
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Clock, Play, Plus, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import useShowDetails from "@/hooks/useShowDetails";

interface Props {
  showId: string | null;
  showType: string;
  open: boolean;
  onClose: () => void;
  onAddToWatchlist?: (showId: number) => void;
  onWatchNow?: (show: any) => void;
}

export default function EnhancedShowModal({
  showId,
  showType = 'movie',
  open,
  onClose,
  onAddToWatchlist,
  onWatchNow,
}: Props) {
  const { data: show, isLoading } = useShowDetails(showId, showType);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl p-0 bg-slate-900 border-slate-700 text-white overflow-hidden">
        {isLoading || !show ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-400">Loading show details...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop Header */}
            {show.backdrop && (
              <div
                className="relative h-64 bg-cover bg-center"
                style={{ backgroundImage: `url(${show.backdrop})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="absolute bottom-6 left-6 right-6"
                >
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-bold text-white mb-2">
                      {show.title} {show.year && <span className="text-slate-300">({show.year})</span>}
                    </DialogTitle>
                    <div className="flex items-center gap-4 text-sm text-slate-300">
                      {show.vote_average > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{show.vote_average.toFixed(1)}</span>
                        </div>
                      )}
                      {show.runtime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{show.runtime} min</span>
                        </div>
                      )}
                      {show.year && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{show.year}</span>
                        </div>
                      )}
                    </div>
                  </DialogHeader>
                </motion.div>
              </div>
            )}

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Poster */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <img
                    src={show.poster || "/placeholder.png"}
                    alt={show.title}
                    className="w-full h-auto object-cover rounded-lg shadow-2xl"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png";
                    }}
                  />
                </motion.div>

                {/* Details */}
                <div className="col-span-2 flex flex-col gap-4">
                  {!show.backdrop && (
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-white">
                        {show.title} {show.year && <span className="text-slate-300">({show.year})</span>}
                      </DialogTitle>
                    </DialogHeader>
                  )}

                  {/* Overview */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    <p className="text-slate-300 leading-relaxed">{show.overview}</p>
                  </motion.div>

                  {/* Genres */}
                  {show.genres && show.genres.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                      className="flex flex-wrap gap-2"
                    >
                      {show.genres.map((genre: string) => (
                        <Badge key={genre} variant="secondary" className="bg-slate-700 text-slate-200">
                          {genre}
                        </Badge>
                      ))}
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="flex flex-col sm:flex-row gap-3 mt-auto"
                  >
                    <Button
                      size="lg"
                      className="gap-2 bg-cyan-600 hover:bg-cyan-700"
                      onClick={() => onWatchNow?.(show)}
                    >
                      <Play className="w-4 h-4" />
                      Watch Trailer
                    </Button>
                    <Button
                      size="lg"
                      variant="secondary"
                      className="gap-2 bg-slate-700 hover:bg-slate-600"
                      onClick={() => onAddToWatchlist?.(parseInt(show.id))}
                    >
                      <Plus className="w-4 h-4" />
                      Add to Watchlist
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                      More Info
                    </Button>
                  </motion.div>

                  {/* Streaming platforms placeholder */}
                  {show.streaming && show.streaming.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.3 }}
                      className="pt-4 border-t border-slate-700"
                    >
                      <h4 className="text-sm text-slate-400 mb-3">Available on</h4>
                      <div className="flex gap-3 items-center">
                        {show.streaming.map((platform: any) => (
                          <img
                            key={platform.name}
                            src={platform.logo}
                            alt={platform.name}
                            className="w-10 h-10 object-contain rounded-lg"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
