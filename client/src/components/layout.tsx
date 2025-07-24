import React from "react";
import { TopNav } from "@/components/top-nav";
import MobileNav from "@/components/mobile-nav";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  showNavigation?: boolean; // Allow disabling navigation for onboarding/special pages
}

export function Layout({ children, className = "", showNavigation = true }: LayoutProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Persistent Top Navigation */}
      {showNavigation && <TopNav />}

      {/* Main Content */}
      <main className={`${showNavigation && isAuthenticated ? 'pt-16' : ''} ${className}`}>
        {children}
      </main>

      {/* Persistent Mobile Navigation */}
      {showNavigation && <MobileNav />}
    </div>
  );
}

export default Layout;
