import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Star, 
  Clock, 
  Play,
  Eye,
  Plus
} from 'lucide-react';

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

interface Show {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  vote_average?: number;
  media_type?: 'movie' | 'tv';
}

interface FriendActivity {
  id: string;
  friend: Friend;
  type: 'watched' | 'liked' | 'added_to_list' | 'rated' | 'commented';
  show: Show;
  timestamp: string;
  rating?: number;
  comment?: string;
  listName?: string;
}

interface FriendActivityCardProps {
  activity: FriendActivity;
  onLike?: (activityId: string) => void;
  onComment?: (activityId: string) => void;
  onShare?: (activityId: string) => void;
  onShowClick?: (show: Show) => void;
  onFriendClick?: (friend: Friend) => void;
  onAddToWatchlist?: (show: Show) => void;
  className?: string;
}

const getActivityIcon = (type: FriendActivity['type']) => {
  switch (type) {
    case 'watched':
      return <Eye className="w-4 h-4 text-green-500" />;
    case 'liked':
      return <Heart className="w-4 h-4 text-red-500" />;
    case 'added_to_list':
      return <Plus className="w-4 h-4 text-blue-500" />;
    case 'rated':
      return <Star className="w-4 h-4 text-yellow-500" />;
    case 'commented':
      return <MessageCircle className="w-4 h-4 text-purple-500" />;
    default:
      return <Play className="w-4 h-4 text-slate-500" />;
  }
};

const getActivityText = (activity: FriendActivity) => {
  const showTitle = activity.show.title || activity.show.name || 'Unknown Title';
  
  switch (activity.type) {
    case 'watched':
      return `watched ${showTitle}`;
    case 'liked':
      return `liked ${showTitle}`;
    case 'added_to_list':
      return `added ${showTitle} to ${activity.listName || 'their list'}`;
    case 'rated':
      return `rated ${showTitle} ${activity.rating}/10`;
    case 'commented':
      return `commented on ${showTitle}`;
    default:
      return `interacted with ${showTitle}`;
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diff = now.getTime() - activityTime.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return activityTime.toLocaleDateString();
  }
};

export const FriendActivityCard: React.FC<FriendActivityCardProps> = ({
  activity,
  onLike,
  onComment,
  onShare,
  onShowClick,
  onFriendClick,
  onAddToWatchlist,
  className = ''
}) => {
  const handleFriendClick = () => {
    onFriendClick?.(activity.friend);
  };

  const handleShowClick = () => {
    onShowClick?.(activity.show);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(activity.id);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComment?.(activity.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(activity.id);
  };

  const handleAddToWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToWatchlist?.(activity.show);
  };

  return (
    <Card className={`bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-colors ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Friend Avatar */}
          <Avatar 
            className="w-10 h-10 cursor-pointer ring-2 ring-slate-600 hover:ring-slate-500 transition-colors" 
            onClick={handleFriendClick}
          >
            <AvatarImage src={activity.friend.avatar} alt={activity.friend.name} />
            <AvatarFallback className="bg-slate-700 text-slate-300">
              {activity.friend.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Activity Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getActivityIcon(activity.type)}
              <p className="text-sm text-slate-300">
                <button
                  onClick={handleFriendClick}
                  className="font-semibold text-white hover:text-purple-400 transition-colors"
                >
                  {activity.friend.name}
                </button>
                {' '}
                {getActivityText(activity)}
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(activity.timestamp)}</span>
              
              {activity.show.vote_average && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span>{activity.show.vote_average.toFixed(1)}</span>
                  </div>
                </>
              )}
              
              {activity.show.media_type && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs px-1 py-0 border-slate-600 text-slate-400">
                    {activity.show.media_type === 'movie' ? 'Movie' : 'TV Show'}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Show Preview */}
        <div className="flex gap-3 mb-3">
          {/* Poster */}
          {activity.show.poster_path && (
            <div 
              className="w-16 h-24 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
              onClick={handleShowClick}
            >
              <img
                src={`https://image.tmdb.org/t/p/w200${activity.show.poster_path}`}
                alt={activity.show.title || activity.show.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          
          {/* Show Info */}
          <div className="flex-1 min-w-0">
            <button
              onClick={handleShowClick}
              className="text-sm font-medium text-white hover:text-purple-400 transition-colors line-clamp-2 text-left"
            >
              {activity.show.title || activity.show.name}
            </button>
            
            {/* Comment if exists */}
            {activity.comment && (
              <div className="mt-2 p-2 bg-slate-700/50 rounded-md">
                <p className="text-xs text-slate-300 italic">
                  "{activity.comment}"
                </p>
              </div>
            )}
            
            {/* Rating if exists */}
            {activity.rating && activity.type === 'rated' && (
              <div className="mt-2 flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-yellow-500">
                  {activity.rating}/10
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLike}
              className="text-slate-400 hover:text-red-500 hover:bg-slate-700 px-2 py-1 h-auto"
            >
              <Heart className="w-4 h-4 mr-1" />
              <span className="text-xs">Like</span>
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleComment}
              className="text-slate-400 hover:text-blue-500 hover:bg-slate-700 px-2 py-1 h-auto"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              <span className="text-xs">Comment</span>
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleShare}
              className="text-slate-400 hover:text-green-500 hover:bg-slate-700 px-2 py-1 h-auto"
            >
              <Share2 className="w-4 h-4 mr-1" />
              <span className="text-xs">Share</span>
            </Button>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAddToWatchlist}
            className="text-slate-400 hover:text-purple-500 hover:bg-slate-700 px-2 py-1 h-auto"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span className="text-xs">Add</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FriendActivityCard;