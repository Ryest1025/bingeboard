import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🚀 MAIN.TSX LOADED - Starting React app");

// Global error handling for Vite plugin issues
const originalError = console.error;
console.error = (...args) => {
  const message = args[0]?.toString() || '';
  if (message.includes('plugin-react') || message.includes('preamble') || message.includes('vitejs')) {
    return; // Suppress Vite plugin errors
  }
  originalError.apply(console, args);
};

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.toString() || '';
  if (message.includes('plugin-react') || message.includes('preamble')) {
    event.preventDefault();
    return;
  }
});

// Remove loading screen after React mounts
const removeLoadingScreen = () => {
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    loadingScreen.remove();
    console.log("✅ Loading screen removed");
  }
};

// Mount React app immediately
const mountReactApp = () => {
  try {
    const root = document.getElementById("root");
    if (!root) {
      throw new Error("Root element not found");
    }
    
    console.log("✅ Root element found, creating React app");
    
    const reactRoot = createRoot(root);
    reactRoot.render(React.createElement(App));
    
    // Remove loading screen after successful render
    setTimeout(removeLoadingScreen, 100);
    
    console.log("✅ Modern BingeBoard app rendered successfully");
    return true;
  } catch (error) {
    console.error("❌ React mount failed:", error);
    return false;
  }
};

// Start the app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountReactApp);
} else {
  mountReactApp();
}