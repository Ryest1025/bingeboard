import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Play, Plus, Calendar, Bell } from 'lucide-react';
import { StreamingLogos } from './StreamingLogos';
import { StreamingPlatformSelector } from './StreamingPlatformSelector';

interface ContentCardProps {
  item: any;
  type?: "compact" | "grid";
  showStreamingLogos?: boolean;
  showCalendarButton?: boolean;
  showNotificationButton?: boolean;
  showWatchNow?: boolean;
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
  isComingSoon = false,
  releaseDate,
  onWatchNow,
  onAddToWatchlist,
  onAddCalendar,
  onSetNotification
}) => {
  const providers = item.watchProviders || item.streamingProviders || item.streamingPlatforms || [];
  
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
                {showStreamingLogos && <StreamingLogos providers={providers} />}
                {isComingSoon && releaseDate && (
                  <div className="mb-2">
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                      <Calendar className="h-2 w-2 mr-1" />
                      {releaseDate}
                    </Badge>
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  <Button 
                    size="sm" 
                    className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50 text-xs h-5 px-1"
                    onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent((item.title || item.name) + ' trailer')}`, '_blank')}
                  >
                    <Play className="h-2 w-2 mr-1" />
                    Trailer
                  </Button>
                  
                  {showCalendarButton && (
                    <Button 
                      size="sm" 
                      className="bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 border-teal-500/50 text-xs h-5 px-1"
                      onClick={() => onAddCalendar?.(item)}
                    >
                      <Calendar className="h-2 w-2 mr-1" />
                      Cal
                    </Button>
                  )}
                  
                  {showNotificationButton && (
                    <Button 
                      size="sm" 
                      className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/50 text-xs h-5 px-1"
                      onClick={() => onSetNotification?.(item)}
                    >
                      <Bell className="h-2 w-2 mr-1" />
                      Bell
                    </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-purple-500/50 text-xs h-5 px-1"
                    onClick={() => onAddToWatchlist?.(item)}
                  >
                    <Plus className="h-2 w-2 mr-1" />
                    Add
                  </Button>
                  
                  {showWatchNow && !isComingSoon && (
                    <StreamingPlatformSelector 
                      providers={providers} 
                      onSelectPlatform={(platform) => onWatchNow?.(item, platform)}
                    />
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
            
            {showStreamingLogos && <StreamingLogos providers={providers} />}
            {isComingSoon && releaseDate && (
              <div className="mb-2">
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {releaseDate}
                </Badge>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex items-center gap-1 mt-3 flex-wrap">
              <Button 
                size="sm" 
                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50 text-xs h-6 px-2"
                onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent((item.title || item.name) + ' trailer')}`, '_blank')}
              >
                <Play className="h-3 w-3 mr-1" />
                Trailer
              </Button>
              
              {showCalendarButton && (
                <Button 
                  size="sm" 
                  className="bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 border-teal-500/50 text-xs h-6 px-2"
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
              
              {showWatchNow && !isComingSoon && (
                <StreamingPlatformSelector 
                  providers={providers} 
                  onSelectPlatform={(platform) => onWatchNow?.(item, platform)}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};