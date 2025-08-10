// Firebase Session Sync Fix
// This script will sync the Firebase authentication state with the local session

console.log('🔧 Starting Firebase session sync...');

async function syncFirebaseSession() {
  try {
    // Check if we have a local session
    const sessionResponse = await fetch('/api/auth/session', {
      credentials: 'include'
    });

    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      console.log('✅ Local session found:', sessionData);

      // Check Firebase auth state
      const { auth } = await import('/src/lib/firebase/config.ts');

      if (!auth.currentUser) {
        console.log('❌ Firebase user missing, attempting to restore...');

        // Try to get a fresh token from the session
        const tokenResponse = await fetch('/api/auth/firebase-token', {
          credentials: 'include'
        });

        if (tokenResponse.ok) {
          const { token } = await tokenResponse.json();

          // Sign in with the custom token
          const { signInWithCustomToken } = await import('firebase/auth');
          await signInWithCustomToken(auth, token);

          console.log('✅ Firebase user restored:', auth.currentUser?.email);
          return true;
        } else {
          console.log('❌ Could not get Firebase token from session');
          return false;
        }
      } else {
        console.log('✅ Firebase user already exists:', auth.currentUser.email);
        return true;
      }
    } else {
      console.log('❌ No local session found');
      return false;
    }
  } catch (error) {
    console.error('❌ Session sync failed:', error);
    return false;
  }
}

// Auto-run if this is called directly
if (typeof window !== 'undefined') {
  window.syncFirebaseSession = syncFirebaseSession;

  // Auto-sync on load
  setTimeout(async () => {
    const success = await syncFirebaseSession();
    if (success) {
      console.log('🔄 Reloading page to apply fix...');
      window.location.reload();
    }
  }, 1000);
}

export { syncFirebaseSession };
