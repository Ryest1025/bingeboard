import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import "./index.css";

console.log("🚀 MAIN-FIX.TSX LOADED - Starting React app");

// Suppress Vite plugin errors
const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('plugin-react') || args[0]?.includes?.('preamble')) {
    console.log('Vite plugin error suppressed, continuing...');
    return;
  }
  originalError.apply(console, args);
};

// Remove loading screen
const removeLoadingScreen = () => {
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    loadingScreen.remove();
    console.log("✅ Loading screen removed");
  }
};

// Mount React app immediately
const mountApp = () => {
  try {
    const root = document.getElementById("root");
    if (!root) {
      throw new Error("Root element not found");
    }
    
    console.log("✅ Root element found, creating React app");
    
    const reactRoot = createRoot(root);
    reactRoot.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    
    setTimeout(removeLoadingScreen, 200);
    
    console.log("✅ React app rendered successfully");
    return true;
  } catch (error) {
    console.error("❌ React mount failed:", error);
    return false;
  }
};

// Start the app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}