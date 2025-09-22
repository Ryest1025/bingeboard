// Quick test of our universal media normalization system
import fetch from 'node-fetch';

async function testBreakingBadNormalization() {
  try {
    console.log('🧪 Testing Breaking Bad normalization...');
    
    // Search for Breaking Bad
    const response = await fetch('http://localhost:5000/api/search?query=Breaking+Bad');
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      console.log('❌ No Breaking Bad results found');
      return;
    }
    
    const breakingBadShow = data.results.find(show => 
      (show.title || show.name || '').includes('Breaking Bad')
    );
    
    if (!breakingBadShow) {
      console.log('❌ Breaking Bad not found in results');
      return;
    }
    
    console.log('📺 Breaking Bad raw data:', {
      title: breakingBadShow.title || breakingBadShow.name,
      streaming_platforms: breakingBadShow.streaming_platforms?.length || 0,
      streamingPlatforms: breakingBadShow.streamingPlatforms?.length || 0,
      streaming: breakingBadShow.streaming?.length || 0
    });
    
    // Test normalization (we'd need to import our normalizeMedia function)
    console.log('✅ Breaking Bad found in search results');
    console.log('🎯 Raw streaming platforms:', breakingBadShow.streaming_platforms || []);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBreakingBadNormalization();