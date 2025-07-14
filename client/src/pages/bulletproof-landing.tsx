/**
 * BULLETPROOF LANDING PAGE
 * 
 * This landing page works on all devices and eliminates all authentication issues.
 * It provides a stable entry point that never fails to load.
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tv, Star, Users, Calendar, Play, Shield, Zap, Globe } from "lucide-react";

// Simple mobile detection
const isMobileDevice = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export default function BulletproofLanding() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState({
    type: "Unknown",
    mobile: false,
    userAgent: ""
  });

  useEffect(() => {
    // Initialize device detection
    const mobile = isMobileDevice();
    setDeviceInfo({
      type: mobile ? "Mobile" : "Desktop",
      mobile,
      userAgent: navigator.userAgent
    });
    
    // Set loading to false after initialization
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const handleGetStarted = () => {
    if (deviceInfo.mobile) {
      setLocation('/mobile-login');
    } else {
      setLocation('/login');
    }
  };

  const features = [
    {
      icon: <Tv className="h-6 w-6" />,
      title: "Track Your Shows",
      description: "Never lose track of what you're watching"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Smart Recommendations",
      description: "AI-powered suggestions based on your taste"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Social Features",
      description: "Connect with friends and share your favorites"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Release Calendar",
      description: "Never miss new episodes or seasons"
    },
    {
      icon: <Play className="h-6 w-6" />,
      title: "Streaming Links",
      description: "Direct links to watch on your favorite platforms"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Privacy First",
      description: "Your data is secure and private"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-12 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg border-2 border-slate-500 shadow-lg mx-auto mb-4">
            <div className="w-full h-full bg-gradient-to-br from-teal-500 to-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-black text-xl">B</span>
            </div>
          </div>
          <p className="text-slate-400">Loading BingeBoard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo and Brand */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-16 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg border-2 border-slate-500 shadow-lg">
                <div className="absolute inset-2 bg-gradient-to-br from-teal-500 to-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-black text-2xl">B</span>
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-slate-600 rounded-full"></div>
                <div className="absolute -bottom-3 left-1/4 w-3 h-3 bg-slate-600 rounded-full"></div>
                <div className="absolute -bottom-3 right-1/4 w-3 h-3 bg-slate-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">Binge</span>
            <span className="text-white font-light">Board</span>
          </h1>
          
          <p className="text-slate-400 text-lg mb-2">Entertainment Hub</p>
          
          <div className="flex justify-center gap-4 mb-8">
            <Badge variant="secondary" className="bg-teal-500/20 text-teal-400">
              <Zap className="h-3 w-3 mr-1" />
              {deviceInfo.type} Optimized
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              <Globe className="h-3 w-3 mr-1" />
              Universal Access
            </Badge>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              <Shield className="h-3 w-3 mr-1" />
              Secure
            </Badge>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-200">
            Track, Discover, and Binge Smarter
          </h2>
          
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            The ultimate entertainment tracking platform that helps you manage your viewing experience, 
            discover new content, and connect with fellow binge-watchers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-6 text-lg font-semibold"
              size="lg"
            >
              Get Started Free
            </Button>
            <Button 
              onClick={() => setLocation('/features')}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-6 text-lg"
              size="lg"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-teal-500 to-blue-600 p-2 rounded-lg">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Device Info (Debug) */}
        <div className="mt-16 text-center">
          <div className="bg-slate-900/50 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-xs text-slate-500 mb-2">Device Information</p>
            <p className="text-sm text-slate-400">
              Platform: {deviceInfo.type} | 
              Mobile: {deviceInfo.mobile ? 'Yes' : 'No'}
            </p>
            <p className="text-xs text-slate-600 mt-2">
              Optimized authentication route ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}