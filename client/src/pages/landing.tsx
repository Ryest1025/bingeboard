/**
 * 🔐 LANDING PAGE WITH PROTECTED FIREBASE SOCIAL LOGINS
 * 
 * ⚠️ CRITICAL: This file uses DYNAMIC FIREBASE IMPORTS to prevent conflicts 
 * with the useAuth hook's authentication system.
 * 
 * 🚨 DO NOT CHANGE these patterns:
 * 1. ✅ Dynamic imports: await import("firebase/auth")
 * 2. ❌ NEVER use static imports from "firebase/auth"
 * 
 * 🔒 DESIGN LOCKED: Modern CTA buttons with glassmorphism effect
 * ✨ Clean, professional header with B TV logo
 * 💫 Subtle animations and micro-interactions
 * 📅 Design approved and locked: July 20, 2025
 * 
 * Last Fixed: July 11, 2025 - Converted static imports to dynamic
 * Last Design Lock: July 20, 2025 - Modern CTA buttons locked
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Users, 
  Play, 
  TrendingUp, 
  Zap, 
  Shield, 
  Smartphone, 
  Globe,
  CheckCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { SiGoogle, SiFacebook } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { isMobileDevice } from "@/lib/deviceUtils";
import BingeBoardHeader from "@/components/BingeBoardHeader";
import { StreamingMarqueeModal } from "@/components/streaming-marquee-modal";
import { StreamingMarqueeSection } from "@/components/streaming-marquee-section";


interface Show {
  id: number;
  name?: string;
  title?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  first_air_date?: string;
  release_date?: string;
}

function FeatureCard({ icon: Icon, title, description, highlight }: {
  icon: any;
  title: string;
  description: string;
  highlight?: string;
}) {
  return (
    <Card className="glass-effect border-teal-500/20 h-full group hover:border-teal-400/40 transition-all duration-300">
      <CardContent className="p-8">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
        {highlight && (
          <Badge className="mb-3 bg-red-500/20 text-red-300 border-red-400/30">
            {highlight}
          </Badge>
        )}
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function ComparisonCard({ feature, bingeboard, trakt, tvtime, hobi }: {
  feature: string;
  bingeboard: string;
  trakt: string;
  tvtime: string;
  hobi: string;
}) {
  return (
    <div className="grid grid-cols-5 gap-4 py-4 border-b border-gray-800/50">
      <div className="font-medium text-white">{feature}</div>
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-teal-400" />
        <span className="text-teal-300 font-medium">{bingeboard}</span>
      </div>
      <div className="text-gray-400">{trakt}</div>
      <div className="text-gray-400">{tvtime}</div>
      <div className="text-gray-400">{hobi}</div>
    </div>
  );
}

function ShowCard({ show }: { show: Show }) {
  // Add defensive checks for undefined properties
  if (!show) {
    return null; // Don't render anything if show is undefined
  }

  const title = show.name || show.title || 'Unknown Title';
  const year = show.first_air_date || show.release_date ? 
    new Date(show.first_air_date || show.release_date!).getFullYear() : '';
  const rating = typeof show.vote_average === 'number' && !isNaN(show.vote_average) 
    ? show.vote_average.toFixed(1) 
    : 'N/A';
  
  return (
    <Card className="show-card flex-shrink-0 w-36 glass-effect border-slate-700/50 rounded-xl transition-all duration-300 hover:scale-105 group">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={
              show.poster_path
                ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                : "/placeholder-poster.png"
            }
            alt={title}
            className="w-full h-48 object-cover rounded-t-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute top-3 right-3">
            <Badge className="glass-effect border-0 text-amber-300 font-semibold">
              <Star className="h-3 w-3 mr-1 fill-current" />
              {rating}
            </Badge>
          </div>
        </div>
        
        <div className="p-4 space-y-2">
          <h3 className="font-bold text-white text-sm line-clamp-2 leading-tight">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-300 font-medium">{year}</div>
            <div className="flex space-x-1">
              {/* Streaming Platform Logos - Real TMDB Data */}
              {(show as any).streamingPlatforms && (show as any).streamingPlatforms.length > 0 && (
                <div className="flex items-center space-x-1">
                  {(show as any).streamingPlatforms.slice(0, 2).map((platform: any, index: number) => (
                    <div key={index} className="w-6 h-4 rounded-sm bg-white p-0.5 flex-shrink-0">
                      {platform.logo_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w45${platform.logo_path}`}
                          alt={platform.provider_name}
                          className="w-full h-full object-contain rounded-sm"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-600 rounded-sm flex items-center justify-center">
                          <span className="text-[7px] font-bold text-white">
                            {platform.provider_name?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Landing() {
  console.log('🏢 LANDING COMPONENT RENDERED - User is NOT authenticated');
  
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // State for trending shows
  const [trendingShows, setTrendingShows] = useState<{ results: Show[] } | null>(null);
  
  // Mobile redirect on initial load
  useEffect(() => {
    // Check if user is on a mobile device
    if (isMobileDevice()) {
      console.log("📱 Mobile device detected, redirecting to mobile hub");
      setLocation('/mobile-hub');
    } else {
      console.log("🖥️ Desktop device detected, staying on landing page");
    }
  }, [setLocation]);
  
  // Handle redirect results for mobile social login
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const { getRedirectResult } = await import("firebase/auth");
        const auth = await getFirebaseAuth();
        
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("✅ Redirect login successful:", result.user.email);
          
          // Create backend session with detailed logging
          console.log("🔄 Starting backend session creation...");
          const sessionResult = await createBackendSession(result.user);
          console.log("✅ Backend session created:", sessionResult);
          
          // Wait a moment for session to settle
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          toast({
            title: "Welcome to BingeBoard!",
            description: `Successfully signed in with ${result.user.email}`,
          });
          
          // Force a page reload to refresh auth state
          console.log("🔄 Forcing page reload to refresh auth state...");
          window.location.href = '/';
        }
      } catch (error: any) {
        console.error("❌ Redirect login failed:", error);
        if (error.code !== 'auth/null-user') {
          toast({
            title: "Sign-in Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    };
    
    handleRedirectResult();
  }, []);
  
  // Dynamic Firebase auth - only loaded when needed
  const getFirebaseAuth = async () => {
    // Import the auth instance from our main config file
    const { auth } = await import("@/firebase/config");
    
    // Configure auth settings for better compatibility with storage partitioning
    if (import.meta.env.DEV) {
      console.log('🔧 Configuring Firebase Auth for development');
      
      // Disable app verification for testing
      if (auth.settings) {
        auth.settings.appVerificationDisabledForTesting = true;
      }
    }
    
    return auth;
  };
  
  const createBackendSession = async (user: any) => {
    try {
      console.log('🔐 Creating backend session for:', user.email);
      const idToken = await user.getIdToken();
      console.log('🎫 Firebase ID token obtained');
      
      const requestBody = { 
        firebaseToken: idToken,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
      };
      
      console.log('📤 Sending session request to backend...');
      const response = await fetch('/api/auth/firebase-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });
      
      console.log('📥 Backend response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend session creation failed:', errorText);
        throw new Error(`Failed to create backend session: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Backend session created successfully:', result);
      return result;
    } catch (error) {
      console.error('💥 Backend session creation failed:', error);
      throw error;
    }
  };

  const handleGoogleLogin = async () => {
    console.log("🔄 Google login button clicked!");
    setLoading(true);
    
    try {
      console.log("🔄 Starting Google login process...");
      console.log("🔍 Current URL:", window.location.href);
      console.log("🔍 Firebase config check:");
      console.log("  - API Key:", import.meta.env.VITE_FIREBASE_API_KEY ? "✅ Set" : "❌ Missing");
      console.log("  - Auth Domain:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
      console.log("  - Project ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
      
      // Dynamic imports to prevent conflicts with useAuth hook
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      console.log("✅ Firebase auth imports loaded");
      
      const auth = await getFirebaseAuth();
      console.log("✅ Firebase auth instance obtained:", auth?.app?.options?.projectId);
      
      const provider = new GoogleAuthProvider();
      console.log("✅ Google provider created");
      
      // Add custom parameters to ensure popup behavior
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('🌐 Current origin:', window.location.origin);
      console.log('🌐 Development mode:', import.meta.env.DEV);
      
      // Check if popup will be blocked
      const testPopup = window.open('', '_blank', 'width=1,height=1');
      if (!testPopup || testPopup.closed || typeof testPopup.closed == 'undefined') {
        console.warn('⚠️ Popup might be blocked by browser');
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site and try again.",
          variant: "destructive",
        });
        return;
      } else {
        testPopup.close();
        console.log('✅ Popup test passed');
      }
      
      // Use popup authentication
      console.log("🛠️ Attempting Google popup sign-in...");
      
      const result = await signInWithPopup(auth, provider);
      console.log("✅ Google popup login successful:");
      console.log("  - User ID:", result.user.uid);
      console.log("  - Email:", result.user.email);
      console.log("  - Display Name:", result.user.displayName);
      console.log("  - Photo URL:", result.user.photoURL);
      
      // Create backend session with detailed logging
      console.log("🔄 Starting backend session creation...");
      const sessionResult = await createBackendSession(result.user);
      console.log("✅ Backend session created:", sessionResult);
      
      // Wait a moment for session to settle
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Welcome to BingeBoard!",
        description: "Successfully signed in with Google",
      });
      
      // Force a page reload to refresh auth state
      console.log("🔄 Forcing page reload to refresh auth state...");
      window.location.href = '/';
      
    } catch (err: any) {
      console.error("💥 Google login error:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      
      // Handle specific Firebase errors
      let errorMessage = err.message;
      if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by browser. Please allow popups and try again.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google sign-in is not enabled in Firebase Console.';
      } else if (err.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebase configuration error. Please check the setup.';
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for OAuth operations in Firebase Console.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      toast({
        title: "Sign-in Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log("🔄 Setting loading to false");
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    console.log("🔄 Facebook login button clicked!");
    setLoading(true);
    
    try {
      console.log("🔄 Starting Facebook login process...");
      console.log("🔍 Current URL:", window.location.href);
      console.log("🔍 Firebase config check:");
      console.log("  - API Key:", import.meta.env.VITE_FIREBASE_API_KEY ? "✅ Set" : "❌ Missing");
      console.log("  - Auth Domain:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
      console.log("  - Project ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
      
      // Dynamic imports to prevent conflicts with useAuth hook
      const { FacebookAuthProvider, signInWithPopup } = await import("firebase/auth");
      console.log("✅ Firebase auth imports loaded");
      
      const auth = await getFirebaseAuth();
      console.log("✅ Firebase auth instance obtained:", auth?.app?.options?.projectId);
      
      const provider = new FacebookAuthProvider();
      console.log("✅ Facebook provider created");
      
      // Add custom parameters
      provider.addScope('email');
      provider.setCustomParameters({
        display: 'popup'
      });
      
      console.log('🌐 Current origin:', window.location.origin);
      console.log('🌐 Development mode:', import.meta.env.DEV);
      
      // Check if popup will be blocked
      const testPopup = window.open('', '_blank', 'width=1,height=1');
      if (!testPopup || testPopup.closed || typeof testPopup.closed == 'undefined') {
        console.warn('⚠️ Popup might be blocked by browser');
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site and try again.",
          variant: "destructive",
        });
        return;
      } else {
        testPopup.close();
        console.log('✅ Popup test passed');
      }
      
      // Use popup authentication
      console.log("🛠️ Attempting Facebook popup sign-in...");
      
      const result = await signInWithPopup(auth, provider);
      console.log("✅ Facebook popup login successful:");
      console.log("  - User ID:", result.user.uid);
      console.log("  - Email:", result.user.email);
      console.log("  - Display Name:", result.user.displayName);
      console.log("  - Photo URL:", result.user.photoURL);
      
      // Create backend session with detailed logging
      console.log("🔄 Starting backend session creation...");
      const sessionResult = await createBackendSession(result.user);
      console.log("✅ Backend session created:", sessionResult);
      
      // Wait a moment for session to settle
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Welcome to BingeBoard!",
        description: "Successfully signed in with Facebook",
      });
      
      // Force a page reload to refresh auth state
      console.log("🔄 Forcing page reload to refresh auth state...");
      window.location.href = '/';
      
    } catch (err: any) {
      console.error("💥 Facebook login error:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      
      // Handle specific Firebase errors
      let errorMessage = err.message;
      if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by browser. Please allow popups and try again.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Facebook sign-in is not enabled in Firebase Console.';
      } else if (err.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebase configuration error. Please check the setup.';
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for OAuth operations in Firebase Console.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      toast({
        title: "Sign-in Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log("🔄 Setting loading to false");
      setLoading(false);
    }
  };
  
  // Safe fetch function that never throws errors and handles HTML responses
  const safeFetch = async (url: string) => {
    try {
      console.log(`🌐 Fetching: ${url}`);
      const response = await fetch(url, { credentials: 'include' });
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      console.log(`📋 Content-Type: ${response.headers.get('content-type')}`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log(`✅ JSON data received:`, data);
          return data;
        } else {
          const text = await response.text();
          console.error('❌ Expected JSON but got HTML/text:', text.substring(0, 200) + '...');
          console.warn('Response is not JSON, likely HTML error page');
          return null;
        }
      } else {
        const text = await response.text();
        console.error(`❌ HTTP ${response.status}: ${text.substring(0, 200)}...`);
        return null;
      }
    } catch (error) {
      console.error('🚨 Fetch failed:', error);
      return null;
    }
  };

  // Load trending shows on component mount
  useEffect(() => {
    const loadTrendingShows = async () => {
      console.log("🔄 Loading trending shows...");
      const data = await safeFetch('/api/trending/tv/day');
      console.log("📺 Trending shows data:", data);
      setTrendingShows(data);
    };
    
    loadTrendingShows();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-b border-gray-800 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* BingeBoard Logo with B TV */}
            <BingeBoardHeader className="mb-0" />
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <a 
                href="/login" 
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                Sign In
              </a>
              <a 
                href="/signup"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium px-4 py-2 text-sm rounded-lg transition-all duration-200"
              >
                Join Now
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="hero-section relative overflow-hidden bg-gradient-to-br from-black via-slate-900 to-black pt-16">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Binge</span>
                <span className="text-white font-light">Board</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Your <span className="text-teal-400 font-semibold">ultimate entertainment hub</span> for tracking shows, movies, and sports
              </p>

              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <Badge className="bg-teal-500/20 text-teal-300 border-teal-400/30 px-4 py-2">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Recommendations
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 px-4 py-2">
                  <Users className="w-4 h-4 mr-2" />
                  Social Features
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 px-4 py-2">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy First
                </Badge>
              </div>
            </div>

            {/* 
            🔒 LOCKED DESIGN: Modern CTA Buttons - DO NOT MODIFY
            ✨ Clean glassmorphism design with subtle hover effects
            🎯 Perfect sizing: px-6 py-3, text-sm, w-4 h-4 icons
            💫 Micro-interactions: hover:scale-[1.02], backdrop-blur-sm
            🌈 Brand colors: red-400, blue-400, teal-400 for icons
            📅 Locked: July 20, 2025 - Modern design approved
            */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-8">
              <a 
                href="/signup"
                className="group relative bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 hover:border-red-400/50 text-white font-medium px-6 py-3 text-sm inline-flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] rounded-lg"
              >
                <SiGoogle className="w-4 h-4 text-red-400" />
                <span>Join with Google</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              </a>
              
              <a 
                href="/signup"
                className="group relative bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 hover:border-blue-400/50 text-white font-medium px-6 py-3 text-sm inline-flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] rounded-lg"
              >
                <SiFacebook className="w-4 h-4 text-blue-400" />
                <span>Join with Facebook</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              </a>
              
              <a 
                href="/signup"
                className="group relative bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 hover:border-teal-400/50 text-white font-medium px-6 py-3 text-sm inline-flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] rounded-lg"
              >
                <ArrowRight className="w-4 h-4 text-teal-400" />
                <span>Create Account</span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              </a>
            </div>

            <div className="text-center space-y-3">
              {/* Additional Options */}
              <div className="pt-4 text-base text-gray-300">
                <span>Already have an account? </span>
                <a href="/login" className="text-teal-400 hover:text-teal-300 underline font-semibold text-lg">Sign in</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Streaming Platforms Marquee */}
      <StreamingMarqueeSection />

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-b from-black to-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Powerful features designed for modern entertainment enthusiasts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Play}
              title="Smart Tracking"
              description="Automatically track your viewing progress across all platforms with intelligent episode detection and seamless syncing."
            />
            <FeatureCard
              icon={Users}
              title="Social Discovery"
              description="Connect with friends, share recommendations, and discover trending content through our vibrant community."
            />
            <FeatureCard
              icon={Zap}
              title="AI Recommendations"
              description="Get personalized suggestions powered by advanced AI that learns from your viewing habits and preferences."
              highlight="AI Powered"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Real-time Stats"
              description="Track your viewing statistics, discover patterns, and see how your taste evolves over time."
            />
            <FeatureCard
              icon={Globe}
              title="Multi-Platform"
              description="Works seamlessly across web, mobile, and tablet with real-time synchronization of all your data."
            />
            <FeatureCard
              icon={Shield}
              title="Privacy First"
              description="Your data stays secure with end-to-end encryption and transparent privacy controls you can trust."
            />
          </div>
        </div>
      </div>

      {/* Trending Shows Preview */}
      {trendingShows && (
        <div className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Trending Now
              </h2>
              <Badge className="bg-red-500/20 text-red-300 border-red-400/30">
                Live Data
              </Badge>
            </div>
            
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {trendingShows.results?.filter(show => show && show.vote_average != null).slice(0, 8).map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 
      🔒 LOCKED DESIGN: Footer with B TV Logo - DO NOT MODIFY
      ✨ Matches header logo exactly for brand consistency
      🎨 TV-shaped logo with gradient B and proper typography
      📅 Locked: July 20, 2025 - Brand consistency approved
      */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              {/* TV Logo - matching header */}
              <div className="relative">
                <div className="w-10 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
                  <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
                    <div
                      className="text-sm font-bold text-white drop-shadow-lg"
                      style={{ textShadow: '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)' }}
                    >
                      B
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-slate-700 rounded-sm"></div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-1 bg-slate-600 rounded-sm"></div>
                </div>
              </div>
              
              {/* Brand Name - matching header */}
              <span className="text-xl select-none">
                <span className="font-black bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Binge
                </span>
                <span className="font-light text-white ml-1">Board</span>
              </span>
            </div>
            
            <div className="flex space-x-6 text-gray-400">
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-gray-400">
            <p>&copy; 2024 BingeBoard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}