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
import DashboardPolished from "@/pages/dashboard-polished";
import SearchResultsPage from "@/pages/SearchResultsPage";
import NotFound from "@/pages/not-found";

// Lazy imports
const LazyTestPersonalized = React.lazy(() => import("@/pages/test-personalized"));
const LazyDashboardReconstructed = React.lazy(() => import("@/pages/dashboard-reconstructed"));

export const publicRoutes = [
  { path: "/landing", component: Landing },
  { path: "/login", component: LoginSimple },
  { path: "/signup", component: Signup },
  { path: "/reset", component: ResetPassword },
];

export const protectedRoutes = [
  { path: "/discover", component: Discover, requireAuth: true },
  { path: "/upcoming", component: UpcomingEnhanced, requireAuth: true },
  { path: "/activity", component: Activity, requireAuth: true },
  { path: "/friends", component: Friends, requireAuth: true },
  { path: "/dashboard", component: DashboardPolished, requireAuth: true },
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
  "/upcoming",
  "/activity", 
  "/friends",
  "/dashboard",
  "/test-dashboard"
];