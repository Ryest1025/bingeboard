import React from 'react';
import { Play, PlayCircle, Plus } from 'lucide-react';
import { ActionButton } from './ActionButton';

interface ActionConfig {
  watchNow?: boolean;
  trailer?: boolean;
  addToList?: boolean;
}

interface BottomActionButtonsProps {
  actions?: ActionConfig;
  firstStreamingLogo?: string | null;
  showStreamingLogoInButton?: boolean;
  onWatchNow?: () => void;
  onAddToWatchlist?: () => void;
  onWatchTrailer?: () => void;
  className?: string;
}

export const BottomActionButtons: React.FC<BottomActionButtonsProps> = ({
  actions = { watchNow: true, trailer: true, addToList: true },
  firstStreamingLogo,
  showStreamingLogoInButton = false,
  onWatchNow,
  onAddToWatchlist,
  onWatchTrailer,
  className = ''
}) => {
  if (!actions.watchNow && !actions.trailer && !actions.addToList) {
    return null;
  }

  // Count active buttons to determine layout
  const activeButtons = [actions.watchNow, actions.trailer, actions.addToList].filter(Boolean).length;
  
  // For 3 buttons, use a stacked layout to prevent crowding
  if (activeButtons === 3) {
    return (
      <div className={`mt-4 pt-4 border-t border-slate-700/50 ${className}`}>
        <div className="space-y-2">
          {/* Primary Watch Now button - full width */}
          {actions.watchNow && (
            <ActionButton
              size="sm"
              variant="primary"
              onClick={(e) => {
                e?.stopPropagation();
                onWatchNow?.();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5"
            >
              <Play className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-xs font-medium">Watch Now</span>
            </ActionButton>
          )}
          
          {/* Secondary buttons in a row */}
          <div className="flex gap-2">
            {actions.trailer && (
              <ActionButton 
                size="sm" 
                variant="secondary" 
                onClick={(e) => {
                  e?.stopPropagation();
                  onWatchTrailer?.();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
              >
                <PlayCircle className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs font-medium">Trailer</span>
              </ActionButton>
            )}
            
            {actions.addToList && (
              <ActionButton 
                size="sm" 
                variant="secondary" 
                onClick={(e) => {
                  e?.stopPropagation();
                  onAddToWatchlist?.();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
              >
                <Plus className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs font-medium">Add</span>
              </ActionButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  // For 1-2 buttons, use the horizontal layout
  return (
    <div className={`mt-4 pt-4 border-t border-slate-700/50 ${className}`}>
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
        
        {actions.trailer && (
          <ActionButton 
            size="sm" 
            variant="secondary" 
            onClick={(e) => {
              e?.stopPropagation();
              onWatchTrailer?.();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 border-slate-600 text-white min-w-0"
          >
            <PlayCircle className="w-3 h-3 flex-shrink-0" />
            <span className="truncate text-xs font-medium">Trailer</span>
          </ActionButton>
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