import React from 'react';
import { Play, PlayCircle, Plus } from 'lucide-react';
import { ActionButton } from './ActionButton';
import TrailerButton from '@/components/trailer-button';

interface ActionConfig {
  watchNow?: boolean;
  trailer?: boolean;
  addToList?: boolean;
}

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
}

interface BottomActionButtonsProps {
  actions?: ActionConfig;
  firstStreamingLogo?: string | null;
  showStreamingLogoInButton?: boolean;
  onWatchNow?: () => void;
  onAddToWatchlist?: () => void;
  onWatchTrailer?: () => void;
  className?: string;
  media?: MediaItem; // Add media prop for TrailerButton
}

export const BottomActionButtons: React.FC<BottomActionButtonsProps> = ({
  actions = { watchNow: true, trailer: true, addToList: true },
  firstStreamingLogo,
  showStreamingLogoInButton = false,
  onWatchNow,
  onAddToWatchlist,
  onWatchTrailer,
  className = '',
  media
}) => {
  if (!actions.watchNow && !actions.trailer && !actions.addToList) {
    return null;
  }

  // Count active buttons to determine layout
  const activeButtons = [actions.watchNow, actions.trailer, actions.addToList].filter(Boolean).length;
  
  // For 3 buttons, use a stacked layout to prevent crowding
  if (activeButtons === 3) {
    return (
      <div className={`mt-3 pt-3 border-t border-slate-700/50 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${className}`}>
        <div className="space-y-2">
          {/* Primary Watch Now button - full width with streaming logo */}
          {actions.watchNow && (
            <ActionButton
              size="sm"
              variant="primary"
              onClick={(e) => {
                e?.stopPropagation();
                onWatchNow?.();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold"
            >
              <Play className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Watch</span>
              {firstStreamingLogo && showStreamingLogoInButton && (
                <img 
                  src={firstStreamingLogo} 
                  alt="Streaming" 
                  className="w-4 h-4 rounded-sm bg-white/90 p-0.5 flex-shrink-0" 
                />
              )}
            </ActionButton>
          )}
          
          {/* Secondary buttons in a row */}
          <div className="flex gap-2">
            {actions.trailer && media && (
              <TrailerButton
                show={{
                  id: media.id,
                  tmdbId: media.id,
                  title: media.title || media.name || 'Unknown'
                }}
                variant="secondary"
                size="sm"
                showLabel={true}
                className="flex-1 text-xs min-w-0"
              />
            )}
            
            {actions.addToList && (
              <ActionButton 
                size="sm" 
                variant="secondary" 
                onClick={(e) => {
                  e?.stopPropagation();
                  onAddToWatchlist?.();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-slate-700 hover:bg-slate-600 border-slate-600 text-white min-w-0"
              >
                <Plus className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs font-medium truncate">Add</span>
              </ActionButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  // For 1-2 buttons, use the horizontal layout
  return (
    <div className={`mt-4 pt-4 border-t border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${className}`}>
      <div className="flex gap-2 justify-center">
        {actions.watchNow && (
          <ActionButton
            size="sm"
            variant="primary"
            onClick={(e) => {
              e?.stopPropagation();
              onWatchNow?.();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 min-w-0"
          >
            <Play className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate text-xs font-medium">Watch</span>
          </ActionButton>
        )}
        
        {actions.trailer && media && (
          <TrailerButton
            show={{
              id: media.id,
              tmdbId: media.id,
              title: media.title || media.name || 'Unknown'
            }}
            variant="secondary"
            size="sm"
            showLabel={true}
            className="flex-1 text-xs"
          />
        )}
        
        {actions.addToList && (
          <ActionButton 
            size="sm" 
            variant="secondary" 
            onClick={(e) => {
              e?.stopPropagation();
              onAddToWatchlist?.();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 border-slate-600 text-white min-w-0"
          >
            <Plus className="w-3 h-3 flex-shrink-0" />
            <span className="truncate text-xs font-medium">Add</span>
          </ActionButton>
        )}
      </div>
    </div>
  );
};