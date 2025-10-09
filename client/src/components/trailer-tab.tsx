import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Play } from "lucide-react";
import type { Show } from "@/lib/utils";
import { apiFetch } from "@/utils/api-config";

interface TrailerTabProps {
  show: Show;
  user?: any;
  onWatchNow?: (show: Show) => void;
  onAddToList?: (show: Show) => void;
  onBackToDetails: () => void;
}

interface TrailerData {
  trailerUrl: string;
  adUrl?: string;
}

export default function TrailerTab({
  show,
  user,
  onWatchNow,
  onAddToList,
  onBackToDetails
}: TrailerTabProps) {
  const [trailerData, setTrailerData] = useState<TrailerData | null>(null);
  const [isAdPlaying, setIsAdPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchTrailer = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/multi-api/trailer/tv/${show.id}`);
        if (!res.ok) throw new Error("Failed to fetch trailer");
        const data = await res.json();
        setTrailerData(data);
        
        // If no ad, start with trailer directly
        if (!data.adUrl) {
          setIsAdPlaying(false);
        }
      } catch (err: any) {
        console.error(err);
        setError("Unable to load trailer");
      } finally {
        setLoading(false);
      }
    };
    fetchTrailer();
  }, [show.id]);

  // Handle switching from ad to trailer
  const handleAdEnded = () => {
    setIsAdPlaying(false);
    if (videoRef.current && trailerData?.trailerUrl) {
      videoRef.current.src = trailerData.trailerUrl;
      videoRef.current.play();
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <p className="text-gray-400 text-lg">Loading trailer...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <Button variant="outline" onClick={onBackToDetails} className="border-white/30 text-white hover:bg-white/20">
          Back to Details
        </Button>
      </div>
    );
  }

  if (!trailerData?.trailerUrl) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <p className="text-gray-400 text-lg mb-4">No trailer available for this show</p>
        <Button variant="outline" onClick={onBackToDetails} className="border-white/30 text-white hover:bg-white/20">
          Back to Details
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="relative w-full max-w-3xl aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={isAdPlaying ? trailerData.adUrl : trailerData.trailerUrl}
          controls={!isAdPlaying}
          autoPlay
          onEnded={isAdPlaying ? handleAdEnded : undefined}
          className="w-full h-full object-cover"
        />
        
        {/* Ad Overlay */}
        {isAdPlaying && trailerData.adUrl && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-semibold pointer-events-none">
            <div className="bg-black/80 px-4 py-2 rounded-lg">
              Ad Playing...
            </div>
          </div>
        )}

        {/* Back / Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToDetails}
          className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Action Buttons - Only show after ad */}
        {!isAdPlaying && (
          <div className="absolute bottom-4 left-4 flex gap-3">
            {onWatchNow && (
              <Button onClick={() => onWatchNow(show)} className="bg-red-600 hover:bg-red-700 text-white px-4">
                <Play className="w-4 h-4 mr-1" /> Watch Now
              </Button>
            )}
            {onAddToList && (
              <Button variant="outline" onClick={() => onAddToList(show)} className="border-white/30 text-white hover:bg-white/20 px-4">
                + Add to List
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}