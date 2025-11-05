import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Star,
  CheckCircle2,
  ThumbsUp,
  Users,
  TrendingUp,
  Clock,
  Tv,
  Film,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { EmojiReactionBar } from "./EmojiReactionBar";

interface EmojiReaction {
  emoji: string;
  count: number;
  users: string[];
  youReacted: boolean;
}

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
  userId: string;
  userName: string;
  reactions?: EmojiReaction[];
}

interface GroupedActivity {
  id: string;
  type: 'group';
  groupType: 'started' | 'completed' | 'rated';
  count: number;
  users: string[];
  shows?: string[];
  timestamp: string;
  preview: Activity[];
}

interface Friend {
  id: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  username?: string;
}

interface EnhancedActivityFeedProps {
  activities: (Activity | GroupedActivity)[];
  friends: Friend[];
}

export function EnhancedActivityFeed({ activities, friends }: EnhancedActivityFeedProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const handleReact = (activityId: string, emoji: string) => {
    console.log('Reacted to', activityId, 'with', emoji);
    // TODO: Implement reaction API call
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'watching': return <Play className="h-4 w-4 text-blue-400" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'rated': return <Star className="h-4 w-4 text-yellow-400" />;
      case 'added': return <ThumbsUp className="h-4 w-4 text-purple-400" />;
    }
  };

  const renderGroupedActivity = (group: GroupedActivity, index: number) => {
    const isExpanded = expandedGroups.has(group.id);
    const actionText = {
      started: 'started new shows',
      completed: 'finished watching',
      rated: 'rated shows'
    }[group.groupType];

    return (
      <motion.div
        key={group.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30 hover:border-cyan-500/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold">
                      {group.count} {group.count === 1 ? 'friend' : 'friends'} {actionText}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {group.users.slice(0, 3).join(', ')}
                      {group.users.length > 3 && ` and ${group.users.length - 3} more`}
                    </p>
                  </div>
                  <span className="text-slate-500 text-sm">{group.timestamp}</span>
                </div>

                {group.shows && group.shows.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {group.shows.slice(0, 2).join(', ')}
                      {group.shows.length > 2 && ` +${group.shows.length - 2} more`}
                    </Badge>
                  </div>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleGroup(group.id)}
                  className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 h-8 px-3"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Hide details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show all {group.count} activities
                    </>
                  )}
                </Button>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-3 pl-4 border-l-2 border-cyan-500/30"
                  >
                    {group.preview.map((activity) => renderSingleActivity(activity, 0, true))}
                  </motion.div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderSingleActivity = (activity: Activity, index: number, isNested = false) => {
    const friend = friends.find(f => f.id === activity.userId) || friends[0];
    const friendName = friend?.firstName || friend?.username || activity.userName || 'Friend';

    return (
      <motion.div
        key={activity.id}
        initial={!isNested ? { opacity: 0, x: -20 } : {}}
        animate={!isNested ? { opacity: 1, x: 0 } : {}}
        transition={!isNested ? { delay: index * 0.1 } : {}}
      >
        <Card className={`${isNested ? 'bg-slate-800/30' : 'bg-slate-900/50'} border-slate-800 hover:border-slate-700 transition-colors`}>
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

                <div className="flex gap-3 mb-3">
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
                      <p className="text-slate-400 text-sm italic mb-2">"{activity.comment}"</p>
                    )}
                  </div>
                </div>

                {/* Emoji Reactions */}
                {activity.reactions && activity.reactions.length > 0 && (
                  <div className="pt-3 border-t border-slate-800">
                    <EmojiReactionBar
                      reactions={activity.reactions}
                      onReact={(emoji) => handleReact(activity.id, emoji)}
                      compact={isNested}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-cyan-400" />
          Friend Activity
        </h2>
        <Button variant="outline" size="sm" className="border-slate-800 text-slate-400">
          <Clock className="h-4 w-4 mr-2" />
          Last 24 hours
        </Button>
      </div>

      {activities.map((activity, index) => {
        if ('type' in activity && activity.type === 'group') {
          return renderGroupedActivity(activity as GroupedActivity, index);
        }
        return renderSingleActivity(activity as Activity, index);
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
