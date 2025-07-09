import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, Users, Clock, Star, Play, Eye, Calendar, 
  BarChart3, Activity, Zap, Target, Award, Heart,
  ChevronRight, Plus, Filter
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

interface WatchTime {
  date: string;
  hours: number;
}

interface UserStats {
  totalShows: number;
  totalHours: number;
  averageRating: number;
  completedShows: number;
  watchingShows: number;
  plannedShows: number;
  droppedShows: number;
  weeklyHours: WatchTime[];
  monthlyHours: WatchTime[];
  topGenres: { genre: string; count: number; hours: number }[];
  recentActivity: any[];
  streakDays: number;
  personalBests: {
    mostWatchedDay: { date: string; hours: number };
    longestStreak: number;
    mostShowsInMonth: number;
    favoriteYear: string;
  };
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  color = "teal" 
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  trend?: { value: number; label: string };
  color?: string;
}) {
  const colorClasses = {
    purple: "text-purple-400 bg-purple-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    green: "text-green-400 bg-green-500/10",
    orange: "text-orange-400 bg-orange-500/10",
    pink: "text-pink-400 bg-pink-500/10",
    yellow: "text-yellow-400 bg-yellow-500/10",
    teal: "text-teal-400 bg-teal-500/10"
  };

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                <span className="text-xs text-green-400">
                  {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WatchingProgress({ watchlist }: { watchlist: any[] }) {
  const watchingShows = watchlist?.filter(item => item.status === 'watching') || [];
  
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Play className="h-5 w-5 mr-2 text-green-400" />
          Currently Watching
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {watchingShows.slice(0, 5).map((item: any) => (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img 
                  src={item.show?.posterPath ? `https://image.tmdb.org/t/p/w92${item.show.posterPath}` : "/api/placeholder/40/60"}
                  alt={item.show?.title}
                  className="w-10 h-15 object-cover rounded"
                />
                <div>
                  <p className="font-medium text-white text-sm">{item.show?.title}</p>
                  <p className="text-xs text-gray-400">
                    S{item.currentSeason} E{item.currentEpisode}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-gray-600">
                <Play className="h-3 w-3 mr-1" />
                Continue
              </Button>
            </div>
            <Progress 
              value={(item.totalEpisodesWatched / (item.show?.numberOfEpisodes || 1)) * 100} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{item.totalEpisodesWatched} / {item.show?.numberOfEpisodes || 0} episodes</span>
              <span>{Math.round((item.totalEpisodesWatched / (item.show?.numberOfEpisodes || 1)) * 100)}%</span>
            </div>
          </div>
        ))}
        
        {watchingShows.length === 0 && (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">You're not watching anything yet</p>
            <Link href="/explore">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Find Something to Watch
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GenreBreakdown({ stats }: { stats: UserStats }) {
  const totalShows = stats.topGenres?.reduce((sum, genre) => sum + genre.count, 0) || 1;
  
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
          Your Genre Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.topGenres?.slice(0, 6).map((genre, index) => (
          <div key={genre.genre} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">{genre.genre}</span>
              <div className="text-right">
                <span className="text-sm text-gray-400">{genre.count} shows</span>
                <p className="text-xs text-gray-500">{genre.hours}h watched</p>
              </div>
            </div>
            <Progress value={(genre.count / totalShows) * 100} className="h-2" />
          </div>
        )) || (
          <div className="text-center py-4">
            <p className="text-gray-400">Start watching shows to see your preferences!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivity({ activities }: { activities: any[] }) {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Activity className="h-5 w-5 mr-2 text-pink-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities?.slice(0, 8).map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-800/30">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <div className="flex-1">
              <p className="text-sm text-white">
                You {activity.activityType === 'added_to_watchlist' && 'added'}
                {activity.activityType === 'finished_show' && 'finished'}
                {activity.activityType === 'rated_show' && 'rated'}
                {activity.activityType === 'updated_progress' && 'updated progress on'}
                {activity.activityType === 'started_watching' && 'started watching'}
                <span className="text-purple-400 font-semibold"> {activity.show?.title}</span>
              </p>
              <p className="text-xs text-gray-500">
                {new Date(activity.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )) || (
          <div className="text-center py-4">
            <p className="text-gray-400">Your activity will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Achievements({ stats }: { stats: UserStats }) {
  const achievements = [
    {
      title: "First Steps",
      description: "Added your first show to watchlist",
      icon: Target,
      earned: stats.totalShows > 0,
      color: "green"
    },
    {
      title: "Binge Watcher",
      description: "Watched 24 hours in a week",
      icon: Zap,
      earned: stats.weeklyHours?.some(w => w.hours >= 24),
      color: "yellow"
    },
    {
      title: "Completionist",
      description: "Finished 10 shows",
      icon: Award,
      earned: stats.completedShows >= 10,
      color: "purple"
    },
    {
      title: "Critic",
      description: "Rated 50 shows",
      icon: Star,
      earned: stats.totalShows >= 50, // Simplified for demo
      color: "orange"
    },
    {
      title: "Social Butterfly",
      description: "Added 5 friends",
      icon: Heart,
      earned: false, // Will check friend count when available
      color: "pink"
    },
    {
      title: "Streak Master",
      description: "7-day watching streak",
      icon: Calendar,
      earned: stats.streakDays >= 7,
      color: "blue"
    }
  ];

  const earnedCount = achievements.filter(a => a.earned).length;

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-400" />
            Achievements
          </div>
          <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400">
            {earnedCount}/{achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div 
              key={achievement.title}
              className={`p-3 rounded-lg border ${
                achievement.earned 
                  ? 'bg-yellow-500/10 border-yellow-500/30' 
                  : 'bg-gray-800/30 border-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <achievement.icon className={`h-4 w-4 ${
                  achievement.earned ? 'text-yellow-400' : 'text-gray-500'
                }`} />
                <h4 className={`font-medium text-sm ${
                  achievement.earned ? 'text-white' : 'text-gray-400'
                }`}>
                  {achievement.title}
                </h4>
              </div>
              <p className={`text-xs ${
                achievement.earned ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {achievement.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: watchlist } = useQuery({
    queryKey: ['/api/watchlist', user?.id],
    enabled: !!user?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/user/stats', user?.id],
    enabled: !!user?.id,
  });

  const { data: activities } = useQuery({
    queryKey: ['/api/activity', user?.id],
    enabled: !!user?.id,
  });

  const { data: recommendations } = useQuery({
    queryKey: ['/api/recommendations', user?.id],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-800 p-8 text-center max-w-md">
          <CardContent>
            <h2 className="text-2xl font-bold text-white mb-4">Access Required</h2>
            <p className="text-gray-400 mb-6">Please sign in to view your dashboard</p>
            <Link href="/api/login">
              <Button className="bg-purple-600 hover:bg-purple-700">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const watchlistArray = Array.isArray(watchlist) ? watchlist : [];
  const userStats: UserStats = stats || {
    totalShows: watchlistArray.length,
    totalHours: 0,
    averageRating: 0,
    completedShows: watchlistArray.filter(item => item.status === 'finished').length,
    watchingShows: watchlistArray.filter(item => item.status === 'watching').length,
    plannedShows: watchlistArray.filter(item => item.status === 'want_to_watch').length,
    droppedShows: watchlistArray.filter(item => item.status === 'dropped').length,
    weeklyHours: [],
    monthlyHours: [],
    topGenres: [],
    recentActivity: [],
    streakDays: 0,
    personalBests: {
      mostWatchedDay: { date: '', hours: 0 },
      longestStreak: 0,
      mostShowsInMonth: 0,
      favoriteYear: '2024'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {user.firstName || 'there'}!
            </h1>
            <p className="text-gray-400 mt-1">
              Here's your entertainment dashboard
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href="/explore">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Shows
              </Button>
            </Link>
            <Button variant="outline" className="border-gray-600 text-gray-300">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-900/50 border-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-purple-600">
              Social
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Shows"
                value={userStats.totalShows}
                subtitle="In your library"
                icon={Eye}
                trend={{ value: 12, label: "this month" }}
                color="purple"
              />
              <StatCard
                title="Hours Watched"
                value={`${userStats.totalHours}h`}
                subtitle="Total watch time"
                icon={Clock}
                trend={{ value: 8, label: "this week" }}
                color="blue"
              />
              <StatCard
                title="Completed"
                value={userStats.completedShows}
                subtitle="Shows finished"
                icon={Award}
                color="green"
              />
              <StatCard
                title="Current Streak"
                value={`${userStats.streakDays} days`}
                subtitle="Daily watching"
                icon={Zap}
                color="orange"
              />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <WatchingProgress watchlist={watchlistArray} />
                <RecentActivity activities={activities || []} />
              </div>
              
              <div className="space-y-6">
                <GenreBreakdown stats={userStats} />
                <Achievements stats={userStats} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Watching Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-3" />
                      <p>Analytics charts coming soon</p>
                      <p className="text-sm text-gray-500">Track your viewing patterns over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Personal Bests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Most watched in a day</span>
                    <span className="text-white font-semibold">
                      {userStats.personalBests.mostWatchedDay.hours}h
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Longest streak</span>
                    <span className="text-white font-semibold">
                      {userStats.personalBests.longestStreak} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Shows added in a month</span>
                    <span className="text-white font-semibold">
                      {userStats.personalBests.mostShowsInMonth}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Favorite year</span>
                    <span className="text-white font-semibold">
                      {userStats.personalBests.favoriteYear}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    Friends Activity
                    <Link href="/friends">
                      <Button variant="ghost" size="sm">
                        View All <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 mb-4">Connect with friends to see their activity</p>
                    <Link href="/friends">
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        Find Friends
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  {recommendations && recommendations.length > 0 ? (
                    <div className="space-y-3">
                      {recommendations.slice(0, 3).map((rec: any) => (
                        <div key={rec.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-800/30">
                          <img 
                            src={rec.show?.posterPath ? `https://image.tmdb.org/t/p/w92${rec.show.posterPath}` : "/api/placeholder/40/60"}
                            alt={rec.show?.title}
                            className="w-10 h-15 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{rec.show?.title}</p>
                            <p className="text-xs text-gray-400">{rec.reason}</p>
                          </div>
                        </div>
                      ))}
                      <Link href="/recommendations">
                        <Button variant="outline" className="w-full border-gray-600 text-gray-300">
                          View All Recommendations
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 mb-4">Add more shows to get personalized recommendations</p>
                      <Link href="/explore">
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          Explore Shows
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}