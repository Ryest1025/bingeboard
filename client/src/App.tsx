import { Switch, Route, useLocation, Redirect } from "wouter";
import React, { useState, useEffect } from "react";
import { SafeQueryProvider } from "./lib/safeQueryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import MobileNav from "@/components/mobile-nav";
import LegalFooter from "@/components/legal-footer";
import { TopNav } from "@/components/top-nav";
import OnboardingModalPremium from "@/components/onboarding/OnboardingModal-Premium";
import SimpleNav from "@/components/simple-nav";
import { ConsentBanner } from "@/components/consent-banner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import RouteWrapper from "@/components/RouteWrapper";
import { TrailerModalProvider } from "@/components/TrailerModal";
import { publicRoutes, protectedRoutes, notFoundRoute, navHiddenRoutes } from "@/routes";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import AuthDebug from "@/pages/auth-debug";


function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Control Premium onboarding visibility
  const [showPremiumOnboarding, setShowPremiumOnboarding] = useState(false);

  // Smart onboarding logic - show for new users or when they haven't seen it yet
  useEffect(() => {
    if (isAuthenticated && user) {
      const userId = user.id || user.email;
      
      // Check localStorage first (fastest)
      const hasSeenOnboardingLocal = localStorage.getItem(`onboarding-completed-${userId}`) === 'true';
      
      // Force set onboarding as completed for existing users to prevent re-triggering
      if (!hasSeenOnboardingLocal) {
        localStorage.setItem(`onboarding-completed-${userId}`, 'true');
        console.log('🔧 Force-completed onboarding for existing user:', userId);
      }
      
      // Disable onboarding modal completely for now
      setShowPremiumOnboarding(false);
    }
  }, [isAuthenticated, user]);

  // Remove loading screen after React mounts
  useEffect(() => {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
      console.log('✅ Loading screen removed after React mount');
    }
  }, []);

  // Show loading while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">🔄 Checking authentication...</p>
        </div>
      </div>
    );
  }

  const shouldShowNav = !navHiddenRoutes.includes(location);

  return (
    <div className="min-h-screen flex flex-col bg-black overflow-x-hidden">
      {shouldShowNav && (isAuthenticated ? <TopNav /> : <SimpleNav />)}

      <main className={`flex-1 ${shouldShowNav ? "pt-16 pb-20 md:pb-20" : "pt-0 pb-0"}`}>
                <Switch>
          {/* Public routes */}
          {publicRoutes.map((r) => (
            <Route key={r.path} path={r.path}>
              <RouteWrapper
                component={r.component}
              />
            </Route>
          ))}

          {/* Debug route for testing auth */}
          <Route path="/auth-debug">
            <AuthDebug />
          </Route>

          {/* Redirect upcoming to discover */}
          <Route path="/upcoming">
            <Redirect to="/discover" />
          </Route>

          {/* Redirect activity to lists */}
          <Route path="/activity">
            <Redirect to="/lists" />
          </Route>

          {/* Root route - dynamic behavior based on auth */}
          <Route path="/">
            {(() => {
              console.log(`🛣️ Root route: isAuthenticated=${isAuthenticated}, isLoading=${isLoading}, user=${user?.email || 'null'}, redirecting to ${isAuthenticated ? 'dashboard' : 'landing'}`);
              
              if (isAuthenticated) {
                // Redirect to dashboard using wouter
                return <Redirect to="/dashboard" />;
              } else {
                return <Landing />;
              }
            })()}
          </Route>

          {/* Protected */}
          {protectedRoutes.map((r) => (
            <Route key={r.path} path={r.path}>
              <RouteWrapper
                component={r.component}
                lazy={r.lazy}
                requireAuth={r.requireAuth}
              />
            </Route>
          ))}

          {/* Not found */}
          <Route>
            <RouteWrapper component={notFoundRoute.component} />
          </Route>
        </Switch>
      </main>

      {/* Mobile Bottom Navigation - only for authenticated users */}
      {isAuthenticated && <MobileNav />}

      {/* Legal Footer - always visible for authenticated users */}
      {isAuthenticated && <LegalFooter />}

      {/* Onboarding Modal - Premium version for authenticated users */}
      {isAuthenticated && (
        <OnboardingModalPremium
          isOpen={showPremiumOnboarding}
          onComplete={() => {
            console.log('🎉 Premium onboarding completed!');
            if (user?.id || user?.email) {
              localStorage.setItem(`onboarding-completed-${user.id || user.email}`, 'true');
            }
            setShowPremiumOnboarding(false);
          }}
          userDisplayName={user?.displayName || user?.email?.split('@')[0] || 'Friend'}
          userData={user ? {
            firstName: user.displayName?.split(' ')[0],
            lastName: user.displayName?.split(' ')[1],
            email: user.email,
            profileImage: (user as any).photoURL,
            provider: (user as any).authProvider as "email" | "google" | "facebook" | undefined
          } : undefined}
        />
      )}

      {/* Consent Banner for CCPA/GDPR Compliance */}
      <ConsentBanner
        onAccept={() => {
          console.log('Consent accepted');
          if (!isAuthenticated) {
            window.location.href = '/landing';
          }
        }}
        onDecline={() => {
          console.log('Consent declined');
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
    <SafeQueryProvider>
      <TooltipProvider>
        <TrailerModalProvider>
          <ErrorBoundary>
            <Router />
            <Toaster />
          </ErrorBoundary>
        </TrailerModalProvider>
      </TooltipProvider>
    </SafeQueryProvider>
  );
}