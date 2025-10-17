import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp,
  Star,
  Award,
  Clock,
  Bell,
  Sparkles,
  Tv,
  Filter,
  RefreshCw,
  Flame,
  Trophy,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface InteractiveDiscoveryToolsProps {
  onStreamingFilter: (platforms: string[]) => void;
  onGenreMix: (genres: string[]) => void;
  onTimeFilter: (duration: string) => void;
  onRandomDiscover: () => void;
  onPersonalityMatch: (type: string) => void;
  className?: string;
}

type GenreType = {
  id: string;
  name: string;
  icon: any;
  color: string;
};

type StreamingPlatform = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

const genres: GenreType[] = [
  { id: 'action', name: 'Action', icon: Zap, color: 'bg-red-500' },
  { id: 'comedy', name: 'Comedy', icon: Heart, color: 'bg-yellow-500' },
  { id: 'drama', name: 'Drama', icon: Users, color: 'bg-blue-500' },
  { id: 'horror', name: 'Horror', icon: Shield, color: 'bg-purple-500' },
  { id: 'romance', name: 'Romance', icon: Heart, color: 'bg-pink-500' },
  { id: 'sci-fi', name: 'Sci-Fi', icon: Globe, color: 'bg-cyan-500' },
  { id: 'fantasy', name: 'Fantasy', icon: Mountain, color: 'bg-indigo-500' },
  { id: 'documentary', name: 'Documentary', icon: Book, color: 'bg-green-500' },
  { id: 'thriller', name: 'Thriller', icon: Brain, color: 'bg-gray-500' },
  { id: 'music', name: 'Music', icon: Music, color: 'bg-emerald-500' }
];

const streamingPlatforms: StreamingPlatform[] = [
  { id: 'netflix', name: 'Netflix', icon: '/logos/netflix.png', color: 'bg-red-600' },
  { id: 'disney', name: 'Disney+', icon: '/logos/disney-plus.png', color: 'bg-blue-600' },
  { id: 'hbo', name: 'HBO Max', icon: '/logos/hbo-max.png', color: 'bg-purple-600' },
  { id: 'prime', name: 'Prime Video', icon: '/logos/prime-video.png', color: 'bg-blue-500' },
  { id: 'hulu', name: 'Hulu', icon: '/logos/hulu.png', color: 'bg-green-600' },
  { id: 'paramount', name: 'Paramount+', icon: '/logos/paramount-plus.png', color: 'bg-blue-700' }
];

type QuickFilterOption = {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
};

const quickFilters: QuickFilterOption[] = [
  { id: 'trending', name: 'Most Popular', icon: TrendingUp, color: 'bg-gradient-to-r from-red-500 to-orange-500', description: 'Everyone\'s watching' },
  { id: 'highly-rated', name: 'Highly Rated', icon: Star, color: 'bg-gradient-to-r from-yellow-400 to-amber-500', description: '8.0+ IMDb rating' },
  { id: 'award-winners', name: 'Award Winners', icon: Trophy, color: 'bg-gradient-to-r from-purple-500 to-pink-500', description: 'Emmy & Golden Globe' },
  { id: 'new-seasons', name: 'New Seasons', icon: Bell, color: 'bg-gradient-to-r from-blue-500 to-cyan-500', description: 'Fresh episodes' },
  { id: 'binge-worthy', name: 'Binge-Worthy', icon: Flame, color: 'bg-gradient-to-r from-orange-500 to-red-600', description: 'Full seasons ready' },
  { id: 'hidden-gems', name: 'Hidden Gems', icon: Sparkles, color: 'bg-gradient-to-r from-teal-500 to-emerald-500', description: 'Underrated classics' },
];

export const InteractiveDiscoveryTools: React.FC<InteractiveDiscoveryToolsProps> = ({
  onGenreMix,
  onRandomDiscover,
  onTimeFilter,
  onPersonalityMatch,
  onStreamingFilter,
  className = ''
}) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);

  const handleGenreToggle = (genreId: string) => {
    const newSelection = selectedGenres.includes(genreId)
      ? selectedGenres.filter(g => g !== genreId)
      : [...selectedGenres, genreId];
    
    setSelectedGenres(newSelection);
    onGenreMix?.(newSelection);
  };

  const handlePlatformToggle = (platformId: string) => {
    const newSelection = selectedPlatforms.includes(platformId)
      ? selectedPlatforms.filter(p => p !== platformId)
      : [...selectedPlatforms, platformId];
    
    setSelectedPlatforms(newSelection);
    onStreamingFilter?.(newSelection);
  };

  const handleQuickFilter = (filterId: string) => {
    const newFilter = selectedFilter === filterId ? null : filterId;
    setSelectedFilter(newFilter);
    // This will trigger the onPersonalityMatch callback with the filter type
    onPersonalityMatch?.(newFilter || '');
  };

  const handleRandomDiscover = async () => {
    setIsRandomizing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRandomizing(false);
    onRandomDiscover?.();
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Quick Filters - What Users Actually Care About */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Filter className="w-5 h-5 text-cyan-400" />
          Quick Filters
          {selectedFilter && (
            <Badge variant="secondary" className="ml-2 bg-cyan-500/20 text-cyan-300">
              {quickFilters.find(f => f.id === selectedFilter)?.name}
            </Badge>
          )}
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickFilters.map((filter) => {
            const isSelected = selectedFilter === filter.id;
            const Icon = filter.icon;
            
            return (
              <motion.button
                key={filter.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickFilter(filter.id)}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                  isSelected
                    ? 'border-white shadow-xl'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800/70'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="filter-selected-bg"
                    className={`absolute inset-0 ${filter.color} opacity-20`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-xl ${filter.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <span className={`block text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {filter.name}
                    </span>
                    <span className="text-xs text-slate-400">{filter.description}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
      {/* Streaming Platform Filter */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Tv className="w-5 h-5 text-purple-400" />
          Filter by Streaming Platform
          {selectedPlatforms.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-purple-500/20 text-purple-300">
              {selectedPlatforms.length} selected
            </Badge>
          )}
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {streamingPlatforms.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform.id);
            
            return (
              <motion.button
                key={platform.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePlatformToggle(platform.id)}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${
                  isSelected
                    ? 'border-white bg-white/10 shadow-lg'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800/70'
                }`}
              >
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center`}>
                    <span className="text-white font-bold text-lg">
                      {platform.name.charAt(0)}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {platform.name}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Genre Mixer */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-green-400" />
          Mix & Match Genres
          {selectedGenres.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-green-500/20 text-green-300">
              {selectedGenres.length} selected
            </Badge>
          )}
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => {
            const isSelected = selectedGenres.includes(genre.id);
            const Icon = genre.icon;
            
            return (
              <motion.button
                key={genre.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleGenreToggle(genre.id)}
                className={`px-4 py-2 rounded-full border-2 transition-all duration-300 flex items-center gap-2 ${
                  isSelected
                    ? `border-white ${genre.color} text-white shadow-lg`
                    : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-800/70'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{genre.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {(selectedGenres.length > 0 || selectedPlatforms.length > 0 || selectedFilter) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">Active Filters:</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedGenres([]);
                  setSelectedPlatforms([]);
                  setSelectedFilter(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedFilter && (
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300">
                  {quickFilters.find(f => f.id === selectedFilter)?.name}
                </Badge>
              )}
              {selectedPlatforms.map(platformId => {
                const platform = streamingPlatforms.find(p => p.id === platformId);
                return (
                  <Badge key={platformId} variant="secondary" className="bg-purple-500/20 text-purple-300">
                    {platform?.name}
                  </Badge>
                );
              })}
              {selectedGenres.map(genreId => {
                const genre = genres.find(g => g.id === genreId);
                return (
                  <Badge key={genreId} variant="secondary" className="bg-green-500/20 text-green-300">
                    {genre?.name}
                  </Badge>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveDiscoveryTools;