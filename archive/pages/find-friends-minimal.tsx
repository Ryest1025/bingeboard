import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, UserPlus, Users, Facebook, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

export default function FindFriendsMinimal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const { toast } = useToast();

  // Check URL parameters for connection status
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');
    const error = urlParams.get('error');

    if (connected === 'facebook') {
      toast({
        title: "Facebook Connected",
        description: "Successfully connected to Facebook. You can now find friends from your Facebook network.",
      });
      // Clean up URL
      window.history.replaceState({}, '', '/find-friends');
    } else if (connected === 'google') {
      toast({
        title: "Google Connected",
        description: "Successfully connected to Google. Friend discovery features will be available soon.",
      });
      window.history.replaceState({}, '', '/find-friends');
    } else if (error) {
      let errorMessage = "Authentication failed. Please try again.";
      if (error.includes('facebook')) {
        errorMessage = "Facebook authentication is temporarily unavailable due to app review process. Please use Google login or search for friends manually.";
      }
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
      window.history.replaceState({}, '', '/find-friends');
    }
  }, [toast]);

  // Search users mutation
  const searchUsersMutation = useMutation({
    mutationFn: async (query: string) => {
      return await apiRequest("GET", `/api/users/search?q=${encodeURIComponent(query)}`);
    },
    onSuccess: (data) => {
      setSearchResults(data);
    },
    onError: (error) => {
      console.error("Search error:", error);
      toast({
        title: "Search Failed",
        description: "Unable to search users. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Send friend request mutation
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (friendId: string) => {
      return await apiRequest("POST", "/api/friends/request", { friendId });
    },
    onSuccess: () => {
      toast({
        title: "Friend Request Sent",
        description: "Your friend request has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
    },
    onError: (error) => {
      console.error("Friend request error:", error);
      toast({
        title: "Request Failed",
        description: "Unable to send friend request. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Social media connection mutations
  const connectFacebookMutation = useMutation({
    mutationFn: async () => {
      // Redirect to Facebook OAuth
      window.location.href = "/api/auth/facebook/connect";
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Facebook. Please try again.",
        variant: "destructive",
      });
    }
  });

  const connectGoogleMutation = useMutation({
    mutationFn: async () => {
      // Redirect to Google OAuth
      window.location.href = "/api/auth/google/connect";
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Google. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSearch = () => {
    if (searchQuery.length >= 3) {
      searchUsersMutation.mutate(searchQuery);
    }
  };

  const handleConnectFacebook = () => {
    connectFacebookMutation.mutate();
  };

  const handleConnectGoogle = () => {
    connectGoogleMutation.mutate();
  };

  const handleSendFriendRequest = (friendId: string) => {
    sendFriendRequestMutation.mutate(friendId);
  };

  return (
    <div className="min-h-screen bg-binge-dark text-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Friends</h1>
          <p className="text-gray-300">Discover and connect with friends on BingeBoard</p>
        </div>

        {/* Social Media Integration */}
        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Connect Social Media
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              Connect your social media accounts to find friends who are already on BingeBoard.
            </p>
            <div className="flex gap-3">
              <Button 
                disabled={true}
                className="bg-gray-500 cursor-not-allowed"
                title="Facebook authentication temporarily unavailable due to app review process"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook (Under Review)
              </Button>
              <Button 
                onClick={handleConnectGoogle}
                disabled={connectGoogleMutation.isPending}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {connectGoogleMutation.isPending ? "Connecting..." : "Connect Google"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Search */}
        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Search by username, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch}
                disabled={searchQuery.length < 3 || searchUsersMutation.isPending}
              >
                {searchUsersMutation.isPending ? "Searching..." : "Search"}
              </Button>
            </div>
            {searchQuery.length < 3 && (
              <p className="text-sm text-gray-400 mt-2">
                Type at least 3 characters to search
              </p>
            )}
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold">Search Results:</h3>
                {searchResults.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      {user.profileImageUrl && (
                        <img 
                          src={user.profileImageUrl} 
                          alt={user.firstName || user.email} 
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSendFriendRequest(user.id)}
                      disabled={sendFriendRequestMutation.isPending}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      {sendFriendRequestMutation.isPending ? "Sending..." : "Add Friend"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Import Contacts */}
        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Import Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              Import your contacts to find friends who are already on BingeBoard.
            </p>
            <Button variant="outline">
              Import Contacts
            </Button>
          </CardContent>
        </Card>

        {/* Coming Soon Features */}
        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              More Features Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-gray-300 space-y-2">
              <li>• Friend suggestions based on mutual connections</li>
              <li>• Advanced contact synchronization</li>
              <li>• Smart friend discovery algorithms</li>
              <li>• Cross-platform friend matching</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}