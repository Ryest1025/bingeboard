import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import NavigationHeader from "@/components/navigation-header";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import CurrentlyWatchingCard from "@/components/dashboard/CurrentlyWatchingCard";
import RecommendationsCard from "@/components/dashboard/RecommendationsCard";
import BecauseYouWatchedCard from "@/components/dashboard/BecauseYouWatchedCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import QuickStatsCard from "@/components/dashboard/QuickStatsCard";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";
import UserListsCard from "@/components/dashboard/UserListsCard";
import SpotlightCard from "../components/dashboard/SpotlightCard";
import NewReleasesCard from "@/components/dashboard/NewReleasesCard";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();

  const { data: spotlightData } = useQuery({
    queryKey: ["/api/tmdb/spotlight"],
    queryFn: async () => {
      const res = await fetch("/api/tmdb/spotlight");
      if (!res.ok) throw new Error("Failed to fetch spotlight");
      return res.json();
    },
    enabled: !!isAuthenticated,
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    queryFn: async () => {
      const res = await fetch("/api/user/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user stats");
      return res.json();
    },
    enabled: !!isAuthenticated,
  });

  const { data: friendActivity } = useQuery({
    queryKey: ["/api/social/activity"],
    queryFn: async () => {
      const res = await fetch("/api/social/activity", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch friend activity");
      return res.json();
    },
    enabled: !!isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xl">
        Loading Dashboard...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    window.location.href = "/landing";
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <NavigationHeader />
      <main className="max-w-7xl mx-auto px-6 py-8 pt-24">
        {/* Header Section */}
        <div className="mb-8">
          <div>
            <WelcomeCard user={user} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Main Column */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            <SpotlightCard spotlight={spotlightData?.trending?.[0]} />
            <BecauseYouWatchedCard />
            <UserListsCard />
          </div>

          {/* Right Sidebar */}
          <aside className="lg:col-span-1 flex flex-col gap-6">
            <QuickStatsCard stats={userStats} />
            <CurrentlyWatchingCard shows={spotlightData?.continueWatching || []} />
            <RecentActivityCard feed={friendActivity || []} />
            <NewReleasesCard />
          </aside>
        </div>
      </main>
    </div>
  );
}