// FriendFeedFilterChips.tsx - Scrollable activity type filters using context
import { useDashboardFilters } from './DashboardFilterProvider';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const filters = ['All', 'Lists', 'Comments', 'Ratings', 'Reactions'];

export const FriendFeedFilterChips: React.FC = () => {
  const { friendActivity, setFilter } = useDashboardFilters();

  return (
    <div className="flex gap-2 overflow-x-auto py-2 px-2">
      {filters.map((filter, index) => (
        <motion.div
          key={filter}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
        >
          <Button
            size="sm"
            variant={friendActivity === filter ? 'default' : 'outline'}
            onClick={() => setFilter('friendActivity', filter)}
            className={`
              whitespace-nowrap transition-all
              ${friendActivity === filter
                ? 'bg-blue-600 text-white border-blue-500 shadow-lg'
                : 'bg-gray-700/50 text-gray-300 border-gray-600 hover:bg-gray-600/50 hover:border-blue-500 hover:text-blue-300'
              }
            `}
          >
            {filter}
          </Button>
        </motion.div>
      ))}
    </div>
  );
};
