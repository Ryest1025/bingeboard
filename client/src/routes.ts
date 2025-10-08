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
import Dashboard from "@/pages/dashboard";
import SearchResultsPage from "@/pages/SearchResultsPage";
import NotFound from "@/pages/not-found";
import CardDemo from "@/pages/card-demo";

// Lazy imports
const LazyTestPersonalized = React.lazy(() => import("@/pages/test-personalized"));
const LazyDashboardReconstructed = React.lazy(() => import("@/pages/dashboard-reconstructed"));

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
  { path: "/dashboard", component: Dashboard, requireAuth: true },
  { path: "/modern-discover", component: Discover, requireAuth: true },
  { path: "/search", component: SearchResultsPage, requireAuth: true },
  { path: "/test-personalized", component: LazyTestPersonalized, lazy: true, requireAuth: true },
  { path: "/test-dashboard", component: LazyDashboardReconstructed, lazy: true, requireAuth: true },
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