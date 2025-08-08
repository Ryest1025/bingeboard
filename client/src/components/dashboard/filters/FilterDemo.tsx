// FilterDemo.tsx - Example component showing how to use the new useReducer-based filter system
import React from 'react';
import { useDashboardFilters } from './DashboardFilterProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const FilterDemo: React.FC = () => {
  const { 
    activePlatforms, 
    preferredGenres, 
    userMood, 
    friendActivity,
    watchlistStatus,
    setFilter, 
    resetFilters 
  } = useDashboardFilters();

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Filter System Demo</h3>
      
      {/* Current Filter State Display */}
      <div className="space-y-3 mb-6">
        <div>
          <span className="text-sm text-gray-300">Active Platforms: </span>
          {activePlatforms.length > 0 ? (
            <div className="flex gap-1 mt-1">
              {activePlatforms.map(platform => (
                <Badge key={platform} variant="secondary">{platform}</Badge>
              ))}
            </div>
          ) : (
            <span className="text-gray-500">None</span>
          )}
        </div>
        
        <div>
          <span className="text-sm text-gray-300">Preferred Genres: </span>
          {preferredGenres.length > 0 ? (
            <div className="flex gap-1 mt-1">
              {preferredGenres.map(genre => (
                <Badge key={genre} variant="secondary">{genre}</Badge>
              ))}
            </div>
          ) : (
            <span className="text-gray-500">None</span>
          )}
        </div>
        
        <div>
          <span className="text-sm text-gray-300">User Mood: </span>
          <span className="text-white">{userMood || 'None'}</span>
        </div>
        
        <div>
          <span className="text-sm text-gray-300">Friend Activity: </span>
          <span className="text-white">{friendActivity}</span>
        </div>
        
        <div>
          <span className="text-sm text-gray-300">Watchlist Status: </span>
          <span className="text-white">{watchlistStatus}</span>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300">Quick Actions:</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFilter('activePlatforms', ['Netflix', 'Hulu'])}
          >
            Set Netflix + Hulu
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFilter('preferredGenres', ['Comedy', 'Drama'])}
          >
            Set Comedy + Drama
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFilter('userMood', 'Cozy')}
          >
            Set Cozy Mood
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFilter('friendActivity', 'Lists')}
          >
            Show Friend Lists
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFilter('watchlistStatus', 'Completed')}
          >
            Show Completed
          </Button>
          
          <Button
            size="sm"
            variant="destructive"
            onClick={resetFilters}
          >
            Reset All
          </Button>
        </div>
      </div>
    </div>
  );
};
