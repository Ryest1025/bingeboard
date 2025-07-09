import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, UserPlus, Upload, Users, Mail, Phone, Facebook, Twitter, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string;
};

type FriendSuggestion = {
  id: number;
  suggestedUserId: string;
  suggestionType: string;
  mutualFriendCount: number;
  confidence: number;
  reason: string;
  user: User;
};

type ContactImport = {
  id: number;
  contactEmail: string;
  contactName: string;
  contactPhone: string;
  source: string;
  isMatched: boolean;
  matchedUserId: string;
  matchedUser?: User;
};

export default function FindFriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [contactText, setContactText] = useState("");
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch friend suggestions
  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ["/api/friend-suggestions"],
  });

  // Fetch user search results
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ["/api/users/search", searchQuery],
    enabled: searchQuery.length > 2,
  });

  // Fetch imported contacts
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ["/api/contacts"],
  });

  // Send friend request mutation
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (friendId: string) => {
      return apiRequest("POST", "/api/friend-requests", { friendId });
    },
    onSuccess: () => {
      toast({
        title: "Friend request sent",
        description: "Your friend request has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/friend-suggestions"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send friend request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Import contacts mutation
  const importContactsMutation = useMutation({
    mutationFn: async (contactData: string) => {
      return apiRequest("POST", "/api/contacts/import", { contactData });
    },
    onSuccess: () => {
      toast({
        title: "Contacts imported",
        description: "Your contacts have been imported successfully.",
      });
      setIsContactDialogOpen(false);
      setContactText("");
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friend-suggestions"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to import contacts. Please check the format and try again.",
        variant: "destructive",
      });
    },
  });

  // Dismiss suggestion mutation
  const dismissSuggestionMutation = useMutation({
    mutationFn: async (suggestionId: number) => {
      return apiRequest("DELETE", `/api/friend-suggestions/${suggestionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friend-suggestions"] });
    },
  });

  const handleSendFriendRequest = (userId: string) => {
    sendFriendRequestMutation.mutate(userId);
  };

  const handleDismissSuggestion = (suggestionId: number) => {
    dismissSuggestionMutation.mutate(suggestionId);
  };

  const handleImportContacts = () => {
    if (!contactText.trim()) {
      toast({
        title: "Error",
        description: "Please enter contact information.",
        variant: "destructive",
      });
      return;
    }
    importContactsMutation.mutate(contactText);
  };

  const UserCard = ({ user, onAddFriend, showMutualFriends = 0, reason = "" }: {
    user: User;
    onAddFriend: () => void;
    showMutualFriends?: number;
    reason?: string;
  }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.profileImageUrl} alt={user.username} />
            <AvatarFallback>
              {user.firstName?.[0]}{user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{user.firstName} {user.lastName}</div>
            <div className="text-sm text-muted-foreground">@{user.username}</div>
            {showMutualFriends > 0 && (
              <div className="text-xs text-muted-foreground">
                {showMutualFriends} mutual friend{showMutualFriends > 1 ? 's' : ''}
              </div>
            )}
            {reason && (
              <div className="text-xs text-muted-foreground">{reason}</div>
            )}
          </div>
        </div>
        <Button
          onClick={onAddFriend}
          disabled={sendFriendRequestMutation.isPending}
          size="sm"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Friend
        </Button>
      </div>
    </Card>
  );

  const SuggestionCard = ({ suggestion, onAddFriend, onDismiss }: {
    suggestion: FriendSuggestion;
    onAddFriend: () => void;
    onDismiss: () => void;
  }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={suggestion.user.profileImageUrl} alt={suggestion.user.username} />
            <AvatarFallback>
              {suggestion.user.firstName?.[0]}{suggestion.user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{suggestion.user.firstName} {suggestion.user.lastName}</div>
            <div className="text-sm text-muted-foreground">@{suggestion.user.username}</div>
            {suggestion.mutualFriendCount > 0 && (
              <div className="text-xs text-muted-foreground">
                {suggestion.mutualFriendCount} mutual friend{suggestion.mutualFriendCount > 1 ? 's' : ''}
              </div>
            )}
            {suggestion.reason && (
              <div className="text-xs text-muted-foreground">{suggestion.reason}</div>
            )}
            <Badge variant="secondary" className="text-xs mt-1">
              {suggestion.suggestionType.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onAddFriend}
            disabled={sendFriendRequestMutation.isPending}
            size="sm"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
          <Button
            onClick={onDismiss}
            variant="outline"
            size="sm"
            disabled={dismissSuggestionMutation.isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Friends</h1>
        <p className="text-muted-foreground">
          Discover and connect with friends who share your interests in TV shows and entertainment.
        </p>
      </div>

      <Tabs defaultValue="suggestions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Friend Suggestions
              </CardTitle>
              <CardDescription>
                People you might know based on mutual friends and contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suggestionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="mt-4 text-muted-foreground">Loading suggestions...</p>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No friend suggestions available</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try importing your contacts or searching for friends by username
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion: FriendSuggestion) => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onAddFriend={() => handleSendFriendRequest(suggestion.suggestedUserId)}
                      onDismiss={() => handleDismissSuggestion(suggestion.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Users
              </CardTitle>
              <CardDescription>
                Find friends by username or name
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search">Search by username or name</Label>
                  <Input
                    id="search"
                    type="text"
                    placeholder="Enter username or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-2"
                  />
                </div>

                {searchQuery.length > 2 && (
                  <div className="space-y-4">
                    {searchLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                        <p className="mt-4 text-muted-foreground">Searching...</p>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="text-center py-8">
                        <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No users found</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Try a different search term
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {searchResults.map((user: User) => (
                          <UserCard
                            key={user.id}
                            user={user}
                            onAddFriend={() => handleSendFriendRequest(user.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Import
              </CardTitle>
              <CardDescription>
                Import your contacts to find friends who are already using BingeBoard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Contacts
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Import Contacts</DialogTitle>
                      <DialogDescription>
                        Paste your contact information below. Each contact should be on a separate line.
                        Format: Name &lt;email@example.com&gt; or just email@example.com
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="John Doe <john@example.com>&#10;jane@example.com&#10;Bob Smith <bob@example.com>"
                        value={contactText}
                        onChange={(e) => setContactText(e.target.value)}
                        className="min-h-32"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleImportContacts}
                          disabled={importContactsMutation.isPending}
                          className="flex-1"
                        >
                          {importContactsMutation.isPending ? "Importing..." : "Import"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsContactDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-4">Imported Contacts</h3>
                  {contactsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                      <p className="mt-4 text-muted-foreground">Loading contacts...</p>
                    </div>
                  ) : contacts.length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No contacts imported yet</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Import your contacts to find friends on BingeBoard
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contacts.map((contact: ContactImport) => (
                        <Card key={contact.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <div className="font-medium">{contact.contactName || contact.contactEmail}</div>
                                <div className="text-sm text-muted-foreground">{contact.contactEmail}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {contact.isMatched ? (
                                <div className="flex items-center gap-2">
                                  <Badge variant="default">Matched</Badge>
                                  {contact.matchedUser && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleSendFriendRequest(contact.matchedUserId)}
                                      disabled={sendFriendRequestMutation.isPending}
                                    >
                                      <UserPlus className="h-4 w-4 mr-2" />
                                      Add Friend
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                <Badge variant="secondary">Not Found</Badge>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="h-5 w-5" />
                Social Media Integration
              </CardTitle>
              <CardDescription>
                Connect your social media accounts to find friends (Coming Soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="flex justify-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Facebook className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Twitter className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-2">Social media integration coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    We're working on integrating with Facebook and Twitter to help you find friends more easily.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}