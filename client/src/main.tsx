console.log("🚀 Starting BingeBoard app...");
console.log("Environment:", import.meta.env.MODE);

// Add error listeners before anything else
window.addEventListener('error', (e) => {
  console.error('❌ Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('❌ Unhandled promise rejection:', e.reason);
});

try {
  console.log("📦 Importing React dependencies...");
  
  // Dynamic imports to catch module loading errors
  const { createRoot } = await import("react-dom/client");
  const App = (await import("./App-minimal")).default;
  
  console.log("✅ React dependencies loaded successfully");
  
  // Import CSS
  await import("./index.css");
  console.log("✅ CSS loaded successfully");
  
  const root = document.getElementById("root");
  if (root) {
    console.log("✅ Root element found, rendering React app...");
    createRoot(root).render(<App />);
    console.log("✅ React app rendered successfully");
  } else {
    console.error("❌ Root element not found!");
    document.body.innerHTML = '<div style="color: red; padding: 20px;">ERROR: Root element not found!</div>';
  }
} catch (error) {
  console.error("❌ Error rendering React app:", error);
  document.body.innerHTML = `<div style="color: red; padding: 20px;">ERROR: ${error.message}</div>`;
}
