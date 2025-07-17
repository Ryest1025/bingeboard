<<<<<<< HEAD
import { Switch, Route, useLocation } from "wouter";
import React, { Suspense, useState, useEffect, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
// import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import MobileNav from "@/components/mobile-nav";
import DesktopFooter from "@/components/desktop-footer";
import { TopNav } from "@/components/top-nav";
import EnhancedOnboardingModal from "@/components/enhanced-onboarding-modal";
import SimpleNav from "@/components/simple-nav";
import { ConsentBanner } from "@/components/consent-banner";
import NotFound from "@/pages/not-found";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Landing from "@/pages/landing";
import LoginSimple from "@/pages/login-simple";
import MobileSocialLogin from "@/pages/mobile-social-login";
import MobileLogin from "@/pages/mobile-login";
import Home from "@/pages/modern-home";
import ModernDiscover from "@/pages/modern-discover";
import Activity from "@/pages/activity";
import Friends from "@/pages/social";

// import { useToast } from "@/hooks/use-toast";
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
import MobileDiagnostic from "@/pages/mobile-diagnostic";
import MobileHub from "@/pages/mobile-hub";
import MobileApp from "@/pages/mobile-app";
/**
 * 🔒 CLEANED UP: Removed duplicate auth pages and test components
 * Only keeping essential auth functionality in login-simple.tsx
 * Last Cleaned: July 12, 2025
 */


function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Remove loading screen after React mounts
  useEffect(() => {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
      console.log('✅ Loading screen removed after React mount');
    }
  }, []);
  // const { toast } = useToast();
  const [location] = useLocation();

  // Debug logging for route changes
  useEffect(() => {
    console.log('Current route:', location, 'Auth status:', isAuthenticated);
  }, [location, isAuthenticated]);

  // Show app immediately to prevent delays
  const [showApp, setShowApp] = useState(true);

  // Remove loading overlays after React mounts
  useEffect(() => {
    const loadingDiv = document.querySelector('.loading-fallback') || document.getElementById('loading-fallback');
    if (loadingDiv && loadingDiv.parentNode) {
      loadingDiv.parentNode.removeChild(loadingDiv);
      console.log('✅ Removed loading overlay');
    }
  }, []);

  // Show loading briefly while auth is being determined to prevent 404 race condition
  if (isLoading && !showApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading BingeBoard...</p>
=======
import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Route, Switch } from "wouter";
import Layout from "./components/layout";
import Landing from "./pages/landing";
import SimpleLogin from "./pages/simple-login";
import Signup from "./pages/signup";
import WorkingDashboard from "./pages/working-dashboard";
import EnhancedDiscover from "./pages/enhanced-discover";
import Watchlist from "./pages/watchlist";
import ListsPage from "./pages/lists";
import Social from "./pages/social";
import SettingsPage from "./pages/settings";

// Simple components for now until we fix ModernHome imports
function SimpleDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">🎉 Welcome to BingeBoard!</h1>
        <p className="text-xl text-gray-300 mb-8">Your Dashboard is Loading...</p>
        <p className="text-gray-400 mb-8">Authentication successful! ✅</p>
        <div className="space-x-4">
          <a href="/" className="text-teal-400 hover:text-teal-300 text-lg">
            ← Back to Home
          </a>
          <a href="/social" className="text-blue-400 hover:text-blue-300 text-lg">
            Social →
          </a>
>>>>>>> ad00a93 (🚀 Major Mobile-First Redesign & Persistent Navigation Implementation)
        </div>
      </div>
    </div>
  );
}

// Simple social component for now
function SimpleSocial() {
  return (
<<<<<<< HEAD
    <div className="min-h-screen flex flex-col bg-black">
      {/* Add TopNav for authenticated users only */}
      {isAuthenticated && <TopNav />}
      
      <main className={`flex-1 ${isAuthenticated ? "pt-16 pb-20 md:pb-20" : "pt-0 pb-0"}`}>
        <Switch>
          {/* Public routes - always accessible */}
          <Route path="/login" component={LoginSimple} />
          <Route path="/login-simple" component={LoginSimple} />
          <Route path="/mobile-login" component={MobileLogin} />
          <Route path="/mobile-social-login" component={MobileSocialLogin} />
          <Route path="/mobile-app" component={MobileApp} />
          <Route path="/mobile-hub" component={MobileHub} />
          <Route path="/mobile" component={MobileHub} />
          <Route path="/m" component={MobileHub} />

          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/eula" component={EULA} />
          <Route path="/data-deletion" component={DataDeletion} />
          <Route path="/landing" component={Landing} />
          <Route path="/reset-password" component={ResetPassword} />
          
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
              <Route path="/mobile-diagnostic" component={MobileDiagnostic} />
              <Route path="/mobile-hub" component={MobileHub} />
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
              <Route path="/mobile-diagnostic" component={MobileDiagnostic} />
              <Route path="/mobile-hub" component={MobileHub} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {/* Mobile Bottom Navigation - only for authenticated users on mobile */}
      {isAuthenticated && <MobileNav />}
      
      {/* Consent Banner for CCPA/GDPR Compliance */}
      <ConsentBanner
        onAccept={() => {
          console.log('Consent accepted');
          // Navigate to landing page after consent acceptance
          if (!isAuthenticated) {
            window.location.href = '/landing';
          }
        }}
        onDecline={() => {
          console.log('Consent declined');
          // Still allow access to landing page
          if (!isAuthenticated) {
            window.location.href = '/landing';
          }
        }}
      />
=======
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">👥 Social Feed</h1>
        <p className="text-xl text-gray-300 mb-8">Connect with fellow bingers</p>
        <p className="text-gray-400 mb-8">Coming Soon: Friend activity, shared lists, and more!</p>
        <div className="space-x-4">
          <a href="/dashboard" className="text-teal-400 hover:text-teal-300 text-lg">
            ← Dashboard
          </a>
          <a href="/" className="text-blue-400 hover:text-blue-300 text-lg">
            Home →
          </a>
        </div>
      </div>
>>>>>>> ad00a93 (🚀 Major Mobile-First Redesign & Persistent Navigation Implementation)
    </div>
  );
}

export default function App() {
  console.log("🚀 App with authentication and social");
  
  return (
    <QueryClientProvider client={queryClient}>
<<<<<<< HEAD
      <TooltipProvider>
        <ErrorBoundary>
          <Router />
          {/* <Toaster /> */}
        </ErrorBoundary>
      </TooltipProvider>
=======
      <Switch>
        {/* Public routes without persistent navigation */}
        <Route path="/" component={Landing} />
        <Route path="/login" component={SimpleLogin} />
        <Route path="/signup" component={Signup} />
        
        {/* Authenticated routes with persistent navigation */}
        <Route path="/dashboard">
          <Layout>
            <WorkingDashboard />
          </Layout>
        </Route>
        <Route path="/discover">
          <Layout>
            <EnhancedDiscover />
          </Layout>
        </Route>
        <Route path="/watchlist">
          <Layout>
            <Watchlist />
          </Layout>
        </Route>
        <Route path="/lists">
          <Layout>
            <ListsPage />
          </Layout>
        </Route>
        <Route path="/social">
          <Layout>
            <Social />
          </Layout>
        </Route>
        <Route path="/settings">
          <Layout>
            <SettingsPage />
          </Layout>
        </Route>
        
        {/* Default route */}
        <Route>
          <Landing />
        </Route>
      </Switch>
>>>>>>> ad00a93 (🚀 Major Mobile-First Redesign & Persistent Navigation Implementation)
    </QueryClientProvider>
  );
}
