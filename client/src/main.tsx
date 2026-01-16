// App Version 16.13 - Add SMS password recovery with verification codes (Jan 16, 2026)
// Build timestamp: 2026-01-16T02:00:00Z
const BUILD_ID = "v16.13-20260116-020000";
console.log("🏗️ Build:", BUILD_ID);

import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// ✅ Firebase still used for debug helpers only
import { auth } from "@/firebase/config";
import { apiFetch } from "@/utils/api-config";

// 🚨 FORCE INCLUSION - Prevent tree-shaking of dashboard
import "@/pages/dashboard";
import "@/deployment-test";

console.log("🚀 MAIN.TSX LOADED - Starting React app");

// Handle GitHub Pages SPA routing
const handleSPARouting = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const redirectPath = urlParams.get('p');
  
  if (redirectPath && redirectPath !== '/') {
    // Remove the redirect parameter and navigate to the intended path
    const newUrl = window.location.origin + redirectPath;
    window.history.replaceState(null, '', newUrl);
    console.log('🔄 SPA routing: redirected from 404 to', redirectPath);
  }
};

// Call SPA routing handler before app initialization
handleSPARouting();

// -------------------- Firebase Debug Helpers --------------------
const setupFirebaseDebugHelpers = () => {
  try {
    if (!auth) {
      console.warn("⚠️ Firebase auth not available");
      return;
    }

    (window as any).firebaseAuth = auth;

    (window as any).testLogin = async () => {
      console.log("🧪 Testing login from console...");
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");
      provider.setCustomParameters({ prompt: "select_account" });

      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const token = await user.getIdToken(true);

        console.log("✅ Login success:", user.email);
        console.log("🔐 Token preview:", token.substring(0, 50) + "...");

        const apiResponse = await apiFetch("/api/auth/user", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("📡 API Status:", apiResponse.status);
        if (apiResponse.ok) {
          console.log("✅ API SUCCESS - User data:", await apiResponse.json());
        } else {
          console.log("❌ API Error:", await apiResponse.text());
        }
      } catch (err) {
        console.error("❌ Console login failed:", err);
      }
    };

    (window as any).testAPI = async () => {
      const user = auth.currentUser;
      if (!user) return console.log("❌ No user signed in. Run window.testLogin() first.");

      const token = await user.getIdToken(true);
      const res = await apiFetch("/api/auth/user", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      console.log("📡 API Status:", res.status);
      console.log(res.ok ? "✅ API Response:" : "❌ API Error:", await res.text());
    };

    (window as any).debugFirebase = async () => {
      console.log("🧪 Firebase Debug Info");
      const user = auth.currentUser;
      console.log(
        "🔹 Current User:",
        user ? { uid: user.uid, email: user.email } : "None"
      );
      if (user) {
        const token = await user.getIdToken(true);
        console.log("🔹 Token preview:", token.substring(0, 50) + "...");
      }
    };

    // Simple email/password helpers
    (window as any).createTestUser = async () => {
      const { createUserWithEmailAndPassword } = await import("firebase/auth");
      try {
        const result = await createUserWithEmailAndPassword(auth, 'test@example.com', 'password123');
        console.log('✅ Test user created:', result.user.email);
        return result;
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log('ℹ️ Test user already exists - try window.testEmailLogin()');
        } else {
          console.error('❌ Create user error:', error.message);
        }
      }
    };

    (window as any).testEmailLogin = async () => {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      try {
        const result = await signInWithEmailAndPassword(auth, 'test@example.com', 'password123');
        console.log('✅ Email login success:', result.user.email);
        return result;
      } catch (error: any) {
        console.error('❌ Email login error:', error.message);
      }
    };

    (window as any).resetPassword = async (email: string) => {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      try {
        await sendPasswordResetEmail(auth, email);
        console.log('✅ Password reset email sent to:', email);
        alert('✅ Password reset email sent! Check your email inbox.');
      } catch (error: any) {
        console.error('❌ Password reset error:', error.message);
        alert('❌ Password reset failed: ' + error.message);
      }
    };

    // Mobile-friendly reset for rachel.gubin@gmail.com
    (window as any).resetRachel = async () => {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      try {
        await sendPasswordResetEmail(auth, 'rachel.gubin@gmail.com');
        console.log('✅ Password reset email sent to: rachel.gubin@gmail.com');
        alert('✅ Password reset email sent to rachel.gubin@gmail.com! Check your email inbox.');
      } catch (error: any) {
        console.error('❌ Password reset error:', error.message);
        alert('❌ Password reset failed: ' + error.message);
      }
    };

    console.log("🧪 Firebase debug helpers available:");
    console.log("  - window.firebaseAuth");
    console.log("  - window.testLogin() (Google OAuth)");
    console.log("  - window.testEmailLogin() (test@example.com / password123)");
    console.log("  - window.createTestUser() (creates test@example.com)");
    console.log("  - window.resetPassword('email@example.com')");
    console.log("  - window.resetRachel() (resets rachel.gubin@gmail.com)");
    console.log("  - window.testAPI()");
    console.log("  - window.debugFirebase()");
  } catch (err) {
    console.warn("⚠️ Could not set up Firebase debug helpers:", err);
  }
};

// -------------------- Global Error Handling --------------------
window.addEventListener("error", (e) => {
  console.error("❌ Global error caught:", e.error);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("❌ Unhandled promise rejection:", e.reason);
});

// -------------------- Mobile Optimizations --------------------
const applyMobileOptimizations = () => {
  const ua = navigator.userAgent || "";
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  if (isMobile) {
    document.documentElement.classList.add("mobile-device");
    console.log("📱 Mobile device detected - optimizations applied");
  }
  console.log("📱 Device detection:", { userAgent: ua.substring(0, 50), isMobile });
};

// -------------------- Initialize React App --------------------
const initApp = () => {
  setupFirebaseDebugHelpers();
  applyMobileOptimizations();

  try {
    const rootEl = document.getElementById("root");
    if (!rootEl) throw new Error("Root element not found");

    const loadingTimeout = setTimeout(() => {
      rootEl.innerHTML = `
        <div style="color:white;padding:20px;background:#000;text-align:center;">
          <h1 style="color:#14b8a6;">BingeBoard</h1>
          <p>App is taking longer than expected to load...</p>
          <button onclick="window.location.reload()" 
            style="background:#14b8a6;color:white;padding:10px 20px;border:none;border-radius:5px;margin:10px;">
            Reload Page
          </button>
          <br><br>
          <a href="/debug-mobile.html" style="color:#14b8a6;">Debug Tools</a>
        </div>`;
    }, 10000);

    createRoot(rootEl).render(<App />);
    clearTimeout(loadingTimeout);
    
    // Hide the animated loading screen
    const loadingScreen = document.querySelector('.loading-fallback') as HTMLElement;
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
          loadingScreen.remove();
        }, 500);
      }, 100); // Small delay to ensure React has rendered
    }
    
    console.log("✅ React app rendered successfully");
  } catch (err) {
    console.error("❌ Critical error in main.tsx:", err);
    document.body.innerHTML = `<div style="color:red;padding:20px;">Critical error: ${
      (err as Error).message
    }</div>`;
  }
};

initApp();