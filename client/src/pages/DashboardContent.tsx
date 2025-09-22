import React, { useCallback, useMemo, useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { UniversalButton } from '@/components/ui/universal-button';
import NavigationHeader from '@/components/navigation-header';
import Toast from '@/components/toast';
import RecommendationModal from '@/components/recommendation-modal';
import ShowDetailsModal from '@/components/show-details-modal';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useContinueWatching } from '@/hooks/useViewingHistory';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { useAwardsSystem } from '@/hooks/useAwardsSystem';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: continueWatching, isLoading: cwLoading } = useContinueWatching(user?.id);
  const { filterOptions } = useFilterOptions();
  const { awards } = useAwardsSystem(user?.id);

  // Modal states
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedShow, setSelectedShow] = useState<any>(null);
  
  // Toast state
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info'
  });

  const recommendedQuery = useQuery({
    queryKey: ['recommended', user?.id, filterOptions],
    queryFn: async () => {
      const res = await fetch(`/api/recommendations?uid=${user?.id}`);
      return res.json();
    },
    enabled: !!user,
  });

  const memoizedRecommendations = useMemo(
    () => {
      const data = recommendedQuery.data;
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (data.recommendations && Array.isArray(data.recommendations)) return data.recommendations;
      if (data.results && Array.isArray(data.results)) return data.results;
      return [];
    },
    [recommendedQuery.data]
  );

  const handlePlay = useCallback((showId: string) => {
    console.log('Play show', showId);
  }, []);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <NavigationHeader />
        <main className="flex-1 p-6 space-y-8">
          {/* Continue Watching */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Continue Watching</h2>
            {cwLoading ? (
              <div className="flex gap-4">
                <Skeleton className="h-40 w-28 rounded-lg" />
                <Skeleton className="h-40 w-28 rounded-lg" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {continueWatching?.map((item: any) => (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:shadow-lg transition"
                    onClick={() => handlePlay(item.showId)}
                  >
                    <CardContent className="p-2">
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="rounded-lg"
                      />
                      <p className="mt-2 text-sm font-medium">{item.title}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Recommended */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Recommended</h2>
            {recommendedQuery.isLoading ? (
              <div className="flex gap-4">
                <Skeleton className="h-40 w-28 rounded-lg" />
                <Skeleton className="h-40 w-28 rounded-lg" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {memoizedRecommendations.map((rec: any) => (
                  <Card
                    key={rec.id}
                    className="cursor-pointer hover:shadow-lg transition"
                  >
                    <CardContent className="p-2">
                      <img
                        src={rec.poster}
                        alt={rec.title}
                        className="rounded-lg"
                      />
                      <p className="mt-2 text-sm font-medium">{rec.title}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Awards */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Your Awards</h2>
            <div className="flex flex-wrap gap-3">
              {awards?.map((award: any) => (
                <UniversalButton
                  key={award.id}
                  variant="secondary"
                  className="px-4 py-2 rounded-xl"
                >
                  🏆 {award.name}
                </UniversalButton>
              ))}
              {!awards?.length && (
                <p className="text-muted-foreground">No awards yet — keep binging!</p>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Global UI */}
      <RecommendationModal 
        show={selectedShow}
        open={showRecommendationModal}
        onClose={() => setShowRecommendationModal(false)}
      />
      <ShowDetailsModal 
        show={selectedShow}
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onAddToList={() => console.log('Add to list')}
        onWatchNow={() => console.log('Watch now')}
        onWatchTrailer={() => console.log('Watch trailer')}
      />
      <Toast 
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </TooltipProvider>
  );
}