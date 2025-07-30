// Firebase Login Flow Test Script
// Run in browser console to diagnose authentication issues

async function testFirebaseLoginFlow() {
  console.log('%c📋 Firebase Login Flow Test', 'font-size: 16px; font-weight: bold; color: #10b981;');
  
  // Step 1: Check if Firebase is loaded
  try {
    const firebaseAuth = firebase.auth();
    console.log('%c✅ Firebase loaded correctly', 'color: #10b981;');
  } catch (e) {
    console.error('%c❌ Firebase not loaded properly. Make sure you run this in the app after Firebase is initialized.', 'color: #ef4444;');
    return;
  }
  
  // Step 2: Check current auth state
  const currentUser = firebase.auth().currentUser;
  console.log(
    currentUser
      ? `%c👤 Currently logged in as: ${currentUser.email}`, 'color: #3b82f6;'
      : '%c👤 No user currently logged in', 'color: #f59e0b;'
  );
  
  // Step 3: Check for browser session cookie
  const cookies = document.cookie.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('session='));
  console.log(
    sessionCookie
      ? '%c🍪 Session cookie found: ' + sessionCookie.substring(0, 20) + '...', 'color: #10b981;'
      : '%c🍪 No session cookie found', 'color: #f59e0b;'
  );
  
  // Step 4: Try to verify session with backend
  try {
    console.log('%c📡 Checking backend session...', 'color: #8b5cf6;');
    const sessionResponse = await fetch('/api/auth/user', {
      credentials: 'include'
    });
    
    console.log(`%c📡 Backend response: ${sessionResponse.status}`, 
      sessionResponse.ok ? 'color: #10b981;' : 'color: #ef4444;'
    );
    
    if (sessionResponse.ok) {
      const userData = await sessionResponse.json();
      console.log('%c✅ Backend session active:', 'color: #10b981;', userData);
    } else {
      console.log('%c❌ No backend session', 'color: #ef4444;');
    }
  } catch (e) {
    console.error('%c❌ Error checking backend session:', 'color: #ef4444;', e);
  }
  
  // Step 5: If logged in but no session, try to create one
  if (currentUser && !sessionCookie) {
    try {
      console.log('%c🔄 User logged in but no session cookie. Creating session...', 'color: #8b5cf6;');
      
      const idToken = await currentUser.getIdToken();
      console.log('%c🔑 Got Firebase ID token', 'color: #10b981;');
      
      const sessionCreationResponse = await fetch('/api/auth/firebase-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ firebaseToken: idToken })
      });
      
      console.log(`%c📡 Session creation response: ${sessionCreationResponse.status}`,
        sessionCreationResponse.ok ? 'color: #10b981;' : 'color: #ef4444;'
      );
      
      if (sessionCreationResponse.ok) {
        console.log('%c✅ Session created successfully!', 'color: #10b981;');
        console.log('%c🔄 Please refresh the page to see if the session persists.', 'color: #8b5cf6;');
      } else {
        const errorData = await sessionCreationResponse.json();
        console.error('%c❌ Failed to create session:', 'color: #ef4444;', errorData);
      }
    } catch (e) {
      console.error('%c❌ Error creating session:', 'color: #ef4444;', e);
    }
  }
  
  // Summary
  console.log('%c📋 Test Summary', 'font-size: 14px; font-weight: bold; color: #8b5cf6;');
  console.log(`%c${currentUser ? '✅' : '❌'} Firebase Authentication: ${currentUser ? 'Logged in' : 'Not logged in'}`, 
    currentUser ? 'color: #10b981;' : 'color: #f59e0b;'
  );
  console.log(`%c${sessionCookie ? '✅' : '❌'} Session Cookie: ${sessionCookie ? 'Present' : 'Missing'}`,
    sessionCookie ? 'color: #10b981;' : 'color: #f59e0b;'
  );
  
  // Recommendations
  console.log('%c📝 Recommendations:', 'font-size: 14px; font-weight: bold; color: #8b5cf6;');
  
  if (!currentUser) {
    console.log('%c1. Sign in using the login form or run: firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())', 'color: #3b82f6;');
  } else if (!sessionCookie) {
    console.log('%c1. Create a session by running this test again or manually calling /api/auth/firebase-session', 'color: #3b82f6;');
  } else {
    console.log('%c1. Everything looks good! If you still have issues, try clearing cookies and cache, then logging in again.', 'color: #10b981;');
  }
}

// Run the test
testFirebaseLoginFlow();
