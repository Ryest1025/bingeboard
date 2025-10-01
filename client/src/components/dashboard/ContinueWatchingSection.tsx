import React from 'react';
import { Section } from '@/components/shared/Section';
import { UniversalMediaCard } from '@/components/universal';

interface ContinueWatchingItem {
  id: number;
  title: string;
  season?: number;
  episode?: number;
  poster_path?: string;
  progress?: number;
  // Allow passing through any additional props compatible with UniversalMediaCard's MediaItem interface
  [key: string]: any;
}

const ContinueWatchingSection: React.FC<{ items: ContinueWatchingItem[] }> = ({ items }) => {
  if (!items?.length) return null;

  return (
    <Section title="Continue Watching">
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <div key={item.id} className="min-w-44 w-44">
            <UniversalMediaCard
              media={item}
              variant="compact"
              size="sm"
              showStreamingLogos={false}
              showRating={false}
              actions={{ addToList: false }}
              onCardClick={(media) => console.log('Continue watching:', media)}
            />
            <div className="mt-2">
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${item.progress || 30}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                {item.season && item.episode ? (
                  <span>S{item.season} · E{item.episode}</span>
                ) : <span />}
                <span>{item.progress || 30}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default ContinueWatchingSection;
