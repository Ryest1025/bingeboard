import React from "react";

export default function App() {
  console.log("🎯 App-debug rendering");
  
  // Force immediate visibility
  React.useEffect(() => {
    console.log("🎯 App-debug useEffect running");
    const fallback = document.querySelector('.loading-fallback');
    if (fallback) {
      fallback.remove();
      console.log("🎯 Removed loading fallback");
    }
  }, []);
  
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
        border: '3px solid #14b8a6',
        borderRadius: '10px',
        backgroundColor: '#111111',
        boxShadow: '0 0 20px #14b8a6'
      }}>
        <div style={{
          color: '#14b8a6',
          marginBottom: '20px',
          fontSize: '3rem',
          fontWeight: 'bold'
        }}>
          ✅ BingeBoard Debug
        </div>
        <div style={{
          color: '#ffffff',
          fontSize: '1.5rem',
          marginBottom: '10px'
        }}>
          React App Working!
        </div>
        <div style={{
          color: '#9ca3af',
          fontSize: '1rem',
          marginTop: '10px'
        }}>
          If you can see this, React is rendering correctly
        </div>
        <div style={{
          color: '#14b8a6',
          fontSize: '0.9rem',
          marginTop: '10px',
          fontFamily: 'monospace'
        }}>
          Check console for step-by-step logs
        </div>
        <div style={{
          color: '#ffffff',
          fontSize: '0.8rem',
          marginTop: '15px',
          padding: '10px',
          border: '1px solid #14b8a6',
          borderRadius: '5px',
          backgroundColor: '#0a0a0a'
        }}>
          <div>Environment: {typeof window !== 'undefined' ? 'Browser' : 'Server'}</div>
          <div>URL: {typeof window !== 'undefined' ? window.location.href : 'Unknown'}</div>
          <div>Time: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  );
}