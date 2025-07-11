import React from "react";

export default function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom, #000, #0a0a0a)', 
      color: '#fff', 
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        padding: '20px',
        borderBottom: '1px solid #333',
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #1f2937, #374151)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fff',
              marginRight: '12px',
              fontSize: '18px',
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <button style={{
              background: 'transparent',
              border: '1px solid #374151',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              Search
            </button>
            <button style={{
              background: '#14b8a6',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Hero Section */}
        <section style={{
          textAlign: 'center',
          marginBottom: '60px'
        }}>
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
            flexWrap: 'wrap'
          }}>
            <button style={{
              background: '#14b8a6',
              border: 'none',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Start Tracking
            </button>
            <button style={{
              background: 'transparent',
              border: '2px solid #14b8a6',
              color: '#14b8a6',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Learn More
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '60px'
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
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '15px'
            }}>
              Track Everything
            </h3>
            <p style={{
              color: '#aaa',
              lineHeight: '1.6'
            }}>
              Keep track of all your favorite shows, episodes, and seasons in one place. Never lose track of what you're watching again.
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
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '15px'
            }}>
              Smart Recommendations
            </h3>
            <p style={{
              color: '#aaa',
              lineHeight: '1.6'
            }}>
              Get personalized show recommendations based on your viewing history and preferences. Discover your next favorite series.
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
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '15px'
            }}>
              Social Features
            </h3>
            <p style={{
              color: '#aaa',
              lineHeight: '1.6'
            }}>
              Connect with friends, share reviews, and see what others are watching. Make entertainment a social experience.
            </p>
          </div>
        </section>

        {/* Trending Shows */}
        <section style={{
          marginBottom: '60px'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>
              🔥
            </div>
            What's Trending
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {[
              { title: 'The Bear', rating: '9.2', platform: 'Hulu' },
              { title: 'House of the Dragon', rating: '8.8', platform: 'HBO Max' },
              { title: 'Stranger Things', rating: '8.7', platform: 'Netflix' },
              { title: 'The Boys', rating: '8.9', platform: 'Prime Video' }
            ].map((show, index) => (
              <div key={index} style={{
                background: '#111',
                borderRadius: '12px',
                border: '1px solid #333',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                ':hover': {
                  transform: 'translateY(-5px)'
                }
              }}>
                <div style={{
                  width: '100%',
                  height: '200px',
                  background: 'linear-gradient(135deg, #1f2937, #374151)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  color: '#14b8a6'
                }}>
                  📺
                </div>
                <div style={{
                  padding: '20px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '10px'
                  }}>
                    {show.title}
                  </h3>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <span style={{
                      color: '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      ⭐ {show.rating}
                    </span>
                    <span style={{
                      background: '#14b8a6',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {show.platform}
                    </span>
                  </div>
                  <button style={{
                    background: '#14b8a6',
                    border: 'none',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    width: '100%',
                    cursor: 'pointer'
                  }}>
                    Add to Watchlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        background: '#111',
        padding: '40px 20px',
        borderTop: '1px solid #333',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #1f2937, #374151)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fff',
              marginRight: '10px',
              fontSize: '14px',
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
          <p style={{
            color: '#aaa',
            marginBottom: '20px'
          }}>
            Your Entertainment Hub
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            flexWrap: 'wrap',
            marginBottom: '20px'
          }}>
            <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Terms of Service</a>
            <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Contact</a>
            <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>About</a>
          </div>
          <p style={{
            color: '#666',
            fontSize: '14px'
          }}>
            © 2025 BingeBoard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}