import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserPlus, 
  Search, 
  Share2, 
  TrendingUp,
  Sparkles
} from "lucide-react";

// Modular Components
import { ActivityCard } from "@/components/Social/ActivityCard";
import { FriendCard } from "@/components/Social/FriendCard";
import { SuggestionCard } from "@/components/Social/SuggestionCard";

// Types
import type { Friend, Activity } from "@/types/social";

// Mock data - replace with real API calls
const mockFriends: Friend[] = [
  {
    id: "1",
    name: "Sarah Chen",
    username: "@sarahc",
    avatar: "https://i.pravatar.cc/150?img=1",
    isFollowing: true,
    mutualFriends: 12,
    commonShows: 8,
    recentActivity: "Watched Breaking Bad S5E16"
  },
  {
    id: "2", 
    name: "Mike Rodriguez",
    username: "@mikerod",
    avatar: "https://i.pravatar.cc/150?img=2",
    isFollowing: true,
    mutualFriends: 5,
    commonShows: 15,
    recentActivity: "Added The Crown to watchlist"
  },
  {
    id: "3",
    name: "Emma Thompson", 
    username: "@emma_t",
    avatar: "https://i.pravatar.cc/150?img=3",
    isFollowing: false,
    mutualFriends: 3,
    commonShows: 4,
    recentActivity: "Rated Succession 5 stars"
  }
];

const mockActivities: Activity[] = [
  {
    id: "1",
    user: mockFriends[0],
    type: "watched",
    content: {
      id: "1",
      title: "Breaking Bad",
      poster_path: "/1yeVJox3rjo2jBKrrihIMj7uoS9.jpg",
      media_type: "tv"
    },
    timestamp: "2 hours ago",
    likes: 12,
    comments: 3
  },
  {
    id: "2", 
    user: mockFriends[1],
    type: "rated",
    content: {
      id: "2",
      title: "The Crown",
      poster_path: "/4jMuNlBBHQwBzgQF2S4dl8uLAqa.jpg",
      media_type: "tv",
      rating: 5
    },
    timestamp: "4 hours ago", 
    likes: 8,
    comments: 1
  }
];

export default function Social() {
  const [activeTab, setActiveTab] = useState("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedActivities, setLikedActivities] = useState(new Set<string>());

  // Handle like toggle
  const handleToggleLike = (activityId: string) => {
    setLikedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  // Navigation handlers
  const navigateToFindFriends = () => {
    window.location.href = '/find-friends';
  };

  // Suggestion card configurations
  const suggestionCards = [
    {
      title: "AI Friend Suggestions",
      description: "Based on your viewing history",
      icon: <Search className="h-8 w-8 text-white" />,
      gradient: "from-purple-900/30 to-blue-900/30 border-purple-500/30 hover:border-purple-400/50",
      details: ["Smart matching", "Real-time updates"],
      button: {
        label: "Explore Suggestions",
        icon: <Search className="h-4 w-4 mr-2" />,
        onClick: navigateToFindFriends
      },
      highlightInfo: {
        text: "Discover people with similar taste",
        icon: <Sparkles className="h-3 w-3 inline mr-1" />,
        color: "bg-purple-600/20 text-purple-300"
      }
    },
    {
      title: "Social Connections",
      description: "Import from social media",
      icon: <Share2 className="h-8 w-8 text-white" />,
      gradient: "from-teal-900/30 to-cyan-900/30 border-teal-500/30 hover:border-teal-400/50",
      details: ["Google", "Facebook"],
      button: {
        label: "Connect Accounts",
        icon: <Share2 className="h-4 w-4 mr-2" />,
        onClick: navigateToFindFriends
      },
      highlightInfo: {
        text: "Find friends already on BingeBoard",
        icon: <Users className="h-3 w-3 inline mr-1" />,
        color: "bg-teal-600/20 text-teal-300"
      }
    },
    {
      title: "Search & Invite",
      description: "Find specific people",
      icon: <UserPlus className="h-8 w-8 text-white" />,
      gradient: "from-amber-900/30 to-orange-900/30 border-amber-500/30 hover:border-amber-400/50",
      details: ["Username search", "Contact import"],
      button: {
        label: "Search Friends",
        icon: <UserPlus className="h-4 w-4 mr-2" />,
        onClick: navigateToFindFriends
      },
      highlightInfo: {
        text: "Search by name, email or username",
        icon: <Search className="h-3 w-3 inline mr-1" />,
        color: "bg-amber-600/20 text-amber-300"
      }
    }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        {/* Hero Section */}
        <motion.div 
          className="text-center py-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Social</span> Hub
          </h1>
          <p className="text-gray-300 text-lg mb-6">Connect with friends and discover what they're watching</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              onClick={navigateToFindFriends}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Find Friends
            </Button>
            <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
              <Share2 className="h-4 w-4 mr-2" />
              Invite Friends
            </Button>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <TabsTrigger value="feed" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300">
              <TrendingUp className="h-4 w-4 mr-2" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="friends" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-300">
              <Users className="h-4 w-4 mr-2" />
              Friends
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="space-y-6 mt-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {mockActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  isLiked={likedActivities.has(activity.id)}
                  onToggleLike={handleToggleLike}
                />
              ))}
            </motion.div>
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-6 mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Your Friends</h2>
              <Button 
                onClick={navigateToFindFriends}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Find Friends
              </Button>
            </div>

            {/* Friends Grid with integrated suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Existing Friends */}
              {mockFriends.filter(f => f.isFollowing).map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}

              {/* Seamlessly integrated Find Friends Cards */}
              {suggestionCards.map((card, index) => (
                <SuggestionCard key={index} {...card} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
