import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import NavigationHeader from '@/components/navigation-header';
import { EnhancedShowCard } from '@/components/EnhancedShowCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Bell } from 'lucide-react';
import { normalizeMedia } from '@/utils/normalizeMedia';
import { filterMedia } from '@/utils/filterMedia';
import type { NormalizedMedia } from '@/types/media';

// --- Section Wrapper ---
export const Section: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, children, action }) => (
  <section className="w-full space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
    <div className="w-full">
      {children}
    </div>
  </section>
);

// --- Hero Carousel ---
const HeroCarousel: React.FC<{ shows: NormalizedMedia[] }> = ({ shows }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuredShow = shows?.[currentIndex];

  if (!featuredShow) {
    return (
      <div className="relative w-full h-96 bg-slate-800 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-700 animate-pulse">
          <div className="absolute bottom-8 left-8 space-y-4">
            <div className="h-8 bg-slate-600 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-slate-600 rounded w-96 animate-pulse"></div>
            <div className="h-4 bg-slate-600 rounded w-80 animate-pulse"></div>
            <div className="flex gap-3 mt-6">
              <div className="h-10 w-28 bg-slate-600 rounded animate-pulse"></div>
              <div className="h-10 w-36 bg-slate-600 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-slate-800 rounded-lg overflow-hidden">
      {featuredShow.backdrop_path && (
        <img 
          src={`https://image.tmdb.org/t/p/w1280${featuredShow.backdrop_path}`} 
          alt={featuredShow.displayTitle} 
          className="w-full h-full object-cover" 
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent">
        <div className="absolute bottom-8 left-8 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {featuredShow.displayTitle}
          </h1>
          {featuredShow.overview && (
            <p className="text-lg text-gray-200 mb-6 line-clamp-3 max-w-xl">
              {featuredShow.overview}
            </p>
          )}
          <div className="flex items-center gap-3">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200">
              <Play className="w-5 h-5 mr-2" />
              Watch Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Bell className="w-5 h-5 mr-2" />
              Add to Watchlist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- For You Filters ---
const FILTERS = {
  genre: ['Comedy', 'Drama', 'Action', 'Thriller'],
  network: ['Netflix', 'HBO', 'Prime', 'Disney+'],
  year: ['2025', '2024', '2023', '2022']
};

// --- Continue Watching Carousel ---
const ContinueWatchingCarousel: React.FC<{ shows: any[] }> = ({ shows }) => {
  if (!shows?.length) return null;
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {shows.map(show => (
        <Card key={show.id} className="min-w-64 bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex gap-3">
              {show.poster_path ? (
                <img src={`https://image.tmdb.org/t/p/w92${show.poster_path}`} alt={show.title || show.name} className="w-16 h-24 object-cover rounded" />
              ) : <Skeleton className="w-16 h-24 rounded" />}
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">{show.title || show.name}</h4>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${show.progress || 0}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{show.progress || 0}% complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// --- Dashboard Page ---
const DashboardPage: React.FC = () => {
  const [filters, setFilters] = useState<{ genre?: string; network?: string; year?: string }>({});

  const { data: trendingData } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      const res = await fetch('/api/trending');
      if (!res.ok) throw new Error('Failed to fetch trending');
      return res.json();
    }
  });

  const { data: personalizedData } = useQuery({
    queryKey: ['personalized'],
    queryFn: async () => {
      const res = await fetch('/api/recommendations');
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      return res.json();
    }
  });

  const { data: continueWatchingData } = useQuery({
    queryKey: ['continue'],
    queryFn: async () => {
      const res = await fetch('/api/user/continue-watching');
      if (!res.ok) throw new Error('Failed to fetch continue watching');
      return res.json();
    }
  });

  const processedTrending = useMemo(() => normalizeMedia((trendingData as any)?.results || []), [trendingData]);
  const filteredRecommendations = useMemo(() => {
    let items = normalizeMedia((personalizedData as any)?.results || []);
    if (filters.genre) items = filterMedia(items, { genre: filters.genre }).items;
    if (filters.network) items = filterMedia(items, { network: filters.network }).items;
    if (filters.year) items = filterMedia(items, { year: filters.year }).items;
    return items;
  }, [personalizedData, filters]);

  const handleAddToWatchlist = async (show: any) => {
    await fetch('/api/watchlist/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(show) });
  };

  return (
    <div className="min-h-screen bg-slate-900 w-full overflow-x-hidden">
      <NavigationHeader />
      
      {/* Debug Banner */}
      <div className="bg-blue-600 text-white p-3 text-center text-sm">
        🚀 RESTORED DASHBOARD - Hero Carousel • Filtered For You • Continue Watching
      </div>
      
      <main className="w-full max-w-none px-4 md:px-8 lg:px-16 py-8 space-y-12">
        <HeroCarousel shows={processedTrending.slice(0,5)} />

        {/* For You Section */}
        <Section title="For You">
          <div className="flex flex-wrap gap-3 mb-6">
            {Object.entries(FILTERS).map(([key, values]) => (
              <select
                key={key}
                className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-md text-sm min-w-[120px]"
                onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                value={filters[key as keyof typeof filters] || ''}
              >
                <option value="">{key.charAt(0).toUpperCase() + key.slice(1)}</option>
                {values.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            ))}
          </div>
          {!personalizedData ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredRecommendations.map(show => (
                <EnhancedShowCard key={show.id} show={show} onAddToWatchlist={handleAddToWatchlist} />
              ))}
            </div>
          )}
        </Section>

        {/* Continue Watching */}
        {(continueWatchingData as any)?.items?.length > 0 && (
          <Section title="Continue Watching">
            <ContinueWatchingCarousel shows={(continueWatchingData as any).items} />
          </Section>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;