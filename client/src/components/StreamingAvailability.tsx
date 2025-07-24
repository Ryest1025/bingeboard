import React from 'react';
import { ExternalLink, Play, Loader2 } from 'lucide-react';
import { useStreamingAvailability } from '../hooks/useStreaming';
import { StreamingLocation } from '../services/utellyApi';

interface StreamingAvailabilityProps {
  title: string;
  imdbId?: string;
  country?: string;
  compact?: boolean;
  className?: string;
}

const StreamingAvailability: React.FC<StreamingAvailabilityProps> = ({
  title,
  imdbId,
  country = 'us',
  compact = false,
  className = ''
}) => {
  const { data, isLoading, error } = useStreamingAvailability(title, country);

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        <span className="text-sm text-gray-600">Finding streaming options...</span>
      </div>
    );
  }

  if (error || !data?.results?.length) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No streaming info available
      </div>
    );
  }

  const streamingServices = data.results[0]?.locations || [];

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Play className="w-4 h-4 text-green-500" />
        <span className="text-sm text-gray-700">
          Available on {streamingServices.length} service{streamingServices.length !== 1 ? 's' : ''}
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <Play className="w-5 h-5 text-green-500" />
        <h4 className="font-semibold text-gray-900">Where to Watch</h4>
      </div>

      {streamingServices.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {streamingServices.map((service: StreamingLocation, index: number) => (
            <StreamingServiceCard key={index} service={service} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">
          No streaming options found for this title.
        </p>
      )}
    </div>
  );
};

interface StreamingServiceCardProps {
  service: StreamingLocation;
}

const StreamingServiceCard: React.FC<StreamingServiceCardProps> = ({ service }) => {
  const handleClick = () => {
    if (service.url) {
      window.open(service.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {service.icon && (
        <img
          src={service.icon}
          alt={service.display_name}
          className="w-8 h-8 mb-2 rounded object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}

      <span className="text-sm font-medium text-gray-900 text-center group-hover:text-blue-600">
        {service.display_name}
      </span>

      <ExternalLink className="w-3 h-3 text-gray-400 mt-1 group-hover:text-blue-500" />
    </button>
  );
};

export default StreamingAvailability;
