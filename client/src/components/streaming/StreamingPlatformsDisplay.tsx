import React from 'react';
import clsx from 'clsx';
import '../../styles/a11y.css';

interface Platform {
  provider_id: number | string;
  provider_name: string;
  affiliate_supported?: boolean;
}

interface Props {
  platforms: Platform[];
  compact?: boolean;
  className?: string;
  onPlatformClick?: (platform: Platform) => void;
}

// Enhanced streaming data display (Multi-API)
export const StreamingPlatformsDisplay: React.FC<Props> = ({ platforms, compact = false, className, onPlatformClick }) => {
  if (!platforms || platforms.length === 0) return null;

  const displayPlatforms = React.useMemo(
    () => (compact ? platforms.slice(0, 3) : platforms),
    [compact, platforms]
  );

  return (
    <div className={clsx('streaming-platforms', className)}>
      {displayPlatforms.map((platform) => (
        <button
          key={platform.provider_id}
          type="button"
          className={clsx(
            'platform-badge',
            // visible focus styles for keyboard users
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--bb-focus-ring)]',
            onPlatformClick ? 'cursor-pointer hover:opacity-90' : 'opacity-90'
          )}
          onClick={() => onPlatformClick?.(platform)}
          disabled={!onPlatformClick}
          aria-label={`Watch on ${platform.provider_name}${platform.affiliate_supported ? ', affiliate supported' : ''}`}
        >
          <span className="platform-name">{platform.provider_name}</span>
          {platform.affiliate_supported && (
            <span className="affiliate-badge" aria-label="Affiliate supported" title="Affiliate supported">💰</span>
          )}
        </button>
      ))}
      {compact && platforms.length > 3 && (
        <span className="more-platforms" aria-live="polite">+{platforms.length - 3} more</span>
      )}
    </div>
  );
};

export default React.memo(StreamingPlatformsDisplay);
