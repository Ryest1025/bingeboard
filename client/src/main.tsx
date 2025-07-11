import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🚀 MAIN.TSX LOADED - Starting React app");

// Handle Vite plugin errors gracefully
window.addEventListener('error', (event) => {
  if (event.error?.message?.includes('plugin-react')) {
    console.log('Vite plugin error detected, continuing with React mount...');
    event.preventDefault();
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

// Improved React mounting with retry mechanism
const mountReactApp = async (retries = 3) => {
  try {
    const root = document.getElementById("root");
    if (!root) {
      throw new Error("Root element not found");
    }
    
    console.log("✅ Root element found, creating React app");
    
    const reactRoot = createRoot(root);
    reactRoot.render(<App />);
    
    // Remove loading screen after successful render
    setTimeout(removeLoadingScreen, 500);
    
    console.log("✅ React app rendered successfully");
    return true;
  } catch (error) {
    console.error(`❌ React mount attempt failed:`, error);
    
    if (retries > 0) {
      console.log(`🔄 Retrying React mount (${retries} attempts left)...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mountReactApp(retries - 1);
    }
    
    return false;
  }
};

// Mount React app with fallback
mountReactApp().then(success => {
  if (!success) {
    console.log("BingeBoard fallback loaded - React mounting failed");
    
    // Show fallback message
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = `
        <div style="color: white; padding: 20px; background: #000; text-align: center; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
          <div>
            <h2 style="font-size: 2rem; margin-bottom: 1rem;">BingeBoard</h2>
            <p style="margin-bottom: 1rem;">React app failed to load. Refreshing...</p>
            <button onclick="window.location.reload()" style="background: #14b8a6; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
              Refresh Page
            </button>
          </div>
        </div>
      `;
    }
  }
});