import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  LogIn,
  Activity,
  Cloud,
  ArrowRight,
  Star,
  Users,
  Play,
  TrendingUp,
  Zap,
  Shield,
  Globe,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { SiGoogle, SiFacebook } from "react-icons/si";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';

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
    <Card className="glass-effect border-teal-500/20 h-full group hover:border-teal-400/40 transition-all duration-300 bg-gray-800/50">
      <CardContent className="p-6">
        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
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

// Official streaming platform logos - using actual files in /public/logos/
const logos = [
  { name: 'Netflix', logo: '/logos/icons8-netflix.svg' },
  { name: 'Prime Video', logo: '/logos/icons8-amazon-prime-video (1).svg' },
  { name: 'Hulu', logo: '/logos/icons8-hulu.svg' },
  { name: 'Disney+', logo: '/logos/icons8-disney-plus.svg' },
  { name: 'Max', logo: '/logos/icons8-hbo-max.svg' },
  { name: 'Apple TV+', logo: '/logos/Apple-tv-plus.svg' },
  { name: 'Peacock', logo: '/logos/icons8-peacock-tv.svg' },
  { name: 'Paramount+', logo: '/logos/icons8-paramount-plus.svg' },
  { name: 'Crunchyroll', logo: '/logos/icons8-crunchyroll.svg' },
  { name: 'ESPN+', logo: '/logos/671789-espn.svg' },
  { name: 'Showtime', logo: '/logos/Showtime--Streamline-Simple-Icons.svg' },
  { name: 'Starz', logo: '/logos/Starz--Streamline-Simple-Icons.svg' },
];

export default function MobileHub() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [trendingShows, setTrendingShows] = useState<{ results: Show[] } | null>(null);
  const [envInfo, setEnvInfo] = useState({
    hostname: window.location.hostname,
    origin: window.location.origin,
    protocol: window.location.protocol,
    isHttps: window.location.protocol === 'https:',
    isCodespaces: window.location.hostname.includes('.app.github.dev'),
    isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white">
      {/* Hero Section */}
      <div className="hero-section relative overflow-hidden bg-gradient-to-br from-black via-slate-900 to-black pt-8">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

        <div className="relative max-w-4xl mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative mr-3">
                <div className="w-12 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
                  <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
                    <div className="text-lg font-bold text-white drop-shadow-lg">B</div>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-slate-700 rounded-sm"></div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-slate-600 rounded-sm"></div>
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black leading-tight">
                  <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Binge</span>
                  <span className="text-white font-light">Board</span>
                </h1>
                <p className="text-teal-400 text-sm font-medium tracking-widest uppercase opacity-75">Mobile</p>
              </div>
            </div>

            <p className="text-lg md:text-xl text-gray-300 max-w-xl mx-auto leading-relaxed">
              Your <span className="text-teal-400 font-semibold">ultimate entertainment hub</span> for tracking shows, movies, and sports
            </p>

            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <Badge className="bg-teal-500/20 text-teal-300 border-teal-400/30 px-3 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Recommendations
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 px-3 py-1">
                <Users className="w-3 h-3 mr-1" />
                Social Features
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 px-3 py-1">
                <Shield className="w-3 h-3 mr-1" />
                Privacy First
              </Badge>
            </div>

            {/* Mobile-optimized CTA Buttons */}
            <div className="flex flex-col gap-3 pt-6">
              <a
                href="/signup"
                className="group relative bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 hover:border-red-400/50 text-white font-medium px-5 py-3 text-sm inline-flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] rounded-lg"
              >
                <SiGoogle className="w-4 h-4 text-red-400" />
                <span>Join with Google</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              </a>

              <a
                href="/signup"
                className="group relative bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 hover:border-blue-400/50 text-white font-medium px-5 py-3 text-sm inline-flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] rounded-lg"
              >
                <SiFacebook className="w-4 h-4 text-blue-400" />
                <span>Join with Facebook</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              </a>

              <a
                href="/signup"
                className="group relative bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 hover:border-teal-400/50 text-white font-medium px-5 py-3 text-sm inline-flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] rounded-lg"
              >
                <ArrowRight className="w-4 h-4 text-teal-400" />
                <span>Create Account</span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              </a>
            </div>

            <div className="text-center pt-2">
              <span className="text-gray-300 text-sm">Already have an account? </span>
              <a href="/login" className="text-teal-400 hover:text-teal-300 underline font-semibold">Sign in</a>
            </div>
          </div>
        </div>
      </div>

      {/* Streaming Platforms Marquee */}
      <div className="py-8 bg-black">
        <div className="text-center mb-4 px-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            Watch from <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Everywhere</span>
          </h3>
          <p className="text-gray-400 text-sm">Supports 50+ streaming platforms</p>
        </div>
        <div className="overflow-hidden relative">
          <div className="flex animate-marquee-left space-x-8 py-4">
            {logos.concat(logos).map((platform, i) => (
              <div key={i} className="flex-shrink-0 w-20 h-12 flex items-center justify-center">
                <img
                  src={platform.logo}
                  alt={platform.name}
                  className="h-8 object-contain drop-shadow-lg"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logos/fallback.svg';
                  }}
                />
              </div>
            ))}
          </div>
          <div className="absolute left-0 top-0 w-12 h-full bg-gradient-to-r from-black to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 w-12 h-full bg-gradient-to-l from-black to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gradient-to-b from-black to-slate-900 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Everything You Need in One Place
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Powerful features designed for modern entertainment enthusiasts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="py-12 bg-black px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Trending Now
              </h2>
              <Badge className="bg-red-500/20 text-red-300 border-red-400/30 text-xs">
                Live Data
              </Badge>
            </div>

            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {trendingShows.results?.filter(show => show && show.vote_average != null).slice(0, 8).map((show) => (
                <Card key={show.id} className="show-card flex-shrink-0 w-36 glass-effect border-slate-700/50 rounded-xl transition-all duration-300 hover:scale-105 group">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={
                          show.poster_path
                            ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                            : "/placeholder-poster.png"
                        }
                        alt={show.name || show.title || 'Unknown Title'}
                        className="w-full h-48 object-cover rounded-t-xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="absolute top-3 right-3">
                        <Badge className="glass-effect border-0 text-amber-300 font-semibold">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {show.vote_average?.toFixed(1) || 'N/A'}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-white text-sm line-clamp-2 leading-tight">
                        {show.name || show.title || 'Unknown Title'}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-300 font-medium">
                          {show.first_air_date || show.release_date ?
                            new Date(show.first_air_date || show.release_date!).getFullYear() : ''}
                        </div>
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
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Cards */}
      <div className="py-12 bg-slate-900 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-white text-center mb-6">Quick Access</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Get Started Card */}
            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200 cursor-pointer transform hover:scale-105" onClick={() => setLocation('/mobile-app')}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-500 text-white">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-white text-lg">Start Watching</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-3">
                  Access your personalized streaming dashboard
                </p>
                <Button variant="outline" size="sm" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                  Open App <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Sign In Card */}
            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200 cursor-pointer transform hover:scale-105" onClick={() => setLocation('/mobile-social-login')}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500 text-white">
                    <LogIn className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-white text-lg">Sign In</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-3">
                  Login to sync your watchlist and preferences
                </p>
                <Button variant="outline" size="sm" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                  Sign In <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* User Status */}
      {user && (
        <div className="px-4 pb-6">
          <div className="max-w-4xl mx-auto">
            <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
              <div className="flex items-center space-x-2 text-green-400">
                <LogIn className="h-5 w-5" />
                <span className="font-medium">Logged in as: {user.displayName || user.email}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 py-8 border-t border-slate-800 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-3">
              {/* TV Logo - matching header */}
              <div className="relative">
                <div className="w-8 h-6 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
                  <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
                    <div
                      className="text-xs font-bold text-white drop-shadow-lg"
                      style={{ textShadow: '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)' }}
                    >
                      B
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-slate-700 rounded-sm"></div>
                  <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-slate-600 rounded-sm"></div>
                </div>
              </div>

              {/* Brand Name - matching header */}
              <span className="text-lg select-none">
                <span className="font-black bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Binge
                </span>
                <span className="font-light text-white ml-1">Board</span>
              </span>
            </div>

            <div className="flex space-x-6 text-gray-400 text-sm">
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/contact" className="hover:text-white transition-colors">Contact</a>
            </div>

            <div className="text-center text-gray-400 text-sm">
              <p>&copy; 2024 BingeBoard. All rights reserved.</p>
            </div>

            {/* Back to Main */}
            <Button variant="outline" onClick={() => setLocation('/')} className="border-gray-600 text-gray-300 hover:bg-gray-700 mt-4">
              ← Back to Main App
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
