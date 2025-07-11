import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🚀 MAIN.TSX LOADED");

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
  console.log("✅ React app rendered successfully");
} else {
  console.error("❌ Root element not found");
}