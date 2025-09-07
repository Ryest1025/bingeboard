import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Filter, Eye, EyeOff, Lock, Unlock, Users, Tag, Calendar } from 'lucide-react';
import type { CustomListFilters } from './types';

export interface CustomListFilterPanelProps {
  onChange?: (filters: CustomListFilters) => void;
  initialFilters?: CustomListFilters;
  mobile?: boolean;
}

const availableTags = ['Watchlist', 'Favorites', 'Comedy', 'Drama', 'Sci-Fi', 'Completed', 'Family', 'Date Night'];
const sortOptions = [
  { value: 'updated', label: 'Recently Updated' },
  { value: 'shows', label: 'Most Shows' },
  { value: 'alphabetical', label: 'A-Z' },
  { value: 'created', label: 'Date Created' }
];

export const CustomListFilterPanel: React.FC<CustomListFilterPanelProps> = ({
  onChange,
  initialFilters = { visibility: 'all', collaborative: null, tags: [], sortBy: 'updated' },
  mobile = false
}) => {
  const [filters, setFilters] = useState<CustomListFilters>(initialFilters);
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof CustomListFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onChange?.(newFilters);
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    updateFilter('tags', newTags);
  };

  const clearFilters = () => {
    const clearedFilters = { visibility: 'all' as const, collaborative: null, tags: [], sortBy: 'updated' as const };
    setFilters(clearedFilters);
    onChange?.(clearedFilters);
  };

  const hasActiveFilters =
    filters.visibility !== 'all' ||
    filters.collaborative !== null ||
    filters.tags.length > 0 ||
    filters.sortBy !== 'updated';

  const FilterContent = () => (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-white flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Lists
        </h4>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-400 hover:text-white">
            Clear
          </Button>
        )}
      </div>

      {/* Visibility Filter */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Visibility</label>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All Lists', icon: Eye },
            { value: 'public', label: 'Public', icon: Unlock },
            { value: 'private', label: 'Private', icon: Lock }
          ].map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={filters.visibility === value ? "default" : "outline"}
              size="sm"
              className={`flex items-center gap-1.5 ${filters.visibility === value
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-transparent border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-300'
                }`}
              onClick={() => updateFilter('visibility', value)}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Collaborative Filter */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Collaboration</label>
        <div className="flex gap-2">
          {[
            { value: null, label: 'All' },
            { value: true, label: 'Collaborative' },
            { value: false, label: 'Personal' }
          ].map(({ value, label }) => (
            <Button
              key={String(value)}
              variant={filters.collaborative === value ? "default" : "outline"}
              size="sm"
              className={`flex items-center gap-1.5 ${filters.collaborative === value
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-transparent border-gray-600 text-gray-300 hover:border-purple-500 hover:text-purple-300'
                }`}
              onClick={() => updateFilter('collaborative', value)}
            >
              <Users className="h-3.5 w-3.5" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Tags</label>
        <div className="flex flex-wrap gap-1">
          {availableTags.map((tag) => (
            <Button
              key={tag}
              variant={filters.tags.includes(tag) ? "default" : "outline"}
              size="sm"
              className={`text-xs flex items-center gap-1 ${filters.tags.includes(tag)
                  ? 'bg-teal-600 text-white border-teal-500'
                  : 'bg-transparent border-gray-600 text-gray-300 hover:border-teal-500 hover:text-teal-300'
                }`}
              onClick={() => toggleTag(tag)}
            >
              <Tag className="h-3 w-3" />
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Sort By</label>
        <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {sortOptions.map(({ value, label }) => (
              <SelectItem key={value} value={value} className="text-white hover:bg-gray-700">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-gray-700">
          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-xs text-gray-400 mr-2">Active:</span>
            {filters.visibility !== 'all' && (
              <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-300">
                {filters.visibility}
              </Badge>
            )}
            {filters.collaborative !== null && (
              <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300">
                {filters.collaborative ? 'collaborative' : 'personal'}
              </Badge>
            )}
            {filters.tags.length > 0 && (
              <Badge variant="secondary" className="text-xs bg-teal-500/20 text-teal-300">
                {filters.tags.length} tag{filters.tags.length > 1 ? 's' : ''}
              </Badge>
            )}
            {filters.sortBy !== 'updated' && (
              <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-300">
                {sortOptions.find(opt => opt.value === filters.sortBy)?.label}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (mobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Filter className="h-4 w-4 mr-1" />
            Filter
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 h-4 w-4 p-0 text-xs bg-blue-500 text-white">
                {[filters.visibility !== 'all', filters.collaborative !== null, filters.tags.length > 0, filters.sortBy !== 'updated'].filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-gray-800 border-gray-700">
          <DrawerHeader>
            <DrawerTitle className="text-white">Filter Your Lists</DrawerTitle>
          </DrawerHeader>
          <FilterContent />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700">
      <FilterContent />
    </div>
  );
};
