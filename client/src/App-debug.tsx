import React from "react";

export default function App() {
  console.log("🚀 App-debug rendering");
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      zIndex: 9999
    }}>
      {/* BingeBoard Logo */}
      <div style={{
        width: '80px',
        height: '80px',
        background: 'linear-gradient(135deg, #14b8a6, #3b82f6)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(20, 184, 166, 0.3)'
      }}>
        <div style={{
          color: 'white',
          fontSize: '2rem',
          fontWeight: '900'
        }}>B</div>
      </div>
      
      {/* Title */}
      <h1 style={{
        fontSize: '3rem',
        fontWeight: '900',
        marginBottom: '1rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #14b8a6, #3b82f6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        BingeBoard
      </h1>
      
      <p style={{
        fontSize: '1.2rem',
        color: '#9ca3af',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        Your Entertainment Hub
      </p>
      
      {/* Debug Message */}
      <div style={{
        background: 'rgba(20, 184, 166, 0.1)',
        border: '1px solid rgba(20, 184, 166, 0.3)',
        borderRadius: '8px',
        padding: '1rem 2rem',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#14b8a6',
          marginBottom: '0.5rem'
        }}>
          🔍 Debug Mode
        </div>
        <div style={{
          color: '#9ca3af',
          fontSize: '1rem',
          marginBottom: '1rem'
        }}>
          Testing React app display - Time: {new Date().toLocaleTimeString()}
        </div>
        <div style={{
          color: '#ffffff',
          fontSize: '0.9rem',
          lineHeight: '1.5'
        }}>
          If you can see this, React is working. The issue is with the complex components.
          <br />
          Let's restore your beautiful modern designs step by step.
        </div>
      </div>
    </div>
  );
}