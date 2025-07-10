import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TopNav } from "@/components/top-nav";
import MobileNav from "@/components/mobile-nav";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Star, 
  Play,
  Eye,
  Users,
  Send,
  ThumbsUp,
  UserPlus,
  TrendingUp,
  Award,
  Calendar,
  Search,
  Plus,
  X,
  Check,
  UserCheck,
  Clock,
  Globe,
  MessageSquare,
  Filter,
  SortDesc
} from "lucide-react";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string;
  username?: string;
}

interface Show {
  id: number;
  title: string;
  posterPath?: string;
  year?: number;
  tmdbId?: number;
}

interface Activity {
  id: number;
  userId: string;
  user?: User;
  action: string;
  showId?: number;
  show?: Show;
  showTitle?: string;
  posterPath?: string;
  content?: string;
  rating?: number;
  createdAt: string;
  likes?: number;
  comments?: number;
  isLiked?: boolean;
}

interface FriendRequest {
  id: number;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  fromUser?: User;
  toUser?: User;
}

interface Friend {
  id: number;
  userId: string;
  friendId: string;
  status: 'accepted';
  createdAt: string;
  friend?: User;
}

export default function Social() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("activity");
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch friend activities
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities/friends"],
    staleTime: 2 * 60 * 1000,
    enabled: !!user
  });

  // Fetch friend requests
  const { data: friendRequests = [] } = useQuery<FriendRequest[]>({
    queryKey: ["/api/friends/requests"],
    staleTime: 30 * 1000,
    enabled: !!user
  });

  // Fetch friends list
  const { data: friends = [] } = useQuery<Friend[]>({
    queryKey: ["/api/friends"],
    staleTime: 5 * 60 * 1000,
    enabled: !!user
  });

  // Fetch potential friends to add
  const { data: suggestedFriends = [] } = useQuery<User[]>({
    queryKey: ["/api/users/search", searchQuery],
    staleTime: 30 * 1000,
    enabled: !!user && searchQuery.length > 2
  });

  // Like activity mutation
  const likeMutation = useMutation({
    mutationFn: async (activityId: number) => {
      return await apiRequest(`/api/activities/${activityId}/like`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities/friends"] });
      toast({
        title: "Liked!",
        description: "Activity liked successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to like activity",
        variant: "destructive",
      });
    }
  });

  // Comment on activity mutation
  const commentMutation = useMutation({
    mutationFn: async ({ activityId, comment }: { activityId: number; comment: string }) => {
      return await apiRequest(`/api/activities/${activityId}/comment`, "POST", { comment });
    },
    onSuccess: (_, { activityId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities/friends"] });
      setNewComment(prev => ({ ...prev, [activityId]: "" }));
      toast({
        title: "Comment added!",
        description: "Your comment has been posted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  });

  // Send friend request mutation
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (friendId: string) => {
      return await apiRequest("/api/friends/request", "POST", { friendId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      toast({
        title: "Friend request sent!",
        description: "Your friend request has been sent",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      });
    }
  });

  // Accept friend request mutation
  const acceptFriendRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest(`/api/friends/request/${requestId}/accept`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      toast({
        title: "Friend request accepted!",
        description: "You are now friends",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive",
      });
    }
  });

  // Reject friend request mutation
  const rejectFriendRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest(`/api/friends/request/${requestId}/reject`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      toast({
        title: "Friend request rejected",
        description: "Request has been declined",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reject friend request",
        variant: "destructive",
      });
    }
  });

  const handleLike = (activityId: number) => {
    likeMutation.mutate(activityId);
  };

  const handleComment = (activityId: number) => {
    const comment = newComment[activityId]?.trim();
    if (!comment) return;
    
    commentMutation.mutate({ activityId, comment });
  };

  const handleSendFriendRequest = (friendId: string) => {
    sendFriendRequestMutation.mutate(friendId);
  };

  const handleAcceptFriendRequest = (requestId: number) => {
    acceptFriendRequestMutation.mutate(requestId);
  };

  const handleRejectFriendRequest = (requestId: number) => {
    rejectFriendRequestMutation.mutate(requestId);
  };

  const getActionText = (activity: Activity) => {
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
        return "completed season of";
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

  const getUserDisplayName = (user?: User) => {
    if (!user) return "Anonymous";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.username) return user.username;
    if (user.email) return user.email.split('@')[0];
    return "Anonymous";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
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
                  <div className="relative inline-block">
                    <div className="w-7 h-6 bg-gradient-to-br from-slate-700 to-slate-900 rounded-md shadow-xl border border-slate-600 relative">
                      <div className="absolute inset-0.5 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-sm flex items-center justify-center">
                        <div className="text-xs font-bold text-white drop-shadow-lg" style={{ textShadow: '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)' }}>B</div>
                      </div>
                      <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-slate-700 rounded-sm"></div>
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
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="activity" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
                <TrendingUp className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="friends" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
                <Users className="h-4 w-4 mr-2" />
                Friends
              </TabsTrigger>
              <TabsTrigger value="requests" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
                <UserPlus className="h-4 w-4 mr-2" />
                Requests
                {friendRequests.length > 0 && (
                  <Badge variant="destructive" className="ml-2 h-4 w-4 p-0 text-xs">
                    {friendRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="discover" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
                <Search className="h-4 w-4 mr-2" />
                Discover
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
                    onClick={() => setActiveTab("discover")}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Find Friends
                  </Button>
                </div>
              </div>

              {activitiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="glass-effect border-slate-700/50">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <div className="h-12 w-12 bg-slate-700 rounded-full animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-700 rounded animate-pulse" />
                            <div className="h-3 bg-slate-700 rounded w-3/4 animate-pulse" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <Card className="glass-effect border-slate-700/50">
                  <CardContent className="p-8 text-center">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Activity Yet</h3>
                    <p className="text-gray-400 mb-4">
                      Connect with friends to see their watching activity here.
                    </p>
                    <Button 
                      onClick={() => setActiveTab("discover")}
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Find Friends
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <Card key={activity.id} className="glass-effect border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={activity.user?.profileImageUrl} />
                            <AvatarFallback className="bg-teal-500/20 text-teal-400">
                              {getUserDisplayName(activity.user)[0]}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {getActionIcon(activity.action)}
                                  <span className="text-white font-medium">
                                    {getUserDisplayName(activity.user)}
                                  </span>
                                  <span className="text-gray-400">
                                    {getActionText(activity)}
                                  </span>
                                  <span className="font-medium text-white">
                                    {activity.showTitle || activity.show?.title || 'Unknown Show'}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-400">
                                  {formatTimeAgo(activity.createdAt)}
                                </div>
                              </div>
                            </div>

                            {activity.content && (
                              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                                <p className="text-gray-300 text-sm">{activity.content}</p>
                              </div>
                            )}

                            <div className="flex items-center gap-6 pt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLike(activity.id)}
                                disabled={likeMutation.isPending}
                                className={`flex items-center gap-2 p-2 ${
                                  activity.isLiked ? "text-pink-400" : "text-gray-400 hover:text-pink-400"
                                }`}
                              >
                                <Heart className={`h-4 w-4 ${activity.isLiked ? "fill-current" : ""}`} />
                                <span className="text-sm">{activity.likes || 0}</span>
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowComments(prev => ({ ...prev, [activity.id]: !prev[activity.id] }))}
                                className="flex items-center gap-2 p-2 text-gray-400 hover:text-blue-400"
                              >
                                <MessageCircle className="h-4 w-4" />
                                <span className="text-sm">{activity.comments || 0}</span>
                              </Button>
                            </div>

                            {showComments[activity.id] && (
                              <div className="space-y-3 pt-2 border-t border-slate-700/50">
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Add a comment..."
                                    value={newComment[activity.id] || ""}
                                    onChange={(e) => setNewComment(prev => ({ ...prev, [activity.id]: e.target.value }))}
                                    className="flex-1 bg-slate-800/50 border-slate-700"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleComment(activity.id);
                                      }
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleComment(activity.id)}
                                    disabled={commentMutation.isPending || !newComment[activity.id]?.trim()}
                                    className="bg-teal-500 hover:bg-teal-600"
                                  >
                                    <Send className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="w-16 h-20 bg-slate-700 rounded-lg flex-shrink-0 overflow-hidden">
                            {(activity.posterPath || activity.show?.posterPath) ? (
                              <img 
                                src={`https://image.tmdb.org/t/p/w92${activity.posterPath || activity.show?.posterPath}`}
                                alt={activity.showTitle || activity.show?.title || 'Show'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                                <Play className="h-6 w-6 text-slate-500" />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Friends List */}
            <TabsContent value="friends" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-400" />
                  My Friends ({friends.length})
                </h2>
              </div>

              {friends.length === 0 ? (
                <Card className="glass-effect border-slate-700/50">
                  <CardContent className="p-8 text-center">
                    <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Friends Yet</h3>
                    <p className="text-gray-400 mb-4">
                      Start connecting with other BingeBoard users to share your viewing experience.
                    </p>
                    <Button 
                      onClick={() => setActiveTab("discover")}
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Find Friends
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {friends.map((friend) => (
                    <Card key={friend.id} className="glass-effect border-slate-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={friend.friend?.profileImageUrl} />
                            <AvatarFallback className="bg-teal-500/20 text-teal-400">
                              {getUserDisplayName(friend.friend)[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-medium text-white">
                              {getUserDisplayName(friend.friend)}
                            </h3>
                            <p className="text-sm text-gray-400">
                              Friends since {formatTimeAgo(friend.createdAt)}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-gray-300 hover:bg-slate-700"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Friend Requests */}
            <TabsContent value="requests" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-teal-400" />
                  Friend Requests ({friendRequests.length})
                </h2>
              </div>

              {friendRequests.length === 0 ? (
                <Card className="glass-effect border-slate-700/50">
                  <CardContent className="p-8 text-center">
                    <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Pending Requests</h3>
                    <p className="text-gray-400">
                      Friend requests will appear here when other users want to connect with you.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {friendRequests.map((request) => (
                    <Card key={request.id} className="glass-effect border-slate-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={request.fromUser?.profileImageUrl} />
                            <AvatarFallback className="bg-teal-500/20 text-teal-400">
                              {getUserDisplayName(request.fromUser)[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-medium text-white">
                              {getUserDisplayName(request.fromUser)}
                            </h3>
                            <p className="text-sm text-gray-400">
                              Sent {formatTimeAgo(request.createdAt)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptFriendRequest(request.id)}
                              disabled={acceptFriendRequestMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectFriendRequest(request.id)}
                              disabled={rejectFriendRequestMutation.isPending}
                              className="border-red-600 text-red-400 hover:bg-red-600/20"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Discover Friends */}
            <TabsContent value="discover" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Search className="h-5 w-5 text-teal-400" />
                  Discover Friends
                </h2>
              </div>

              {/* Social Media Connection Section */}
              <Card className="glass-effect border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="h-5 w-5 text-teal-400" />
                    Connect Social Media
                  </CardTitle>
                  <p className="text-gray-400 text-sm">
                    Connect your social media accounts to find friends who are already on BingeBoard
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Facebook */}
                    <Button
                      onClick={() => {
                        toast({
                          title: "Firebase Authentication",
                          description: "Use the main login page to connect with Facebook through secure Firebase authentication.",
                        });
                      }}
                      className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white h-12"
                    >
                      <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">f</span>
                      </div>
                      Connect Facebook
                    </Button>

                    {/* Google */}
                    <Button
                      onClick={() => {
                        toast({
                          title: "Firebase Authentication",
                          description: "Use the main login page to connect with Google through secure Firebase authentication.",
                        });
                      }}
                      className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white h-12"
                    >
                      <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                        <span className="text-red-600 font-bold text-sm">G</span>
                      </div>
                      Connect Google
                    </Button>

                    {/* Instagram */}
                    <Button
                      onClick={async () => {
                        const username = prompt('Enter your Instagram username:');
                        if (username) {
                          try {
                            await fetch('/api/social/connect/instagram', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ username })
                            });
                            toast({ title: "Instagram connected successfully!" });
                          } catch (error) {
                            toast({ title: "Failed to connect Instagram", variant: "destructive" });
                          }
                        }
                      }}
                      className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12"
                    >
                      <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                        <span className="text-pink-600 font-bold text-sm">📷</span>
                      </div>
                      Connect Instagram
                    </Button>

                    {/* TikTok */}
                    <Button
                      onClick={async () => {
                        const username = prompt('Enter your TikTok username:');
                        if (username) {
                          try {
                            await fetch('/api/social/connect/tiktok', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ username })
                            });
                            toast({ title: "TikTok connected successfully!" });
                          } catch (error) {
                            toast({ title: "Failed to connect TikTok", variant: "destructive" });
                          }
                        }
                      }}
                      className="flex items-center gap-3 bg-black hover:bg-gray-900 text-white h-12 border border-gray-600"
                    >
                      <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                        <span className="text-black font-bold text-sm">🎵</span>
                      </div>
                      Connect TikTok
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Email Invite Section */}
              <Card className="glass-effect border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Send className="h-5 w-5 text-teal-400" />
                    Invite Friends
                  </CardTitle>
                  <p className="text-gray-400 text-sm">
                    Send email invitations to friends who aren't on BingeBoard yet
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter friend's email address..."
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 flex-1"
                      type="email"
                    />
                    <Button
                      onClick={async () => {
                        if (inviteEmail) {
                          try {
                            await fetch('/api/friends/invite', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email: inviteEmail })
                            });
                            setInviteEmail('');
                            toast({ title: "Invitation sent!" });
                          } catch (error) {
                            toast({ title: "Failed to send invitation", variant: "destructive" });
                          }
                        }
                      }}
                      className="bg-teal-500 hover:bg-teal-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Input
                  placeholder="Search for friends by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-800/50 border-slate-700"
                />

                {searchQuery.length > 2 && (
                  <div className="space-y-4">
                    {suggestedFriends.length === 0 ? (
                      <Card className="glass-effect border-slate-700/50">
                        <CardContent className="p-8 text-center">
                          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-white mb-2">No Results Found</h3>
                          <p className="text-gray-400">
                            No users found matching "{searchQuery}". Try a different search term.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {suggestedFriends.map((suggestedUser) => (
                          <Card key={suggestedUser.id} className="glass-effect border-slate-700/50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={suggestedUser.profileImageUrl} />
                                  <AvatarFallback className="bg-teal-500/20 text-teal-400">
                                    {getUserDisplayName(suggestedUser)[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h3 className="font-medium text-white">
                                    {getUserDisplayName(suggestedUser)}
                                  </h3>
                                  <p className="text-sm text-gray-400">
                                    {suggestedUser.email}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleSendFriendRequest(suggestedUser.id)}
                                  disabled={sendFriendRequestMutation.isPending}
                                  className="bg-teal-500 hover:bg-teal-600"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Friend
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {searchQuery.length <= 2 && (
                  <Card className="glass-effect border-slate-700/50">
                    <CardContent className="p-8 text-center">
                      <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Search for Friends</h3>
                      <p className="text-gray-400">
                        Enter at least 3 characters to search for other BingeBoard users.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}