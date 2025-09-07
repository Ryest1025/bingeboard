import React from 'react';

interface Platform {
  provider_id: number | string;
  provider_name: string;
  affiliate_supported?: boolean;
}

interface Props {
  platforms: Platform[];
  compact?: boolean;
  className?: string;
}

// Enhanced streaming data display (Multi-API)
export const StreamingPlatformsDisplay: React.FC<Props> = ({ platforms, compact = false, className }) => {
  if (!platforms || platforms.length === 0) return null;

  const displayPlatforms = compact ? platforms.slice(0, 3) : platforms;

  return (
    <div className={`streaming-platforms ${className || ''}`.trim()}>
      {displayPlatforms.map((platform) => (
        <div key={platform.provider_id} className="platform-badge">
          <span className="platform-name">{platform.provider_name}</span>
          {platform.affiliate_supported && (
            <span className="affiliate-badge" title="Affiliate supported">💰</span>
          )}
        </div>
      ))}
      {compact && platforms.length > 3 && (
        <span className="more-platforms">+{platforms.length - 3} more</span>
      )}
    </div>
  );
};

export default StreamingPlatformsDisplay;
