import React from 'react';

// Premium Loading Skeleton Component
export const LoadingSkeleton = ({ className = "", lines = 3 }: { className?: string; lines?: number }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`bg-slate-700/50 rounded-lg h-4 mb-3 ${i === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
        />
      ))}
    </div>
  );
};

// Premium Button with Loading State
export const PremiumButton = ({
  children,
  isLoading = false,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  [key: string]: any;
}) => {
  const baseClasses = "relative overflow-hidden transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white font-medium shadow-md hover:shadow-lg",
    outline: "border-2 border-slate-700 hover:border-slate-600 bg-transparent hover:bg-slate-800/50 text-gray-300 hover:text-white font-medium",
    ghost: "bg-transparent hover:bg-slate-800/50 text-gray-300 hover:text-white font-medium"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-lg",
    lg: "px-8 py-4 text-lg rounded-xl"
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
};

// Premium Card with Glass Effect
export const PremiumCard = ({
  children,
  className = '',
  hover = true,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  [key: string]: any;
}) => {
  return (
    <div
      className={`
        bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl
        shadow-2xl shadow-slate-900/20
        ${hover ? 'hover:bg-slate-900/80 hover:border-slate-600/50 hover:shadow-3xl transition-all duration-300 ease-in-out' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Premium Input with Floating Label
export const PremiumInput = ({
  label,
  error,
  icon: Icon,
  className = '',
  ...props
}: {
  label: string;
  error?: string;
  icon?: any;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div className={`relative ${className}`}>
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
      )}
      <input
        className={`
          w-full px-4 py-3 ${Icon ? 'pl-12' : ''} 
          bg-slate-800/50 border border-slate-700 rounded-xl
          text-white placeholder-transparent
          focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:bg-slate-800/80
          transition-all duration-200 ease-in-out
          peer
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
        `}
        placeholder={label}
        {...props}
      />
      <label className={`
        absolute left-4 ${Icon ? 'left-12' : ''} top-3
        text-gray-400 text-sm
        transition-all duration-200 ease-in-out
        peer-placeholder-shown:text-base peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2
        peer-focus:text-sm peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-teal-400
        ${error ? 'peer-focus:text-red-400' : ''}
        pointer-events-none
      `}>
        {label}
      </label>
      {error && (
        <p className="mt-2 text-sm text-red-400 animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
};

// Premium Toast Notification
export const PremiumToast = ({
  message,
  type = 'info',
  onClose
}: {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}) => {
  const types = {
    success: 'bg-green-500/20 border-green-500/30 text-green-300',
    error: 'bg-red-500/20 border-red-500/30 text-red-300',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
    warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50
      p-4 rounded-xl border backdrop-blur-xl
      shadow-2xl shadow-slate-900/20
      transform animate-slide-in-right
      ${types[type]}
    `}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-current hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  );
};
