import { Switch, Route, useLocation } from "wouter";
import React, { Suspense, useState, useEffect, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
// import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import MobileNav from "@/components/mobile-nav";
import DesktopFooter from "@/components/desktop-footer";
import LegalFooter from "@/components/legal-footer";
import { TopNav } from "@/components/top-nav";
import OnboardingModalPremium from "@/components/onboarding/OnboardingModal-Premium";
import SimpleNav from "@/components/simple-nav";
import { ConsentBanner } from "@/components/consent-banner";
import NotFound from "@/pages/not-found";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Landing from "@/pages/landing";
import LoginSimple from "@/pages/login-simple";
import Signup from "@/pages/signup";
import MobileSocialLogin from "@/pages/mobile-social-login";
import MobileLogin from "@/pages/mobile-login";
import Home from "@/pages/dashboard";
import ModernDiscover from "@/pages/modern-discover";
import Activity from "@/pages/activity";
import Friends from "@/pages/social";

// Auth components
import { LoginButton } from "@/components/LoginButton";
import { LogoutButton } from "@/components/LogoutButton";

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
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Control Premium onboarding visibility
  const [showPremiumOnboarding, setShowPremiumOnboarding] = useState(false);
  
  // DISABLE ONBOARDING COMPLETELY - User has already completed it
  useEffect(() => {
    setShowPremiumOnboarding(false); // Never show onboarding
  }, []);  // Remove loading screen after React mounts
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
    console.log('Current route:', location, 'Auth status:', isAuthenticated, 'User:', user?.email || 'none');
  }, [location, isAuthenticated, user]);

  // Remove loading overlays after React mounts
  useEffect(() => {
    const loadingDiv = document.querySelector('.loading-fallback') || document.getElementById('loading-fallback');
    if (loadingDiv && loadingDiv.parentNode) {
      loadingDiv.parentNode.removeChild(loadingDiv);
      console.log('✅ Removed loading overlay');
    }
  }, []);

  // Show loading while auth is being determined
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

  // Add debug information to see what's happening
  console.log('App render state:', { isLoading, isAuthenticated, userEmail: user?.email });
  console.log('🏠 Home route will render:', isAuthenticated ? 'Home (Dashboard)' : 'Landing', 'for path "/"');

  return (
    <div className="min-h-screen flex flex-col bg-black">
            {/* Navigation bars:
          - Main app pages (/, /discover, /upcoming, /activity, /friends) use NavigationHeader 
          - Other authenticated users get TopNav
          - Unauthenticated users get SimpleNav (except on landing page) */}
      {location !== "/landing" && 
       location !== "/" && 
       location !== "/discover" && 
       location !== "/upcoming" && 
       location !== "/activity" && 
       location !== "/friends" && (
        isAuthenticated ? <TopNav /> : <SimpleNav />
      )}
      
      <main className={`flex-1 ${
        (isAuthenticated && 
         location !== "/landing" && 
         location !== "/" &&
         location !== "/discover" && 
         location !== "/upcoming" && 
         location !== "/activity" && 
         location !== "/friends") 
          ? "pt-16 pb-20 md:pb-20" 
          : "pt-0 pb-0"
      }`}>
        <Switch>
          {/* Public routes - always accessible */}
          <Route path="/login" component={LoginSimple} />
          <Route path="/login-simple" component={LoginSimple} />
          <Route path="/signup" component={Signup} />
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
          
          {/* Conditional home route based on authentication - MUST BE FIRST */}
          <Route path="/" component={isAuthenticated ? Home : Landing} />
          
          {/* Protected routes - require authentication */}
          {isAuthenticated ? (
            <>
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
      
      {/* Legal Footer - always visible for authenticated users */}
      {isAuthenticated && <LegalFooter />}
      
      {/* Onboarding Modal - Premium version for authenticated users */}
      {isAuthenticated && (
        <OnboardingModalPremium
          isOpen={showPremiumOnboarding}
          onComplete={() => {
            console.log('🎉 Premium onboarding completed!');
            setShowPremiumOnboarding(false);
            // Refresh user data to update onboarding status
            // This should be handled by the onboarding component's API calls
          }}
          userDisplayName={user?.displayName || user?.firstName || user?.email?.split('@')[0] || 'Friend'}
          userData={user}
        />
      )}
      
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
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Router />
          {/* <Toaster /> */}
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}