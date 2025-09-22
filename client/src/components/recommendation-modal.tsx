import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { UniversalButton } from './ui/universal-button';
import { Skeleton } from './ui/skeleton';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  poster?: string;
  rating?: number;
  genre?: string[];
  releaseYear?: number;
  platform?: string[];
  isNewSeason?: boolean;
  seasonNumber?: number;
  nextSeasonReleaseDate?: string;
  aiScore?: number;
}

interface RecommendationModalProps {
  userId?: string;
  limit?: number;
  showNewSeasonBadge?: boolean;
}

interface RecommendationState {
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;
}

// Mock recommendations for fallback/development
const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    title: 'Breaking Bad',
    description: 'A high school chemistry teacher turns to cooking meth after being diagnosed with cancer.',
    rating: 9.5,
    genre: ['Drama', 'Crime', 'Thriller'],
    releaseYear: 2008,
    platform: ['Netflix', 'Amazon Prime'],
    aiScore: 95,
  },
  {
    id: '2', 
    title: 'Stranger Things',
    description: 'Kids in a small town encounter supernatural forces and government conspiracies.',
    rating: 8.7,
    genre: ['Sci-Fi', 'Horror', 'Drama'],
    releaseYear: 2016,
    platform: ['Netflix'],
    isNewSeason: true,
    seasonNumber: 5,
    nextSeasonReleaseDate: '2024-07-15',
    aiScore: 88,
  },
  {
    id: '3',
    title: 'The Office',
    description: 'Mockumentary sitcom about the everyday lives of office employees.',
    rating: 9.0,
    genre: ['Comedy', 'Mockumentary'],
    releaseYear: 2005,
    platform: ['Peacock', 'Amazon Prime'],
    aiScore: 92,
  },
];

export default function RecommendationModal({ 
  userId, 
  limit = 6,
  showNewSeasonBadge = true 
}: RecommendationModalProps) {
  const [state, setState] = useState<RecommendationState>({
    recommendations: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!userId) {
      setState({
        recommendations: MOCK_RECOMMENDATIONS.slice(0, limit),
        isLoading: false,
        error: null,
      });
      return;
    }

    async function fetchRecommendations() {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const res = await fetch(`/api/recommendations?userId=${userId}&limit=${limit}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch recommendations: ${res.status} ${res.statusText}`);
        }
        
        const data: Recommendation[] = await res.json();
        
        // Sort recommendations: new seasons first, then by AI score
        const sortedData = data.sort((a, b) => {
          if (a.isNewSeason && !b.isNewSeason) return -1;
          if (!a.isNewSeason && b.isNewSeason) return 1;
          return (b.aiScore || 0) - (a.aiScore || 0);
        });
        
        setState({
          recommendations: sortedData,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        
        setState({
          recommendations: MOCK_RECOMMENDATIONS.slice(0, limit),
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load recommendations',
        });
      }
    }

    fetchRecommendations();
  }, [userId, limit]);

  const handleWatchNow = (recommendation: Recommendation) => {
    // TODO: Implement watch now functionality
    console.log('Watch now clicked for:', recommendation.title);
  };

  if (state.isLoading) {
    return (
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-white">Recommended For You</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => (
            <Card key={`skeleton-${i}`} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2 bg-gray-700" />
                <Skeleton className="h-4 w-full mb-2 bg-gray-700" />
                <Skeleton className="h-4 w-2/3 mb-4 bg-gray-700" />
                <Skeleton className="h-10 w-24 bg-gray-700" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-white">Recommended For You</h2>
      
      {state.error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          <p className="text-sm">{state.error}</p>
        </div>
      )}
      
      {state.recommendations.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No recommendations available at the moment.</p>
          <p className="text-sm mt-2">Check back later for personalized suggestions!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {state.recommendations.map(rec => (
            <Card key={rec.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {rec.title}
                  {rec.isNewSeason && showNewSeasonBadge && (
                    <span className="ml-2 text-yellow-400 font-bold text-sm">
                      New Season {rec.seasonNumber}!
                    </span>
                  )}
                </h3>
                
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                  {rec.description}
                </p>
                
                {rec.rating && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <span>⭐ {rec.rating}</span>
                    {rec.releaseYear && <span>• {rec.releaseYear}</span>}
                  </div>
                )}
                
                {rec.genre && rec.genre.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {rec.genre.slice(0, 2).map(g => (
                      <span key={g} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
                
                <UniversalButton 
                  onClick={() => handleWatchNow(rec)}
                  className="w-full"
                >
                  Watch Now
                </UniversalButton>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
