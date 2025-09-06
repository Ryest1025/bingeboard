import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, Heart, Search, Filter } from 'lucide-react';

interface FloatingActionsProps {
  onAddToWatchlist?: () => void;
  onToggleFavorites?: () => void;
  onQuickSearch?: () => void;
  onToggleFilters?: () => void;
}

export default function FloatingActions({
  onAddToWatchlist,
  onToggleFavorites,
  onQuickSearch,
  onToggleFilters
}: FloatingActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const mainButtonVariants = {
    expanded: { rotate: 45 },
    collapsed: { rotate: 0 }
  };

  const actionButtonVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
      y: 20
    },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        type: "spring",
        stiffness: 300
      }
    })
  };

  const actions = [
    { icon: Heart, label: 'Favorites', onClick: onToggleFavorites, color: 'bg-pink-600 hover:bg-pink-700' },
    { icon: Search, label: 'Search', onClick: onQuickSearch, color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: Filter, label: 'Filters', onClick: onToggleFilters, color: 'bg-purple-600 hover:bg-purple-700' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Buttons */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute bottom-16 right-0 flex flex-col gap-3"
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                custom={index}
                variants={actionButtonVariants}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={action.onClick}
                className={`${action.color} text-white p-3 rounded-full shadow-lg backdrop-blur-sm group relative`}
                aria-label={action.label}
              >
                <action.icon className="w-5 h-5" />

                {/* Tooltip */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {action.label}
                </motion.div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        variants={mainButtonVariants}
        animate={isExpanded ? "expanded" : "collapsed"}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => isExpanded ? onAddToWatchlist?.() : setIsExpanded(true)}
        onBlur={() => setTimeout(() => setIsExpanded(false), 150)}
        className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg backdrop-blur-sm relative group"
        aria-label={isExpanded ? "Add to Watchlist" : "Quick Actions"}
      >
        <Plus className="w-6 h-6" />

        {/* Main button tooltip */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isExpanded ? "Add to Watchlist" : "Quick Actions"}
        </motion.div>

        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-red-400"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 0, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.button>
    </div>
  );
}
