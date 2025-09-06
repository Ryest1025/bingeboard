import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Check, Star, Bell, BellOff } from "lucide-react";
import BrandedShowModal from "@/components/search/BrandedShowModal";
import { useAuth } from "@/hooks/useAuth";
import { useUserActions } from "@/hooks/useUserActions";

interface Show {
  id: string | number;
  title: string;
  year?: number;
  posterUrl?: string;
  poster?: string;
  isUpcoming?: boolean;
  streamingLink?: string;
  streamingPlatform?: string;
  platform?: string;
  mediaType?: string;
  rating?: number;
  genres?: string[];
  releaseDate?: string;
  backdrop?: string;
}

interface UniversalShowCardProps {
  show: Show;
  className?: string;
  onAddToList?: (show: Show) => void;
  onRemoveFromList?: (show: Show) => void;
  showQuickActions?: boolean;
}

export default function UniversalShowCard({ 
  show, 
  className = "",
  onAddToList,
  onRemoveFromList,
  showQuickActions = true 
}: UniversalShowCardProps) {
  const { user, isAuthenticated } = useAuth();
  const { addToList, removeFromList, toggleRemind, isInList, isReminded } = useUserActions();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Normalize show data
  const normalizedShow = {
    ...show,
    posterUrl: show.posterUrl || show.poster,
    streamingPlatform: show.streamingPlatform || show.platform || "—"
  };

  // Handle adding/removing from list with optimistic updates
  const handleQuickAction = async () => {
    if (!isAuthenticated) {
      setIsModalOpen(true); // Open modal for login
      return;
    }

    const showIsInList = isInList(normalizedShow.id);
    
    try {
      if (showIsInList) {
        await removeFromList(normalizedShow.id);
        onRemoveFromList?.(normalizedShow);
      } else {
        await addToList(normalizedShow.id, normalizedShow.mediaType || 'movie');
        onAddToList?.(normalizedShow);
      }
    } catch (error) {
      // Error handling is done in useUserActions hook
      console.error('Failed to update list:', error);
    }
  };

  // Handle reminder toggle
  const handleRemindAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setIsModalOpen(true);
      return;
    }
    await toggleRemind(normalizedShow.id);
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  const showIsInList = isInList(normalizedShow.id);
  const showIsReminded = isReminded(normalizedShow.id);

  return (
    <>
      <div
        className={cn(
          "group relative bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-300",
          "cursor-pointer border border-border/50 hover:border-border",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "overflow-hidden",
          className
        )}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${normalizedShow.title}`}
      >
        {/* Poster Image */}
        <div className="relative aspect-[2/3] overflow-hidden">
          {normalizedShow.posterUrl ? (
            <img
              src={normalizedShow.posterUrl}
              alt={`${normalizedShow.title} poster`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
              <span className="text-sm text-center px-2">No Image Available</span>
            </div>
          )}

          {/* Rating Badge */}
          {normalizedShow.rating && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {normalizedShow.rating.toFixed(1)}
            </div>
          )}

          {/* Hover Overlay with Quick Actions */}
          {showQuickActions && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant={showIsInList ? "secondary" : "default"}
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAction();
                }}
                className="backdrop-blur-sm"
                aria-label={showIsInList ? `Remove ${normalizedShow.title} from list` : `Add ${normalizedShow.title} to list`}
              >
                {showIsInList ? (
                  <Check className="w-4 h-4 mr-1" />
                ) : (
                  <Plus className="w-4 h-4 mr-1" />
                )}
                {showIsInList ? "In List" : "Add"}
              </Button>

              {/* Reminder Action */}
              <Button
                size="sm"
                variant={showIsReminded ? "secondary" : "outline"}
                onClick={handleRemindAction}
                className="backdrop-blur-sm"
                aria-label={showIsReminded ? `Remove reminder for ${normalizedShow.title}` : `Set reminder for ${normalizedShow.title}`}
              >
                {showIsReminded ? (
                  <BellOff className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-medium text-sm truncate mb-1" title={normalizedShow.title}>
            {normalizedShow.title}
          </h3>
          
          {normalizedShow.year && (
            <p className="text-xs text-muted-foreground mb-1">
              {normalizedShow.year}
            </p>
          )}
          
          <p className="text-xs text-muted-foreground truncate">
            {normalizedShow.streamingPlatform}
          </p>

          {/* Genres */}
          {normalizedShow.genres && normalizedShow.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {normalizedShow.genres.slice(0, 2).map((genre) => (
                <span 
                  key={genre} 
                  className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Status Indicators */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {showIsInList && (
            <div className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span className="sr-only">In Watchlist</span>
            </div>
          )}
          {showIsReminded && (
            <div className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <Bell className="w-3 h-3" />
              <span className="sr-only">Reminder Set</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <BrandedShowModal
          showId={normalizedShow.id.toString()}
          showType={normalizedShow.mediaType || 'movie'}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddToWatchlist={() => {
            if (!showIsInList) {
              handleQuickAction();
            }
          }}
        />
      )}
    </>
  );
}
