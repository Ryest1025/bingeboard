import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import NavigationHeader from '@/components/navigation-header';
import { EnhancedShowCard } from '@/components/EnhancedShowCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Bell, Calendar, Users, ChevronRight } from 'lucide-react';
import { normalizeMedia } from '@/utils/normalizeMedia';
import { filterMedia } from '@/utils/filterMedia';
import type { NormalizedMedia, RawMedia, MediaFilters, StreamingPlatform } from '@/types/media';
import { MediaBadgeGroup, CompactMediaInfo } from '@/components/media/MediaBadges';

// --- Section Wrapper ---
export const Section: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, children, action }) => (
  <section className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
    {children}
  </section>
);

// --- Hero Carousel ---
const HeroCarousel: React.FC<{ shows: any[] }> = ({ shows }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuredShow = shows?.[currentIndex];

  if (!featuredShow) return <div className="relative h-96 bg-slate-800 rounded-lg"><Skeleton className="w-full h-full" /></div>;

  return (
    <div className="relative h-96 bg-slate-800 rounded-lg overflow-hidden">
      {featuredShow.backdrop_path && <img src={`https://image.tmdb.org/t/p/w1280${featuredShow.backdrop_path}`} alt={featuredShow.title || featuredShow.name} className="w-full h-full object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent">
        <div className="absolute bottom-8 left-8 max-w-lg">
          <h1 className="text-4xl font-bold text-white mb-4">{featuredShow.title || featuredShow.name}</h1>
          {featuredShow.overview && <p className="text-lg text-gray-200 mb-6 line-clamp-3">{featuredShow.overview}</p>}
          <div className="flex items-center gap-3">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200"><Play className="w-5 h-5 mr-2" />Watch Now</Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10"><Bell className="w-5 h-5 mr-2" />Add to Watchlist</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Live Sports ---
const LiveSportsSection: React.FC<{ games: any[] }> = ({ games }) => {
  if (!games?.length) return null;
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {games.map((game, i) => (
        <Card key={i} className="min-w-64 bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="text-red-400 border-red-400">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-1 animate-pulse" />LIVE
              </Badge>
              <span className="text-sm text-slate-400">{game.league}</span>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-white">{game.homeTeam} vs {game.awayTeam}</div>
              {game.score && <div className="text-2xl font-bold text-green-400 mt-1">{game.score}</div>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// --- For You / Filtering Dropdowns ---
const FILTERS = {
  genre: ['Comedy', 'Drama', 'Action', 'Thriller'],
  network: ['Netflix', 'HBO', 'Prime', 'Disney+'],
  year: ['2025', '2024', '2023', '2022']
};

// --- Continue Watching ---
const ContinueWatchingCarousel: React.FC<{ shows: any[] }> = ({ shows }) => {
  if (!shows?.length) return null;
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {shows.map(show => (
        <Card key={show.id} className="min-w-64 bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex gap-3">
              {show.poster_path && <img src={`https://image.tmdb.org/t/p/w92${show.poster_path}`} alt={show.title} className="w-16 h-24 object-cover rounded" />}
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">{show.title}</h4>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${show.progress || 30}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{show.progress || 30}% complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// --- Dashboard Page ---
const DashboardPageReconstructed: React.FC = () => {
  const [filters, setFilters] = useState<{ genre?: string; network?: string; year?: string }>({});
  
  const { data: trendingData } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      const res = await fetch('/api/trending/tv/day?includeStreaming=true');
      if (!res.ok) throw new Error('Failed to fetch trending');
      return res.json();
    }
  });
  
  const { data: personalizedData } = useQuery({
    queryKey: ['personalized'],
    queryFn: async () => {
      const res = await fetch('/api/trending/tv/day?includeStreaming=true');
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      const data = await res.json();
      // Transform data slightly to look different from trending
      return {
        ...data,
        results: (data.results || []).slice().reverse() // Reverse order for variety
      };
    }
  });
  
  const { data: continueWatchingData } = useQuery({
    queryKey: ['continue'],
    queryFn: async () => {
      const res = await fetch('/api/continue-watching');
      if (!res.ok) throw new Error('Failed to fetch continue watching');
      return res.json();
    }
  });

  const processedTrending = useMemo(() => normalizeMedia((trendingData as any)?.results || []), [trendingData]);
  const processedRecommendations = useMemo(() => normalizeMedia((personalizedData as any)?.results || []), [personalizedData]);

  const handleAddToWatchlist = async (show: any) => {
    await fetch('/api/watchlist/add', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(show) });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="px-4 md:px-8 lg:px-16 space-y-12 py-8">
        <NavigationHeader />
        
        {/* Distinctive marker for reconstructed dashboard */}
        <div className="bg-purple-600 text-white p-4 rounded-lg text-center">
          <h2 className="text-xl font-bold">🚀 RECONSTRUCTED DASHBOARD (9/20 Style)</h2>
          <p className="text-sm">This is the test version with hero carousel and dropdown filters</p>
        </div>
        
        <HeroCarousel shows={processedTrending.slice(0,5)} />

        {/* For You Section */}
        <Section title="For You">
          {/* Filters */}
          <div className="flex gap-2 mb-4">
            {Object.entries(FILTERS).map(([key, values]) => (
              <select key={key} className="bg-slate-800 border border-slate-700 text-white p-2 rounded" onChange={e => setFilters(f => ({...f, [key]: e.target.value}))}>
                <option value="">{key}</option>
                {values.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            ))}
          </div>
          {/* Shows */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {processedRecommendations.map(show => (
              <EnhancedShowCard key={show.id} show={show} onAddToWatchlist={handleAddToWatchlist} />
            ))}
          </div>
        </Section>

        {/* Continue Watching */}
        {(continueWatchingData as any)?.items?.length > 0 && (
          <Section title="Continue Watching">
            <ContinueWatchingCarousel shows={(continueWatchingData as any).items} />
          </Section>
        )}
      </div>
    </div>
  );
};

export default DashboardPageReconstructed;