import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Video } from "lucide-react";
import { TrailerWithAds } from "@/components/ad-player";
import { useAuth } from "@/hooks/useAuth";
import { useTrailer } from "@/hooks/useTrailer";

interface TrailerButtonProps {
  show: {
    id: number;
    tmdbId?: number;
    title: string;
  };
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link";
  size?: "sm" | "default" | "lg";
  className?: string;
  showLabel?: boolean;
}

export default function TrailerButton({ 
  show, 
  variant = "outline", 
  size = "sm",
  className = "",
  showLabel = true
}: TrailerButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  // Use the multi-API trailer hook
  const { data: trailerData, isLoading, error } = useTrailer(
    show.tmdbId || show.id, 
    'tv', 
    show.title
  );

  // Check if user has premium plan for ad-free trailers (simplified)
  const hasAdFreeTrailers = false; // For now, all users see ads

  const handleTrailerClick = () => {
    if (trailerData?.primaryTrailer) {
      setShowModal(true);
    }
  };

  // Get embed URL helper function
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    return url;
  };

  // Debug logging
  console.log('TrailerButton render:', {
    show: show.title,
    isLoading,
    hasData: !!trailerData,
    hasPrimaryTrailer: !!trailerData?.primaryTrailer,
    error: error?.message
  });

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`${className} ${isLoading ? 'opacity-75' : ''} bg-red-600 hover:bg-red-700 text-white border-red-500`}
        onClick={handleTrailerClick}
        disabled={isLoading || !trailerData?.primaryTrailer}
      >
        <Play className="h-3 w-3 mr-1" />
        {showLabel ? (isLoading ? "Loading..." : "Trailer") : "🎬"}
      </Button>

      {/* Trailer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/80" onClick={() => setShowModal(false)} />
          <div className="relative bg-slate-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                <h2 className="text-lg font-semibold">{show.title} - Trailer</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              {hasAdFreeTrailers ? 
                "Enjoy this ad-free preview trailer" : 
                "Watch this trailer after a brief ad"
              }
            </p>
          
          {error || !trailerData?.primaryTrailer ? (
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No trailer available for this show</p>
              </div>
            </div>
          ) : hasAdFreeTrailers ? (
            // Premium users get ad-free trailers
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-500 text-white">
                  Premium: Ad-Free Trailer
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Multi-API Source: {trailerData.primaryTrailer.source}
                </div>
              </div>
              <div className="aspect-video bg-black rounded-lg">
                <iframe
                  width="100%"
                  height="100%"
                  src={getEmbedUrl(trailerData.primaryTrailer.url)}
                  title={`${show.title} Trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                />
              </div>
            </div>
          ) : (
            // Free users see ads before trailers
            <TrailerWithAds
              trailerUrl={getEmbedUrl(trailerData.primaryTrailer.url)}
              showTitle={show.title}
            >
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground text-center">
                  Source: {trailerData.primaryTrailer.source} • {trailerData.stats?.total || 0} trailers found
                </div>
                <div className="aspect-video bg-black rounded-lg">
                  <iframe
                    width="100%"
                    height="100%"
                    src={getEmbedUrl(trailerData.primaryTrailer.url)}
                    title={`${show.title} Trailer`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  />
                </div>
              </div>
            </TrailerWithAds>
          )}
          </div>
        </div>
      )}
    </>
  );
}