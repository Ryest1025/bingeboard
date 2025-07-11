console.log("🚀 BINGEBOARD MAIN.TSX LOADED - If you see this, the script is executing!");

// Simple React app initialization - no DOM manipulation
async function initializeReactApp() {
  console.log("✅ Starting React app...");
  
  try {
    const React = await import("react");
    const { createRoot } = await import("react-dom/client");
    const AppModule = await import("./App-minimal");
    const App = AppModule.default;
    
    console.log("✅ React modules loaded");
    console.log("✅ App component:", App);

    const root = document.getElementById("root");
    if (root) {
      console.log("✅ Root element found, rendering React app...");
      
      // Create simple element without JSX to test
      const reactRoot = createRoot(root);
      const element = React.createElement(App);
      reactRoot.render(element);
      
      console.log("✅ React app rendered successfully");
    } else {
      console.error("❌ Root element not found!");
    }
  } catch (error) {
    console.error("❌ Error loading React:", error);
    console.error("❌ Error details:", error.message);
    console.error("❌ Error stack:", error.stack);
  }
}

// Start React app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeReactApp);
} else {
  initializeReactApp();
}

console.log("✅ Main.tsx setup complete");
