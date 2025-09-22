import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Section } from '@/components/shared/Section';

interface ContinueWatchingItem {
  id: number;
  title: string;
  season?: number;
  episode?: number;
  poster_path?: string;
  progress?: number;
}

const ContinueWatchingSection: React.FC<{ items: ContinueWatchingItem[] }> = ({ items }) => {
  if (!items?.length) return null;

  return (
    <Section title="Continue Watching">
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <Card key={item.id} className="min-w-64 bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex gap-3">
                {item.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                    alt={item.title}
                    className="w-16 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{item.title}</h4>
                  {item.season && item.episode && (
                    <p className="text-sm text-slate-400">S{item.season}E{item.episode}</p>
                  )}
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${item.progress || 30}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{item.progress || 30}% complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default ContinueWatchingSection;
