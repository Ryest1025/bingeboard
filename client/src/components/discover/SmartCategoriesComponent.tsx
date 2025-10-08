import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Calendar, 
  Award, 
  Clock, 
  Eye, 
  Users, 
  Zap, 
  Coffee, 
  Star,
  Bell,
  Plus
} from 'lucide-react';
import { IntelligentCard, generateIntelligentProps } from './IntelligentCard';
import { SMART_CATEGORIES, SmartCategory } from './SmartCategories';

interface SmartCategoriesProps {
  mediaData: any[];
  onMediaClick?: (media: any) => void;
  onWatchNow?: (media: any) => void;
  onAddToWatchlist?: (media: any) => void;
  onWatchTrailer?: (media: any) => void;
  onShowInfo?: (media: any) => void;
  onSetReminder?: (media: any) => void;
  className?: string;
}

// Icon mapping for category display
const iconMap = {
  'heart': Heart,
  'calendar': Calendar,
  'award': Award,
  'clock': Clock,
  'eye': Eye,
  'users': Users,
  'zap': Zap,
  'coffee': Coffee,
  'star': Star
};

export const SmartCategoriesComponent: React.FC<SmartCategoriesProps> = ({
  mediaData,
  onMediaClick,
  onWatchNow,
  onAddToWatchlist,
  onWatchTrailer,
  onShowInfo,
  onSetReminder,
  className = ''
}) => {
  // Simulate personalized category assignment
  const getCategorizedMedia = () => {
    const categorized: Record<string, any[]> = {};
    
    SMART_CATEGORIES.forEach((category: SmartCategory) => {
      // Randomly assign 4-6 items to each category for demo
      const shuffled = [...mediaData].sort(() => 0.5 - Math.random());
      categorized[category.key] = shuffled.slice(0, Math.floor(Math.random() * 3) + 4);
    });
    
    return categorized;
  };

  const categorizedMedia = getCategorizedMedia();

  const handleCardAction = (media: any, action: string, category: string) => {
    // Special handling for upcoming content
    if (category === 'upcoming-with-reminders' && action === 'watchNow') {
      onSetReminder?.(media);
      return;
    }
    
    // Standard actions
    switch (action) {
      case 'click':
        onMediaClick?.(media);
        break;
      case 'watchNow':
        onWatchNow?.(media);
        break;
      case 'watchlist':
        onAddToWatchlist?.(media);
        break;
      case 'trailer':
        onWatchTrailer?.(media);
        break;
      case 'info':
        onShowInfo?.(media);
        break;
    }
  };

  return (
    <div className={`space-y-12 ${className}`}>
      {SMART_CATEGORIES.map((category: SmartCategory, categoryIndex: number) => {
        const Icon = iconMap[category.iconName as keyof typeof iconMap] || Star;
        const categoryMedia = categorizedMedia[category.key] || [];
        
        if (categoryMedia.length === 0) return null;

        return (
          <motion.div
            key={category.key}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1, duration: 0.6 }}
            className="space-y-6"
          >
            {/* Category Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                    <p className="text-slate-400 text-sm max-w-2xl">{category.reasoning}</p>
                  </div>
                </div>
                
                {/* Priority Indicator */}
                {category.priority >= 8 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <span className="text-yellow-400 font-medium">Priority for you</span>
                  </div>
                )}
              </div>

              {/* View All Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                View All
              </motion.button>
            </div>

            {/* Category Content */}
            <div className="relative">
              {/* Horizontal Scroll Container */}
              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                {categoryMedia.map((media, index) => (
                  <motion.div
                    key={`${category.key}-${media.id}-${index}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (categoryIndex * 0.1) + (index * 0.05), duration: 0.4 }}
                    className="flex-shrink-0 w-56"
                  >
                    <IntelligentCard
                      media={media}
                      {...generateIntelligentProps(media, category.key)}
                      onCardClick={(m) => handleCardAction(m, 'click', category.key)}
                      onWatchNow={(m) => handleCardAction(m, 'watchNow', category.key)}
                      onAddToWatchlist={(m) => handleCardAction(m, 'watchlist', category.key)}
                      onWatchTrailer={(m) => handleCardAction(m, 'trailer', category.key)}
                      onShowInfo={(m) => handleCardAction(m, 'info', category.key)}
                      className="h-full"
                    />
                  </motion.div>
                ))}
                
                {/* Show More Card */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (categoryIndex * 0.1) + (categoryMedia.length * 0.05), duration: 0.4 }}
                  className="flex-shrink-0 w-56"
                >
                  <div className="h-80 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center gap-4 hover:bg-slate-800/70 transition-all duration-300 cursor-pointer group">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium">See More</p>
                      <p className="text-slate-400 text-sm">{category.title}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Fade Edges */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none z-10" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Export as default
export default SmartCategoriesComponent;