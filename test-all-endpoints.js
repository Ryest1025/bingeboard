// Test all potentially working endpoints to see what data is available
const endpoints = [
  'https://bingeboard-two.vercel.app/api/health',
  'https://bingeboard-two.vercel.app/api/trending/tv/day',
  'https://bingeboard-two.vercel.app/api/continue-watching',
  'https://bingeboard-two.vercel.app/api/recommendations',
  'https://bingeboard-two.vercel.app/api/awards',
  'https://bingeboard-two.vercel.app/api/progress',
  'https://bingeboard-two.vercel.app/api/multiapi/trailer/tv/1',
  'https://bingeboard-two.vercel.app/api/trending/movie/day',
  'https://bingeboard-two.vercel.app/api/trending/tv/week',
  'https://bingeboard-two.vercel.app/api/discover/tv',
  'https://bingeboard-two.vercel.app/api/popular/tv',
  'https://bingeboard-two.vercel.app/api/popular/movie'
];

console.log('Testing all potentially working endpoints...\n');

for (const endpoint of endpoints) {
  try {
    const response = await fetch(endpoint);
    console.log(`${endpoint}: ${response.status} ${response.statusText}`);
    
    if (response.status >= 200 && response.status < 300) {
      const text = await response.text();
      let preview = text.substring(0, 150);
      if (text.length > 150) preview += '...';
      console.log(`  ✅ Response: ${preview}`);
    } else {
      console.log(`  ❌ Failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
  console.log('');
}