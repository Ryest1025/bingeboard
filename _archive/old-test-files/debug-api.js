// Quick debug script to test the API response structure
import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('🧪 Testing trending-enhanced API...');
    
    const response = await fetch('http://localhost:5000/api/content/trending-enhanced?includeStreaming=true&limit=1');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const firstItem = data.results[0];
    
    console.log('\n=== FIRST TRENDING ITEM ===');
    console.log('Title:', firstItem.name || firstItem.title);
    console.log('ID:', firstItem.id);
    console.log('Media Type:', firstItem.media_type);
    
    console.log('\n=== STREAMING PLATFORMS DATA ===');
    console.log('Has streamingPlatforms:', 'streamingPlatforms' in firstItem);
    console.log('Has streaming:', 'streaming' in firstItem);
    
    if (firstItem.streamingPlatforms) {
      console.log('streamingPlatforms type:', typeof firstItem.streamingPlatforms);
      console.log('streamingPlatforms is array:', Array.isArray(firstItem.streamingPlatforms));
      console.log('streamingPlatforms length:', firstItem.streamingPlatforms.length);
      
      if (firstItem.streamingPlatforms.length > 0) {
        console.log('\n=== FIRST PLATFORM STRUCTURE ===');
        const platform = firstItem.streamingPlatforms[0];
        console.log('Platform object:', JSON.stringify(platform, null, 2));
        console.log('Has provider_name:', 'provider_name' in platform);
        console.log('Has logo_path:', 'logo_path' in platform);
        console.log('Has provider_id:', 'provider_id' in platform);
      }
    }
    
    if (firstItem.streaming) {
      console.log('\n=== STREAMING FIELD (alternative) ===');
      console.log('streaming type:', typeof firstItem.streaming);
      console.log('streaming content:', firstItem.streaming);
    }
    
    console.log('\n=== STREAMING STATS ===');
    if (firstItem.streamingStats) {
      console.log('Streaming stats:', JSON.stringify(firstItem.streamingStats, null, 2));
    }
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
  }
}

testAPI();