import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import {
  Users,
  Plus,
  Search,
  Star,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  Tv,
  Film,
  Clock,
  TrendingUp,
  Filter,
  MoreHorizontal
} from "lucide-react";
import NavigationHeader from "@/components/navigation-header";

interface User {
  id: string;
  name: string;
  avatar: string;
  username: string;
  isFollowing: boolean;
}

interface Activity {
  id: string;
  user: User;
  type: "watched" | "liked" | "added_to_list" | "rated" | "shared";
  content: {
    title: string;
    poster_path: string;
    media_type: string;
    rating?: number;
  };
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Alex Chen",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    username: "@alexc",
    isFollowing: false
  },
  {
    id: "2",
    name: "Sarah Kim",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    username: "@sarahk",
    isFollowing: true
  },
  {
    id: "3",
    name: "Mike Johnson",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    username: "@mikej",
    isFollowing: true
  }
];

const mockActivities: Activity[] = [
  {
    id: "1",
    user: mockUsers[1],
    type: "watched",
    content: {
      title: "The Last of Us",
      poster_path: "/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
      media_type: "tv"
    },
    timestamp: "2 hours ago",
    likes: 12,
    comments: 3,
    isLiked: false
  },
  {
    id: "2",
    user: mockUsers[2],
    type: "rated",
    content: {
      title: "Dune: Part Two",
      poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      media_type: "movie",
      rating: 9
    },
    timestamp: "4 hours ago",
    likes: 8,
    comments: 1,
    isLiked: true
  },
  {
    id: "3",
    user: mockUsers[0],
    type: "added_to_list",
    content: {
      title: "Wednesday",
      poster_path: "/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
      media_type: "tv"
    },
    timestamp: "6 hours ago",
    likes: 5,
    comments: 2,
    isLiked: false
  }
];

export default function Social() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"feed" | "discover" | "friends">("feed");

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="text-center text-white max-w-md">
          <Users className="w-16 h-16 mx-auto mb-4 text-teal-400" />
          <h1 className="text-2xl font-bold mb-4">Join the community</h1>
          <p className="text-gray-400 mb-6">Connect with friends and discover what they're watching</p>
          <Button className="bg-teal-600 hover:bg-teal-700">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <NavigationHeader />
      {/* Mobile-first layout */}
      <div className="pb-6 px-4 sm:px-6 lg:px-8 pt-28">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Social</h1>
            <p className="text-gray-400 text-sm sm:text-base">See what your friends are watching</p>
          </div>

          {/* Tab Navigation - Mobile optimized */}
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            {[
              { id: "feed", label: "Feed", icon: TrendingUp },
              { id: "discover", label: "Discover", icon: Search },
              { id: "friends", label: "Friends", icon: Users }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all ${activeTab === tab.id
                    ? "bg-teal-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-slate-700/50"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content based on active tab */}
          {activeTab === "feed" && <FeedTab activities={mockActivities} />}
          {activeTab === "discover" && <DiscoverTab users={filteredUsers} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
          {activeTab === "friends" && <FriendsTab users={mockUsers.filter(u => u.isFollowing)} />}
        </div>
      </div>
    </div>
  );
}

function FeedTab({ activities }: { activities: Activity[] }) {
  const [likedPosts, setLikedPosts] = useState(new Set<string>());

  const toggleLike = (activityId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id} className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex gap-3">
              {/* User Avatar */}
              <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">
                      {activity.user.name}
                    </p>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      {getActivityText(activity)} • {activity.timestamp}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 flex-shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="flex gap-3 mb-3">
                  <img
                    src={`https://image.tmdb.org/t/p/w200${activity.content.poster_path}`}
                    alt={activity.content.title}
                    className="w-12 h-16 sm:w-16 sm:h-20 object-cover rounded border border-slate-600 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm sm:text-base truncate">
                      {activity.content.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {activity.content.media_type === "tv" ? "TV" : "Movie"}
                      </Badge>
                      {activity.content.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-yellow-400 text-xs font-medium">
                            {activity.content.rating}/10
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 text-gray-400">
                  <button
                    onClick={() => toggleLike(activity.id)}
                    className="flex items-center gap-1 hover:text-red-400 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${likedPosts.has(activity.id) || activity.isLiked
                        ? "fill-red-400 text-red-400"
                        : ""
                        }`}
                    />
                    <span className="text-sm">{activity.likes}</span>
                  </button>

                  <button className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{activity.comments}</span>
                  </button>

                  <button className="flex items-center gap-1 hover:text-green-400 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DiscoverTab({ users, searchTerm, setSearchTerm }: {
  users: User[],
  searchTerm: string,
  setSearchTerm: (term: string) => void
}) {
  const [followingUsers, setFollowingUsers] = useState(new Set<string>());

  const toggleFollow = (userId: string) => {
    setFollowingUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-gray-400 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {users.map((user) => (
          <Card key={user.id} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{user.name}</h4>
                  <p className="text-gray-400 text-sm truncate">{user.username}</p>
                </div>

                <Button
                  size="sm"
                  variant={followingUsers.has(user.id) || user.isFollowing ? "outline" : "default"}
                  onClick={() => toggleFollow(user.id)}
                  className="flex-shrink-0"
                >
                  {followingUsers.has(user.id) || user.isFollowing ? (
                    "Following"
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1" />
                      Follow
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FriendsTab({ users }: { users: User[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Following ({users.length})</h3>
        <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
          <UserPlus className="w-4 h-4 mr-1" />
          Find Friends
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {users.map((user) => (
          <Card key={user.id} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{user.name}</h4>
                  <p className="text-gray-400 text-sm truncate">{user.username}</p>
                  <p className="text-teal-400 text-xs">Following</p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                >
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function getActivityText(activity: Activity): string {
  switch (activity.type) {
    case "watched":
      return "watched";
    case "liked":
      return "liked";
    case "added_to_list":
      return "added to list";
    case "rated":
      return "rated";
    case "shared":
      return "shared";
    default:
      return "interacted with";
  }
}
