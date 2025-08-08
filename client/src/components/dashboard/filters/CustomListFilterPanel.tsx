// CustomListFilterPanel.tsx - List filtering with toggles and sort using context
import { useDashboardFilters } from './DashboardFilterProvider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { SortAsc } from 'lucide-react';

const sortOptions = [
  { value: 'date', label: 'Recently Updated' },
  { value: 'shows', label: 'Most Shows' },
  { value: 'alphabetical', label: 'A-Z' },
  { value: 'created', label: 'Date Created' }
];

export const CustomListFilterPanel: React.FC = () => {
  const {
    showPublicLists,
    showCollaborativeLists,
    listSortBy,
    setFilter
  } = useDashboardFilters();

  return (
    <motion.div 
      className="flex flex-wrap items-center gap-4 p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2">
        <Switch 
          checked={showPublicLists} 
          onCheckedChange={(checked) => setFilter('showPublicLists', checked)}
          className="data-[state=checked]:bg-blue-600"
        />
        <span className="text-sm text-gray-300">Public Lists</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Switch 
          checked={showCollaborativeLists} 
          onCheckedChange={(checked) => setFilter('showCollaborativeLists', checked)}
          className="data-[state=checked]:bg-purple-600"
        />
        <span className="text-sm text-gray-300">Collaborative</span>
      </div>
      
      <div className="flex items-center gap-2">
        <SortAsc className="h-4 w-4 text-gray-400" />
        <Select value={listSortBy} onValueChange={(value) => setFilter('listSortBy', value)}>
          <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {sortOptions.map(({ value, label }) => (
              <SelectItem 
                key={value} 
                value={value} 
                className="text-white hover:bg-gray-700 focus:bg-gray-700"
              >
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
};
