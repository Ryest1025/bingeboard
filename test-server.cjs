// test-server.cjs
const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login with testuser@example.com / testpassword');
    const response = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: 'testuser@example.com',
      password: 'testpassword'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!', response.data);
  } catch (error) {
    console.error('Login failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    }
  }
}

testLogin();
