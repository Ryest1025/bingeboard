import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Search, Heart, Share2 } from "lucide-react";
import SocialMediaConnections from "@/components/SocialMediaConnections";

interface Friend {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string;
}

export default function Friends() {
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["/api/friends"],
  });

  const friendsList = Array.isArray(friends) ? friends : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(228,25%,3%)] via-[hsl(226,22%,6%)] to-[hsl(224,20%,8%)] p-4 pb-20">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="glass-dark border-slate-700 animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-slate-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                      <div className="h-3 bg-slate-700 rounded w-1/2"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-[hsl(228,25%,3%)] via-[hsl(226,22%,6%)] to-[hsl(224,20%,8%)] p-4 pb-20">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4 flex items-center">
            <Users className="h-8 w-8 mr-3 text-cyan-400" />
            Friends
          </h1>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
              <UserPlus className="h-4 w-4 mr-2" />
              Find Friends
            </Button>
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="friends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-slate-700">
            <TabsTrigger 
              value="friends" 
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-400 text-slate-400"
            >
              <Users className="h-4 w-4 mr-2" />
              My Friends
            </TabsTrigger>
            <TabsTrigger 
              value="social" 
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-400 text-slate-400"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Social Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-4">
            {/* Friends List */}
        {friendsList.length === 0 ? (
          <Card className="glass-dark border-slate-700">
            <CardContent className="p-12 text-center">
              <Users className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-3">No Friends Yet</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Connect with friends to share your watching experience and discover new shows together.
              </p>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                <UserPlus className="h-4 w-4 mr-2" />
                Find Friends
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {friendsList.map((friend: Friend) => (
              <Card 
                key={friend.id} 
                className="glass-dark border-slate-700 hover:border-cyan-400/30 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <Avatar className="h-16 w-16">
                        <AvatarImage 
                          src={friend.profileImageUrl || undefined} 
                          alt={`${friend.firstName || 'User'}'s avatar`} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-lg">
                          {friend.firstName?.[0] || friend.email?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      {/* Friend Info */}
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {friend.firstName && friend.lastName 
                            ? `${friend.firstName} ${friend.lastName}`
                            : friend.email || 'Anonymous User'
                          }
                        </h3>
                        {friend.email && (friend.firstName || friend.lastName) && (
                          <p className="text-gray-400 text-sm">{friend.email}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="bg-slate-700 text-cyan-400">
                            <Heart className="h-3 w-3 mr-1" />
                            Friend
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="border-slate-600 text-white hover:bg-slate-800">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Friend Suggestions Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <UserPlus className="h-6 w-6 mr-2 text-cyan-400" />
            Suggested Friends
          </h2>
          <Card className="glass-dark border-slate-700">
            <CardContent className="p-8 text-center">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">
                Connect your social accounts to find friends who are already using BingeBoard
              </p>
              <Button 
                variant="outline" 
                className="mt-4 border-slate-600 text-white hover:bg-slate-800"
              >
                Connect Social Accounts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}