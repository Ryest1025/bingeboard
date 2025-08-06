import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useContinueWatching, useCurrentProgress } from "@/hooks/useViewingHistory";
import NavigationHeader from "@/components/navigation-header";
import Toast from "@/components/toast";
import RecommendationModal from "@/components/recommendation-modal";
import { Button } from "@/components/ui/button";
import { Play, Star, Clock, Users, Plus, TrendingUp, Sparkles, BarChart3, Eye, Brain, Flame, Heart, Filter, List } from "lucide-react";
import { getShowTitle, getShowPosterUrl, getShowBackdropUrl, getStreamingPlatforms, getStreamingLogo, formatRating, trackEvent, getShowRating, getShowOverview, getShowId } from "@/utils/show-utils";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedRecommendationGenre, setSelectedRecommendationGenre] = useState("all"); // Separate genre filter for Just For You section
  const [recommendationMode, setRecommendationMode] = useState("ai"); // "ai" or "trending"
  const [selectedShow, setSelectedShow] = useState<any>(null);

  // Toast state
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info'
  });

  // Fetch user preferences to get onboarding genre data
  const { data: userPreferencesData } = useQuery({
    queryKey: ["/api/user/preferences"],
    queryFn: async () => {
      const res = await fetch("/api/user/preferences", { credentials: 'include' });
      if (!res.ok) {
        console.error("❌ User preferences fetch failed:", res.status, res.statusText);
        // Fallback: try to get preferences directly from user data
        const userRes = await fetch("/api/auth/user", { credentials: 'include' });
        if (userRes.ok) {
          const userData = await userRes.json();
          console.log("🔄 Fallback: Using user data for preferences:", userData);
          // Mock the preferences structure from user data if available
          return {
            preferredGenres: userData.preferences?.preferredGenres || [],
            preferredNetworks: userData.preferences?.preferredNetworks || []
          };
        }
        return null;
      }
      const data = await res.json();
      console.log("🔍 Raw user preferences API response:", data);
      return data.preferences;
    },
    enabled: !!isAuthenticated,
    staleTime: 600000 // Cache for 10 minutes
  });

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

  // Create personalized genres array based on user onboarding preferences
  const genres = React.useMemo(() => {
    const allGenres = genresData?.genres || [];
    
    console.log("🎭 All available TMDB genres:", allGenres.map(g => `${g.name} (${g.id})`));
    
    // Enhanced genre mapping to cover all possible onboarding selections including Sports
    const extendedGenres = [
      ...allGenres,
      // Add Sports as a custom genre that maps to relevant TMDB genres
      { id: 99999, name: "Sports" }, // Custom ID for Sports
    ];
    
    // Robust fallback for user preferences
    const knownUserPreferences = ["Drama", "Comedy", "Thriller", "Romance"];
    const rawUserPreferences = userPreferencesData?.preferredGenres;
    
    console.log("🧪 Raw userPreferencesData.preferredGenres:", rawUserPreferences);
    console.log("🎭 User preferences data:", userPreferencesData);
    
    // Only use fallback if no real user data exists
    const userPreferredGenres = 
      rawUserPreferences && rawUserPreferences.length > 0 
        ? rawUserPreferences 
        : knownUserPreferences;
    
    console.log("🎯 Selected preferred genres:", userPreferredGenres);
    console.log("🔍 Type of userPreferredGenres:", typeof userPreferredGenres);
    console.log("📊 Is userPreferredGenres an array?:", Array.isArray(userPreferredGenres));
    
    // Normalize the preferred genres data format
    let processedGenres = userPreferredGenres;
    
    if (typeof processedGenres === 'string') {
      try {
        // Try parsing as JSON first
        processedGenres = JSON.parse(processedGenres);
        console.log("📝 Parsed genres from JSON string:", processedGenres);
      } catch {
        // Fall back to comma-separated string
        processedGenres = processedGenres.split(',').map((g: string) => g.trim());
        console.log("📝 Parsed genres from comma-separated string:", processedGenres);
      }
    }
    
    // Handle array of objects format: [{ name: "Drama" }, { name: "Comedy" }]
    if (Array.isArray(processedGenres) && processedGenres.length > 0 && typeof processedGenres[0] === 'object' && processedGenres[0].name) {
      processedGenres = processedGenres.map((g: any) => g.name);
      console.log("📝 Extracted names from object array:", processedGenres);
    }
    
    console.log("✅ Final processed genres:", processedGenres);
    
    // If user has onboarding preferences, prioritize those genres
    if (processedGenres && processedGenres.length > 0) {
      // Case-insensitive mapping for better matching
      const genreNameToId: { [key: string]: number } = {};
      const genreIdToName: { [key: number]: string } = {};
      
      extendedGenres.forEach((genre: any) => {
        const normalizedName = genre.name.toLowerCase().trim();
        genreNameToId[normalizedName] = genre.id;
        genreIdToName[genre.id] = genre.name;
        
        // Add common aliases for better matching
        if (genre.name === "Science Fiction") {
          genreNameToId["sci-fi"] = genre.id;
          genreNameToId["science fiction"] = genre.id;
        }
        if (genre.name === "Action & Adventure") {
          genreNameToId["action"] = genre.id;
          genreNameToId["adventure"] = genre.id;
        }
      });
      
      console.log("🗺️ Genre name to ID mapping:", genreNameToId);
      
      // Get user's preferred genres that exist in TMDB
      const preferredGenreObjects = processedGenres
        .map((genreName: string) => {
          const normalizedName = genreName.toLowerCase().trim();
          const id = genreNameToId[normalizedName];
          if (id) {
            const displayName = genreIdToName[id] || genreName;
            console.log(`✅ Found genre: ${genreName} -> ${displayName} (ID ${id})`);
            return { id: String(id), name: displayName }; // Always use string IDs
          } else {
            console.log(`❌ Genre not found in TMDB: ${genreName}`);
            return null;
          }
        })
        .filter(Boolean);
      
      // Only show user's onboarding preferences - no additional genres
      const finalGenres = [
        { id: "all", name: "All" },
        ...preferredGenreObjects
      ];
      
      console.log("✨ Final personalized genres:", finalGenres.map(g => `${g.name} (${g.id})`));
      
      return finalGenres;
    }
    
    // Fallback to default TMDB genres if no preferences
    console.log("📺 Using default TMDB genres (no user preferences)");
    return [
      { id: "all", name: "All" },
      ...allGenres.slice(0, 8).map((genre: any) => ({ id: String(genre.id), name: genre.name })) // Always use string IDs
    ];
  }, [genresData, userPreferencesData]);

  // Additional state and hooks

  // Extracted navigation handlers
  const goToSocial = () => window.location.href = '/social';
  const goToLists = () => window.location.href = '/lists';
  const goToSpecificList = (listId: number) => window.location.href = `/lists/${listId}`;

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Button handlers with analytics tracking

  const handleAddToList = async (show: any) => {
    const title = getShowTitle(show);
    const showId = getShowId(show);
    const posterPath = getShowPosterUrl(show);
    
    try {
      trackEvent('Add to List Clicked', { showId: showId, showTitle: title });
      
      // Use the first list (assuming a default "Want to Watch" list with ID 1)
      const response = await fetch('/api/user/lists/1/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          itemId: showId,
          itemType: show.media_type || 'tv',
          title: title,
          posterPath: posterPath
        })
      });
      
      if (response.ok) {
        showToast(`Added "${title}" to your list!`, 'success');
        trackEvent('Add to List Success', { showId: showId, showTitle: title });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Add to list failed:', errorData);
        showToast('Failed to add to list', 'error');
        trackEvent('Add to List Failed', { showId: showId, error: 'API Error' });
      }
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
      showToast('Failed to add to watchlist', 'error');
      trackEvent('Add to List Failed', { showId: showId, error: 'Network Error' });
    }
  };

  const handleWatchNow = async (show: any) => {
    const title = getShowTitle(show);
    const showId = getShowId(show);
    const streamingPlatforms = getStreamingPlatforms(show);
    
    try {
      trackEvent('Watch Now Clicked', { showId: showId, showTitle: title });
      
      // If streaming platforms are available, use the first one
      if (streamingPlatforms && streamingPlatforms.length > 0) {
        const platform = streamingPlatforms[0];
        if (platform.link) {
          // Direct to streaming service with affiliate link support
          trackEvent('Streaming Platform Redirect', { 
            showId: showId, 
            platform: platform.provider_name,
            affiliateLink: platform.link
          });
          window.open(platform.link, '_blank');
          return;
        }
      }
      
      // Fallback: Get streaming data and try again
      const response = await fetch(`/api/streaming/comprehensive/tv/${showId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const streamingData = await response.json();
        if (streamingData.results && streamingData.results.length > 0) {
          const firstPlatform = streamingData.results[0];
          if (firstPlatform.link) {
            trackEvent('Streaming Platform Redirect (Fetched)', { 
              showId: showId, 
              platform: firstPlatform.provider_name,
              affiliateLink: firstPlatform.link
            });
            window.open(firstPlatform.link, '_blank');
            return;
          }
        }
      }
      
      // Final fallback: Google search
      trackEvent('Watch Now Fallback', { showId: showId, showTitle: title });
      showToast('Opening search for streaming options...', 'info');
      window.open(`https://www.google.com/search?q=watch+${encodeURIComponent(title)}+online+streaming`, '_blank');
      
    } catch (error) {
      console.error('Watch Now error:', error);
      trackEvent('Watch Now Error', { showId: showId, error: error });
      // Fallback to Google search
      window.open(`https://www.google.com/search?q=watch+${encodeURIComponent(title)}+online+streaming`, '_blank');
    }
  };

  const handleWatchTrailer = async (show: any) => {
    const title = getShowTitle(show);
    const showId = getShowId(show);
    
    try {
      trackEvent('Watch Trailer Clicked', { showId: showId, showTitle: title });
      
      const response = await fetch(`/api/tmdb/tv/${showId}/videos`);
      const data = await response.json();
      const trailer = data.results?.find((video: any) => 
        video.type === 'Trailer' && video.site === 'YouTube'
      );
      
      if (trailer) {
        trackEvent('Trailer Found', { showId: showId, trailerKey: trailer.key });
        window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
      } else {
        showToast('No trailer available for this show', 'info');
        trackEvent('Trailer Not Found', { showId: showId });
      }
    } catch (error) {
      console.error('Failed to fetch trailer:', error);
      showToast('Failed to load trailer', 'error');
      trackEvent('Trailer Fetch Failed', { showId: showId });
    }
  };

  // Fetch trending/spotlight data filtered by genre WITHOUT streaming data for faster loading
  const { data: spotlightData, isLoading: spotlightLoading, error: spotlightError } = useQuery({
    queryKey: ["/api/tmdb/trending", selectedGenre],
    queryFn: async () => {
      console.log("🎬 Fetching spotlight for genre:", selectedGenre, typeof selectedGenre);
      
      let url;
      if (selectedGenre === "all") {
        // Use trending WITHOUT streaming data for faster loading
        url = `/api/trending/tv/day`;
      } else {
        // Use discover API for specific genres WITHOUT streaming data
        url = `/api/tmdb/discover/tv?with_genres=${selectedGenre}&sort_by=popularity.desc`;
      }
      
      console.log("🔗 Spotlight URL (fast mode):", url);
      
      const res = await fetch(url);
      if (!res.ok) {
        console.error("❌ Spotlight fetch failed:", res.status, res.statusText);
        throw new Error(`Failed to fetch trending: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("📊 Spotlight API response:", data);
      console.log("✅ Spotlight data received (fast mode):", data.results?.length || 0, "items");
      return data;
    },
    enabled: !!isAuthenticated,
    staleTime: 300000, // Cache for 5 minutes to improve performance
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });

    // Fetch AI recommendations filtered by genre
  const { data: aiRecommendations, isLoading: aiLoading, error: aiError } = useQuery({
    queryKey: ["/api/recommendations/ai", selectedRecommendationGenre],
    queryFn: async () => {
      console.log("🤖 Fetching AI recommendations for genre:", selectedRecommendationGenre);
      
      // Fallback to discover API with genre filtering if AI recommendations fail
      try {
        const aiRes = await fetch("/api/ai-recommendations", { credentials: 'include' });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          console.log("✅ AI recommendations:", aiData.recommendations?.length || 0, "items");
          
          // Filter AI recommendations by genre if a specific genre is selected
          if (selectedRecommendationGenre !== "all" && aiData.recommendations) {
            const filteredRecs = aiData.recommendations.filter((rec: any) => {
              const showGenres = rec.tmdbData?.genre_ids || rec.tmdbData?.genres?.map((g: any) => g.id) || [];
              return showGenres.includes(parseInt(selectedRecommendationGenre));
            });
            console.log(`🎭 Filtered AI recommendations from ${aiData.recommendations.length} to ${filteredRecs.length} for genre ${selectedRecommendationGenre}`);
            return { recommendations: filteredRecs };
          }
          
          return aiData;
        }
      } catch (error) {
        console.warn("⚠️ AI recommendations failed, falling back to discover API");
      }

      // Fallback to TMDB discover
      console.log("🔄 Using TMDB discover as fallback for AI recommendations");
      let fallbackUrl;
      if (selectedRecommendationGenre === "all") {
        fallbackUrl = '/api/tmdb/discover/tv?sort_by=vote_average.desc&vote_count.gte=100';
      } else {
        fallbackUrl = `/api/tmdb/discover/tv?with_genres=${selectedRecommendationGenre}&sort_by=vote_average.desc&vote_count.gte=50`;
      }
      
      const fallbackRes = await fetch(fallbackUrl);
      if (!fallbackRes.ok) throw new Error("Fallback recommendations failed");
      
      const fallbackData = await fallbackRes.json();
      return {
        recommendations: fallbackData.results?.slice(0, 8).map((show: any) => ({
          showId: show.id,
          title: show.name || show.title,
          overview: show.overview,
          poster_path: show.poster_path,
          vote_average: show.vote_average,
          tmdbData: show
        })) || []
      };
    },
    enabled: !!isAuthenticated,
    staleTime: 600000, // Cache for 10 minutes - longer cache for AI recommendations
    refetchOnWindowFocus: false,
  });

  // Real continue watching data using the new hook
  const { data: continueWatchingData, isLoading: continueWatchingLoading } = useContinueWatching();

  // Real progress data using the new hook  
  const { data: progressData, isLoading: progressLoading } = useCurrentProgress();

  // Fetch user stats with fallback
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user/stats", { credentials: "include" });
        if (!res.ok) {
          // Return fallback data if endpoint fails
          console.warn('User stats endpoint failed, using fallback data');
          return {
            totalWatched: 12,
            totalHours: 48,
            avgRating: 4.2,
            completedShows: 3,
            moviesWatched: 8,
            favoriteGenre: 'Drama'
          };
        }
        return res.json();
      } catch (error) {
        console.warn('User stats request failed, using fallback data:', error);
        return {
          totalWatched: 12,
          totalHours: 48,
          avgRating: 4.2,
          completedShows: 3,
          moviesWatched: 8,
          favoriteGenre: 'Drama'
        };
      }
    },
    enabled: !!isAuthenticated,
  });

  // Fetch sports highlights
  const { data: sportsHighlights, isLoading: loadingSports } = useQuery({
    queryKey: ["/api/sports/highlights"],
    queryFn: async () => {
      const res = await fetch("/api/sports/highlights", { credentials: "include" });
      if (!res.ok) {
        console.warn('Sports highlights endpoint failed');
        return [];
      }
      return res.json();
    },
    enabled: !!isAuthenticated,
    staleTime: 300000, // Cache for 5 minutes
  });

  // Fetch user lists with fallback
  const { data: userLists } = useQuery({
    queryKey: ["/api/user/lists"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user/lists", { credentials: "include" });
        if (!res.ok) {
          console.warn('User lists endpoint failed, using fallback data');
          return {
            lists: [
              { id: 1, name: "My Favorites", itemCount: 5 },
              { id: 2, name: "Watch Later", itemCount: 12 }
            ]
          };
        }
        return res.json();
      } catch (error) {
        console.warn('User lists request failed, using fallback data:', error);
        return {
          lists: [
            { id: 1, name: "My Favorites", itemCount: 5 },
            { id: 2, name: "Watch Later", itemCount: 12 }
          ]
        };
      }
    },
    enabled: !!isAuthenticated,
  });

  // Fetch friend activity with fallback
  const { data: friendActivity } = useQuery({
    queryKey: ["/api/social/activity"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/social/activity", { credentials: "include" });
        if (!res.ok) {
          console.warn('Friend activity endpoint failed, using fallback data');
          return {
            recent: [
              { id: 1, friendName: "Alex", action: "started watching", showTitle: "Squid Game", timestamp: "2 hours ago" },
              { id: 2, friendName: "Sarah", action: "completed", showTitle: "Stranger Things", timestamp: "1 day ago" }
            ]
          };
        }
        return res.json();
      } catch (error) {
        console.warn('Friend activity request failed, using fallback data:', error);
        return {
          recent: [
            { id: 1, friendName: "Alex", action: "started watching", showTitle: "Squid Game", timestamp: "2 hours ago" },
            { id: 2, friendName: "Sarah", action: "completed", showTitle: "Stranger Things", timestamp: "1 day ago" }
          ]
        };
      }
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

  const featuredShow = spotlightData?.results?.[0] ?? null;
  const currentRecommendations = recommendationMode === "ai" 
    ? (aiRecommendations?.recommendations || aiRecommendations?.results || aiRecommendations) 
    : (() => {
        // Filter trending data by the recommendation genre filter
        const trendingData = spotlightData?.results;
        if (selectedRecommendationGenre === "all" || !trendingData) {
          return trendingData;
        }
        
        // Filter trending results by the selected recommendation genre
        const filteredTrending = trendingData.filter((show: any) => {
          const showGenres = show.genre_ids || [];
          return showGenres.includes(parseInt(selectedRecommendationGenre));
        });
        
        console.log(`🎭 Filtered trending from ${trendingData.length} to ${filteredTrending.length} for genre ${selectedRecommendationGenre}`);
        return filteredTrending;
      })();

  // Simplify expressions with intermediate variables
  const featuredShowStreaming = getStreamingPlatforms(featuredShow);
  const featuredShowTitle = getShowTitle(featuredShow);
  const featuredShowBackdrop = getShowBackdropUrl(featuredShow);
  
  // Enable streaming data display
  const streamingToDisplay = featuredShowStreaming || [];

  // Show Preferences Panel - REMOVED since we use onboarding data

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      <NavigationHeader />
      
      <Toast 
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 pt-4 md:pt-20 pb-24 md:pb-4 overflow-x-hidden">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 w-full">
          {/* Main Content Area (3/4) */}
          <div className="lg:col-span-3 w-full min-w-0">
            {/* Compact Welcome + Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Welcome back, {user?.firstName || user?.displayName || 'there'}!</h1>
                <p className="text-gray-400 text-sm">Ready to discover your next binge?</p>
              </div>
              
              {/* Compact Stats Pills */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-gray-800 px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                  <span className="text-gray-300">{userStats?.totalWatched || 0}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800 px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-teal-400" />
                  <span className="text-gray-300">{userStats?.totalHours || 0}h</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800 px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                  <span className="text-gray-300">{userStats?.avgRating || 0}</span>
                </div>
              </div>
            </div>

            {/* Spotlight Section with Genre Filter */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-yellow-400" />
                  Spotlight
                </h2>
                {/* Spotlight Genre Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Genre:</span>
                  {genresLoading ? (
                    <div className="flex gap-2">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-8 w-16 bg-gray-800 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : (
                    genres.map((genre) => (
                      <Button
                        key={genre.id}
                        onClick={() => setSelectedGenre(String(genre.id))}
                        variant={String(selectedGenre) === String(genre.id) ? "default" : "ghost"}
                        size="sm"
                        className={String(selectedGenre) === String(genre.id) 
                          ? "bg-gray-700 text-white hover:bg-gray-600" 
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                        }
                      >
                        {genre.name}
                      </Button>
                    ))
                  )}
                </div>
              </div>

              {/* Hero Spotlight */}
              {spotlightLoading ? (
                <div className="relative h-64 bg-gray-800 animate-pulse rounded-lg">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                  <div className="absolute bottom-6 left-6">
                    <div className="h-8 w-48 bg-gray-700 rounded mb-3"></div>
                    <div className="h-4 w-96 bg-gray-700 rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-8 w-24 bg-gray-700 rounded"></div>
                      <div className="h-8 w-24 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              ) : featuredShow ? (
                <div 
                  className="relative h-64 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${featuredShowBackdrop})`,
                  }}
                >
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black/60" />
                  
                  {/* Content */}
                  <div className="relative h-full flex items-center">
                    <div className="max-w-2xl px-4 md:px-8">
                      <div className="inline-flex items-center gap-2 bg-yellow-600/20 backdrop-blur-sm text-yellow-300 px-3 py-1 text-sm mb-3">
                        <TrendingUp className="h-4 w-4" />
                        #{selectedGenre === "all" ? "1 Overall" : `1 in ${genres.find(g => g.id.toString() === selectedGenre)?.name}`}
                      </div>
                      <h2 className="text-2xl md:text-4xl font-bold mb-4">{featuredShowTitle}</h2>
                      <p className="text-gray-200 mb-4 line-clamp-3">{featuredShow.overview}</p>
                      
                      {/* Temporarily disabled streaming platforms for faster loading */}
                      <div className="mb-4">
                        <p className="text-sm text-blue-400 italic">
                          🚀 Fast loading mode - search for "{featuredShowTitle}" on your favorite platform
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Button 
                          size="sm" 
                          className="bg-white text-black hover:bg-gray-200"
                          onClick={() => handleWatchNow(featuredShow)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Watch Now
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="bg-red-600/80 text-white hover:bg-red-700/80"
                          onClick={() => handleWatchTrailer(featuredShow)}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Trailer
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="bg-gray-800/80 text-white hover:bg-gray-700/80"
                          onClick={() => handleAddToList(featuredShow)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to List
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">No spotlight content available</p>
                </div>
              )}
            </div>

            {/* Just For You Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  {recommendationMode === "ai" ? (
                    <>
                      <Brain className="h-5 w-5 text-purple-400" />
                      Just For You
                    </>
                  ) : (
                    <>
                      <Flame className="h-5 w-5 text-orange-400" />
                      Trending Now
                    </>
                  )}
                </h3>
                
                <div className="flex items-center gap-4">
                  {/* Recommendation Genre Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Filter:</span>
                    {genresLoading ? (
                      <div className="flex gap-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-8 w-16 bg-gray-800 rounded animate-pulse"></div>
                        ))}
                      </div>
                    ) : (
                      <select
                        value={selectedRecommendationGenre}
                        onChange={(e) => setSelectedRecommendationGenre(e.target.value)}
                        className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm"
                      >
                        <option value="all">All Genres</option>
                        {genres.filter(g => g.id !== "all").map((genre) => (
                          <option key={genre.id} value={String(genre.id)}>
                            {genre.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                  {/* Mode Toggle */}
                  <div className="flex items-center bg-gray-800">
                    <Button
                      onClick={() => setRecommendationMode("ai")}
                      variant={recommendationMode === "ai" ? "default" : "ghost"}
                      size="sm"
                      className={recommendationMode === "ai" 
                        ? "bg-gray-700 text-white hover:bg-gray-600" 
                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                      }
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      AI Picks
                    </Button>
                    <Button
                      onClick={() => setRecommendationMode("trending")}
                      variant={recommendationMode === "trending" ? "default" : "ghost"}
                      size="sm"
                      className={recommendationMode === "trending" 
                        ? "bg-gray-700 text-white hover:bg-gray-600" 
                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                      }
                    >
                      <Flame className="h-4 w-4 mr-2" />
                      Trending
                    </Button>
                  </div>
                </div>
              </div>

              {/* Recommendations Grid - Only 4 items */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentRecommendations?.slice(0, 4).map((show: any, index: number) => {
                  const showTitle = getShowTitle(show);
                  const showPoster = getShowPosterUrl(show);
                  const showStreaming = getStreamingPlatforms(show);
                  const rawRating = getShowRating(show);
                  const showRating = rawRating ? formatRating(rawRating) : null;
                  const showId = getShowId(show);
                  
                  return (
                    <div key={index} className="group cursor-pointer">
                      <div className="bg-gray-800 aspect-[2/3] mb-2 relative overflow-hidden hover:scale-105 transition-transform">
                        <img
                          src={showPoster}
                          alt={showTitle}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Hover actions with working buttons */}
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleWatchNow(show)}
                            className="bg-white text-black p-2 rounded hover:bg-gray-200 transition-colors"
                            title="Watch Now"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleWatchTrailer(show)}
                            className="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors"
                            title="Watch Trailer"
                          >
                            <Sparkles className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleAddToList(show)}
                            className="bg-gray-800 text-white p-2 rounded hover:bg-gray-700 transition-colors"
                            title="Add to Watchlist"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-medium line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {showTitle}
                      </p>
                      
                      {/* Streaming platforms */}
                      {showStreaming && showStreaming.length > 0 && (
                        <div className="mt-1 flex gap-1 flex-wrap">
                          {showStreaming.slice(0, 3).map((platform: any, platformIndex: number) => (
                            <div key={platformIndex} className="flex items-center">
                              {platform.logo_path ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w45${platform.logo_path}`}
                                  alt={platform.provider_name}
                                  className="w-5 h-5 rounded"
                                  title={platform.provider_name}
                                />
                              ) : (
                                <div className="w-5 h-5 bg-gray-600 rounded text-xs flex items-center justify-center text-white">
                                  {platform.provider_name?.[0] || '?'}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {showRating && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {showRating}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sports Highlights Section */}
            {sportsHighlights && sportsHighlights.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-orange-400" />
                    🏈 Sports Highlights
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                      onClick={() => window.location.href = '/sports'}
                    >
                      View All Sports
                    </Button>
                  </div>
                </div>

                {/* Sports Highlights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sportsHighlights.slice(0, 6).map((highlight: any) => (
                    <div key={highlight.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-red-400 font-medium">
                            {highlight.isLive ? 'LIVE' : highlight.status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{highlight.league}</span>
                      </div>
                      
                      <h4 className="text-white text-lg font-medium mb-2 group-hover:text-blue-400 transition-colors">
                        {highlight.title}
                      </h4>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {highlight.homeTeam?.logo && (
                            <img 
                              src={highlight.homeTeam.logo} 
                              alt={highlight.homeTeam.name}
                              className="w-6 h-6 rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <span className="text-sm text-gray-300">{highlight.homeTeam?.name}</span>
                          {highlight.homeTeam?.score && (
                            <span className="text-sm font-bold text-white">{highlight.homeTeam.score}</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">vs</span>
                        <div className="flex items-center gap-3">
                          {highlight.awayTeam?.score && (
                            <span className="text-sm font-bold text-white">{highlight.awayTeam.score}</span>
                          )}
                          <span className="text-sm text-gray-300">{highlight.awayTeam?.name}</span>
                          {highlight.awayTeam?.logo && (
                            <img 
                              src={highlight.awayTeam.logo} 
                              alt={highlight.awayTeam.name}
                              className="w-6 h-6 rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                        <span>{highlight.date}</span>
                        <span>{highlight.time}</span>
                        <span>{highlight.venue}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-red-600 text-white hover:bg-red-700 transition-colors flex-1"
                          onClick={() => {
                            if (highlight.videoUrl && highlight.videoUrl.includes('youtube')) {
                              window.open(highlight.videoUrl, '_blank');
                            } else {
                              // Fallback to YouTube search
                              window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(highlight.title + ' highlights')}`, '_blank');
                            }
                          }}
                        >
                          <Play className="h-3 w-3 mr-2" />
                          {highlight.isLive ? 'Watch Live' : 'Highlights'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-600"
                          onClick={() => {
                            // Add to sports watchlist or set reminder
                            showToast(`Added reminder for ${highlight.title}`, 'success');
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {loadingSports && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-700 rounded mb-3"></div>
                        <div className="h-6 bg-gray-700 rounded mb-2"></div>
                        <div className="flex justify-between items-center mb-3">
                          <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                        </div>
                        <div className="h-8 bg-gray-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar (1/4) */}
          <div className="lg:col-span-1 w-full min-w-0">
            <div className="space-y-4">
              {/* Actionable Quick Actions Sidebar */}
              <div 
                onClick={goToSocial} 
                className="bg-gray-800 p-4 hover:bg-gray-700 transition-all duration-200 cursor-pointer border-l-4 border-transparent hover:border-blue-500 group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                  <h4 className="font-semibold text-white group-hover:text-blue-200">Friend Activity</h4>
                </div>
                <p className="text-gray-400 text-sm mb-3 group-hover:text-gray-300">See what your friends are watching</p>
                <div className="text-xs text-gray-500 mb-2">
                  {friendActivity?.recent?.length || 0} recent activities
                </div>
                <div className="text-xs text-blue-400 group-hover:text-blue-300 font-medium">
                  Click to view all →
                </div>
              </div>

              {/* Continue Watching Sidebar */}
              <div 
                className="bg-gray-800 p-4 hover:bg-gray-700 transition-all duration-200 cursor-pointer border-l-4 border-transparent hover:border-blue-500 group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Play className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                  <h4 className="font-semibold text-white group-hover:text-blue-200">Continue Watching</h4>
                </div>
                
                {continueWatchingData && continueWatchingData.length > 0 ? (
                  <div>
                    <div className="space-y-2 mb-3">
                      {continueWatchingData.slice(0, 2).map((item, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-3 p-2 hover:bg-gray-600 rounded transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWatchNow(item);
                          }}
                        >
                          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                            <Play className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">
                                S{item.currentEpisode?.seasonNumber}E{item.currentEpisode?.episodeNumber}
                              </span>
                              <div className="w-12 h-1 bg-gray-600 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full" 
                                  style={{ width: `${item.currentEpisode?.progressPercentage || 0}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">
                                {item.currentEpisode?.progressPercentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-xs text-blue-400 group-hover:text-blue-300 font-medium">
                      {continueWatchingData.length > 2 
                        ? `View all ${continueWatchingData.length} shows →` 
                        : 'Click to view all →'
                      }
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400 text-sm mb-3 group-hover:text-gray-300">Pick up where you left off</p>
                    <div className="text-xs text-gray-500 mb-2">
                      No shows in progress
                    </div>
                    <div className="text-xs text-blue-400 group-hover:text-blue-300 font-medium">
                      Start watching something →
                    </div>
                  </div>
                )}
              </div>

              {/* Your Lists Section */}
              <div 
                className="bg-gray-800 p-4 hover:bg-gray-700 transition-all duration-200 cursor-pointer border-l-4 border-transparent hover:border-teal-500 group"
                onClick={goToLists}
              >
                <div className="flex items-center gap-3 mb-4">
                  <List className="h-5 w-5 text-teal-400 group-hover:text-teal-300" />
                  <h4 className="font-semibold text-white group-hover:text-teal-200">Your Lists</h4>
                </div>
                
                {userLists?.lists && userLists.lists.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                      {userLists.lists.slice(0, 3).map((list: any, index: number) => (
                        <div 
                          key={index} 
                          className="text-center p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToSpecificList(list.id);
                          }}
                        >
                          <div className="w-6 h-6 bg-teal-600 rounded mx-auto mb-1 flex items-center justify-center">
                            <List className="h-3 w-3 text-white" />
                          </div>
                          <p className="text-xs font-medium text-white truncate">
                            {list.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {list.itemCount || 0}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-xs text-teal-400 group-hover:text-teal-300 font-medium">
                      {userLists.lists.length > 3 
                        ? `View all ${userLists.lists.length} lists →` 
                        : 'Click to manage →'
                      }
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400 text-sm mb-3 group-hover:text-gray-300">Organize your watchlists</p>
                    <div className="text-xs text-gray-500 mb-2">
                      No lists created yet
                    </div>
                    <div className="text-xs text-teal-400 group-hover:text-teal-300 font-medium">
                      Create your first list →
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Recommendation Modal */}
      <RecommendationModal 
        show={selectedShow} 
        open={!!selectedShow} 
        onClose={() => setSelectedShow(null)}
        onAddToList={handleAddToList}
        onWatchNow={handleWatchNow}
      />

      {/* Toast Notifications */}
      <Toast 
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}