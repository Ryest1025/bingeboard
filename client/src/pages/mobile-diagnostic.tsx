import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MobileDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: any = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|Mobile/i.test(navigator.userAgent),
        isTouch: 'ontouchstart' in window,
        connection: (navigator as any).connection?.effectiveType || 'unknown',
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        localStorage: typeof Storage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        webgl: !!window.WebGLRenderingContext,
        indexedDB: !!window.indexedDB,
        serviceWorker: 'serviceWorker' in navigator,
        geolocation: 'geolocation' in navigator,
        orientation: window.orientation || 'unknown',
        devicePixelRatio: window.devicePixelRatio || 1,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        memory: (navigator as any).deviceMemory || 'unknown',
        cores: navigator.hardwareConcurrency || 'unknown',
        battery: 'getBattery' in navigator,
      };

      // Test API connectivity
      try {
        const response = await fetch('/api/health', { method: 'GET' });
        results.apiHealth = response.ok ? 'healthy' : 'unhealthy';
        results.apiStatus = response.status;
      } catch (error) {
        results.apiHealth = 'failed';
        results.apiError = error instanceof Error ? error.message : 'unknown error';
      }

      // Test Firebase connectivity
      try {
        const firebase = await import('../firebase/config');
        results.firebaseConfig = 'loaded';
        results.firebaseAuth = firebase.auth ? 'available' : 'unavailable';
      } catch (error) {
        results.firebaseConfig = 'failed';
        results.firebaseError = error instanceof Error ? error.message : 'unknown error';
      }

      // Test essential resources
      const resources = [
        '/manifest.json',
        '/icon-192x192.png',
        '/src/index.css'
      ];

      for (const resource of resources) {
        try {
          const response = await fetch(resource, { method: 'HEAD' });
          results[`resource_${resource.replace(/[^a-zA-Z0-9]/g, '_')}`] = response.ok ? 'available' : 'missing';
        } catch (error) {
          results[`resource_${resource.replace(/[^a-zA-Z0-9]/g, '_')}`] = 'failed';
        }
      }

      setDiagnostics(results);
      setLoading(false);
    };

    runDiagnostics();
  }, []);

  const testAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/status', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      setDiagnostics(prev => ({
        ...prev,
        authTest: {
          status: response.status,
          authenticated: data.authenticated,
          user: data.user,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        authTest: {
          error: error instanceof Error ? error.message : 'unknown error',
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-lg">Running Mobile Diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-teal-400 mb-2">Mobile Diagnostic Center</h1>
          <p className="text-gray-400">Comprehensive mobile compatibility and performance analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button onClick={testAuthentication} className="bg-teal-600 hover:bg-teal-700">
            Test Authentication
          </Button>
          <Button onClick={clearCache} className="bg-red-600 hover:bg-red-700">
            Clear Cache & Reload
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-teal-400">Device Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>Mobile:</strong> {diagnostics.isMobile ? 'Yes' : 'No'}</div>
              <div><strong>Touch:</strong> {diagnostics.isTouch ? 'Yes' : 'No'}</div>
              <div><strong>Screen:</strong> {diagnostics.screenSize}</div>
              <div><strong>Viewport:</strong> {diagnostics.viewportSize}</div>
              <div><strong>Platform:</strong> {diagnostics.platform}</div>
              <div><strong>Orientation:</strong> {diagnostics.orientation}</div>
              <div><strong>DPR:</strong> {diagnostics.devicePixelRatio}</div>
              <div><strong>Connection:</strong> {diagnostics.connection}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-teal-400">Browser Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>LocalStorage:</strong> {diagnostics.localStorage ? 'Yes' : 'No'}</div>
              <div><strong>SessionStorage:</strong> {diagnostics.sessionStorage ? 'Yes' : 'No'}</div>
              <div><strong>Cookies:</strong> {diagnostics.cookieEnabled ? 'Yes' : 'No'}</div>
              <div><strong>WebGL:</strong> {diagnostics.webgl ? 'Yes' : 'No'}</div>
              <div><strong>IndexedDB:</strong> {diagnostics.indexedDB ? 'Yes' : 'No'}</div>
              <div><strong>ServiceWorker:</strong> {diagnostics.serviceWorker ? 'Yes' : 'No'}</div>
              <div><strong>Geolocation:</strong> {diagnostics.geolocation ? 'Yes' : 'No'}</div>
              <div><strong>Battery API:</strong> {diagnostics.battery ? 'Yes' : 'No'}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-teal-400">API Connectivity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>API Health:</strong> 
                <span className={`ml-2 ${diagnostics.apiHealth === 'healthy' ? 'text-green-400' : 'text-red-400'}`}>
                  {diagnostics.apiHealth}
                </span>
              </div>
              <div><strong>API Status:</strong> {diagnostics.apiStatus}</div>
              {diagnostics.apiError && (
                <div><strong>API Error:</strong> <span className="text-red-400">{diagnostics.apiError}</span></div>
              )}
              <div><strong>Firebase Config:</strong> 
                <span className={`ml-2 ${diagnostics.firebaseConfig === 'loaded' ? 'text-green-400' : 'text-red-400'}`}>
                  {diagnostics.firebaseConfig}
                </span>
              </div>
              <div><strong>Firebase Auth:</strong> {diagnostics.firebaseAuth}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-teal-400">Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(diagnostics).filter(([key]) => key.startsWith('resource_')).map(([key, value]) => (
                <div key={key}>
                  <strong>{key.replace('resource_', '').replace(/_/g, '/')}:</strong>
                  <span className={`ml-2 ${value === 'available' ? 'text-green-400' : 'text-red-400'}`}>
                    {value as string}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {diagnostics.authTest && (
          <Card className="bg-gray-900 border-gray-700 mt-6">
            <CardHeader>
              <CardTitle className="text-teal-400">Authentication Test</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(diagnostics.authTest, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gray-900 border-gray-700 mt-6">
          <CardHeader>
            <CardTitle className="text-teal-400">User Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300 break-all">{diagnostics.userAgent}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700 mt-6">
          <CardHeader>
            <CardTitle className="text-teal-400">Raw Diagnostics</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(diagnostics, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}