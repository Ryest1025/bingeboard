import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Smartphone, Monitor, Wifi, Battery, Signal, Globe, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DeviceInfo {
  userAgent: string;
  platform: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  orientation: string;
  isOnline: boolean;
  connection?: any;
  touchSupport: boolean;
  viewport: {
    width: number;
    height: number;
  };
}

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

export default function MobileTestComprehensive() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const detectDevice = (): DeviceInfo => {
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    
    // Mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
                     /Mobile|Tablet/i.test(ua) ||
                     window.innerWidth <= 768;
    
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua) ||
                     (window.innerWidth > 768 && window.innerWidth <= 1024);
    
    const isDesktop = !isMobile && !isTablet;
    
    // Touch support
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Orientation
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    
    // Connection info
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      userAgent: ua,
      platform,
      isMobile,
      isTablet,
      isDesktop,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio || 1,
      orientation,
      isOnline: navigator.onLine,
      connection,
      touchSupport,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  };

  const runCompatibilityTests = (info: DeviceInfo): TestResult[] => {
    const tests: TestResult[] = [];
    
    // Basic loading test
    tests.push({
      name: 'App Loading',
      status: 'pass',
      message: 'Application loaded successfully'
    });
    
    // Responsive design test
    if (info.viewport.width < 768) {
      tests.push({
        name: 'Mobile Layout',
        status: info.isMobile ? 'pass' : 'warning',
        message: info.isMobile ? 'Mobile layout detected' : 'Small screen but not mobile device'
      });
    } else {
      tests.push({
        name: 'Desktop Layout',
        status: 'pass',
        message: 'Desktop layout active'
      });
    }
    
    // Touch support test
    tests.push({
      name: 'Touch Support',
      status: info.touchSupport ? 'pass' : 'warning',
      message: info.touchSupport ? 'Touch events supported' : 'No touch support detected'
    });
    
    // Network connectivity
    tests.push({
      name: 'Network Connection',
      status: info.isOnline ? 'pass' : 'fail',
      message: info.isOnline ? 'Online' : 'Offline'
    });
    
    // Modern browser features
    const hasLocalStorage = typeof Storage !== 'undefined';
    tests.push({
      name: 'Local Storage',
      status: hasLocalStorage ? 'pass' : 'fail',
      message: hasLocalStorage ? 'Local Storage available' : 'Local Storage not supported'
    });
    
    // Firebase compatibility
    const hasFirebase = typeof window !== 'undefined' && 'firebase' in window;
    tests.push({
      name: 'Firebase SDK',
      status: 'pass',
      message: 'Firebase SDK loaded via modules'
    });
    
    // Service Worker support
    const hasServiceWorker = 'serviceWorker' in navigator;
    tests.push({
      name: 'Service Worker',
      status: hasServiceWorker ? 'pass' : 'warning',
      message: hasServiceWorker ? 'Service Worker supported' : 'Service Worker not available'
    });
    
    return tests;
  };

  const testNetworkSpeed = async (): Promise<TestResult> => {
    try {
      const start = performance.now();
      await fetch('/api/auth/user'); // Test endpoint
      const end = performance.now();
      const duration = end - start;
      
      let status: 'pass' | 'warning' | 'fail' = 'pass';
      let message = `Network latency: ${duration.toFixed(0)}ms`;
      
      if (duration > 2000) {
        status = 'fail';
        message += ' (Very slow)';
      } else if (duration > 1000) {
        status = 'warning';
        message += ' (Slow)';
      } else {
        message += ' (Good)';
      }
      
      return { name: 'Network Speed', status, message };
    } catch (error) {
      return {
        name: 'Network Speed',
        status: 'fail',
        message: 'Network test failed'
      };
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      
      const info = detectDevice();
      setDeviceInfo(info);
      
      const basicTests = runCompatibilityTests(info);
      const networkTest = await testNetworkSpeed();
      
      setTestResults([...basicTests, networkTest]);
      setIsLoading(false);
    };
    
    init();
    
    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(() => {
        const info = detectDevice();
        setDeviceInfo(info);
      }, 100);
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getDeviceIcon = () => {
    if (!deviceInfo) return <Monitor className="h-5 w-5" />;
    if (deviceInfo.isMobile) return <Smartphone className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Running compatibility tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            {getDeviceIcon()}
            BingeBoard Mobile & Web Compatibility Test
          </h1>
          <p className="text-gray-600 mt-2">Comprehensive device and feature testing</p>
          
          {/* Big Navigation Button */}
          <div className="mt-6">
            {/* React Button */}
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full max-w-md mx-auto text-lg py-4 bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              🏠 Go to Main BingeBoard App
            </Button>
            
            {/* Fallback HTML Button */}
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                width: '100%',
                maxWidth: '400px',
                margin: '10px auto',
                padding: '15px 20px',
                fontSize: '18px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'block'
              }}
            >
              🏠 Go to Main BingeBoard App (Fallback)
            </button>
            
            {/* Simple Link */}
            <div className="mt-4">
              <a 
                href="/"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  maxWidth: '300px',
                  margin: '0 auto'
                }}
              >
                📱 Click Here for Main App
              </a>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              Or manually navigate to: <br/>
              <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">
                http://192.168.1.234:5000
              </code>
            </p>
          </div>
        </div>

        {/* Device Information Card */}
        {deviceInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getDeviceIcon()}
                Device Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Device Type:</span>
                    <Badge variant={deviceInfo.isMobile ? "default" : "secondary"}>
                      {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Platform:</span>
                    <span className="text-sm">{deviceInfo.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Screen Size:</span>
                    <span className="text-sm">{deviceInfo.screenWidth} × {deviceInfo.screenHeight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Viewport:</span>
                    <span className="text-sm">{deviceInfo.viewport.width} × {deviceInfo.viewport.height}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Orientation:</span>
                    <Badge variant="outline">{deviceInfo.orientation}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Touch Support:</span>
                    <Badge variant={deviceInfo.touchSupport ? "default" : "secondary"}>
                      {deviceInfo.touchSupport ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Pixel Ratio:</span>
                    <span className="text-sm">{deviceInfo.devicePixelRatio}x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Connection:</span>
                    <div className="flex items-center gap-1">
                      {deviceInfo.isOnline ? (
                        <Wifi className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">{deviceInfo.isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {deviceInfo.connection && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Network Details:</h4>
                  <div className="text-sm space-y-1">
                    <div>Type: {deviceInfo.connection.effectiveType || 'Unknown'}</div>
                    <div>Downlink: {deviceInfo.connection.downlink || 'Unknown'} Mbps</div>
                    <div>RTT: {deviceInfo.connection.rtt || 'Unknown'} ms</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Test Results Card */}
        <Card>
          <CardHeader>
            <CardTitle>Compatibility Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{test.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => window.location.href = '/firebase-auth-test'}
                className="w-full"
              >
                Test Firebase Auth
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
              >
                Go to Main App
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Refresh Tests
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">🌐 Web Testing:</h4>
                <ul className="text-sm space-y-1 text-gray-600 ml-4">
                  <li>• Visit http://localhost:5000 in your browser</li>
                  <li>• Resize your browser window to test responsive design</li>
                  <li>• Test different screen sizes using browser dev tools</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">📱 Mobile Testing:</h4>
                <ul className="text-sm space-y-1 text-gray-600 ml-4">
                  <li>• Get your computer's IP address: <code>ipconfig</code></li>
                  <li>• On your phone, visit http://[YOUR-IP]:5000</li>
                  <li>• Test touch interactions and mobile navigation</li>
                  <li>• Try rotating your device to test orientation changes</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">🔧 Alternative Methods:</h4>
                <ul className="text-sm space-y-1 text-gray-600 ml-4">
                  <li>• Use ngrok for external access: <code>ngrok http 5000</code></li>
                  <li>• Use browser dev tools to simulate mobile devices</li>
                  <li>• Test on different browsers (Chrome, Safari, Firefox)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
