import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Plus } from "lucide-react";
import StreamingLogos from "@/components/streaming-logos";
import TrailerButton from "@/components/trailer-button";

interface SpotlightCardProps {
  spotlight?: any;
}

function SpotlightSkeleton() {
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

export default function SpotlightCard({ spotlight }: SpotlightCardProps) {
  if (!spotlight) return <SpotlightSkeleton />;

  const title = spotlight.title || spotlight.name || "Unknown Title";
  const year =
    spotlight.release_date || spotlight.first_air_date
      ? new Date(
          spotlight.release_date || spotlight.first_air_date
        ).getFullYear()
      : "Unknown";
  const rating = spotlight.vote_average
    ? spotlight.vote_average.toFixed(1)
    : "N/A";

  return (
    <Card className="bg-slate-900 overflow-hidden group hover:shadow-2xl transition-all duration-300">
      <CardContent className="p-0">
        <div className="relative h-[360px] overflow-hidden group rounded-lg">

          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-600 z-0"></div>

          {/* Backdrop */}
          {(spotlight.backdrop_path || spotlight.poster_path) && (
            <img
              src={`https://image.tmdb.org/t/p/w1280${spotlight.backdrop_path || spotlight.poster_path}`}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                if (
                  spotlight.backdrop_path &&
                  spotlight.poster_path &&
                  !e.currentTarget.src.includes(spotlight.poster_path)
                ) {
                  e.currentTarget.src = `https://image.tmdb.org/t/p/w780${spotlight.poster_path}`;
                } else {
                  e.currentTarget.style.display = "none";
                }
              }}
            />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 z-10"></div>

          {/* Streaming Logos */}
          {spotlight.streamingPlatforms && spotlight.streamingPlatforms.length > 0 && (
            <div className="absolute top-6 right-6 z-20 flex gap-2">
              <StreamingLogos
                providers={spotlight.streamingPlatforms.map((platform: any) => ({
                  provider_id: platform.provider_id || platform.id,
                  provider_name: platform.provider_name || platform.name,
                  logo_path: platform.logo_path
                }))}
                size="sm"
                maxDisplayed={3}
              />
            </div>
          )}

          {/* Content */}
          <div className="relative z-20 flex h-full items-center p-8 gap-6">
            {/* Small Poster */}
            {spotlight.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w342${spotlight.poster_path}`}
                alt={`${title} Poster`}
                className="w-28 md:w-36 h-auto object-contain rounded-lg shadow-lg flex-shrink-0 z-20"
              />
            )}

            {/* Text & Buttons */}
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-4xl font-bold text-white mb-4">{title}</h2>

              <div className="flex flex-wrap items-center gap-2 mb-4 text-sm text-gray-300">
                <span>{spotlight.media_type === "tv" ? "TV Series" : "Movie"}</span>
                <span>•</span>
                <span>{year}</span>
                <span>•</span>
                <span>⭐ {rating}</span>
              </div>

              <p className="text-gray-200 mb-6 max-w-2xl text-base leading-relaxed">
                {spotlight.overview || "No description available."}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                <button 
                  onClick={() => {
                    // TODO: Integrate with watch functionality
                    alert(`Watch Now: ${title}`);
                  }}
                  className="bg-white text-black px-6 py-3 font-medium flex items-center gap-2 hover:bg-gray-200 hover:scale-105 transition-all duration-200 rounded shadow-lg hover:shadow-xl"
                >
                  <Play className="w-5 h-5" />
                  {spotlight.streamingPlatforms && spotlight.streamingPlatforms.length > 0 ? (
                    <span className="flex items-center gap-2">
                      Watch Now On
                      <StreamingLogos 
                        providers={[spotlight.streamingPlatforms[0]]}
                        size="sm"
                        maxDisplayed={1}
                      />
                    </span>
                  ) : (
                    'Watch Now'
                  )}
                </button>

                <TrailerButton 
                  show={{
                    id: spotlight.id,
                    tmdbId: spotlight.id,
                    title: title
                  }}
                  variant="secondary"
                  className="bg-gray-700/80 text-white px-6 py-3 font-medium hover:bg-gray-600 hover:scale-105 transition-all duration-200 rounded shadow-lg hover:shadow-xl backdrop-blur-sm border-none"
                  showLabel={true}
                />

                <button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/watchlist/add', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          id: spotlight.id,
                          title: title,
                          poster_path: spotlight.poster_path,
                          media_type: spotlight.media_type || 'tv',
                          vote_average: spotlight.vote_average,
                          overview: spotlight.overview
                        }),
                        credentials: 'include'
                      });
                      
                      if (response.ok) {
                        alert(`Added "${title}" to your watchlist!`);
                      } else {
                        alert('Failed to add to watchlist. Please try again.');
                      }
                    } catch (error) {
                      console.error('Error adding to watchlist:', error);
                      alert('Failed to add to watchlist. Please try again.');
                    }
                  }}
                  className="bg-gray-700/80 text-white px-6 py-3 font-medium flex items-center gap-2 hover:bg-gray-600 hover:scale-105 transition-all duration-200 rounded shadow-lg hover:shadow-xl backdrop-blur-sm"
                >
                  <Plus className="w-5 h-5" />
                  Add to List
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
