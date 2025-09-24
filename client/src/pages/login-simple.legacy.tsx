/**
 * 🔒 FIREBASE-FIRST AUTHENTICATION SYSTEM
 * 
 * ✅ FEATURES:
 * - Firebase SDK as source of truth for all authentication
 * - Real-time auth state via onAuthStateChanged listener
 * - Email/password + Google + Facebook OAuth support
 * - Automatic backend session sync via Firebase ID tokens
 * - Multi-tab synchronization built-in
 * - OAuth redirect flow handling
 * 
 * 🔥 FLOW:
 * 1. User login via Firebase SDK (email/password or OAuth)
 * 2. onAuthStateChanged detects user and syncs backend session
 * 3. useAuth hook updates across all tabs automatically
 * 4. Logout via Firebase signOut() clears everything
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { SiGoogle, SiFacebook } from "react-icons/si";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  FacebookAuthProvider,
  browserLocalPersistence, 
  browserSessionPersistence, 
  setPersistence 
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '@/firebase/config';

export default function LoginSimple() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Firebase-first auth hook
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

  // Handle OAuth redirect results on mount
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log('🔍 Checking for OAuth redirect result...');
        const result = await getRedirectResult(auth);

        if (result && result.user) {
          console.log('✅ OAuth redirect completed:', result.user.email);
          toast({
            title: "Login successful",
            description: "Welcome to BingeBoard!",
          });
          // onAuthStateChanged will handle the rest automatically
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
      }
    };

    handleRedirectResult();
  }, [toast]);

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

  // Email/Password Authentication (Firebase-first)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    // Client-side validation
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
      // Set Firebase persistence based on remember me preference
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      if (isLogin) {
        // LOGIN: Firebase signInWithEmailAndPassword
        console.log('🚀 Firebase email/password login attempt for:', formData.email);
        
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        console.log('✅ Firebase email/password login successful:', userCredential.user.email);

        // Handle remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberLogin', 'true');
          localStorage.setItem('userEmail', formData.email);
        } else {
          localStorage.removeItem('rememberLogin');
          localStorage.removeItem('userEmail');
        }

        toast({
          title: "Login successful",
          description: "Welcome back!",
        });

        // onAuthStateChanged will handle backend sync and navigation automatically
        
      } else {
        // REGISTRATION: Firebase createUserWithEmailAndPassword
        console.log('🚀 Firebase email/password registration attempt for:', formData.email);
        
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        console.log('✅ Firebase email/password registration successful:', userCredential.user.email);

        toast({
          title: "Registration successful",
          description: "Account created successfully!",
        });

        // onAuthStateChanged will handle backend sync and navigation automatically
      }
    } catch (error: any) {
      console.error('❌ Firebase authentication error:', error);
      
      // Handle Firebase-specific errors
      let errorMessage = "Authentication failed. Please try again.";
      let errorTitle = "Error";

      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorTitle = "Login Failed";
            errorMessage = "Invalid email or password. Please check your credentials and try again.";
            break;
          case 'auth/email-already-in-use':
            errorTitle = "Account Exists";
            errorMessage = "An account with this email already exists. Try logging in instead.";
            break;
          case 'auth/weak-password':
            errorTitle = "Weak Password";
            errorMessage = "Password should be at least 6 characters long.";
            break;
          case 'auth/invalid-email':
            errorTitle = "Invalid Email";
            errorMessage = "Please enter a valid email address.";
            break;
          case 'auth/network-request-failed':
            errorTitle = "Network Error";
            errorMessage = "Unable to connect. Please check your internet connection and try again.";
            break;
          case 'auth/too-many-requests':
            errorTitle = "Too Many Attempts";
            errorMessage = "Too many failed attempts. Please try again later.";
            break;
          default:
            errorTitle = "Authentication Error";
            errorMessage = error.message || "Failed to authenticate. Please try again.";
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth (Firebase-first)
  const handleGoogleAuth = async (useRedirect = false) => {
    try {
      console.log('🚀 Starting Google authentication...');
      setIsLoading(true);

      // Set Firebase persistence based on remember me preference
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      if (useRedirect) {
        // Redirect flow (page will reload)
        await signInWithRedirect(auth, googleProvider);
      } else {
        // Popup flow
        const result = await signInWithPopup(auth, googleProvider);
        console.log('✅ Google popup authentication successful:', result.user.email);

        // Handle remember me for social login
        if (rememberMe && result.user.email) {
          localStorage.setItem('rememberLogin', 'true');
          localStorage.setItem('userEmail', result.user.email);
        }

        toast({
          title: "Login successful",
          description: "Welcome to BingeBoard!",
        });

        // onAuthStateChanged will handle backend sync and navigation automatically
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

  // Facebook OAuth (Firebase-first)
  const handleFacebookAuth = async (useRedirect = false) => {
    try {
      console.log('🚀 Starting Facebook authentication...');
      setIsLoading(true);

      // Set Firebase persistence based on remember me preference
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      if (useRedirect) {
        // Redirect flow (page will reload)
        await signInWithRedirect(auth, facebookProvider);
      } else {
        // Popup flow
        const result = await signInWithPopup(auth, facebookProvider);
        console.log('✅ Facebook popup authentication successful:', result.user.email);

        // Handle remember me for social login
        if (rememberMe && result.user.email) {
          localStorage.setItem('rememberLogin', 'true');
          localStorage.setItem('userEmail', result.user.email);
        }

        toast({
          title: "Login successful",
          description: "Welcome to BingeBoard!",
        });

        // onAuthStateChanged will handle backend sync and navigation automatically
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

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement Firebase password reset
    toast({
      title: "Password reset",
      description: "Password reset functionality will be implemented soon.",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    if (!checked) {
      localStorage.removeItem('rememberLogin');
      localStorage.removeItem('userEmail');
      console.log('🗑️ Cleared remembered credentials');
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
                    onClick={() => handleGoogleAuth(false)}
                    disabled={isLoading}
                    className="bg-gray-800/50 border-slate-600/50 text-white hover:bg-gray-700/50"
                  >
                    <SiGoogle className="h-4 w-4 mr-2" />
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleFacebookAuth(false)}
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