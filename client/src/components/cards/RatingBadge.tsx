import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface RatingBadgeProps {
  rating: string;
  className?: string;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({ 
  rating, 
  className = '' 
}) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.3 }}
    className={`inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400/90 to-amber-500/90 backdrop-blur-sm shadow-lg border border-yellow-300/30 ${className}`}
  >
    <Star className="w-3 h-3 mr-1 fill-yellow-900 text-yellow-900" />
    <span className="text-xs font-semibold text-yellow-900">{rating}</span>
  </motion.div>
);