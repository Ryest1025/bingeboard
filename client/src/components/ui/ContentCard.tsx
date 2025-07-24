import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Play, Plus, Calendar, Bell, ExternalLink, DollarSign } from 'lucide-react';
import { StreamingLogos } from './StreamingLogos';
import { StreamingPlatformSelector } from './StreamingPlatformSelector';
import { useAuth } from '@/hooks/useAuth';
import TrailerButton from '../trailer-button';
import { getAffiliateLink, hasAffiliateSupport } from '@/lib/affiliateUtils';
import { getStreamingUrl } from '@/lib/affiliateUtils';

interface ContentCardProps {
  item: any;
  type?: "compact" | "grid";
  showStreamingLogos?: boolean;
  showCalendarButton?: boolean;
  showNotificationButton?: boolean;
  showWatchNow?: boolean;
  showTrailerButton?: boolean;
  showAffiliateLinks?: boolean;
  isComingSoon?: boolean;
  releaseDate?: string;
  onWatchNow?: (item: any, platform: any) => void;
  onAddToWatchlist?: (item: any) => void;
  onAddCalendar?: (item: any) => void;
  onSetNotification?: (item: any) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({ 
  item, 
  type = "compact",
  showStreamingLogos = true,
  showCalendarButton = false,
  showNotificationButton = false,
  showWatchNow = true,
  showTrailerButton = true,
  showAffiliateLinks = true,
  isComingSoon = false,
  releaseDate,
  onWatchNow,
  onAddToWatchlist,
  onAddCalendar,
  onSetNotification
}) => {
  const { user } = useAuth();
  const [showAffiliateTooltip, setShowAffiliateTooltip] = useState(false);
  
  const providers = item.watchProviders || item.streamingProviders || item.streamingPlatforms || [];
  
  // Enhanced platform click handler with affiliate tracking
  const handlePlatformClick = (platform: any) => {
    if (!user || !item) return;
    
    const platformName = platform.provider_name || platform.name;
    const showId = item.id || item.tmdbId;
    const showTitle = item.title || item.name;
    
    if (showAffiliateLinks && hasAffiliateSupport(platformName)) {
      // Use affiliate link for monetization
      const affiliateUrl = getStreamingUrl(platformName, showTitle, user.uid, showId, true);
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback to direct platform link
      const directUrl = getStreamingUrl(platformName, showTitle, user.uid, showId, false);
      window.open(directUrl, '_blank', 'noopener,noreferrer');
    }
    
    // Call original handler if provided
    onWatchNow?.(item, platform);
  };
  
  if (type === "compact") {
    return (
      <div className="flex-shrink-0 w-60">
        <Card className="glass-effect border-slate-700/50 hover:border-teal-500/50 transition-all duration-300">
          <CardContent className="p-3">
            <div className="flex gap-2">
              <div className="relative flex-shrink-0">
                <img
                  src={item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : '/placeholder-poster.png'}
                  alt={item.title || item.name}
                  className="w-12 h-18 object-cover rounded-md opacity-0 transition-opacity duration-300"
                  onLoad={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-poster.png';
                    e.currentTarget.style.opacity = '1';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-xs mb-1 truncate">
                  {item.title || item.name}
                </h3>
                <div className="flex items-center gap-1 text-yellow-400 mb-1">
                  <Star className="h-2 w-2 fill-current" />
                  <span className="text-xs">{item.vote_average?.toFixed(1) || 'N/A'}</span>
                </div>
                <p className="text-xs text-gray-300 mb-2 line-clamp-1">
                  {item.overview || item.description || 'No description available'}
                </p>
                
                {/* Universal Streaming Logos Layout */}
                {showStreamingLogos && (
                  <div className="mb-2">
                    <StreamingLogos 
                      providers={providers} 
                      size="sm"
                      maxLogos={3}
                      showNames={false}
                      showAffiliateIndicator={showAffiliateLinks}
                    />
                  </div>
                )}
                
                {isComingSoon && releaseDate && (
                  <div className="mb-2">
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs h-5">
                      <Calendar className="h-2 w-2 mr-1" />
                      {releaseDate}
                    </Badge>
                  </div>
                )}
                
                {/* Universal Action Buttons Layout */}
                <div className="flex items-center gap-1 mt-2 flex-wrap min-h-[20px]">
                  {/* Universal Trailer Button */}
                  {showTrailerButton && (
                    <TrailerButton 
                      show={{
                        id: item.id || item.tmdbId || 0,
                        tmdbId: item.id || item.tmdbId,
                        title: item.title || item.name || 'Unknown'
                      }}
                      variant="outline"
                      size="sm"
                      className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50 text-xs h-5 px-2 flex-shrink-0"
                      showLabel={false}
                    />
                  )}
                  
                  {/* Universal Calendar Button */}
                  {showCalendarButton && (
                    <Button 
                      size="sm" 
                      className="bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 border-teal-500/50 text-xs h-5 px-2 flex-shrink-0"
                      onClick={() => onAddCalendar?.(item)}
                    >
                      <Calendar className="h-2 w-2 mr-1" />
                      Cal
                    </Button>
                  )}
                  
                  {/* Universal Notification Button */}
                  {showNotificationButton && (
                    <Button 
                      size="sm" 
                      className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/50 text-xs h-5 px-2 flex-shrink-0"
                      onClick={() => onSetNotification?.(item)}
                    >
                      <Bell className="h-2 w-2 mr-1" />
                      Bell
                    </Button>
                  )}
                  
                  {/* Universal Add Button */}
                  <Button 
                    size="sm" 
                    className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-purple-500/50 text-xs h-5 px-2 flex-shrink-0"
                    onClick={() => onAddToWatchlist?.(item)}
                  >
                    <Plus className="h-2 w-2 mr-1" />
                    Add
                  </Button>
                  
                  {/* Universal Watch Now Button with Affiliate Links */}
                  {showWatchNow && !isComingSoon && providers.length > 0 && (
                    <div className="relative flex-shrink-0">
                      <StreamingPlatformSelector 
                        providers={providers} 
                        onSelectPlatform={handlePlatformClick}
                      />
                      {showAffiliateLinks && (
                        <div 
                          className="absolute -top-0.5 -right-0.5"
                          title="Supports content creators through affiliate partnerships"
                        >
                          <DollarSign className="h-2 w-2 text-green-400 bg-black/80 rounded-full p-0.5" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Grid type
  return (
    <div className="flex-shrink-0 w-72">
      <Card className="glass-effect border-slate-700/50 hover:border-teal-500/50 transition-all duration-300">
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : '/placeholder-poster.png'}
              alt={item.title || item.name}
              className="w-full h-96 object-cover rounded-t-lg opacity-0 transition-opacity duration-300"
              onLoad={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onError={(e) => {
                e.currentTarget.src = '/placeholder-poster.png';
                e.currentTarget.style.opacity = '1';
              }}
            />
            <div className="absolute top-2 right-2">
              <div className="flex items-center gap-1 bg-black/70 rounded px-2 py-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-xs text-white">{item.vote_average?.toFixed(1) || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-white text-sm mb-2 truncate">
              {item.title || item.name}
            </h3>
            
            
            {/* Universal Streaming Logos Layout */}
            {showStreamingLogos && (
              <div className="mb-3">
                <StreamingLogos 
                  providers={providers} 
                  size="sm"
                  maxLogos={4}
                  showNames={false}
                  showAffiliateIndicator={showAffiliateLinks}
                />
              </div>
            )}
            
            {isComingSoon && releaseDate && (
              <div className="mb-3">
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs h-6">
                  <Calendar className="h-3 w-3 mr-1" />
                  {releaseDate}
                </Badge>
              </div>
            )}
            
            {/* Universal Action Buttons Layout */}
            <div className="flex items-center gap-1.5 mt-3 flex-wrap min-h-[24px]">
              {/* Universal Trailer Button */}
              {showTrailerButton && (
                <TrailerButton 
                  show={{
                    id: item.id || item.tmdbId || 0,
                    tmdbId: item.id || item.tmdbId,
                    title: item.title || item.name || 'Unknown'
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50 text-xs h-6 px-3 flex-shrink-0"
                  showLabel={true}
                />
              )}
              
              {/* Universal Calendar Button */}
              {showCalendarButton && (
                <Button 
                  size="sm" 
                  className="bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 border-teal-500/50 text-xs h-6 px-3 flex-shrink-0"
                  onClick={() => onAddCalendar?.(item)}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Calendar
                </Button>
              )}
              
              {showNotificationButton && (
                <Button 
                  size="sm" 
                  className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/50 text-xs h-6 px-2"
                  onClick={() => onSetNotification?.(item)}
                >
                  <Bell className="h-3 w-3 mr-1" />
                  Notify
                </Button>
              )}
              
              <Button 
                size="sm" 
                className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-purple-500/50 text-xs h-6 px-2"
                onClick={() => onAddToWatchlist?.(item)}
              >
                <Plus className="h-3 w-3 mr-1" />
                List
              </Button>
              
              {/* Enhanced Watch Now with Affiliate Links */}
              {showWatchNow && !isComingSoon && providers.length > 0 && (
                <div className="relative">
                  <StreamingPlatformSelector 
                    providers={providers} 
                    onSelectPlatform={handlePlatformClick}
                  />
                  {showAffiliateLinks && (
                    <div 
                      className="absolute -top-1 -right-1"
                      title="Supports content creators through affiliate partnerships"
                    >
                      <DollarSign className="h-3 w-3 text-green-400" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};