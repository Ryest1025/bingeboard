import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserActions } from "@/hooks/useUserActions";
import { useAuth } from "@/hooks/useAuth";
import UniversalShowCard from "@/components/global/UniversalShowCard";
import BrandedShowModal from "@/components/search/BrandedShowModal";
import AppLayout from "@/components/layouts/AppLayout";
import { Play, Star, TrendingUp, Clock, Users } from "lucide-react";

// Mock data for demonstration
const mockShows = [
  {
    id: "1",
    title: "Stranger Things",
    year: 2016,
    posterUrl: "https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg",
    mediaType: "tv",
    rating: 8.7,
    genres: ["Drama", "Fantasy", "Horror"],
    streamingPlatform: "Netflix"
  },
  {
    id: "2", 
    title: "The Mandalorian",
    year: 2019,
    posterUrl: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXQ4EF.jpg",
    mediaType: "tv",
    rating: 8.8,
    genres: ["Action", "Adventure", "Sci-Fi"],
    streamingPlatform: "Disney+"
  },
  {
    id: "3",
    title: "Breaking Bad", 
    year: 2008,
    posterUrl: "https://image.tmdb.org/t/p/w500/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg",
    mediaType: "tv", 
    rating: 9.5,
    genres: ["Crime", "Drama", "Thriller"],
    streamingPlatform: "Netflix"
  },
  {
    id: "4",
    title: "Dune",
    year: 2021,
    posterUrl: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    mediaType: "movie",
    rating: 8.0,
    genres: ["Adventure", "Drama", "Sci-Fi"],
    streamingPlatform: "HBO Max"
  },
  {
    id: "5",
    title: "The Batman",
    year: 2022,
    posterUrl: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    mediaType: "movie",
    rating: 7.8,
    genres: ["Action", "Crime", "Drama"],
    streamingPlatform: "HBO Max"
  },
  {
    id: "6",
    title: "House of the Dragon",
    year: 2022,
    posterUrl: "https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg",
    mediaType: "tv",
    rating: 8.5,
    genres: ["Action", "Adventure", "Drama"],
    streamingPlatform: "HBO Max"
  }
];

export default function UserActionsDemoPage() {
  const { isAuthenticated, user } = useAuth();
  const { userLists, reminders, loading } = useUserActions();
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null);

  // Filter shows by category for different sections
  const trendingShows = mockShows.slice(0, 3);
  const newReleases = mockShows.slice(3, 6);
  const userListShows = mockShows.filter(show => userLists.includes(show.id));
  const reminderShows = mockShows.filter(show => reminders.includes(show.id));

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-sm border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  🎬 BingeBoard User Actions Demo
                </h1>
                <p className="text-slate-300">
                  Complete plug-and-play system with instant updates, hover actions, and universal buttons
                </p>
              </div>
            
            {/* User Status */}
            <div className="text-right">
              {isAuthenticated ? (
                <div className="text-green-400">
                  <p className="font-semibold">✅ Logged in as {user?.displayName || user?.email}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>📺 {userLists.length} in watchlist</span>
                    <span>🔔 {reminders.length} reminders</span>
                  </div>
                </div>
              ) : (
                <div className="text-amber-400">
                  <p>🔐 Not logged in</p>
                  <p className="text-sm">Actions will prompt for login</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Instant Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>Hover over cards for quick add/remove actions. UI updates instantly with optimistic updates.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-400" />
                Universal Buttons
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>Consistent styling and behavior across all modals and components. Fully accessible.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Smart Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>Authentication-aware, with fallbacks and error handling. Works with existing API endpoints.</p>
            </CardContent>
          </Card>
        </div>

        {/* Trending Shows */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-teal-400" />
            <h2 className="text-2xl font-bold text-white">Trending Now</h2>
            <Badge variant="secondary" className="bg-teal-600/20 text-teal-300">
              Hover for quick actions
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trendingShows.map((show) => (
              <UniversalShowCard
                key={show.id}
                show={show}
                showQuickActions={true}
                className="transform transition-all duration-300 hover:scale-105"
              />
            ))}
          </div>
        </section>

        {/* New Releases */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">New Releases</h2>
            <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
              Click for full modal
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {newReleases.map((show) => (
              <UniversalShowCard
                key={show.id}
                show={show}
                showQuickActions={true}
                className="transform transition-all duration-300 hover:scale-105"
              />
            ))}
          </div>
        </section>

        {/* User Collections */}
        {isAuthenticated && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Watchlist */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Play className="w-5 h-5 text-green-400" />
                  Your Watchlist ({userLists.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userListShows.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {userListShows.map((show) => (
                      <UniversalShowCard
                        key={show.id}
                        show={show}
                        showQuickActions={true}
                        className="transform transition-all duration-200 hover:scale-105"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">
                    No shows in your watchlist yet. Add some from the sections above!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Reminders */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  Your Reminders ({reminders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reminderShows.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {reminderShows.map((show) => (
                      <UniversalShowCard
                        key={show.id}
                        show={show}
                        showQuickActions={true}
                        className="transform transition-all duration-200 hover:scale-105"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">
                    No reminders set. Click the bell icon on any show to get notified!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">🎮 How to Test the Features</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Quick Actions (Hover)</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Hover over any show card</li>
                  <li>• Click "Add" to add to watchlist instantly</li>
                  <li>• Click bell icon to set/remove reminders</li>
                  <li>• UI updates immediately (optimistic)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Full Modal (Click)</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Click anywhere on a card</li>
                  <li>• Access full details and actions</li>
                  <li>• Watch trailers, get streaming links</li>
                  <li>• Enhanced watchlist/reminder controls</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Modal */}
      {selectedShowId && (
        <BrandedShowModal
          showId={selectedShowId}
          showType="movie"
          open={!!selectedShowId}
          onClose={() => setSelectedShowId(null)}
          onAddToWatchlist={() => {
            console.log("Added to watchlist via modal");
          }}
        />
      )}
      </div>
    </AppLayout>
  );
}
