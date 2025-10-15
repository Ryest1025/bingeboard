import React, { Suspense } from "react";
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

  // Always respect loading state before making auth decisions
  if (isLoading) {
    return <div className="p-6 text-gray-400">🔄 Loading...</div>;
  }

  // Additional safety check: if requireAuth is true but we have user data,
  // treat as authenticated (prevents race condition during state sync)
  if (requireAuth && !isAuthenticated && !user) {
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