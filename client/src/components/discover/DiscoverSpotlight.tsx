import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import StreamingLogos from '@/components/streaming-logos';

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
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
  ctaText?: string;
  delay?: number;
}

export const DiscoverSpotlight: React.FC<DiscoverSpotlightProps> = ({
  title,
  badge,
  badgeColor,
  feature,
  onWatchNow,
  onAddToList,
  ctaText = 'Watch Now',
  delay = 0
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
                />
              </div>
            )}
            <div className="flex gap-2 pt-1">
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
