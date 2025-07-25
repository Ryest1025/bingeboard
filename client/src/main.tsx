import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🚀 MAIN.TSX LOADED - Starting React app");

// Set up Firebase auth persistence
const initFirebasePersistence = async () => {
  try {
    const { getAuth, setPersistence, browserLocalPersistence } = await import('firebase/auth');
    const auth = getAuth();
    await setPersistence(auth, browserLocalPersistence);
    console.log('✅ Firebase auth persistence set to local');
  } catch (error) {
    console.warn('⚠️ Could not set Firebase persistence:', error);
  }
};

// Initialize persistence
initFirebasePersistence();

// Add Firebase to global scope for debugging
const setupGlobalFirebase = async () => {
  try {
    const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const auth = getAuth();

    // Make Firebase easily accessible in console
    (window as any).firebaseAuth = auth;
    (window as any).testLogin = async () => {
      console.log('🧪 Testing login from console...');
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      try {
        console.log('🔐 Starting Google OAuth...');
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const token = await user.getIdToken(true); // Force refresh

        console.log("✅ Console login success:", user.email);
        console.log("🔐 Token length:", token.length);
        console.log("🔐 Token preview:", token.substring(0, 50) + "...");

        // Test the API immediately
        console.log('📡 Testing /api/auth/user endpoint...');
        const apiResponse = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📡 API Status:', apiResponse.status);

        if (apiResponse.ok) {
          const userData = await apiResponse.json();
          console.log('✅ API SUCCESS - User data:', userData);
          console.log('🎉 AUTHENTICATION COMPLETE! 401 → 200 transformation successful!');
        } else {
          const errorText = await apiResponse.text();
          console.log('❌ API Error:', errorText);
        }

        return { user, token, apiResponse };

      } catch (error) {
        console.error("❌ Console login failed:", error);
        console.log('💡 Make sure popups are allowed and try again');
        throw error;
      }
    };

    // Quick API test function
    (window as any).testAPI = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log('❌ No user signed in. Run window.testLogin() first.');
        return;
      }

      console.log('📡 Testing API with current user...');
      const token = await user.getIdToken(true);
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 API Status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response:', data);
      } else {
        const error = await response.text();
        console.log('❌ API Error:', error);
      }
    };

    console.log('🧪 Firebase debug helpers available:');
    console.log('  - window.firebaseAuth.currentUser (check login status)');
    console.log('  - window.testLogin() (complete OAuth + API test)');
    console.log('  - window.testAPI() (test current user\'s API access)');
    console.log('🚀 Current user:', auth.currentUser?.email || 'None logged in');

  } catch (error) {
    console.warn('⚠️ Could not set up Firebase debug helpers:', error);
  }
};

setupGlobalFirebase();

// Enhanced error handling
window.addEventListener('error', (e) => {
  console.error('❌ Global error caught:', e.error);
  console.error('Error details:', {
    message: e.error?.message,
    stack: e.error?.stack,
    filename: e.filename,
    lineno: e.lineno
  });
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('❌ Unhandled promise rejection:', e.reason);
});

// Apply mobile optimizations
if (typeof window !== 'undefined') {
  const userAgent = navigator.userAgent || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|Mobile/i.test(userAgent);

  console.log('📱 Device detection:', { userAgent: userAgent.substring(0, 50), isMobile });

  if (isMobile) {
    document.documentElement.classList.add('mobile-device');
    console.log("📱 Mobile device detected - optimizations applied");
  }
}

try {
  const root = document.getElementById("root");
  if (root) {
    console.log("✅ Root element found, creating React app");

    // Add timeout to detect stuck loading states
    const loadingTimeout = setTimeout(() => {
      console.error("❌ React app took too long to load - showing fallback");
      root.innerHTML = `
        <div style="color: white; padding: 20px; background: #000; text-align: center;">
          <h1 style="color: #14b8a6;">BingeBoard</h1>
          <p>App is taking longer than expected to load...</p>
          <p>Device: ${navigator.userAgent.substring(0, 50)}...</p>
          <button onclick="window.location.reload()" style="background: #14b8a6; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin: 10px;">
            Reload Page
          </button>
          <br><br>
          <a href="/debug-mobile.html" style="color: #14b8a6;">Debug Tools</a>
        </div>
      `;
    }, 10000); // 10 second timeout

    createRoot(root).render(<App />);
    console.log("✅ React app rendered successfully");

    // Clear timeout if app loads successfully
    clearTimeout(loadingTimeout);
  } else {
    console.error("❌ Root element not found in DOM");
    document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Root element not found</div>';
  }
} catch (error) {
  console.error("❌ Critical error in main.tsx:", error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Critical error: ' + errorMessage + '</div>';
}