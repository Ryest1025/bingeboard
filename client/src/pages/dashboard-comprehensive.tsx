import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import NavigationHeader from '@/components/navigation-header';

// Import all the comprehensive dashboard components
import SpotlightCard from '@/components/dashboard/SpotlightCard';
import BecauseYouWatchedCard from '@/components/dashboard/BecauseYouWatchedCard';
import NewReleasesCard from '@/components/dashboard/NewReleasesCard';
import QuickStatsCard from '@/components/dashboard/QuickStatsCard';
import CurrentlyWatchingCard from '@/components/dashboard/CurrentlyWatchingCard';
import RecentActivityCard from '@/components/dashboard/RecentActivityCard';
import QuickActionsCard from '@/components/dashboard/QuickActionsCard';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import RecommendationsCard from '@/components/dashboard/RecommendationsCard';
import ContinueWatching from '@/components/ContinueWatching';

export default function ComprehensiveDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Fetch spotlight data
  const { data: spotlightData, isLoading: spotlightLoading } = useQuery({
    queryKey: ['spotlight'],
    queryFn: async () => {
      const res = await fetch('/api/trending/tv/day?includeStreaming=true&limit=1');
      if (!res.ok) throw new Error('Failed to fetch spotlight');
      const data = await res.json();
      return data.results?.[0] || null;
    },
    enabled: !!isAuthenticated,
  });

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/user/stats', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch user stats');
      return res.json();
    },
    enabled: !!isAuthenticated,
  });

  // Fetch friend activity
  const { data: friendActivity } = useQuery({
    queryKey: ['friend-activity'],
    queryFn: async () => {
      const res = await fetch('/api/activities/friends', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch friend activity');
      return res.json();
    },
    enabled: !!isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Please log in to view your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        {user && <WelcomeCard user={user} />}
        
        {/* Spotlight Section - Hero Featured Content */}
        <SpotlightCard spotlight={spotlightData} />
        
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Watching Section */}
            <ContinueWatching limit={10} />
            
            {/* Currently Watching Card */}
            <CurrentlyWatchingCard shows={[]} />
            
            {/* Because You Watched Card */}
            <BecauseYouWatchedCard />
            
            {/* New Releases */}
            <NewReleasesCard releases={[]} />
            
            {/* Recommendations */}
            <RecommendationsCard />
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <QuickStatsCard stats={userStats} />
            
            {/* Quick Actions */}
            <QuickActionsCard />
            
            {/* Recent Activity */}
            <RecentActivityCard activities={friendActivity} />
          </div>
        </div>
      </div>
    </div>
  );
}