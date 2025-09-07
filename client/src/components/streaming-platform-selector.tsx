import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, ExternalLink } from 'lucide-react';

interface StreamingPlatform {
  provider_name: string;
  logo_path?: string;
  provider_id: number;
}

interface StreamingPlatformSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  platforms: StreamingPlatform[];
  showTitle: string;
  onPlatformSelect: (platform: StreamingPlatform) => void;
}

export function StreamingPlatformSelector({
  isOpen,
  onClose,
  platforms,
  showTitle,
  onPlatformSelect
}: StreamingPlatformSelectorProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<StreamingPlatform | null>(null);

  const handlePlatformClick = (platform: StreamingPlatform) => {
    setSelectedPlatform(platform);
    onPlatformSelect(platform);
    onClose();
  };

  // Deep link URLs for major streaming platforms
  const getPlatformDeepLink = (platform: StreamingPlatform, showTitle: string) => {
    const encodedTitle = encodeURIComponent(showTitle);
    
    switch (platform.provider_name.toLowerCase()) {
      case 'netflix':
        return `https://www.netflix.com/search?q=${encodedTitle}`;
      case 'disney plus':
      case 'disney+':
        return `https://www.disneyplus.com/search?q=${encodedTitle}`;
      case 'hulu':
        return `https://www.hulu.com/search?q=${encodedTitle}`;
      case 'amazon prime video':
      case 'prime video':
        return `https://www.amazon.com/gp/video/search?phrase=${encodedTitle}`;
      case 'hbo max':
      case 'max':
        return `https://play.max.com/search?q=${encodedTitle}`;
      case 'apple tv plus':
      case 'apple tv+':
        return `https://tv.apple.com/search?term=${encodedTitle}`;
      case 'paramount plus':
      case 'paramount+':
        return `https://www.paramountplus.com/search/?query=${encodedTitle}`;
      case 'peacock':
        return `https://www.peacocktv.com/search?q=${encodedTitle}`;
      case 'crunchyroll':
        return `https://www.crunchyroll.com/search?q=${encodedTitle}`;
      case 'funimation':
        return `https://www.funimation.com/search/?q=${encodedTitle}`;
      default:
        return `https://www.google.com/search?q=${encodedTitle}+${encodeURIComponent(platform.provider_name)}+watch+online`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-center">
            Choose where to watch
          </DialogTitle>
          <p className="text-sm text-gray-400 text-center mt-2">
            {showTitle}
          </p>
        </DialogHeader>
        
        <div className="grid gap-3 py-4">
          {platforms.map((platform, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-16 border-slate-600 hover:border-teal-500 hover:bg-teal-500/10 transition-all duration-200"
              onClick={() => handlePlatformClick(platform)}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="w-12 h-12 rounded-lg bg-white p-2 flex-shrink-0">
                  {platform.logo_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w92${platform.logo_path}`}
                      alt={platform.provider_name}
                      className="w-full h-full object-contain rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-600 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {platform.provider_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-left">
                  <div className="font-medium text-white">
                    {platform.provider_name}
                  </div>
                  <div className="text-sm text-gray-400">
                    Available now
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-teal-400" />
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                </div>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="text-xs text-gray-500 text-center pt-2">
          You'll be redirected to the chosen streaming platform
        </div>
      </DialogContent>
    </Dialog>
  );
}