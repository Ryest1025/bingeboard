import React from 'react';

interface StreamingLogosProps {
  providers: any[];
  maxLogos?: number;
}

export const StreamingLogos: React.FC<StreamingLogosProps> = ({ 
  providers = [], 
  maxLogos = 4 
}) => {
  if (!providers || providers.length === 0) {
    return (
      <div className="flex items-center gap-1 mb-2">
        <span className="text-xs text-gray-400">Streaming info loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 mb-2">
      <span className="text-xs text-gray-400">Available on:</span>
      {providers.slice(0, maxLogos).map((provider: any, index: number) => (
        <div key={provider.provider_id || index} className="flex items-center">
          <img
            src={provider.logo_path ? `https://image.tmdb.org/t/p/w45${provider.logo_path}` : '/placeholder-logo.png'}
            alt={provider.provider_name || 'Streaming Platform'}
            className="w-4 h-4 rounded-sm"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      ))}
      {providers.length > maxLogos && (
        <span className="text-xs text-gray-400">+{providers.length - maxLogos} more</span>
      )}
    </div>
  );
};