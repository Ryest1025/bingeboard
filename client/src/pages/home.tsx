import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { isMobileDevice } from '@/lib/deviceUtils';
import Dashboard from './dashboard';
import Landing from './landing';

/**
 * Home Component - Smart routing for authenticated/unauthenticated users
 * 
 * This component handles the "/" route and decides what to show:
 * - Authenticated users: Dashboard (all devices)
 * - Unauthenticated mobile users: Mobile Hub
 * - Unauthenticated desktop users: Landing page
 */
export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect unauthenticated mobile users
    if (!isLoading && !isAuthenticated && isMobileDevice()) {
      console.log("📱 Unauthenticated mobile user detected, redirecting to mobile hub");
      setLocation('/mobile-hub');
      return;
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading BingeBoard...</p>
        </div>
      </div>
    );
  }

  // Authenticated users get dashboard (mobile and desktop)
  if (isAuthenticated) {
    console.log("✅ Authenticated user accessing dashboard");
    console.log("🔍 About to render DashboardFeature component");
    return <Dashboard />;
  }

  // Unauthenticated desktop users get landing page
  // (Mobile users already redirected above)
  console.log("🖥️ Unauthenticated desktop user accessing landing page");
  return <Landing />;
}
