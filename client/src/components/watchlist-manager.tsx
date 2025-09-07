import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Star, 
  Trash2, 
  Edit,
  Film
} from "lucide-react";

interface WatchlistManagerProps {
  item: any;
  show: any;
}

export default function WatchlistManager({ item, show }: WatchlistManagerProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: item.status || 'want_to_watch',
    rating: item.rating || '',
    currentSeason: item.currentSeason || 1,
    currentEpisode: item.currentEpisode || 1,
    totalEpisodesWatched: item.totalEpisodesWatched || 0,
    notes: item.notes || '',
  });

  // Update watchlist item mutation
  const updateWatchlist = useMutation({
    mutationFn: async (updateData: any) => {
      const response = await fetch(`/api/watchlist/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('401: Unauthorized');
        }
        throw new Error('Failed to update watchlist item');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Watchlist updated successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update watchlist item",
        variant: "destructive",
      });
    },
  });

  // Remove from watchlist mutation
  const removeFromWatchlist = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/watchlist/${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('401: Unauthorized');
        }
        throw new Error('Failed to remove from watchlist');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      toast({
        title: "Success",
        description: "Removed from watchlist",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to remove from watchlist",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateWatchlist.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'watching':
        return 'bg-binge-purple';
      case 'finished':
        return 'bg-binge-green';
      case 'want_to_watch':
        return 'bg-binge-pink';
      case 'dropped':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'want_to_watch':
        return 'Want to Watch';
      case 'watching':
        return 'Watching';
      case 'finished':
        return 'Finished';
      case 'dropped':
        return 'Dropped';
      default:
        return status;
    }
  };

  const getProgressPercentage = () => {
    if (!item.totalEpisodesWatched || !show.numberOfEpisodes) return 0;
    return Math.round((item.totalEpisodesWatched / show.numberOfEpisodes) * 100);
  };

  return (
    <Card className="glass-effect border-white/10">
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <div className="flex-shrink-0">
            {show.posterPath ? (
              <img 
                src={show.posterPath} 
                alt={`${show.title} poster`} 
                className="w-20 h-28 object-cover rounded cursor-pointer hover:scale-105 transition-transform"
                onClick={() => window.location.href = `/show/${show.tmdbId}`}
              />
            ) : (
              <div className="w-20 h-28 bg-binge-gray rounded flex items-center justify-center">
                <Film className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 
                  className="font-semibold text-lg cursor-pointer hover:text-binge-purple transition-colors"
                  onClick={() => window.location.href = `/show/${show.tmdbId}`}
                >
                  {show.title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={`${getStatusColor(item.status)} text-white text-xs`}>
                    {getStatusLabel(item.status)}
                  </Badge>
                  {item.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm">{item.rating}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="glass-effect hover:bg-white/10">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-effect border-white/20 text-white">
                    <DialogHeader>
                      <DialogTitle>Edit Watchlist Item</DialogTitle>
                      <DialogDescription>
                        Update your watching progress and notes for {show.title}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select 
                          value={formData.status} 
                          onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger className="bg-binge-gray border-white/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-effect border-white/20">
                            <SelectItem value="want_to_watch">Want to Watch</SelectItem>
                            <SelectItem value="watching">Watching</SelectItem>
                            <SelectItem value="finished">Finished</SelectItem>
                            <SelectItem value="dropped">Dropped</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.status !== 'want_to_watch' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="currentSeason">Current Season</Label>
                              <Input
                                id="currentSeason"
                                type="number"
                                min="1"
                                value={formData.currentSeason}
                                onChange={(e) => setFormData({ ...formData, currentSeason: parseInt(e.target.value) || 1 })}
                                className="bg-binge-gray border-white/20"
                              />
                            </div>
                            <div>
                              <Label htmlFor="currentEpisode">Current Episode</Label>
                              <Input
                                id="currentEpisode"
                                type="number"
                                min="1"
                                value={formData.currentEpisode}
                                onChange={(e) => setFormData({ ...formData, currentEpisode: parseInt(e.target.value) || 1 })}
                                className="bg-binge-gray border-white/20"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="totalEpisodesWatched">Total Episodes Watched</Label>
                            <Input
                              id="totalEpisodesWatched"
                              type="number"
                              min="0"
                              value={formData.totalEpisodesWatched}
                              onChange={(e) => setFormData({ ...formData, totalEpisodesWatched: parseInt(e.target.value) || 0 })}
                              className="bg-binge-gray border-white/20"
                            />
                          </div>
                        </>
                      )}

                      {formData.status === 'finished' && (
                        <div>
                          <Label htmlFor="rating">Your Rating (1-10)</Label>
                          <Input
                            id="rating"
                            type="number"
                            min="1"
                            max="10"
                            step="0.1"
                            value={formData.rating}
                            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                            className="bg-binge-gray border-white/20"
                          />
                        </div>
                      )}

                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="bg-binge-gray border-white/20"
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeFromWatchlist.mutate()}
                          disabled={removeFromWatchlist.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {removeFromWatchlist.isPending ? 'Removing...' : 'Remove'}
                        </Button>
                        <div className="space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={updateWatchlist.isPending}
                            className="bg-gradient-purple hover:opacity-90"
                          >
                            {updateWatchlist.isPending ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {item.status === 'watching' && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                  <span>S{item.currentSeason} E{item.currentEpisode}</span>
                  <span>{getProgressPercentage()}% complete</span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
              </div>
            )}

            {item.notes && (
              <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                "{item.notes}"
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Added {new Date(item.createdAt).toLocaleDateString()}</span>
              <span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
