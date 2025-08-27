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

  const handleAddToList = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to add shows to your list.",
        duration: 3000,
      });
      return;
    }

    setIsAddingToList(true);
    
    try {
      if (isInList) {
        // Remove from list
        const response = await fetch('/api/watchlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ showId: show.id })
        });
        
        if (response.ok) {
          setIsInList(false);
          toast({
            title: "Removed from List",
            description: `${normalizedShow.title} has been removed from your watchlist.`,
            duration: 3000,
          });
          onRemoveFromList?.(normalizedShow);
        } else {
          throw new Error('Failed to remove from list');
        }
      } else {
        // Add to list
        const response = await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            showId: show.id, 
            type: show.mediaType || 'movie',
            title: show.title,
            posterUrl: normalizedShow.posterUrl
          })
        });
        
        if (response.ok) {
          setIsInList(true);
          toast({
            title: "Added to Watchlist",
            description: `${normalizedShow.title} has been added to your watchlist.`,
            duration: 3000,
          });
          onAddToList?.(normalizedShow);
        } else {
          throw new Error('Failed to add to list');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: isInList ? "Failed to remove from list" : "Failed to add to list",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAddingToList(false);
    }
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <>
      <div
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-xl shadow-md transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          className
        )}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${normalizedShow.title}`}
      >
        {/* Poster Image */}
        <div className="aspect-[2/3] relative bg-gray-800 overflow-hidden">
          {normalizedShow.posterUrl ? (
            <img
              src={normalizedShow.posterUrl}
              alt={`${normalizedShow.title} Poster`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm p-4 text-center">
              {normalizedShow.title}
            </div>
          )}

          {/* Rating Badge */}
          {normalizedShow.rating && (
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {normalizedShow.rating.toFixed(1)}
            </div>
          )}

          {/* Quick Add to List Button */}
          {isAuthenticated && showQuickActions && (
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 rounded-full shadow-lg backdrop-blur-sm",
                isInList 
                  ? "bg-green-600/90 hover:bg-green-700/90 text-white" 
                  : "bg-black/60 hover:bg-black/80 text-white"
              )}
              onClick={handleAddToList}
              disabled={isAddingToList}
              aria-label={isInList ? `Remove ${normalizedShow.title} from list` : `Add ${normalizedShow.title} to list`}
            >
              {isAddingToList ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isInList ? (
                <Check size={18} />
              ) : (
                <Plus size={18} />
              )}
            </Button>
          )}

          {/* Hover Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="font-semibold text-sm drop-shadow-md line-clamp-2">
              {normalizedShow.title}
            </h3>
            {normalizedShow.year && (
              <p className="text-xs text-gray-300 drop-shadow-md">
                {normalizedShow.year}
              </p>
            )}
            {normalizedShow.streamingPlatform && normalizedShow.streamingPlatform !== "—" && (
              <p className="text-xs text-gray-300 drop-shadow-md">
                {normalizedShow.streamingPlatform}
              </p>
            )}
          </div>
        </div>

        {/* Simple Title (shown when not hovering) */}
        <div className="p-3 group-hover:opacity-0 transition-opacity duration-300">
          <h3 className="font-medium text-sm truncate mb-1">
            {normalizedShow.title}
          </h3>
          {normalizedShow.year && (
            <p className="text-xs text-muted-foreground">
              {normalizedShow.year}
            </p>
          )}
        </div>
      </div>

      {/* Rich Modal with All Actions */}
      {isModalOpen && (
        <BrandedShowModal
          showId={String(normalizedShow.id)}
          showType={normalizedShow.mediaType || 'movie'}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddToWatchlist={(showId) => {
            setIsInList(true);
            onAddToList?.(normalizedShow);
          }}
          onWatchNow={(show) => {
            // Analytics tracking for watch now
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'watch_now_click', {
                content_id: show.id,
                content_type: show.mediaType,
                title: show.title
              });
            }
          }}
        />
      )}
    </>
  );
}
