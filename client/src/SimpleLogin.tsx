import React, { useState } from "react";

/* ignore-unused-export */
export default function SimpleLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

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
    setFormError("");

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setFormError("Passwords do not match");
        return;
      }

      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = {
        email: formData.email.trim(),
        password: formData.password.trim(),
        // Only send extra fields on register
        ...(isLogin ? {} : {
          firstName: formData.firstName?.trim(),
          lastName: formData.lastName?.trim(),
          confirmPassword: formData.confirmPassword?.trim()
        })
      } as any;

      console.log('🚀 Login attempt payload:', JSON.stringify({ endpoint, ...payload, passwordLength: payload.password?.length }));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        window.location.href = "/";
      } else {
        const error = await response.json();
        setFormError(error.message || (isLogin ? 'Login failed' : 'Registration failed'));
      }
    } catch (error: any) {
      setFormError(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: 'black',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    card: {
      width: '100%',
      maxWidth: '400px',
      backgroundColor: 'rgba(31, 41, 55, 0.5)',
      border: '1px solid #374151',
      borderRadius: '12px',
      padding: '30px',
      backdropFilter: 'blur(10px)'
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '30px'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '10px'
    },
    logoIcon: {
      width: '40px',
      height: '32px',
      background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '12px',
      border: '2px solid #64748b',
      position: 'relative' as const,
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    },
    logoText: {
      fontSize: '28px',
      fontWeight: 'bold',
      background: 'linear-gradient(to right, #14B8A6, #06B6D4)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    subtitle: {
      color: '#9CA3AF',
      fontSize: '14px',
      margin: '0'
    },
    toggleButtons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '16px',
      marginBottom: '20px'
    },
    toggleBtn: {
      padding: '8px 16px',
      fontWeight: '600',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '14px'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      marginBottom: '4px',
      color: '#D1D5DB',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#1F2937',
      border: '1px solid #374151',
      borderRadius: '6px',
      color: 'white',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.2s ease'
    },
    passwordGroup: {
      position: 'relative' as const
    },
    passwordToggle: {
      position: 'absolute' as const,
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#9CA3AF',
      cursor: 'pointer',
      fontSize: '16px'
    },
    submitBtn: {
      width: '100%',
      background: 'linear-gradient(to right, #14B8A6, #06B6D4)',
      border: 'none',
      color: 'white',
      padding: '12px',
      fontSize: '16px',
      fontWeight: '600',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      opacity: isLoading ? 0.6 : 1
    },
    errorMessage: {
      marginBottom: '20px',
      padding: '12px',
      backgroundColor: 'rgba(185, 28, 28, 0.2)',
      border: '1px solid rgba(239, 68, 68, 0.5)',
      borderRadius: '8px',
      color: '#F87171',
      fontSize: '14px'
    },
    footer: {
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '1px solid #374151',
      textAlign: 'center' as const
    },
    footerText: {
      color: '#9CA3AF',
      fontSize: '14px',
      margin: '0'
    },
    footerLink: {
      background: 'none',
      border: 'none',
      color: '#14B8A6',
      textDecoration: 'underline',
      cursor: 'pointer',
      fontSize: '14px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              {/* TV Screen with B */}
              <div style={{
                position: 'absolute',
                inset: '4px',
                background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 50%, #3b82f6 100%)',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textShadow: '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)'
                }}>B</span>
              </div>
              {/* TV Base */}
              <div style={{
                position: 'absolute',
                bottom: '-4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '12px',
                height: '4px',
                background: '#475569',
                borderRadius: '2px'
              }}></div>
              {/* TV Legs */}
              <div style={{
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '20px',
                height: '4px',
                background: '#64748b',
                borderRadius: '2px'
              }}></div>
            </div>
            <h1 style={styles.logoText}>BingeBoard</h1>
          </div>
          <p style={styles.subtitle}>Entertainment Hub</p>
        </div>

        <div style={styles.toggleButtons}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              ...styles.toggleBtn,
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
              ...styles.toggleBtn,
              backgroundColor: !isLogin ? '#14B8A6' : 'transparent',
              color: !isLogin ? 'white' : '#9CA3AF'
            }}
            type="button"
          >
            Register
          </button>
        </div>

        {formError && (
          <div style={styles.errorMessage}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  style={styles.input}
                  required
                />
              </div>
            </>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordGroup}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                style={{ ...styles.input, paddingRight: '40px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.passwordGroup}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  style={{ ...styles.input, paddingRight: '40px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordToggle}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={styles.submitBtn}
          >
            {isLoading ? (isLogin ? "Signing in..." : "Creating account...") : (isLogin ? "Sign In" : "Register")}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            {isLogin ? (
              <>
                New to BingeBoard?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  style={styles.footerLink}
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
                  style={styles.footerLink}
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
  );
}