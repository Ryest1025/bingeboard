import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Archive, 
  RotateCcw,
  Share, 
  Lock, 
  Unlock,
  Heart,
  Star,
  Calendar,
  User,
  Users,
  Search,
  Filter,
  SortAsc,
  MoreVertical,
  FolderPlus
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

// Separate form component for better organization
interface CollectionFormProps {
  collection: CreateCollectionData;
  availableTags: string[];
  tagSearchQuery: string;
  filteredTags: string[];
  isEditing: boolean;
  isLoading: boolean;
  onCollectionChange: (collection: CreateCollectionData) => void;
  onTagSearchChange: (query: string) => void;
  onTagToggle: (tag: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function CollectionForm({
  collection,
  availableTags,
  tagSearchQuery,
  filteredTags,
  isEditing,
  isLoading,
  onCollectionChange,
  onTagSearchChange,
  onTagToggle,
  onSubmit,
  onCancel
}: CollectionFormProps) {
  return (
    <div className="space-y-4 py-4">
      <div>
        <Label htmlFor="name">Collection Name *</Label>
        <Input
          id="name"
          value={collection.name}
          onChange={(e) => onCollectionChange({ ...collection, name: e.target.value })}
          placeholder="Enter collection name..."
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={collection.description}
          onChange={(e) => onCollectionChange({ ...collection, description: e.target.value })}
          placeholder="Describe your collection..."
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="public"
          checked={collection.is_public}
          onCheckedChange={(checked) => onCollectionChange({ ...collection, is_public: checked })}
        />
        <Label htmlFor="public" className="flex items-center gap-2">
          {collection.is_public ? (
            <>
              <Users className="h-4 w-4" />
              Public - Others can discover this collection
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Private - Only you can see this collection
            </>
          )}
        </Label>
      </div>

      <div>
        <Label>Tags</Label>
        {availableTags.length > 5 && (
          <div className="mt-2 mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tags..."
                value={tagSearchQuery}
                onChange={(e) => onTagSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
          {filteredTags.slice(0, 20).map(tag => (
            <Badge
              key={tag}
              variant={collection.tags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onTagToggle(tag)}
            >
              {tag}
            </Badge>
          ))}
          {filteredTags.length > 20 && (
            <Badge variant="outline" className="opacity-60">
              +{filteredTags.length - 20} more...
            </Badge>
          )}
        </div>
        {collection.tags.length > 0 && (
          <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <Label className="text-xs font-medium mb-1 block">Selected:</Label>
            <div className="flex flex-wrap gap-1">
              {collection.tags.map(tag => (
                <Badge key={tag} variant="default" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isLoading}>
          {isEditing ? 'Update' : 'Create'} Collection
        </Button>
      </div>
    </div>
  );
}

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface Collection {
  id: number;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  item_count?: number;
  tags: string[];
}

interface CreateCollectionData {
  name: string;
  description?: string;
  is_public: boolean;
  tags: string[];
}

interface CollectionManagerProps {
  user: any; // User object from useAuth
}

export default function CollectionManager({ user }: CollectionManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  // Debounce search query to reduce API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedTagSearch = useDebounce(tagSearchQuery, 200);

  const ITEMS_PER_PAGE = 12;

  const [newCollection, setNewCollection] = useState<CreateCollectionData>({
    name: '',
    description: '',
    is_public: false,
    tags: []
  });

  // Fetch collections
  const { data: collections = [], isLoading } = useQuery<Collection[]>({
    queryKey: ['/api/collections', activeTab, debouncedSearchQuery, sortBy, filterTags, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        user_id: user?.id || user?.uid || '',
        include_deleted: activeTab === 'deleted' ? 'true' : 'false',
        search: debouncedSearchQuery,
        sort_by: sortBy,
        tags: filterTags.join(','),
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString()
      });
      
      const response = await fetch(`/api/collections?${params}`, {
        credentials: 'include'
      });
      const data = await response.json();
      return data.collections || [];
    }
  });

  // Available tags for filtering (with search capability)
  const { data: availableTags = [] } = useQuery<string[]>({
    queryKey: ['/api/collections/tags'],
    queryFn: async () => {
      const response = await fetch('/api/collections/tags', {
        credentials: 'include'
      });
      const data = await response.json();
      return data.tags || [];
    }
  });

  // Filter tags based on search query
  const filteredAvailableTags = useMemo(() => {
    if (!debouncedTagSearch) return availableTags;
    return availableTags.filter(tag => 
      tag.toLowerCase().includes(debouncedTagSearch.toLowerCase())
    );
  }, [availableTags, debouncedTagSearch]);

  // Create collection mutation
  const createCollectionMutation = useMutation({
    mutationFn: async (collectionData: CreateCollectionData) => {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_id: user?.id || user?.uid || '',
          ...collectionData
        })
      });
      if (!response.ok) throw new Error('Failed to create collection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
      toast({
        title: 'Success',
        description: 'Collection created successfully!'
      });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create collection',
        variant: 'destructive'
      });
    }
  });

  // Update collection mutation
  const updateCollectionMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<CreateCollectionData>) => {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update collection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
      toast({
        title: 'Success',
        description: 'Collection updated successfully!'
      });
      setEditingCollection(null);
      resetForm();
    }
  });

  // Soft delete mutation
  const softDeleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/collections/${id}/soft-delete`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete collection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
      toast({
        title: 'Success',
        description: 'Collection moved to trash'
      });
      setDeleteTarget(null);
    }
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/collections/${id}/restore`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to restore collection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
      toast({
        title: 'Success',
        description: 'Collection restored successfully!'
      });
    }
  });

  // Permanent delete mutation
  const permanentDeleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to permanently delete collection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
      toast({
        title: 'Success',
        description: 'Collection permanently deleted'
      });
      setDeleteTarget(null);
    }
  });

  const resetForm = () => {
    setNewCollection({
      name: '',
      description: '',
      is_public: false,
      tags: []
    });
  };

  const handleTagToggle = (tag: string, target: 'new' | 'filter') => {
    if (target === 'new') {
      setNewCollection(prev => ({
        ...prev,
        tags: prev.tags.includes(tag)
          ? prev.tags.filter(t => t !== tag)
          : [...prev.tags, tag]
      }));
    } else {
      setFilterTags(prev => 
        prev.includes(tag)
          ? prev.filter(t => t !== tag)
          : [...prev, tag]
      );
    }
  };

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setNewCollection({
      name: collection.name,
      description: collection.description || '',
      is_public: collection.is_public,
      tags: collection.tags
    });
    setShowCreateDialog(true);
  };

  const handleSubmit = () => {
    if (!newCollection.name.trim()) {
      toast({
        title: 'Error',
        description: 'Collection name is required',
        variant: 'destructive'
      });
      return;
    }

    if (editingCollection) {
      updateCollectionMutation.mutate({
        id: editingCollection.id,
        ...newCollection
      });
    } else {
      createCollectionMutation.mutate(newCollection);
    }
  };

  const filteredCollections = collections.filter(collection => {
    if (activeTab === 'deleted' && !collection.deleted_at) return false;
    if (activeTab === 'active' && collection.deleted_at) return false;
    
    const matchesSearch = collection.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                         collection.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    
    const matchesTags = filterTags.length === 0 || 
                       filterTags.every(tag => collection.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const sortedCollections = [...filteredCollections].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created_at':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'updated_at':
      default:
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedCollections.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCollections = sortedCollections.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filterTags, activeTab]);

  return (
    <div className="space-y-6">
      {/* DEBUG: Visible indicator for Collection Manager */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg border-2 border-purple-400">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FolderPlus className="h-6 w-6" />
          📚 ENHANCED COLLECTION MANAGER LOADED!
        </h2>
        <p className="text-sm opacity-90">
          Total Collections: {collections.length} | Available Tags: {availableTags.length} | 
          Page: {currentPage}/{totalPages} | 
          🔍 Debounced Search | 🏷️ Smart Tag Filter | 📄 Pagination
        </p>
        <div className="flex gap-2 mt-2 text-xs">
          <Badge variant="secondary">Debounced Search (300ms)</Badge>
          <Badge variant="secondary">Smart Tag Filter</Badge>
          <Badge variant="secondary">Pagination ({ITEMS_PER_PAGE}/page)</Badge>
          <Badge variant="secondary">Enhanced Delete UX</Badge>
        </div>
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Collections</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCollection(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingCollection ? 'Edit Collection' : 'Create New Collection'}
              </DialogTitle>
            </DialogHeader>
            <CollectionForm
              collection={newCollection}
              availableTags={availableTags}
              tagSearchQuery={tagSearchQuery}
              filteredTags={filteredAvailableTags}
              isEditing={!!editingCollection}
              isLoading={createCollectionMutation.isPending || updateCollectionMutation.isPending}
              onCollectionChange={setNewCollection}
              onTagSearchChange={setTagSearchQuery}
              onTagToggle={(tag) => handleTagToggle(tag, 'new')}
              onSubmit={handleSubmit}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="glass-effect border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated_at">Last Updated</SelectItem>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
              
              {filterTags.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterTags([])}
                >
                  Clear Filters ({filterTags.length})
                </Button>
              )}
            </div>
          </div>

          {/* Tag Filters */}
          {availableTags.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Filter by tags:</Label>
                {filterTags.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterTags([])}
                    className="text-xs h-6 px-2"
                  >
                    Clear all ({filterTags.length})
                  </Button>
                )}
              </div>
              
              {availableTags.length > 10 && (
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tags to filter..."
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                      className="pl-10 h-8 text-sm"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {filteredAvailableTags.slice(0, 15).map(tag => (
                  <Badge
                    key={tag}
                    variant={filterTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:opacity-80 transition-opacity text-xs"
                    onClick={() => handleTagToggle(tag, 'filter')}
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {filteredAvailableTags.length > 15 && (
                  <Badge variant="outline" className="opacity-60 text-xs">
                    +{filteredAvailableTags.length - 15} more (refine search)
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collection Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Collections</TabsTrigger>
          <TabsTrigger value="deleted">Trash</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading collections...</div>
          ) : sortedCollections.length === 0 ? (
            <Card className="glass-effect border-white/10">
              <CardContent className="text-center py-12">
                <div className="text-gray-400 mb-4">No collections found</div>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Collection
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">
                  Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedCollections.length)} of {sortedCollections.length} collections
                </p>
                {totalPages > 1 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedCollections.map(collection => (
                  <Card key={collection.id} className="glass-effect border-white/10 hover:border-white/20 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {collection.name}
                            {collection.is_public ? (
                              <Users className="h-4 w-4 text-blue-400" />
                            ) : (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                          </CardTitle>
                          {collection.description && (
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                              {collection.description}
                            </p>
                          )}
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(collection)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {}}>
                              <Share className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteTarget(collection)}
                              className="text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Tags */}
                        {collection.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {collection.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {collection.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs opacity-60">
                                +{collection.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>{collection.item_count || 0} items</span>
                          <span>{new Date(collection.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="deleted" className="space-y-4">
          {sortedCollections.length === 0 ? (
            <Card className="glass-effect border-white/10">
              <CardContent className="text-center py-12">
                <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-400">Trash is empty</div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-red-400 font-medium">
                  <Trash2 className="h-5 w-5" />
                  Deleted Collections ({sortedCollections.length})
                </div>
                <p className="text-sm text-red-300/80 mt-1">
                  These collections are scheduled for permanent deletion. You can restore or permanently delete them.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedCollections.map(collection => (
                  <Card key={collection.id} className="glass-effect border-red-500/20 bg-red-500/5 relative overflow-hidden">
                    {/* Deleted overlay effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/5 pointer-events-none" />
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive" className="text-xs">
                        DELETED
                      </Badge>
                    </div>
                    
                    <CardHeader className="pb-3 relative">
                      <CardTitle className="text-lg flex items-center gap-2 opacity-75">
                        {collection.name}
                        <Archive className="h-4 w-4 text-red-400" />
                      </CardTitle>
                      {collection.description && (
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2 opacity-75">
                          {collection.description}
                        </p>
                      )}
                      <p className="text-xs text-red-400 mt-2">
                        Deleted: {new Date(collection.deleted_at!).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="pt-0 relative">
                      <div className="space-y-3">
                        {collection.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 opacity-60">
                            {collection.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {collection.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs opacity-60">
                                +{collection.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restoreMutation.mutate(collection.id)}
                            disabled={restoreMutation.isPending}
                            className="flex-1 border-green-500/50 text-green-400 hover:bg-green-500/10"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Restore
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteTarget(collection)}
                            className="flex-1"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete Forever
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.deleted_at ? 'Permanently Delete Collection?' : 'Delete Collection?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.deleted_at 
                ? `This will permanently delete "${deleteTarget.name}" and all its contents. This action cannot be undone.`
                : `This will move "${deleteTarget?.name}" to trash. You can restore it later if needed.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  if (deleteTarget.deleted_at) {
                    permanentDeleteMutation.mutate(deleteTarget.id);
                  } else {
                    softDeleteMutation.mutate(deleteTarget.id);
                  }
                }
              }}
              className={deleteTarget?.deleted_at ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {deleteTarget?.deleted_at ? 'Delete Forever' : 'Move to Trash'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
