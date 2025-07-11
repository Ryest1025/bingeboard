import React from "react";

console.log("App-minimal.tsx loaded");

export default function App() {
  console.log("App-minimal rendering");
  return React.createElement("div", null, "App Loaded");
}