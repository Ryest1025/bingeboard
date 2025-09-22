import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Plus, ExternalLink, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Show } from "@/lib/utils";

interface TrailerTabProps {
  show: Show;
  user: any;
  onWatchNow?: (show: Show) => void;
  onAddToList?: (show: Show) => void;
  onBackToDetails?: () => void;
}

interface TrailerVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export default function TrailerTab({
  show,
  user,
  onWatchNow,
  onAddToList,
  onBackToDetails
}: TrailerTabProps) {
  const [trailers, setTrailers] = useState<TrailerVideo[]>([]);
  const [selectedTrailer, setSelectedTrailer] = useState<TrailerVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrailers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const showType = show.title ? 'movie' : 'tv';
        const response = await fetch(`/api/shows/${showType}/${show.id}/videos`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch trailers');
        }
        
        const data = await response.json();
        const trailerVideos = data.results?.filter(
          (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
        ) || [];
        
        setTrailers(trailerVideos);
        if (trailerVideos.length > 0) {
          setSelectedTrailer(trailerVideos[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trailers');
      } finally {
        setLoading(false);
      }
    };

    if (show.id) {
      fetchTrailers();
    }
  }, [show.id, show.title]);

  if (loading) {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {onBackToDetails && (
          <Button
            variant="ghost"
            onClick={onBackToDetails}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Details
          </Button>
        )}
        
        {/* Skeleton Loading */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-red-500" />
            <span className="text-gray-300">Loading trailers...</span>
          </div>
          
          {/* Skeleton Video Player */}
          <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 animate-pulse">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-slate-500" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Skeleton Additional Trailers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-video bg-slate-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || trailers.length === 0) {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {onBackToDetails && (
          <Button
            variant="ghost"
            onClick={onBackToDetails}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Details
          </Button>
        )}
        
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              {error ? 'Unable to Load Trailers' : 'No Trailers Available'}
            </h3>
            <p className="text-gray-400 max-w-md">
              {error 
                ? 'We encountered an issue loading trailers for this title.' 
                : 'No official trailers are currently available for this title.'
              }
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent((show.title || show.name || '') + ' trailer')}`, '_blank')}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Search on YouTube
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main Trailer */}
      <AnimatePresence mode="wait">
        {selectedTrailer && (
          <motion.div 
            key={selectedTrailer.key}
            className="space-y-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {selectedTrailer.name}
              </h3>
              {selectedTrailer.official && (
                <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                  Official
                </span>
              )}
            </div>
            
            <motion.div 
              className="aspect-video bg-slate-900 rounded-lg overflow-hidden shadow-2xl"
              layoutId="main-trailer"
            >
              <iframe
                src={`https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=0&rel=0`}
                title={selectedTrailer.name}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Additional Trailers */}
      {trailers.length > 1 && (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h4 className="text-md font-medium text-white">Other Trailers</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trailers.slice(1).map((trailer, index) => (
              <motion.button
                key={trailer.id}
                onClick={() => setSelectedTrailer(trailer)}
                className="group relative aspect-video bg-slate-800 rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              >
                <img
                  src={`https://img.youtube.com/vi/${trailer.key}/mqdefault.jpg`}
                  alt={trailer.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all duration-200" />
                <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-sm font-medium truncate">
                    {trailer.name}
                  </p>
                  {trailer.official && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-red-600 text-white text-xs rounded">
                      Official
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* External Links */}
      <motion.div 
        className="flex gap-3 pt-4 border-t border-slate-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Button
          variant="outline"
          onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent((show.title || show.name || '') + ' trailer')}`, '_blank')}
          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          More on YouTube
        </Button>
      </motion.div>
    </motion.div>
  );
}