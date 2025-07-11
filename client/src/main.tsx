import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🚀 MAIN.TSX LOADED - Starting React app");

// Remove loading screen after React mounts
const removeLoadingScreen = () => {
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    loadingScreen.remove();
    console.log("✅ Loading screen removed");
  }
};

try {
  const root = document.getElementById("root");
  if (root) {
    console.log("✅ Root element found, creating React app");
    
    const reactRoot = createRoot(root);
    reactRoot.render(<App />);
    
    // Remove loading screen after a short delay
    setTimeout(removeLoadingScreen, 1000);
    
    console.log("✅ React app rendered successfully");
  } else {
    console.error("❌ Root element not found");
  }
} catch (error) {
  console.error("❌ Error creating React app:", error);
  
  // Fallback display
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = '<div style="color: white; padding: 20px; background: #000; text-align: center;"><h2>BingeBoard</h2><p>Loading React app...</p></div>';
  }
}