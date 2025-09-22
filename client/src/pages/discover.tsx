import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationHeader from '@/components/navigation-header';
import { EnhancedShowCard } from '@/components/EnhancedShowCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Star, 
  Calendar, 
  Bell, 
  Trophy, 
  Sparkles, 
  TrendingUp,
  Heart,
  Laugh,
  Zap,
  Users,
  Clock,
  Filter,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Wifi
} from 'lucide-react';
import { normalizeMediaBatch } from '@/utils/normalizeMedia';
import { filterMedia } from '@/utils/filterMedia';
import type { NormalizedMedia, RawMedia, MediaFilters, StreamingPlatform } from '@/types/media';
import { MediaBadgeGroup, CompactMediaInfo } from '@/components/media/MediaBadges';

// Mood filters configuration
const MOOD_FILTERS = [
  { id: 'funny', label: 'Funny', icon: Laugh, color: 'bg-yellow-500', genres: [35] }, // Comedy
  { id: 'dramatic', label: 'Dramatic', icon: Heart, color: 'bg-red-500', genres: [18] }, // Drama
  { id: 'thriller', label: 'Thriller', icon: Zap, color: 'bg-purple-500', genres: [53] }, // Thriller
  { id: 'action', label: 'Action', icon: TrendingUp, color: 'bg-orange-500', genres: [28] }, // Action
  { id: 'mystery', label: 'Mystery', icon: Sparkles, color: 'bg-indigo-500', genres: [9648] }, // Mystery
];

// Streaming platform quick filters
const STREAMING_PLATFORMS = [
  { id: 'netflix', name: 'Netflix', color: 'bg-red-600' },
  { id: 'disney', name: 'Disney+', color: 'bg-blue-600' },
  { id: 'prime', name: 'Amazon Prime Video', color: 'bg-blue-500' },
  { id: 'hbo', name: 'HBO Max', color: 'bg-purple-600' },
  { id: 'hulu', name: 'Hulu', color: 'bg-green-600' },
  { id: 'apple', name: 'Apple TV+', color: 'bg-gray-700' },
];

interface Show {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  genre_ids?: number[];
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv';
  streaming_platforms?: StreamingPlatform[];
}

// Section wrapper component
const Section: React.FC<{
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}> = ({ title, children, action }) => (
  <section className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
    {children}
  </section>
);

// Hero Carousel Component
const HeroCarousel: React.FC<{ shows: Show[] }> = ({ shows }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const featuredShow = shows?.[currentIndex];

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoRotating || !shows?.length || shows.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % shows.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [shows?.length, isAutoRotating]);

  const nextSlide = () => {
    if (!shows?.length) return;
    setIsAutoRotating(false);
    setCurrentIndex((prev) => (prev + 1) % shows.length);
  };

  const prevSlide = () => {
    if (!shows?.length) return;
    setIsAutoRotating(false);
    setCurrentIndex((prev) => (prev - 1 + shows.length) % shows.length);
  };

  if (!featuredShow) {
    return (
      <div className="relative h-96 bg-slate-800 rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div 
      className="relative h-96 bg-slate-800 rounded-lg overflow-hidden group"
      onMouseEnter={() => setIsAutoRotating(false)}
      onMouseLeave={() => setIsAutoRotating(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {featuredShow.backdrop_path && (
            <img
              src={`https://image.tmdb.org/t/p/w1280${featuredShow.backdrop_path}`}
              alt={featuredShow.title || featuredShow.name}
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {shows.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Slide Indicators */}
      {shows.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {shows.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoRotating(false);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent">
        <motion.div
          key={`content-${currentIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute bottom-8 left-8 max-w-lg"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            {featuredShow.title || featuredShow.name}
          </h1>
          {featuredShow.overview && (
            <p className="text-lg text-gray-200 mb-6 line-clamp-3">
              {featuredShow.overview}
            </p>
          )}
          <div className="flex items-center gap-3">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200">
              <Play className="w-5 h-5 mr-2" />
              Watch Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Bell className="w-5 h-5 mr-2" />
              Add to Watchlist
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Live Sports Section
const LiveSportsSection: React.FC<{ games: any[] }> = ({ games }) => {
  if (!games?.length) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {games.map((game, index) => (
        <Card key={index} className="min-w-64 bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="text-red-400 border-red-400">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-1 animate-pulse" />
                LIVE
              </Badge>
              <span className="text-sm text-slate-400">{game.league}</span>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-white">
                {game.homeTeam} vs {game.awayTeam}
              </div>
              {game.score && (
                <div className="text-2xl font-bold text-green-400 mt-1">
                  {game.score}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Mood Filter Component
const MoodFilter: React.FC<{ onMoodSelect: (mood: string) => void; selectedMood?: string }> = ({ 
  onMoodSelect, 
  selectedMood 
}) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {MOOD_FILTERS.map((mood) => {
        const Icon = mood.icon;
        const isSelected = selectedMood === mood.id;
        
        return (
          <Button
            key={mood.id}
            variant={isSelected ? "default" : "outline"}
            size="lg"
            onClick={() => onMoodSelect(mood.id)}
            className={`min-w-fit ${isSelected ? mood.color : 'border-slate-600 text-slate-300 hover:bg-slate-700'}`}
          >
            <Icon className="w-5 h-5 mr-2" />
            {mood.label}
          </Button>
        );
      })}
    </div>
  );
};

// Streaming Filter Bar Component
const StreamingFilterBar: React.FC<{ 
  onPlatformSelect: (platform: string) => void; 
  selectedPlatform?: string 
}> = ({ onPlatformSelect, selectedPlatform }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button
        variant={!selectedPlatform ? "default" : "outline"}
        size="sm"
        onClick={() => onPlatformSelect('')}
        className="min-w-fit"
      >
        All Platforms
      </Button>
      {STREAMING_PLATFORMS.map((platform) => (
        <Button
          key={platform.id}
          variant={selectedPlatform === platform.id ? "default" : "outline"}
          size="sm"
          onClick={() => onPlatformSelect(platform.id)}
          className={`min-w-fit ${selectedPlatform === platform.id ? platform.color : 'border-slate-600 text-slate-300 hover:bg-slate-700'}`}
        >
          {platform.name}
        </Button>
      ))}
    </div>
  );
};

// Reminder Badge Component
const ReminderBadge: React.FC<{ releaseDate: string }> = ({ releaseDate }) => {
  const date = new Date(releaseDate);
  const isUpcoming = date > new Date();
  
  if (!isUpcoming) return null;

  return (
    <Badge variant="outline" className="text-blue-400 border-blue-400 absolute top-2 right-2">
      <Calendar className="w-3 h-3 mr-1" />
      {date.toLocaleDateString()}
    </Badge>
  );
};

// Continue Watching Carousel
const ContinueWatchingCarousel: React.FC<{ shows: any[] }> = ({ shows }) => {
  if (!shows?.length) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {shows.map((show) => (
        <Card key={show.id} className="min-w-64 bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex gap-3">
              {show.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w92${show.poster_path}`}
                  alt={show.title}
                  className="w-16 h-24 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">{show.title}</h4>
                <p className="text-sm text-slate-400 mb-2">S{show.season}E{show.episode}</p>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${show.progress || 30}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{show.progress || 30}% complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Social Activity Feed
const SocialActivityFeed: React.FC<{ activities: any[] }> = ({ activities }) => {
  if (!activities?.length) return null;

  return (
    <div className="space-y-3">
      {activities.slice(0, 5).map((activity, index) => (
        <Card key={index} className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">
                  <span className="font-semibold">{activity.friendName}</span> {activity.action}
                  <span className="font-semibold"> {activity.showTitle}</span>
                </p>
                <p className="text-xs text-slate-400">{activity.timestamp}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Error Display Component
const ErrorCard: React.FC<{ error: Error | null; title: string; retry?: () => void }> = ({ 
  error, 
  title, 
  retry 
}) => {
  if (!error) return null;

  return (
    <Alert className="border-red-500/50 bg-red-500/10">
      <AlertTriangle className="h-4 w-4 text-red-400" />
      <AlertDescription className="text-red-200">
        <div className="flex items-center justify-between">
          <span>Failed to load {title.toLowerCase()}</span>
          {retry && (
            <Button
              variant="outline"
              size="sm"
              onClick={retry}
              className="ml-2 border-red-500/50 text-red-200 hover:bg-red-500/20"
            >
              Try Again
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

// View All Navigation Handler
const handleViewAll = (section: string) => {
  // For now, just log the action - could navigate to dedicated pages
  console.log(`Navigate to ${section} page`);
  // Future: navigate(`/${section.toLowerCase().replace(' ', '-')}`);
};

const DiscoverPage: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string>();
  const [selectedPlatform, setSelectedPlatform] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  // Data fetching with React Query
  const { data: trendingData, isLoading: trendingLoading, error: trendingError } = useQuery({
    queryKey: ['trending', 'tv', 'day'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/trending/tv/day?includeStreaming=true');
        if (!response.ok) throw new Error('Failed to fetch trending content');
        return response.json();
      } catch (error) {
        console.error('Trending API error:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: awardsData, isLoading: awardsLoading, error: awardsError } = useQuery({
    queryKey: ['awards-content'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/tmdb/awards-content');
        if (!response.ok) throw new Error('Failed to fetch awards content');
        return response.json();
      } catch (error) {
        console.error('Awards API error:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: upcomingData, isLoading: upcomingLoading, error: upcomingError } = useQuery({
    queryKey: ['upcoming'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/trending/movie/week');
        if (!response.ok) throw new Error('Failed to fetch upcoming content');
        return response.json();
      } catch (error) {
        console.error('Upcoming API error:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const { data: personalizedData, isLoading: personalizedLoading, error: personalizedError } = useQuery({
    queryKey: ['recommendations', 'personalized'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/recommendations/personalized?includeStreaming=true');
        if (!response.ok) throw new Error('Failed to fetch personalized recommendations');
        return response.json();
      } catch (error) {
        console.error('Personalized API error:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: continueWatchingData, error: continueWatchingError } = useQuery({
    queryKey: ['continue-watching'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/user/continue-watching');
        if (!response.ok) throw new Error('Failed to fetch continue watching');
        return response.json();
      } catch (error) {
        console.error('Continue watching API error:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: socialData, error: socialError } = useQuery({
    queryKey: ['social-activity'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/social/activity');
        if (!response.ok) throw new Error('Failed to fetch social activity');
        return response.json();
      } catch (error) {
        console.error('Social API error:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // User preferences for sports
  const { data: userPreferences } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      const response = await fetch('/api/user/preferences');
      if (!response.ok) throw new Error('Failed to fetch user preferences');
      return response.json();
    }
  });

  // Live Sports data (conditional on user preferences)
  const { data: liveGamesData } = useQuery({
    queryKey: ['live-sports'],
    queryFn: async () => {
      const response = await fetch('/api/sports/live');
      if (!response.ok) throw new Error('Failed to fetch live sports');
      return response.json();
    },
    enabled: !!userPreferences?.sportsEnabled && !!userPreferences?.favoriteTeams?.length
  });

  // Process data through our universal media system
  const processedData = useMemo(() => {
    const rawTrending = trendingData?.results || [];
    const rawAwards = awardsData?.results || [];
    const rawUpcoming = upcomingData?.results || [];
    const rawRecommendations = personalizedData?.recommendations || [];

    // Apply universal normalization
    const normalizedTrending = normalizeMediaBatch(rawTrending.slice(0, 12));
    const normalizedAwards = normalizeMediaBatch(rawAwards.slice(0, 12));
    const normalizedUpcoming = normalizeMediaBatch(rawUpcoming.slice(0, 12));
    const normalizedRecommendations = normalizeMediaBatch(rawRecommendations.slice(0, 12));

    // Apply filters
    let filters: MediaFilters = {};
    
    if (selectedPlatform) {
      const platformName = STREAMING_PLATFORMS.find(p => p.id === selectedPlatform)?.name;
      if (platformName) {
        filters.network = platformName;
      }
    }

    if (selectedMood) {
      const moodConfig = MOOD_FILTERS.find(m => m.id === selectedMood);
      if (moodConfig?.genres?.[0]) {
        filters.genre = moodConfig.genres[0];
      }
    }

    const filteredTrending = Object.keys(filters).length > 0 
      ? filterMedia(normalizedTrending, filters).items 
      : normalizedTrending;

    return {
      trending: filteredTrending,
      awards: normalizedAwards,
      upcoming: normalizedUpcoming,
      recommendations: normalizedRecommendations,
      hiddenGems: normalizedRecommendations.slice(6, 12), // Use subset as hidden gems
    };
  }, [trendingData, awardsData, upcomingData, personalizedData, selectedPlatform, selectedMood]);

  // Convert NormalizedMedia to Show format for EnhancedShowCard
  const convertToShowFormat = (normalizedShow: NormalizedMedia): Show => ({
    id: normalizedShow.id,
    title: normalizedShow.type === 'movie' ? normalizedShow.title : undefined,
    name: normalizedShow.type === 'tv' ? normalizedShow.title : undefined,
    poster_path: normalizedShow.poster_path,
    backdrop_path: normalizedShow.backdrop_path,
    vote_average: normalizedShow.vote_average,
    genre_ids: normalizedShow.genre_ids,
    overview: normalizedShow.overview,
    release_date: normalizedShow.type === 'movie' ? normalizedShow.release_date : undefined,
    first_air_date: normalizedShow.type === 'tv' ? normalizedShow.release_date : undefined,
    media_type: normalizedShow.type === 'sports' ? 'tv' : normalizedShow.type as 'movie' | 'tv',
    streaming_platforms: normalizedShow.streaming?.map(platform => ({
      provider_id: platform.provider_id,
      provider_name: platform.provider_name,
      name: platform.provider_name,
      logo_path: platform.logo_path
    })) || []
  });

  const handleAddToWatchlist = async (show: Show) => {
    try {
      const response = await fetch('/api/watchlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tmdbId: show.id,
          title: show.title || show.name,
          type: show.media_type || 'movie'
        })
      });
      if (!response.ok) throw new Error('Failed to add to watchlist');
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const handleShowClick = (show: Show) => {
    // Handle show details modal or navigation
    console.log('Show clicked:', show);
  };

  // Check for multiple errors to show connection issues
  const hasConnectionIssues = trendingError && awardsError && personalizedError;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="px-4 md:px-8 lg:px-16 space-y-12 py-8">
        {/* Navigation */}
        <NavigationHeader />

        {/* Connection Issues Alert */}
        {hasConnectionIssues && (
          <Alert className="border-orange-500/50 bg-orange-500/10">
            <Wifi className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-orange-200">
              Having trouble connecting to our servers. Some content may not be available.
            </AlertDescription>
          </Alert>
        )}

        {/* Hero / Featured Carousel */}
        <HeroCarousel shows={processedData.trending.slice(0, 5).map(convertToShowFormat)} />

        {/* Streaming Platform Filter Bar */}
        <StreamingFilterBar 
          onPlatformSelect={setSelectedPlatform}
          selectedPlatform={selectedPlatform}
        />

        {/* Trending Now */}
        <Section 
          title="Trending Now" 
          action={
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-400 hover:text-white"
              onClick={() => handleViewAll('trending')}
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          }
        >
          <ErrorCard error={trendingError as Error} title="Trending Content" />
          {trendingLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {processedData.trending.map((show) => (
                <div key={show.id} className="relative">
                  <EnhancedShowCard
                    show={convertToShowFormat(show)}
                    onAddToWatchlist={handleAddToWatchlist}
                    onCardClick={handleShowClick}
                    variant="compact"
                  />
                  {show.isUpcoming && show.release_date && (
                    <ReminderBadge releaseDate={show.release_date} />
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Award Season Highlights */}
        <Section 
          title="Award Season Highlights"
          action={
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-400 hover:text-white"
              onClick={() => handleViewAll('awards')}
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          }
        >
          <ErrorCard error={awardsError as Error} title="Award Content" />
          {awardsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {processedData.awards.map((show) => (
                <div key={show.id} className="relative">
                  <EnhancedShowCard
                    show={convertToShowFormat(show)}
                    onAddToWatchlist={handleAddToWatchlist}
                    onCardClick={handleShowClick}
                    variant="award"
                  />
                  {show.isUpcoming && show.release_date && (
                    <ReminderBadge releaseDate={show.release_date} />
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Live Sports (conditional on user preferences) */}
        {userPreferences?.sportsEnabled && liveGamesData?.games?.length > 0 && (
          <Section title="Live Sports">
            <LiveSportsSection games={liveGamesData.games} />
          </Section>
        )}

        {/* Mood-Based Picks */}
        <Section title="Pick Your Mood">
          <MoodFilter 
            onMoodSelect={setSelectedMood}
            selectedMood={selectedMood}
          />
        </Section>

        {/* AI Recommendations */}
        <Section 
          title="Recommended for You"
          action={
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-400 hover:text-white"
              onClick={() => handleViewAll('recommendations')}
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          }
        >
          <ErrorCard error={personalizedError as Error} title="Personalized Recommendations" />
          {personalizedLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {processedData.recommendations.map((show) => (
                <div key={show.id} className="relative">
                  <EnhancedShowCard
                    show={convertToShowFormat(show)}
                    onAddToWatchlist={handleAddToWatchlist}
                    onCardClick={handleShowClick}
                    variant="detailed"
                  />
                  {show.isUpcoming && show.release_date && (
                    <ReminderBadge releaseDate={show.release_date} />
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Hidden Gems */}
        <Section 
          title="Hidden Gems"
          action={
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-400 hover:text-white"
              onClick={() => handleViewAll('hidden-gems')}
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          }
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {processedData.hiddenGems.map((show) => (
              <div key={show.id} className="relative">
                <EnhancedShowCard
                  show={convertToShowFormat(show)}
                  onAddToWatchlist={handleAddToWatchlist}
                  onCardClick={handleShowClick}
                  variant="compact"
                />
                {show.isUpcoming && show.release_date && (
                  <ReminderBadge releaseDate={show.release_date} />
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* Continue Watching */}
        {(continueWatchingData?.items?.length > 0 || continueWatchingError) && (
          <Section title="Continue Watching">
            <ErrorCard error={continueWatchingError as Error} title="Continue Watching" />
            {continueWatchingData?.items?.length > 0 && (
              <ContinueWatchingCarousel shows={continueWatchingData.items} />
            )}
          </Section>
        )}

        {/* Social Activity */}
        {(socialData?.length > 0 || socialError) && (
          <Section title="Friends Are Watching">
            <ErrorCard error={socialError as Error} title="Social Activity" />
            {socialData?.length > 0 && (
              <SocialActivityFeed activities={socialData} />
            )}
          </Section>
        )}

        {/* Live Sports would go here if user has sports enabled */}
        {/* This would be conditionally rendered based on user preferences */}
      </div>
    </div>
  );
};

export default DiscoverPage;