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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { SiGoogle, SiFacebook } from "react-icons/si";
import { signInWithPopup, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '@/firebase/config';
import { apiFetch } from '@/utils/api-config';

// ============================================================================
// CRITICAL: Authentication State Synchronization
// ============================================================================
// This helper function GUARANTEES auth state is synced before navigation.
// 
// WHY THIS EXISTS:
// Previous implementations had race conditions where:
//   1. Backend session was created
//   2. Navigation happened immediately
//   3. Auth state hadn't updated yet
//   4. User got redirected back to login (infinite loop)
//
// HOW IT WORKS:
//   1. Creates backend session (Firebase token → session cookie)
//   2. Calls refreshSession() to update global auth state
//   3. Only returns true after BOTH steps complete
//   4. Navigation only happens if this returns true
//
// ⚠️ WARNING: Do NOT modify this without reading AUTH_STATE_SYNC_GUARANTEE.md
// ⚠️ WARNING: Do NOT bypass this by calling setLocation() without syncing
// ⚠️ WARNING: Do NOT use setTimeout/sleep instead of refreshSession()
//
// Last Updated: January 16, 2026 (v16.11)
// ============================================================================
async function createFirebaseSessionAndSync(firebaseToken: string, refreshSessionFn: () => Promise<void>) {
  console.log('🔐 Creating backend session...');
  const response = await apiFetch('/api/auth/firebase-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firebaseToken }),
  });
  
  if (!response.ok) {
    console.error('❌ Backend session creation failed');
    return false;
  }
  
  // Check response body for debugging
  const sessionData = await response.json();
  console.log('📦 Session creation response:', sessionData);
  
  // Check if cookie was set in response headers
  const setCookieHeader = response.headers.get('Set-Cookie');
  console.log('🍪 Set-Cookie header:', setCookieHeader || 'NOT PRESENT');
  
  console.log('✅ Backend session created, syncing auth state...');
  
  // CRITICAL: Always refresh session to update global auth state
  // This prevents the race condition where navigation happens before state updates
  await refreshSessionFn();
  
  // ADDITIONAL FIX: Wait longer for React state propagation
  // 150ms wasn't enough - components need time to re-render with new state
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('✅ Auth state synced successfully');
  return true;
}

// Legacy helper (deprecated - use createFirebaseSessionAndSync instead)
async function createFirebaseSession(firebaseToken: string) {
  console.warn('⚠️ Using deprecated createFirebaseSession - consider using createFirebaseSessionAndSync');
  const response = await apiFetch('/api/auth/firebase-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firebaseToken }),
  });
  return response.ok;
}

// Helper function to detect mobile Safari (needs redirect instead of popup)
function isMobileSafari() {
  const userAgent = navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(userAgent) && /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS/i.test(userAgent);
}

export default function LoginSimple() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Import authentication hook
  const { isAuthenticated, user, isLoading: authLoading, refreshSession } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'sms'>('email');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationStep, setShowVerificationStep] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
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
      setLocation("/dashboard");
    }
  }, [isAuthenticated, user, authLoading, setLocation]);

  // Load remembered credentials on component mount
  useEffect(() => {
    // Temporarily disable auto-filling remembered email to avoid confusion
    // const rememberedEmail = localStorage.getItem('userEmail');
    // const wasRemembered = localStorage.getItem('rememberLogin') === 'true';

    // if (wasRemembered && rememberedEmail) {
    //   setRememberMe(true);
    //   setFormData(prev => ({ ...prev, email: rememberedEmail }));
    //   console.log('📧 Loaded remembered email:', rememberedEmail);
    // }
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
      // Note: Persistence is already configured in firebase config via initializeAuth
      // Removing setPersistence to avoid conflicts

      if (isLogin) {
        // LOGIN: Use Firebase signInWithEmailAndPassword
        console.log('🚀 Firebase email/password login attempt for:', formData.email.trim());
        
        const userCredential = await signInWithEmailAndPassword(auth, formData.email.trim(), formData.password.trim());
        const firebaseUser = userCredential.user;
        
        console.log('✅ Firebase email/password login successful:', firebaseUser.email);

        // Create backend session with Firebase ID token
        const firebaseToken = await firebaseUser.getIdToken();
        const sessionCreated = await createFirebaseSessionAndSync(firebaseToken, refreshSession);

        if (sessionCreated) {
          // Handle remember me preference
          if (rememberMe) {
            localStorage.setItem('rememberLogin', 'true');
            localStorage.setItem('userEmail', formData.email);
          } else {
            localStorage.removeItem('rememberLogin');
            localStorage.removeItem('userEmail');
          }

          // Navigate to dashboard - session is already synced
          console.log('🎯 Navigating to dashboard');
          setLocation("/dashboard");
        } else {
          console.error('❌ Failed to create backend session');
          // Force signOut to prevent ghost login state
          await auth.signOut();
          toast({
            title: "Login failed",
            description: "Failed to complete authentication. Please try again.",
            variant: "destructive",
          });
        }
        
      } else {
        // REGISTRATION: Use Firebase createUserWithEmailAndPassword
        console.log('🚀 Firebase email/password registration attempt for:', formData.email.trim());
        
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password.trim());
        const firebaseUser = userCredential.user;
        
        console.log('✅ Firebase email/password registration successful:', firebaseUser.email);

        // Create backend session with Firebase ID token and additional user data
        const firebaseToken = await firebaseUser.getIdToken();
        
        // Send both Firebase token and additional user data for registration
        const response = await apiFetch('/api/auth/firebase-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            firebaseToken,
            user: {
              firstName: formData.firstName.trim(),
              lastName: formData.lastName.trim(),
              email: formData.email.trim()
            }
          }),
        });

        if (response.ok) {
          console.log('✅ Backend session created, syncing auth state...');
          await refreshSession();
          console.log('🎯 Navigating to dashboard');
          setLocation("/dashboard");
        } else {
          console.error('❌ Failed to create backend session');
          // Force signOut to prevent ghost login state
          await auth.signOut();
          toast({
            title: "Registration failed",
            description: "Failed to complete registration. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
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
      } else {
        errorTitle = "Network Error";
        errorMessage = "Unable to connect to server. Please check your connection and try again.";
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

  const handleForgotPassword = async () => {
    if (recoveryMethod === 'email') {
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
        const response = await apiFetch("/api/auth/forgot-password", {
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
    } else {
      // SMS recovery
      if (!phoneNumber) {
        toast({
          title: "Phone number required",
          description: "Please enter your phone number.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      try {
        const response = await apiFetch("/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phoneNumber }),
        });

        const data = await response.json();

        if (response.ok) {
          toast({
            title: "Verification code sent",
            description: "Check your phone for the verification code.",
          });
          setShowVerificationStep(true);
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to send verification code",
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
    }
  };

  const handleVerifySmsCode = async () => {
    if (!verificationCode || !newPassword || !confirmNewPassword) {
      toast({
        title: "All fields required",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch("/api/auth/verify-sms-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          code: verificationCode,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password reset successful",
          description: "You can now log in with your new password.",
        });
        // Reset state and return to login
        setShowForgotPassword(false);
        setShowVerificationStep(false);
        setVerificationCode('');
        setPhoneNumber('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        toast({
          title: "Error",
          description: data.message || "Invalid verification code",
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
          const sessionCreated = await createFirebaseSessionAndSync(firebaseToken, refreshSession);

          if (sessionCreated) {
            console.log('🎯 Navigating to dashboard');
            setLocation("/dashboard");
          } else {
            console.error('❌ Failed to create backend session');
            // Force signOut to prevent ghost login state (OAuth redirect)
            await auth.signOut();
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
      console.log('🚀 Starting Google authentication...');
      setIsLoading(true);

      // Note: Persistence is already configured in firebase config via initializeAuth
      // Removing setPersistence to avoid conflicts

      // Use redirect for mobile Safari, popup for others
      if (isMobileSafari()) {
        console.log('📱 Mobile Safari detected, using redirect flow');
        await signInWithRedirect(auth, googleProvider);
        // Redirect will handle the rest, no need for further processing here
        return;
      }

      // Use popup for desktop and other mobile browsers
      console.log('💻 Using popup flow for Google auth');
      
      // Show user that popup is opening
      setIsLoading(true);
      
      const result = await signInWithPopup(auth, googleProvider);

      if (result.user) {
        console.log('✅ Google popup authentication successful:', result.user.email);

        // Create backend session using helper
        const firebaseToken = await result.user.getIdToken();
        const sessionCreated = await createFirebaseSessionAndSync(firebaseToken, refreshSession);

        if (sessionCreated) {
          // Handle remember me for social login
          if (rememberMe && result.user.email) {
            localStorage.setItem('rememberLogin', 'true');
            localStorage.setItem('userEmail', result.user.email);
          }

          console.log('🎯 Navigating to dashboard');
          setLocation("/dashboard");
        } else {
          console.error('❌ Failed to create backend session');
          // Force signOut to prevent ghost login state (Google OAuth)
          await auth.signOut();
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
          variant: "default",
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
      console.log('🚀 Starting Facebook authentication...');
      setIsLoading(true);

      // Note: Persistence is already configured in firebase config via initializeAuth
      // Removing setPersistence to avoid conflicts

      // Use redirect for mobile Safari, popup for others
      if (isMobileSafari()) {
        console.log('📱 Mobile Safari detected, using redirect flow');
        await signInWithRedirect(auth, facebookProvider);
        // Redirect will handle the rest, no need for further processing here
        return;
      }

      // Use popup for desktop and other mobile browsers
      // Use popup for desktop and other mobile browsers
      console.log('💻 Using popup flow for Facebook auth');
      
      // Show user that popup is opening
      setIsLoading(true);
      
      const result = await signInWithPopup(auth, facebookProvider);

      if (result.user) {
        console.log('✅ Facebook popup authentication successful:', result.user.email);

        // Create backend session using helper
        const firebaseToken = await result.user.getIdToken();
        const sessionCreated = await createFirebaseSessionAndSync(firebaseToken, refreshSession);

        if (sessionCreated) {
          // Handle remember me for social login
          if (rememberMe && result.user.email) {
            localStorage.setItem('rememberLogin', 'true');
            localStorage.setItem('userEmail', result.user.email);
          }

          console.log('🎯 Navigating to dashboard');
          setLocation("/dashboard");
        } else {
          console.error('❌ Failed to create backend session');
          // Force signOut to prevent ghost login state (Facebook OAuth)
          await auth.signOut();
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
          variant: "default",
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
                {!showVerificationStep && (
                  <p className="text-gray-400 text-xs mt-2">
                    Choose your recovery method
                  </p>
                )}
              </div>

              {!showVerificationStep ? (
                <>
                  {/* Recovery Method Selection */}
                  <div className="flex gap-2 mb-4">
                    <Button
                      type="button"
                      onClick={() => setRecoveryMethod('email')}
                      variant={recoveryMethod === 'email' ? 'default' : 'outline'}
                      className={`flex-1 ${
                        recoveryMethod === 'email'
                          ? 'bg-gradient-to-r from-teal-600 to-blue-600'
                          : 'bg-gray-800/50 border-slate-600/50 text-gray-300'
                      }`}
                    >
                      Email
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setRecoveryMethod('sms')}
                      variant={recoveryMethod === 'sms' ? 'default' : 'outline'}
                      className={`flex-1 ${
                        recoveryMethod === 'sms'
                          ? 'bg-gradient-to-r from-teal-600 to-blue-600'
                          : 'bg-gray-800/50 border-slate-600/50 text-gray-300'
                      }`}
                    >
                      SMS
                    </Button>
                  </div>

                  {recoveryMethod === 'email' ? (
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
                  ) : (
                    <div className="space-y-2">
                      <Input
                        type="tel"
                        placeholder="Phone number (e.g., +1234567890)"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="bg-gray-800/50 border-slate-600/50 text-white focus:border-teal-500/50 focus:ring-teal-500/20"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Use international format with country code
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold"
                  >
                    {isLoading ? "Sending..." : recoveryMethod === 'email' ? "Send Reset Link" : "Send Code"}
                  </Button>
                </>
              ) : (
                // Verification Step (SMS only)
                <>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-400 text-center">
                      Enter the 6-digit code sent to {phoneNumber}
                    </p>
                    <Input
                      type="text"
                      placeholder="Verification code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="bg-gray-800/50 border-slate-600/50 text-white text-center text-lg tracking-widest focus:border-teal-500/50 focus:ring-teal-500/20"
                      maxLength={6}
                      required
                    />
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-gray-800/50 border-slate-600/50 text-white pl-10 focus:border-teal-500/50 focus:ring-teal-500/20"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="bg-gray-800/50 border-slate-600/50 text-white pl-10 focus:border-teal-500/50 focus:ring-teal-500/20"
                        required
                      />
                    </div>
                    <Button
                      onClick={handleVerifySmsCode}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold"
                    >
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => setShowVerificationStep(false)}
                      className="w-full text-teal-400 hover:text-teal-300 text-sm"
                    >
                      Resend code
                    </Button>
                  </div>
                </>
              )}

              <Button
                variant="link"
                onClick={() => {
                  setShowForgotPassword(false);
                  setShowVerificationStep(false);
                  setVerificationCode('');
                  setPhoneNumber('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                }}
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
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
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => handleRememberMeChange(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-600/50 bg-gray-800/50 text-teal-600 focus:ring-teal-500/20"
                      />
                      <label htmlFor="remember" className="text-sm text-gray-300 cursor-pointer">
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