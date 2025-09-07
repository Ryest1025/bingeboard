// Script to run in the browser console to manually create a session
// Copy and paste this into your browser console on the login page

async function testSessionCreation() {
  // Get current Firebase user
  const auth = firebase.auth();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    console.error('❌ No Firebase user found. Please login first!');
    return;
  }
  
  console.log('✅ Firebase user found:', currentUser.email);
  
  try {
    // Get the Firebase ID token
    const token = await currentUser.getIdToken();
    console.log('✅ Got Firebase token');
    
    // Send to backend to create a session
    const response = await fetch('/api/auth/firebase-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ firebaseToken: token })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Session created successfully!', data);
      
      // Test the session by making a request to the user endpoint
      const userResponse = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('✅ Session verification successful!', userData);
        console.log('✅ Login flow is working properly!');
      } else {
        console.error('❌ Session verification failed:', await userResponse.text());
      }
    } else {
      console.error('❌ Session creation failed:', await response.text());
    }
  } catch (error) {
    console.error('❌ Error creating session:', error);
  }
}

// Run the test
testSessionCreation();
