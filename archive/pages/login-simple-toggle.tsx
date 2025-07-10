import React, { useState } from "react";

export default function LoginSimpleToggle() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors([]);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(isLogin ? "Login successful!" : "Registration successful!");
        window.location.href = "/";
      } else {
        const error = await response.json();
        setFormErrors([error.message || (isLogin ? 'Login failed' : 'Registration failed')]);
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      setFormErrors([error.message || "Authentication failed"]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert("Google login temporarily disabled for testing");
  };

  const handleFacebookLogin = () => {
    alert("Facebook login temporarily disabled for testing");
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'black', 
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
            <div style={{
              width: '48px',
              height: '32px',
              background: 'linear-gradient(135deg, #14B8A6, #0891B2)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
              boxShadow: '0 4px 14px rgba(20, 184, 166, 0.4)',
              border: '2px solid #14B8A6'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>B</span>
            </div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold',
              margin: '0',
              background: 'linear-gradient(to right, #14B8A6, #06B6D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              BingeBoard
            </h1>
          </div>
          <p style={{ color: '#9CA3AF', fontSize: '14px', margin: '0' }}>Entertainment Hub</p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: 'rgba(31, 41, 55, 0.5)',
          border: '1px solid #374151',
          borderRadius: '12px',
          padding: '30px',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              margin: '0 0 8px 0',
              color: 'white'
            }}>
              {isLogin ? "Welcome back to" : "Welcome to"} <span style={{
                background: 'linear-gradient(to right, #14B8A6, #06B6D4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Binge</span>Board
            </h2>
            <p style={{ 
              color: '#9CA3AF', 
              fontSize: '14px',
              margin: '0'
            }}>
              {isLogin 
                ? "Sign in to continue tracking what you binge" 
                : "Create an account to start tracking what you binge"
              }
            </p>
          </div>

          {/* Social Buttons */}
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={handleGoogleLogin}
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #2563EB, #1D4ED8)',
                border: 'none',
                color: 'white',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
                marginBottom: '10px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              disabled={isLoading}
            >
              <span style={{ marginRight: '8px' }}>📧</span>
              {isLoading ? "Signing in..." : (isLogin ? "Log In with Google" : "Register with Google")}
            </button>
            
            <button
              onClick={handleFacebookLogin}
              style={{
                width: '100%',
                background: 'transparent',
                border: '1px solid #374151',
                color: 'white',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              disabled={isLoading}
            >
              <span style={{ marginRight: '8px', color: '#3B82F6' }}>📘</span>
              {isLoading ? "Signing in..." : (isLogin ? "Log In with Facebook" : "Register with Facebook")}
            </button>
          </div>

          {/* Divider */}
          <div style={{ position: 'relative', margin: '20px 0' }}>
            <div style={{ height: '1px', backgroundColor: '#374151' }}></div>
            <div style={{ 
              position: 'absolute',
              top: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(31, 41, 55, 0.5)',
              padding: '0 8px',
              color: '#9CA3AF',
              fontSize: '14px'
            }}>
              Or
            </div>
          </div>

          {/* Toggle Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '16px',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                padding: '8px 16px',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: isLogin ? '#14B8A6' : 'transparent',
                color: isLogin ? 'white' : '#9CA3AF'
              }}
              type="button"
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                padding: '8px 16px',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: !isLogin ? '#14B8A6' : 'transparent',
                color: !isLogin ? 'white' : '#9CA3AF'
              }}
              type="button"
            >
              Register
            </button>
          </div>

          {/* Form Errors */}
          {formErrors.length > 0 && (
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              backgroundColor: 'rgba(185, 28, 28, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '8px'
            }}>
              {formErrors.map((error, index) => (
                <div key={index} style={{ color: '#F87171', fontSize: '14px' }}>
                  • {error}
                </div>
              ))}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!isLogin && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#D1D5DB', fontSize: '14px' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#D1D5DB', fontSize: '14px' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    required
                  />
                </div>
              </>
            )}
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: '#D1D5DB', fontSize: '14px' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                required
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: '#D1D5DB', fontSize: '14px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '40px',
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#D1D5DB', fontSize: '14px' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    style={{
                      width: '100%',
                      padding: '12px',
                      paddingRight: '40px',
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #14B8A6, #06B6D4)',
                border: 'none',
                color: 'white',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ marginRight: '8px' }}>
                {isLogin ? '📧' : '👥'}
              </span>
              {isLoading ? (isLogin ? "Signing in..." : "Creating account...") : (isLogin ? "Sign In" : "Register")}
            </button>
          </form>

          {/* Footer */}
          <div style={{ 
            marginTop: '20px', 
            paddingTop: '20px',
            borderTop: '1px solid #374151',
            textAlign: 'center'
          }}>
            <p style={{ color: '#9CA3AF', fontSize: '14px', margin: '0' }}>
              {isLogin ? (
                <>
                  New to BingeBoard?{" "}
                  <button
                    onClick={() => setIsLogin(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#14B8A6',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                    type="button"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsLogin(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#14B8A6',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                    type="button"
                  >
                    Log in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}