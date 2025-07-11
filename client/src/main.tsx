import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🚀 MAIN.TSX LOADED - Starting React app");

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
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Critical error: ' + error.message + '</div>';
}