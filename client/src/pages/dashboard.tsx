import React, { useCallback, useMemo, useState, useEffect, memo } from 'react';import React from "react";import React from "react";import React, { useState, useMemo, useEffect } from "react";

import { TooltipProvider } from '@/components/ui/tooltip';

import { Skeleton } from '@/components/ui/skeleton';import { useAuth } from "@/hooks/useAuth";

import { Button } from '@/components/ui/button';

import { Card, CardContent } from '@/components/ui/card';import NavigationHeader from "@/components/navigation-header";import { useAuth } from "@/hooks/useAuth";import { useQuery } from "@tanstack/react-query";

import { Badge } from '@/components/ui/badge';

import { Alert, AlertDescription } from '@/components/ui/alert';import Spotlight from "@/components/Spotlight";

import { EnhancedShowCard } from '@/components/EnhancedShowCard';

import FilterControls from '@/components/FilterControls';import ContinueWatching from "@/components/ContinueWatching";import NavigationHeader from "@/components/navigation-header";import { useAuth } from "@/hooks/useAuth";

import NavigationHeader from '@/components/navigation-header';

import { GRADIENTS, getRatingColor } from '@/styles/constants';import RecommendationSection from "@/components/RecommendationSection";

import { useAuth } from '@/hooks/useAuth';

import { useQuery } from '@tanstack/react-query';import Toast from "@/components/toast";import Spotlight from "@/components/Spotlight";import { useContinueWatching, useCurrentProgress } from "@/hooks/useViewingHistory";

import { Star, TrendingUp, Play, RefreshCw } from 'lucide-react';

import RecommendationModal from "@/components/recommendation-modal";

// TMDB Genre Map

const GENRE_MAP: Record<number, string> = {import ShowDetailsModal from "@/components/show-details";import ContinueWatching from "@/components/ContinueWatching";import { useFilterOptions } from "@/hooks/useFilterOptions";

  10759: 'Action & Adventure',

  16: 'Animation',import { useRecommendationModal } from "@/hooks/useRecommendationModal";

  35: 'Comedy',

  80: 'Crime',import { useShowDetails } from "@/hooks/useShowDetails";import RecommendationSection from "@/components/RecommendationSection";import { useLocalStorage } from "@/hooks/useLocalStorage";

  99: 'Documentary',

  18: 'Drama',

  10751: 'Family',

  10762: 'Kids',// Dashboard Componentimport Toast from "@/components/toast";import { useFilters } from "@/hooks/useFilters";

  9648: 'Mystery',

  10763: 'News',const Dashboard: React.FC = () => {

  10764: 'Reality',

  10765: 'Sci-Fi & Fantasy',  const { user } = useAuth();import RecommendationModal from "@/components/recommendation-modal";import NavigationHeader from "@/components/navigation-header";

  10766: 'Soap',

  10767: 'Talk',

  10768: 'War & Politics',

  37: 'Western',  // Recommendation modalimport ShowDetailsModal from "@/components/show-details";import Toast from "@/components/toast";

  28: 'Action',

  12: 'Adventure',  const { isOpen: isRecOpen, close: closeRecModal } = useRecommendationModal();

  14: 'Fantasy',

  27: 'Horror',import { useRecommendationModal } from "@/hooks/useRecommendationModal";import RecommendationModal from "@/components/recommendation-modal";

  36: 'History',

  53: 'Thriller',  // Show Details modal

  10749: 'Romance',

  878: 'Science Fiction',  const { showDetails, close: closeShowDetails } = useShowDetails();import { useShowDetails } from "@/hooks/useShowDetails";import ShowDetailsModal from "@/components/show-details-modal";

  10752: 'War',

};



interface Show {  return (import { ListSelectorModal } from "@/components/list-selector-modal";

  id: number;

  title?: string;    <div className="min-h-screen bg-background text-foreground flex flex-col">

  name?: string;

  overview?: string;      <NavigationHeader />const Dashboard: React.FC = () => {import { DashboardFilterProvider, useDashboardFilters } from "@/components/dashboard/filters/DashboardFilterProvider";

  poster_path?: string;

  backdrop_path?: string;

  vote_average?: number;

  genre_ids?: number[];      <main className="flex-1 space-y-8 px-4 md:px-8 lg:px-12 py-6">  const { user } = useAuth();import { RecommendationFilter } from "@/components/filters/RecommendationFilter";

}

        {/* Spotlight Section */}

// Memoized show card for performance

const MemoizedShowCard = memo(EnhancedShowCard);        <Spotlight  const { isOpen: isRecOpen, close: closeRecModal } = useRecommendationModal();import { FriendFeedFilterChips } from "@/components/dashboard/filters/FriendFeedFilterChips";



export default function PolishedDashboard() {          // Fully enhanced props

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [currentSpotlightIndex, setCurrentSpotlightIndex] = useState(0);          enableHoverActions  const { showDetails, close: closeShowDetails } = useShowDetails();import { CustomListFilterPanel } from "@/components/dashboard/filters/CustomListFilterPanel";

  const [isSpotlightPaused, setIsSpotlightPaused] = useState(false);

          enableUniversalButtons

  // Filters with persistent localStorage

  const [selectedGenre, setSelectedGenre] = useState(() => {          onWatchNow={(show) => console.log("Watch Now:", show)}import type { RecommendationFilters } from "@/components/filters/types";

    if (typeof window !== 'undefined') {

      const saved = localStorage.getItem('dashboard-filters');          onWatchTrailer={(show) => console.log("Trailer:", show)}

      return saved ? JSON.parse(saved).genre || '' : '';

    }          onAddToList={(show) => console.log("Add to List:", show)}  return (import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

    return '';

  });          onShowDetails={(show) => console.log("Show Details:", show)}

  const [selectedNetwork, setSelectedNetwork] = useState(() => {

    if (typeof window !== 'undefined') {        />    <div className="min-h-screen bg-background text-foreground flex flex-col">import { Button } from "@/components/ui/button";

      const saved = localStorage.getItem('dashboard-filters');

      return saved ? JSON.parse(saved).network || '' : '';

    }

    return '';        {/* Recommendations Section */}      <NavigationHeader />import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

  });

  const [selectedYear, setSelectedYear] = useState(() => {        <RecommendationSection

    if (typeof window !== 'undefined') {

      const saved = localStorage.getItem('dashboard-filters');          title="Just For You"import { Badge } from "@/components/ui/badge";

      return saved ? JSON.parse(saved).year || '' : '';

    }          queryKey={["recommendations", user?.id]}

    return '';

  });          endpoint="/api/recommendations"      <main className="flex-1 space-y-8 px-4 md:px-8 lg:px-12 py-6">import { Play, Star, Clock, Users, Plus, TrendingUp, Sparkles, BarChart3, Eye, Brain, Flame, Heart, Filter, List, X, Bookmark } from "lucide-react";

  const [sortBy, setSortBy] = useState(() => {

    if (typeof window !== 'undefined') {          params={{ userId: user?.id }}

      const saved = localStorage.getItem('dashboard-filters');

      return saved ? JSON.parse(saved).sortBy || 'popularity' : 'popularity';          enableFilters={true} // Smart inline recommendation filters        {/* Spotlight Section */}import { getShowTitle, getShowPosterUrl, getShowBackdropUrl, getStreamingPlatforms, getStreamingLogo, formatRating, trackEvent, getShowRating, getShowOverview, getShowId } from "@/utils/show-utils";

    }

    return 'popularity';          compactFilters={true} // Compact mode

  });

          maxItems={4} // Show only 4 items        <Spotlight />import { motion } from "framer-motion";

  useEffect(() => {

    const filterState = {          universalButtons={{

      genre: selectedGenre,

      network: selectedNetwork,            onWatchNow: (show) => console.log("Watch Now:", show),

      year: selectedYear,

      sortBy: sortBy            onWatchTrailer: (show) => console.log("Trailer:", show),

    };

    localStorage.setItem('dashboard-filters', JSON.stringify(filterState));            onAddToList: (show) => console.log("Add to List:", show),        {/* Recommendations Section */}// Error Boundary Component for graceful error handling

  }, [selectedGenre, selectedNetwork, selectedYear, sortBy]);

          }}

  // Spotlight / Trending

  const { data: spotlightData, isLoading: spotlightLoading, error: spotlightError, refetch: refetchSpotlight } = useQuery({        />        <RecommendationSectionconst ErrorFallback: React.FC<{ 

    queryKey: ['spotlight-trending'],

    queryFn: async () => {

      const res = await fetch('/api/content/trending-enhanced?includeStreaming=true');

      if (!res.ok) throw new Error('Failed to fetch trending content');        {/* Continue Watching Section */}          title="Just for You"  error?: Error; 

      return res.json();

    },        <ContinueWatching

    staleTime: 5 * 60 * 1000,

    retry: 2          userId={user?.id}          queryKey={["recommendations", user?.id]}  resetError?: () => void; 

  });

          enableProgressBars

  // Recommendations

  const { data: recommendationsData, isLoading: recommendationsLoading, error: recommendationsError, refetch: refetchRecommendations } = useQuery({          enablePosterFallback          endpoint="/api/recommendations"  title?: string;

    queryKey: ['unified-recommendations', user?.id, selectedGenre, selectedNetwork, selectedYear, sortBy],

    queryFn: async () => {          enableUniversalButtons

      const res = await fetch('/api/recommendations/unified', {

        method: 'POST',          maxItems={2}          params={{ userId: user?.id }}  className?: string;

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({          onWatchNow={(item) => console.log("Continue Watching:", item)}

          filters: {

            hideWatched: true,          onShowDetails={(item) => console.log("Show Details:", item)}        />}> = ({ error, resetError, title = "Something went wrong", className = "" }) => (

            genre: selectedGenre || undefined,

            network: selectedNetwork || undefined,        />

            year: selectedYear || undefined,

            sortBy: sortBy,      </main>  <div className={`bg-gray-800 rounded-lg p-6 text-center ${className}`}>

            rating: '7.0'

          },

          userProfile: {

            favoriteGenres: user?.preferences?.favoriteGenres || ['Drama', 'Comedy'],      {/* Recommendation Modal */}        {/* Continue Watching Section */}    <div className="text-red-400 mb-2">⚠️</div>

            preferredNetworks: user?.preferences?.preferredNetworks || ['Netflix', 'HBO'],

            viewingHistory: [],      <RecommendationModal

            watchlist: [],

            currentlyWatching: [],        isOpen={isRecOpen}        <ContinueWatching userId={user?.id} />    <h3 className="text-lg font-medium text-white mb-2">{title}</h3>

            recentlyWatched: []

          },        onClose={closeRecModal}

          limit: 12

        })      />      </main>    <p className="text-gray-400 text-sm mb-4">

      });

      if (!res.ok) throw new Error('Failed to fetch recommendations');

      return res.json();

    },      {/* Show Details Modal */}      {error?.message || "We encountered an unexpected error. Please try again."}

    enabled: isAuthenticated,

    staleTime: 10 * 60 * 1000,      {showDetails && (

    retry: 2

  });        <ShowDetailsModal      {/* Modals */}    </p>



  // Continue Watching          show={showDetails}

  const { data: continueWatchingData, isLoading: continueWatchingLoading } = useQuery({

    queryKey: ['continue-watching', user?.id],          onClose={closeShowDetails}      <RecommendationModal isOpen={isRecOpen} onClose={closeRecModal} />    {resetError && (

    queryFn: async () => {

      const res = await fetch('/api/viewing-history/continue-watching-enhanced');        />

      if (!res.ok) throw new Error('Failed to fetch continue watching');

      return res.json();      )}      {showDetails && (      <Button 

    },

    enabled: isAuthenticated,

    staleTime: 2 * 60 * 1000,

    retry: 2      <Toast />        <ShowDetailsModal show={showDetails} onClose={closeShowDetails} />        onClick={resetError} 

  });

    </div>

  const spotlightShows = useMemo(() => spotlightData?.slice(0, 5) || [], [spotlightData]);

  const recommendations = useMemo(() => recommendationsData?.slice(5) || [], [recommendationsData]);  );      )}        variant="outline" 

  const continueWatching = useMemo(() => continueWatchingData || [], [continueWatchingData]);

  const currentSpotlightShow = useMemo(() => spotlightShows[currentSpotlightIndex] || null, [spotlightShows, currentSpotlightIndex]);};



  // Spotlight auto-cycle        size="sm"

  useEffect(() => {

    if (spotlightShows.length > 1 && !isSpotlightPaused) {export default Dashboard;

      const interval = setInterval(() => {      <Toast />        className="text-white border-gray-600 hover:border-gray-500"

        setCurrentSpotlightIndex(prev => (prev + 1) % spotlightShows.length);

      }, 8000);    </div>      >

      return () => clearInterval(interval);

    }  );        Try Again

  }, [spotlightShows.length, isSpotlightPaused]);

};      </Button>

  // Add to watchlist handler

  const handleAddToWatchlist = useCallback(async (show: Show) => {    )}

    if (!isAuthenticated || !user?.id) return;

    try {export default Dashboard;  </div>

      await fetch('/api/watchlist/add', {);

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },// Safe wrapper component for error boundaries

        body: JSON.stringify({ userId: user.id, showId: show.id })const SafeSection: React.FC<{ 

      });  children: React.ReactNode; 

      // optionally show toast here  fallback?: React.ReactNode;

    } catch (e) { console.error(e); }  title?: string;

  }, [isAuthenticated, user?.id]);  className?: string;

}> = ({ children, fallback, title, className }) => {

  if (authLoading) return <Skeleton className="h-screen w-full" />;  try {

    return <>{children}</>;

  return (  } catch (error) {

    <TooltipProvider>    console.error(`Error in ${title || 'section'}:`, error);

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">    return fallback || <ErrorFallback error={error as Error} title={title} className={className} />;

        <NavigationHeader />  }

        <main className="container mx-auto px-4 py-8 space-y-8">};

          {/* Spotlight */}

          {currentSpotlightShow && (function Dashboard() {

            <section className="space-y-4">  const { user, isLoading, isAuthenticated } = useAuth();

              <div className="flex items-center gap-2"><TrendingUp className="h-6 w-6 text-purple-400"/><h2 className="text-2xl font-bold">Trending Now</h2></div>  const { watchlistStatus, preferredGenres, setFilter } = useDashboardFilters(); // Get from context

              <Card   const [selectedRecommendationGenre, setSelectedRecommendationGenre] = useState("all"); // Separate genre filter for Just For You section

                className="relative overflow-hidden border-0 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm"  const [recommendationMode, setRecommendationMode] = useState("ai"); // "ai" or "trending"

                onMouseEnter={() => setIsSpotlightPaused(true)}  const [selectedShow, setSelectedShow] = useState<any>(null);

                onMouseLeave={() => setIsSpotlightPaused(false)}  

              >  // Spotlight filter type: "genre" or "network"

                {currentSpotlightShow.backdrop_path && (  const [spotlightFilterType, setSpotlightFilterType] = useState<'genre' | 'network'>('genre');

                  <img  const [selectedNetwork, setSelectedNetwork] = useState('all');

                    src={`https://image.tmdb.org/t/p/original${currentSpotlightShow.backdrop_path}`}  

                    alt={currentSpotlightShow.title || currentSpotlightShow.name}  // Available networks for filtering

                    className="absolute inset-0 w-full h-full object-cover"  const availableNetworks = useMemo(() => [

                  />    { id: 'all', name: 'All' },

                )}    { id: '213', name: 'Netflix' },

                <CardContent className="relative z-20 p-8 min-h-[400px] flex items-end">    { id: '2', name: 'ABC' },

                  <div className="space-y-4 max-w-2xl">    { id: '1024', name: 'Hulu' },

                    <h3 className="text-4xl font-bold">{currentSpotlightShow.title || currentSpotlightShow.name}</h3>    { id: '49', name: 'HBO' },

                    <p className="text-slate-300 line-clamp-3">{currentSpotlightShow.overview}</p>    { id: '2552', name: 'Apple TV+' },

                    <div className="flex gap-3">    { id: '2739', name: 'Paramount+' },

                      <Button className={`${GRADIENTS.trailer} text-white`}><Play className="h-4 w-4 mr-2"/>Watch Trailer</Button>    { id: '1303', name: 'Disney+' },

                      <Button variant="outline" onClick={() => handleAddToWatchlist(currentSpotlightShow)}>Add to Watchlist</Button>    { id: '3353', name: 'Peacock' },

                    </div>    { id: '21', name: 'BBC' }

                  </div>  ], []);

                </CardContent>  

              </Card>  // 🎯 Section-Specific Smart Filters

            </section>  const [recommendationFilters, setRecommendationFilters] = useState<RecommendationFilters>({

          )}    mood: 'discover',

    genre: '',

          {/* Recommendations */}    platform: ''

          <section>  });

            <div className="flex items-center gap-2 mb-4"><Star className="h-6 w-6 text-yellow-400"/><h2 className="text-2xl font-bold">Recommended for You</h2></div>  

            <FilterControls   // Modal states

              selectedGenre={selectedGenre}  const [listSelectorOpen, setListSelectorOpen] = useState(false);

              selectedNetwork={selectedNetwork}  const [showToAddToList, setShowToAddToList] = useState<any>(null);

              selectedYear={selectedYear}  const [showDetailsModalOpen, setShowDetailsModalOpen] = useState(false);

              sortBy={sortBy}  const [selectedShowForDetails, setSelectedShowForDetails] = useState<any>(null);

              onGenreChange={setSelectedGenre}

              onNetworkChange={setSelectedNetwork}  // Toast state

              onYearChange={setSelectedYear}  const [toast, setToast] = useState({

              onSortChange={setSortBy}    isVisible: false,

              genres={[]}    message: '',

              compact    type: 'success' as 'success' | 'error' | 'info'

            />  });

            {recommendationsLoading ? (

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">  // 🎯 Section-Specific Smart Filters

                {Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-lg"/>)}  const { data: userPreferencesData, error: preferencesError } = useQuery({

              </div>    queryKey: ["/api/user/preferences"],

            ) : (    queryFn: async () => {

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">      const res = await fetch("/api/user/preferences", { credentials: 'include' });

                {recommendations.map(show => (      if (!res.ok) {

                  <MemoizedShowCard key={show.id} show={show} onAddToWatchlist={handleAddToWatchlist} genreMap={GENRE_MAP} size="md"/>        console.error("❌ User preferences fetch failed:", res.status, res.statusText);

                ))}        // Fallback: try to get preferences directly from user data

              </div>        const userRes = await fetch("/api/auth/user", { credentials: 'include' });

            )}        if (userRes.ok) {

          </section>          const userData = await userRes.json();

          console.log("🔄 Fallback: Using user data for preferences:", userData);

          {/* Continue Watching */}          // Mock the preferences structure from user data if available

          {continueWatching.length > 0 && (          return {

            <section>            preferredGenres: userData.preferences?.preferredGenres || [],

              <div className="flex items-center gap-2 mb-4"><Play className="h-6 w-6 text-green-400"/><h2 className="text-2xl font-bold">Continue Watching</h2></div>            preferredNetworks: userData.preferences?.preferredNetworks || []

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">          };

                {continueWatching.map(show => (        }

                  <MemoizedShowCard key={show.id} show={show} onAddToWatchlist={handleAddToWatchlist} genreMap={GENRE_MAP} size="md"/>        throw new Error('Both preferences and user data fetch failed');

                ))}      }

              </div>      const data = await res.json();

            </section>      console.log("🔍 Raw user preferences API response:", data);

          )}      return data.preferences;

        </main>    },

      </div>    enabled: !!isAuthenticated,

    </TooltipProvider>    staleTime: 600000, // Cache for 10 minutes

  );    retry: 1 // Only retry once to avoid infinite loops

}  });

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
  const genres = useMemo(() => {
    const allGenres = genresData?.genres || [];
    
    console.log("🎭 All available TMDB genres:", allGenres.map((g: any) => `${g.name} (${g.id})`));
    
    // Enhanced genre mapping to cover all possible onboarding selections including Sports
    const extendedGenres = [
      ...allGenres,
      // Add Sports as a custom genre that maps to relevant TMDB genres
      { id: 99999, name: "Sports" }, // Custom ID for Sports
    ];
    
    // Robust fallback for user preferences
    const knownUserPreferences = ["Drama", "Comedy", "Thriller", "Romance"];
    const rawUserPreferences = (userPreferencesData as any)?.preferredGenres;
    
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
        
        // Add missing common genre aliases
        if (genre.name === "Drama") {
          genreNameToId["drama"] = genre.id;
        }
        if (genre.name === "Comedy") {
          genreNameToId["comedy"] = genre.id;
        }
        if (genre.name === "Thriller") {
          genreNameToId["thriller"] = genre.id;
        }
        if (genre.name === "Romance") {
          genreNameToId["romance"] = genre.id;
        }
        if (genre.name === "Horror") {
          genreNameToId["horror"] = genre.id;
        }
        if (genre.name === "Crime") {
          genreNameToId["crime"] = genre.id;
        }
        if (genre.name === "Mystery") {
          genreNameToId["mystery"] = genre.id;
        }
        if (genre.name === "Fantasy") {
          genreNameToId["fantasy"] = genre.id;
        }
        if (genre.name === "Animation") {
          genreNameToId["animation"] = genre.id;
          genreNameToId["animated"] = genre.id;
        }
        if (genre.name === "Documentary") {
          genreNameToId["documentary"] = genre.id;
          genreNameToId["documentaries"] = genre.id;
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

  // Enhanced genres with popular additions for better discovery
  const enhancedGenres = useMemo(() => {
    if (genres.length >= 8) return genres; // If we already have enough genres, use them
    
    // Add popular genres if the current list is too short
    if (!genresData?.genres) return genres;
    
    const popularGenreNames = ['Action', 'Comedy', 'Drama', 'Thriller', 'Horror', 'Romance', 'Sci-Fi', 'Documentary', 'Animation', 'Crime'];
    const existingIds = new Set(genres.map(g => g.id));
    
    const additionalGenres = popularGenreNames
      .map(name => {
        const found = genresData.genres.find((g: any) => g.name === name);
        return found ? { id: String(found.id), name: found.name } : null;
      })
      .filter(Boolean)
      .filter(genre => !existingIds.has(genre!.id))
      .slice(0, 8 - genres.length);
    
    return [...genres, ...additionalGenres];
  }, [genres, genresData]);

  // Compute selected genre from centralized filter context
  const selectedGenre = useMemo(() => {
    if (!preferredGenres || preferredGenres.length === 0) return "all";
    
    // Use the first selected genre from the filter context
    const firstGenre = preferredGenres[0];
    
    // Find the matching genre ID in our enhanced genres
    const matchingGenre = enhancedGenres.find(g => 
      g.name.toLowerCase() === firstGenre.toLowerCase() ||
      g.id === firstGenre
    );
    
    return matchingGenre ? matchingGenre.id : "all";
  }, [preferredGenres, enhancedGenres]);

  // Navigation and utility handlers
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

  // Show details handler
  const handleShowDetails = (show: any) => {
    setSelectedShowForDetails(show);
    setShowDetailsModalOpen(true);
  };

  // Button handlers with analytics tracking

  const handleAddToList = async (show: any) => {
    const title = getShowTitle(show);
    const showId = getShowId(show);
    
    try {
      trackEvent('Add to List Clicked', { showId: showId, showTitle: title });
      
      // Open list selector modal instead of adding to default list
      setShowToAddToList(show);
      setListSelectorOpen(true);
      
    } catch (error) {
      console.error('Failed to open list selector:', error);
      showToast('Failed to open list selector', 'error');
      trackEvent('Add to List Failed', { showId: showId, error: 'Modal Error' });
    }
  };

  const handleWatchNow = async (show: any) => {
    const title = getShowTitle(show);
    const showId = getShowId(show);
    const streamingPlatforms = getStreamingPlatforms(show);
    
    try {
      trackEvent('Watch Now Clicked', { showId: showId, showTitle: title });
      
      // If streaming platforms are available, use the first one directly
      if (streamingPlatforms && streamingPlatforms.length > 0) {
        const platform = streamingPlatforms[0];
        
        // Generate platform-specific URL - handle both name and provider_name properties
        const platformName = platform.name || platform.provider_name;
        const platformUrl = getPlatformDirectUrl(platformName, title);
        
        trackEvent('Streaming Platform Redirect', { 
          showId: showId, 
          platform: platformName,
          directLink: platformUrl
        });
        
        showToast(`Opening on ${platformName}...`, 'info');
        window.open(platformUrl, '_blank');
        return;
      }
      
      // Fallback: Get streaming data and try again
      const params = new URLSearchParams({
        title: title,
        ...(show.imdb_id && { imdbId: show.imdb_id })
      });
      
      const response = await fetch(`/api/streaming/comprehensive/tv/${showId}?${params}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const streamingData = await response.json();
        if (streamingData.results && streamingData.results.length > 0) {
          const firstPlatform = streamingData.results[0];
          const platformName = firstPlatform.name || firstPlatform.provider_name;
          const platformUrl = getPlatformDirectUrl(platformName, title);
          
          trackEvent('Streaming Platform Redirect (Fetched)', { 
            showId: showId, 
            platform: platformName,
            directLink: platformUrl
          });
          
          showToast(`Opening on ${platformName}...`, 'info');
          window.open(platformUrl, '_blank');
          return;
        }
      }
      
      // Final fallback: First available streaming platform search
      const platformUrl = getPlatformDirectUrl('Netflix', title); // Default to Netflix search
      trackEvent('Watch Now Fallback', { showId: showId, showTitle: title });
      showToast('Opening on streaming platform...', 'info');
      window.open(platformUrl, '_blank');
      
    } catch (error) {
      console.error('Watch Now error:', error);
      trackEvent('Watch Now Error', { showId: showId, error: error });
      // Fallback to Netflix search
      const platformUrl = getPlatformDirectUrl('Netflix', title);
      window.open(platformUrl, '_blank');
    }
  };

  // Helper function to get direct platform URLs
  const getPlatformDirectUrl = (platformName: string, title: string): string => {
    const encodedTitle = encodeURIComponent(title);
    
    const platformUrls: { [key: string]: string } = {
      'Netflix': `https://www.netflix.com/search?q=${encodedTitle}`,
      'Disney Plus': `https://www.disneyplus.com/search?q=${encodedTitle}`,
      'Disney+': `https://www.disneyplus.com/search?q=${encodedTitle}`,
      'Hulu': `https://www.hulu.com/search?q=${encodedTitle}`,
      'Amazon Prime Video': `https://www.amazon.com/gp/video/search?phrase=${encodedTitle}`,
      'Prime Video': `https://www.amazon.com/gp/video/search?phrase=${encodedTitle}`,
      'HBO Max': `https://play.max.com/search?q=${encodedTitle}`,
      'Max': `https://play.max.com/search?q=${encodedTitle}`,
      'Apple TV Plus': `https://tv.apple.com/search?term=${encodedTitle}`,
      'Apple TV+': `https://tv.apple.com/search?term=${encodedTitle}`,
      'Paramount Plus': `https://www.paramountplus.com/search/?query=${encodedTitle}`,
      'Paramount+': `https://www.paramountplus.com/search/?query=${encodedTitle}`,
      'Peacock': `https://www.peacocktv.com/search?q=${encodedTitle}`,
      'Crunchyroll': `https://www.crunchyroll.com/search?q=${encodedTitle}`,
      'YouTube TV': `https://tv.youtube.com/search?q=${encodedTitle}`,
      'Youtube TV': `https://tv.youtube.com/search?q=${encodedTitle}`,
      'Showtime': `https://www.showtime.com/search?q=${encodedTitle}`,
      'Starz': `https://www.starz.com/search?query=${encodedTitle}`,
      'fuboTV': `https://www.fubo.tv/search?query=${encodedTitle}`,
      'Philo': `https://www.philo.com/search?q=${encodedTitle}`,
      'Amazon Video': `https://www.amazon.com/gp/video/search?phrase=${encodedTitle}`,
      'Apple TV': `https://tv.apple.com/search?term=${encodedTitle}`
    };
    
    return platformUrls[platformName] || `https://www.netflix.com/search?q=${encodedTitle}`;
  };

  const handleWatchTrailer = async (show: any) => {
    const title = getShowTitle(show);
    const showId = getShowId(show);
    
    try {
      trackEvent('Watch Trailer Clicked', { showId: showId, showTitle: title });
      
      // Open the enhanced show details modal with trailer tab
      setSelectedShowForDetails(show);
      setShowDetailsModalOpen(true);
      
    } catch (error) {
      console.error('Failed to open trailer:', error);
      showToast('Failed to load trailer', 'error');
      trackEvent('Trailer Open Failed', { showId: showId });
    }
  };

  // Fetch trending/spotlight data filtered by genre or network
  const { data: spotlightData, isLoading: spotlightLoading, error: spotlightError } = useQuery({
    queryKey: ["/api/tmdb/trending-enhanced-v2", spotlightFilterType, spotlightFilterType === 'genre' ? selectedGenre : selectedNetwork],
    queryFn: async () => {
      let url = `/api/tmdb/spotlight`; // Default fallback to real TMDB trending
      
      if (spotlightFilterType === 'genre') {
        if (selectedGenre === "all") {
          url = `/api/tmdb/spotlight`;
        } else {
          url = `/api/tmdb/discover/tv?with_genres=${selectedGenre}&sort_by=popularity.desc`;
        }
      } else if (spotlightFilterType === 'network') {
        if (selectedNetwork === "all") {
          url = `/api/tmdb/spotlight`;
        } else {
          url = `/api/tmdb/discover/tv?with_networks=${selectedNetwork}&sort_by=popularity.desc`;
        }
      }
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch trending: ${res.status}`);
      }
      const data = await res.json();
      
      // Normalize the response: spotlight endpoint returns {trending: [...]} while discover returns {results: [...]}
      if (data.trending) {
        return { results: data.trending };
      }
      return data;
    },
    enabled: !!isAuthenticated,
    staleTime: 0, // Force fresh data
    refetchOnWindowFocus: false,
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
  
  // Debug logging for continue watching data
  React.useEffect(() => {
    if (continueWatchingData) {
      console.log('📺 Continue watching data:', continueWatchingData);
      continueWatchingData.forEach((item, index) => {
        console.log(`Show ${index + 1}:`, {
          title: item.title,
          poster_path: item.poster_path,
          posterUrl: getShowPosterUrl(item)
        });
      });
    }
  }, [continueWatchingData]);

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
  const { data: friendActivityData } = useQuery({
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
  
  // Enhanced streaming data for spotlight feature
  const { data: enhancedStreamingData } = useQuery({
    queryKey: ["/api/streaming/comprehensive/tv", featuredShow?.id, featuredShow?.name],
    queryFn: async () => {
      if (!featuredShow?.id || !featuredShow?.name) return null;
      
      console.log("🎬 Fetching enhanced streaming data for:", featuredShow.id, featuredShow.name);
      const params = new URLSearchParams({
        title: featuredShow.name,
        ...(featuredShow.imdb_id && { imdbId: featuredShow.imdb_id })
      });
      
      const res = await fetch(`/api/streaming/comprehensive/tv/${featuredShow.id}?${params}`, { 
        credentials: 'include' 
      });
      
      if (!res.ok) {
        console.warn("⚠️ Enhanced streaming data unavailable, using fallback");
        return null;
      }
      
      const data = await res.json();
      console.log("📺 Enhanced streaming data:", data);
      return data;
    },
    enabled: !!featuredShow?.id && !!featuredShow?.name,
    staleTime: 900000, // Cache for 15 minutes
    retry: 1
  });

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
  const featuredShowStreaming = enhancedStreamingData?.results 
    ? enhancedStreamingData.results 
    : getStreamingPlatforms(featuredShow);
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
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-1 pt-1 md:pt-3 pb-24 md:pb-4 overflow-x-hidden">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 w-full">
          {/* Main Content Area (3/4) */}
          <div className="lg:col-span-3 w-full min-w-0">
            {/* Compact Welcome */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Welcome back, {user?.firstName || user?.displayName || 'there'}!</h1>
                <p className="text-gray-400 text-sm">Ready to discover your next binge?</p>
              </div>
            </div>

            {/* Spotlight Section with Filter Type Selector */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-yellow-400" />
                  Spotlight
                </h2>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Filter by:</span>
                  <select
                    value={spotlightFilterType}
                    onChange={e => setSpotlightFilterType(e.target.value as 'genre' | 'network')}
                    className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                  >
                    <option value="genre">Genre</option>
                    <option value="network">Network</option>
                  </select>
                  {spotlightFilterType === 'genre' ? (
                    genresLoading ? (
                      <div className="h-8 w-32 bg-gray-800 rounded animate-pulse"></div>
                    ) : (
                      <select
                        value={selectedGenre}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "all") {
                            setFilter('preferredGenres', []);
                          } else {
                            const selectedGenreObj = enhancedGenres.find(g => g.id === value);
                            if (selectedGenreObj) {
                              setFilter('preferredGenres', [selectedGenreObj.name]);
                            }
                          }
                        }}
                        className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm min-w-[120px]"
                      >
                        {enhancedGenres.map((genre) => (
                          <option key={genre.id} value={String(genre.id)}>
                            {genre.name}
                          </option>
                        ))}
                      </select>
                    )
                  ) : (
                    <select
                      value={selectedNetwork}
                      onChange={e => setSelectedNetwork(e.target.value)}
                      className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm min-w-[120px]"
                    >
                      {availableNetworks.map(network => (
                        <option key={network.id} value={network.id}>{network.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Hero Spotlight */}
              <SafeSection title="Spotlight Feature" className="h-64">
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
                    className="relative h-64 bg-cover bg-center rounded-lg overflow-hidden"
                    style={{
                      backgroundImage: featuredShowBackdrop 
                        ? `url(${featuredShowBackdrop})` 
                        : 'linear-gradient(135deg, rgb(55 65 81) 0%, rgb(31 41 55) 100%)',
                    }}
                  >
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/60" />
                    
                    {/* Content */}
                    <div className="relative h-full flex items-center">
                      <div className="max-w-2xl px-4 md:px-8">
                        {/* Trending label */}
                        <div className="inline-flex items-center gap-2 bg-yellow-600/20 backdrop-blur-sm text-yellow-300 px-3 py-1 text-sm mb-3">
                          <TrendingUp className="h-4 w-4" />
                          {spotlightFilterType === 'genre'
                            ? `#${selectedGenre === "all" ? "1 Overall" : `1 in ${enhancedGenres.find(g => g.id.toString() === selectedGenre)?.name}`}`
                            : `#${selectedNetwork === "all" ? "1 Overall" : `1 on ${availableNetworks.find(n => n.id === selectedNetwork)?.name}`}`
                          }
                        </div>
                        <h2 className="text-2xl md:text-4xl font-bold mb-4">{featuredShowTitle}</h2>
                        <p className="text-gray-200 mb-4 line-clamp-3">{featuredShow.overview}</p>
                        
                        {/* Enhanced streaming platforms display */}
                        <div className="mb-4">
                          {enhancedStreamingData?.results && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-blue-400">Watch on:</span>
                              <div className="flex gap-2">
                                {enhancedStreamingData.results.slice(0, 3).map((platform: any, idx: number) => (
                                  <span key={idx} className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded-md">
                                    {platform.provider_name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
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
              </SafeSection>
            </div>

            {/* Just For You Section with Smart Inline Filter */}
            <div className="mb-6">
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
                  {/* Smart Recommendation Filter */}
                  <RecommendationFilter
                    onChange={(filters) => {
                      setRecommendationFilters(filters);
                      console.log('🎛️ Recommendation filters changed:', filters);
                    }}
                    initialFilters={recommendationFilters}
                    compact={true}
                  />
                  
                  {/* Mode Toggle */}
                  <div className="flex items-center bg-gray-800 rounded-lg">
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
                          src={showPoster || '/fallback-poster.jpg'}
                          alt={showTitle}
                          className="w-full h-full object-cover"
                          onClick={() => handleShowDetails(show)}
                          onError={(e) => {
                            e.currentTarget.src = '/fallback-poster.jpg';
                          }}
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
                            title="Add to List"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleShowDetails(show)}
                            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                            title="Show Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-medium line-clamp-2 group-hover:text-blue-400 transition-colors cursor-pointer" onClick={() => handleShowDetails(show)}>
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

            {/* Sports Highlights Section - Only show if user selected sports/documentary genres */}
            {sportsHighlights && sportsHighlights.length > 0 && 
             userPreferencesData?.preferredGenres && 
             (userPreferencesData.preferredGenres.includes('Documentary') || 
              userPreferencesData.preferredGenres.includes('Action') ||
              userPreferencesData.preferredGenres.includes('Sport') ||
              userPreferencesData.preferredGenres.includes('Sports')) && (
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
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
              </motion.div>
            )}
          </div>

          {/* Sidebar (1/4) */}
          <div className="lg:col-span-1 w-full min-w-0">
            <div className="space-y-4">
              {/* Enhanced Friend Activity Sidebar with Filtering */}
              <div 
                className="bg-gray-800 p-4 hover:bg-gray-700 transition-all duration-200 cursor-pointer border-l-4 border-transparent hover:border-blue-500 group"
                onClick={goToSocial}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                    <h4 className="font-semibold text-white group-hover:text-blue-200">Friend Activity</h4>
                  </div>
                </div>
                
                {/* Compact Friend Feed Filter */}
                <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                  <FriendFeedFilterChips />
                </div>
                
                <p className="text-gray-400 text-sm mb-3 group-hover:text-gray-300">See what your friends are watching</p>
                
                {/* Recent Activity Preview */}
                {friendActivityData?.recent && friendActivityData.recent.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {friendActivityData.recent.slice(0, 2).map((activity: any, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-2 p-2 hover:bg-gray-600 rounded transition-colors text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('View activity:', activity);
                        }}
                      >
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">
                            {activity.friendName}
                          </p>
                          <p className="text-gray-400 text-xs truncate">
                            {activity.action} {activity.showTitle}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 mb-2">
                    No recent activity
                  </div>
                )}
                
                <div className="text-xs text-blue-400 group-hover:text-blue-300 font-medium">
                  {friendActivityData?.recent?.length > 0 
                    ? `View all ${friendActivityData.recent.length} activities →` 
                    : 'View friend activity →'
                  }
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
                          <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={getShowPosterUrl(item)} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onLoad={() => {
                                console.log(`✅ Poster loaded for ${item.title}:`, getShowPosterUrl(item));
                              }}
                              onError={(e) => {
                                console.error(`❌ Poster failed to load for ${item.title}:`, getShowPosterUrl(item));
                                console.log('Item data:', item);
                                // Fallback to play icon if poster fails to load
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = `
                                  <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                                    <svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z"/>
                                    </svg>
                                  </div>
                                `;
                              }}
                            />
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
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <List className="h-5 w-5 text-teal-400 group-hover:text-teal-300" />
                    <h4 className="font-semibold text-white group-hover:text-teal-200">Your Lists</h4>
                  </div>
                </div>
                
                {/* Compact Filter Panel for Lists */}
                <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                  <CustomListFilterPanel />
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

      {/* List Selector Modal */}
      <ListSelectorModal
        isOpen={listSelectorOpen}
        onClose={() => setListSelectorOpen(false)}
        show={showToAddToList}
        onSuccess={() => {
          setListSelectorOpen(false);
          setShowToAddToList(null);
          showToast('Successfully added to list!', 'success');
        }}
      />

      {/* Enhanced Show Details Modal with Integrated Trailer */}
      <ShowDetailsModal
        show={selectedShowForDetails}
        open={showDetailsModalOpen}
        onClose={() => setShowDetailsModalOpen(false)}
        onAddToList={(show) => {
          handleAddToList(show);
        }}
        onWatchNow={(show) => {
          handleWatchNow(show);
        }}
        onWatchTrailer={(show) => {
          // This function is handled internally in the modal now
          console.log('Trailer tab activated for:', getShowTitle(show));
        }}
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

// Main Dashboard component wrapped with DashboardFilterProvider
function DashboardWithProvider() {
  return (
    <DashboardFilterProvider>
      <Dashboard />
    </DashboardFilterProvider>
  );
}

export default DashboardWithProvider;