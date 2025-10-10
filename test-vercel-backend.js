// Test the Vercel backend endpoints directly
const vercelEndpoints = [
  'https://bingeboard-two.vercel.app/api/content/discover',
  'https://bingeboard-two.vercel.app/api/content/dashboard', 
  'https://bingeboard-two.vercel.app/api/content/genres-combined/list',
  'https://bingeboard-two.vercel.app/api/content/new-releases',
  'https://bingeboard-two.vercel.app/api/content/genres',
  'https://bingeboard-two.vercel.app/api/content/platforms'
];

console.log('Testing Vercel backend endpoints directly...\n');

for (const endpoint of vercelEndpoints) {
  try {
    const response = await fetch(endpoint);
    console.log(`${endpoint}: ${response.status} ${response.statusText}`);
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`  ✅ Success - backend is working`);
    } else if (response.status === 404) {
      console.log(`  ❌ 404 - endpoint might not exist on backend`);
    } else {
      console.log(`  ⚠️  Status: ${response.status}`);
    }
  } catch (error) {
    console.log(`${endpoint}: Error - ${error.message}`);
  }
  console.log('');
}