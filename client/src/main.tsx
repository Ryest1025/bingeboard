import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🚀 MAIN.TSX LOADED");

// Apply mobile optimizations
if (typeof window !== 'undefined') {
  // Add mobile-specific CSS classes
  const userAgent = navigator.userAgent || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|Mobile/i.test(userAgent);
  
  if (isMobile) {
    document.documentElement.classList.add('mobile-device');
    console.log("📱 Mobile device detected - optimizations applied");
  }
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
  console.log("✅ React app rendered successfully");
} else {
  console.error("❌ Root element not found");
}