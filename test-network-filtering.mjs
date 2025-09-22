// Simple platformsMatch implementation for testing
function platformsMatch(selectedNetwork, providerName) {
  if (!selectedNetwork || !providerName) return false;
  
  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const selected = normalize(selectedNetwork);
  const provider = normalize(providerName);
  
  // Direct match
  if (selected === provider) return true;
  
  // Amazon variants
  const amazonVariants = ['amazonprimevideo', 'primevideo', 'amazonvideo', 'prime'];
  if (amazonVariants.includes(selected) && amazonVariants.includes(provider)) return true;
  
  // Check if one contains the other
  if (selected.includes(provider) || provider.includes(selected)) return true;
  
  return false;
}

async function testNetworkFiltering() {
  console.log('🎯 Testing network filtering simulation...');
  
  try {
    // Get the data from trending-enhanced API
    const response = await fetch('http://localhost:5000/api/content/trending-enhanced?mediaType=tv&timeWindow=day&includeStreaming=true');
    const data = await response.json();
    
    console.log(`📥 Got ${data.results.length} shows from API`);
    
    // Simulate the client-side normalization (simplified)
    const shows = data.results.map(show => {
      // Consolidate streaming sources like the client does
      const streamingSources = [
        ...(show.streamingPlatforms || []),
        ...(show.streaming || []),
        ...(show.streaming_platforms || [])
      ];
      
      // Remove duplicates
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
      
      return {
        ...show,
        streaming: uniqueStreaming
      };
    });
    
    console.log('\n📊 Normalized shows with streaming platforms:');
    shows.forEach(show => {
      console.log(`  "${show.name || show.title}": ${show.streaming.length} platforms`);
      if (show.name === 'Breaking Bad' || show.title === 'Breaking Bad') {
        console.log(`    🔍 Breaking Bad platforms:`, show.streaming.map(p => p.provider_name));
      }
    });
    
    // Test filtering with Amazon Prime Video
    const selectedNetwork = 'Amazon Prime Video';
    console.log(`\n🎯 Testing filter with: "${selectedNetwork}"`);
    
    const filteredShows = shows.filter(show => {
      const platforms = show.streaming || [];
      
      const hasNetwork = platforms.some(platform => {
        const providerName = platform.provider_name || platform.name || platform;
        const match = platformsMatch(selectedNetwork, providerName);
        
        if (show.name === 'Breaking Bad' || show.title === 'Breaking Bad') {
          console.log(`    🔍 "${providerName}" matches "${selectedNetwork}": ${match}`);
        }
        
        return match;
      });
      
      if (show.name === 'Breaking Bad' || show.title === 'Breaking Bad') {
        console.log(`    ✅ Breaking Bad would be ${hasNetwork ? 'INCLUDED' : 'EXCLUDED'}`);
      }
      
      return hasNetwork;
    });
    
    console.log(`\n📊 Results: ${filteredShows.length} shows match "${selectedNetwork}"`);
    filteredShows.forEach(show => {
      console.log(`  ✅ "${show.name || show.title}"`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testNetworkFiltering().catch(console.error);