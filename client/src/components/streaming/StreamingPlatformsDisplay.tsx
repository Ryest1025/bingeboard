import React from 'react';
import clsx from 'clsx';
import '../../styles/a11y.css';

// Normalized platform type (aligns partially with TMDB provider objects)
export interface StreamingPlatformBasic {
  provider_id: number | string;
  provider_name: string;
  logo_path?: string; // optional path if supplied by API
  affiliate_supported?: boolean;
  // Allow carry-through of any raw provider fields without widening the core shape
  [extra: string]: unknown;
}

interface StreamingPlatformsDisplayProps {
  platforms: StreamingPlatformBasic[];
  /** Legacy flag: when true shows only first 3. Prefer maxVisible for flexibility. */
  compact?: boolean;
  /** Explicit cap on how many to show (overrides compact). */
  maxVisible?: number;
  className?: string;
  /** Custom renderer override. Provide your own element (wrap focus/handlers yourself). */
  renderPlatform?: (platform: StreamingPlatformBasic, index: number) => React.ReactNode;
  onPlatformClick?: (platform: StreamingPlatformBasic) => void;
  /** Provide an accessible label for the whole list (else marked as a group). */
  ariaLabel?: string;
  /** If true, renders a visually hidden count summary for screen readers. */
  announceCount?: boolean;
}

// Accessible streaming platform badges with keyboard focus & optional affiliate indicator.
export const StreamingPlatformsDisplay: React.FC<StreamingPlatformsDisplayProps> = React.memo(
  ({
    platforms,
    compact = false,
    maxVisible,
    className,
    renderPlatform,
    onPlatformClick,
    ariaLabel = 'Streaming platforms',
    announceCount = true
  }) => {
    if (!platforms || platforms.length === 0) return null;

    const limit = typeof maxVisible === 'number' ? maxVisible : (compact ? 3 : undefined);
    const visible = React.useMemo(
      () => (limit ? platforms.slice(0, limit) : platforms),
      [limit, platforms]
    );
    const hiddenCount = limit ? Math.max(0, platforms.length - limit) : 0;

    const handleClick = React.useCallback(
      (p: StreamingPlatformBasic) => {
        if (onPlatformClick) onPlatformClick(p);
      },
      [onPlatformClick]
    );

    return (
      <div
        className={clsx('streaming-platforms', className)}
        role="group"
        aria-label={ariaLabel}
      >
        {announceCount && (
          <span className="sr-only" aria-live="polite">{platforms.length} platforms available</span>
        )}
        <ul className={clsx('flex flex-wrap gap-2 m-0 p-0 list-none')}>
          {visible.map((platform, idx) => {
            if (renderPlatform) {
              return <li key={platform.provider_id}>{renderPlatform(platform, idx)}</li>;
            }
            const affiliate = !!platform.affiliate_supported;
            const label = `Watch on ${platform.provider_name}${affiliate ? ', affiliate supported' : ''}`;
            return (
              <li key={platform.provider_id} className="m-0 p-0">
                <button
                  type="button"
                  className={clsx(
                    'platform-badge',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--bb-focus-ring)]',
                    onPlatformClick ? 'cursor-pointer hover:opacity-90' : 'opacity-90'
                  )}
                  onClick={() => handleClick(platform)}
                  disabled={!onPlatformClick}
                  aria-label={label}
                  aria-disabled={!onPlatformClick || undefined}
                >
                  {platform.logo_path && (
                    // Decorative if text also present – keep empty alt
                    <img
                      src={platform.logo_path.startsWith('http') ? platform.logo_path : `https://image.tmdb.org/t/p/w45${platform.logo_path}`}
                      alt=""
                      className="w-5 h-5 object-contain rounded mr-1"
                      aria-hidden="true"
                      onError={(e) => {
                        // Fallback to provider initials if logo fails to load
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <span className="platform-name truncate max-w-[8ch]" title={platform.provider_name}>
                    {platform.provider_name}
                  </span>
                  {affiliate && (
                    <span
                      className="affiliate-badge ml-1"
                      aria-label="Affiliate supported"
                      title="Affiliate supported"
                      role="img"
                    >
                      💰
                    </span>
                  )}
                </button>
              </li>
            );
          })}
          {hiddenCount > 0 && (
            <li className="more-platforms text-sm text-gray-400" aria-live="polite">
              +{hiddenCount} more
            </li>
          )}
        </ul>
      </div>
    );
  }
);

StreamingPlatformsDisplay.displayName = 'StreamingPlatformsDisplay';

export default StreamingPlatformsDisplay;
