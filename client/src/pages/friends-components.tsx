// Friend Card Component - will be moved to friends.tsx
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  MessageCircle,
  Send,
  Star,
  Zap,
  Target,
  Clock,
  Eye,
  ThumbsUp,
  Award,
  Flame,
  CheckCircle2,
  MoreHorizontal,
  Tv,
  Film,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Friend {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string;
  username?: string;
  bio?: string;
  isOnline?: boolean;
  currentlyWatching?: {
    title: string;
    poster: string;
    progress: number;
  };
  stats?: {
    totalWatched: number;
    streak: number;
    badges: string[];
  };
  compatibility?: number;
  sharedPlatforms?: string[];
  favoriteGenres?: string[];
}

interface FriendCardProps {
  friend: Friend;
  index: number;
  onClick: () => void;
}

export function FriendCard({ friend, index, onClick }: FriendCardProps) {
  const name = friend.firstName && friend.lastName 
    ? `${friend.firstName} ${friend.lastName}`
    : friend.firstName || friend.username || friend.email || 'Anonymous';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all duration-300 group cursor-pointer overflow-hidden">
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Avatar with online status */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-16 w-16 ring-2 ring-slate-800 group-hover:ring-cyan-500/50 transition-all">
                <AvatarImage src={friend.profileImageUrl} alt={name} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-lg">
                  {name[0]}
                </AvatarFallback>
              </Avatar>
              {friend.isOnline && (
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-4 border-slate-900 rounded-full"></div>
              )}
            </div>

            {/* Friend Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate flex items-center gap-2">
                    {name}
                    {friend.stats && friend.stats.badges.map((badge, i) => (
                      <span key={i} className="text-base">{badge}</span>
                    ))}
                  </h3>
                  {friend.username && (
                    <p className="text-slate-400 text-sm">@{friend.username}</p>
                  )}
                </div>

                {/* Compatibility Score */}
                {friend.compatibility && (
                  <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30">
                    <Target className="h-3 w-3 mr-1" />
                    {friend.compatibility}%
                  </Badge>
                )}
              </div>

              {/* Bio */}
              {friend.bio && (
                <p className="text-slate-400 text-sm mb-3 line-clamp-1">{friend.bio}</p>
              )}

              {/* Currently Watching */}
              {friend.currentlyWatching && (
                <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-16 bg-slate-700 rounded overflow-hidden flex-shrink-0">
                      <Play className="w-full h-full text-slate-600 p-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 mb-1">Currently Watching</p>
                      <p className="text-sm text-white font-medium truncate">{friend.currentlyWatching.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                            style={{ width: `${friend.currentlyWatching.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-400">{friend.currentlyWatching.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Row */}
              <div className="flex items-center gap-4 mb-3 flex-wrap">
                {friend.stats && (
                  <>
                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                      <Eye className="h-4 w-4" />
                      <span>{friend.stats.totalWatched} shows</span>
                    </div>
                    {friend.stats.streak > 0 && (
                      <div className="flex items-center gap-1.5 text-orange-400 text-sm">
                        <Flame className="h-4 w-4" />
                        <span>{friend.stats.streak} day streak</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Shared Platforms & Genres */}
              {(friend.sharedPlatforms?.length || friend.favoriteGenres?.length) && (
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {friend.sharedPlatforms?.slice(0, 3).map((platform) => (
                    <Badge key={platform} variant="outline" className="text-xs border-slate-700 text-slate-300">
                      {platform}
                    </Badge>
                  ))}
                  {friend.favoriteGenres?.slice(0, 2).map((genre) => (
                    <Badge key={genre} variant="outline" className="text-xs border-slate-700 text-slate-400">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={onClick}
                  className="bg-slate-800 hover:bg-slate-700 text-white flex-1"
                >
                  View Profile
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-slate-700 text-white hover:bg-slate-800"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-slate-700 text-white hover:bg-slate-800"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Recommend
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-900 border-slate-800 text-white">
                    <DropdownMenuItem>View Watchlist</DropdownMenuItem>
                    <DropdownMenuItem>See What We Can Watch</DropdownMenuItem>
                    <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Activity Feed Component
interface Activity {
  id: string;
  type: 'watching' | 'completed' | 'rated' | 'added';
  show: {
    id: number;
    title: string;
    poster: string;
    type: 'movie' | 'tv';
  };
  rating?: number;
  comment?: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  friends: Friend[];
}

export function ActivityFeed({ activities, friends }: ActivityFeedProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'watching': return <Play className="h-4 w-4 text-blue-400" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'rated': return <Star className="h-4 w-4 text-yellow-400" />;
      case 'added': return <ThumbsUp className="h-4 w-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Friend Activity</h2>
        <Button variant="outline" size="sm" className="border-slate-800 text-slate-400">
          <Clock className="h-4 w-4 mr-2" />
          Last 24 hours
        </Button>
      </div>

      {activities.map((activity, index) => {
        const friend = friends[index % friends.length];
        const friendName = friend?.firstName || friend?.username || 'Friend';
        
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Friend Avatar */}
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={friend?.profileImageUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-sm">
                      {friendName[0]}
                    </AvatarFallback>
                  </Avatar>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getActivityIcon(activity.type)}
                      <p className="text-white">
                        <span className="font-semibold">{friendName}</span>
                        {' '}
                        <span className="text-slate-400">
                          {activity.type === 'watching' && 'is watching'}
                          {activity.type === 'completed' && 'finished'}
                          {activity.type === 'rated' && 'rated'}
                          {activity.type === 'added' && 'added to watchlist'}
                        </span>
                      </p>
                      <span className="text-slate-500 text-sm ml-auto">{activity.timestamp}</span>
                    </div>

                    <div className="flex gap-3">
                      {/* Show Poster */}
                      <div className="w-16 h-24 bg-slate-800 rounded overflow-hidden flex-shrink-0">
                        {activity.show.type === 'tv' ? (
                          <Tv className="w-full h-full text-slate-600 p-4" />
                        ) : (
                          <Film className="w-full h-full text-slate-600 p-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium mb-1">{activity.show.title}</h4>
                        {activity.rating && (
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < activity.rating! 
                                    ? 'text-yellow-400 fill-yellow-400' 
                                    : 'text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        {activity.comment && (
                          <p className="text-slate-400 text-sm italic">"{activity.comment}"</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {activities.length === 0 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-12 text-center">
            <Clock className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Recent Activity</h3>
            <p className="text-slate-400">Your friends haven't been active recently</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Discover Section Component
interface SuggestedFriend extends Friend {
  reason: string;
  mutualFriends: number;
}

interface DiscoverSectionProps {
  suggestions: SuggestedFriend[];
}

export function DiscoverSection({ suggestions }: DiscoverSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Discover New Friends</h2>
        <p className="text-slate-400">Connect with people who share your taste in shows</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((friend, index) => {
          const name = friend.firstName && friend.lastName 
            ? `${friend.firstName} ${friend.lastName}`
            : friend.firstName || friend.username || 'User';

          return (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all group">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <Avatar className="h-16 w-16 ring-2 ring-slate-800 group-hover:ring-cyan-500/50 transition-all">
                      <AvatarImage src={friend.profileImageUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-lg">
                        {name[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-1">{name}</h3>
                      {friend.username && (
                        <p className="text-slate-400 text-sm mb-2">@{friend.username}</p>
                      )}
                      
                      {/* Reason Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                          <Zap className="h-3 w-3 mr-1" />
                          {friend.reason}
                        </Badge>
                        {friend.compatibility && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {friend.compatibility}% match
                          </Badge>
                        )}
                      </div>

                      {friend.mutualFriends > 0 && (
                        <p className="text-slate-400 text-sm mb-3">
                          {friend.mutualFriends} mutual friend{friend.mutualFriends > 1 ? 's' : ''}
                        </p>
                      )}

                      {/* Stats */}
                      {friend.stats && (
                        <div className="flex items-center gap-3 mb-3 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {friend.stats.totalWatched}
                          </span>
                          {friend.stats.streak > 0 && (
                            <span className="flex items-center gap-1 text-orange-400">
                              <Flame className="h-4 w-4" />
                              {friend.stats.streak} days
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Add Friend
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Friend Profile Modal
interface FriendProfileModalProps {
  friend: Friend;
  onClose: () => void;
}

export function FriendProfileModal({ friend, onClose }: FriendProfileModalProps) {
  const name = friend.firstName && friend.lastName 
    ? `${friend.firstName} ${friend.lastName}`
    : friend.firstName || friend.username || friend.email || 'Anonymous';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-t-2xl">
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="absolute -bottom-12 left-6">
            <Avatar className="h-24 w-24 ring-4 ring-slate-900">
              <AvatarImage src={friend.profileImageUrl} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-3xl">
                {name[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6 pt-16">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">{name}</h2>
            {friend.username && (
              <p className="text-slate-400">@{friend.username}</p>
            )}
            {friend.bio && (
              <p className="text-slate-300 mt-3">{friend.bio}</p>
            )}
          </div>

          {/* Stats */}
          {friend.stats && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white">{friend.stats.totalWatched}</p>
                <p className="text-slate-400 text-sm">Shows Watched</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-orange-400 flex items-center justify-center gap-1">
                  <Flame className="h-6 w-6" />
                  {friend.stats.streak}
                </p>
                <p className="text-slate-400 text-sm">Day Streak</p>
              </div>
              {friend.compatibility && (
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-cyan-400">{friend.compatibility}%</p>
                  <p className="text-slate-400 text-sm">Compatible</p>
                </div>
              )}
            </div>
          )}

          {/* Shared Platforms */}
          {friend.sharedPlatforms && friend.sharedPlatforms.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Shared Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {friend.sharedPlatforms.map((platform) => (
                  <Badge key={platform} className="bg-slate-800 text-white border-slate-700">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Genres */}
          {friend.favoriteGenres && friend.favoriteGenres.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Favorite Genres</h3>
              <div className="flex flex-wrap gap-2">
                {friend.favoriteGenres.map((genre) => (
                  <Badge key={genre} variant="outline" className="border-slate-700 text-slate-300">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
              <Send className="h-4 w-4 mr-2" />
              Recommend Show
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
