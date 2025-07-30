import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Play, X, Clock, DollarSign } from 'lucide-react';

interface MonetizedTrailerProps {
  show: {
    id: number;
    name?: string;
    title?: string;
    backdrop_path?: string;
    overview?: string;
  };
  onTrailerViewed?: () => void;
}

interface AdContent {
  advertiser: string;
  duration: number;
  revenue: number;
  skipable: boolean;
  skipAfter?: number;
}

const MonetizedTrailer: React.FC<MonetizedTrailerProps> = ({ show, onTrailerViewed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showingAd, setShowingAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [revenue, setRevenue] = useState(0);

  // Mock ad content - in production this would come from an ad network API
  const adContent: AdContent = {
    advertiser: "Netflix Premium",
    duration: 15,
    revenue: 0.35, // Revenue per view
    skipable: true,
    skipAfter: 5
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (showingAd && adCountdown > 0) {
      interval = setInterval(() => {
        setAdCountdown(prev => {
          const newCount = prev - 1;
          
          // Enable skip button after skipAfter seconds
          if (adContent.skipAfter && newCount <= (adContent.duration - adContent.skipAfter)) {
            setCanSkip(true);
          }
          
          // Auto-complete ad when countdown reaches 0
          if (newCount <= 0) {
            completeAd();
          }
          
          return newCount;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showingAd, adCountdown]);

  const startTrailer = () => {
    setIsOpen(true);
    setShowingAd(true);
    setAdCountdown(adContent.duration);
    setCanSkip(false);
    setAdCompleted(false);
    setRevenue(0);
  };

  const completeAd = () => {
    setShowingAd(false);
    setAdCompleted(true);
    setRevenue(adContent.revenue);
    onTrailerViewed?.();
    
    // Track revenue (in production, this would call analytics API)
    console.log(`💰 Ad revenue generated: $${adContent.revenue.toFixed(2)} from ${adContent.advertiser}`);
  };

  const skipAd = () => {
    if (canSkip) {
      completeAd();
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setShowingAd(false);
    setAdCompleted(false);
    setRevenue(0);
  };

  const title = show.name || show.title || 'Unknown Title';
  const backdropUrl = show.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}`
    : '/placeholder-backdrop.jpg';

  return (
    <>
      <Button 
        size="sm" 
        onClick={startTrailer}
        className="h-7 text-xs bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-2 flex-shrink-0"
      >
        <Play className="h-2.5 w-2.5 mr-1" />
        Trailer
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl w-full bg-black border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center justify-between">
              <span>{title} - Official Trailer</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={closeModal}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            {showingAd ? (
              // Ad Content
              <div className="relative w-full h-full">
                <div 
                  className="w-full h-full bg-cover bg-center flex items-center justify-center"
                  style={{ backgroundImage: `url(${backdropUrl})` }}
                >
                  <div className="absolute inset-0 bg-black/60" />
                  
                  {/* Ad Content Overlay */}
                  <div className="relative z-10 text-center text-white">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{adContent.advertiser}</h3>
                      <p className="text-gray-300">Premium Streaming - No Ads, Just Entertainment</p>
                    </div>
                    
                    {/* Ad Controls */}
                    <div className="flex items-center justify-center space-x-4">
                      <Badge className="bg-red-600/20 text-red-400 border-red-400/20">
                        <Clock className="h-3 w-3 mr-1" />
                        Ad: {adCountdown}s
                      </Badge>
                      
                      {canSkip && (
                        <Button
                          size="sm"
                          onClick={skipAd}
                          className="bg-gray-700 hover:bg-gray-600 text-white"
                        >
                          Skip Ad
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Revenue Indicator */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-600/20 text-green-400 border-green-400/20">
                    <DollarSign className="h-3 w-3 mr-1" />
                    ${adContent.revenue.toFixed(2)}
                  </Badge>
                </div>
              </div>
            ) : adCompleted ? (
              // Trailer Content (Mock)
              <div className="relative w-full h-full">
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${backdropUrl})` }}
                >
                  <div className="absolute inset-0 bg-black/40" />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Play className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold mb-4">{title}</h3>
                      <p className="text-gray-300 max-w-md mx-auto mb-6">{show.overview}</p>
                      <p className="text-sm text-gray-400">🎬 Trailer is now playing...</p>
                    </div>
                  </div>

                  {/* Revenue Success Indicator */}
                  <div className="absolute bottom-4 right-4">
                    <Badge className="bg-green-600 text-white">
                      <DollarSign className="h-3 w-3 mr-1" />
                      +${revenue.toFixed(2)} earned
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              // Loading State
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading trailer...</p>
                </div>
              </div>
            )}
          </div>

          {/* Monetization Info */}
          {adCompleted && (
            <div className="mt-4 p-3 bg-green-600/10 border border-green-600/20 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400">
                  ✅ Ad completed - Revenue generated: ${revenue.toFixed(2)}
                </span>
                <span className="text-gray-400">
                  Advertiser: {adContent.advertiser}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MonetizedTrailer;
