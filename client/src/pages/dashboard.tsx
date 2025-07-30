import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Search,
  Plus,
  Star,
  Clock,
  TrendingUp,
  Users,
  Play,
  Heart,
  BookOpen,
  Settings,
  LogOut,
  Eye
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { AiRecommendations } from "../components/ai-recommendations";
import NavigationHeader from "@/components/navigation-header";
import StreamingLogos from "../components/streaming-logos";
import MonetizedTrailer from "../components/monetized-trailer";

export default function Dashboard() {
  console.log('🏠 DASHBOARD COMPONENT RENDERED - User is authenticated!');

  const { user, isLoading, isAuthenticated } = useAuth();

  console.log('📊 Dashboard auth state:', { isLoading, isAuthenticated, userEmail: user?.email });

  // Add streaming data to shows
  const addStreamingDataToShows = (shows: any[]) => {
    const fallbackProviders = [
      {
        provider_id: 8,
        provider_name: "Netflix",
        name: "Netflix",
        logo_path: "/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg"
      },
      {
        provider_id: 384,
        provider_name: "HBO Max",
        name: "HBO Max",
        logo_path: "/Ajqyt5aNxNGjmF9uOfxArGrdf3X.jpg"
      },
      {
        provider_id: 337,
        provider_name: "Disney Plus",
        name: "Disney Plus",
        logo_path: "/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg"
      },
      {
        provider_id: 9,
        provider_name: "Amazon Prime Video",
        name: "Amazon Prime Video",
        logo_path: "/emthp39XA2YScoYL1p0sdbAH2WA.jpg"
      }
    ];

    return shows.map(show => ({
      ...show,
      streaming: fallbackProviders.slice(0, Math.floor(Math.random() * 3) + 1)
    }));
  };

  // Fetch trending shows for Continue Watching section with streaming data
  const { data: trendingData } = useQuery({
    queryKey: ["/api/tmdb/trending"],
    queryFn: async () => {
      const response = await fetch("/api/tmdb/trending?mediaType=tv&timeWindow=week");
      if (!response.ok) throw new Error("Failed to fetch trending shows");
      const data = await response.json();
      // Add streaming data to each show
      if (data.results) {
        const showsWithStreaming = addStreamingDataToShows(data.results);
        return { ...data, results: showsWithStreaming };
      }
      return data;
    },
  });

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    queryFn: async () => {
      const response = await fetch("/api/user/stats", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch user stats");
      return response.json();
    },
    enabled: !!isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-teal-600 to-blue-600">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get real trending shows for Continue Watching section
  const continueWatchingShows = trendingData?.results?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation Header */}
      <NavigationHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-400">
            Ready to discover your next favorite show or movie?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Play className="h-8 w-8 text-teal-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Currently Watching</p>
                  <p className="text-2xl font-bold text-white">{userStats?.currentlyWatching || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Favorites</p>
                  <p className="text-2xl font-bold text-white">{userStats?.favorites || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">To Watch</p>
                  <p className="text-2xl font-bold text-white">{userStats?.toWatch || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Hours Watched</p>
                  <p className="text-2xl font-bold text-white">{userStats?.hoursWatched || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Continue Watching - Now with Real TMDB Data */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Trending Shows</h2>
            <Link href="/discover">
              <Button variant="outline" size="sm" className="border-slate-700 text-gray-300">
                <Plus className="h-4 w-4 mr-2" />
                Discover More
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {continueWatchingShows.map((show: any, index: number) => {
              const title = show.name || show.title;
              const year = show.first_air_date?.split('-')[0] || show.release_date?.split('-')[0];
              const posterUrl = show.poster_path
                ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                : "/placeholder-poster.jpg";

              return (
                <Card key={show.id} className="glass-effect border-slate-700/50 hover:border-teal-500/30 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    {/* Show Poster */}
                    <div className="relative mb-3">
                      <img
                        src={posterUrl}
                        alt={title}
                        className="w-full h-48 object-cover rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-poster.jpg";
                        }}
                      />
                      {/* Rating Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-black/70 text-yellow-400 border-yellow-400/20">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {show.vote_average?.toFixed(1) || 'N/A'}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="font-semibold text-white mb-1 line-clamp-2">{title}</h3>
                    <p className="text-sm text-gray-400 mb-2">{year} • TV Show</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{show.overview}</p>

                    {/* Streaming Logos */}
                    {show.streaming && (
                      <div className="mb-3">
                        <StreamingLogos providers={show.streaming} />
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-3">
                      <Badge className="bg-teal-500/20 text-teal-400 border-teal-400/20">
                        Trending #{index + 1}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-1 mt-3">
                      {/* Primary Action - Add to List */}
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full h-7 text-xs border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 px-2"
                        onClick={() => {
                          console.log(`Add to List clicked for ${title}`);
                          // Handle add to list action
                        }}
                      >
                        <Plus className="h-2.5 w-2.5 mr-1" />
                        Add to List
                      </Button>
                      
                      {/* Secondary Actions */}
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700 text-white px-2"
                          onClick={() => {
                            console.log(`Watch Now clicked for ${title}`);
                            // Handle watch now action
                          }}
                        >
                          <Play className="h-2.5 w-2.5 mr-1" />
                          Watch
                        </Button>
                        
                        <MonetizedTrailer 
                          show={show}
                          onTrailerViewed={() => {
                            console.log(`Trailer viewed for ${title}`);
                            // Track trailer views for analytics
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* AI Recommendations Section */}
        <div className="mb-8">
          <AiRecommendations horizontal={true} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-effect border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-teal-400" />
                Discover Shows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">Find your next favorite show</p>
              <Link href="/discover">
                <Button className="w-full mt-4 bg-gradient-to-r from-teal-600 to-blue-600">
                  Explore Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-400" />
                Social Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">See what your friends are watching</p>
              <Link href="/social">
                <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600">
                  View Friends
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2 text-gray-400" />
                Import History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">Get better recommendations</p>
              <Link href="/import-history">
                <Button variant="outline" className="w-full mt-4 border-slate-700 text-gray-300">
                  Import Data
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}