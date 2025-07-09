import React from 'react';

interface BingeBoardHeaderProps {
  subtitle?: string;
  className?: string;
}

export default function BingeBoardHeader({ subtitle, className = '' }: BingeBoardHeaderProps) {
  return (
    <div className={`flex items-center space-x-3 mb-6 ${className}`}>
      {/* TV Logo */}
      <div className="relative">
        <div className="w-10 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
          <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
            <div
              className="text-sm font-bold text-white drop-shadow-lg"
              style={{ textShadow: '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)' }}
            >
              B
            </div>
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-slate-700 rounded-sm"></div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-1 bg-slate-600 rounded-sm"></div>
        </div>
      </div>

      {/* Brand Name */}
      <div className="block">
        <span className="text-xl sm:text-2xl select-none">
          <span className="font-black bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Binge
          </span>
          <span className="font-light text-white ml-1">Board</span>
        </span>

        {/* Subtitle */}
        {subtitle && (
          <div className="text-xs text-teal-400 font-medium tracking-widest uppercase opacity-75">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}