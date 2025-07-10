import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
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
        <div className="w-16 h-16 bg-gradient-teal rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
        {highlight && (
          <Badge className="mb-3 bg-coral-500/20 text-coral-300 border-coral-400/30">
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
  const title = show.name || show.title || '';
  const year = show.first_air_date || show.release_date ? 
    new Date(show.first_air_date || show.release_date!).getFullYear() : '';
  
  return (
    <Card className="show-card flex-shrink-0 w-36 glass-dark rounded-xl transition-all duration-300 hover:scale-105 group">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={
              show.poster_path
                ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                : "/api/placeholder/176/264"
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
  const [, setLocation] = useLocation();
  
  // State for trending shows
  const [trendingShows, setTrendingShows] = useState<{ results: Show[] } | null>(null);
  
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
    <div className="min-h-screen bg-gradient-to-br from-[hsl(228,25%,3%)] via-[hsl(226,22%,6%)] to-[hsl(224,20%,8%)]">
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
                    <div className="text-sm font-bold text-white drop-shadow-lg" style={{ textShadow: '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)' }}>B</div>
                  </div>
                  {/* TV Base */}
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-slate-700 rounded-sm"></div>
                  {/* TV Legs */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-1 bg-slate-600 rounded-sm"></div>
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Binge<span className="font-light">Board</span>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white text-sm px-2 sm:px-4 py-2"
                onClick={() => {
                  console.log('Navigating to login page...');
                  setLocation('/login');
                }}
              >
                Log In
              </Button>
              <Button 
                className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white text-sm px-3 sm:px-4 py-2"
                onClick={() => {
                  console.log('Navigating to signup page...');
                  setLocation('/login');
                }}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 via-transparent to-coral-900/20" />
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
            
            <div className="flex flex-col gap-4 justify-center max-w-md mx-auto" data-join-section>
              <Button 
                size="lg" 
                className="bg-gradient-teal px-8 py-4 text-lg font-semibold w-full"
                onClick={() => {
                  console.log('Starting Firebase Google authentication for join...');
                  window.location.href = '/api/auth/google';
                }}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Join Now with Google
              </Button>
              

              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-teal-400/30 text-teal-300 hover:bg-teal-500/10 px-8 py-4 text-lg w-full"
                onClick={() => {
                  console.log('Google login clicked');
                  window.location.href = '/api/auth/google';
                }}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Join Now with Google
              </Button>
              

              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-teal-400/30 text-teal-300 hover:bg-teal-500/10 px-8 py-4 text-lg w-full"
                onClick={() => {
                  console.log('Email signup clicked');
                  setLocation('/login');
                }}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                Sign Up with Email
              </Button>
              
              {/* Already have an account? Login link */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  Already have an account?{' '}
                  <Button
                    variant="link"
                    className="text-teal-400 hover:text-teal-300 p-0 h-auto font-medium underline"
                    onClick={() => {
                      console.log('Login link clicked - forcing navigation to login page');
                      setLocation('/login');
                    }}
                  >
                    Sign In
                  </Button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything You Need in One Platform
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Comprehensive entertainment tracking that goes beyond basic watchlists
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <FeatureCard
            icon={Zap}
            title="Real-Time Sync"
            description="Instantly track your progress across all streaming platforms with automatic episode detection"
            highlight="Live Updates"
          />
          
          <FeatureCard
            icon={Star}
            title="AI Recommendations"
            description="Advanced machine learning algorithms analyze your viewing history to find your perfect next binge"
            highlight="Powered by AI"
          />
          
          <FeatureCard
            icon={Users}
            title="Social Discovery"
            description="Connect with friends, share your viewing journey, and discover shows through your network"
          />
          
          <FeatureCard
            icon={Play}
            title="Sports Integration"
            description="Track favorite teams and get unified notifications for both shows and live games"
          />
          
          <FeatureCard
            icon={TrendingUp}
            title="Smart Analytics"
            description="Deep insights into your viewing patterns, binge streaks, and personalized statistics"
          />
          
          <FeatureCard
            icon={Smartphone}
            title="Universal Access"
            description="Works seamlessly on any device - web, mobile, tablet - no app downloads required"
          />
        </div>

        {/* Show Preview */}
        <div className="space-y-8 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-gradient-teal">Trending</span> <span className="text-white">Now</span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto leading-relaxed">
              <span className="text-gradient-teal font-semibold">Discover.</span>{" "}
              <span className="text-gradient-teal font-semibold">Binge.</span>{" "}
              <span className="text-gradient-teal font-semibold">Share.</span>
            </p>
          </div>
          
          <div className="overflow-x-auto scroll-container">
            <div className="flex space-x-6 px-6 pb-6">
              {trendingShows?.results?.slice(0, 10).map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          </div>
        </div>



        {/* Final CTA */}
        <div className="text-center pt-20">
          <div className="glass-effect rounded-3xl p-12 border border-teal-500/20 max-w-5xl mx-auto">
            <h3 className="text-5xl font-bold text-white mb-6">
              Ready to Go <span className="text-gradient-teal">Beyond the Limits</span>?
            </h3>
            <p className="text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join the next generation of entertainment tracking. Real-time sync, 
              advanced AI recommendations, and comprehensive analytics in one platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-teal hover:opacity-90 text-white px-12 py-4 text-xl rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-teal-500/25"
                onClick={() => window.location.href = "/api/login"}
              >
                Join Now
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-teal-400/50 text-teal-300 hover:bg-teal-500/10 px-12 py-4 text-xl rounded-2xl font-semibold transition-all duration-300"
                onClick={() => window.location.href = "/api/login"}
              >
                Log In
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}