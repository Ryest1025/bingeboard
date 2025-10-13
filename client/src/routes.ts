import React from "react";
import Landing from "@/pages/landing";
import LoginSimple from "@/pages/login-simple";
import Signup from "@/pages/signup";
import ResetPassword from "@/pages/reset-password";
import Home from "@/pages/home";
import Discover from "@/pages/discover";
import Activity from "@/pages/activity";
import Friends from "@/pages/social";
import UpcomingEnhanced from "@/pages/upcoming-enhanced";
import SearchResultsPage from "@/pages/SearchResultsPage";
import NotFound from "@/pages/not-found";
import CardDemo from "@/pages/card-demo";

// Lazy imports - using the better dashboard as main
const LazyTestPersonalized = React.lazy(() => import("@/pages/test-personalized"));
const LazyDashboardReconstructed = React.lazy(() => import("@/pages/dashboard-reconstructed"));
const LazySimpleDashboard = React.lazy(() => import("@/pages/dashboard")); // Keep simple as fallback

export const publicRoutes = [
  { path: "/landing", component: Landing },
  { path: "/login", component: LoginSimple },
  { path: "/signup", component: Signup },
  { path: "/reset", component: ResetPassword },
  { path: "/card-demo", component: CardDemo }, // NEW: Demo route for premium cards
];

export const protectedRoutes = [
  { path: "/discover", component: Discover, requireAuth: true },
  { path: "/lists", component: Activity, requireAuth: true }, // Rename activity to lists
  { path: "/friends", component: Friends, requireAuth: true },
  { path: "/dashboard", component: LazyDashboardReconstructed, lazy: true, requireAuth: true }, // Use the better dashboard!
  { path: "/modern-discover", component: Discover, requireAuth: true },
  { path: "/search", component: SearchResultsPage, requireAuth: true },
  { path: "/test-personalized", component: LazyTestPersonalized, lazy: true, requireAuth: true },
  { path: "/simple-dashboard", component: LazySimpleDashboard, lazy: true, requireAuth: true }, // Move simple to test route
];

export const notFoundRoute = { component: NotFound };

// Routes where navigation should be hidden (use NavigationHeader instead)
export const navHiddenRoutes = [
  "/",
  "/landing", 
  "/discover",
  "/lists",
  "/friends",
  "/dashboard",
  "/test-dashboard"
];