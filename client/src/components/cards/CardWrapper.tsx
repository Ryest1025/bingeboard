import React from 'react';
import { motion } from 'framer-motion';

interface CardWrapperProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'vertical' | 'horizontal' | 'spotlight' | 'compact' | 'spotlight-polished' | 'vertical-polished' | 'spotlight-poster-backdrop';
}

export const CardWrapper: React.FC<CardWrapperProps> = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'vertical' 
}) => {
  const variantClasses = {
    vertical: "group cursor-pointer rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 hover:border-slate-500/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-visible",
    horizontal: "group cursor-pointer rounded-2xl bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-slate-700/50 hover:border-slate-500/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] overflow-visible",
    spotlight: "group cursor-pointer rounded-3xl bg-gradient-to-br from-slate-900/95 to-black/95 border border-slate-600/30 hover:border-slate-400/50 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:scale-[1.01] overflow-hidden",
    compact: "group cursor-pointer rounded-xl bg-gradient-to-r from-slate-800/60 to-slate-900/60 border border-slate-700/30 hover:border-slate-500/50 shadow-lg hover:shadow-xl transition-all duration-400 hover:scale-[1.01] overflow-visible",
    'spotlight-polished': "group cursor-pointer rounded-3xl bg-gradient-to-br from-slate-900/95 to-black/95 border border-slate-600/30 hover:border-slate-400/50 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:scale-[1.01] overflow-hidden",
    'vertical-polished': "group cursor-pointer rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 hover:border-slate-500/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-visible",
    'spotlight-poster-backdrop': "group cursor-pointer rounded-3xl transition-all duration-700 hover:scale-[1.01] overflow-hidden"
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      className={`${variantClasses[variant]} ${className}`}
    >
      {children}
    </motion.div>
  );
};