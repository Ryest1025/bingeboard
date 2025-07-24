import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopNav } from "@/components/top-nav";
import MobileNav from "@/components/mobile-nav";
import { HorizontalScrollContainer } from "@/components/ui/HorizontalScrollContainer";
import { ContentCard } from "@/components/ui/ContentCard";
import { StreamingLogos } from "@/components/ui/StreamingLogos";
import { StreamingPlatformSelector as UniversalStreamingPlatformSelector } from "@/components/ui/StreamingPlatformSelector";
import { 
  User, 
  Settings, 
  Share, 
  Trophy, 
  Calendar, 
  Clock, 
  Star, 
  TrendingUp,
  Eye,
  Heart,
  Play,
  Target,
  Award,
  Flame,
  Zap,
  Crown,
  QrCode,
  Edit,
  Camera,
  ExternalLink,
  BarChart3,
  Activity,
  Users,
  BookOpen,
  Gamepad2,
  CheckCircle
} from "lucide-react";

interface UserStats {
  totalHoursWatched: number;
  showsCompleted: number;
  currentlyWatching: number;
  averageRating: number;
  streakDays: number;
  favoriteGenre: string;
  topShow: string;
  monthlyGoal: number;
  monthlyProgress: number;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface PersonalityType {
  type: "Binge Master" | "Genre Explorer" | "Quality Curator" | "Social Viewer" | "Weekend Warrior";
  description: string;
  traits: string[];
  color: string;
}

export default function ModernProfile() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - replace with real API calls
  const userStats: UserStats = {
    totalHoursWatched: 342,
    showsCompleted: 84,
    currentlyWatching: 12,
    averageRating: 4.2,
    streakDays: 15,
    favoriteGenre: "Drama",
    topShow: "Breaking Bad",
    monthlyGoal: 10,
    monthlyProgress: 7
  };

  const achievements: Achievement[] = [
    {
      id: 1,
      title: "Binge Master",
      description: "Watch 5 episodes in a single day",
      icon: "🔥",
      earned: true,
      earnedDate: "2024-01-15",
      rarity: "common"
    },
    {
      id: 2,
      title: "Genre Explorer",
      description: "Complete shows from 10 different genres",
      icon: "🗺️",
      earned: true,
      earnedDate: "2024-01-20",
      rarity: "rare"
    },
    {
      id: 3,
      title: "Marathon Runner",
      description: "Watch an entire season in one sitting",
      icon: "🏃",
      earned: false,
      rarity: "epic"
    },
    {
      id: 4,
      title: "Quality Curator",
      description: "Rate 50 shows with 4+ stars",
      icon: "⭐",
      earned: true,
      earnedDate: "2024-01-10",
      rarity: "rare"
    },
    {
      id: 5,
      title: "Social Butterfly",
      description: "Make 25 recommendations to friends",
      icon: "🦋",
      earned: false,
      rarity: "legendary"
    }
  ];

  const personalityType: PersonalityType = {
    type: "Quality Curator",
    description: "You prefer high-quality shows with excellent writing and character development over quantity.",
    traits: ["Selective viewer", "High standards", "Thoughtful ratings", "Prefers critically acclaimed content"],
    color: "bg-purple-500"
  };

  const recentActivity = [
    {
      id: 1,
      action: "Completed",
      show: "The Bear",
      date: "2 days ago",
      rating: 5
    },
    {
      id: 2,
      action: "Added to watchlist",
      show: "Severance",
      date: "3 days ago"
    },
    {
      id: 3,
      action: "Rated",
      show: "Wednesday",
      date: "1 week ago",
      rating: 4
    }
  ];

  const favoriteShows = [
    { title: "Breaking Bad", rating: 5, genre: "Crime Drama" },
    { title: "The Sopranos", rating: 5, genre: "Crime Drama" },
    { title: "The Wire", rating: 5, genre: "Crime Drama" },
    { title: "Mad Men", rating: 5, genre: "Period Drama" }
  ];

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "rare":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "epic":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "legendary":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(228,25%,3%)] via-[hsl(226,22%,6%)] to-[hsl(224,20%,8%)] flex items-center justify-center p-4">
        <Card className="glass-effect border-slate-700 max-w-md mx-auto">
          <CardContent className="p-8 text-center space-y-4">
            <User className="h-16 w-16 text-teal-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Your Personal Hub</h2>
            <p className="text-gray-300">
              Track your viewing stats, earn achievements, and showcase your entertainment personality.
            </p>
            <Button asChild className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
              <Link href="/api/login">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopNav />
      
      <div className="pt-20 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          

          {/* Profile Header */}
          <div className="mb-6">
            <Card className="glass-effect border-slate-700/50">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="relative mx-auto sm:mx-0">
                    <Avatar className="h-20 w-20 md:h-24 md:w-24">
                      <AvatarFallback className="bg-teal-500/20 text-teal-400 text-xl md:text-2xl">
                        {user?.firstName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <Button size="sm" className="absolute -bottom-1 -right-1 h-6 w-6 md:h-8 md:w-8 rounded-full bg-slate-700 hover:bg-slate-600 p-0">
                      <Camera className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 space-y-3 text-center sm:text-left">
                    <div>
                      <h1 className="text-xl md:text-2xl font-bold text-white">
                        {user?.firstName || "User"} {user?.lastName || ""}
                      </h1>
                      <p className="text-gray-400 text-sm">@{(user?.firstName || "User")}</p>
                      <p className="text-gray-300 mt-1 text-sm">
                        Quality over quantity • Drama enthusiast • {userStats.showsCompleted} shows completed
                      </p>
                    </div>
                    
                    {/* Personality Type */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <div className={`${personalityType.color} w-2 h-2 rounded-full`}></div>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        {personalityType.type}
                      </Badge>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                        <Flame className="h-3 w-3 mr-1" />
                        {userStats.streakDays} day streak
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <Button size="sm" className="bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 border-teal-500/50 text-xs">
                        <Share className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700 text-xs">
                        <QrCode className="h-3 w-3 mr-1" />
                        QR
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700 text-xs">
                        <Settings className="h-3 w-3 mr-1" />
                        Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="overview" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 text-xs md:text-sm">
                <BarChart3 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 text-xs md:text-sm">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Stats</span>
                <span className="sm:hidden">Data</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 text-xs md:text-sm">
                <Trophy className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Achievements</span>
                <span className="sm:hidden">Awards</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 text-xs md:text-sm">
                <Activity className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Activity</span>
                <span className="sm:hidden">Feed</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-4 space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="glass-effect border-slate-700/50">
                  <CardContent className="p-3 text-center">
                    <div className="text-xl md:text-2xl font-bold text-teal-400">{userStats.totalHoursWatched}h</div>
                    <div className="text-xs md:text-sm text-gray-400">Total Hours</div>
                  </CardContent>
                </Card>
                <Card className="glass-effect border-slate-700/50">
                  <CardContent className="p-3 text-center">
                    <div className="text-xl md:text-2xl font-bold text-green-400">{userStats.showsCompleted}</div>
                    <div className="text-xs md:text-sm text-gray-400">Completed</div>
                  </CardContent>
                </Card>
                <Card className="glass-effect border-slate-700/50">
                  <CardContent className="p-3 text-center">
                    <div className="text-xl md:text-2xl font-bold text-blue-400">{userStats.currentlyWatching}</div>
                    <div className="text-xs md:text-sm text-gray-400">Watching</div>
                  </CardContent>
                </Card>
                <Card className="glass-effect border-slate-700/50">
                  <CardContent className="p-3 text-center">
                    <div className="text-xl md:text-2xl font-bold text-yellow-400">{userStats.averageRating}</div>
                    <div className="text-xs md:text-sm text-gray-400">Avg Rating</div>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Goal */}
              <Card className="glass-effect border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-400" />
                    Monthly Goal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Complete {userStats.monthlyGoal} shows this month</span>
                    <span className="text-orange-400 font-medium">
                      {userStats.monthlyProgress}/{userStats.monthlyGoal}
                    </span>
                  </div>
                  <Progress 
                    value={(userStats.monthlyProgress / userStats.monthlyGoal) * 100} 
                    className="h-3 bg-slate-700"
                  />
                  <p className="text-sm text-gray-400">
                    {userStats.monthlyGoal - userStats.monthlyProgress} shows to go!
                  </p>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card className="glass-effect border-slate-700/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                      Recent Achievements
                    </CardTitle>
                    <Link href="#achievements">
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {achievements.filter(a => a.earned).slice(0, 3).map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{achievement.title}</h4>
                          <p className="text-sm text-gray-400">{achievement.description}</p>
                        </div>
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="mt-6 space-y-6">
              {/* Viewing Personality */}
              <Card className="glass-effect border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-400" />
                    Your Viewing Personality
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`${personalityType.color} w-4 h-4 rounded-full`}></div>
                    <span className="text-xl font-bold text-white">{personalityType.type}</span>
                  </div>
                  <p className="text-gray-300">{personalityType.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {personalityType.traits.map((trait, index) => (
                      <Badge key={index} className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Favorite Shows */}
              <Card className="glass-effect border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-400" />
                    Top Rated Shows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {favoriteShows.map((show, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                        <div className="w-12 h-16 bg-slate-700 rounded flex-shrink-0 flex items-center justify-center">
                          <Play className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{show.title}</h4>
                          <p className="text-sm text-gray-400">{show.genre}</p>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-medium">{show.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Genre Breakdown */}
              <Card className="glass-effect border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                    Genre Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { genre: "Drama", percentage: 45, color: "bg-blue-500" },
                    { genre: "Comedy", percentage: 25, color: "bg-green-500" },
                    { genre: "Thriller", percentage: 20, color: "bg-red-500" },
                    { genre: "Sci-Fi", percentage: 10, color: "bg-purple-500" }
                  ].map((item) => (
                    <div key={item.genre} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">{item.genre}</span>
                        <span className="text-gray-400 text-sm">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className={`${item.color} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="mt-6 space-y-6">
              <div className="grid gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className={`glass-effect border-slate-700/50 ${achievement.earned ? 'hover:border-teal-500/50' : 'opacity-60'} transition-all duration-300`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`text-3xl ${achievement.earned ? '' : 'grayscale'}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-white">{achievement.title}</h3>
                            <Badge className={getRarityColor(achievement.rarity)}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm">{achievement.description}</p>
                          {achievement.earned && achievement.earnedDate && (
                            <p className="text-xs text-teal-400 mt-1">
                              Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {achievement.earned && (
                          <CheckCircle className="h-6 w-6 text-teal-400" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-6 space-y-6">
              <Card className="glass-effect border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                          {activity.action === "Completed" && <CheckCircle className="h-5 w-5 text-green-400" />}
                          {activity.action === "Added to watchlist" && <Heart className="h-5 w-5 text-blue-400" />}
                          {activity.action === "Rated" && <Star className="h-5 w-5 text-yellow-400" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-white">
                            <span className="font-medium">{activity.action}</span> {activity.show}
                            {activity.rating && (
                              <span className="ml-2 text-yellow-400">
                                {Array.from({ length: activity.rating }, (_, i) => "⭐").join("")}
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-400">{activity.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>



        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}