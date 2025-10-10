// Test the actual content endpoints that should exist
const contentEndpoints = [
  'https://bingeboard-two.vercel.app/api/content/dashboard',
  'https://bingeboard-two.vercel.app/api/content/discover',
  'https://bingeboard-two.vercel.app/api/content/search'
];

console.log('Testing actual backend content endpoints...\n');

for (const endpoint of contentEndpoints) {
  try {
    const response = await fetch(endpoint);
    console.log(`${endpoint}: ${response.status} ${response.statusText}`);
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`  ✅ Success - content endpoint is working`);
      // Try to get first bit of response to verify structure
      const text = await response.text();
      const preview = text.substring(0, 100);
      console.log(`  📋 Response preview: ${preview}${text.length > 100 ? '...' : ''}`);
    } else if (response.status === 404) {
      console.log(`  ❌ 404 - endpoint not found on backend`);
    } else {
      console.log(`  ⚠️  Status: ${response.status}`);
    }
  } catch (error) {
    console.log(`${endpoint}: Error - ${error.message}`);
  }
  console.log('');
}

// Test some other endpoints that might exist
console.log('Testing other known endpoints...\n');

const otherEndpoints = [
  'https://bingeboard-two.vercel.app/api/trending/tv/day',
  'https://bingeboard-two.vercel.app/api/recommendations',
  'https://bingeboard-two.vercel.app/api/continue-watching'
];

for (const endpoint of otherEndpoints) {
  try {
    const response = await fetch(endpoint);
    console.log(`${endpoint}: ${response.status} ${response.statusText}`);
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`  ✅ Success`);
    } else {
      console.log(`  ❌ Status: ${response.status}`);
    }
  } catch (error) {
    console.log(`${endpoint}: Error - ${error.message}`);
  }
}