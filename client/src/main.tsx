console.log("🚀 MAIN.TSX LOADED");

// Enhanced error handlers for debugging
window.addEventListener('error', (e) => {
  console.error('❌ RUNTIME ERROR:', e.error);
  console.error('❌ ERROR MESSAGE:', e.message);
  console.error('❌ ERROR STACK:', e.error?.stack);
  console.error('❌ ERROR FILE:', e.filename, 'LINE:', e.lineno);
  
  // Show error on screen but don't prevent React from trying to render
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.9); color: red; padding: 20px; 
    font-family: Arial; z-index: 99999; overflow: auto;
  `;
  errorDiv.innerHTML = `
    <h2>JavaScript Error Detected</h2>
    <p><strong>Message:</strong> ${e.message}</p>
    <p><strong>File:</strong> ${e.filename}:${e.lineno}</p>
    <pre>${e.error?.stack || 'No stack trace'}</pre>
    <button onclick="this.parentNode.remove()" style="background: #14b8a6; color: white; padding: 10px; border: none; margin-top: 10px;">Close</button>
  `;
  document.body.appendChild(errorDiv);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('❌ PROMISE REJECTION:', e.reason);
  
  // Show error but don't prevent React from trying to render
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.9); color: red; padding: 20px; 
    font-family: Arial; z-index: 99999; overflow: auto;
  `;
  errorDiv.innerHTML = `
    <h2>Promise Rejection</h2>
    <p><strong>Reason:</strong> ${e.reason}</p>
    <button onclick="this.parentNode.remove()" style="background: #14b8a6; color: white; padding: 10px; border: none; margin-top: 10px;">Close</button>
  `;
  document.body.appendChild(errorDiv);
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
    const AppModule = await import("./App-simple");
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
      
      // Hide the loading fallback screen with multiple methods
      const loadingFallback = document.querySelector('.loading-fallback');
      const loadingFallbackById = document.getElementById('loading-fallback');
      
      if (loadingFallback) {
        loadingFallback.style.display = 'none';
        loadingFallback.remove();
        console.log("✅ STEP 12: Loading screen hidden via class");
      }
      
      if (loadingFallbackById) {
        loadingFallbackById.style.display = 'none';
        loadingFallbackById.remove();
        console.log("✅ STEP 12b: Loading screen hidden via ID");
      }
      
      // Ensure root div is visible
      const rootDiv = document.getElementById('root');
      if (rootDiv) {
        rootDiv.style.display = 'block';
        rootDiv.style.visibility = 'visible';
        rootDiv.style.opacity = '1';
        console.log("✅ STEP 13: Root div made visible");
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
