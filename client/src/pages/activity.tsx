import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Star, Clock, TrendingUp, Play } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import NavigationHeader from "@/components/navigation-header";

interface ActivityItem {
  id: number;
  userId: string;
  actionType: string;
  showId: number;
  createdAt: string;
  metadata?: any;
  user?: {
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  show?: {
    title: string;
    posterPath?: string;
  };
}

export default function Activity() {
  const { isAuthenticated, user } = useAuth();
  const { data: activity = [], isLoading } = useQuery({
    queryKey: ["/api/activity"],
  });

  const activityItems = Array.isArray(activity) ? activity : [];

  const getActionText = (actionType: string, metadata?: any) => {
    switch (actionType) {
      case 'watchlist_add':
        return 'added to watchlist';
      case 'watchlist_update':
        return `marked as ${metadata?.status || 'updated'}`;
      case 'rating':
        return `rated ${metadata?.rating || '★'} stars`;
      case 'comment':
        return 'commented on';
      default:
        return 'interacted with';
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'watchlist_add':
        return <Heart className="h-4 w-4 text-teal-400" />;
      case 'watchlist_update':
        return <Star className="h-4 w-4 text-cyan-400" />;
      case 'rating':
        return <Star className="h-4 w-4 text-teal-400" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(228,25%,3%)] via-[hsl(226,22%,6%)] to-[hsl(224,20%,8%)] pb-20">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-28">
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-effect rounded-xl p-6 border border-teal-500/20 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(228,25%,3%)] via-[hsl(226,22%,6%)] to-[hsl(224,20%,8%)] pb-20">
      <NavigationHeader />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-28">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gradient-teal mb-2">Activity Feed</h1>
            <p className="text-gray-400">See what's happening in your entertainment world</p>
          </div>

          {/* Activity Feed */}
          {activityItems.length === 0 ? (
            <div className="glass-effect rounded-xl p-12 border border-teal-500/20 text-center">
              <TrendingUp className="h-16 w-16 text-teal-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Activity Yet</h3>
              <p className="text-gray-400">
                Start watching shows and connecting with friends to see activity here!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activityItems.map((item: ActivityItem) => (
                <div key={item.id} className="glass-effect rounded-xl p-6 border border-teal-500/20 hover:border-teal-400/40 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* User Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={item.user?.profileImageUrl || undefined} 
                        alt={`${item.user?.firstName || 'User'}'s avatar`} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
                        {item.user?.firstName?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {getActionIcon(item.actionType)}
                        <p className="text-white">
                          <span className="font-semibold">
                            {item.user?.firstName || 'User'}
                          </span>
                          {' '}
                          <span className="text-gray-300">
                            {getActionText(item.actionType, item.metadata)}
                          </span>
                          {' '}
                          <span className="font-medium text-teal-400">
                            {item.show?.title || 'Unknown Show'}
                          </span>
                        </p>
                      </div>

                      {/* Timestamp */}
                      <p className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()} at{' '}
                        {new Date(item.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>

                      {/* Additional metadata */}
                      {item.metadata?.comment && (
                        <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                          <p className="text-gray-300 text-sm">"{item.metadata.comment}"</p>
                        </div>
                      )}
                    </div>

                    {/* Show Poster */}
                    {item.show?.posterPath && (
                      <div className="flex-shrink-0">
                        <img
                          src={`https://image.tmdb.org/t/p/w92${item.show.posterPath}`}
                          alt={item.show.title}
                          className="w-16 h-24 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}