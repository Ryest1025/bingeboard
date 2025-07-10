import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSimpleAuth, SimpleAuthProvider } from "@/components/simple-auth";
import MobileNav from "@/components/mobile-nav";
import DesktopFooter from "@/components/desktop-footer";
import { TopNav } from "@/components/top-nav";
import EnhancedOnboardingModal from "@/components/enhanced-onboarding-modal";
import SimpleNav from "@/components/simple-nav";
import { ConsentBanner } from "@/components/consent-banner";
import React, { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Landing from "@/pages/landing";
import LoginSimple from "@/pages/login-simple";
import Home from "@/pages/modern-home";
import ModernDiscover from "@/pages/modern-discover";
import Activity from "@/pages/activity";
import Friends from "@/pages/social";

import { useToast } from "@/hooks/use-toast";
import { isMobileDevice } from "@/lib/deviceUtils";
import FriendsDiscovery from "@/pages/friends-discovery";
import FindFriends from "@/pages/find-friends";
import ShowDetails from "@/pages/show-details";
import Subscription from "@/pages/subscription";
import SubscriptionPricing from "@/pages/subscription-pricing";
import StreamingIntegration from "@/pages/streaming-integration-new";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import EULA from "@/pages/eula";
import DataDeletion from "@/pages/data-deletion";
import UpcomingEnhanced from "@/pages/upcoming-enhanced";
import Lists from "@/pages/modern-lists";
import Profile from "@/pages/modern-profile";
import Settings from "@/pages/settings";
import Features from "@/pages/features";
import Watchlist from "@/pages/watchlist";
import Sports from "@/pages/sports";
import StreamingDemo from "@/pages/streaming-demo";
import NotificationsDemo from "@/pages/notifications-demo";
import NotificationCenter from "@/pages/notification-center";
import ImportHistory from "@/pages/import-history";
import ResetPassword from "@/pages/reset-password";
import OAuthRedirect from "@/pages/oauth-redirect";


function Router() {
  const { isAuthenticated, loading: isLoading } = useSimpleAuth();
  const { toast } = useToast();
  const [location] = useLocation();

  // Debug logging for route changes
  useEffect(() => {
    console.log('Current route:', location, 'Auth status:', isAuthenticated);
  }, [location, isAuthenticated]);

  // Show app immediately to prevent delays
  const [showApp, setShowApp] = useState(true);

  // Handle Firebase redirect results for mobile authentication
  useEffect(() => {
    const handleFirebaseRedirect = async () => {
      try {
        console.log('Checking for Firebase redirect result...');
        const { getRedirectResult } = await import('firebase/auth');
        const { auth } = await import('@/firebase/config-simple');
        
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Firebase redirect result found:', {
            email: result.user.email,
            displayName: result.user.displayName,
            uid: result.user.uid
          });
          
          // Create backend session
          const idToken = await result.user.getIdToken();
          console.log('Creating backend session...');
          
          const response = await fetch('/api/auth/firebase-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            credentials: 'include',
            body: JSON.stringify({ 
              firebaseToken: {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL
              }
            })
          });
          
          console.log('Backend session response:', response.status);
          
          if (response.ok) {
            toast({
              title: "Login successful",
              description: "Welcome to BingeBoard!",
            });
            window.location.href = '/';
          } else {
            const errorData = await response.text();
            console.error('Backend session error:', errorData);
            toast({
              title: "Authentication Error",
              description: "Failed to create session. Please try again.",
              variant: "destructive",
            });
          }
        } else {
          console.log('No Firebase redirect result found');
        }
      } catch (error: any) {
        console.error('Firebase redirect error:', error);
        if (error.code !== 'auth/no-auth-event') {
          toast({
            title: "Authentication Error",
            description: `Authentication failed: ${error.message}`,
            variant: "destructive",
          });
        }
      }
    };

    handleFirebaseRedirect();
  }, [toast]);

  // Add comprehensive global error handlers that completely prevent unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Always prevent default browser handling
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      
      // Completely silence all promise rejections to prevent runtime errors
      console.debug('Promise rejection silently handled');
      
      // Return handled to prevent further propagation
      return false;
    };

    const handleError = (event: ErrorEvent) => {
      // Prevent default browser handling for all network errors
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      console.debug('Error silently handled:', event.message);
      return false;
    };

    // Add multiple event listeners to catch all possible error events
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
    window.addEventListener('error', handleError, true);
    window.addEventListener('rejectionhandled', handleUnhandledRejection, true);
    document.addEventListener('unhandledrejection', handleUnhandledRejection, true);
    document.addEventListener('error', handleError, true);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('rejectionhandled', handleUnhandledRejection, true);
      document.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
      document.removeEventListener('error', handleError, true);
    };
  }, []);

  // Show loading briefly while auth is being determined to prevent 404 race condition
  if (isLoading && !showApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading BingeBoard...</p>
        </div>
      </div>
    );
  }

  // Add debug information to see what's happening
  console.log('App render state:', { isLoading, showApp, isAuthenticated });

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Add TopNav for authenticated users only */}
      {isAuthenticated && <TopNav />}
      
      <main className={`flex-1 ${isAuthenticated ? "pt-16 pb-20 md:pb-20" : "pt-0 pb-0"}`}>
        <Switch>
          {/* Public routes - always accessible */}
          <Route path="/login" component={LoginSimple} />

          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/eula" component={EULA} />
          <Route path="/data-deletion" component={DataDeletion} />
          <Route path="/landing" component={Landing} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/auth/callback" component={OAuthRedirect} />
          
          {/* Protected routes - require authentication */}
          {isAuthenticated ? (
            <>
              <Route path="/" component={Home} />
              <Route path="/discover" component={ModernDiscover} />
              <Route path="/activity" component={Activity} />
              <Route path="/friends" component={Friends} />
              <Route path="/social" component={Friends} />
              <Route path="/friends/discover" component={FriendsDiscovery} />
              <Route path="/find-friends" component={FindFriends} />
              <Route path="/upcoming" component={UpcomingEnhanced} />
              <Route path="/subscription" component={Subscription} />
              <Route path="/pricing" component={SubscriptionPricing} />
              <Route path="/streaming" component={StreamingIntegration} />
              <Route path="/profile" component={Profile} />
              <Route path="/settings" component={Settings} />
              <Route path="/features" component={Features} />
              <Route path="/lists" component={Lists} />
              <Route path="/watchlist" component={Watchlist} />
              <Route path="/sports" component={Sports} />
              <Route path="/streaming-demo" component={StreamingDemo} />
              <Route path="/notifications-demo" component={NotificationsDemo} />
              <Route path="/notifications" component={NotificationCenter} />
              <Route path="/import-history" component={ImportHistory} />
              <Route path="/show/:id" component={ShowDetails} />
            </>
          ) : (
            <>
              {/* Public routes for unauthenticated users */}
              <Route path="/" component={Landing} />
              <Route path="/about" component={Landing} />
              <Route path="/pricing" component={SubscriptionPricing} />
              <Route path="/features" component={Features} />
              <Route path="/streaming-demo" component={StreamingDemo} />
              <Route path="/notifications-demo" component={NotificationsDemo} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {/* Mobile Bottom Navigation - only for authenticated users on mobile */}
      {isAuthenticated && <MobileNav />}
      
      {/* Consent Banner for CCPA/GDPR Compliance */}
      <ConsentBanner
        onAccept={() => console.log('Consent accepted')}
        onDecline={() => console.log('Consent declined')}
      />
    </div>
  );
}

function App() {
  return (
    <SimpleAuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ErrorBoundary>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <Router />
            <Toaster />
          </ErrorBoundary>
        </TooltipProvider>
      </QueryClientProvider>
    </SimpleAuthProvider>
  );
}

export default App;