import { createRoot } from "react-dom/client";
import App from "./App-minimal";
import "./index.css";

console.log("🚀 Starting BingeBoard app...");

try {
  const root = document.getElementById("root");
  if (root) {
    console.log("✅ Root element found, rendering React app...");
    createRoot(root).render(<App />);
    console.log("✅ React app rendered successfully");
  } else {
    console.error("❌ Root element not found!");
  }
} catch (error) {
  console.error("❌ Error rendering React app:", error);
}
