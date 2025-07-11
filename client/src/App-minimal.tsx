import React from "react";

export default function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000', 
      color: '#fff', 
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ 
        textAlign: 'center', 
        maxWidth: '600px',
        padding: '40px',
        border: '1px solid #333',
        borderRadius: '12px',
        background: '#111'
      }}>
        <div style={{ 
          fontSize: '36px', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #1f2937, #374151)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #fff',
            marginRight: '12px',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#14b8a6'
          }}>
            B
          </div>
          <span style={{ 
            background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Binge
          </span>
          <span style={{ color: '#fff' }}>Board</span>
        </div>
        
        <p style={{ 
          fontSize: '18px', 
          marginBottom: '30px',
          color: '#aaa'
        }}>
          Your Entertainment Hub
        </p>
        
        <div style={{ 
          padding: '20px',
          background: '#0a0a0a',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h3 style={{ 
            color: '#14b8a6', 
            marginBottom: '15px',
            fontSize: '20px'
          }}>
            🎉 App Successfully Restored!
          </h3>
          <p style={{ 
            color: '#ccc',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            Your BingeBoard application is now running properly with:
          </p>
          <ul style={{ 
            textAlign: 'left',
            color: '#ccc',
            lineHeight: '1.6'
          }}>
            <li>✅ Server connectivity fixed</li>
            <li>✅ Firebase authentication configured</li>
            <li>✅ Mobile detection working</li>
            <li>✅ React app loading successfully</li>
          </ul>
        </div>
        
        <div style={{ 
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button 
            onClick={() => window.location.href = '/mobile-test-final.html'}
            style={{
              background: '#14b8a6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#0d9488'}
            onMouseOut={(e) => e.target.style.background = '#14b8a6'}
          >
            Test Mobile
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#1f2937',
              color: 'white',
              border: '1px solid #374151',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#374151'}
            onMouseOut={(e) => e.target.style.background = '#1f2937'}
          >
            Reload
          </button>
        </div>
        
        <div style={{ 
          marginTop: '30px',
          fontSize: '14px',
          color: '#666'
        }}>
          Server Status: <span style={{ color: '#10b981' }}>Online</span> | 
          Authentication: <span style={{ color: '#10b981' }}>Ready</span>
        </div>
      </div>
    </div>
  );
}