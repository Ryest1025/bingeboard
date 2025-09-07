import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import NavigationHeader from "@/components/navigation-header";
import { Search, Play, Star, Clock, Users, Plus } from "lucide-react";

export default function EnhancedDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [selectedGenre, setSelectedGenre] = useState("all");

  // Fetch genres dynamically from TMDB
  const { data: genresData, isLoading: genresLoading } = useQuery({
    queryKey: ["/api/tmdb/genre/tv/list"],
    queryFn: async () => {
      const res = await fetch("/api/tmdb/genre/tv/list");
      if (!res.ok) throw new Error("Failed to fetch genres");
      const data = await res.json();
      return data;
    },
  });

  // Create genres array with "All" option + dynamic TMDB genres
  const genres = [
    { id: "all", name: "All" },
    ...(genresData?.genres || []).slice(0, 8) // Limit to 8 genres for UI
  ];

  // Fetch trending/spotlight data filtered by genre with streaming data
  const { data: spotlightData, isLoading: spotlightLoading } = useQuery({
    queryKey: ["/api/tmdb/trending", selectedGenre],
    queryFn: async () => {
      console.log("🎬 Enhanced Dashboard - Fetching spotlight for genre:", selectedGenre);
      
      let url;
      if (selectedGenre === "all") {
        // Use trending for "all" genres with streaming data
        url = `/api/trending/tv/day?includeStreaming=true`;
      } else {
        // Use discover API for specific genres with streaming data
        url = `/api/tmdb/discover/tv?with_genres=${selectedGenre}&sort_by=popularity.desc&includeStreaming=true`;
      }
      
      console.log("🔗 Enhanced Dashboard - Spotlight URL:", url);
      
      const res = await fetch(url);
      if (!res.ok) {
        console.error("❌ Enhanced Dashboard - Spotlight fetch failed:", res.status);
        throw new Error("Failed to fetch trending");
      }
      
      const data = await res.json();
      console.log("📊 Enhanced Dashboard - API response:", data);
      console.log("🎯 Enhanced Dashboard - First show streaming platforms:", data.results?.[0]?.streaming_platforms || data.results?.[0]?.streamingPlatforms || "none");
      
      return data;
    },
    enabled: !!isAuthenticated,
  });

  // Fetch AI recommendations filtered by genre
  const { data: aiRecommendations } = useQuery({
    queryKey: ["/api/recommendations/ai", selectedGenre],
    queryFn: async () => {
      const res = await fetch(`/api/recommendations/because-you-watched?genre=${selectedGenre}`, { 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to fetch AI recommendations");
      return res.json();
    },
    enabled: !!isAuthenticated,
  });

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    queryFn: async () => {
      const res = await fetch("/api/user/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user stats");
      return res.json();
    },
    enabled: !!isAuthenticated,
  });

  // Fetch continue watching
  const { data: continueWatching } = useQuery({
    queryKey: ["/api/user/continue-watching"],
    queryFn: async () => {
      const res = await fetch("/api/user/lists", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch continue watching");
      return res.json();
    },
    enabled: !!isAuthenticated,
  });

  // Fetch user lists
  const { data: userLists } = useQuery({
    queryKey: ["/api/user/lists"],
    queryFn: async () => {
      const res = await fetch("/api/user/lists", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user lists");
      return res.json();
    },
    enabled: !!isAuthenticated,
  });

  // Fetch friend activity
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-xl">
        Loading Dashboard...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    window.location.href = "/landing";
    return null;
  }

  const featuredShow = spotlightData?.results?.[0];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NavigationHeader />
      
      <main className="max-w-7xl mx-auto px-6 py-8 pt-24">
        {/* Header with Search */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.displayName || user?.firstName || "Alex"}</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search movies, shows, and more"
              className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 w-80 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Main Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Genre Filter Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {genresLoading ? (
                <div className="flex gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-10 w-20 bg-gray-800 rounded-full animate-pulse"></div>
                  ))}
                </div>
              ) : (
                genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => setSelectedGenre(genre.id.toString())}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedGenre === genre.id.toString()
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {genre.name}
                  </button>
                ))
              )}
            </div>

            {/* Spotlight Section */}
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded text-sm font-bold">
                    #1
                  </span>
                  <span className="text-gray-300 text-sm">Trending</span>
                </div>
                
                {featuredShow ? (
                  <div className="flex gap-6">
                    <div className="flex-1">
                      <h2 className="text-4xl font-bold mb-3">{featuredShow.title || featuredShow.name}</h2>
                      <div className="flex items-center gap-4 mb-4 text-gray-300">
                        <span>{featuredShow.genre_ids?.join(", ") || "Comedy, Drama"}</span>
                        <span>{featuredShow.first_air_date?.split('-')[0] || featuredShow.release_date?.split('-')[0] || "2022"}</span>
                        <span>TV-MA</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{featuredShow.vote_average?.toFixed(1) || "8.7"}</span>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-6 leading-relaxed line-clamp-3">
                        {featuredShow.overview || "A young chef from the fine dining world comes home to Chicago to run his family sandwich shop."}
                      </p>
                      <button className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2">
                        <Play className="w-5 h-5" />
                        Watch Now
                      </button>
                    </div>
                    <div className="w-80">
                      <img
                        src={`https://image.tmdb.org/t/p/w500${featuredShow.poster_path}`}
                        alt={featuredShow.title || featuredShow.name}
                        className="w-full h-96 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #374151 0%, #4b5563 100%)';
                          e.currentTarget.src = '';
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="animate-pulse flex gap-6">
                    <div className="flex-1">
                      <div className="bg-gray-700 h-10 w-64 mb-4 rounded"></div>
                      <div className="bg-gray-700 h-4 w-48 mb-4 rounded"></div>
                      <div className="bg-gray-700 h-20 w-full mb-6 rounded"></div>
                      <div className="bg-gray-700 h-12 w-32 rounded"></div>
                    </div>
                    <div className="w-80">
                      <div className="bg-gray-700 w-full h-96 rounded-lg"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Because you watched section */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-6">Because you watched Breaking Bad</h3>
              <div className="grid grid-cols-4 gap-4">
                {aiRecommendations?.shows?.slice(0, 4)?.map((show, index) => (
                  <div key={show.id || index} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg mb-2">
                      <img
                        src={`https://image.tmdb.org/t/p/w300${show.poster_path}`}
                        alt={show.title || show.name}
                        className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #374151 0%, #4b5563 100%)';
                          e.currentTarget.src = '';
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-gray-900 bg-opacity-75 px-2 py-1 rounded text-xs font-medium">
                        {show.vote_average ? `${show.vote_average.toFixed(1)}` : "8.3"}
                      </div>
                    </div>
                    <h4 className="text-sm font-medium truncate">{show.title || show.name}</h4>
                  </div>
                )) || (
                  // Default shows
                  [
                    { name: "Better Call Saul", rating: "8.8" },
                    { name: "The Sopranos", rating: "9.2" },
                    { name: "Fargo", rating: "8.9" },
                    { name: "Ozark", rating: "8.4" }
                  ].map((show, index) => (
                    <div key={index} className="group cursor-pointer">
                      <div className="relative overflow-hidden rounded-lg mb-2">
                        <div className="w-full aspect-[2/3] bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">{show.name}</span>
                        </div>
                        <div className="absolute top-2 left-2 bg-gray-900 bg-opacity-75 px-2 py-1 rounded text-xs font-medium">
                          {show.rating}
                        </div>
                      </div>
                      <h4 className="text-sm font-medium truncate">{show.name}</h4>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Stats & Progress */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Stats & Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Watched</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{userStats?.totalHours || 65}h</div>
                    <div className="text-xs text-gray-400">{userStats?.weeklyHours || 65} hrs this week</div>
                  </div>
                </div>
                <div className="w-16 h-16 mx-auto">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      strokeDasharray="75, 100"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Continue Watching */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Continue Watching</h3>
              <div className="space-y-3">
                {[
                  { title: "The Last of Us", season: 1, episode: 6, progress: 75, network: "HBO MAX" },
                  { title: "Succession", season: 1, episode: 4, progress: 45, network: "max" }
                ].map((show, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                    <div className="w-12 h-16 bg-gray-600 rounded flex items-center justify-center text-xs text-center">
                      {show.title.split(' ').map(word => word[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{show.title}</h4>
                      <p className="text-sm text-gray-400">Resume S{show.season}E{show.episode}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-full bg-gray-600 rounded-full h-1">
                          <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${show.progress}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{show.network}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Lists */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Your Lists</h3>
                <button className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  Add new
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: "Favorites", icon: "❤️", count: 12 },
                  { name: "Watch Later", icon: "⏰", count: 8 },
                  { name: "Reality Binge", icon: "📺", count: 5 }
                ].map((list, index) => (
                  <div key={index} className="text-center group cursor-pointer">
                    <div className="bg-gray-700 rounded-lg p-3 mb-2 group-hover:bg-gray-600 transition-colors">
                      <div className="text-2xl mb-1">{list.icon}</div>
                      <div className="text-xs text-gray-300 truncate">{list.name}</div>
                      <div className="text-xs text-gray-400">{list.count}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Friends Are Watching */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Your Friends Are Watching</h3>
              <div className="space-y-3">
                {[
                  { name: "Bear", show: "The Bear", avatar: "🐻" },
                  { name: "Alex", show: "Succession", avatar: "👤" },
                  { name: "Sam", show: "Ted Lasso", avatar: "👤" }
                ].map((friend, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm">
                      {friend.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{friend.name}</span>
                      </p>
                      <p className="text-xs text-gray-400 truncate">{friend.show}</p>
                    </div>
                    <div className="w-8 h-12 bg-gray-600 rounded flex items-center justify-center text-xs">
                      📺
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
