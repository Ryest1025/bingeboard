import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboardFilters } from '@/components/dashboard/filters/DashboardFilterProvider';
import type { RecommendationFilters } from './types';

// Import the FiltersState type to use for the setFilter function
type FiltersState = {
  activePlatforms: string[];
  preferredGenres: string[];
  userMood: string | null;
  friendActivity: string;
  showPublicLists: boolean;
  showCollaborativeLists: boolean;
  listSortBy: string;
  watchlistStatus: string;
};

export interface RecommendationFilterProps {
  inline?: boolean;
  compact?: boolean;
  onChange?: (filters: RecommendationFilters) => void;
  initialFilters?: RecommendationFilters;
}

const popoverVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const RecommendationFilter: React.FC<RecommendationFilterProps> = ({
  inline = true,
  compact = true,
  onChange,
  initialFilters = {}
}) => {
  const { preferredGenres, activePlatforms, userMood, setFilter } = useDashboardFilters();
  const [filters, setFilters] = useState<RecommendationFilters>(initialFilters);
  const [isOpen, setIsOpen] = useState(false);

  const moods = ['Cozy', 'Thrilling', 'Feel-good', 'Dark', 'Adventurous'];
  const platforms = ['Netflix', 'Prime', 'Hulu', 'Disney+', 'HBO'];
  const genres = ['Comedy', 'Drama', 'Sci-Fi', 'Documentary', 'Horror'];

  const toggle = (value: string, current: string[], filterKey: keyof FiltersState) => {
    const newValue = current.includes(value) ? current.filter((g) => g !== value) : [...current, value];
    setFilter(filterKey, newValue);
  };

  const updateFilter = (key: keyof RecommendationFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onChange?.(newFilters);
  };

  const hasActiveFilters =
    preferredGenres.length > 0 ||
    activePlatforms.length > 0 ||
    userMood !== null ||
    filters.hideWatched;

  const clearFilters = () => {
    setFilter('preferredGenres', []);
    setFilter('activePlatforms', []);
    setFilter('userMood', null);
    const clearedFilters = {};
    setFilters(clearedFilters);
    onChange?.(clearedFilters);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size={compact ? "sm" : "default"}
            className={`
              relative text-gray-400 hover:text-white hover:bg-gray-700
              ${hasActiveFilters ? 'text-blue-400 bg-blue-500/10' : ''}
            `}
          >
            <Settings className="h-4 w-4 mr-1" />
            Tune
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 h-4 w-4 p-0 text-xs bg-blue-500 text-white">
                {[preferredGenres.length > 0, activePlatforms.length > 0, userMood !== null, filters.hideWatched].filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent asChild align="start">
          <motion.div
            className="w-80 bg-gray-800 border-gray-700"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={popoverVariants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">Tune Recommendations</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-400 hover:text-white">
                    Clear
                  </Button>
                )}
              </div>

              {/* Mood Filter */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Mood</label>
                <div className="flex flex-wrap gap-1">
                  {moods.map((mood) => (
                    <Button
                      key={mood}
                      variant={userMood === mood ? "default" : "outline"}
                      size="sm"
                      className={`text-xs ${userMood === mood
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-transparent border-gray-600 text-gray-300 hover:border-purple-500 hover:text-purple-300'
                        }`}
                      onClick={() => setFilter('userMood', userMood === mood ? null : mood)}
                    >
                      {mood}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Genre Filter */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Genres</label>
                <div className="flex flex-wrap gap-1">
                  {genres.map((genre) => (
                    <Button
                      key={genre}
                      variant={preferredGenres.includes(genre) ? "default" : "outline"}
                      size="sm"
                      className={`text-xs ${preferredGenres.includes(genre)
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-transparent border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-300'
                        }`}
                      onClick={() => toggle(genre, preferredGenres, 'preferredGenres')}
                    >
                      {genre}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Platform Filter */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Platforms</label>
                <div className="flex flex-wrap gap-1">
                  {platforms.map((platform) => (
                    <Button
                      key={platform}
                      variant={activePlatforms.includes(platform) ? "default" : "outline"}
                      size="sm"
                      className={`text-xs ${activePlatforms.includes(platform)
                          ? 'bg-orange-600 text-white border-orange-500'
                          : 'bg-transparent border-gray-600 text-gray-300 hover:border-orange-500 hover:text-orange-300'
                        }`}
                      onClick={() => toggle(platform, activePlatforms, 'activePlatforms')}
                    >
                      {platform}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Hide Watched Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <span className="text-sm text-gray-300">Hide shows I've seen</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-2 ${filters.hideWatched ? 'text-blue-400' : 'text-gray-400'}`}
                  onClick={() => updateFilter('hideWatched', !filters.hideWatched)}
                >
                  {filters.hideWatched ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
