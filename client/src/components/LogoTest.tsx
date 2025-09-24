import React from 'react';
import { getPlatformLogo } from '@/utils/platformLogos';

const testPlatforms = [
  'Netflix',
  'Hulu',
  'Disney Plus',
  'HBO Max',
  'Max',
  'Amazon Prime Video',
  'Apple TV Plus',
  'Paramount Plus',
  'Peacock',
  'Starz',
  'Showtime',
  'Crunchyroll',
  'ESPN',
  'Discovery Plus'
];

export function LogoTest() {
  return (
    <div className="p-4 bg-slate-900 text-white">
      <h2 className="text-xl font-bold mb-4">Platform Logo Test</h2>
      <div className="grid grid-cols-4 gap-4">
        {testPlatforms.map(platform => {
          const logoUrl = getPlatformLogo(platform);
          return (
            <div key={platform} className="flex flex-col items-center p-2 bg-slate-800 rounded">
              <img 
                src={logoUrl} 
                alt={platform}
                className="w-8 h-8 mb-2"
                onError={(e) => {
                  console.error(`Failed to load logo for ${platform}:`, logoUrl);
                }}
              />
              <span className="text-xs text-center">{platform}</span>
              <span className="text-xs text-gray-400 text-center break-all">{logoUrl}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LogoTest;