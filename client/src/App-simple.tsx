import { useAuth } from "@/hooks/useAuth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Router, Route, Switch } from "wouter";
import ModernHome from "@/pages/modern-home";
import ModernDiscover from "@/pages/modern-discover";
import ModernLists from "@/pages/modern-lists";
import ModernProfile from "@/pages/modern-profile";
import ModernSocial from "@/pages/modern-social";
import Landing from "@/pages/landing";
import MobileNav from "@/components/mobile-nav";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="text-white font-black text-2xl">B</div>
          </div>
          <p className="text-white text-lg">Loading BingeBoard...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <div className="min-h-screen bg-black">
            {isAuthenticated ? (
              <>
                <Switch>
                  <Route path="/" component={ModernHome} />
                  <Route path="/discover" component={ModernDiscover} />
                  <Route path="/lists" component={ModernLists} />
                  <Route path="/social" component={ModernSocial} />
                  <Route path="/profile" component={ModernProfile} />
                </Switch>
                <MobileNav />
              </>
            ) : (
              <Landing />
            )}
          </div>
        </Router>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}