import React from "react";

export default function TestApp() {
  return (
    <div style={{
      background: 'linear-gradient(to bottom, #000, #0a0a0a)',
      color: '#fff',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '40px',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, #1f2937, #374151)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #fff',
            marginRight: '15px',
            fontSize: '24px',
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
          <span>Board</span>
        </div>
        
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '20px',
          lineHeight: '1.1'
        }}>
          What To <span style={{
            background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Binge</span> Next!
        </h1>
        
        <p style={{
          fontSize: '20px',
          color: '#aaa',
          maxWidth: '600px',
          margin: '0 auto 40px'
        }}>
          Track your favorite shows, discover new content, and connect with friends who share your taste in entertainment.
        </p>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '60px'
        }}>
          <button style={{
            background: '#14b8a6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            Start Tracking
          </button>
          <button style={{
            background: 'transparent',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            border: '1px solid #374151',
            fontSize: '16px',
            cursor: 'pointer'
          }}>
            Learn More
          </button>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          textAlign: 'left'
        }}>
          <div style={{
            background: '#111',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              fontSize: '24px'
            }}>
              📺
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>Track Everything</h3>
            <p style={{ color: '#aaa', lineHeight: '1.6' }}>
              Keep track of all your favorite shows, episodes, and seasons in one place.
            </p>
          </div>
          
          <div style={{
            background: '#111',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              fontSize: '24px'
            }}>
              🎯
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>Smart Recommendations</h3>
            <p style={{ color: '#aaa', lineHeight: '1.6' }}>
              Get personalized show recommendations based on your viewing history.
            </p>
          </div>
          
          <div style={{
            background: '#111',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              fontSize: '24px'
            }}>
              👥
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>Social Features</h3>
            <p style={{ color: '#aaa', lineHeight: '1.6' }}>
              Connect with friends and see what others are watching.
            </p>
          </div>
        </div>
        
        <div style={{
          marginTop: '60px',
          padding: '40px',
          background: '#111',
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <h2 style={{
            fontSize: '24px',
            marginBottom: '20px',
            color: '#14b8a6'
          }}>
            ✅ React App Successfully Mounted!
          </h2>
          <p style={{ color: '#aaa' }}>
            This confirms React is working properly. Now we can restore your full BingeBoard interface.
          </p>
        </div>
      </div>
    </div>
  );
}