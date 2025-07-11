console.log("🚀 BINGEBOARD MAIN.TSX LOADED - If you see this, the script is executing!");

if (typeof document !== 'undefined') {
  console.log("✅ DOM is available");

  // Create loading container (do NOT include #root inside it)
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-screen';
  loadingDiv.style.position = 'fixed';
  loadingDiv.style.top = '0';
  loadingDiv.style.left = '0';
  loadingDiv.style.width = '100vw';
  loadingDiv.style.height = '100vh';
  loadingDiv.style.background = '#000000';
  loadingDiv.style.color = '#ffffff';
  loadingDiv.style.display = 'flex';
  loadingDiv.style.alignItems = 'center';
  loadingDiv.style.justifyContent = 'center';
  loadingDiv.style.fontFamily = 'Arial, sans-serif';
  loadingDiv.style.zIndex = '9999';
  loadingDiv.innerHTML = `
    <div style="text-align: center;">
      <h1 style="color: #14b8a6; font-size: 3rem; margin-bottom: 1rem;">BingeBoard</h1>
      <p style="font-size: 1.5rem;">Loading React app...</p>
      <p style="color: #9ca3af; font-size: 1rem;">main.tsx is executing</p>
    </div>
  `;
  document.body.appendChild(loadingDiv);

  console.log("✅ Loading screen set");
} else {
  console.error("❌ DOM not available");
}

// Error handling
window.addEventListener('error', (e) => {
  console.error('❌ Global error:', e.error);
  const loadingDiv = document.getElementById('loading-screen');
  if (loadingDiv) {
    loadingDiv.innerHTML = `<div style="color: red; padding: 20px; font-size: 2rem;">ERROR: ${e.error?.message || e.message}</div>`;
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('❌ Unhandled promise rejection:', e.reason);
  const loadingDiv = document.getElementById('loading-screen');
  if (loadingDiv) {
    loadingDiv.innerHTML = `<div style="color: red; padding: 20px; font-size: 2rem;">PROMISE ERROR: ${e.reason}</div>`;
  }
});

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
        const loadingDiv = document.getElementById('loading-screen');
        if (loadingDiv && loadingDiv.parentNode) {
          loadingDiv.parentNode.removeChild(loadingDiv);
        }
      }, 1000);
      console.log("✅ React app rendered successfully");
    } else {
      console.error("❌ Root element not found!");
      const loadingDiv = document.getElementById('loading-screen');
      if (loadingDiv) {
        loadingDiv.innerHTML = `<div style="color: red; padding: 20px;">ERROR: Root element not found!</div>`;
      }
    }
  } catch (error) {
    console.error("❌ Error loading React:", error);
    const loadingDiv = document.getElementById('loading-screen');
    if (loadingDiv) {
      loadingDiv.innerHTML = `<div style="color: red; padding: 20px;">ERROR: ${error.message}</div>`;
    }
  }
});

console.log("✅ Main.tsx setup complete - waiting for DOM ready");
