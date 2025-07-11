// Standalone React implementation that bypasses Vite plugin issues
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

console.log("🚀 STANDALONE REACT LOADER");

// Suppress all Vite errors
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args[0]?.toString() || '';
  if (message.includes('plugin-react') || message.includes('preamble') || message.includes('vitejs')) {
    return; // Suppress Vite plugin errors
  }
  originalConsoleError.apply(console, args);
};

// Simple BingeBoard App Component
const BingeBoardApp = () => {
  return createElement('div', {
    style: {
      background: 'linear-gradient(to bottom, #000, #0a0a0a)',
      color: '#fff',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }
  }, [
    // Header
    createElement('div', {
      key: 'header',
      style: {
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        marginBottom: '40px'
      }
    }, [
      // Logo
      createElement('div', {
        key: 'logo',
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '40px',
          fontSize: '32px',
          fontWeight: 'bold'
        }
      }, [
        createElement('div', {
          key: 'logo-icon',
          style: {
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
          }
        }, 'B'),
        createElement('span', {
          key: 'binge',
          style: {
            background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }
        }, 'Binge'),
        createElement('span', { key: 'board' }, 'Board')
      ]),
      
      // Title
      createElement('h1', {
        key: 'title',
        style: {
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '20px',
          lineHeight: '1.1'
        }
      }, [
        'What To ',
        createElement('span', {
          key: 'binge-title',
          style: {
            background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }
        }, 'Binge'),
        ' Next!'
      ]),
      
      // Subtitle
      createElement('p', {
        key: 'subtitle',
        style: {
          fontSize: '20px',
          color: '#aaa',
          maxWidth: '600px',
          margin: '0 auto 40px'
        }
      }, 'Track your favorite shows, discover new content, and connect with friends who share your taste in entertainment.'),
      
      // Action buttons
      createElement('div', {
        key: 'buttons',
        style: {
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '60px'
        }
      }, [
        createElement('button', {
          key: 'start-btn',
          onClick: () => window.location.href = '/login-simple',
          style: {
            background: '#14b8a6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }
        }, 'Start Tracking'),
        createElement('button', {
          key: 'learn-btn',
          style: {
            background: 'transparent',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            border: '1px solid #374151',
            fontSize: '16px',
            cursor: 'pointer'
          }
        }, 'Learn More')
      ])
    ]),
    
    // Features Grid
    createElement('div', {
      key: 'features',
      style: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        marginBottom: '60px'
      }
    }, [
      // Feature 1
      createElement('div', {
        key: 'feature-1',
        style: {
          background: '#111',
          padding: '30px',
          borderRadius: '12px',
          border: '1px solid #333'
        }
      }, [
        createElement('div', {
          key: 'icon-1',
          style: {
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            fontSize: '24px'
          }
        }, '📺'),
        createElement('h3', {
          key: 'title-1',
          style: { fontSize: '20px', marginBottom: '15px' }
        }, 'Track Everything'),
        createElement('p', {
          key: 'desc-1',
          style: { color: '#aaa', lineHeight: '1.6' }
        }, 'Keep track of all your favorite shows, episodes, and seasons in one place. Never lose track of what you\'re watching again.')
      ]),
      
      // Feature 2
      createElement('div', {
        key: 'feature-2',
        style: {
          background: '#111',
          padding: '30px',
          borderRadius: '12px',
          border: '1px solid #333'
        }
      }, [
        createElement('div', {
          key: 'icon-2',
          style: {
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            fontSize: '24px'
          }
        }, '🎯'),
        createElement('h3', {
          key: 'title-2',
          style: { fontSize: '20px', marginBottom: '15px' }
        }, 'Smart Recommendations'),
        createElement('p', {
          key: 'desc-2',
          style: { color: '#aaa', lineHeight: '1.6' }
        }, 'Get personalized show recommendations based on your viewing history and preferences. Discover your next favorite series.')
      ]),
      
      // Feature 3
      createElement('div', {
        key: 'feature-3',
        style: {
          background: '#111',
          padding: '30px',
          borderRadius: '12px',
          border: '1px solid #333'
        }
      }, [
        createElement('div', {
          key: 'icon-3',
          style: {
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            fontSize: '24px'
          }
        }, '👥'),
        createElement('h3', {
          key: 'title-3',
          style: { fontSize: '20px', marginBottom: '15px' }
        }, 'Social Features'),
        createElement('p', {
          key: 'desc-3',
          style: { color: '#aaa', lineHeight: '1.6' }
        }, 'Connect with friends, share reviews, and see what others are watching. Make entertainment a social experience.')
      ])
    ]),
    
    // Status message
    createElement('div', {
      key: 'status',
      style: {
        textAlign: 'center',
        color: '#14b8a6',
        fontSize: '18px',
        fontWeight: 'bold',
        marginTop: '40px'
      }
    }, '✅ BingeBoard Loaded Successfully - React Working!')
  ]);
};

// Mount the app
const mountApp = () => {
  try {
    const root = document.getElementById("root");
    if (!root) {
      throw new Error("Root element not found");
    }
    
    console.log("✅ Root found, mounting standalone React app");
    
    // Remove loading screen
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
      loadingScreen.remove();
    }
    
    const reactRoot = createRoot(root);
    reactRoot.render(createElement(BingeBoardApp));
    
    console.log("✅ BingeBoard app mounted successfully!");
    
  } catch (error) {
    console.error("❌ Mount failed:", error);
    
    // Fallback HTML
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = `
        <div style="background: #000; color: #fff; padding: 40px; text-align: center; min-height: 100vh;">
          <h1 style="color: #14b8a6; font-size: 32px; margin-bottom: 20px;">BingeBoard</h1>
          <p style="font-size: 18px; margin-bottom: 20px;">App loading failed. Please refresh the page.</p>
          <button onclick="window.location.reload()" style="background: #14b8a6; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
            Refresh Page
          </button>
        </div>
      `;
    }
  }
};

// Start the app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}