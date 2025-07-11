import React from "react";

export default function App() {
  console.log("🚀 App-working rendering");
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem'
    }}>
      {/* BingeBoard Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        borderBottom: '1px solid #1f2937',
        paddingBottom: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #14b8a6, #3b82f6)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(20, 184, 166, 0.3)'
          }}>
            <div style={{
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: '900'
            }}>B</div>
          </div>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              margin: 0,
              background: 'linear-gradient(135deg, #14b8a6, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              BingeBoard
            </h1>
            <p style={{
              fontSize: '0.875rem',
              color: '#14b8a6',
              margin: 0,
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              Entertainment Hub
            </p>
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #14b8a6, #3b82f6)',
          borderRadius: '8px',
          padding: '0.75rem 1.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: 'white'
        }}>
          Welcome, rachel.gubin@gmail.com
        </div>
      </div>

      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '800',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #14b8a6, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          What To Binge Next!
        </h2>
        <p style={{
          fontSize: '1.125rem',
          color: '#9ca3af',
          margin: 0
        }}>
          Your personalized entertainment dashboard with AI recommendations
        </p>
      </div>

      {/* Content Sections */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {/* Continue Watching */}
        <div style={{
          background: 'rgba(20, 184, 166, 0.1)',
          border: '1px solid rgba(20, 184, 166, 0.2)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            marginBottom: '1rem',
            color: '#14b8a6'
          }}>
            Continue Watching
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '40px',
                height: '60px',
                background: 'linear-gradient(135deg, #1f2937, #374151)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                color: '#9ca3af'
              }}>
                📺
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  The Bear
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af'
                }}>
                  Season 3, Episode 5
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Shows */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            marginBottom: '1rem',
            color: '#3b82f6'
          }}>
            Trending Now
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '40px',
                height: '60px',
                background: 'linear-gradient(135deg, #1f2937, #374151)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                color: '#9ca3af'
              }}>
                🎬
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  Wednesday
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af'
                }}>
                  Netflix • 2024
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div style={{
          background: 'rgba(168, 85, 247, 0.1)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            marginBottom: '1rem',
            color: '#a855f7'
          }}>
            AI Recommendations
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '40px',
                height: '60px',
                background: 'linear-gradient(135deg, #1f2937, #374151)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                color: '#9ca3af'
              }}>
                🤖
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  Stranger Things
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af'
                }}>
                  Based on your viewing history
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        background: 'rgba(20, 184, 166, 0.1)',
        border: '1px solid rgba(20, 184, 166, 0.2)',
        borderRadius: '12px'
      }}>
        <div style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: '#14b8a6',
          marginBottom: '0.5rem'
        }}>
          ✅ Your BingeBoard App is Running!
        </div>
        <div style={{
          color: '#9ca3af',
          fontSize: '0.875rem'
        }}>
          This is a simplified version to verify your app is working. 
          <br />
          Your full modern designs and features are ready to be restored.
        </div>
      </div>
    </div>
  );
}