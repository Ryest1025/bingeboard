console.log("🚀 BINGEBOARD MAIN.TSX LOADED - If you see this, the script is executing!");

// Simple React app initialization - no DOM manipulation
async function initializeReactApp() {
  console.log("✅ Starting React app...");
  
  try {
    const { createRoot } = await import("react-dom/client");
    const App = (await import("./App-minimal")).default;
    
    console.log("✅ React modules loaded");

    const root = document.getElementById("root");
    if (root) {
      console.log("✅ Root element found, rendering React app...");
      createRoot(root).render(<App />);
      console.log("✅ React app rendered successfully");
    } else {
      console.error("❌ Root element not found!");
    }
  } catch (error) {
    console.error("❌ Error loading React:", error);
  }
}

// Start React app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeReactApp);
} else {
  initializeReactApp();
}

console.log("✅ Main.tsx setup complete");
