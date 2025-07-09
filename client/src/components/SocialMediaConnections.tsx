import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Facebook, Instagram, Twitter, MessageCircle, UserPlus, Users, X } from "lucide-react";

interface SocialConnection {
  id: number;
  platform: string;
  username?: string;
  displayName?: string;
  isActive: boolean;
  lastSynced?: string;
  createdAt: string;
}

interface FriendSuggestion {
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    email?: string;
  };
  reason: string;
  confidence: number;
  suggestionType: string;
}

export default function SocialMediaConnections() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form states
  const [facebookToken, setFacebookToken] = useState("");
  const [instagramToken, setInstagramToken] = useState("");
  const [snapchatUsername, setSnapchatUsername] = useState("");
  const [tiktokUsername, setTiktokUsername] = useState("");

  // Fetch connected accounts
  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ['/api/social/connections'],
    staleTime: 30000,
  });

  // Fetch friend suggestions
  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ['/api/social/suggestions'],
    staleTime: 30000,
  });

  // Connection mutations
  const facebookMutation = useMutation({
    mutationFn: () => {
      // Redirect to Facebook OAuth flow
      window.location.href = '/api/auth/facebook';
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({
        title: "Redirecting to Facebook",
        description: "You'll be redirected to Facebook to connect your account",
      });
    },
    onError: (error) => {
      toast({
        title: "Facebook Connection Failed",
        description: error.message || "Failed to connect Facebook",
        variant: "destructive",
      });
    }
  });

  const instagramMutation = useMutation({
    mutationFn: () => {
      // Redirect to Instagram OAuth flow
      window.location.href = '/api/auth/instagram';
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({
        title: "Redirecting to Instagram",
        description: "You'll be redirected to Instagram to connect your account",
      });
    },
    onError: (error) => {
      toast({
        title: "Instagram Connection Failed",
        description: error.message || "Failed to connect Instagram",
        variant: "destructive",
      });
    }
  });

  const snapchatMutation = useMutation({
    mutationFn: () => {
      // Note: Snapchat OAuth not available via Supabase - redirect to login
      window.location.href = '/login';
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({
        title: "Redirecting to Snapchat",
        description: "You'll be redirected to Snapchat to connect your account",
      });
    },
    onError: (error) => {
      toast({
        title: "Snapchat Connection Failed",
        description: error.message || "Failed to connect Snapchat",
        variant: "destructive",
      });
    }
  });

  const tiktokMutation = useMutation({
    mutationFn: () => {
      // Note: TikTok OAuth not available via Supabase - redirect to login
      window.location.href = '/login';
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({
        title: "Redirecting to TikTok",
        description: "You'll be redirected to TikTok to connect your account",
      });
    },
    onError: (error) => {
      toast({
        title: "TikTok Connection Failed",
        description: error.message || "Failed to connect TikTok",
        variant: "destructive",
      });
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: async (platform: string) => 
      apiRequest(`/api/social/connections/${platform}`, {
        method: 'DELETE'
      }),
    onSuccess: (_, platform) => {
      toast({
        title: "Account Disconnected",
        description: `${platform} account disconnected successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/social/connections'] });
    },
    onError: (error) => {
      toast({
        title: "Disconnect Failed",
        description: error.message || "Failed to disconnect account",
        variant: "destructive",
      });
    }
  });

  const sendFriendRequestMutation = useMutation({
    mutationFn: async (friendId: string) => 
      apiRequest('/api/friends/request', {
        method: 'POST',
        body: { friendId }
      }),
    onSuccess: () => {
      toast({
        title: "Friend Request Sent",
        description: "Your friend request has been sent",
      });
    },
    onError: (error) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to send friend request",
        variant: "destructive",
      });
    }
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'snapchat':
        return <MessageCircle className="h-4 w-4" />;
      case 'tiktok':
        return <Twitter className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return 'bg-blue-500';
      case 'instagram':
        return 'bg-pink-500';
      case 'snapchat':
        return 'bg-yellow-500';
      case 'tiktok':
        return 'bg-black';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connect Social Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Connect Social Accounts
          </CardTitle>
          <CardDescription>
            Find friends from your social media accounts who are also on BingeBoard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Facebook */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Facebook className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Facebook</span>
            </div>
            <Button 
              onClick={() => facebookMutation.mutate()}
              disabled={facebookMutation.isPending}
              className="w-full"
            >
              {facebookMutation.isPending ? "Redirecting..." : "Connect with Facebook"}
            </Button>
          </div>

          <Separator />

          {/* Instagram */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-600" />
              <span className="font-medium">Instagram</span>
            </div>
            <Button 
              onClick={() => instagramMutation.mutate()}
              disabled={instagramMutation.isPending}
              className="w-full"
            >
              {instagramMutation.isPending ? "Redirecting..." : "Connect with Instagram"}
            </Button>
          </div>

          <Separator />

          {/* Snapchat */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium">Snapchat</span>
            </div>
            <Button 
              onClick={() => snapchatMutation.mutate()}
              disabled={snapchatMutation.isPending}
              className="w-full"
            >
              {snapchatMutation.isPending ? "Redirecting..." : "Connect with Snapchat"}
            </Button>
          </div>

          <Separator />

          {/* TikTok */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Twitter className="h-4 w-4 text-black" />
              <span className="font-medium">TikTok</span>
            </div>
            <Button 
              onClick={() => tiktokMutation.mutate()}
              disabled={tiktokMutation.isPending}
              className="w-full"
            >
              {tiktokMutation.isPending ? "Redirecting..." : "Connect with TikTok"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Manage your connected social media accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectionsLoading ? (
            <div className="text-center py-4">Loading connections...</div>
          ) : connections.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No social accounts connected yet
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map((connection: SocialConnection) => (
                <div key={connection.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getPlatformColor(connection.platform)}`}>
                      {getPlatformIcon(connection.platform)}
                    </div>
                    <div>
                      <div className="font-medium capitalize">{connection.platform}</div>
                      {connection.username && (
                        <div className="text-sm text-muted-foreground">@{connection.username}</div>
                      )}
                      {connection.displayName && (
                        <div className="text-sm text-muted-foreground">{connection.displayName}</div>
                      )}
                    </div>
                    <Badge variant={connection.isActive ? "default" : "secondary"}>
                      {connection.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectMutation.mutate(connection.platform)}
                    disabled={disconnectMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Disconnect
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Friend Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Friend Suggestions</CardTitle>
          <CardDescription>
            People you may know from your connected social accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suggestionsLoading ? (
            <div className="text-center py-4">Loading suggestions...</div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No friend suggestions available. Connect social accounts to find friends!
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion: FriendSuggestion, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {suggestion.user.profileImageUrl ? (
                      <img
                        src={suggestion.user.profileImageUrl}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">
                        {suggestion.user.firstName} {suggestion.user.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {suggestion.reason}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Confidence: {Math.round(suggestion.confidence * 100)}%
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {suggestion.suggestionType.replace('_', ' ')}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => sendFriendRequestMutation.mutate(suggestion.user.id)}
                    disabled={sendFriendRequestMutation.isPending}
                    size="sm"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add Friend
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}