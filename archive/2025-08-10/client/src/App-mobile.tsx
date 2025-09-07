import React from "react";

export default function App() {
  console.log("📱 Mobile App rendering");
  
  // Force immediate visibility and loading screen removal
  React.useEffect(() => {
    console.log("📱 Mobile App useEffect running");
    
    // Remove all possible loading screens
    const loadingElements = [
      document.querySelector('.loading-fallback'),
      document.getElementById('loading-fallback'),
      document.querySelector('[class*="loading"]'),
      document.querySelector('[id*="loading"]')
    ];
    
    loadingElements.forEach((element, index) => {
      if (element) {
        element.remove();
        console.log(`📱 Removed loading element ${index}`);
      }
    });
    
    // Force root visibility
    const root = document.getElementById('root');
    if (root) {
      root.style.display = 'block';
      root.style.visibility = 'visible';
      root.style.opacity = '1';
      console.log("📱 Root div made visible");
    }
    
    // Set document background
    document.body.style.backgroundColor = '#000000';
    document.body.style.color = '#ffffff';
    
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
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: '1rem',
      zIndex: 10000,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '30px',
        border: '2px solid #14b8a6',
        borderRadius: '15px',
        backgroundColor: '#111111',
        boxShadow: '0 0 30px rgba(20, 184, 166, 0.3)',
        maxWidth: '90vw',
        width: '100%'
      }}>
        <div style={{
          color: '#14b8a6',
          marginBottom: '20px',
          fontSize: '2.5rem',
          fontWeight: 'bold'
        }}>
          📱 BingeBoard
        </div>
        <div style={{
          color: '#ffffff',
          fontSize: '1.2rem',
          marginBottom: '15px'
        }}>
          Mobile Preview Working!
        </div>
        <div style={{
          color: '#9ca3af',
          fontSize: '0.9rem',
          marginBottom: '20px'
        }}>
          React app rendering correctly on mobile
        </div>
        <div style={{
          color: '#14b8a6',
          fontSize: '0.8rem',
          fontFamily: 'monospace',
          padding: '10px',
          backgroundColor: '#0a0a0a',
          borderRadius: '5px',
          border: '1px solid #14b8a6'
        }}>
          Environment: Mobile Replit Preview<br/>
          Time: {new Date().toLocaleTimeString()}<br/>
          Status: ✅ Operational
        </div>
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#1a1a1a',
          borderRadius: '10px',
          border: '1px solid #333333'
        }}>
          <div style={{
            color: '#ffffff',
            fontSize: '0.9rem',
            marginBottom: '10px'
          }}>
            Ready to restore full BingeBoard app?
          </div>
          <div style={{
            color: '#9ca3af',
            fontSize: '0.8rem'
          }}>
            This confirms mobile rendering is working
          </div>
        </div>
      </div>
    </div>
  );
}