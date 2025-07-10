import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Search, Play, Calendar, Bell, Plus, TrendingUp, Star, Clock } from "lucide-react";

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
    <div className="min-h-screen" style={{ background: '#111827' }}>
      {/* Top Navigation Bar */}
      <div className="max-w-6xl mx-auto p-4 pb-0">
        <div 
          className="rounded-2xl p-4 mb-6"
          style={{ 
            background: '#18181b',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)'
          }}
        >
          <div className="flex items-center justify-between">
            {/* BingeBoard Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-7 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-lg border border-slate-600 relative">
                  <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
                    <div className="text-xs font-bold text-white">B</div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-slate-700 rounded-sm"></div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-slate-600 rounded-sm"></div>
                </div>
              </div>
              <div>
                <span className="text-lg font-black" style={{ color: '#0e7490' }}>
                  Binge
                </span>
                <span className="text-lg font-light text-white ml-1">Board</span>
              </div>
            </div>
            
            {/* Navigation Items */}
            <div className="flex items-center space-x-6">
              <button className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <Search className="h-4 w-4" style={{ color: '#0e7490' }} />
                <span className="text-sm font-medium" style={{ color: '#f3f4f6' }}>Search</span>
              </button>
              <button className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <Bell className="h-4 w-4" style={{ color: '#0e7490' }} />
                <span className="text-sm font-medium" style={{ color: '#f3f4f6' }}>Notifications</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {user?.firstName?.charAt(0) || "R"}
                  </span>
                </div>
                <span className="text-sm font-medium" style={{ color: '#f3f4f6' }}>
                  {user?.firstName || "Rachel"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main container with your exact design specs */}
      <div className="max-w-6xl mx-auto px-6 pb-6">
        {/* Header section */}
        <div 
          className="rounded-3xl p-8 mb-8 shadow-2xl"
          style={{ 
            background: '#18181b',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)'
          }}
        >
          <div className="text-center mb-6">
            <h1 
              className="text-4xl font-bold mb-3"
              style={{ color: '#0e7490' }}
            >
              Good evening, {user?.firstName || "Rachel"}
            </h1>
            <p 
              className="text-lg"
              style={{ color: '#a1a1aa' }}
            >
              You've watched 5 shows this week
            </p>
          </div>
          
          {/* Stats badges */}
          <div className="flex justify-center space-x-6">
            <div 
              className="px-6 py-3 rounded-lg border flex items-center space-x-2"
              style={{ 
                background: '#0e7490',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(14,116,144,0.12)'
              }}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="font-medium">85% match accuracy</span>
            </div>
            <div 
              className="px-6 py-3 rounded-lg border flex items-center space-x-2"
              style={{ 
                background: '#0e7490',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(14,116,144,0.12)'
              }}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="font-medium">3 new episodes</span>
            </div>
          </div>
        </div>

        {/* Trending section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 
              className="text-3xl font-bold"
              style={{ color: '#0e7490' }}
            >
              Trending Now
            </h2>
            <button 
              className="font-medium hover:opacity-80 transition-opacity"
              style={{ color: '#0e7490' }}
            >
              View All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {trendingShows.map((show) => (
              <div 
                key={show.id} 
                className="rounded-2xl p-4 hover:scale-105 transition-transform duration-300 cursor-pointer"
                style={{ 
                  background: '#18181b',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.18)'
                }}
              >
                <img
                  src={show.thumbnail}
                  alt={show.title}
                  className="w-full h-64 object-cover rounded-xl mb-4"
                />
                <h3 
                  className="font-semibold text-lg mb-2"
                  style={{ color: '#f3f4f6' }}
                >
                  {show.title}
                </h3>
                <div className="flex space-x-2">
                  <button 
                    className="px-3 py-1 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                    style={{ 
                      background: '#0e7490',
                      color: '#fff'
                    }}
                  >
                    Trailer
                  </button>
                  <button 
                    className="px-3 py-1 rounded-lg text-sm font-medium border hover:opacity-80 transition-opacity"
                    style={{ 
                      color: '#0e7490',
                      borderColor: '#0e7490'
                    }}
                  >
                    Watch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue watching section */}
        <div>
          <h2 
            className="text-3xl font-bold mb-6"
            style={{ color: '#0e7490' }}
          >
            Continue Watching
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {continueWatching.map((show) => (
              <div 
                key={show.id}
                className="rounded-2xl p-6 hover:scale-102 transition-transform duration-300"
                style={{ 
                  background: '#18181b',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.18)'
                }}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={show.thumbnail}
                    alt={show.title}
                    className="w-16 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 
                      className="font-semibold text-lg mb-1"
                      style={{ color: '#f3f4f6' }}
                    >
                      {show.title}
                    </h3>
                    <p 
                      className="text-sm mb-2"
                      style={{ color: '#a1a1aa' }}
                    >
                      {show.episode}
                    </p>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-700 rounded-full h-1 mb-2">
                      <div 
                        className="h-1 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${show.progress}%`,
                          background: '#0e7490'
                        }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-xs"
                        style={{ color: '#a1a1aa' }}
                      >
                        {show.timeWatched}
                      </span>
                      <button 
                        className="px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity"
                        style={{ 
                          background: '#0e7490',
                          color: '#fff'
                        }}
                      >
                        Resume
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}