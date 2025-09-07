import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Play, Video } from "lucide-react";
import { TrailerWithAds } from "@/components/ad-player";
import { useAuth } from "@/hooks/useAuth";
import { 
  getBestTrailer, 
  getYouTubeEmbedUrl,
  trackTrailerView 
} from "@/lib/trailerUtils";

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
  const [trailerData, setTrailerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Check if user has premium plan for ad-free trailers
  const userPlan = user?.subscription?.plan || "free";
  const hasAdFreeTrailers = userPlan === "plus" || userPlan === "premium";

  const handleTrailerClick = async () => {
    setLoading(true);
    try {
      const trailer = await getBestTrailer(show.tmdbId || show.id, 'tv');
      setTrailerData(trailer);
      if (trailer) {
        setShowModal(true);
        // Track trailer view
        if (user) {
          await trackTrailerView(
            show.tmdbId || show.id,
            trailer.key,
            user.id,
            show.title,
            !hasAdFreeTrailers
          );
        }
      }
    } catch (error) {
      console.error('Error loading trailer:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`${className} ${loading ? 'opacity-75' : ''} bg-red-600 hover:bg-red-700 text-white border-red-500`}
        onClick={handleTrailerClick}
        disabled={loading}
      >
        <Play className="h-3 w-3 mr-1" />
        {showLabel ? (loading ? "Loading..." : "Trailer") : "🎬"}
      </Button>

      {/* Trailer Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              {show.title} - Trailer
            </DialogTitle>
            <DialogDescription>
              {hasAdFreeTrailers ? 
                "Enjoy this ad-free preview trailer" : 
                "Watch this trailer after a brief ad"
              }
            </DialogDescription>
          </DialogHeader>
          
          {!trailerData ? (
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
                  Enjoying your Plus/Premium experience!
                </div>
              </div>
              <div className="aspect-video bg-black rounded-lg">
                <iframe
                  width="100%"
                  height="100%"
                  src={getYouTubeEmbedUrl(trailerData.key, true)}
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
              trailerUrl={getYouTubeEmbedUrl(trailerData.key)}
              showTitle={show.title}
            >
              <div className="aspect-video bg-black rounded-lg">
                <iframe
                  width="100%"
                  height="100%"
                  src={getYouTubeEmbedUrl(trailerData.key, true)}
                  title={`${show.title} Trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                />
              </div>
            </TrailerWithAds>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}