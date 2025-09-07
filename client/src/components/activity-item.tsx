import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageCircle, 
  Star,
  Film
} from "lucide-react";

interface ActivityItemProps {
  activity: any;
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  const { toast } = useToast();

  // Like activity mutation
  const likeActivity = useMutation({
    mutationFn: async (activityId: number) => {
      const response = await fetch(`/api/activity/${activityId}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('401: Unauthorized');
        }
        throw new Error('Failed to like activity');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activity'] });
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
        description: "Failed to like activity",
        variant: "destructive",
      });
    },
  });

  // Unlike activity mutation
  const unlikeActivity = useMutation({
    mutationFn: async (activityId: number) => {
      const response = await fetch(`/api/activity/${activityId}/like`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('401: Unauthorized');
        }
        throw new Error('Failed to unlike activity');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activity'] });
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
        description: "Failed to unlike activity",
        variant: "destructive",
      });
    },
  });

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "1 day ago";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getActivityText = () => {
    switch (activity.activityType) {
      case "added_to_watchlist":
        return "added to watchlist";
      case "finished_show":
        return "finished watching";
      case "rated_show":
        return "rated";
      case "started_watching":
        return "started watching";
      case "updated_progress":
        return "updated progress on";
      default:
        return "interacted with";
    }
  };

  const getActivityColor = () => {
    switch (activity.activityType) {
      case "added_to_watchlist":
        return "text-binge-green";
      case "finished_show":
        return "text-binge-purple";
      case "rated_show":
        return "text-yellow-400";
      case "started_watching":
        return "text-binge-pink";
      default:
        return "text-binge-purple";
    }
  };

  const handleLike = () => {
    // For now, we'll assume the user hasn't liked it yet
    // In a real implementation, you'd track user's like status
    likeActivity.mutate(activity.id);
  };

  return (
    <Card className="activity-item glass-effect border-white/10 transition-all cursor-pointer hover:bg-white/5">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={activity.user?.profileImageUrl} />
            <AvatarFallback className="bg-gradient-purple text-white">
              {activity.user?.firstName?.[0] || activity.user?.email?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1 flex-wrap">
              <span className="font-semibold">
                {activity.user?.firstName && activity.user?.lastName 
                  ? `${activity.user.firstName} ${activity.user.lastName}`
                  : activity.user?.email || 'Unknown User'
                }
              </span>
              <span className="text-sm text-gray-400">{getActivityText()}</span>
              <span className={`font-medium ${getActivityColor()}`}>
                {activity.show?.title || 'Unknown Show'}
              </span>
              {activity.activityType === "rated_show" && activity.metadata?.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm">{activity.metadata.rating}</span>
                </div>
              )}
            </div>
            
            {activity.content && (
              <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                "{activity.content}"
              </p>
            )}
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>{formatTimeAgo(activity.createdAt)}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={likeActivity.isPending || unlikeActivity.isPending}
                className="hover:text-binge-pink transition-colors p-0 h-auto text-xs"
              >
                <Heart className="w-3 h-3 mr-1" />
                {activity.likes || 0}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hover:text-binge-purple transition-colors p-0 h-auto text-xs"
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                {activity.comments || 0}
              </Button>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            {activity.show?.posterPath ? (
              <img 
                src={activity.show.posterPath} 
                alt={`${activity.show.title} poster`} 
                className="w-12 h-16 rounded object-cover cursor-pointer hover:scale-105 transition-transform"
                onClick={() => window.location.href = `/show/${activity.show.tmdbId}`}
              />
            ) : (
              <div className="w-12 h-16 bg-binge-gray rounded flex items-center justify-center">
                <Film className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
