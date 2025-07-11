import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App-working";
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
    // Redirect to working HTML version
    window.location.replace('/index-simple.html');
  }
} catch (error) {
  console.error("❌ Error creating React app:", error);
  
  // Redirect to working HTML version instead of showing broken app
  window.location.replace('/index-simple.html');
}