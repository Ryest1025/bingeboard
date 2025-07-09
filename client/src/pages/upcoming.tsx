import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Star, Play, Bell, BellRing } from "lucide-react";
import { TopNav } from "@/components/top-nav";
import MobileNav from "@/components/mobile-nav";

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
}

export default function Upcoming() {
  const { data: upcomingReleases = [], isLoading } = useQuery({
    queryKey: ["/api/upcoming"],
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
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${showTitle} - New ${release.type}`)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(`New ${release.type} of ${showTitle} releases today!`)}&location=Streaming`;
    
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
                  .map((release: UpcomingRelease) => (
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
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-white">{release.title}</h3>
                              <Badge variant="outline" className="text-teal-400 border-teal-400">
                                {release.type}
                              </Badge>
                            </div>
                            
                            {release.overview && (
                              <p className="text-gray-400 text-sm line-clamp-2">{release.overview}</p>
                            )}
                            
                            <div className="flex items-center justify-between">
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
                              
                              <Button variant="outline" size="sm" className="border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white">
                                <Bell className="w-4 h-4 mr-1" />
                                Remind Me
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                  .map((release: UpcomingRelease) => (
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
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-white">{release.title}</h3>
                              <Badge variant="outline" className="text-teal-400 border-teal-400">
                                {release.type}
                              </Badge>
                            </div>
                            
                            {release.overview && (
                              <p className="text-gray-400 text-sm line-clamp-2">{release.overview}</p>
                            )}
                            
                            <div className="flex items-center justify-between">
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
                              
                              <Button variant="outline" size="sm" className="border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white">
                                <Bell className="w-4 h-4 mr-1" />
                                Remind Me
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                  .map((release: UpcomingRelease) => (
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
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-white">{release.title}</h3>
                              <Badge variant="outline" className="text-teal-400 border-teal-400">
                                {release.type}
                              </Badge>
                            </div>
                            
                            {release.overview && (
                              <p className="text-gray-400 text-sm line-clamp-2">{release.overview}</p>
                            )}
                            
                            <div className="flex items-center justify-between">
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
                              
                              <Button variant="outline" size="sm" className="border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white">
                                <Bell className="w-4 h-4 mr-1" />
                                Remind Me
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {releases.length === 0 && (
            <div className="text-center py-12 space-y-4">
              <Clock className="w-16 h-16 text-gray-600 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">No Upcoming Releases</h3>
                <p className="text-gray-400">
                  Add shows to your watchlist to see upcoming episodes and seasons here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}