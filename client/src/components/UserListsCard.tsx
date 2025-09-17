import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  List, 
  Users, 
  Lock, 
  Globe, 
  Plus, 
  MoreHorizontal,
  Star,
  Calendar,
  Play,
  Share2,
  Edit3,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface Show {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  vote_average?: number;
  media_type?: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
}

interface UserList {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  isCollaborative: boolean;
  shows: Show[];
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  collaborators?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  tags?: string[];
}

interface UserListsCardProps {
  list: UserList;
  isOwner?: boolean;
  onListClick?: (list: UserList) => void;
  onEditList?: (list: UserList) => void;
  onDeleteList?: (listId: string) => void;
  onShareList?: (list: UserList) => void;
  onShowClick?: (show: Show) => void;
  onAddToWatchlist?: (show: Show) => void;
  className?: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const getListIcon = (list: UserList) => {
  if (list.isCollaborative) {
    return <Users className="w-4 h-4 text-blue-500" />;
  } else if (list.isPublic) {
    return <Globe className="w-4 h-4 text-green-500" />;
  } else {
    return <Lock className="w-4 h-4 text-slate-500" />;
  }
};

export const UserListsCard: React.FC<UserListsCardProps> = ({
  list,
  isOwner = false,
  onListClick,
  onEditList,
  onDeleteList,
  onShareList,
  onShowClick,
  onAddToWatchlist,
  className = ''
}) => {
  const [showAllShows, setShowAllShows] = useState(false);
  
  const displayShows = showAllShows ? list.shows : list.shows.slice(0, 6);
  const remainingCount = list.shows.length - 6;

  const handleListClick = () => {
    onListClick?.(list);
  };

  const handleEditList = () => {
    onEditList?.(list);
  };

  const handleDeleteList = () => {
    onDeleteList?.(list.id);
  };

  const handleShareList = () => {
    onShareList?.(list);
  };

  const handleShowClick = (show: Show) => {
    onShowClick?.(show);
  };

  const handleAddToWatchlist = (show: Show, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToWatchlist?.(show);
  };

  return (
    <Card className={`bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-colors ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Owner Avatar */}
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={list.owner.avatar} alt={list.owner.name} />
              <AvatarFallback className="bg-slate-700 text-slate-300">
                {list.owner.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* List Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getListIcon(list)}
                <CardTitle 
                  className="text-base font-semibold text-white cursor-pointer hover:text-purple-400 transition-colors truncate"
                  onClick={handleListClick}
                >
                  {list.name}
                </CardTitle>
              </div>
              
              <p className="text-sm text-slate-400 mb-2">
                by {list.owner.name} • {list.shows.length} items
              </p>
              
              {list.description && (
                <p className="text-xs text-slate-300 line-clamp-2 mb-2">
                  {list.description}
                </p>
              )}
              
              {/* Tags */}
              {list.tags && list.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {list.tags.slice(0, 3).map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs px-2 py-0 border-slate-600 text-slate-400"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {list.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0 border-slate-600 text-slate-400">
                      +{list.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Collaborators */}
              {list.collaborators && list.collaborators.length > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  <Users className="w-3 h-3 text-slate-500" />
                  <div className="flex -space-x-1">
                    {list.collaborators.slice(0, 3).map((collaborator, index) => (
                      <Avatar key={collaborator.id} className="w-5 h-5 border border-slate-600">
                        <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                        <AvatarFallback className="bg-slate-700 text-slate-300 text-xs">
                          {collaborator.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  {list.collaborators.length > 3 && (
                    <span className="text-xs text-slate-500 ml-1">
                      +{list.collaborators.length - 3}
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3 h-3" />
                <span>Updated {formatDate(list.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-400 hover:text-white hover:bg-slate-700 p-1 h-auto"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <DropdownMenuItem 
                onClick={handleListClick}
                className="text-slate-300 hover:bg-slate-700"
              >
                <List className="w-4 h-4 mr-2" />
                View List
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={handleShareList}
                className="text-slate-300 hover:bg-slate-700"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              
              {isOwner && (
                <>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    onClick={handleEditList}
                    className="text-slate-300 hover:bg-slate-700"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={handleDeleteList}
                    className="text-red-400 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Shows Grid */}
        {list.shows.length > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-6 gap-2">
              {displayShows.map((show, index) => (
                <div
                  key={show.id}
                  className="relative group cursor-pointer"
                  onClick={() => handleShowClick(show)}
                >
                  <div className="aspect-[2/3] rounded-md overflow-hidden bg-slate-700">
                    {show.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w200${show.poster_path}`}
                        alt={show.title || show.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-slate-500" />
                      </div>
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleAddToWatchlist(show, e)}
                          className="text-white hover:bg-white/20 p-1 h-auto"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        
                        {show.vote_average && (
                          <div className="flex items-center gap-1 text-xs text-yellow-400">
                            <Star className="w-2 h-2 fill-current" />
                            <span>{show.vote_average.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <p className="text-xs text-white font-medium line-clamp-2 leading-tight">
                      {show.title || show.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Show More/Less Button */}
            {list.shows.length > 6 && (
              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllShows(!showAllShows)}
                  className="text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  {showAllShows ? (
                    'Show Less'
                  ) : (
                    `Show ${remainingCount} More`
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <List className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No items in this list yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserListsCard;