import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useContinueWatching } from '@/hooks/useContinueWatching';
import { useCurrentProgress } from '@/hooks/useCurrentProgress';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { useAwardsSystem, type Award } from '@/hooks/useAwardsSystem';
import NavigationHeader from '@/components/navigation-header';
import RecommendationModal from '@/components/recommendation-modal';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UniversalButton } from '@/components/ui/universal-button';
import { Play, Clock, Award as AwardIcon } from 'lucide-react';

interface ContinueWatchingShow {
  show: {
    id: string;
    title: string;
    description: string;
    poster?: string;
  };
  progress: number;
  lastWatched: Date;
  episode?: string;
  season?: number;
  episodeNumber?: number;
}

export default function DashboardFeature() {
  console.log("🎯 DashboardFeature component is mounting!");
  const { user } = useAuth();
  const { data: continueWatching = [], isLoading: cwLoading, error: cwError } = useContinueWatching(user?.uid);
  const { startWatching, isLoading: progressLoading } = useCurrentProgress();
  const { filterOptions, updateFilterOption } = useFilterOptions();
  const { awards, isLoading: awardsLoading, recentAwards } = useAwardsSystem(user?.uid);

  const handleResumeWatching = (show: ContinueWatchingShow) => {
    // Start watching session with show details
    startWatching(
      show.show.id,
      show.season,
      show.episodeNumber,
      // Assume 45 minutes total time for TV shows if not provided
      45 * 60 // 45 minutes in seconds
    );
    
    // TODO: Navigate to player or open watch modal
    console.log('Resuming watch for:', show.show.title);
  };

  const formatLastWatched = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getRarityColor = (rarity?: Award['rarity']): string => {
    switch (rarity) {
      case 'legendary': return 'text-purple-400';
      case 'epic': return 'text-pink-400';
      case 'rare': return 'text-blue-400';
      case 'common':
      default: return 'text-yellow-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <NavigationHeader />
      
      {/* Continue Watching Section */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">Continue Watching</h2>
        </div>
        
        {cwError && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            <p className="text-sm">Failed to load continue watching data</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cwLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={`skeleton-${i}`} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2 bg-gray-700" />
                  <Skeleton className="h-4 w-full mb-2 bg-gray-700" />
                  <Skeleton className="h-4 w-2/3 mb-4 bg-gray-700" />
                  <Skeleton className="h-10 w-24 bg-gray-700" />
                </CardContent>
              </Card>
            ))
          ) : continueWatching.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-400">
              <p>No shows to continue watching.</p>
              <p className="text-sm mt-2">Start watching something new!</p>
            </div>
          ) : (
            continueWatching.map((show: ContinueWatchingShow) => (
              <Card key={show.show.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{show.show.title}</h3>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">{show.show.description}</p>
                  
                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{Math.round(show.progress)}% watched</span>
                      <span>{formatLastWatched(show.lastWatched)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(show.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Episode info */}
                  {show.episode && (
                    <p className="text-xs text-gray-400 mb-3">{show.episode}</p>
                  )}
                  
                  <UniversalButton 
                    onClick={() => handleResumeWatching(show)}
                    disabled={progressLoading}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Resume
                  </UniversalButton>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Recommendations Section */}
      <RecommendationModal userId={user?.uid} />

      {/* Awards Section */}
      <section className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <AwardIcon className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold">Awards</h2>
          {awards.length > 0 && (
            <span className="text-sm text-gray-400">({awards.length} total)</span>
          )}
        </div>
        
        {awardsLoading ? (
          <div className="flex flex-wrap gap-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={`award-skeleton-${i}`} className="h-10 w-32 bg-gray-700" />
            ))}
          </div>
        ) : awards.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No awards earned yet.</p>
            <p className="text-sm mt-2">Keep watching to unlock achievements!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recent Awards */}
            {recentAwards.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-blue-400">🆕 Recent Awards</h3>
                <div className="flex flex-wrap gap-3">
                  {recentAwards.map((award) => (
                    <div 
                      key={award.id} 
                      className={`bg-gray-800 border-2 border-blue-500/50 px-3 py-2 rounded-lg ${getRarityColor(award.rarity)} font-semibold flex items-center gap-2 hover:bg-gray-750 transition-colors`}
                      title={award.description}
                    >
                      {award.icon && <span>{award.icon}</span>}
                      <span>{award.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* All Awards */}
            <div>
              <h3 className="text-lg font-semibold mb-2">All Awards</h3>
              <div className="flex flex-wrap gap-3">
                {awards.map((award) => (
                  <div 
                    key={award.id} 
                    className={`bg-gray-800 px-3 py-2 rounded-lg ${getRarityColor(award.rarity)} font-semibold flex items-center gap-2 hover:bg-gray-750 transition-colors cursor-pointer`}
                    title={`${award.description}${award.earnedAt ? ` • Earned ${formatLastWatched(award.earnedAt)}` : ''}`}
                  >
                    {award.icon && <span>{award.icon}</span>}
                    <span>{award.name}</span>
                    {award.type && (
                      <span className="text-xs text-gray-400 ml-1">({award.type})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}