import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StreamingLogos from '@/components/streaming-logos';

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  streaming?: Array<{
    provider_id?: number;
    provider_name?: string;
    logo_path?: string;
  }>;
}

interface DiscoverSpotlightProps {
  title: string;
  badge: string;
  badgeColor: string;
  feature: MediaItem | null;
  onWatchNow: (media: MediaItem) => void;
  onAddToList: (media: MediaItem) => void;
  onSetReminder?: (media: MediaItem) => void;
  ctaText?: string;
  delay?: number;
  isUpcoming?: boolean;
}

export const DiscoverSpotlight: React.FC<DiscoverSpotlightProps> = ({
  title,
  badge,
  badgeColor,
  feature,
  onWatchNow,
  onAddToList,
  onSetReminder,
  ctaText = 'Watch Now',
  delay = 0,
  isUpcoming = false
}) => {
  if (!feature) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative h-64 md:h-72 rounded-2xl overflow-hidden shadow-2xl group"
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ 
          backgroundImage: `url(https://image.tmdb.org/t/p/w1280${feature.backdrop_path})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent" />
      
      {/* Content */}
      <div className="relative h-full flex items-end p-6 md:p-8">
        <div className="flex gap-4 md:gap-6 items-end max-w-4xl w-full">
          {/* Poster */}
          <img
            src={`https://image.tmdb.org/t/p/w342${feature.poster_path}`}
            alt={feature.title || feature.name}
            className="w-24 md:w-32 rounded-lg shadow-xl hidden sm:block transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Info */}
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${badgeColor} text-white text-xs font-bold rounded-full`}>
                {badge}
              </span>
            </div>
            <h3 className="text-sm text-gray-400 font-medium tracking-wide uppercase">{title}</h3>
            <h2 className="text-xl md:text-2xl font-bold text-white transition-colors duration-300 group-hover:text-teal-400">
              {feature.title || feature.name}
            </h2>
            <p className="text-gray-300 text-sm line-clamp-2 max-w-2xl">
              {feature.overview}
            </p>
            {feature.streaming && feature.streaming.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">Available on:</span>
                <StreamingLogos 
                  providers={feature.streaming.filter((p): p is {provider_id: number; provider_name: string; logo_path?: string} => 
                    Boolean(p.provider_id && p.provider_name)
                  )} 
                  maxDisplayed={1}
                  size="sm"
                />
              </div>
            )}
            <div className="flex gap-2 pt-1">
              {!isUpcoming && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onWatchNow(feature);
                  }}
                  size="sm"
                  className="bg-white text-black hover:bg-gray-200 px-4 py-1.5 text-sm font-semibold"
                >
                  ▶ {ctaText}
                </Button>
              )}
              
              {isUpcoming && onSetReminder && (
                <>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetReminder(feature);
                    }}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 px-4 py-1.5 text-sm font-semibold shadow-lg"
                  >
                    <Bell className="w-4 h-4 mr-1.5" />
                    Remind Me
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to calendar
                      const releaseDate = feature.release_date || feature.first_air_date;
                      if (releaseDate) {
                        const date = new Date(releaseDate);
                        const dateStr = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                        const title = feature.title || feature.name;
                        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title + ' Release')}&dates=${dateStr}/${dateStr}&details=${encodeURIComponent('New release on streaming platforms')}`;
                        window.open(url, '_blank');
                      }
                    }}
                    size="sm"
                    variant="outline"
                    className="text-white border-white/50 hover:bg-white/10 px-4 py-1.5 text-sm"
                  >
                    <Calendar className="w-4 h-4 mr-1.5" />
                    Add to Calendar
                  </Button>
                </>
              )}
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToList(feature);
                }}
                size="sm"
                variant="outline"
                className="text-white border-white/50 hover:bg-white/10 px-4 py-1.5 text-sm"
              >
                + My List
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
