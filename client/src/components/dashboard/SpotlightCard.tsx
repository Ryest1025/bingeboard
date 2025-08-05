import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";

interface SpotlightCardProps {
  spotlight?: any;
}

export default function SpotlightCard({ spotlight }: SpotlightCardProps) {
  if (!spotlight) {
    return (
      <Card className="bg-slate-900 overflow-hidden">
        <CardContent className="p-0">
          <div className="relative h-80 animate-pulse">
            <div className="absolute inset-0 bg-slate-700"></div>
            <div className="relative z-10 p-8 h-full flex flex-col justify-center">
              <div className="mb-4">
                <div className="bg-slate-600 h-5 w-24"></div>
              </div>
              <div className="bg-slate-600 h-10 w-64 mb-4"></div>
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-slate-600 h-4 w-20"></div>
                <div className="bg-slate-600 h-4 w-12"></div>
                <div className="bg-slate-600 h-4 w-16"></div>
              </div>
              <div className="bg-slate-600 h-12 w-32"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative h-80">
          {/* Background Image */}
          <div className="absolute inset-0">
            {/* Default gradient background */}
            <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-600"></div>
            
            {/* Image overlay (if available) */}
            {spotlight.backdrop_path && (
              <img
                src={`https://image.tmdb.org/t/p/w1280${spotlight.backdrop_path}`}
                alt={spotlight.title || spotlight.name}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                onLoad={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onError={(e) => {
                  console.error('Backdrop image failed to load:', spotlight.backdrop_path);
                  // Try poster as fallback
                  if (spotlight.poster_path && !e.currentTarget.src.includes('poster')) {
                    e.currentTarget.src = `https://image.tmdb.org/t/p/w780${spotlight.poster_path}`;
                  } else {
                    // Hide image and show gradient background
                    e.currentTarget.style.display = 'none';
                  }
                }}
                style={{ opacity: 0 }}
              />
            )}
            
            {!spotlight.backdrop_path && spotlight.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w780${spotlight.poster_path}`}
                alt={spotlight.title || spotlight.name}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                onLoad={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onError={(e) => {
                  console.error('Poster image failed to load:', spotlight.poster_path);
                  e.currentTarget.style.display = 'none';
                }}
                style={{ opacity: 0 }}
              />
            )}
            
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          </div>
          
          {/* Content overlay */}
          <div className="relative z-10 p-8 h-full flex flex-col justify-center">
            <div className="mb-4">
              <span className="text-orange-400 text-sm font-medium">#1 Trending</span>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-4">
              {spotlight.title || spotlight.name || "Unknown Title"}
            </h2>
            
            <div className="flex items-center gap-4 mb-6 text-sm text-gray-300">
              <span>{spotlight.media_type === 'tv' ? 'TV Series' : 'Movie'}</span>
              <span>•</span>
              <span>{spotlight.release_date ? new Date(spotlight.release_date).getFullYear() : spotlight.first_air_date ? new Date(spotlight.first_air_date).getFullYear() : "Unknown"}</span>
              <span>•</span>
              <span>⭐ {spotlight.vote_average ? spotlight.vote_average.toFixed(1) : "N/A"}</span>
            </div>
            
            <p className="text-gray-200 mb-6 max-w-2xl text-base leading-relaxed">
              {spotlight.overview || "No description available."}
            </p>
            
            <button className="bg-white text-black px-6 py-3 font-medium flex items-center gap-2 hover:bg-gray-200 transition w-fit">
              <Play className="w-5 h-5" />
              Watch Now
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
