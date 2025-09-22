import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, Network, Tag, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { STREAMING_NETWORKS, getNetworksByCategory } from '@/utils/streaming-networks';

interface FilterControlsProps {
  selectedGenre: string;
  selectedNetwork: string;
  selectedYear: string;
  sortBy: string;
  onGenreChange: (genre: string) => void;
  onNetworkChange: (network: string) => void;
  onYearChange: (year: string) => void;
  onSortChange: (sort: string) => void;
  genres?: Array<{ id: number; name: string }>;
  compact?: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  selectedGenre,
  selectedNetwork,
  selectedYear,
  sortBy,
  onGenreChange,
  onNetworkChange,
  onYearChange,
  onSortChange,
  genres = [],
  compact = false,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);
  const streamingNetworks = getNetworksByCategory('streaming');
  const networkTV = getNetworksByCategory('network');

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'recent', label: 'Recently Added' },
    { value: 'alphabetical', label: 'A-Z' },
  ];

  const clearFilters = () => {
    onGenreChange('');
    onNetworkChange('');
    onYearChange('');
    onSortChange('popularity');
  };

  const hasActiveFilters =
    selectedGenre || selectedNetwork || selectedYear || sortBy !== 'popularity';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Genre Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600"
            >
              <Filter className="w-4 h-4 mr-2" />
              {selectedGenre ? 
                genres.find(g => g.id.toString() === selectedGenre)?.name || 'Genre' : 
                'Genre'
              }
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-slate-800 border-slate-600 max-h-60 overflow-y-auto">
            <DropdownMenuItem
              onClick={() => onGenreChange('')}
              className="text-slate-300 hover:bg-slate-700"
            >
              Genre
            </DropdownMenuItem>
            {Array.isArray(genres) && genres.map((genre) => (
              <DropdownMenuItem
                key={genre.id}
                onClick={() => onGenreChange(genre.id.toString())}
                className={`text-slate-300 hover:bg-slate-700 ${
                  selectedGenre === genre.id.toString() ? 'bg-purple-600/20 text-purple-400' : ''
                }`}
              >
                {genre.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Network Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600"
            >
              {selectedNetwork || 'Network'}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-slate-800 border-slate-600 max-h-60 overflow-y-auto">
            <DropdownMenuItem
              onClick={() => onNetworkChange('')}
              className="text-slate-300 hover:bg-slate-700"
            >
              All Networks
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-600" />
            <DropdownMenuLabel className="text-slate-400">Streaming</DropdownMenuLabel>
            {['Netflix', 'Amazon Prime Video', 'Hulu', 'Disney+', 'HBO Max', 'Apple TV+', 'Paramount+', 'Peacock'].map((network) => (
              <DropdownMenuItem
                key={network}
                onClick={() => onNetworkChange(network)}
                className={`text-slate-300 hover:bg-slate-700 ${
                  selectedNetwork === network ? 'bg-purple-600/20 text-purple-400' : ''
                }`}
              >
                {network}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-slate-600" />
            <DropdownMenuLabel className="text-slate-400">Broadcast</DropdownMenuLabel>
            {['NBC', 'ABC', 'CBS', 'FOX', 'The CW', 'AMC', 'FX', 'USA', 'TNT', 'TBS'].map((network) => (
              <DropdownMenuItem
                key={network}
                onClick={() => onNetworkChange(network)}
                className={`text-slate-300 hover:bg-slate-700 ${
                  selectedNetwork === network ? 'bg-purple-600/20 text-purple-400' : ''
                }`}
              >
                {network}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Year Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600"
            >
              {selectedYear || 'Year'}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-slate-800 border-slate-600 max-h-60 overflow-y-auto">
            <DropdownMenuItem
              onClick={() => onYearChange('')}
              className="text-slate-300 hover:bg-slate-700"
            >
              All Years
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-600" />
            {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <DropdownMenuItem
                key={year}
                onClick={() => onYearChange(year.toString())}
                className={`text-slate-300 hover:bg-slate-700 ${
                  selectedYear === year.toString() ? 'bg-purple-600/20 text-purple-400' : ''
                }`}
              >
                {year}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-slate-400 hover:text-white">
            Clear
          </Button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Filters</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {[selectedGenre, selectedNetwork, selectedYear].filter(Boolean).length} active
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-400 hover:text-white">
            Clear All
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Genre Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Genre</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600"
              >
                <span className="truncate">
                  {selectedGenre ? 
                    genres.find(g => g.id.toString() === selectedGenre)?.name || 'Select Genre' : 
                    'Genre'
                  }
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-slate-800 border-slate-600 max-h-60 overflow-y-auto">
              <DropdownMenuItem
                onClick={() => onGenreChange('')}
                className="text-slate-300 hover:bg-slate-700"
              >
                Genre
              </DropdownMenuItem>
              {genres.map((genre) => (
                <DropdownMenuItem
                  key={genre.id}
                  onClick={() => onGenreChange(genre.id.toString())}
                  className={`text-slate-300 hover:bg-slate-700 ${
                    selectedGenre === genre.id.toString() ? 'bg-purple-600/20 text-purple-400' : ''
                  }`}
                >
                  {genre.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Network Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Network</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600"
              >
                <span className="truncate">
                  {selectedNetwork || 'All Networks'}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-slate-800 border-slate-600 max-h-60 overflow-y-auto">
              <DropdownMenuItem
                onClick={() => onNetworkChange('')}
                className="text-slate-300 hover:bg-slate-700"
              >
                All Networks
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-600" />
              <DropdownMenuLabel className="text-slate-400">Streaming</DropdownMenuLabel>
              {['Netflix', 'Amazon Prime Video', 'Hulu', 'Disney+', 'HBO Max', 'Apple TV+', 'Paramount+', 'Peacock'].map((network) => (
                <DropdownMenuItem
                  key={network}
                  onClick={() => onNetworkChange(network)}
                  className={`text-slate-300 hover:bg-slate-700 ${
                    selectedNetwork === network ? 'bg-purple-600/20 text-purple-400' : ''
                  }`}
                >
                  {network}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-slate-600" />
              <DropdownMenuLabel className="text-slate-400">Broadcast</DropdownMenuLabel>
              {['NBC', 'ABC', 'CBS', 'FOX', 'The CW', 'AMC', 'FX', 'USA', 'TNT', 'TBS'].map((network) => (
                <DropdownMenuItem
                  key={network}
                  onClick={() => onNetworkChange(network)}
                  className={`text-slate-300 hover:bg-slate-700 ${
                    selectedNetwork === network ? 'bg-purple-600/20 text-purple-400' : ''
                  }`}
                >
                  {network}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Year Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Year</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600"
              >
                <span className="truncate">
                  {selectedYear || 'All Years'}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-slate-800 border-slate-600 max-h-60 overflow-y-auto">
              <DropdownMenuItem
                onClick={() => onYearChange('')}
                className="text-slate-300 hover:bg-slate-700"
              >
                All Years
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-600" />
              {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <DropdownMenuItem
                  key={year}
                  onClick={() => onYearChange(year.toString())}
                  className={`text-slate-300 hover:bg-slate-700 ${
                    selectedYear === year.toString() ? 'bg-purple-600/20 text-purple-400' : ''
                  }`}
                >
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterControls;
