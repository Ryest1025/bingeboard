import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Star, Play, Bell, BellRing } from "lucide-react";
import { TopNav } from "@/components/top-nav";
import MobileNav from "@/components/mobile-nav";
import StreamingLogos from "@/components/streaming-logos";

interface UpcomingRelease {
  id: number;
  title: string;
  overview?: string;
  posterPath?: string;
  releaseDate: string;
  type: 'episode' | 'season' | 'movie' | 'series';
  releaseType?: string;
  network?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  seasonInfo?: {
    seasonNumber: number;
    totalSeasons: number;
    episodeCount: number;
  };
  streamingProviders?: Array<{
    provider_id: number;
    provider_name: string;
    logo_path?: string;
  }>;
}

export default function UpcomingEnhanced() {
  const { data: upcomingReleases = [], isLoading } = useQuery({
    queryKey: ["/api/upcoming-releases"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const releases = Array.isArray(upcomingReleases) ? upcomingReleases : [];

  // Handle adding calendar reminders for upcoming shows
  const handleAddCalendarReminder = (release: UpcomingRelease) => {
    const releaseDate = new Date(release.releaseDate);
    const showTitle = release.title;
    
    // Create calendar event URL (Google Calendar)
    const startDate = releaseDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(releaseDate.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const eventTitle = release.seasonInfo 
      ? `${showTitle} - Season ${release.seasonInfo.seasonNumber} Premiere`
      : `${showTitle} - New ${release.type}`;
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(`New ${release.type} of ${showTitle} releases today!`)}&location=Streaming`;
    
    window.open(calendarUrl, '_blank');
    console.log("Opening calendar reminder for:", showTitle);
  };

  // Handle text notification opt-in for upcoming shows
  const handleTextReminders = async (release: UpcomingRelease) => {
    const showTitle = release.title;
    
    try {
      // Add to release reminders in database
      const response = await fetch('/api/release-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId: release.id,
          tmdbId: release.id,
          title: showTitle,
          releaseDate: release.releaseDate,
          notificationMethods: ['push', 'email'] // Can add SMS later
        })
      });
      
      if (response.ok) {
        console.log("Text reminders enabled for:", showTitle);
        // Could show a toast notification here
      }
    } catch (error) {
      console.error("Error setting up text reminders:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const releaseDate = new Date(dateString);
    return today.toDateString() === releaseDate.toDateString();
  };

  const isThisWeek = (dateString: string) => {
    const today = new Date();
    const releaseDate = new Date(dateString);
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return releaseDate >= today && releaseDate <= weekFromNow;
  };

  const renderReleaseCard = (release: UpcomingRelease) => (
    <Card key={release.id} className="bg-gray-900 border-gray-800 hover:border-teal-500 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-24 bg-gray-700 rounded-lg flex items-center justify-center">
            {release.posterPath ? (
              <img
                src={`https://image.tmdb.org/t/p/w200${release.posterPath}`}
                alt={release.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Play className="w-6 h-6 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-white">{release.title}</h3>
                {release.seasonInfo && (
                  <p className="text-sm text-teal-400">
                    Season {release.seasonInfo.seasonNumber} 
                    {release.seasonInfo.episodeCount && ` • ${release.seasonInfo.episodeCount} Episodes`}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Badge variant="outline" className="text-teal-400 border-teal-400">
                  {release.seasonInfo ? 'New Season' : (release.type || 'Series')}
                </Badge>
                {release.seasonInfo && release.seasonInfo.totalSeasons > 1 && (
                  <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 text-xs">
                    {release.seasonInfo.totalSeasons} Seasons Total
                  </Badge>
                )}
              </div>
            </div>
            
            {release.overview && (
              <p className="text-gray-400 text-sm line-clamp-2">{release.overview}</p>
            )}
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(release.releaseDate)}
                </span>
                {release.network && (
                  <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                    {release.network}
                  </Badge>
                )}
              </div>
              
              {release.streamingProviders && release.streamingProviders.length > 0 && (
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 mr-2">Available on:</span>
                  <StreamingLogos providers={release.streamingProviders} size="sm" maxDisplayed={3} />
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white"
                  onClick={() => handleAddCalendarReminder(release)}
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Calendar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
                  onClick={() => handleTextReminders(release)}
                >
                  <Bell className="w-4 h-4 mr-1" />
                  Notify
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <TopNav />
        <div className="pt-20 p-4 pb-24">
          <div className="container mx-auto max-w-4xl">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-white">Upcoming Releases</h1>
                <p className="text-gray-400">Stay up to date with new episodes and seasons</p>
              </div>
              
              {/* Loading skeleton */}
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-gray-900 border-gray-800 animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        <div className="w-16 h-24 bg-gray-700 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopNav />
      
      <div className="pt-20 p-4 pb-24">
        <div className="container mx-auto max-w-4xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">Upcoming Releases</h1>
            <p className="text-gray-400">Stay up to date with new episodes and seasons</p>
          </div>

          {/* Today's Releases */}
          {releases.filter((release: UpcomingRelease) => isToday(release.releaseDate)).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-teal-400" />
                Today
              </h2>
              <div className="space-y-3">
                {releases
                  .filter((release: UpcomingRelease) => isToday(release.releaseDate))
                  .map(renderReleaseCard)}
              </div>
            </div>
          )}

          {/* This Week's Releases */}
          {releases.filter((release: UpcomingRelease) => isThisWeek(release.releaseDate) && !isToday(release.releaseDate)).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-teal-400" />
                This Week
              </h2>
              <div className="space-y-3">
                {releases
                  .filter((release: UpcomingRelease) => isThisWeek(release.releaseDate) && !isToday(release.releaseDate))
                  .map(renderReleaseCard)}
              </div>
            </div>
          )}

          {/* Later Releases */}
          {releases.filter((release: UpcomingRelease) => !isThisWeek(release.releaseDate)).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Star className="w-5 h-5 mr-2 text-teal-400" />
                Coming Soon
              </h2>
              <div className="space-y-3">
                {releases
                  .filter((release: UpcomingRelease) => !isThisWeek(release.releaseDate))
                  .slice(0, 10)
                  .map(renderReleaseCard)}
              </div>
            </div>
          )}

          {releases.length === 0 && (
            <div className="text-center space-y-4 py-12">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-white">No Upcoming Releases</h3>
                <p className="text-gray-400">Check back later for new content announcements</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}