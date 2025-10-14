// Quick test to debug the network filtering issue

async function testNetworkFiltering() {
  console.log('🔍 Testing network filtering...');
  
  // Get trending data
  const response = await fetch('/api/content/trending-enhanced?mediaType=tv&timeWindow=day&includeStreaming=true');
  const data = await response.json();
  
  // Find shows with Amazon platforms
  const showsWithAmazon = data.results.filter(show => {
    return show.streamingPlatforms?.some(platform => 
      platform.provider_name?.toLowerCase().includes('amazon') ||
      platform.provider_name?.toLowerCase().includes('prime')
    );
  });
  
  console.log('🎯 Shows with Amazon/Prime platforms:', showsWithAmazon.length);
  
  showsWithAmazon.forEach(show => {
    console.log(`\n📺 ${show.name || show.title}:`);
    console.log('  Amazon platforms:', show.streamingPlatforms
      .filter(p => p.provider_name?.toLowerCase().includes('amazon') || p.provider_name?.toLowerCase().includes('prime'))
      .map(p => p.provider_name)
    );
    console.log('  All platforms:', show.streamingPlatforms.map(p => p.provider_name));
  });
  
  return showsWithAmazon;
}

// Run the test
testNetworkFiltering();