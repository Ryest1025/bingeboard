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
    <div className="min-h-screen bg-black text-white px-4 py-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-blue-800 rounded-2xl p-6 mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Good evening, {user?.firstName || "Rachel"} 👋
        </h1>
        <p className="text-gray-300 mb-4">You've watched 5 shows this week</p>
        <div className="flex space-x-4">
          <div className="bg-black bg-opacity-30 px-3 py-1 rounded-full text-sm text-white flex items-center">
            🎯 85% match accuracy
          </div>
          <div className="bg-black bg-opacity-30 px-3 py-1 rounded-full text-sm text-white flex items-center">
            📺 3 new episodes dropped
          </div>
        </div>
      </div>

      {/* Trending Now */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Trending Now</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {trendingShows.map((show) => (
            <div key={show.id} className="relative flex-shrink-0 group">
              <img
                src={show.thumbnail}
                alt={show.title}
                className="w-48 h-72 object-cover rounded-lg"
              />
              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                <div className="flex space-x-2">
                  <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Trailer
                  </button>
                  <button className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium">
                    Watch
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured show - The Witcher */}
      <section className="mb-8">
        <div className="flex items-start space-x-4">
          <img
            src="https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg"
            alt="The Witcher"
            className="w-24 h-36 object-cover rounded-lg flex-shrink-0"
          />
          <div>
            <h3 className="text-xl font-bold text-white mb-1">The Witcher</h3>
            <p className="text-gray-400 text-sm mb-2">Netflix</p>
          </div>
        </div>
      </section>

      {/* Continue Watching */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {continueWatching.map((show) => (
            <div key={show.id} className="flex items-center space-x-4 bg-gray-900 rounded-lg p-4">
              <img
                src={show.thumbnail}
                alt={show.title}
                className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">{show.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{show.episode}</p>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-teal-500 h-2 rounded-full" 
                    style={{ width: `${show.progress}%` }}
                  ></div>
                </div>
                <p className="text-gray-500 text-xs">{show.timeWatched}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}