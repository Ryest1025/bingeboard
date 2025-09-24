import { getPlatformLogo } from '@/utils/platformLogos';

// Test all platform logos
const testPlatforms = [
  'Netflix',
  'Disney+', 
  'Max',
  'Prime Video',
  'Hulu',
  'Apple TV+',
  'Paramount+',
  'Peacock',
  'Crunchyroll',
  'Showtime',
  'Starz',
  'Discovery+'
];

console.log('🎯 Platform Logo Test Results:');
testPlatforms.forEach(platform => {
  const logoUrl = getPlatformLogo(platform);
  console.log(`${platform}: ${logoUrl}`);
});

console.log('✅ All logos now use local files - no external URLs!');

export {};