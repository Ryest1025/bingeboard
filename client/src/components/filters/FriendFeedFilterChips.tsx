import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Heart, Share, List, Users, Star } from 'lucide-react';
import type { FriendFeedFilters } from './types';

export interface FriendFeedFilterChipsProps {
  onChange?: (filters: FriendFeedFilters) => void;
  initialFilters?: FriendFeedFilters;
  sticky?: boolean;
}

const activityTypes = [
  { id: 'lists', label: 'Lists', icon: List, color: 'blue' },
  { id: 'rated', label: 'Rated', icon: Star, color: 'yellow' },
  { id: 'comments', label: 'Comments', icon: MessageSquare, color: 'green' },
  { id: 'shared', label: 'Shared', icon: Share, color: 'purple' },
  { id: 'likes', label: 'Likes', icon: Heart, color: 'red' },
  { id: 'following', label: 'Following', icon: Users, color: 'teal' }
];

export const FriendFeedFilterChips: React.FC<FriendFeedFilterChipsProps> = ({
  onChange,
  initialFilters = { activityTypes: [], closeFriendsOnly: false },
  sticky = true
}) => {
  const [filters, setFilters] = useState<FriendFeedFilters>(initialFilters);

  const toggleActivityType = (typeId: string) => {
    const newTypes = filters.activityTypes.includes(typeId)
      ? filters.activityTypes.filter(id => id !== typeId)
      : [...filters.activityTypes, typeId];
    
    const newFilters = { ...filters, activityTypes: newTypes };
    setFilters(newFilters);
    onChange?.(newFilters);
  };

  const toggleCloseFriends = () => {
    const newFilters = { ...filters, closeFriendsOnly: !filters.closeFriendsOnly };
    setFilters(newFilters);
    onChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { activityTypes: [], closeFriendsOnly: false };
    setFilters(clearedFilters);
    onChange?.(clearedFilters);
  };

  const hasActiveFilters = filters.activityTypes.length > 0 || filters.closeFriendsOnly;

  return (
    <div className={`
      bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 p-3
      ${sticky ? 'sticky top-0 z-10' : ''}
    `}>
      <div className="flex items-center gap-3">
        <ScrollArea className="flex-1">
          <div className="flex items-center gap-2 pb-1">
            {activityTypes.map(({ id, label, icon: Icon, color }) => {
              const isActive = filters.activityTypes.includes(id);
              return (
                <Button
                  key={id}
                  variant="ghost"
                  size="sm"
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all
                    ${isActive 
                      ? `bg-${color}-500/20 text-${color}-300 border border-${color}-500/30` 
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-gray-300'
                    }
                  `}
                  onClick={() => toggleActivityType(id)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{label}</span>
                  {isActive && (
                    <Badge variant="secondary" className={`ml-1 h-4 w-4 p-0 text-xs bg-${color}-500 text-white`}>
                      ✓
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Close Friends Toggle */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-600">
          <Button
            variant="ghost"
            size="sm"
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all
              ${filters.closeFriendsOnly 
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' 
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-gray-300'
              }
            `}
            onClick={toggleCloseFriends}
          >
            <Users className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Close Friends</span>
            {filters.closeFriendsOnly && (
              <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs bg-pink-500 text-white">
                ✓
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-400 hover:text-white px-2"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="mt-2 pt-2 border-t border-gray-700/50">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>Showing:</span>
            {filters.activityTypes.length > 0 && (
              <span className="text-blue-300">
                {filters.activityTypes.length} activity type{filters.activityTypes.length > 1 ? 's' : ''}
              </span>
            )}
            {filters.activityTypes.length > 0 && filters.closeFriendsOnly && <span>•</span>}
            {filters.closeFriendsOnly && (
              <span className="text-pink-300">close friends only</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
