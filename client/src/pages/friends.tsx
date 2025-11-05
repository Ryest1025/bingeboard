import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  UserPlus, 
  Search, 
  Heart, 
  Share2, 
  Play,
  MessageCircle,
  Send,
  Star,
  TrendingUp,
  Filter,
  Sparkles,
  Target,
  Zap,
  Clock,
  Eye,
  ThumbsUp,
  Award,
  Flame,
  CheckCircle2,
  X,
  MoreHorizontal,
  Tv,
  Film
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NavigationHeader from "@/components/navigation-header";
import { FriendCard, DiscoverSection, FriendProfileModal } from "./friends-components";
import { EnhancedActivityFeed } from "@/components/friends/EnhancedActivityFeed";

interface Friend {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string;
  // Enhanced fields
  username?: string;
  bio?: string;
  isOnline?: boolean;
  currentlyWatching?: {
    title: string;
    poster: string;
    progress: number;
    episodeNumber?: string;
  };
  stats?: {
    totalWatched: number;
    streak: number;
    badges: SocialBadge[];
  };
  compatibility?: number;
  sharedPlatforms?: string[];
  favoriteGenres?: string[];
  recentActivity?: Activity[];
  // PHASE 1: New fields
  mutualWatchStats?: {
    totalShared: number;
    topShows: Array<{
      title: string;
      yourRating: number;
      theirRating: number;
      poster: string;
    }>;
    genreBreakdown: {
      genre: string;
      count: number;
    }[];
  };
  genreCompatibility?: {
    [genre: string]: number; // percentage match per genre
  };
  lastActive?: string;
  watchingNowLive?: {
    show: string;
    episode: string;
    startedAt: string;
  };
}

interface SocialBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  earnedAt?: string;
}

interface EmojiReaction {
  emoji: string;
  count: number;
  users: string[];
  youReacted: boolean;
}

interface Activity {
  id: string;
  type: 'watching' | 'completed' | 'rated' | 'added';
  show: {
    id: number;
    title: string;
    poster: string;
    type: 'movie' | 'tv';
  };
  rating?: number;
  comment?: string;
  timestamp: string;
  userId: string;
  userName: string;
  // PHASE 1: Emoji reactions
  reactions?: EmojiReaction[];
}

// PHASE 1: Activity grouping
interface GroupedActivity {
  id: string;
  type: 'group';
  groupType: 'started' | 'completed' | 'rated';
  count: number;
  users: string[];
  shows?: string[];
  timestamp: string;
  preview: Activity[];
}

interface SuggestedFriend extends Friend {
  reason: string;
  mutualFriends: number;
}

export default function Friends() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [activeTab, setActiveTab] = useState<'friends' | 'activity' | 'discover'>('friends');

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["/api/friends"],
  });

  // PHASE 1: Social Badge System
  const SOCIAL_BADGES: SocialBadge[] = [
    { id: 'binge-lord', name: 'Binge Lord', icon: '👑', color: 'text-yellow-400', description: 'Watched 50+ shows' },
    { id: 'critic', name: 'Critic', icon: '⭐', color: 'text-purple-400', description: 'Rated 100+ shows' },
    { id: 'early-adopter', name: 'Early Adopter', icon: '🚀', color: 'text-blue-400', description: 'Watches new releases first' },
    { id: 'sci-fi-specialist', name: 'Sci-Fi Specialist', icon: '🛸', color: 'text-cyan-400', description: 'Sci-fi expert' },
    { id: 'comedy-king', name: 'Comedy King', icon: '😂', color: 'text-green-400', description: 'Comedy connoisseur' },
    { id: 'documentary-devotee', name: 'Documentary Devotee', icon: '📚', color: 'text-orange-400', description: 'Documentary lover' },
    { id: 'reality-tv-queen', name: 'Reality TV Queen', icon: '💎', color: 'text-pink-400', description: 'Reality TV expert' },
    { id: 'anime-expert', name: 'Anime Expert', icon: '🎌', color: 'text-red-400', description: 'Anime specialist' },
    { id: 'horror-fan', name: 'Horror Fan', icon: '👻', color: 'text-slate-400', description: 'Horror enthusiast' },
    { id: 'streak-champion', name: 'Streak Champion', icon: '🔥', color: 'text-orange-500', description: '30+ day streak' },
    { id: 'social-butterfly', name: 'Social Butterfly', icon: '🦋', color: 'text-purple-300', description: '50+ friends' },
    { id: 'recommender-pro', name: 'Recommender Pro', icon: '🎯', color: 'text-cyan-500', description: 'Top recommendations' },
  ];

  // Mock enhanced data (replace with real API)
  const mockEnhancedFriends: Friend[] = (Array.isArray(friends) ? friends : []).map((friend: any, idx) => ({
    ...friend,
    username: friend.firstName?.toLowerCase() || `user${idx}`,
    bio: "Love binge-watching sci-fi and thrillers!",
    isOnline: Math.random() > 0.5,
    currentlyWatching: Math.random() > 0.6 ? {
      title: ["Breaking Bad", "The Last of Us", "Succession", "The Bear"][idx % 4],
      poster: `/api/placeholder/120/180`,
      progress: Math.floor(Math.random() * 100),
      episodeNumber: `S${Math.floor(Math.random() * 5) + 1}E${Math.floor(Math.random() * 10) + 1}`
    } : undefined,
    stats: {
      totalWatched: Math.floor(Math.random() * 200) + 50,
      streak: Math.floor(Math.random() * 30) + 1,
      badges: SOCIAL_BADGES.slice(idx % 3, idx % 3 + Math.floor(Math.random() * 3) + 1)
    },
    compatibility: Math.floor(Math.random() * 30) + 70,
    sharedPlatforms: ["Netflix", "HBO Max", "Disney+"].slice(0, Math.floor(Math.random() * 3) + 1),
    favoriteGenres: ["Drama", "Thriller", "Sci-Fi"].slice(0, Math.floor(Math.random() * 3) + 1),
    // PHASE 1: Enhanced data
    mutualWatchStats: {
      totalShared: Math.floor(Math.random() * 30) + 10,
      topShows: [
        { title: "Breaking Bad", yourRating: 5, theirRating: 5, poster: "/api/placeholder/80/120" },
        { title: "The Last of Us", yourRating: 4, theirRating: 5, poster: "/api/placeholder/80/120" },
        { title: "Succession", yourRating: 5, theirRating: 4, poster: "/api/placeholder/80/120" },
      ],
      genreBreakdown: [
        { genre: "Drama", count: 12 },
        { genre: "Sci-Fi", count: 8 },
        { genre: "Comedy", count: 5 },
      ]
    },
    genreCompatibility: {
      "Drama": Math.floor(Math.random() * 30) + 70,
      "Comedy": Math.floor(Math.random() * 40) + 50,
      "Sci-Fi": Math.floor(Math.random() * 35) + 65,
      "Thriller": Math.floor(Math.random() * 30) + 70,
      "Horror": Math.floor(Math.random() * 50) + 30,
      "Documentary": Math.floor(Math.random() * 40) + 40,
    },
    lastActive: ["2h ago", "5h ago", "1d ago", "Just now"][Math.floor(Math.random() * 4)],
    watchingNowLive: Math.random() > 0.7 ? {
      show: ["Breaking Bad", "The Last of Us", "Succession"][Math.floor(Math.random() * 3)],
      episode: `S${Math.floor(Math.random() * 5) + 1}E${Math.floor(Math.random() * 10) + 1}`,
      startedAt: "15 min ago"
    } : undefined,
    recentActivity: []
  }));

  const mockSuggestions: SuggestedFriend[] = [
    {
      id: "s1",
      firstName: "Sarah",
      lastName: "Johnson",
      username: "sarahj",
      profileImageUrl: undefined,
      bio: "Movie buff and comedy lover",
      isOnline: true,
      compatibility: 85,
      reason: "Loves the same shows as you",
      mutualFriends: 5,
      sharedPlatforms: ["Netflix", "Prime Video"],
      favoriteGenres: ["Comedy", "Drama"],
      stats: {
        totalWatched: 156,
        streak: 12,
        badges: ["🔥", "🎭"]
      }
    },
    {
      id: "s2",
      firstName: "Mike",
      lastName: "Williams",
      username: "mikew",
      profileImageUrl: undefined,
      bio: "Sci-fi enthusiast and binge master",
      isOnline: false,
      compatibility: 92,
      reason: "Friend of friend · 92% compatibility",
      mutualFriends: 3,
      sharedPlatforms: ["HBO Max", "Disney+"],
      favoriteGenres: ["Sci-Fi", "Action"],
      stats: {
        totalWatched: 203,
        streak: 25,
        badges: ["⭐", "🚀", "🏆"]
      }
    }
  ];

  const mockActivity: Activity[] = [
    {
      id: "a1",
      type: "completed",
      show: { id: 1, title: "Breaking Bad", poster: "/api/placeholder/80/120", type: "tv" },
      rating: 5,
      comment: "Best show ever! 🔥",
      timestamp: "2h ago",
      userId: "user1",
      userName: "Sarah",
      reactions: [
        { emoji: "🔥", count: 5, users: ["user2", "user3", "user4", "user5", "you"], youReacted: true },
        { emoji: "💯", count: 3, users: ["user6", "user7", "user8"], youReacted: false },
        { emoji: "😍", count: 2, users: ["user9", "user10"], youReacted: false },
      ]
    },
    {
      id: "a2",
      type: "watching",
      show: { id: 2, title: "The Last of Us", poster: "/api/placeholder/80/120", type: "tv" },
      timestamp: "5h ago",
      userId: "user2",
      userName: "Mike",
      reactions: [
        { emoji: "😱", count: 4, users: ["user1", "user3", "user4", "you"], youReacted: true },
        { emoji: "🤯", count: 2, users: ["user5", "user6"], youReacted: false },
      ]
    },
    {
      id: "a3",
      type: "rated",
      show: { id: 3, title: "Oppenheimer", poster: "/api/placeholder/80/120", type: "movie" },
      rating: 4,
      timestamp: "1d ago",
      userId: "user3",
      userName: "Alex",
      reactions: [
        { emoji: "💣", count: 6, users: ["user1", "user2", "user4", "user5", "user6", "you"], youReacted: true },
      ]
    }
  ];

  // PHASE 1: Smart Activity Grouping
  const mockGroupedActivity: (Activity | GroupedActivity)[] = [
    {
      id: "g1",
      type: "group",
      groupType: "started",
      count: 4,
      users: ["Sarah", "Mike", "Alex", "Jordan"],
      shows: ["The Bear", "Shogun", "Baby Reindeer"],
      timestamp: "Today",
      preview: mockActivity.slice(0, 2)
    },
    ...mockActivity
  ];

  const filteredFriends = mockEnhancedFriends.filter(friend => {
    const matchesSearch = 
      friend.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlatform = !filterPlatform || friend.sharedPlatforms?.includes(filterPlatform);
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'online' && friend.isOnline) ||
      (filterStatus === 'offline' && !friend.isOnline);
    
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const getFriendName = (friend: Friend) => {
    if (friend.firstName && friend.lastName) {
      return `${friend.firstName} ${friend.lastName}`;
    }
    return friend.firstName || friend.username || friend.email || 'Anonymous';
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'watching': return <Play className="h-4 w-4 text-blue-400" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'rated': return <Star className="h-4 w-4 text-yellow-400" />;
      case 'added': return <Plus className="h-4 w-4 text-purple-400" />;
    }
  };

  const getActivityText = (activity: Activity, friendName: string) => {
    switch (activity.type) {
      case 'watching': return `is watching`;
      case 'completed': return `finished`;
      case 'rated': return `rated`;
      case 'added': return `added to watchlist`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <NavigationHeader />
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-800 animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-slate-800 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                      <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <NavigationHeader />
      
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Users className="h-10 w-10 text-cyan-400" />
                Friends
              </h1>
              <p className="text-slate-400">
                {filteredFriends.length} friends • {filteredFriends.filter(f => f.isOnline).length} online
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                onClick={() => setActiveTab('discover')}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Find Friends
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-800 text-white placeholder-slate-500"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-slate-800 text-white hover:bg-slate-900">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-900 border-slate-800 text-white">
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>All Friends</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('online')}>Online Only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('offline')}>Offline</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-slate-800">
            <TabsTrigger 
              value="friends" 
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-slate-400"
            >
              <Users className="h-4 w-4 mr-2" />
              My Friends
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-slate-400"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Activity Feed
            </TabsTrigger>
            <TabsTrigger 
              value="discover" 
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-slate-400"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Discover
            </TabsTrigger>
          </TabsList>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-4">
            {filteredFriends.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-12 text-center">
                    <Users className="h-20 w-20 text-slate-600 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-white mb-3">
                      {searchQuery ? 'No friends found' : 'No Friends Yet'}
                    </h3>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                      {searchQuery 
                        ? 'Try adjusting your search or filters'
                        : 'Connect with friends to share your watching experience and discover new shows together.'
                      }
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                      onClick={() => setActiveTab('discover')}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Find Friends
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence>
                  {filteredFriends.map((friend, index) => (
                    <FriendCard 
                      key={friend.id} 
                      friend={friend} 
                      index={index}
                      onClick={() => setSelectedFriend(friend)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* Activity Feed Tab */}
          <TabsContent value="activity" className="space-y-4">
            <EnhancedActivityFeed activities={mockGroupedActivity} friends={mockEnhancedFriends} />
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            <DiscoverSection suggestions={mockSuggestions} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Friend Profile Modal */}
      <AnimatePresence>
        {selectedFriend && (
          <FriendProfileModal 
            friend={selectedFriend} 
            onClose={() => setSelectedFriend(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}