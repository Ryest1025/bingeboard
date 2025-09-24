import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getPlatformLogo } from '@/utils/platformLogos';

interface StreamingPlatform {
  name: string;
  color: string;
}

const streamingPlatforms: StreamingPlatform[] = [
  { name: 'Netflix', color: '#E50914' },
  { name: 'Disney+', color: '#113CCF' },
  { name: 'Max', color: '#002BE7' },
  { name: 'Prime Video', color: '#00A8E1' },
  { name: 'Hulu', color: '#1CE783' },
  { name: 'Apple TV+', color: '#FFFFFF' },
  { name: 'Paramount+', color: '#0064FF' },
  { name: 'Peacock', color: '#FA6B00' },
  { name: 'Crunchyroll', color: '#FF6600' },
  { name: 'Showtime', color: '#FF0000' },
  { name: 'Starz', color: '#FFFFFF' },
  { name: 'Discovery+', color: '#0077C8' }
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
                      src={getPlatformLogo(platform.name)}
                      alt={platform.name}
                      className={`max-w-full max-h-full object-contain group-hover:brightness-125 transition-all duration-300 drop-shadow-2xl ${platform.color === '#FFFFFF' || platform.name === 'Apple TV+' || platform.name === 'Starz'
                          ? 'filter invert brightness-100'
                          : 'filter brightness-110'
                        }`}
                      style={{ maxWidth: '64px', maxHeight: '48px' }}
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
            Track, discover, and organize content from all major streaming platforms
          </p>
          <div className="flex flex-wrap justify-center gap-3">

          </div>
        </div>
      </div>
    </section>
  );
}
