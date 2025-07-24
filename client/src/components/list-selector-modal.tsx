import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Check, 
  List, 
  Lock, 
  Globe, 
  Users,
  Star,
  Calendar,
  Play
} from 'lucide-react';

interface ListSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  show: any;
  onSuccess?: () => void;
}

interface UserList {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  itemCount: number;
  createdAt: string;
}

export function ListSelectorModal({ 
  isOpen, 
  onClose, 
  show, 
  onSuccess 
}: ListSelectorModalProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's custom lists
  const { data: userLists = [], isLoading, error } = useQuery<UserList[]>({
    queryKey: ['/api/lists'],
    queryFn: async () => {
      const response = await fetch('/api/lists', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch lists');
      }
      const data = await response.json();
      // Extract lists array from the response object
      return data.lists || [];
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.status === 401 || error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 3;
    }
  });

  // Create new list mutation
  const createListMutation = useMutation({
    mutationFn: async (listData: {
      name: string;
      description: string;
      isPublic: boolean;
    }) => {
      const response = await apiRequest('POST', '/api/lists', listData);
      return await response.json();
    },
    onSuccess: (newList: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/lists'] });
      setShowCreateForm(false);
      setNewListName('');
      setNewListDescription('');
      setIsPublic(false);
      toast({
        title: "List Created",
        description: `"${newList.name}" has been created successfully.`,
      });
      // Auto-select the new list and add the show
      addToListMutation.mutate({ listId: newList.id, show });
    },
    onError: (error: any) => {
      console.error("Create list error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create list.",
        variant: "destructive",
      });
    }
  });

  // Add show to list mutation
  const addToListMutation = useMutation({
    mutationFn: async ({ listId, show }: { listId: number; show: any }) => {
      const response = await apiRequest('POST', `/api/lists/${listId}/items`, {
        show: {
          id: show.id,
          title: show.title || show.name,
          overview: show.overview,
          poster_path: show.poster_path,
          backdrop_path: show.backdrop_path,
          genre_ids: show.genre_ids || [],
          vote_average: show.vote_average || 0,
          first_air_date: show.first_air_date || null
        }
      });
      return await response.json();
    },
    onSuccess: (_, { listId }) => {
      const list = Array.isArray(userLists) ? userLists.find(l => l.id === listId) : null;
      queryClient.invalidateQueries({ queryKey: ['/api/lists'] });
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/items`] });
      toast({
        title: "Added to List",
        description: `"${show.title || show.name}" has been added to "${list?.name || 'your list'}".`,
      });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add show to list.",
        variant: "destructive",
      });
    }
  });

  const handleCreateList = () => {
    if (!newListName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a list name.",
        variant: "destructive",
      });
      return;
    }

    createListMutation.mutate({
      name: newListName.trim(),
      description: newListDescription.trim(),
      isPublic
    });
  };

  const handleAddToList = (listId: number) => {
    addToListMutation.mutate({ listId, show });
  };

  const handleQuickAdd = (listType: string) => {
    // Quick add to default lists
    const defaultLists = {
      watchlist: "My Watchlist",
      favorites: "Favorites",
      watching: "Currently Watching"
    };

    // This would either find existing default list or create it
    const listName = defaultLists[listType as keyof typeof defaultLists];
    createListMutation.mutate({
      name: listName,
      description: `My ${listName.toLowerCase()}`,
      isPublic: false
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-center flex items-center gap-2 justify-center">
            <List className="h-5 w-5 text-teal-400" />
            Add to List
          </DialogTitle>
          <div className="text-center">
            <p className="text-sm text-gray-400">
              {show?.title || show?.name}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              {show?.poster_path && (
                <img 
                  src={`https://image.tmdb.org/t/p/w92${show.poster_path}`}
                  alt={show.title || show.name}
                  className="w-8 h-12 object-cover rounded"
                />
              )}
              {show?.vote_average && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-400">
                    {show.vote_average.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="space-y-2">
            <Label className="text-white text-sm font-medium">Quick Actions</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="border-slate-600 hover:border-teal-500 hover:bg-teal-500/10"
                onClick={() => handleQuickAdd('watchlist')}
                disabled={addToListMutation.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                Watchlist
              </Button>
              <Button
                variant="outline"
                className="border-slate-600 hover:border-yellow-500 hover:bg-yellow-500/10"
                onClick={() => handleQuickAdd('favorites')}
                disabled={addToListMutation.isPending}
              >
                <Star className="h-4 w-4 mr-2" />
                Favorites
              </Button>
            </div>
          </div>

          {/* Existing Lists */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-white text-sm font-medium">Your Lists</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="text-teal-400 hover:text-teal-300"
              >
                <Plus className="h-4 w-4 mr-1" />
                New List
              </Button>
            </div>
            
            {isLoading ? (
              <div className="text-center text-gray-400 py-4">Loading your lists...</div>
            ) : !userLists || !Array.isArray(userLists) || userLists.length === 0 ? (
              <div className="text-center text-gray-400 py-4">
                <List className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No lists yet. Create your first list!
              </div>
            ) : (
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {Array.isArray(userLists) && userLists.map((list) => (
                    <Card key={list.id} className="border-slate-600 hover:border-slate-500 transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-white font-medium text-sm">{list.name}</h4>
                              {list.isPublic ? (
                                <Globe className="h-3 w-3 text-blue-400" />
                              ) : (
                                <Lock className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                            {list.description && (
                              <p className="text-gray-400 text-xs mt-1">{list.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {list.itemCount} items
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Created {new Date(list.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddToList(list.id)}
                            disabled={addToListMutation.isPending}
                            className="bg-teal-600 hover:bg-teal-700"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Create New List Form */}
          {showCreateForm && (
            <Card className="border-slate-600">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="listName" className="text-white">List Name</Label>
                  <Input
                    id="listName"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="e.g., Weekend Binges, Must Watch, Horror Movies"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="listDescription" className="text-white">Description (Optional)</Label>
                  <Input
                    id="listDescription"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="What's this list for?"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublic"
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                    <Label htmlFor="isPublic" className="text-white text-sm">
                      Make this list public
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPublic ? (
                      <Users className="h-4 w-4 text-blue-400" />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateList}
                    disabled={createListMutation.isPending}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                  >
                    {createListMutation.isPending ? (
                      "Creating..."
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create List
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="border-slate-600"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}