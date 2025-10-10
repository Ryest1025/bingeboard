// Test script to verify API routing after fixes
const testEndpoints = [
  'https://bingeboardapp.com/api/content/discover',
  'https://bingeboardapp.com/api/content/dashboard', 
  'https://bingeboardapp.com/api/content/genres-combined/list',
  'https://bingeboardapp.com/api/content/new-releases',
  'https://bingeboardapp.com/api/content/genres',
  'https://bingeboardapp.com/api/content/platforms'
];

console.log('Testing API endpoints that were causing 404 errors...\n');

for (const endpoint of testEndpoints) {
  try {
    const response = await fetch(endpoint);
    console.log(`${endpoint}: ${response.status} ${response.statusText}`);
    
    if (response.status === 404) {
      console.log(`  ❌ Still getting 404 - this should route to Vercel backend`);
    } else if (response.status >= 200 && response.status < 300) {
      console.log(`  ✅ Success - properly routed`);
    } else {
      console.log(`  ⚠️  Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.log(`${endpoint}: Error - ${error.message}`);
  }
  console.log('');
}

console.log('Note: These endpoints should now be handled by apiFetch() in the React app');
console.log('which will route them to https://bingeboard-two.vercel.app instead of the local domain');