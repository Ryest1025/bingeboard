// Direct test of the logo system in browser console
// Copy and paste this into browser console to test

console.log('🧪 Testing Logo System...');

// Test 1: Check API data
fetch('/api/trending/tv/day?includeStreaming=true')
  .then(response => response.json())
  .then(data => {
    console.log('✅ API Response:', data);
    
    const showWithStreaming = data.results.find(show => 
      show.streamingPlatforms && show.streamingPlatforms.length > 0
    );
    
    if (showWithStreaming) {
      console.log('✅ Found show with streaming:', showWithStreaming.name);
      console.log('✅ Streaming platforms:', showWithStreaming.streamingPlatforms.map(p => ({
        name: p.provider_name,
        logo_path: p.logo_path,
        isExternal: p.logo_path?.startsWith('http'),
        expectedUrl: p.logo_path?.startsWith('http') 
          ? p.logo_path 
          : `https://image.tmdb.org/t/p/w92${p.logo_path}`
      })));
      
      // Test logo URLs
      const testPlatform = showWithStreaming.streamingPlatforms[0];
      const logoUrl = testPlatform.logo_path?.startsWith('http') 
        ? testPlatform.logo_path 
        : `https://image.tmdb.org/t/p/w92${testPlatform.logo_path}`;
        
      console.log('🧪 Testing logo URL:', logoUrl);
      
      // Create test image to see if it loads
      const testImg = new Image();
      testImg.onload = () => console.log('✅ Logo URL works:', logoUrl);
      testImg.onerror = () => console.log('❌ Logo URL failed:', logoUrl);
      testImg.src = logoUrl;
      
    } else {
      console.log('❌ No shows with streaming data found');
    }
  })
  .catch(error => console.error('❌ API Error:', error));

// Test 2: Check if getPlatformLogo function exists
setTimeout(() => {
  if (window.React) {
    console.log('✅ React is available');
    
    // Try to access the logo function
    try {
      // This won't work from console but shows the approach
      console.log('🧪 To test getPlatformLogo, check the LogoSystemTest component in top-right corner');
    } catch (e) {
      console.log('❌ Logo function not accessible from console');
    }
  }
}, 1000);

console.log('🧪 Test complete. Check the LogoSystemTest widget in top-right corner of the page.');