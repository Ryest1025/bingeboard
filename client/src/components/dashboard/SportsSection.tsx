import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Section } from '@/components/shared/Section';

interface SportsEvent {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  score?: string;
  isLive?: boolean;
}

const SportsSection: React.FC<{ events: SportsEvent[] }> = ({ events }) => {
  if (!events?.length) return null;

  return (
    <Section title="Live Sports">
      <div className="flex gap-4 overflow-x-auto pb-2">
        {events.map((game) => (
          <Card key={game.id} className="min-w-64 bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                {game.isLive && (
                  <Badge variant="outline" className="text-red-400 border-red-400">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-1 animate-pulse" />
                    LIVE
                  </Badge>
                )}
                <span className="text-sm text-slate-400">{game.league}</span>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-white">
                  {game.homeTeam} vs {game.awayTeam}
                </div>
                {game.score && (
                  <div className="text-2xl font-bold text-green-400 mt-1">{game.score}</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default SportsSection;
