// Test script for lists API
import fetch from 'node-fetch';

async function testListsAPI() {
  try {
    // Create a mock authorization token for testing
    const mockToken = 'mock-token-for-testing-' + Date.now();
    
    console.log('📋 Testing lists API with mock token...');
    const response = await fetch('http://localhost:5000/api/lists?type=my', {
      headers: {
        'Authorization': `Bearer ${mockToken}`
      }
    });
    
    if (!response.ok) {
      console.error('❌ Error fetching lists:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Lists API response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error in test script:', error);
  }
}

testListsAPI();
