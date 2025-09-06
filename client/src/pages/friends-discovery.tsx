import { useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  UserPlus,
  Users,
  MessageCircle,
  Star,
  Clock,
  Smartphone,
  Mail
} from "lucide-react";

interface SuggestedFriend {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  mutualFriends: number;
  commonShows: number;
  source: 'facebook' | 'email' | 'phone' | 'bingeboard';
}

const mockSuggestedFriends: SuggestedFriend[] = [
  {
    id: "1",
    firstName: "Alex",
    lastName: "Chen",
    email: "alex.chen@example.com",
    profileImageUrl: "https://i.pravatar.cc/150?img=6",
    mutualFriends: 5,
    commonShows: 12,
    source: 'facebook'
  },
  {
    id: "2", 
    firstName: "Jordan",
    lastName: "Smith",
    email: "jordan.smith@example.com",
    profileImageUrl: "https://i.pravatar.cc/150?img=7",
    mutualFriends: 3,
    commonShows: 8,
    source: 'email'
  }
];

export default function FriendsDiscovery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<'all' | 'facebook' | 'email' | 'phone' | 'bingeboard'>('all');

  const filteredSuggestions = selectedSource === 'all'
    ? mockSuggestedFriends
    : mockSuggestedFriends.filter((friend) => friend.source === selectedSource);

  // Handle adding a friend
  const handleAddFriend = async (friend: SuggestedFriend) => {
    try {
      console.log('Adding friend:', friend);
      // API call to add friend (placeholder)
      // await addFriend(friend.id);
      
      // Show success feedback
      alert(`Friend request sent to ${friend.firstName} ${friend.lastName}!`);
      
      // Optionally remove from suggestions or update UI
    } catch (error) {
      console.error('Failed to add friend:', error);
      alert('Failed to send friend request. Please try again.');
    }
  };

  // Handle connecting to Facebook
  const handleConnectFacebook = () => {
    console.log('Connecting to Facebook...');
    // Implement Facebook connection logic
    alert('Facebook integration coming soon!');
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Searching for:', query);
    // In a real app, this would trigger an API call to search for users
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'facebook':
        return <div className="h-4 w-4 bg-blue-500 rounded"></div>;
      case 'email':
        return <Mail className="h-4 w-4 text-green-500" />;
      case 'phone':
        return <Smartphone className="h-4 w-4 text-purple-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Find Your <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Friends</span>
        </h1>
        <p className="text-gray-400">
          Connect with friends and discover what they're watching
        </p>
      </div>

      {/* Search Section */}
      <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Connect Social Networks */}
      <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Connect Your Social Networks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={handleConnectFacebook}
              className="bg-blue-600/10 border-blue-500/50 text-blue-300 hover:bg-blue-500/20 justify-start"
            >
              <div className="h-5 w-5 mr-3 bg-blue-500 rounded" />
              Find Facebook Friends
            </Button>

            <Button
              variant="outline"
              disabled
              className="bg-gray-800/50 border-gray-600 text-gray-400 justify-start opacity-50"
            >
              <MessageCircle className="h-5 w-5 mr-3 text-blue-400" />
              Contact Sync (Coming Soon)
            </Button>

            <Button
              variant="outline"
              disabled
              className="bg-gray-800/50 border-gray-600 text-gray-400 justify-start opacity-50"
            >
              <Mail className="h-5 w-5 mr-3 text-green-400" />
              Email Import (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Source Filter */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'all', label: 'All Sources' },
          { id: 'facebook', label: 'Facebook' },
          { id: 'email', label: 'Email' },
          { id: 'phone', label: 'Phone' },
          { id: 'bingeboard', label: 'BingeBoard' }
        ].map((source) => (
          <Button
            key={source.id}
            variant={selectedSource === source.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSource(source.id as any)}
            className={selectedSource === source.id 
              ? "bg-purple-600 text-white" 
              : "border-gray-600 text-gray-300 hover:bg-gray-600"
            }
          >
            {source.label}
          </Button>
        ))}
      </div>

      {/* Suggested Friends */}
      <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Suggested Friends ({filteredSuggestions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSuggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSuggestions.map((friend) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50 hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-purple-500/50">
                      <AvatarImage src={friend.profileImageUrl} alt={`${friend.firstName} ${friend.lastName}`} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {friend.firstName[0]}{friend.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-white">
                        {friend.firstName} {friend.lastName}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">{friend.email}</p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {getSourceIcon(friend.source)}
                        <span className="text-xs text-gray-500 capitalize">{friend.source}</span>
                      </div>

                      {(friend.mutualFriends > 0 || friend.commonShows > 0) && (
                        <div className="flex gap-3 text-xs text-gray-500">
                          {friend.mutualFriends > 0 && (
                            <span>{friend.mutualFriends} mutual friends</span>
                          )}
                          {friend.commonShows > 0 && (
                            <span>{friend.commonShows} shows in common</span>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      size="sm"
                      onClick={() => handleAddFriend(friend)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Friend
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No friend suggestions available</p>
              <p className="text-gray-500 text-sm">
                Connect your social networks or search for friends manually
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}