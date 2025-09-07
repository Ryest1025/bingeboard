import { createRoot } from "react-dom/client";
import "./index.css";

function TestApp() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-teal-400">BingeBoard</h1>
        <p className="text-xl">React is working!</p>
        <p className="text-gray-400 mt-2">Testing app loading...</p>
      </div>
    </div>
  );
}

console.log("main-test.tsx is loading...");

const root = document.getElementById("root");
if (root) {
  console.log("Root element found, rendering React app...");
  createRoot(root).render(<TestApp />);
} else {
  console.error("Root element not found!");
}