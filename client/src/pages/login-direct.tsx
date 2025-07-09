import { useState } from "react";
import { useLocation } from "wouter";
import { SiGoogle, SiFacebook } from "react-icons/si";

export default function LoginDirect() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isMobile = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  };

  const handleGoogleAuth = () => {
    console.log('Starting Google authentication...');
    console.log('Device type:', isMobile() ? 'Mobile' : 'Desktop');
    console.log('Using backend OAuth for universal compatibility');
    window.location.href = '/api/auth/google';
  };

  const handleFacebookAuth = () => {
    console.log('Starting Facebook authentication...');
    console.log('Device type:', isMobile() ? 'Mobile' : 'Desktop');
    console.log('Using backend OAuth for universal compatibility');
    window.location.href = '/api/auth/facebook';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Login successful!");
        setLocation("/");
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'black', 
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: '#1a1a1a',
        padding: '40px',
        borderRadius: '10px',
        border: '1px solid #333',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            color: '#14B8A6',
            margin: '0 0 10px 0',
            fontSize: '2rem'
          }}>
            BingeBoard
          </h1>
          <p style={{ color: '#gray', margin: '0' }}>Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #333',
                backgroundColor: '#2a2a2a',
                color: 'white',
                fontSize: '16px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #333',
                backgroundColor: '#2a2a2a',
                color: 'white',
                fontSize: '16px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#14B8A6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Social Login Section */}
          <div style={{ textAlign: 'center', margin: '20px 0 10px 0' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              margin: '20px 0',
              color: '#666'
            }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }}></div>
              <span style={{ margin: '0 15px', fontSize: '14px' }}>Or continue with</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }}></div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={handleGoogleAuth}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#2a2a2a',
                color: 'white',
                border: '1px solid #333',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}
            >
              <SiGoogle style={{ marginRight: '8px', fontSize: '16px' }} />
              Google
            </button>
            <button
              type="button"
              onClick={handleFacebookAuth}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#2a2a2a',
                color: 'white',
                border: '1px solid #333',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}
            >
              <SiFacebook style={{ marginRight: '8px', fontSize: '16px', color: '#1877f2' }} />
              Facebook
            </button>
          </div>

          <p style={{ textAlign: 'center', margin: '10px 0' }}>
            <a 
              href="/login" 
              style={{ color: '#14B8A6', textDecoration: 'none' }}
            >
              Back to main login page
            </a>
          </p>

          {message && (
            <div style={{
              padding: '10px',
              borderRadius: '4px',
              backgroundColor: message.includes('successful') ? '#10b981' : '#ef4444',
              color: 'white',
              textAlign: 'center',
              marginTop: '10px'
            }}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}