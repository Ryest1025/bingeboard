import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Search, 
  Clock, 
  Star, 
  Users, 
  Settings,
  LogIn,
  TrendingUp,
  Heart,
  Plus,
  List,
  Film,
  Tv,
  Home,
  Activity,
  Zap,
  Shield,
  Globe,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { SiGoogle, SiFacebook } from "react-icons/si";

// Helper functions for Firebase auth (copied from landing page)
const getFirebaseAuth = async () => {
  const { auth } = await import('@/firebase/config');
  return auth;
};

const createBackendSession = async (firebaseUser: any) => {
  try {
    const idToken = await firebaseUser.getIdToken();
    
    const response = await fetch('/api/auth/firebase-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      credentials: 'include',
      body: JSON.stringify({ idToken })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend session created:', data);
      return data;
    } else {
      console.error('❌ Backend session creation failed:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('❌ Backend session creation error:', error);
    return null;
  }
};

function FeatureCard({ icon: Icon, title, description, highlight }: {
  icon: any;
  title: string;
  description: string;
  highlight?: string;
}) {
  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm h-full">
      <CardContent className="p-6">
        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        {highlight && (
          <Badge className="mb-2 bg-red-500/20 text-red-300 border-red-400/30 text-xs">
            {highlight}
          </Badge>
        )}
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function MobileApp() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import("firebase/auth");
      const auth = await getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({ prompt: 'select_account' });
      if (isMobile()) {
        await signInWithRedirect(auth, provider);
        // Redirect will happen, result handled in useEffect
      } else {
        const result = await signInWithPopup(auth, provider);
        const sessionResult = await createBackendSession(result.user);
        toast({ title: "Welcome to BingeBoard!", description: "Successfully signed in with Google" });
        window.location.href = '/';
      }
    } catch (err: any) {
      let errorMessage = err.message;
      if (err.code === 'auth/popup-blocked') errorMessage = 'Popup was blocked. Please allow popups and try again.';
      else if (err.code === 'auth/popup-closed-by-user') errorMessage = 'Sign-in was cancelled.';
      toast({ title: "Sign-in Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    try {
      const { FacebookAuthProvider, signInWithPopup, signInWithRedirect } = await import("firebase/auth");
      const auth = await getFirebaseAuth();
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      provider.setCustomParameters({ display: 'popup' });
      if (isMobile()) {
        await signInWithRedirect(auth, provider);
      } else {
        const result = await signInWithPopup(auth, provider);
        const sessionResult = await createBackendSession(result.user);
        toast({ title: "Welcome to BingeBoard!", description: "Successfully signed in with Facebook" });
        window.location.href = '/';
      }
    } catch (err: any) {
      let errorMessage = err.message;
      if (err.code === 'auth/popup-blocked') errorMessage = 'Popup was blocked. Please allow popups and try again.';
      else if (err.code === 'auth/popup-closed-by-user') errorMessage = 'Sign-in was cancelled.';
      toast({ title: "Sign-in Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  // Handle redirect result for mobile social login
  useEffect(() => {
    (async () => {
      const { getAuth, getRedirectResult } = await import("firebase/auth");
      const auth = await getFirebaseAuth();
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          await createBackendSession(result.user);
          toast({ title: "Welcome to BingeBoard!", description: "Successfully signed in!" });
          window.location.href = '/';
        }
      } catch (err: any) {
        // Only show error if not null
        if (err && err.message) {
          toast({ title: "Sign-in Failed", description: err.message, variant: "destructive" });
        }
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading BingeBoard...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Hero Section */}
        <div className="relative min-h-screen flex items-center">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10 w-full px-4 py-8">
            <div className="max-w-md mx-auto text-center space-y-8">
              {/* Logo & Title */}
              <div className="space-y-4">
                <div className="relative flex justify-center mb-4">
                  {/* Film Strip "B" Logo - Based on Reference Images */}
                  <div className="relative">
                    {/* Main film strip body forming the "B" */}
                    <div className="relative w-20 h-24 bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 shadow-2xl">
                      
                      {/* Film perforations - left side */}
                      <div className="absolute left-1 top-2 space-y-1.5">
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                      </div>
                      
                      {/* Film perforations - right side */}
                      <div className="absolute right-1 top-2 space-y-1.5">
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-slate-950 rounded-sm"></div>
                      </div>
                      
                      {/* Film frames in the center */}
                      <div className="absolute left-4 right-4 top-2 space-y-1">
                        <div className="h-3 bg-white/20 rounded-sm border border-white/10"></div>
                        <div className="h-3 bg-white/20 rounded-sm border border-white/10"></div>
                        <div className="h-3 bg-white/20 rounded-sm border border-white/10"></div>
                        <div className="h-3 bg-white/20 rounded-sm border border-white/10"></div>
                        <div className="h-3 bg-white/20 rounded-sm border border-white/10"></div>
                      </div>
                      
                      {/* "B" shaped curves extending to the right */}
                      <div className="absolute right-0 top-0 w-8 h-10 bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 rounded-r-full"></div>
                      <div className="absolute right-0 top-8 w-6 h-3 bg-slate-950 rounded-l-full"></div>
                      <div className="absolute right-0 bottom-0 w-10 h-12 bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 rounded-r-full"></div>
                      
                      {/* 3D depth effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none"></div>
                    </div>
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 w-20 h-24 bg-gradient-to-br from-teal-400 to-blue-500 blur-lg opacity-25 scale-110"></div>
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent">
                  BingeBoard
                </h1>
                <p className="text-xl text-gray-300">
                  Your Ultimate
                  <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent block">
                    Streaming Companion
                  </span>
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Track shows, discover content, and never lose your place again. 
                  The smarter way to manage your entertainment.
                </p>
              </div>

              {/* Key Benefits */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto shadow-lg border border-white/10">
                    <Play className="h-6 w-6 text-white drop-shadow-sm" />
                  </div>
                  <div className="text-white text-sm font-medium">Smart Tracking</div>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto shadow-lg border border-white/10">
                    <TrendingUp className="h-6 w-6 text-white drop-shadow-sm" />
                  </div>
                  <div className="text-white text-sm font-medium">Trending</div>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto shadow-lg border border-white/10">
                    <Users className="h-6 w-6 text-white drop-shadow-sm" />
                  </div>
                  <div className="text-white text-sm font-medium">Social</div>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto shadow-lg border border-white/10">
                    <Zap className="h-6 w-6 text-white drop-shadow-sm" />
                  </div>
                  <div className="text-white text-sm font-medium">Instant Sync</div>
                </div>
              </div>

              {/* Login Section */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Button 
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    size="lg" 
                    variant="outline"
                    className="border-gray-700 bg-white/5 hover:bg-white/10 text-white px-6 py-4 w-full"
                  >
                    <SiGoogle className="h-5 w-5 mr-3" />
                    Continue with Google
                  </Button>
                  <Button 
                    onClick={handleFacebookLogin}
                    disabled={loading}
                    size="lg" 
                    variant="outline"
                    className="border-gray-700 bg-blue-600/20 hover:bg-blue-600/30 text-white px-6 py-4 w-full"
                  >
                    <SiFacebook className="h-5 w-5 mr-3" />
                    Continue with Facebook
                  </Button>
                </div>
                
                {/* OR Separator */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-2 text-gray-400">Or</span>
                  </div>
                </div>
                
                {/* Email Login Options */}
                <div className="space-y-3">
                  <Button 
                    onClick={() => setLocation('/login-simple')}
                    size="lg" 
                    className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold w-full"
                  >
                    Join Now
                  </Button>
                  <Button 
                    onClick={() => setLocation('/login-simple')}
                    size="lg" 
                    variant="outline" 
                    className="border-teal-400/30 text-teal-300 hover:bg-teal-500/10 px-8 py-4 text-lg w-full"
                  >
                    Log In
                  </Button>
                </div>
              </div>

              {/* Quick Access */}
              <div className="pt-4 border-t border-gray-800">
                <Button 
                  onClick={() => setLocation('/mobile-hub')}
                  variant="ghost"
                  className="text-gray-400 hover:text-gray-300 text-sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Mobile Test Hub
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative py-16 px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center space-y-4 mb-12">
              <Badge className="bg-teal-400/10 border-teal-400/30 text-teal-300 px-4 py-2 text-sm">
                Core Features
              </Badge>
              <h2 className="text-2xl font-bold text-white">
                Everything You Need to 
                <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent block">
                  Track Your Entertainment
                </span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <FeatureCard
                icon={Play}
                title="Smart Tracking"
                description="Automatically track your progress with intelligent episode detection."
                highlight="AI-Powered"
              />
              <FeatureCard
                icon={TrendingUp}
                title="Trending Discovery"
                description="Discover what's hot with real-time trending data and personalized recommendations."
              />
              <FeatureCard
                icon={Users}
                title="Social Features"
                description="Share experiences, see what friends are watching, and get recommendations."
              />
              <FeatureCard
                icon={Shield}
                title="Privacy First"
                description="Your data stays private. We never sell your information."
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user experience - redirect to main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'there'}!
        </h2>
        <p className="text-blue-200 mb-8">
          You're all set! Redirecting you to your personalized dashboard...
        </p>
        <div className="space-y-4">
          <Button 
            onClick={() => setLocation('/')}
            className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold w-full"
          >
            <Home className="h-5 w-5 mr-2" />
            Go to Dashboard
          </Button>
          <Button 
            onClick={() => setLocation('/mobile-hub')}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Mobile Test Hub
          </Button>
        </div>
      </div>
    </div>
  );
}
