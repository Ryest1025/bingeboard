import React from 'react';
import { EnhancedShowCard } from '@/components/EnhancedShowCard';
import { Section } from '@/components/shared/Section';
import type { NormalizedMedia } from '@/types/media';

const ForYouSection: React.FC<{ shows: NormalizedMedia[] }> = ({ shows }) => {
  if (!shows?.length) return null;

  return (
    <Section title="Recommended for You">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {shows.slice(0, 12).map((show) => (
          <EnhancedShowCard
            key={show.id as any}
            show={show as any}
            variant="detailed"
            onAddToWatchlist={() => {}}
          />
        ))}
      </div>
    </Section>
  );
};

export default ForYouSection;
