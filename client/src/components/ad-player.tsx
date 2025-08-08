import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Volume2, VolumeX, ExternalLink, Play, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AdSelector, AdAnalytics, RevenueCalculator, type AdContent } from "@/lib/adConfig";

interface AdPlayerProps {
  onAdComplete: () => void;
  onSkip?: () => void;
  skipAfter?: number; // seconds after which skip is allowed
  duration?: number; // ad duration in seconds
  className?: string;
  userPreferences?: string[]; // For ad targeting
}

// Remove the sample ads array since we're using the config system

export default function AdPlayer({ 
  onAdComplete, 
  onSkip,
  skipAfter = 5,
  duration = 15,
  className = "",
  userPreferences = []
}: AdPlayerProps) {
  const [currentAd, setCurrentAd] = useState<AdContent | null>(null);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [canSkip, setCanSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showClickOverlay, setShowClickOverlay] = useState(false);
  const [adStartTime, setAdStartTime] = useState<number>(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Load ad using the smart selection algorithm
    const selectedAd = AdSelector.selectAd(userPreferences);
    if (selectedAd) {
      setCurrentAd(selectedAd);
      setTimeLeft(selectedAd.duration);
      
      // Track ad view
      if (user) {
        AdAnalytics.trackAdView(selectedAd.id, user.id || user.uid, 'trailer-monetization');
      }
    }
  }, [userPreferences, user]);

  useEffect(() => {
    if (!currentAd || !isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Track ad completion
          if (user && currentAd) {
            const watchTime = Date.now() - adStartTime;
            AdAnalytics.trackAdCompletion(currentAd.id, user.id || user.uid, watchTime);
          }
          onAdComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, (currentAd.skipAfter || skipAfter) * 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(skipTimer);
    };
  }, [currentAd, onAdComplete, skipAfter, isPlaying, user, adStartTime]);

  const handleVideoPlay = () => {
    setIsPlaying(true);
    setAdStartTime(Date.now());
    videoRef.current?.play();
  };

  const handleSkip = () => {
    if (canSkip && onSkip) {
      // Track partial ad view
      if (user && currentAd) {
        const watchTime = Date.now() - adStartTime;
        AdAnalytics.trackAdCompletion(currentAd.id, user.id || user.uid, watchTime);
      }
      onSkip();
    }
  };

  const handleAdClick = () => {
    if (currentAd?.clickUrl && user) {
      // Track ad click for revenue analytics
      AdAnalytics.trackAdClick(currentAd.id, user.id || user.uid, currentAd.clickUrl);
      
      console.log('💰 Ad clicked - Estimated revenue:', RevenueCalculator.calculateClickRevenue(currentAd.id));
      
      window.open(currentAd.clickUrl, '_blank');
      
      toast({
        title: "Opening advertiser page",
        description: "You'll continue to your trailer after the ad",
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const progress = currentAd ? ((currentAd.duration - timeLeft) / currentAd.duration) * 100 : 0;

  if (!currentAd) {
    return (
      <div className="flex items-center justify-center h-64 bg-black/50 rounded-lg">
        <div className="text-white">Loading advertisement...</div>
      </div>
    );
  }

  return (
    <Card className={`relative overflow-hidden bg-black ${className}`}>
      {/* Video Player */}
      <div className="relative aspect-video bg-black">
        {!isPlaying ? (
          // Ad Poster/Preview
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-blue-900/50">
            <div className="text-center text-white space-y-4">
              <div className="text-sm opacity-75">Advertisement</div>
              <h3 className="text-xl font-bold">{currentAd.title}</h3>
              <p className="text-sm opacity-90">{currentAd.description}</p>
              <Button onClick={handleVideoPlay} size="lg" className="gap-2">
                <Play className="w-5 h-5" />
                Play Ad ({currentAd.duration}s)
              </Button>
              <div className="text-xs opacity-75">
                by {currentAd.advertiser}
              </div>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              src={currentAd.videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted={isMuted}
              onEnded={onAdComplete}
              onClick={() => setShowClickOverlay(true)}
            />

            {/* Click Overlay */}
            {showClickOverlay && currentAd.clickUrl && (
              <div 
                className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer"
                onClick={handleAdClick}
                onMouseLeave={() => setShowClickOverlay(false)}
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
                  <ExternalLink className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Visit Advertiser</div>
                  <div className="text-sm text-muted-foreground">{currentAd.advertiser}</div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Controls Overlay */}
        {isPlaying && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30">
            {/* Top Bar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white text-sm">
                <div className="bg-red-600 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                  AD
                  <DollarSign className="w-3 h-3" />
                </div>
                <span>{currentAd.advertiser}</span>
                <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                  Revenue: ${RevenueCalculator.calculateAdRevenue(currentAd.id, false).toFixed(3)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                
                {canSkip && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSkip}
                    className="gap-1"
                  >
                    <X className="w-3 h-3" />
                    Skip
                  </Button>
                )}
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="absolute bottom-4 left-4 right-4 space-y-2">
              {/* Progress Bar */}
              <Progress value={progress} className="h-1" />
              
              <div className="flex items-center justify-between text-white text-sm">
                <div className="flex items-center gap-2">
                  {currentAd.clickUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAdClick}
                      className="gap-1 text-white border-white/30 hover:bg-white/20"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Learn More
                    </Button>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-xs opacity-75">Ad ends in</div>
                  <div className="font-medium">{timeLeft}s</div>
                </div>
              </div>
            </div>

            {/* Skip Timer */}
            {!canSkip && (
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
                Skip in {Math.max(0, (currentAd.skipAfter || skipAfter) - (currentAd.duration - timeLeft))}s
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ad Info Footer */}
      <div className="p-3 bg-muted/50 border-t">
        <div className="flex items-center justify-between text-sm">
          <div>
            <div className="font-medium">{currentAd.title}</div>
            <div className="text-muted-foreground">{currentAd.description}</div>
          </div>
          <div className="text-right text-muted-foreground">
            <div>Sponsored by</div>
            <div className="font-medium">{currentAd.advertiser}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Wrapper component for trailer with ads
interface TrailerWithAdsProps {
  trailerUrl: string;
  showTitle: string;
  children?: React.ReactNode;
}

export function TrailerWithAds({ trailerUrl, showTitle, children }: TrailerWithAdsProps) {
  const [showAd, setShowAd] = useState(true);
  const [adCompleted, setAdCompleted] = useState(false);

  const handleAdComplete = () => {
    setShowAd(false);
    setAdCompleted(true);
  };

  const handleSkipAd = () => {
    setShowAd(false);
    setAdCompleted(true);
  };

  if (showAd) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-2">
            Watch a short ad to continue to "{showTitle}" trailer
          </div>
        </div>
        <AdPlayer 
          onAdComplete={handleAdComplete}
          onSkip={handleSkipAd}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {adCompleted && (
        <div className="text-center text-sm text-green-600 mb-2">
          Ad completed! Enjoy your trailer.
        </div>
      )}
      {children}
    </div>
  );
}