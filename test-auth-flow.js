// Test script to check if authentication is working after the fix
console.log("🧪 Testing authentication fix...");

// Wait for the page to load completely
setTimeout(async () => {
  try {
    console.log("🔍 Checking current state...");
    console.log("Current URL:", window.location.href);
    
    // Check if Firebase helpers are available
    if (window.testEmailLogin) {
      console.log("🔑 Testing login with testEmailLogin()...");
      await window.testEmailLogin();
      
      // Wait a moment for auth state to propagate
      setTimeout(() => {
        console.log("📍 Final URL after login:", window.location.href);
        if (window.location.href.includes('/dashboard')) {
          console.log("✅ SUCCESS: Redirected to dashboard!");
        } else if (window.location.href.includes('/login') || window.location.href.includes('/landing')) {
          console.log("❌ STILL BOUNCING: Still on login/landing page");
        } else {
          console.log("⚠️ UNKNOWN STATE:", window.location.href);
        }
      }, 3000);
      
    } else {
      console.log("❌ Test login function not available");
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}, 2000);