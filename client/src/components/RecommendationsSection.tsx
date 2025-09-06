import React from 'react';
import { motion } from 'framer-motion';
import AnimatedShowCard from './AnimatedShowCard';
import { Show } from '@/types';

interface RecommendationsSectionProps {
  title: string;
  shows: Show[];
  activeFilters?: string[];
  onShowClick?: (show: Show) => void;
  onAddToList?: (show: Show) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
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

export default function RecommendationsSection({
  title,
  shows,
  activeFilters = [],
  onShowClick,
  onAddToList
}: RecommendationsSectionProps) {
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
      <motion.h2
        variants={itemVariants}
        className="text-xl md:text-2xl font-bold text-white"
      >
        {title}
      </motion.h2>

      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {filtered.map((show, index) => (
          <motion.div key={show.id} variants={itemVariants}>
            <AnimatedShowCard
              show={show}
              index={index}
              onClick={() => onShowClick?.(show)}
              onAddToList={() => onAddToList?.(show)}
              className="w-full"
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
