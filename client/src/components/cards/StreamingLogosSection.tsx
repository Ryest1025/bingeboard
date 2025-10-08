import React from 'react';

interface StreamingPlatform {
  provider_id?: number;
  provider_name?: string;
  logo_path?: string;
}

interface StreamingLogosSectionProps {
  providers: StreamingPlatform[];
  maxDisplayed?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StreamingLogosSection: React.FC<StreamingLogosSectionProps> = ({
  providers,
  maxDisplayed = 3,
  size = 'sm',
  className = ''
}) => {
  if (!providers || providers.length === 0) {
    return null;
  }

  const displayed = providers.slice(0, maxDisplayed);
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <div className={`flex items-center gap-2 mt-2 ${className}`}>
      {displayed.map((provider, idx) => (
        provider.logo_path && (
          <img
            key={idx}
            src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
            alt={provider.provider_name || 'Streaming platform'}
            className={`rounded-md object-contain ${sizeClasses[size]}`}
          />
        )
      ))}
      {providers.length > maxDisplayed && (
        <span className="text-xs text-slate-400">
          +{providers.length - maxDisplayed} more
        </span>
      )}
    </div>
  );
};