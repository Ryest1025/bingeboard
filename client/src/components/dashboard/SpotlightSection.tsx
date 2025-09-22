import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Bell } from 'lucide-react';
import type { NormalizedMedia } from '@/types/media';

const SpotlightSection: React.FC<{ shows: NormalizedMedia[] }> = ({ shows }) => {
  const [index, setIndex] = useState(0);
  const spotlight = shows[index];

  if (!spotlight) {
    return (
      <section className="relative h-96 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Loading Spotlight...</h2>
          <p className="text-slate-400">Fetching featured content</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-96 rounded-xl overflow-hidden bg-slate-800">
      {spotlight.backdrop_path && (
        <img
          src={`https://image.tmdb.org/t/p/w1280${spotlight.backdrop_path}`}
          alt={spotlight.title}
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="absolute bottom-8 left-8 max-w-lg space-y-4">
        <h1 className="text-4xl font-bold text-white">{spotlight.title}</h1>
        <p className="text-gray-200 line-clamp-3">{spotlight.overview}</p>
        <div className="flex gap-3">
          <Button size="lg" className="bg-white text-black hover:bg-gray-200">
            <Play className="w-5 h-5 mr-2" /> Watch Now
          </Button>
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
            <Bell className="w-5 h-5 mr-2" /> Add to Watchlist
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SpotlightSection;
