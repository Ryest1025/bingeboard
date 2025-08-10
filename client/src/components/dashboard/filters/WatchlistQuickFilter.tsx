// WatchlistQuickFilter.tsx - Watch progress status tabs using context
import { useDashboardFilters } from './DashboardFilterProvider';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Play, Pause, CheckCircle, Clock } from 'lucide-react';

const statuses = [
  { value: 'Watching', label: 'Watching', icon: Play, color: 'green' },
  { value: 'Paused', label: 'Paused', icon: Pause, color: 'yellow' },
  { value: 'Completed', label: 'Completed', icon: CheckCircle, color: 'blue' },
  { value: 'Want to Watch', label: 'Want to Watch', icon: Clock, color: 'purple' }
];

export const WatchlistQuickFilter: React.FC = () => {
  const { watchlistStatus, setFilter } = useDashboardFilters();

  return (
    <div className="flex gap-2 overflow-x-auto py-2 px-2">
      {statuses.map(({ value, label, icon: Icon, color }, index) => (
        <motion.div
          key={value}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
        >
          <Button
            size="sm"
            variant={watchlistStatus === value ? 'default' : 'outline'}
            onClick={() => setFilter('watchlistStatus', value)}
            className={`
              flex items-center gap-1.5 whitespace-nowrap transition-all
              ${watchlistStatus === value
                ? `bg-${color}-600 text-white border-${color}-500 shadow-lg`
                : 'bg-gray-700/50 text-gray-300 border-gray-600 hover:bg-gray-600/50 hover:text-gray-200'
              }
            `}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Button>
        </motion.div>
      ))}
    </div>
  );
};
