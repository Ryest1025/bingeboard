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
    createRoot(root).render(<App />);
    console.log("✅ React app rendered successfully");
  } else {
    console.error("❌ Root element not found in DOM");
    // Create emergency fallback
    document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Root element not found</div>';
  }
} catch (error) {
  console.error("❌ Critical error in main.tsx:", error);
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Critical error: ' + error.message + '</div>';
}