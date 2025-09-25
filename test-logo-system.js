// Test the platform logo system with real API data
console.log("🧪 Testing Platform Logo System");

// Test the API data structure
fetch('/api/trending/tv/day?includeStreaming=true')
  .then(response => response.json())
  .then(data => {
    if (data.results && data.results[0] && data.results[0].streamingPlatforms) {
      const platforms = data.results[0].streamingPlatforms.slice(0, 5);
      console.log("🎬 Sample streaming platforms:");
      
      platforms.forEach((platform, index) => {
        console.log(`${index + 1}. ${platform.provider_name}`);
        console.log(`   logo_path: ${platform.logo_path}`);
        console.log(`   Is external URL: ${platform.logo_path?.startsWith('http')}`);
        console.log(`   Expected result: ${platform.logo_path?.startsWith('http') ? platform.logo_path : `https://image.tmdb.org/t/p/w92${platform.logo_path}`}`);
        console.log('---');
      });
    }
  })
  .catch(error => console.error('❌ Error testing logos:', error));