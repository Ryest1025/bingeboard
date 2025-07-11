console.log("🚀 MAIN.TSX LOADED");

// Error handlers first
window.addEventListener('error', (e) => {
  console.error('❌ RUNTIME ERROR:', e.error);
  console.error('❌ ERROR MESSAGE:', e.message);
  console.error('❌ ERROR STACK:', e.error?.stack);
  
  // Show error on screen
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="color: red; padding: 20px; background: #000; font-family: Arial;">
        <h2>JavaScript Error</h2>
        <p><strong>Message:</strong> ${e.message}</p>
        <p><strong>File:</strong> ${e.filename}:${e.lineno}</p>
        <pre>${e.error?.stack || 'No stack trace'}</pre>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('❌ PROMISE REJECTION:', e.reason);
  
  // Show error on screen
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="color: red; padding: 20px; background: #000; font-family: Arial;">
        <h2>Promise Rejection</h2>
        <p><strong>Reason:</strong> ${e.reason}</p>
      </div>
    `;
  }
});

// Very simple initialization
async function initApp() {
  console.log("✅ INIT APP STARTING");
  
  try {
    // Test basic React import
    console.log("✅ STEP 1: Importing React");
    const React = await import("react");
    console.log("✅ STEP 2: React imported:", !!React);
    
    // Test ReactDOM import
    console.log("✅ STEP 3: Importing ReactDOM");
    const { createRoot } = await import("react-dom/client");
    console.log("✅ STEP 4: ReactDOM imported:", !!createRoot);
    
    // Test App import
    console.log("✅ STEP 5: Importing App");
    const AppModule = await import("./App-minimal");
    console.log("✅ STEP 6: App module:", AppModule);
    console.log("✅ STEP 7: App component:", AppModule.default);
    
    // Find root
    const root = document.getElementById("root");
    console.log("✅ STEP 8: Root element:", !!root);
    
    if (root && React && createRoot && AppModule.default) {
      console.log("✅ STEP 9: Creating React root");
      const reactRoot = createRoot(root);
      
      console.log("✅ STEP 10: Rendering component");
      reactRoot.render(React.createElement(AppModule.default));
      
      console.log("✅ STEP 11: SUCCESS - React app rendered");
      
      // Hide the loading fallback screen
      const loadingFallback = document.querySelector('.loading-fallback');
      if (loadingFallback) {
        loadingFallback.style.display = 'none';
        console.log("✅ STEP 12: Loading screen hidden");
      }
    } else {
      console.error("❌ MISSING REQUIREMENTS");
    }
    
  } catch (error) {
    console.error("❌ INIT ERROR:", error);
    console.error("❌ ERROR TYPE:", typeof error);
    console.error("❌ ERROR NAME:", error.name);
    console.error("❌ ERROR MESSAGE:", error.message);
    console.error("❌ ERROR STACK:", error.stack);
    
    // Show error on screen
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="color: red; padding: 20px; background: #000; font-family: Arial;">
          <h2>Initialization Error</h2>
          <p><strong>Message:</strong> ${error.message}</p>
          <p><strong>Type:</strong> ${error.name}</p>
          <pre>${error.stack}</pre>
        </div>
      `;
    }
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

console.log("✅ MAIN.TSX SETUP COMPLETE");
