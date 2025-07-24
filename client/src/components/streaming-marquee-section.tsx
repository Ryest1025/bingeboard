import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StreamingPlatform {
  name: string;
  logo: string;
  color: string;
}

const streamingPlatforms: StreamingPlatform[] = [
  { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', color: '#E50914' },
  { name: 'Disney+', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Disney%2B_logo.svg', color: '#113CCF' },
  { name: 'Max', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Max_logo.svg', color: '#002BE7' },
  { name: 'Prime Video', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png', color: '#00A8E1' },
  { name: 'Hulu', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg', color: '#1CE783' },
  { name: 'Apple TV+', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg', color: '#000000' },
  { name: 'Paramount+', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Paramount_Plus_logo.svg', color: '#0064FF' },
  { name: 'Peacock', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Peacock_logo.svg', color: '#FA6B00' },
  { name: 'Crunchyroll', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Crunchyroll_Logo.svg', color: '#FF6600' },
  { name: 'Showtime', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Showtime.svg', color: '#FF0000' },
  { name: 'Starz', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Starz_logo.svg', color: '#000000' },
  { name: 'Discovery+', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Discovery_Plus_logo.svg', color: '#0077C8' }
];

export function StreamingMarqueeSection() {
  // Duplicate the platforms for seamless looping
  const duplicatedPlatforms = [...streamingPlatforms, ...streamingPlatforms, ...streamingPlatforms];

  return (
    <section className="py-16 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-teal-600/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-900/50 to-transparent"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-2 text-sm border-teal-500/30 text-teal-400 bg-teal-500/10">
            ✨ Content From All Your Favorite Platforms
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Watch from <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Everywhere</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            BingeBoard aggregates content from all major streaming platforms, so you never miss what's worth watching.
          </p>
        </div>

        {/* Streaming Platforms Marquee */}
        <div className="relative">
          {/* Gradient Masks for Fade Effect */}
          <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-20 pointer-events-none"></div>
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent z-20 pointer-events-none"></div>
          
          {/* Marquee Container */}
          <div className="flex overflow-hidden">
            <div className="flex animate-marquee-left space-x-16 py-8">
              {duplicatedPlatforms.map((platform, index) => (
                <div
                  key={`${platform.name}-${index}`}
                  className="flex-shrink-0 group cursor-pointer flex flex-col items-center"
                >
                  {/* Platform Logo - No Box */}
                  <div className="w-20 h-20 flex items-center justify-center relative group-hover:scale-110 transition-all duration-300">
                    <img
                      src={platform.logo}
                      alt={platform.name}
                      className="max-w-full max-h-full object-contain filter brightness-110 group-hover:brightness-125 transition-all duration-300 drop-shadow-2xl"
                      style={{ maxWidth: '64px', maxHeight: '48px' }}
                      onError={(e) => {
                        // Fallback to text if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'text-white font-semibold text-xs text-center';
                        fallback.style.color = platform.color;
                        fallback.textContent = platform.name;
                        target.parentNode?.appendChild(fallback);
                      }}
                    />
                    
                    {/* Hover Effect Glow */}
                    <div 
                      className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl scale-150"
                      style={{ backgroundColor: platform.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm mb-6">
            Track, discover, and organize content from 50+ streaming services
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="px-3 py-1 text-xs bg-slate-800/50 text-gray-300 border-slate-700">
              🎬 Movies & TV Shows
            </Badge>
            <Badge variant="secondary" className="px-3 py-1 text-xs bg-slate-800/50 text-gray-300 border-slate-700">
              🔍 Smart Recommendations
            </Badge>
            <Badge variant="secondary" className="px-3 py-1 text-xs bg-slate-800/50 text-gray-300 border-slate-700">
              📱 Cross-Platform Sync
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
