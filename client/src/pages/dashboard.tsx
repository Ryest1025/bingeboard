import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import NavigationHeader from '@/components/navigation-header';
import SpotlightSection from '@/components/dashboard/SpotlightSection';
import ForYouSection from '@/components/dashboard/ForYouSection';
import ContinueWatchingSection from '@/components/dashboard/ContinueWatchingSection';
import SportsSection from '@/components/dashboard/SportsSection';
import { normalizeMediaBatch } from '@/utils/normalizeMedia';

const DashboardPage: React.FC = () => {
  const { data: spotlightData } = useQuery({
    queryKey: ['spotlight'],
    queryFn: async () => {
      const res = await fetch('/api/recommendations/spotlight');
      if (!res.ok) throw new Error('Failed to fetch spotlight');
      return res.json();
    },
  });

  const { data: personalizedData } = useQuery({
    queryKey: ['personalized'],
    queryFn: async () => {
      const res = await fetch('/api/recommendations/personalized?includeStreaming=true');
      if (!res.ok) throw new Error('Failed to fetch personalized');
      return res.json();
    },
  });

  const { data: continueWatchingData } = useQuery({
    queryKey: ['continue-watching'],
    queryFn: async () => {
      const res = await fetch('/api/user/continue-watching');
      if (!res.ok) throw new Error('Failed to fetch continue watching');
      return res.json();
    },
  });

  const { data: sportsData } = useQuery({
    queryKey: ['live-sports'],
    queryFn: async () => {
      // Sports endpoint not available yet, return empty data
      return { events: [] };
    },
    enabled: false, // Disable this query until sports endpoint is implemented
  });

  const processed = useMemo(() => ({
    spotlight: normalizeMediaBatch(spotlightData?.results || []),
    personalized: normalizeMediaBatch(personalizedData?.recommendations || []),
    continueWatching: continueWatchingData?.items || [],
    sports: sportsData?.events || [],
  }), [spotlightData, personalizedData, continueWatchingData, sportsData]);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="px-4 md:px-8 lg:px-16 py-8 space-y-12">
        <NavigationHeader />
        <SpotlightSection shows={processed.spotlight} />
        <ForYouSection shows={processed.personalized} />
        <ContinueWatchingSection items={processed.continueWatching} />
        {processed.sports.length > 0 && <SportsSection events={processed.sports} />}
      </div>
    </div>
  );
};

export default DashboardPage;