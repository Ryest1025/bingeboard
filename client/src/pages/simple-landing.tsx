export default function SimpleLanding() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'black', 
      color: 'white',
      fontFamily: 'Arial',
      padding: '40px 20px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '60px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            color: '#14B8A6',
            margin: '0'
          }}>
            BingeBoard
          </h1>
          <p style={{ 
            fontSize: '1rem',
            color: '#9CA3AF',
            margin: '5px 0 0 0'
          }}>
            Entertainment Hub
          </p>
        </div>
        <div>
          <button 
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #374151',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              marginRight: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: 1
            }}
            onClick={() => window.location.href = '/login'}
            onMouseOver={(e) => e.target.style.borderColor = '#14B8A6'}
            onMouseOut={(e) => e.target.style.borderColor = '#374151'}
            aria-label="Sign in to your BingeBoard account"
          >
            Log In
          </button>
          <button 
            style={{
              backgroundColor: '#14B8A6',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: 1
            }}
            onClick={() => window.location.href = '/login'}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0D9488'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#14B8A6'}
            aria-label="Create a new BingeBoard account"
          >
            Join Now
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{ 
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '60px 0'
      }}>
        <h2 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold',
          marginBottom: '20px',
          lineHeight: '1.2'
        }}>
          Entertainment
          <br />
          <span style={{ color: '#14B8A6' }}>Beyond Limits</span>
        </h2>
        
        <p style={{ 
          fontSize: '1.25rem',
          color: '#9CA3AF',
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          Track shows and sports, discover what to watch next, and share your entertainment journey with friends.
        </p>

        <div style={{ 
          display: 'flex', 
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            style={{
              backgroundColor: '#14B8A6',
              border: 'none',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              minWidth: '200px'
            }}
            onClick={() => window.location.href = '/login'}
          >
            Join Now with Google
          </button>
          
          <button 
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #14B8A6',
              color: '#14B8A6',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              minWidth: '200px'
            }}
            onClick={() => window.location.href = '/login'}
          >
            Sign Up with Email
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ 
        maxWidth: '1200px',
        margin: '80px auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '40px'
      }}>
        <div style={{ 
          backgroundColor: '#111827',
          padding: '30px',
          borderRadius: '12px',
          border: '1px solid #374151'
        }}>
          <h3 style={{ 
            fontSize: '1.5rem',
            color: '#14B8A6',
            marginBottom: '15px'
          }}>
            Track Everything
          </h3>
          <p style={{ 
            color: '#9CA3AF',
            lineHeight: '1.6'
          }}>
            Keep track of your favorite shows, movies, and sports games all in one place.
          </p>
        </div>
        
        <div style={{ 
          backgroundColor: '#111827',
          padding: '30px',
          borderRadius: '12px',
          border: '1px solid #374151'
        }}>
          <h3 style={{ 
            fontSize: '1.5rem',
            color: '#14B8A6',
            marginBottom: '15px'
          }}>
            Smart Recommendations
          </h3>
          <p style={{ 
            color: '#9CA3AF',
            lineHeight: '1.6'
          }}>
            Get personalized suggestions based on your viewing history and preferences.
          </p>
        </div>
        
        <div style={{ 
          backgroundColor: '#111827',
          padding: '30px',
          borderRadius: '12px',
          border: '1px solid #374151'
        }}>
          <h3 style={{ 
            fontSize: '1.5rem',
            color: '#14B8A6',
            marginBottom: '15px'
          }}>
            Social Features
          </h3>
          <p style={{ 
            color: '#9CA3AF',
            lineHeight: '1.6'
          }}>
            Share your entertainment journey with friends and discover what they're watching.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center',
        padding: '40px 0',
        borderTop: '1px solid #374151',
        marginTop: '80px'
      }}>
        <p style={{ 
          color: '#6B7280',
          fontSize: '0.9rem'
        }}>
          © 2025 BingeBoard. All rights reserved.
        </p>
      </div>
    </div>
  );
}