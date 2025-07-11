import React from "react";

console.log("App-minimal.tsx loaded");

export default function App() {
  console.log("App-minimal rendering");
  return React.createElement("div", {
    style: {
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      fontSize: '2rem'
    }
  }, React.createElement("div", {
    style: {
      textAlign: 'center',
      color: '#14b8a6'
    }
  }, "✅ BingeBoard React App Loaded Successfully!"));
}