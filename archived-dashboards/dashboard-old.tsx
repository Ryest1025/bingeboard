import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import NavigationHeader from "@/components/navigation-header";
import { ListSelectorModal } from "@/components/list-selector-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  TrendingUp,
  Clock,
  Video,
  Users
} from "lucide-react";

const moodFilters = [
  { id: "chill", label: "Chill", emoji: "😎" },
  { id: "thrilling", label: "Thrilling", emoji: "�" },
  { id: "funny", label: "Funny", emoji: "😂" },
  { id: "thoughtprovoking", label: "Thoughtful", emoji: "🤔" }
];

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Fetch trending shows
  const { data: trendingData } = useQuery({
    queryKey: ["/api/tmdb/trending"],
    queryFn: async () => {
      const res = await fetch("/api/tmdb/trending?mediaType=tv&timeWindow=week");
      if (!res.ok) throw new Error("Failed to fetch trending shows");
      const json = await res.json();
      return json.results || [];
    }
  });

  // Fetch user stats
  const { data: statsData } = useQuery({
    queryKey: ["/api/user/stats"],
    queryFn: () => apiRequest("GET", "/api/user/stats"),
    enabled: !!isAuthenticated
  });

  // Fetch user lists
  const { data: listsData } = useQuery({
    queryKey: ["/api/user/lists"],
    queryFn: () => apiRequest("GET", "/api/user/lists"),
    enabled: !!isAuthenticated
  });

  // Fetch friends activity
  const { data: friendsData } = useQuery({
    queryKey: ["/api/friends/activity"],
    queryFn: () => apiRequest("GET", "/api/friends/activity"),
    enabled: !!isAuthenticated
  });

  // Fetch continue watching data from user's activity
  const { data: continueWatchingData } = useQuery({
    queryKey: ["/api/user/continue-watching"],
    queryFn: () => apiRequest("GET", "/api/user/continue-watching"),
    enabled: !!isAuthenticated
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <span className="text-white">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please Sign In</h1>
          <Link href="/login">
            <Button className="bg-teal-600 hover:bg-teal-500 text-white">Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <NavigationHeader />

      <main className="max-w-screen-xl mx-auto p-6 space-y-10">
        {/* Welcome & Mood Filters */}
        <section className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Welcome back, {user?.displayName?.split(" ")[0] || "Friend"}!
          </h2>

          <div className="flex gap-3 flex-wrap">
            {moodFilters.map((mood) => (
              <Button
                key={mood.id}
                variant="ghost"
                onClick={() =>
                  setSelectedMood(selectedMood === mood.id ? null : mood.id)
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-base font-medium border-none shadow-none ${
                  selectedMood === mood.id
                    ? "bg-slate-800 text-white scale-105"
                    : "bg-slate-900/40 text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                <span className="text-xl">{mood.emoji}</span>
                {mood.label}
              </Button>
            ))}
          </div>
        </section>

        {/* Dashboard Widgets */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-4 rounded-xl text-white flex items-center gap-4">
            <TrendingUp className="text-teal-400 w-6 h-6" />
            <div>
              <p className="text-sm text-slate-300">Trending Shows</p>
              <p className="font-bold text-lg">{trendingData?.length ?? "—"}</p>
            </div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl text-white flex items-center gap-4">
            <Clock className="text-yellow-400 w-6 h-6" />
            <div>
              <p className="text-sm text-slate-300">Hours Watched</p>
              <p className="font-bold text-lg">{statsData?.hoursWatched ?? "—"}h</p>
            </div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl text-white flex items-center gap-4">
            <Video className="text-pink-400 w-6 h-6" />
            <div>
              <p className="text-sm text-slate-300">Your Lists</p>
              <p className="font-bold text-lg">{listsData?.length ?? "—"}</p>
            </div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl text-white flex items-center gap-4">
            <Users className="text-blue-400 w-6 h-6" />
            <div>
              <p className="text-sm text-slate-300">Friends Active</p>
              <p className="font-bold text-lg">{friendsData?.activeCount ?? "—"}</p>
            </div>
          </div>
        </section>

        {/* Continue Watching Section */}
        <section className="space-y-4">
          <h3 className="text-2xl font-bold text-white">Continue Watching</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {continueWatchingData?.map((item: any) => (
              <div key={item.id} className="space-y-2">
                <div className="rounded-xl overflow-hidden shadow-md">
                  <img
                    src={item.poster || item.posterPath || `https://image.tmdb.org/t/p/w300${item.poster_path}`}
                    alt={item.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="text-white text-sm font-semibold truncate">
                  {item.title}
                </div>
                <div className="text-slate-400 text-xs">
                  {item.episode || item.season || 'Continue watching'} • {item.platform || item.streamingService}
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-400 h-full"
                    style={{ width: `${item.progress || 0}%` }}
                  ></div>
                </div>
              </div>
            )) || (
              <div className="col-span-full text-center text-slate-400 py-8">
                <p>No shows to continue watching yet. Start watching something!</p>
                <Link href="/discover">
                  <Button className="mt-4 bg-teal-600 hover:bg-teal-500">Discover Shows</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}