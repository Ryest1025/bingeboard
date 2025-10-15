import React, { Suspense, useState, useEffect } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface RouteWrapperProps {
  component: React.ComponentType<any>;
  lazy?: boolean;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Wraps routes with:
 * - Suspense fallback for lazy imports
 * - Auth check (redirect to /login if required)
 * - Debug logging for navigation
 */
export default function RouteWrapper({
  component: Component,
  lazy = false,
  requireAuth = false,
  fallback = <div className="p-6 text-gray-400">Loading…</div>,
}: RouteWrapperProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Use effect to delay redirect decision until after first render
  useEffect(() => {
    if (requireAuth && !isAuthenticated && !user && !isLoading) {
      // Give auth state one more chance to sync before redirecting
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShouldRedirect(false);
    }
  }, [requireAuth, isAuthenticated, user, isLoading]);

  // Always respect loading state before making auth decisions
  if (isLoading) {
    return <div className="p-6 text-gray-400">🔄 Loading...</div>;
  }

  // Check if we should redirect after the delay
  if (shouldRedirect) {
    console.log("🔒 Redirecting unauthenticated user to /login");
    return <Redirect to="/login" />;
  }

  return lazy ? (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  ) : (
    <Component />
  );
}