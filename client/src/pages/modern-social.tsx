import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { TopNav } from "@/components/top-nav";
import MobileNav from "@/components/mobile-nav";
import { HorizontalScrollContainer } from "@/components/ui/HorizontalScrollContainer";
import { ContentCard } from "@/components/ui/ContentCard";
import { StreamingLogos } from "@/components/ui/StreamingLogos";
import { StreamingPlatformSelector as UniversalStreamingPlatformSelector } from "@/components/ui/StreamingPlatformSelector";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Star, 
  Play,
  Clock,
  Eye,
  Users,
  Send,
  ThumbsUp,
  Repeat,
  MoreHorizontal,
  Search,
  UserPlus,
  TrendingUp,
  Award,
  Flame,
  Calendar
} from "lucide-react";

interface FriendActivity {
  id: number;
  friend: {
    id: string;
    name: string;
    avatar: string;
    username?: string;
  };
  action: "watched" | "rated" | "added_to_list" | "recommended" | "commented" | "completed_season" | "started_watching";
  show: {
    id: number;
    title: string;
    posterPath: string;
    year?: number;
  };
  rating?: number;
  comment?: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface DirectMessage {
  id: number;
  friend: {
    name: string;
    avatar: string;
    isOnline: boolean;
  };
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

interface Recommendation {
  id: number;
  friend: {
    name: string;
    avatar: string;
  };
  show: {
    title: string;
    posterPath: string;
    rating: number;
  };
  message: string;
  timestamp: string;
}

export default function ModernSocial() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("activity");

  // Fetch real friend activities from API
  const { data: friendActivitiesData } = useQuery<any[]>({
    queryKey: ["/api/activities/friends"],
    staleTime: 2 * 60 * 1000,
    enabled: !!user
  });

  // Transform API data to match component interface
  const friendActivities: FriendActivity[] = friendActivitiesData?.map((activity: any) => ({
    id: activity.id,
    friend: {
      id: activity.user?.id || activity.userId,
      name: activity.user?.firstName ? `${activity.user.firstName} ${activity.user.lastName || ''}`.trim() : activity.user?.email?.split('@')[0] || 'Anonymous',
      avatar: activity.user?.profileImageUrl || '',
      username: activity.user?.email?.split('@')[0]
    },
    action: activity.action || 'watched',
    show: {
      id: activity.showId || activity.tmdbId,
      title: activity.showTitle || activity.title || 'Unknown Show',
      posterPath: activity.posterPath || '',
      year: activity.year
    },
    rating: activity.rating,
    comment: activity.comment || activity.content,
    timestamp: new Date(activity.createdAt || activity.timestamp).toLocaleString(),
    likes: activity.likes || 0,
    comments: activity.comments || 0,
    isLiked: activity.isLiked || false
  })) || [];

  // Fetch real messages and recommendations
  const { data: messagesData } = useQuery<any[]>({
    queryKey: ["/api/messages"],
    staleTime: 30 * 1000,
    enabled: !!user
  });

  const { data: recommendationsData } = useQuery<any[]>({
    queryKey: ["/api/recommendations/friends"],
    staleTime: 5 * 60 * 1000,
    enabled: !!user
  });

  const directMessages: DirectMessage[] = messagesData?.map((msg: any) => ({
    id: msg.id,
    friend: {
      name: msg.sender?.firstName ? `${msg.sender.firstName} ${msg.sender.lastName || ''}`.trim() : msg.sender?.email?.split('@')[0] || 'Anonymous',
      avatar: msg.sender?.profileImageUrl || '',
      isOnline: msg.sender?.isOnline || false
    },
    lastMessage: msg.content || msg.lastMessage,
    timestamp: new Date(msg.createdAt || msg.timestamp).toLocaleString(),
    unreadCount: msg.unreadCount || 0
  })) || [];

  const recommendations: Recommendation[] = recommendationsData?.map((rec: any) => ({
    id: rec.id,
    friend: {
      name: rec.recommender?.firstName ? `${rec.recommender.firstName} ${rec.recommender.lastName || ''}`.trim() : rec.recommender?.email?.split('@')[0] || 'Anonymous',
      avatar: rec.recommender?.profileImageUrl || ''
    },
    show: {
      title: rec.show?.title || rec.showTitle || 'Unknown Show',
      posterPath: rec.show?.posterPath || rec.posterPath || '',
      rating: rec.show?.rating || rec.rating || 0
    },
    message: rec.message || rec.reason || 'Check this out!',
    timestamp: new Date(rec.createdAt || rec.timestamp).toLocaleString()
  })) || [];

  const getActionText = (activity: FriendActivity) => {
    switch (activity.action) {
      case "watched":
        return "watched";
      case "rated":
        return `rated ${activity.rating} stars`;
      case "added_to_list":
        return "added to watchlist";
      case "recommended":
        return "recommended";
      case "commented":
        return "commented on";
      case "completed_season":
        return "completed season 1 of";
      case "started_watching":
        return "started watching";
      default:
        return activity.action;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "watched":
        return <Eye className="h-4 w-4 text-green-400" />;
      case "rated":
        return <Star className="h-4 w-4 text-yellow-400" />;
      case "added_to_list":
        return <Heart className="h-4 w-4 text-pink-400" />;
      case "recommended":
        return <Share className="h-4 w-4 text-blue-400" />;
      case "completed_season":
        return <Award className="h-4 w-4 text-purple-400" />;
      case "started_watching":
        return <Play className="h-4 w-4 text-teal-400" />;
      default:
        return <Eye className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleLike = (activityId: number) => {
    // Handle like functionality
    console.log("Liked activity:", activityId);
  };

  const handleComment = (activityId: number) => {
    // Handle comment functionality
    console.log("Comment on activity:", activityId);
  };

  const handleRecommend = (activityId: number) => {
    // Handle recommend functionality
    console.log("Recommend activity:", activityId);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(228,25%,3%)] via-[hsl(226,22%,6%)] to-[hsl(224,20%,8%)] flex items-center justify-center p-4">
        <Card className="glass-effect border-slate-700 max-w-md mx-auto">
          <CardContent className="p-8 text-center space-y-4">
            <Users className="h-16 w-16 text-teal-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Join the Community</h2>
            <p className="text-gray-300">
              Connect with friends, share your viewing experiences, and discover new shows together.
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
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1">
                  {/* TV Logo matching homepage */}
                  <div className="relative inline-block">
                    {/* TV Frame */}
                    <div className="w-7 h-6 bg-gradient-to-br from-slate-700 to-slate-900 rounded-md shadow-xl border border-slate-600 relative">
                      {/* TV Screen */}
                      <div className="absolute inset-0.5 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-sm flex items-center justify-center">
                        <div className="text-xs font-bold text-white drop-shadow-lg" style={{ textShadow: '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)' }}>B</div>
                      </div>
                      {/* TV Base */}
                      <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-slate-700 rounded-sm"></div>
                      {/* TV Legs */}
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-slate-600 rounded-sm"></div>
                    </div>
                  </div>
                  <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-black text-2xl">
                    inge
                  </span>
                </span>
                <span className="text-2xl font-bold text-white">with Friends</span>
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="activity" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
                Activity
              </TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
                Messages
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
                For You
              </TabsTrigger>
            </TabsList>

            {/* Activity Feed */}
            <TabsContent value="activity" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-teal-400" />
                  Friend Activity
                </h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-slate-600 text-gray-300 hover:bg-slate-700"
                    onClick={() => {
                      // Trigger onboarding modal to invite friends
                      window.location.hash = 'invite-friends';
                      window.dispatchEvent(new Event('show-invite-modal'));
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Invite Friends
                  </Button>
                  <Link href="/find-friends">
                    <Button variant="outline" size="sm" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Find Friends
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                {friendActivities.map((activity) => (
                  <Card key={activity.id} className="glass-effect border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-teal-500/20 text-teal-400">
                            {activity.friend.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {getActionIcon(activity.action)}
                                <span className="text-white font-medium">
                                  {activity.friend.name}
                                </span>
                                <span className="text-gray-400">
                                  {getActionText(activity)}
                                </span>
                                <span className="font-medium text-white">
                                  {activity.show.title}
                                </span>
                              </div>
                              <div className="text-sm text-gray-400">
                                {activity.timestamp}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>

                          {activity.comment && (
                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                              <p className="text-gray-300 text-sm">{activity.comment}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-6 pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(activity.id)}
                              className={`flex items-center gap-2 p-2 ${
                                activity.isLiked ? "text-pink-400" : "text-gray-400 hover:text-pink-400"
                              }`}
                            >
                              <Heart className={`h-4 w-4 ${activity.isLiked ? "fill-current" : ""}`} />
                              <span className="text-sm">{activity.likes}</span>
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleComment(activity.id)}
                              className="flex items-center gap-2 p-2 text-gray-400 hover:text-blue-400"
                            >
                              <MessageCircle className="h-4 w-4" />
                              <span className="text-sm">{activity.comments}</span>
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRecommend(activity.id)}
                              className="flex items-center gap-2 p-2 text-gray-400 hover:text-green-400"
                            >
                              <Repeat className="h-4 w-4" />
                              <span className="text-sm">Share</span>
                            </Button>
                          </div>
                        </div>

                        <div className="w-16 h-20 bg-slate-700 rounded-lg flex-shrink-0 overflow-hidden">
                          {activity.show.posterPath ? (
                            <img 
                              src={`https://image.tmdb.org/t/p/w92${activity.show.posterPath}`}
                              alt={activity.show.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-6 w-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></div>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="h-6 w-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Direct Messages */}
            <TabsContent value="messages" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-400" />
                  Messages
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-gray-400 w-48"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {directMessages.map((dm) => (
                  <Card key={dm.id} className="glass-effect border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-500/20 text-blue-400">
                              {dm.friend.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          {dm.friend.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-white">{dm.friend.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">{dm.timestamp}</span>
                              {dm.unreadCount > 0 && (
                                <Badge className="bg-teal-500 text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                  {dm.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 line-clamp-1">{dm.lastMessage}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="glass-effect border-slate-700/50 border-dashed">
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-white mb-2">Start a Conversation</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Connect with friends to discuss your favorite shows and get personalized recommendations.
                  </p>
                  <Button className="bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 border-teal-500/50">
                    <Search className="h-4 w-4 mr-2" />
                    Find Friends
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recommendations */}
            <TabsContent value="recommendations" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-400" />
                  Recommended for You
                </h2>
                <Button variant="outline" size="sm" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                  View All
                </Button>
              </div>

              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <Card key={rec.id} className="glass-effect border-slate-700/50 hover:border-orange-500/50 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex gap-4 items-start">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-orange-500/20 text-orange-400">
                            {rec.friend.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{rec.friend.name}</span>
                            <span className="text-gray-400 text-sm">recommended</span>
                            <span className="font-medium text-white">{rec.show.title}</span>
                          </div>
                          
                          <p className="text-gray-300 text-sm">{rec.message}</p>
                          
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Star className="h-4 w-4 fill-current" />
                              <span className="text-sm font-medium">{rec.show.rating}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border-orange-500/50">
                                <Heart className="h-3 w-3 mr-2" />
                                Add to List
                              </Button>
                              <Button variant="outline" size="sm" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                                <Eye className="h-3 w-3 mr-2" />
                                Watch Now
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="w-12 h-16 bg-slate-700 rounded flex-shrink-0 flex items-center justify-center">
                          <Play className="h-4 w-4 text-slate-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}