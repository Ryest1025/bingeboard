// Debug script to test the exact filtering scenario
import { platformsMatch } from './client/src/utils/platform-normalizer';

async function debugCompleteFilteringScenario() {
  console.log('🔍 Starting complete filtering debug...');
  
  // Step 1: Get raw API data
  const response = await fetch('http://localhost:5000/api/content/trending-enhanced?mediaType=tv&timeWindow=day&includeStreaming=true');
  const apiData = await response.json();
  
  console.log('📥 Raw API data received');
  
  // Find Breaking Bad
  const breakingBadRaw = apiData.results.find(show => show.name === 'Breaking Bad');
  if (!breakingBadRaw) {
    console.log('❌ Breaking Bad not found in API data');
    return;
  }
  
  console.log('📺 Breaking Bad raw data:', {
    name: breakingBadRaw.name,
    platforms: breakingBadRaw.streamingPlatforms?.map(p => p.provider_name) || []
  });
  
  // Step 2: Simulate normalization (using the actual function)
  const streamingSources = [
    ...(breakingBadRaw.streamingPlatforms || []),
    ...(breakingBadRaw.streaming || []),
    ...(breakingBadRaw.streaming_platforms || [])
  ];
  
  console.log('🔄 Streaming sources before normalization:', streamingSources.length);
  
  // Remove duplicates (simplified version of the actual logic)
  const uniqueStreaming = streamingSources.reduce((unique, platform) => {
    const key = `${platform.provider_id || 0}-${platform.provider_name || platform.name || ''}`;
    const exists = unique.some(p => 
      `${p.provider_id || 0}-${p.provider_name || p.name || ''}` === key
    );
    
    if (!exists) {
      unique.push({
        provider_id: platform.provider_id || unique.length + 1,
        provider_name: platform.provider_name || platform.name || `Platform ${unique.length + 1}`,
        logo_path: platform.logo_path || null
      });
    }
    
    return unique;
  }, []);
  
  console.log('✅ Normalized streaming platforms:', {
    count: uniqueStreaming.length,
    platforms: uniqueStreaming.map(p => p.provider_name)
  });
  
  // Step 3: Test filtering with different Amazon variants
  const testNetworks = [
    'Amazon Prime Video',
    'Prime Video', 
    'Amazon Video',
    'prime-video'
  ];
  
  testNetworks.forEach(selectedNetwork => {
    console.log(`\n🎯 Testing filter with network: "${selectedNetwork}"`);
    
    const hasNetwork = uniqueStreaming.some(platform => {
      const providerName = platform.provider_name || platform.name || platform;
      const match = platformsMatch(selectedNetwork, providerName);
      console.log(`  "${providerName}" matches "${selectedNetwork}": ${match}`);
      return match;
    });
    
    console.log(`  ✅ Breaking Bad would be ${hasNetwork ? 'INCLUDED' : 'EXCLUDED'} for "${selectedNetwork}"`);
  });
}

// This would be run in browser console or test environment
export { debugCompleteFilteringScenario };