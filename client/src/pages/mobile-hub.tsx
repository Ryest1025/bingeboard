import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StreamingMarqueeSection } from '@/components/streaming-marquee-section';
import {
  Smartphone,
  TestTube,
  LogIn,
  Activity,
  Settings,
  Monitor,
  ArrowRight,
  Cloud,
  AlertCircle
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';

export default function MobileHub() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [envInfo, setEnvInfo] = useState({
    hostname: window.location.hostname,
    origin: window.location.origin,
    protocol: window.location.protocol,
    isHttps: window.location.protocol === 'https:',
    isCodespaces: window.location.hostname.includes('.app.github.dev'),
    isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const mobileOptions = [
    {
      title: 'Mobile Social Login',
      description: 'Social authentication optimized for mobile',
      icon: <LogIn className="h-6 w-6" />,
      path: '/mobile-social-login',
      color: 'bg-blue-500'
    },
    {
      title: 'Mobile Email Login',
      description: 'Simple email/password authentication',
      icon: <LogIn className="h-6 w-6" />,
      path: '/mobile-login',
      color: 'bg-teal-500'
    },
    {
      title: 'Mobile Diagnostic',
      description: 'Device and environment diagnostics',
      icon: <Activity className="h-6 w-6" />,
      path: '/mobile-diagnostic',
      color: 'bg-purple-500'
    },
    {
      title: 'Mobile App',
      description: 'Mobile-optimized application experience',
      icon: <Smartphone className="h-6 w-6" />,
      path: '/mobile-app',
      color: 'bg-green-500'
    },
    {
      title: 'Codespaces Testing',
      description: 'Test authentication in Codespaces environment',
      icon: <Cloud className="h-6 w-6" />,
      path: '/mobile-social-login',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            {/* Updated BingeBoard TV Logo */}
            <div className="relative mr-4">
              <div className="w-12 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
                <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
                  <div
                    className="text-lg font-bold text-white drop-shadow-lg"
                    style={{ textShadow: '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)' }}
                  >
                    B
                  </div>
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-slate-700 rounded-sm"></div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-slate-600 rounded-sm"></div>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-black">
                  Binge
                </span>
                <span className="text-white font-light ml-1">Board</span>
              </h1>
              <p className="text-teal-400 text-sm font-medium tracking-widest uppercase opacity-75">
                Mobile Hub
              </p>
            </div>
          </div>
          <p className="text-gray-300 text-lg">
            Mobile-optimized tools and testing suite for BingeBoard
          </p>

          {/* Environment Info Banner */}
          <div className={`mt-4 p-3 rounded-lg text-sm ${envInfo.isCodespaces ? 'bg-indigo-900/30 border border-indigo-800' : 'bg-gray-800 border border-gray-700'}`}>
            <div className="flex items-center justify-center mb-2">
              {envInfo.isCodespaces ?
                <Cloud className="h-4 w-4 text-indigo-400 mr-2" /> :
                <Smartphone className="h-4 w-4 text-gray-400 mr-2" />
              }
              <span className="font-medium">
                {envInfo.isCodespaces ? 'GitHub Codespaces' : 'Local Development'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-right text-gray-400">Protocol:</div>
              <div className={envInfo.isHttps ? 'text-green-400' : 'text-yellow-400'}>
                {envInfo.protocol.replace(':', '')}
              </div>

              <div className="text-right text-gray-400">Device:</div>
              <div>{envInfo.isMobile ? 'Mobile 📱' : 'Desktop 🖥️'}</div>

              <div className="text-right text-gray-400">Domain:</div>
              <div className="truncate max-w-[150px]">{envInfo.hostname}</div>
            </div>
            {user && (
              <div className="mt-2 pt-2 border-t border-indigo-800/50 text-green-400">
                Logged in as: {user.displayName || user.email}
              </div>
            )}
          </div>
        </div>

        {/* Streaming Platforms Preview */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-white mb-2">
              Watch from <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Everywhere</span>
            </h3>
            <p className="text-gray-400 text-sm">Supports 50+ streaming platforms</p>
          </div>

          {/* Streaming Icons Row */}
          <div className="overflow-hidden relative">
            <div className="flex animate-marquee-left space-x-6 py-4">
              {/* Netflix */}
              <div className="flex-shrink-0 w-16 h-12 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              {/* Disney+ */}
              <div className="flex-shrink-0 w-16 h-12 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">D+</span>
              </div>
              {/* Max */}
              <div className="flex-shrink-0 w-16 h-12 bg-purple-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">MAX</span>
              </div>
              {/* Prime */}
              <div className="flex-shrink-0 w-16 h-12 bg-cyan-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">PV</span>
              </div>
              {/* Hulu */}
              <div className="flex-shrink-0 w-16 h-12 bg-green-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">HULU</span>
              </div>
              {/* Apple TV+ */}
              <div className="flex-shrink-0 w-16 h-12 bg-gray-800 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">TV+</span>
              </div>
              {/* Repeat for seamless loop */}
              <div className="flex-shrink-0 w-16 h-12 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <div className="flex-shrink-0 w-16 h-12 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">D+</span>
              </div>
              <div className="flex-shrink-0 w-16 h-12 bg-purple-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">MAX</span>
              </div>
              <div className="flex-shrink-0 w-16 h-12 bg-cyan-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">PV</span>
              </div>
              <div className="flex-shrink-0 w-16 h-12 bg-green-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">HULU</span>
              </div>
              <div className="flex-shrink-0 w-16 h-12 bg-gray-800 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">TV+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mobileOptions.map((option, index) => (
            <Card
              key={index}
              className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200 cursor-pointer transform hover:scale-105"
              onClick={() => setLocation(option.path)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${option.color} text-white`}>
                    {option.icon}
                  </div>
                  <CardTitle className="text-white text-lg">
                    {option.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-3">
                  {option.description}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation(option.path);
                  }}
                >
                  Open <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Device Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Screen Size</p>
                <p className="text-white font-medium">
                  {window.screen.width}x{window.screen.height}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Viewport</p>
                <p className="text-white font-medium">
                  {window.innerWidth}x{window.innerHeight}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Device Type</p>
                <p className="text-white font-medium">
                  {/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|Mobile/i.test(navigator.userAgent)
                    ? 'Mobile'
                    : 'Desktop'
                  }
                </p>
              </div>
              <div>
                <p className="text-gray-400">Touch Support</p>
                <p className="text-white font-medium">
                  {'ontouchstart' in window ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Main */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setLocation('/')}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            ← Back to Main App
          </Button>
        </div>
      </div>
    </div>
  );
}
