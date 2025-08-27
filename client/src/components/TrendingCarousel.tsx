import React from 'react';
import { motion } from 'framer-motion';
import AnimatedShowCard from './AnimatedShowCard';
import { Show } from '@/types';

interface TrendingCarouselProps {
  title: string;
  shows: Show[];
  activeFilters?: string[];
  viewAllUrl?: string;
  onShowClick?: (show: Show) => void;
  onAddToList?: (show: Show) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function TrendingCarousel({
  title,
  shows,
  activeFilters = [],
  viewAllUrl,
  onShowClick,
  onAddToList
}: TrendingCarouselProps) {
  const filtered = React.useMemo(() => {
    if (!activeFilters?.length) return shows.slice(0, 4);
    return shows.filter(s => s.genres?.some(g => activeFilters.includes(g))).slice(0, 4);
  }, [shows, activeFilters]);

  if (!filtered.length) return null;

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      aria-label={title}
      className="space-y-6"
    >
      {/* Section Header */}
      <div className="flex justify-between items-center">
        <motion.h2
          variants={itemVariants}
          className="text-xl md:text-2xl font-bold text-white"
        >
          {title}
        </motion.h2>
        {viewAllUrl && (
          <motion.a
            variants={itemVariants}
            href={viewAllUrl}
            className="text-red-500 font-semibold hover:text-red-400 transition-colors duration-200 hover:underline"
          >
            View All
          </motion.a>
        )}
      </div>

      {/* Horizontal Scrolling Container */}
      <motion.div
        variants={itemVariants}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {filtered.map((show, index) => (
          <div key={show.id} className="min-w-[200px] flex-shrink-0">
            <AnimatedShowCard
              show={show}
              index={index}
              onClick={() => onShowClick?.(show)}
              onAddToList={() => onAddToList?.(show)}
              className="w-full"
            />
          </div>
        ))}
      </motion.div>
    </motion.section>
  );
}
