import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import ModernHome from "@/pages/modern-home";
import ModernDiscover from "@/pages/modern-discover";
import ModernLists from "@/pages/modern-lists";
import ModernProfile from "@/pages/modern-profile";
import ModernSocial from "@/pages/modern-social";
import LoginSimple from "@/pages/login-simple";
import { TopNav } from "@/components/top-nav";
import MobileNav from "@/components/mobile-nav";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="text-white font-black text-2xl">B</div>
          </div>
          <p className="text-lg">Loading BingeBoard...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-black text-white">
          {isAuthenticated && <TopNav />}
          
          <main className={isAuthenticated ? "pt-16 pb-20" : ""}>
            <Switch>
              {isAuthenticated ? (
                <>
                  <Route path="/" component={ModernHome} />
                  <Route path="/discover" component={ModernDiscover} />
                  <Route path="/lists" component={ModernLists} />
                  <Route path="/social" component={ModernSocial} />
                  <Route path="/profile" component={ModernProfile} />
                </>
              ) : (
                <>
                  <Route path="/" component={Landing} />
                  <Route path="/login" component={LoginSimple} />
                </>
              )}
            </Switch>
          </main>
          
          {isAuthenticated && <MobileNav />}
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}