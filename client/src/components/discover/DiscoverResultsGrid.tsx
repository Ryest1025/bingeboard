import React from 'react';
import { useDiscoverSearch } from '../../hooks/useDiscoverSearch';
import type { DiscoverSearchParams, DiscoverResult } from '../../lib/api/discover';

// Basic responsive grid styles (could be replaced by Tailwind classes if project uses it)
const gridStyle: React.CSSProperties = {
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))'
};

interface DiscoverResultsGridProps extends DiscoverSearchParams {
  queryKeyPrefix?: string; // allow custom key scoping if needed later
  onSelect?: (item: DiscoverResult) => void;
}

export const DiscoverResultsGrid: React.FC<DiscoverResultsGridProps> = (props) => {
  const { data, isLoading, isError, error } = useDiscoverSearch(props);

  if (isLoading) {
    return <div>Loading discover results...</div>;
  }
  if (isError) {
    return <div style={{ color: 'red' }}>Error loading discover results: {String((error as any)?.message || error)}</div>;
  }

  if (!data || data.results.length === 0) {
    return <div>No results found.</div>;
  }

  return (
    <div style={gridStyle}>
      {data.results.map(result => (
        <button
          key={`${result.mediaType}-${result.tmdbId}`}
          onClick={() => props.onSelect?.(result)}
          style={{
            border: 'none',
            background: 'transparent',
            textAlign: 'left',
            cursor: props.onSelect ? 'pointer' : 'default'
          }}
        >
          <div style={{
            width: '100%',
            aspectRatio: '2 / 3',
            background: '#222',
            borderRadius: 6,
            overflow: 'hidden',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#888',
            fontSize: 12
          }}>
            {result.posterPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://image.tmdb.org/t/p/w300${result.posterPath}`}
                alt={result.title || 'Poster'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
            ) : (
              <span>No Image</span>
            )}
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3 }}>
            {result.title}
          </div>
          {result.streamingPlatforms && result.streamingPlatforms.length > 0 && (
            <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {result.streamingPlatforms.slice(0, 4).map((p: any) => (
                <span key={p.id || p.name} style={{ fontSize: 10, background: '#333', padding: '2px 4px', borderRadius: 4 }}>
                  {p.name || p.provider_name || 'Platform'}
                </span>
              ))}
              {result.streamingPlatforms.length > 4 && (
                <span style={{ fontSize: 10, background: '#444', padding: '2px 4px', borderRadius: 4 }}>
                  +{result.streamingPlatforms.length - 4} more
                </span>
              )}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default DiscoverResultsGrid;
