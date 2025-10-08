import React from 'react';
import { motion } from 'framer-motion';

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'secondary', 
  size = 'md', 
  className = '' 
}) => {
  const baseClasses = "transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-lg backdrop-blur-sm";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-105 border border-blue-500/30",
    secondary: "bg-gradient-to-r from-slate-800/90 to-slate-700/90 text-white hover:from-slate-700/90 hover:to-slate-600/90 hover:shadow-xl hover:scale-105 border border-slate-500/30",
    floating: "bg-gradient-to-r from-black/80 to-slate-900/80 text-white hover:from-black/90 hover:to-slate-800/90 hover:shadow-2xl hover:scale-110 border border-white/10 backdrop-blur-md"
  };
  
  const sizes = {
    sm: "px-3 py-2 text-xs rounded-lg",
    md: "px-4 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-xl"
  };
  
  return (
    <motion.button
      whileHover={{ scale: variant === 'floating' ? 1.1 : 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </motion.button>
  );
};