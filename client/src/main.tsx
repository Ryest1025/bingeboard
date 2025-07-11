// IMMEDIATE CONSOLE LOG - This should appear in browser console
console.log("🚀 BINGEBOARD MAIN.TSX LOADED - If you see this, the script is executing!");

// Add immediate DOM manipulation to test if script runs
document.body.style.backgroundColor = '#000000';
document.body.style.color = '#ffffff';

// Show loading message immediately
const loadingDiv = document.createElement('div');
loadingDiv.innerHTML = `
  <div style="
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000000;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Arial, sans-serif;
    z-index: 9999;
  ">
    <div style="text-align: center;">
      <h1 style="color: #14b8a6; font-size: 3rem; margin-bottom: 1rem;">BingeBoard</h1>
      <p style="font-size: 1.5rem;">Loading React app...</p>
      <p style="color: #9ca3af; font-size: 1rem;">main.tsx is executing</p>
    </div>
  </div>
`;
document.body.appendChild(loadingDiv);

console.log("✅ Loading screen added to page");

// Set up error handling
window.addEventListener('error', (e) => {
  console.error('❌ Global error:', e.error);
  loadingDiv.innerHTML = `<div style="color: red; padding: 20px;">ERROR: ${e.error.message}</div>`;
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('❌ Unhandled promise rejection:', e.reason);
  loadingDiv.innerHTML = `<div style="color: red; padding: 20px;">PROMISE ERROR: ${e.reason}</div>`;
});

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log("✅ DOM ready, starting React app...");
  
  try {
    const { createRoot } = await import("react-dom/client");
    const App = (await import("./App-minimal")).default;
    
    console.log("✅ React modules loaded");
    
    const root = document.getElementById("root");
    if (root) {
      console.log("✅ Root element found, rendering React app...");
      createRoot(root).render(<App />);
      
      // Remove loading screen after React renders
      setTimeout(() => {
        if (loadingDiv.parentNode) {
          loadingDiv.parentNode.removeChild(loadingDiv);
        }
      }, 1000);
      
      console.log("✅ React app rendered successfully");
    } else {
      console.error("❌ Root element not found!");
      loadingDiv.innerHTML = `<div style="color: red; padding: 20px;">ERROR: Root element not found!</div>`;
    }
  } catch (error) {
    console.error("❌ Error loading React:", error);
    loadingDiv.innerHTML = `<div style="color: red; padding: 20px;">ERROR: ${error.message}</div>`;
  }
});

console.log("✅ Main.tsx setup complete - waiting for DOM ready");
