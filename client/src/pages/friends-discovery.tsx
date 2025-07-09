import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { SiFacebook, SiInstagram } from "react-icons/si";
import NavigationHeader from "@/components/navigation-header";


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

export default function FriendsDiscovery() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<'all' | 'facebook' | 'email' | 'phone' | 'bingeboard'>('all');

  // Fetch suggested friends
  const { data: suggestedFriends = [], isLoading } = useQuery<SuggestedFriend[]>({
    queryKey: ['/api/friends/suggestions'],
    retry: false,
  });

  // Search users
  const { data: searchResults = [], isLoading: isSearching } = useQuery<any[]>({
    queryKey: ['/api/friends/search', searchQuery],
    enabled: searchQuery.length > 2,
    retry: false,
  });

  // Send friend request mutation
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (friendId: string) => {
      return await apiRequest('/api/friends/send-request', 'POST', { friendId });
    },
    onSuccess: () => {
      toast({
        title: "Friend Request Sent",
        description: "Your friend request has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/friends/suggestions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Request",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Connect social network
  const connectSocialMutation = useMutation({
    mutationFn: async (platform: string) => {
      if (platform === 'facebook') {
        window.location.href = '/api/auth/facebook';
      }
      return { platform };
    },
    onSuccess: (data) => {
      toast({
        title: "Connecting...",
        description: `Redirecting to ${data.platform} to find your friends.`,
      });
    },
  });

  const handleSendFriendRequest = (friendId: string) => {
    sendFriendRequestMutation.mutate(friendId);
  };

  const handleConnectSocial = (platform: string) => {
    connectSocialMutation.mutate(platform);
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'facebook':
        return <SiFacebook className="h-4 w-4 text-blue-500" />;
      case 'email':
        return <Mail className="h-4 w-4 text-green-500" />;
      case 'phone':
        return <Smartphone className="h-4 w-4 text-purple-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredSuggestions = selectedSource === 'all' 
    ? suggestedFriends 
    : suggestedFriends.filter((friend: SuggestedFriend) => friend.source === selectedSource);

  return (
    <div className="min-h-screen bg-binge-dark">
      <NavigationHeader />
      
      <div className="pt-16 pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Find Your <span className="text-gradient-purple">Friends</span>
            </h1>
            <p className="text-gray-400">
              Connect with friends and discover what they're watching
            </p>
          </div>

          {/* Connect Social Networks */}
          <Card className="glass-effect border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Connect Your Social Networks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleConnectSocial('facebook')}
                  variant="outline"
                  className="glass-effect border-white/20 hover:bg-blue-500/10 text-white justify-start"
                >
                  <SiFacebook className="h-5 w-5 mr-3 text-blue-500" />
                  Find Facebook Friends
                </Button>
                
                <Button
                  variant="outline"
                  disabled
                  className="glass-effect border-white/20 text-gray-400 justify-start opacity-50"
                >
                  <MessageCircle className="h-5 w-5 mr-3 text-blue-400" />
                  Twitter (Coming Soon)
                </Button>
                
                <Button
                  variant="outline"
                  disabled
                  className="glass-effect border-white/20 text-gray-400 justify-start opacity-50"
                >
                  <SiInstagram className="h-5 w-5 mr-3 text-pink-500" />
                  Instagram (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <Card className="glass-effect border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-effect border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              
              {searchQuery.length > 2 && (
                <div className="mt-4 space-y-3">
                  {isSearching ? (
                    <div className="text-center py-4 text-gray-400">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-3 glass-effect rounded-lg border border-white/10">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.profileImageUrl} />
                            <AvatarFallback className="bg-purple-600 text-white">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleSendFriendRequest(user.id)}
                          disabled={sendFriendRequestMutation.isPending}
                          size="sm"
                          className="bg-gradient-purple hover:opacity-90"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Friend
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      No users found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Suggested Friends */}
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 mb-4">
                <Star className="h-5 w-5" />
                Suggested Friends
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {['all', 'facebook', 'email', 'bingeboard'].map((source) => (
                  <Button
                    key={source}
                    variant={selectedSource === source ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSource(source as any)}
                    className={selectedSource === source 
                      ? "bg-gradient-purple hover:opacity-90" 
                      : "glass-effect border-white/20 text-white hover:bg-white/10"
                    }
                  >
                    {source === 'all' ? 'All' : source.charAt(0).toUpperCase() + source.slice(1)}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-gray-400">
                  Loading suggestions...
                </div>
              ) : filteredSuggestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSuggestions.map((friend: SuggestedFriend) => (
                    <div key={friend.id} className="glass-effect rounded-lg border border-white/10 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={friend.profileImageUrl} />
                            <AvatarFallback className="bg-purple-600 text-white">
                              {friend.firstName[0]}{friend.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">
                              {friend.firstName} {friend.lastName}
                            </p>
                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                              {getSourceIcon(friend.source)}
                              <span className="capitalize">{friend.source}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {friend.mutualFriends > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">
                              {friend.mutualFriends} mutual friends
                            </span>
                          </div>
                        )}
                        {friend.commonShows > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">
                              {friend.commonShows} shows in common
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => handleSendFriendRequest(friend.id)}
                        disabled={sendFriendRequestMutation.isPending}
                        className="w-full bg-gradient-purple hover:opacity-90"
                        size="sm"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Friend
                      </Button>
                    </div>
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
        </div>
      </div>

    </div>
  );
}