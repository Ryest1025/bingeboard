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
 * Last Fixed: July 11, 2025 - Converted static imports to dynamic
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
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
import { useToast } from "../hooks/use-toast";
import { isMobileDevice } from "../lib/deviceUtils";
import { signInWithGoogle, signInWithFacebook } from "../lib/auth";
import { RecommendationCard } from "@/components/common";

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

function ComparisonRow({ feature, bingeboard, trakt, tvtime, hobi }: ComparisonRowProps) {
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
  const title = show.name || show.title || '';
  const year = show.first_air_date || show.release_date ? 
    new Date(show.first_air_date || show.release_date!).getFullYear() : '';
  
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
              {show.vote_average.toFixed(1)}
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
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [trendingShows, setTrendingShows] = useState<{ results: Show[] } | null>(null);

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
      const user = await signInWithGoogle();
      try {
        await createBackendSession(user);
      } catch (backendError) {
        console.warn('Backend session creation failed, but login succeeded:', backendError);
      }
      setLocation('/dashboard');
    } catch (err: any) {
      toast({
        title: "Sign-in Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    console.log("🔄 Facebook login button clicked!");
    setLoading(true);
    try {
      const user = await signInWithFacebook();
      try {
        await createBackendSession(user);
      } catch (backendError) {
        console.warn('Backend session creation failed, but login succeeded:', backendError);
      }
      setLocation('/dashboard');
    } catch (err: any) {
      toast({
        title: "Sign-in Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Safe fetch function that never throws errors
  const safeFetch = async (url: string) => {
    try {
      const response = await fetch(url, { credentials: 'include' });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.debug('Safe fetch handled error:', error);
      return null;
    }
  };

  // Fetch trending shows safely
  useEffect(() => {
    safeFetch('/api/tmdb/trending').then(data => {
      if (data) setTrendingShows(data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header with Updated Logo */}
      <header className="relative z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative">
                {/* TV Frame - Updated to match new design */}
                <div className="w-10 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
                  {/* TV Screen */}
                  <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-sm flex items-center justify-center">
                    <div className="text-sm font-black text-white drop-shadow-lg" style={{ textShadow: '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)' }}>B</div>
                  </div>
                  {/* TV Base */}
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-slate-700 rounded-sm"></div>
                  {/* TV Legs */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-1 bg-slate-600 rounded-sm"></div>
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                <span className="font-black">Binge</span>
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-light">Board</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/login-simple">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-white text-sm px-2 sm:px-4 py-2"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button 
                  className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white text-sm px-3 sm:px-4 py-2"
                >
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 via-transparent to-blue-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(61,212,221,0.15)_0%,transparent_60%)]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-12 sm:pb-16">
          <div className="text-center space-y-6 sm:space-y-8">
            <div className="space-y-4 sm:space-y-6">
              <Badge className="glass-effect border-teal-400/30 text-teal-300 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                The Next Generation of Entertainment Tracking
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight px-2 sm:px-0">
                Entertainment
                <span className="block bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Beyond Limits</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto font-medium px-4 sm:px-0">
                Track shows and sports, discover what to watch next, and share your entertainment journey with friends.
              </p>
            </div>
            
            <div className="space-y-6 max-w-md mx-auto">
              {/* Social Login Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  size="lg" 
                  variant="outline"
                  className="border-slate-700 bg-white/5 hover:bg-white/10 text-white px-6 py-4 w-full"
                >
                  <SiGoogle className="h-5 w-5 mr-3" />
                  Join Now with Google
                </Button>
                <Button 
                  onClick={handleFacebookLogin}
                  disabled={loading}
                  size="lg" 
                  variant="outline"
                  className="border-slate-700 bg-blue-600/20 hover:bg-blue-600/30 text-white px-6 py-4 w-full"
                >
                  <SiFacebook className="h-5 w-5 mr-3" />
                  Join Now with Facebook
                </Button>
              </div>
              
              {/* OR Separator */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-2 text-slate-400">Or</span>
                </div>
              </div>
              
              {/* Email Login Options */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold w-full sm:w-auto"
                  >
                    Join Now
                  </Button>
                </Link>
                <Link href="/login-simple">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-teal-400/30 text-teal-300 hover:bg-teal-500/10 px-8 py-4 text-lg w-full sm:w-auto"
                  >
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Features */}
      <div className="relative py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12 sm:mb-16">
            <Badge className="glass-effect border-teal-400/30 text-teal-300 px-4 py-2 text-sm">
              Core Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Everything You Need to 
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent block">
                Track Your Entertainment
              </span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard
              icon={Play}
              title="Smart Tracking"
              description="Automatically track your progress across all your favorite shows and movies with intelligent episode detection."
              highlight="AI-Powered"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Trending Discovery"
              description="Discover what's hot right now with real-time trending data and personalized recommendations."
            />
            <FeatureCard
              icon={Users}
              title="Social Features"
              description="Share your viewing experiences, see what friends are watching, and get recommendations from your network."
            />
            <FeatureCard
              icon={Zap}
              title="Instant Sync"
              description="Sync your progress across all devices instantly. Never lose track of where you left off."
            />
            <FeatureCard
              icon={Shield}
              title="Privacy First"
              description="Your data stays private. We never sell your information or share it with third parties."
            />
            <FeatureCard
              icon={Globe}
              title="Multi-Platform"
              description="Works with all major streaming platforms. One app to rule them all."
            />
          </div>
        </div>
      </div>

      {/* Trending Shows Section */}
      {trendingShows && trendingShows.results && (
        <div className="relative py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <Badge className="glass-effect border-teal-400/30 text-teal-300 px-4 py-2 text-sm">
                What's Trending
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Popular Right Now
              </h2>
            </div>
            
            <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-hide">
              {trendingShows.results.slice(0, 8).map((show) => (
                <RecommendationCard 
                  key={show.id} 
                  show={{
                    tmdbId: show.id,
                    title: show.name || show.title || 'Unknown Title',
                    posterPath: show.poster_path 
                      ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                      : undefined,
                    rating: show.vote_average?.toFixed(1) || 'N/A'
                  }}
                  variant="compact"
                  onInteraction={(action, tmdbId) => {
                    console.log(`Landing backup trending interaction: ${action} on ${tmdbId}`);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="relative py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/20 via-cyan-900/20 to-blue-900/20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Ready to Start Your
              <span className="block bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Entertainment Journey?
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
              Join thousands of users who have already discovered their next favorite show.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link href="/login-simple">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold w-full sm:w-auto"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative py-12 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-6 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
                <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-sm flex items-center justify-center">
                  <div className="text-xs font-black text-white">B</div>
                </div>
                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-slate-700 rounded-sm"></div>
                <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-slate-600 rounded-sm"></div>
              </div>
              <span className="text-lg font-bold text-white">
                <span className="font-black">Binge</span>
                <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent font-light">Board</span>
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <span>© 2025 BingeBoard. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}