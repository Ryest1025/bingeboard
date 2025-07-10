import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { TopNav } from "@/components/top-nav";
import MobileNav from "@/components/mobile-nav";

// Clean UI Test - Following exact suggestions from attachment
export default function UITestPage() {
  const { user, isAuthenticated } = useAuth();

  // Sample data for Continue Watching (using real TMDB data)
  const continueWatching = [
    {
      id: 1,
      title: "House of the Dragon",
      episode: "S2 E4",
      thumbnail: "https://image.tmdb.org/t/p/w500/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg",
      progress: 75,
      timeWatched: "32 min"
    },
    {
      id: 2,
      title: "Wednesday",
      episode: "S1 E8",
      thumbnail: "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
      progress: 45,
      timeWatched: "18 min"
    },
    {
      id: 3,
      title: "The Crown",
      episode: "S6 E3",
      thumbnail: "https://image.tmdb.org/t/p/w500/38mxhJ99WM0zYvaXKdqyFTl6LZH.jpg",
      progress: 90,
      timeWatched: "41 min"
    },
    {
      id: 4,
      title: "Stranger Things",
      episode: "S4 E9",
      thumbnail: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
      progress: 60,
      timeWatched: "28 min"
    },
    {
      id: 5,
      title: "The Bear",
      episode: "S3 E2",
      thumbnail: "https://image.tmdb.org/t/p/w500/sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg",
      progress: 20,
      timeWatched: "12 min"
    },
    {
      id: 6,
      title: "Euphoria",
      episode: "S2 E5",
      thumbnail: "https://image.tmdb.org/t/p/w500/3Q0hd3heuWwDWpwcDkhQOA6TYWI.jpg",
      progress: 85,
      timeWatched: "35 min"
    }
  ];

  // Sample data for trending shows
  const trendingShows = [
    {
      id: 1,
      title: "The Last of Us",
      thumbnail: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
      platform: "HBO Max"
    },
    {
      id: 2,
      title: "You",
      thumbnail: "https://image.tmdb.org/t/p/w500/7bEYdg0zRjgE8o7M38gATFan2vr.jpg",
      platform: "Netflix"
    },
    {
      id: 3,
      title: "The Mandalorian",
      thumbnail: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
      platform: "Disney+"
    },
    {
      id: 4,
      title: "Ted Lasso",
      thumbnail: "https://image.tmdb.org/t/p/w500/5fhZdwP1DVJ0FyVH6vrFdHwpXIn.jpg",
      platform: "Apple TV+"
    },
    {
      id: 5,
      title: "Squid Game",
      thumbnail: "https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg",
      platform: "Netflix"
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in to test UI</h2>
          <a href="/login" className="text-teal-400 hover:text-teal-300">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopNav />
      
      <div className="pt-20 pb-32">
        <div className="container mx-auto px-4 space-y-8">
          
          {/* 1. Personalized Header with Greeting + Weekly Stats */}
          <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 p-6 rounded-2xl shadow-lg mb-6 text-white">
            <h1 className="text-2xl font-black">
              Good evening, {user?.firstName || 'User'} 👋
            </h1>
            <p className="text-sm text-cyan-100 mt-1">You've watched <span className="font-bold text-white">5 shows</span> this week</p>
            <div className="mt-3 flex space-x-4">
              <div className="bg-black bg-opacity-30 px-3 py-1 rounded-full text-sm">
                🎯 85% match accuracy
              </div>
              <div className="bg-black bg-opacity-30 px-3 py-1 rounded-full text-sm">
                📺 3 new episodes dropped
              </div>
            </div>
          </div>

          {/* 2. Redesigned "Continue Watching" Section */}
          <div className="mb-8">
            <h2 className="text-white text-xl font-bold mb-4">Continue Watching</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {continueWatching.map((item) => (
                <div key={item.id} className="relative bg-gray-900 rounded-lg overflow-hidden shadow-md">
                  <img src={item.thumbnail} alt={item.title} className="w-full h-40 object-cover" />
                  <div className="p-3">
                    <h3 className="text-white text-sm font-semibold">{item.title}</h3>
                    <p className="text-gray-400 text-xs">{item.episode}</p>
                    <div className="mt-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-400"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.timeWatched} watched</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Swipeable "Trending" Carousel */}
          <div className="mb-8">
            <h2 className="text-white text-xl font-bold mb-4">Trending Now</h2>
            <div className="overflow-hidden">
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {trendingShows.map((show) => (
                  <div key={show.id} className="min-w-[160px] sm:min-w-[200px] bg-gray-800 rounded-lg relative group flex-shrink-0">
                    <img src={show.thumbnail} alt={show.title} className="rounded-lg w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <button className="bg-teal-500 text-white px-3 py-1 rounded-md text-sm mr-2">Trailer</button>
                      <button className="bg-white text-black px-3 py-1 rounded-md text-sm">Watch</button>
                    </div>
                    <div className="p-2">
                      <h3 className="text-white text-sm font-medium truncate">{show.title}</h3>
                      <p className="text-xs text-gray-400">{show.platform}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}