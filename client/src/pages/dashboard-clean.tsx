import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import NavigationHeader from '@/components/navigation-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Star, Clock, Users, Plus, TrendingUp } from 'lucide-react';
import RecommendationModal from '@/components/recommendation-modal';
import ShowDetailsModal from '@/components/show-details-modal';

// Simple show card component
const ShowCard: React.FC<{ show: any; onClick: (show: any) => void }> = ({ show, onClick }) => (
  <div 
    className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors cursor-pointer"
    onClick={() => onClick(show)}
  >
    <div className="aspect-[2/3] bg-gray-700 flex items-center justify-center">
      {show.poster_path ? (
        <img 
          src={`https://image.tmdb.org/t/p/w300${show.poster_path}`}
          alt={show.title || show.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="text-gray-400 text-center p-4">
          <Star className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{show.title || show.name}</p>
        </div>
      )}
    </div>
    <div className="p-3">
      <h3 className="font-medium text-white text-sm truncate">{show.title || show.name}</h3>
      {show.vote_average && (
        <p className="text-gray-400 text-xs">Rating: {show.vote_average.toFixed(1)}</p>
      )}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedShow, setSelectedShow] = useState<any>(null);

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      const res = await fetch('/api/tmdb/trending/tv/day');
      if (!res.ok) throw new Error('Failed to fetch trending');
      const data = await res.json();
      return data.results || [];
    },
  });

  const { data: recommendations, isLoading: recLoading } = useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/recommendations/because-you-watched`);
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      const data = await res.json();
      return data.shows || [];
    },
    enabled: !!user,
  });

  const handleShowClick = (show: any) => {
    setSelectedShow(show);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NavigationHeader />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Welcome Section */}
        <section className="text-center py-8">
          <h1 className="text-4xl font-bold mb-4">
            Welcome back{user?.displayName ? `, ${user.displayName}` : ''}!
          </h1>
          <p className="text-gray-400 text-lg">Discover your next favorite show</p>
        </section>

        {/* Trending */}
        <section>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
                Trending Now
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {trendingLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-lg bg-gray-700" />
                  ))
                : trending?.slice(0, 6).map((show: any) => (
                    <ShowCard
                      key={show.id}
                      show={show}
                      onClick={handleShowClick}
                    />
                  ))}
            </CardContent>
          </Card>
        </section>

        {/* Recommendations */}
        {user && (
          <section>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Star className="h-5 w-5 text-blue-500" />
                  Recommended For You
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {recLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-64 w-full rounded-lg bg-gray-700" />
                    ))
                  : recommendations?.slice(0, 6).map((show: any) => (
                      <ShowCard
                        key={show.id}
                        show={show}
                        onClick={handleShowClick}
                      />
                    ))}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Quick Actions */}
        <section>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              Discover More
            </Button>
          </div>
        </section>
      </main>

      {/* Modal */}
      {selectedShow && (
        <ShowDetailsModal
          open={true}
          show={selectedShow}
          onClose={() => setSelectedShow(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;