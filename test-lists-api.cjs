// test-lists-api.cjs
const axios = require('axios');

async function testListsApi() {
  try {
    // Get a test session first by logging in
    console.log('Testing login with testuser@example.com / testpassword');
    const loginResponse = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: 'testuser@example.com',
      password: 'testpassword'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    console.log('Login successful!', loginResponse.data);
    
    // Now try to fetch lists
    console.log('Fetching lists with type=my');
    const listsResponse = await axios.get('http://127.0.0.1:5000/api/lists?type=my', {
      withCredentials: true,
      headers: {
        Cookie: loginResponse.headers['set-cookie']?.join('; ')
      }
    });
    
    console.log('Lists API response:', listsResponse.data);
  } catch (error) {
    console.error('API test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    }
  }
}

testListsApi();
