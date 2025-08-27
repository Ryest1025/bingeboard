import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/layouts/AppLayout";
import {
  Users,
  UserPlus,
  Search,
  Heart,
  MessageCircle,
  Share2,
  Star,
  TrendingUp,
  Clock,
  Play,
  Plus,
  Filter
} from "lucide-react";

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isFollowing: boolean;
  mutualFriends: number;
  commonShows: number;
}

interface Activity {
  id: string;
  user: Friend;
  type: "watched" | "liked" | "added_to_list" | "rated";
  content: {
    title: string;
    poster: string;
    type: "movie" | "tv";
    rating?: number;
  };
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

// Mock data
const mockFriends: Friend[] = [
  {
    id: "1",
    name: "Emma Wilson",
    username: "@emmaw",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    isFollowing: true,
    mutualFriends: 12,
    commonShows: 8
  },
  {
    id: "2",
    name: "Alex Chen",
    username: "@alexc",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    isFollowing: true,
    mutualFriends: 6,
    commonShows: 15
  },
  {
    id: "3",
    name: "Sarah Johnson",
    username: "@sarahj",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    isFollowing: false,
    mutualFriends: 3,
    commonShows: 5
  }
];

const mockActivities: Activity[] = [
  {
    id: "1",
    user: mockFriends[0],
    type: "watched",
    content: {
      title: "The Bear",
      poster: "https://image.tmdb.org/t/p/w200/rBuabjEuVFbhL1uOy6Z3ZVsZYQ0.jpg",
      type: "tv"
    },
    timestamp: "2 hours ago",
    likes: 12,
    comments: 3,
    isLiked: false
  },
  {
    id: "2",
    user: mockFriends[1],
    type: "rated",
    content: {
      title: "Dune: Part Two",
      poster: "https://image.tmdb.org/t/p/w200/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      type: "movie",
      rating: 9
    },
    timestamp: "5 hours ago",
    likes: 24,
    comments: 7,
    isLiked: true
  }
];

export default function SocialModern() {
  const [activeTab, setActiveTab] = useState("feed");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock query for friends
  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ["/api/friends"],
    queryFn: () => Promise.resolve(mockFriends),
  });

  // Mock query for activity feed
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/social/feed"],
    queryFn: () => Promise.resolve(mockActivities),
  });

  const filteredFriends = friends.filter((friend: Friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Social Hub
          </h1>
          <p className="text-gray-400 text-lg">
            Connect with friends and discover what's trending
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-700">
            <TabsTrigger 
              value="feed" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4" />
              Activity Feed
            </TabsTrigger>
            <TabsTrigger 
              value="friends" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4" />
              Friends
            </TabsTrigger>
            <TabsTrigger 
              value="discover" 
              className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              <Search className="h-4 w-4" />
              Discover
            </TabsTrigger>
          </TabsList>

          {/* Activity Feed Tab */}
          <TabsContent value="feed" className="mt-6 space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-700 rounded w-1/3 mb-1"></div>
                            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="h-20 bg-gray-700 rounded mb-3"></div>
                        <div className="flex gap-4">
                          <div className="h-8 bg-gray-700 rounded w-16"></div>
                          <div className="h-8 bg-gray-700 rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activities.map((activity) => (
                      <div key={activity.id} className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-colors">
                        {/* User Info */}
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar>
                            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                            <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-white font-medium">{activity.user.name}</p>
                            <p className="text-gray-400 text-sm">
                              {activity.type === "watched" && "just watched"}
                              {activity.type === "rated" && "rated"}
                              {activity.type === "liked" && "liked"}
                              {activity.type === "added_to_list" && "added to list"}
                            </p>
                          </div>
                          <span className="text-gray-500 text-sm">{activity.timestamp}</span>
                        </div>

                        {/* Content */}
                        <div className="flex gap-4 mb-4">
                          <img
                            src={activity.content.poster}
                            alt={activity.content.title}
                            className="w-16 h-24 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg mb-2">
                              {activity.content.title}
                            </h3>
                            <Badge variant="secondary" className="mb-2">
                              {activity.content.type === "movie" ? "Movie" : "TV Show"}
                            </Badge>
                            {activity.content.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-white font-medium">{activity.content.rating}/10</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`flex items-center gap-2 ${
                              activity.isLiked ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-white"
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${activity.isLiked ? "fill-current" : ""}`} />
                            {activity.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-400 hover:text-white">
                            <MessageCircle className="h-4 w-4" />
                            {activity.comments}
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-400 hover:text-white">
                            <Share2 className="h-4 w-4" />
                            Share
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends" className="mt-6 space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  Your Friends ({friends.filter((f: Friend) => f.isFollowing).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends
                    .filter((friend: Friend) => friend.isFollowing)
                    .map((friend: Friend) => (
                      <div key={friend.id} className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar>
                            <AvatarImage src={friend.avatar} alt={friend.name} />
                            <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{friend.name}</p>
                            <p className="text-gray-400 text-sm truncate">{friend.username}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Mutual friends:</span>
                            <span className="text-white">{friend.mutualFriends}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Shows in common:</span>
                            <span className="text-white">{friend.commonShows}</span>
                          </div>
                        </div>

                        <Button variant="outline" size="sm" className="w-full border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white">
                          View Profile
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="mt-6 space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="h-5 w-5 text-green-400" />
                  Find Friends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search for friends..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFriends
                    .filter((friend: Friend) => !friend.isFollowing)
                    .map((friend: Friend) => (
                      <div key={friend.id} className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar>
                            <AvatarImage src={friend.avatar} alt={friend.name} />
                            <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{friend.name}</p>
                            <p className="text-gray-400 text-sm truncate">{friend.username}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Mutual friends:</span>
                            <span className="text-white">{friend.mutualFriends}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Shows in common:</span>
                            <span className="text-white">{friend.commonShows}</span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Friend
                        </Button>
                      </div>
                    ))}
                </div>

                {filteredFriends.filter((friend: Friend) => !friend.isFollowing).length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No friends found</p>
                    <p className="text-gray-500 text-sm">Try adjusting your search or connect your social accounts</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
