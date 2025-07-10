import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

// UI Test - Dark theme matching the provided image
export default function UITestPage() {
  const { user, isAuthenticated } = useAuth();

  // Trending shows data
  const trendingShows = [
    { 
      id: 1, 
      title: "The Witcher",
      platform: "Netflix",
      thumbnail: "https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg"
    },
    { 
      id: 2, 
      title: "Stranger Things", 
      thumbnail: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg"
    },
    { 
      id: 3, 
      title: "Avengers", 
      thumbnail: "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg"
    },
    { 
      id: 4, 
      title: "Breaking Bad", 
      thumbnail: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg"
    },
    { 
      id: 5, 
      title: "Peaky Blinders", 
      thumbnail: "https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg"
    }
  ];

  // Continue watching data
  const continueWatching = [
    {
      id: 1,
      title: "Stranger Things",
      episode: "Chapter Three",
      thumbnail: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
      timeWatched: "5 h watched",
      progress: 65
    },
    {
      id: 2,
      title: "Breaking Bad", 
      episode: "S2, E5",
      thumbnail: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      timeWatched: "11 in 10 min",
      progress: 80
    },
    {
      id: 3,
      title: "Bridgerton",
      episode: "S1, E8", 
      thumbnail: "https://image.tmdb.org/t/p/w500/luoKpgVwi1E5nQsi7W0UuKHu2Rq.jpg",
      timeWatched: "2 h watched",
      progress: 45
    },
    {
      id: 4,
      title: "Severance",
      episode: "S1, E2",
      thumbnail: "https://image.tmdb.org/t/p/w500/lFf6LLrTUPjJBKid5l1LGWaplLo.jpg", 
      timeWatched: "45 min left",
      progress: 30
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black text-white">
      {/* Ultra-sleek header with glass effect */}
      <div className="relative overflow-hidden rounded-3xl mx-4 mt-6 mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-3xl"></div>
        <div className="relative p-8 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-light tracking-wide text-white mb-2">
                Good evening, <span className="font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{user?.firstName || "Rachel"}</span>
              </h1>
              <p className="text-gray-400 text-lg font-light">You've watched 5 shows this week</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-2xl">
              👋
            </div>
          </div>
          
          <div className="flex space-x-6">
            <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/10">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-white font-medium">85% match accuracy</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/10">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className="text-white font-medium">3 new episodes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sleek trending section */}
      <div className="px-4 mb-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-light tracking-wide text-white">Trending Now</h2>
          <button className="text-cyan-400 hover:text-cyan-300 font-medium text-sm">View All</button>
        </div>
        
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {trendingShows.map((show) => (
            <div key={show.id} className="relative flex-shrink-0 group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={show.thumbnail}
                  alt={show.title}
                  className="w-56 h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-6 left-6 right-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                  <h3 className="text-white font-semibold text-lg mb-3">{show.title}</h3>
                  <div className="flex space-x-3">
                    <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors border border-white/20">
                      Trailer
                    </button>
                    <button className="bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-cyan-600 transition-colors">
                      Watch
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ultra-sleek continue watching */}
      <div className="px-4 mb-10">
        <h2 className="text-3xl font-light tracking-wide text-white mb-8">Continue Watching</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {continueWatching.map((show) => (
            <div key={show.id} className="group">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-cyan-400/30 transition-all duration-300 hover:bg-white/10">
                <div className="flex items-center space-x-6">
                  <div className="relative overflow-hidden rounded-xl flex-shrink-0">
                    <img
                      src={show.thumbnail}
                      alt={show.title}
                      className="w-20 h-28 object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg mb-1 truncate">{show.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{show.episode}</p>
                    
                    <div className="relative mb-3">
                      <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500" 
                          style={{ width: `${show.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">{show.timeWatched}</span>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-500 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-cyan-600">
                        Resume
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}