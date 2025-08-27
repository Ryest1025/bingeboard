

import React from 'react';

// Official streaming platform logos - using actual files in /public/logos/
const logos = [
  { name: 'Netflix', logo: '/logos/icons8-netflix.svg' },
  { name: 'Prime Video', logo: '/logos/icons8-amazon-prime-video (1).svg' },
  { name: 'Hulu', logo: '/logos/icons8-hulu.svg' },
  { name: 'Disney+', logo: '/logos/icons8-disney-plus.svg' },
  { name: 'Max', logo: '/logos/icons8-hbo-max.svg' },
  { name: 'Apple TV+', logo: '/logos/Apple-tv-plus.svg' },
  { name: 'Peacock', logo: '/logos/icons8-peacock-tv.svg' },
  { name: 'Paramount+', logo: '/logos/icons8-paramount-plus.svg' },
  { name: 'Crunchyroll', logo: '/logos/icons8-crunchyroll.svg' },
  { name: 'ESPN+', logo: '/logos/671789-espn.svg' },
  { name: 'Showtime', logo: '/logos/Showtime--Streamline-Simple-Icons.svg' },
  { name: 'Starz', logo: '/logos/Starz--Streamline-Simple-Icons.svg' },
];

export default function StreamingMarqueeSection() {
  return (
    <div className="overflow-hidden relative">
      <div className="flex animate-marquee-left space-x-8 py-4">
        {logos.concat(logos).map((platform, i) => (
          <div
            key={i}
            className="bg-white/10 rounded-xl p-2 flex items-center justify-center"
          >
            <img
              src={platform.logo}
              alt={platform.name}
              className="h-10 md:h-12 object-contain drop-shadow-lg"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/logos/fallback.svg';
              }}
            />
          </div>
        ))}
      </div>

      <div className="absolute left-0 top-0 w-12 h-full bg-gradient-to-r from-gray-900 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 w-12 h-full bg-gradient-to-l from-gray-900 to-transparent pointer-events-none" />
    </div>
  );
}
