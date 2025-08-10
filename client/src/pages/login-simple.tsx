/**
 * 🔒 CRITICAL AUTHENTICATION SYSTEM - PRODUCTION LOCKED
 * 
 * ⚠️  DANGER: This file is LOCKED and WORKING PERFECTLY
 * 🚨 DO NOT MODIFY without explicit authorization
 * 
 * Lock Date: July 20, 2025
 * Status: ✅ WORKING - Firebase authentication + Email/Password login both functional
 * 
 * WORKING FEATURES:
 * - ✅ Google login via Firebase popup (no custom OAuth)
 * - ✅ Facebook login via Firebase popup (no custom OAuth)
 * - ✅ Email/password registration and login via backend
 * - ✅ Session persistence with full page reload fix
 * - ✅ Client-side input validation
 * - ✅ Firebase persistence management
 * 
 * CRITICAL COMPONENTS:
 * - signInWithPopup for Firebase social auth (pure Firebase, no custom OAuth)
 * - window.location.href redirect for proper session handling
 * - Firebase config imports from @/firebase/config
 * - Backend session creation via /api/auth/login and /api/auth/firebase-session
 * 
 * Last Verified Working: July 20, 2025
 * Modification Authority: Project Lead only
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { SiGoogle, SiFacebook } from "react-icons/si";
import { signInWithPopup, getRedirectResult, browserLocalPersistence, browserSessionPersistence, setPersistence } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '@/firebase/config';

// Helper function to create Firebase session
async function createFirebaseSession(firebaseToken: string) {
  const response = await fetch('/api/auth/firebase-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ firebaseToken }),
  });
  return response.ok;
}

export default function LoginSimple() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Import authentication hook
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      console.log("✅ User already authenticated, redirecting to dashboard:", user.email);
      setLocation("/");
    }
  }, [isAuthenticated, user, authLoading, setLocation]);

  // Load remembered credentials on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('userEmail');
    const wasRemembered = localStorage.getItem('rememberLogin') === 'true';

    if (wasRemembered && rememberedEmail) {
      setRememberMe(true);
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      console.log('📧 Loaded remembered email:', rememberedEmail);
    }
  }, []);

  // Quick test account creation (development only)
  const createTestAccount = async () => {
    // Block test account creation in production
    if (process.env.NODE_ENV === "production") return;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: 'test@bingeboard.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        })
      });

      const result = await response.json();
      console.log('Test account creation:', response.ok ? '✅ Success' : '❌ Failed', result);

      if (response.ok) {
        // Auto-fill the form with test credentials
        setFormData({
          email: 'test@bingeboard.com',
          password: 'password123',
          firstName: '',
          lastName: ''
        });
        toast({
          title: "Test account created!",
          description: "Form auto-filled with test@bingeboard.com / password123"
        });
      }
    } catch (error) {
      console.error('Test account creation failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isLoading) return;

    // Client-side validation for better UX
    if (!formData.email.includes("@") || formData.password.length < 6) {
      toast({
        title: "Invalid input",
        description: "Please provide a valid email and password (min 6 characters).",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // For now, use server-side authentication endpoints
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? {
          email: formData.email,
          password: formData.password,
          rememberMe: rememberMe
        }
        : {
          email: formData.email.trim(),
          password: formData.password,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim()
        };

      // Enhanced debugging - log exact request details
      console.log('🚀 Login attempt:', {
        endpoint,
        payload,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include'
      });

      // Explicit raw payload JSON (sanitized password length only)
      try {
        console.log('🧪 Payload JSON:', JSON.stringify({ email: payload.email, passwordLength: (payload as any).password?.length }));
      } catch {}

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      console.log('📡 Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      const data = await response.json();

      // Enhanced error logging for debugging
      if (!response.ok) {
        console.error(`❌ ${isLogin ? 'Login' : 'Registration'} failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: data,
          endpoint,
          email: formData.email
        });
      }

      if (response.ok) {
        toast({
          title: isLogin ? "Login successful" : "Registration successful",
          description: isLogin ? "Welcome back!" : "Account created successfully!",
        });

        // If remember me is checked, store login preference
        if (rememberMe && isLogin) {
          localStorage.setItem('rememberLogin', 'true');
          localStorage.setItem('userEmail', formData.email);
        } else if (isLogin) {
          // Clear remembered credentials if remember me is not checked
          localStorage.removeItem('rememberLogin');
          localStorage.removeItem('userEmail');
        }

        // Wait a moment for session to be fully saved before redirecting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Force a page reload to ensure the useAuth hook detects the new session
        window.location.href = "/";
      } else {
        // Enhanced error messages based on status code
        let errorMessage = data.message || "Authentication failed. Please try again.";
        let errorTitle = "Error";

        if (response.status === 401) {
          if (isLogin) {
            errorTitle = "Login Failed";
            errorMessage = "Invalid email or password. Please check your credentials and try again.";
          } else {
            errorTitle = "Registration Failed";
            errorMessage = data.message || "Registration failed. Please try again.";
          }
        } else if (response.status === 409) {
          errorTitle = "Account Exists";
          errorMessage = "An account with this email already exists. Try logging in instead.";
        } else if (response.status === 400) {
          errorTitle = "Invalid Input";
          errorMessage = data.message || "Please check your input and try again.";
        }

        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: "Network Error",
        description: "Unable to connect to server. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password reset email sent",
          description: "Check your email for password reset instructions.",
        });
        setShowForgotPassword(false);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send password reset email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Firebase redirect result when user returns from OAuth
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log('🔍 Checking for OAuth redirect result on login page...');
        const result = await getRedirectResult(auth);

        if (result && result.user) {
          console.log('✅ OAuth redirect result found:', result.user.email);
          setIsLoading(true);

          // Create backend session with Firebase ID token
          const firebaseToken = await result.user.getIdToken();
          const sessionCreated = await createFirebaseSession(firebaseToken);

          if (sessionCreated) {
            console.log('✅ Backend session created successfully');
            toast({
              title: "Login successful",
              description: "Welcome to BingeBoard!",
            });

            // Wait for auth state to update, then redirect to home page
            setTimeout(() => {
              setLocation("/");
            }, 1000);
          } else {
            console.error('❌ Failed to create backend session');
            toast({
              title: "Login failed",
              description: "Failed to complete authentication. Please try again.",
              variant: "destructive",
            });
            setIsLoading(false);
          }
        } else {
          console.log('ℹ️ No OAuth redirect result found');
        }
      } catch (error: any) {
        console.error('❌ OAuth redirect error:', error);
        if (!error.message.includes('popup-closed-by-user')) {
          toast({
            title: "Authentication error",
            description: error.message || "Failed to complete authentication",
            variant: "destructive",
          });
        }
        setIsLoading(false);
      }
    };

    handleRedirectResult();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle remember me checkbox changes
  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);

    // If unchecked, clear stored credentials
    if (!checked) {
      localStorage.removeItem('rememberLogin');
      localStorage.removeItem('userEmail');
      console.log('🗑️ Cleared remembered credentials');
    }
  };

  const handleGoogleAuth = async () => {
    try {
      console.log('🚀 Starting Google authentication with popup...');
      setIsLoading(true);

      // Set Firebase persistence based on remember me preference
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      // Use popup instead of redirect to avoid storage partitioning issues
      const result = await signInWithPopup(auth, googleProvider);

      if (result.user) {
        console.log('✅ Google popup authentication successful:', result.user.email);

        // Create backend session using helper
        const firebaseToken = await result.user.getIdToken();
        const sessionCreated = await createFirebaseSession(firebaseToken);

        if (sessionCreated) {
          console.log('✅ Backend session created successfully');

          // Handle remember me for social login
          if (rememberMe && result.user.email) {
            localStorage.setItem('rememberLogin', 'true');
            localStorage.setItem('userEmail', result.user.email);
          }

          toast({
            title: "Login successful",
            description: "Welcome to BingeBoard!",
          });

          // Wait for auth state to update, then redirect to home page
          setTimeout(() => {
            setLocation("/");
          }, 1000);
        } else {
          console.error('❌ Failed to create backend session');
          toast({
            title: "Login failed",
            description: "Failed to complete authentication. Please try again.",
            variant: "destructive",
          });
        }
      }

    } catch (error: any) {
      console.error('❌ Google authentication error:', error);

      if (error.code === 'auth/popup-closed-by-user') {
        toast({
          title: "Authentication cancelled",
          description: "Google login was cancelled",
          variant: "destructive",
        });
      } else if (error.code === 'auth/popup-blocked') {
        toast({
          title: "Popup blocked",
          description: "Please allow popups for this site and try again",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Authentication Error",
          description: error.message || "Failed to authenticate with Google",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookAuth = async () => {
    try {
      console.log('🚀 Starting Facebook authentication with popup...');
      setIsLoading(true);

      // Set Firebase persistence based on remember me preference
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      // Use popup instead of redirect to avoid storage partitioning issues  
      const result = await signInWithPopup(auth, facebookProvider);

      if (result.user) {
        console.log('✅ Facebook popup authentication successful:', result.user.email);

        // Create backend session using helper
        const firebaseToken = await result.user.getIdToken();
        const sessionCreated = await createFirebaseSession(firebaseToken);

        if (sessionCreated) {
          console.log('✅ Backend session created successfully');

          // Handle remember me for social login
          if (rememberMe && result.user.email) {
            localStorage.setItem('rememberLogin', 'true');
            localStorage.setItem('userEmail', result.user.email);
          }

          toast({
            title: "Login successful",
            description: "Welcome to BingeBoard!",
          });

          // Wait for auth state to update, then redirect to home page
          setTimeout(() => {
            setLocation("/");
          }, 1000);
        } else {
          console.error('❌ Failed to create backend session');
          toast({
            title: "Login failed",
            description: "Failed to complete authentication. Please try again.",
            variant: "destructive",
          });
        }
      }

    } catch (error: any) {
      console.error('❌ Facebook authentication error:', error);

      if (error.code === 'auth/popup-closed-by-user') {
        toast({
          title: "Authentication cancelled",
          description: "Facebook login was cancelled",
          variant: "destructive",
        });
      } else if (error.code === 'auth/popup-blocked') {
        toast({
          title: "Popup blocked",
          description: "Please allow popups for this site and try again",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Authentication Error",
          description: error.message || "Failed to authenticate with Facebook",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-effect border-slate-700/50">
        <CardContent className="pt-8">
          {/* BingeBoard Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {/* TV Frame */}
                <div className="w-12 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
                  {/* TV Screen */}
                  <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
                    <div className="text-sm font-bold text-white drop-shadow-lg" style={{ textShadow: '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)' }}>B</div>
                  </div>
                  {/* TV Base */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-slate-700 rounded-sm"></div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-1 bg-slate-600 rounded-sm"></div>
                </div>
              </div>

              {/* Brand Name */}
              <div className="block">
                <span className="text-xl sm:text-2xl select-none">
                  <span className="font-black bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Binge
                  </span>
                  <span className="font-light text-white ml-1">Board</span>
                </span>
                <div className="text-xs text-teal-400 font-medium tracking-widest uppercase opacity-75 hidden sm:block">
                  Entertainment Hub
                </div>
              </div>
            </div>
          </div>

          {/* Mobile domain authorization warning */}
          {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && (
            <div className="mb-6 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0"></div>
                <p className="text-amber-200 text-xs">
                  Mobile authentication optimized for better compatibility.
                </p>
              </div>
            </div>
          )}

          {showForgotPassword ? (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-gray-400 text-sm">Reset your password</p>
                <p className="text-gray-400 text-xs mt-2">
                  Enter your email address and we'll send you a password reset link.
                </p>
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-gray-800/50 border-slate-600/50 text-white pl-10 focus:border-teal-500/50 focus:ring-teal-500/20"
                  required
                />
              </div>
              <Button
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Button
                variant="link"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-teal-400 hover:text-teal-300"
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <div>
              {/* Welcome Message */}
              <div className="text-center mb-6">
                <p className="text-gray-400 text-sm">
                  {isLogin ? "Welcome back to your entertainment hub" : "Join the ultimate entertainment hub"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-gray-800/50 border-slate-600/50 text-white pl-10 focus:border-teal-500/50 focus:ring-teal-500/20"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-gray-800/50 border-slate-600/50 text-white pl-10 pr-10 focus:border-teal-500/50 focus:ring-teal-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* First Name Input (Registration only) */}
                {!isLogin && (
                  <div className="relative">
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="bg-gray-800/50 border-slate-600/50 text-white focus:border-teal-500/50 focus:ring-teal-500/20"
                      required
                    />
                  </div>
                )}

                {/* Last Name Input (Registration only) */}
                {!isLogin && (
                  <div className="relative">
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="bg-gray-800/50 border-slate-600/50 text-white focus:border-teal-500/50 focus:ring-teal-500/20"
                      required
                    />
                  </div>
                )}

                {/* Remember Me & Forgot Password */}
                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={handleRememberMeChange}
                        className="border-slate-600/50 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                      />
                      <label htmlFor="remember" className="text-sm text-gray-300">
                        Remember me
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-teal-400 hover:text-teal-300 p-0 h-auto"
                    >
                      Forgot password?
                    </Button>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold"
                >
                  {isLoading ? "Please wait..." : (isLogin ? "Log In" : "Create Account")}
                </Button>

                {/* Toggle Login/Register */}
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-teal-400 hover:text-teal-300"
                  >
                    {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-600/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-black px-2 text-gray-400">Or continue with</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className="bg-gray-800/50 border-slate-600/50 text-white hover:bg-gray-700/50"
                  >
                    <SiGoogle className="h-4 w-4 mr-2" />
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFacebookAuth}
                    disabled={isLoading}
                    className="bg-gray-800/50 border-slate-600/50 text-white hover:bg-gray-700/50"
                  >
                    <SiFacebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}