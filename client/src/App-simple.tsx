import React from "react";

export default function App() {
  // Force immediate visibility
  React.useEffect(() => {
    // Remove all loading elements
    const loadingElements = document.querySelectorAll('.loading-fallback, #loading-fallback, [class*="loading"]');
    loadingElements.forEach(el => el.remove());
    
    // Make root visible
    const root = document.getElementById('root');
    if (root) {
      root.style.display = 'block';
      root.style.visibility = 'visible';
      root.style.opacity = '1';
      root.style.zIndex = '1';
    }
    
    // Set body styles
    document.body.style.backgroundColor = '#000';
    document.body.style.color = '#fff';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    console.log("Simple app mounted and visible");
  }, []);
  
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        border: '2px solid #14b8a6',
        borderRadius: '15px',
        backgroundColor: '#111',
        maxWidth: '400px'
      }}>
        <h1 style={{
          color: '#14b8a6',
          fontSize: '2rem',
          marginBottom: '20px'
        }}>
          BingeBoard
        </h1>
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '15px'
        }}>
          App is working!
        </p>
        <p style={{
          color: '#9ca3af',
          fontSize: '1rem'
        }}>
          React rendering successfully
        </p>
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#222',
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          Time: {new Date().toLocaleTimeString()}<br/>
          Platform: {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}
        </div>
      </div>
    </div>
  );
}