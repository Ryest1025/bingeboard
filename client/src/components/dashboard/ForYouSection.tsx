import React from 'react';
import { UniversalMediaCard } from '@/components/universal';
import { Section } from '@/components/shared/Section';
import type { NormalizedMedia } from '@/types/media';

const ForYouSection: React.FC<{ shows: NormalizedMedia[] }> = ({ shows }) => {
  if (!shows?.length) {
    return (
      <Section title="Recommended for You">
        <div className="bg-slate-800 rounded-lg p-8 text-center">
          <p className="text-slate-400">Loading recommendations...</p>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Recommended for You">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {shows.slice(0, 12).map((show) => (
          <UniversalMediaCard
            key={show.id}
            media={show}
            variant="vertical"
            size="md"
            showStreamingLogos={true}
            showRating={true}
            actions={{ watchNow: true, trailer: true, addToList: true }}
            onAddToWatchlist={() => {}}
            onCardClick={(media) => console.log('Show details:', media)}
            onWatchNow={(media) => console.log('Watch now:', media)}
            onWatchTrailer={(media) => console.log('Watch trailer:', media)}
          />
        ))}
      </div>
    </Section>
  );
};

export default ForYouSection;
