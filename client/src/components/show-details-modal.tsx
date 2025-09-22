import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Play, Plus, Calendar, Star, Info, Youtube } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DetailsTab from "./details-tab";
import TrailerTab from "./trailer-tab";
import { useAuth } from "@/hooks/useAuth";
import { getShowId } from "@/utils/show-utils";
import type { Show } from "@/lib/utils";

interface ShowDetailsModalProps {
  show: Show | null;
  open: boolean;
  onClose: () => void;
  onAddToList?: (show: Show) => void;
  onWatchNow?: (show: Show) => void;
}

export default function ShowDetailsModal({
  show,
  open,
  onClose,
  onAddToList,
  onWatchNow
}: ShowDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'trailer'>('details');
  const { user } = useAuth();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return;

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
          event.preventDefault();
          setActiveTab(current => current === 'details' ? 'trailer' : 'details');
          break;
        case '1':
          event.preventDefault();
          setActiveTab('details');
          break;
        case '2':
          event.preventDefault();
          setActiveTab('trailer');
          break;
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onClose]);

  if (!show) return null;

  const showId = getShowId(show);
  const releaseYear = show.first_air_date || show.release_date
    ? new Date(show.first_air_date || show.release_date || '').getFullYear()
    : null;

  const backdropUrl = show.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` 
    : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-slate-900 text-white border-slate-700 max-h-[90vh] overflow-hidden p-0">
        <div className="relative w-full h-full">
          {/* Backdrop Header */}
          {backdropUrl && (
            <div 
              className="relative h-64 bg-cover bg-center"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-black/60 to-black/40" />
              
              {/* Close Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose} 
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 z-10"
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Title & Poster */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-end gap-6">
                  <img
                    src={show.poster_path 
                      ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                      : '/api/placeholder/200/300'
                    }
                    alt={show.title || show.name}
                    className="w-32 h-48 rounded-lg shadow-xl border-2 border-white/20"
                  />

                  <div className="flex-1 space-y-3">
                    <h1 className="text-4xl font-bold text-white mb-2">{show.title || show.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-white/90">
                      {releaseYear && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {releaseYear}
                        </div>
                      )}
                      {show.vote_average && show.vote_average > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          {show.vote_average.toFixed(1)}/10
                        </div>
                      )}
                      {show.runtime && (
                        <div className="flex items-center gap-1">
                          <span>{show.runtime} min</span>
                        </div>
                      )}
                    </div>

                    {/* Genres */}
                    {show.genre_ids && show.genre_ids.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {show.genre_ids.slice(0, 4).map((genreId) => (
                          <div 
                            key={genreId} 
                            className="bg-black/50 text-white border-white/20 px-2 py-1 rounded text-sm"
                          >
                            Genre {genreId}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {onWatchNow && (
                        <Button onClick={() => onWatchNow(show)} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6">
                          <Play className="w-4 h-4 mr-2" /> Watch Now
                        </Button>
                      )}
                      {onAddToList && (
                        <Button variant="outline" onClick={() => onAddToList(show)} className="border-white/30 text-white hover:bg-white/20 hover:text-white font-semibold px-6">
                          <Plus className="w-4 h-4 mr-2" /> Add to List
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => setActiveTab('trailer')} className="border-white/30 text-white hover:bg-white/20 px-6">
                        Watch Trailer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]" id="modal-content">
            {/* Tabs */}
            <div className="relative mb-6">
              <div className="flex items-center gap-8 border-b border-slate-700" role="tablist">
                <motion.button
                  onClick={() => setActiveTab('details')}
                  className={`relative pb-3 px-1 text-sm font-medium transition-colors ${
                    activeTab === 'details' ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  aria-selected={activeTab === 'details'}
                  role="tab"
                  tabIndex={activeTab === 'details' ? 0 : -1}
                >
                  <Info className="w-4 h-4 mr-2 inline" /> Details
                  {activeTab === 'details' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
                  )}
                </motion.button>

                <motion.button
                  onClick={() => setActiveTab('trailer')}
                  className={`relative pb-3 px-1 text-sm font-medium transition-colors ${
                    activeTab === 'trailer' ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  aria-selected={activeTab === 'trailer'}
                  role="tab"
                  tabIndex={activeTab === 'trailer' ? 0 : -1}
                >
                  Trailer
                  {activeTab === 'trailer' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                role="tabpanel"
                aria-labelledby={`tab-${activeTab}`}
              >
                {activeTab === 'details' ? (
                  <DetailsTab 
                    show={show} 
                    onWatchNow={onWatchNow} 
                    onAddToList={onAddToList} 
                    onWatchTrailer={() => setActiveTab('trailer')}
                  />
                ) : (
                  <TrailerTab 
                    show={show} 
                    user={user} 
                    onWatchNow={onWatchNow} 
                    onAddToList={onAddToList}
                    onBackToDetails={() => setActiveTab('details')}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
            </div>
      </DialogContent>
    </Dialog>
  );
}
