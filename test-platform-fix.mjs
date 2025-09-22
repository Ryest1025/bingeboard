// Test the fix for network filtering
// Copy the platformsMatch function for testing

const PLATFORM_NORMALIZATIONS = {
  'hbo max': 'max',
  'hbo': 'max',
  'amazon prime video': 'prime-video',
  'prime video': 'prime-video',
  'amazon video': 'prime-video',
  'amazon prime': 'prime-video',
  'netflix': 'netflix',
  'netflix standard with ads': 'netflix'
};

const normalizePlatformName = (platformName) => {
  if (!platformName) return '';
  const normalized = platformName.toLowerCase().trim();
  return PLATFORM_NORMALIZATIONS[normalized] || normalized;
};

const platformsMatch = (platform1, platform2) => {
  if (!platform1 || !platform2) return false;
  const norm1 = normalizePlatformName(platform1);
  const norm2 = normalizePlatformName(platform2);
  return norm1 === norm2;
};

// Test different variations
const testCases = [
  { selected: 'Amazon Prime Video', provider: 'Amazon Video' },
  { selected: 'Amazon Prime Video', provider: 'Prime Video' },
  { selected: 'Amazon Prime Video', provider: 'Amazon Prime Video' },
  { selected: 'Amazon Prime', provider: 'Amazon Video' },
  { selected: 'Amazon Prime', provider: 'Prime Video' },
  { selected: 'Netflix', provider: 'Netflix' },
  { selected: 'Netflix', provider: 'Netflix Standard with Ads' },
  { selected: 'HBO Max', provider: 'Max' },
  { selected: 'Max', provider: 'HBO Max' }
];

console.log('🧪 Testing platform matching after fix...\n');

testCases.forEach(({ selected, provider }, index) => {
  const match = platformsMatch(selected, provider);
  console.log(`${index + 1}. "${selected}" matches "${provider}": ${match ? '✅' : '❌'}`);
});

console.log('\n🎯 Testing specific Amazon Prime Video filtering scenario:');
console.log('Selected Network: "Amazon Prime Video"');
console.log('Breaking Bad platforms: ["Netflix", "Amazon Video", "Prime Video"]');

const platforms = ["Netflix", "Amazon Video", "Prime Video"];
platforms.forEach(platform => {
  const match = platformsMatch('Amazon Prime Video', platform);
  console.log(`  "${platform}" matches "Amazon Prime Video": ${match ? '✅' : '❌'}`);
});

const hasAmazonMatch = platforms.some(platform => platformsMatch('Amazon Prime Video', platform));
console.log(`\n✅ Breaking Bad would be ${hasAmazonMatch ? 'INCLUDED' : 'EXCLUDED'} with "Amazon Prime Video" filter`);