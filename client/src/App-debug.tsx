import React from "react";

export default function App() {
  console.log("🎯 App-debug rendering");
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      fontSize: '2rem',
      zIndex: 10000
    }}>
      <div style={{
        textAlign: 'center',
        padding: '20px',
        border: '2px solid #14b8a6',
        borderRadius: '10px',
        backgroundColor: '#111111'
      }}>
        <div style={{
          color: '#14b8a6',
          marginBottom: '20px',
          fontSize: '3rem'
        }}>
          ✅ BingeBoard
        </div>
        <div style={{
          color: '#ffffff',
          fontSize: '1.5rem'
        }}>
          React App Working!
        </div>
        <div style={{
          color: '#9ca3af',
          fontSize: '1rem',
          marginTop: '10px'
        }}>
          Loading screen removed successfully
        </div>
      </div>
    </div>
  );
}