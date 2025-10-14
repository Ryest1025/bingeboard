import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import {
  useContinueWatching,
  useCurrentProgress,
} from '@/hooks/useViewingHistory';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useFilters } from '@/hooks/useFilters';
import NavigationHeader from '@/components/navigation-header';
import { useToast } from "@/hooks/use-toast";
import RecommendationModal from '@/components/recommendation-modal';
import ShowDetailsModal from '@/components/show-details-modal';
import { ListSelectorModal } from '@/components/list-selector-modal';
import { EnhancedShowCard } from '@/components/EnhancedShowCard';
import {
  DashboardFilterProvider,
  useDashboardFilters,
} from '@/components/dashboard/filters/DashboardFilterProvider';
import { RecommendationFilter } from '@/components/filters/RecommendationFilter';
import { FriendFeedFilterChips } from '@/components/dashboard/filters/FriendFeedFilterChips';
import { CustomListFilterPanel } from '@/components/dashboard/filters/CustomListFilterPanel';
import type { RecommendationFilters } from '@/components/filters/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Star,
  Clock,
  Users,
  Plus,
  TrendingUp,
  Sparkles,
  BarChart3,
  Eye,
  Flame,
  Heart,
  Filter,
  List,
  X,
  Bookmark,
} from 'lucide-react';
import {
  getShowTitle,
  createPosterUrl,
  createBackdropUrl,
  type Show,
  type Genre,
} from '@/lib/utils';

// 🏆 AWARDS SYSTEM INTEGRATION
// ================================
// This dashboard now supports displaying awards for shows!
// 
// TO ENABLE AWARDS:
// 1. Backend: Modify /api/recommendations/enhanced to include awards[] for each recommendation
// 2. Backend: Modify /api/tmdb/spotlight to include awards[] for each show
// 3. Frontend: Uncomment sample award data in normalizeAIItem and tmdbItems mapping
// 4. Frontend: To enable awards filtering, add 'awards' to RecommendationFilters type in your filters/types.ts
//
// The Awards System includes:
// ✅ Award badges on recommendation cards
// ✅ Awards filtering (Any/Won/Nominated) 
// ✅ Hover tooltips showing award details
// ✅ Support for multiple awards per show
// ✅ TypeScript interfaces for type safety

// 🔧 TypeScript Interfaces for Better Type Safety
interface Award {
  name: string;        // e.g., "Emmy", "Golden Globe"
  year: number;        // e.g., 2025
  category: string;    // e.g., "Best Drama Series"
  won: boolean;        // true if won, false if nominated
}

interface UnifiedRecommendation extends Show {
  isAI: boolean;
  reason: string;
  tmdbId: number;
  score?: number;
  awards?: Award[];
}

interface ShowWithAwards extends Show {
  awards?: Award[];
}

interface AIRecommendationResponse {
  status: string;
  recommendations: Array<{
    tmdbId: number;
    id?: number;
    title?: string;
    reason: string;
    score?: number;
    poster_path?: string;
    backdrop_path?: string;
    awards?: Award[];
    showDetails?: Partial<Show> & {
      genres?: any[];
      genre_ids?: number[];
      name?: string;
      title?: string;
      poster_path?: string;
      backdrop_path?: string;
      overview?: string;
      vote_average?: number;
      first_air_date?: string;
      release_date?: string;
      original_language?: string;
      media_type?: string;
      awards?: Award[];
    };
  }>;
}

interface SpotlightResponse {
  status: string;
  results?: ShowWithAwards[];
  trending?: ShowWithAwards[];
}

interface ContinueWatchingItem {
  showId: number;
  title: string;
  poster_path?: string;
  backdrop_path?: string;
  mediaType: 'tv' | 'movie';
  currentEpisode?: {
    progressPercentage?: number;
  };
}

interface DashboardContentProps {}

// 🎯 Spotlight Query Hook with Type Safety
function useSpotlightQuery(options = {}) {
  return useQuery<SpotlightResponse>({
    queryKey: ['spotlight'],
    queryFn: async (): Promise<SpotlightResponse> => {
      console.log('🎯 Fetching spotlight data...');
      
      try {
        const response = await fetch('/api/tmdb/spotlight');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: SpotlightResponse = await response.json();
        console.log('✅ Spotlight data loaded:', {
          status: data?.status,
          results: data?.results?.length || 0,
          sample: data?.results?.[0]?.title || data?.results?.[0]?.name
        });
        
        return data;
      } catch (error) {
        console.error('❌ Spotlight fetch failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (fixed from cacheTime)
    retry: 2,
    ...options
  });
}

// 🤖 AI Recommendations Query Hook with Type Safety
function useAIRecommendationsQuery(options = {}) {
  const { user } = useAuth();
  
  return useQuery<AIRecommendationResponse>({
    queryKey: ['ai-recommendations', user?.id],
    queryFn: async (): Promise<AIRecommendationResponse> => {
      console.log('🤖 Fetching AI recommendations for user:', user?.id);
      
      try {
        const response = await fetch('/api/recommendations/enhanced');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: AIRecommendationResponse = await response.json();
        console.log('✅ AI recommendations loaded:', {
          status: data?.status,
          recommendations: data?.recommendations?.length || 0,
          sample: data?.recommendations?.[0]?.reason
        });
        
        return data;
      } catch (error) {
        console.error('❌ AI recommendations fetch failed:', error);
        // Return empty structure instead of throwing
        return { status: 'error', recommendations: [] };
      }
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes (fixed from cacheTime)
    retry: 2,
    ...options
  });
}

function DashboardContent({}: DashboardContentProps) {
  const { user } = useAuth();
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] =
    useState(false);
  const [isListSelectorModalOpen, setIsListSelectorModalOpen] = useState(false);
  const [showToAddToList, setShowToAddToList] = useState<Show | null>(null);
  const [selectedRecommendationGenre, setSelectedRecommendationGenre] =
    useState<string>('all');
  const [recommendationMode, setRecommendationMode] = useState<
    'all' | 'ai' | 'trending'
  >('all');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  
  // 📱 Responsive recommendation limits
  const getRecommendationLimit = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 768) return 4; // mobile: 2x2 grid
      if (width < 1024) return 6; // tablet: 2x3 or 3x2 grid
      return 8; // desktop: 2x4 or 4x2 grid
    }
    return 8; // server-side default
  };

  // 🔧 Dashboard Filters Integration
  const {
    recommendationFilters,
    updateRecommendationFilters,
    resetRecommendationFilters,
  } = useDashboardFilters();

  // Data Queries
  const { data: continueWatching, isLoading: continueWatchingLoading } =
    useContinueWatching();
  const { data: currentProgress } = useCurrentProgress();
  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const response = await fetch('/api/tmdb/genres');
      if (!response.ok) throw new Error('Failed to fetch genres');
      const data = await response.json();
      return data.genres || [];
    },
  });

  // 🎯 New Unified Data Queries with Error Handling
  const { 
    data: spotlightData, 
    isLoading: spotlightLoading, 
    error: spotlightError 
  } = useSpotlightQuery();
  
  const { 
    data: aiRecommendations, 
    isLoading: aiLoading, 
    error: aiError 
  } = useAIRecommendationsQuery();

  // 🔔 Error Toast Notifications
  useEffect(() => {
    if (spotlightError) {
      showToast('Failed to load trending recommendations', 'error');
    }
  }, [spotlightError]);

  useEffect(() => {
    if (aiError) {
      showToast('Failed to load AI recommendations', 'error');
    }
  }, [aiError]);

  // 🎯 FIXED UNIFIED RECOMMENDATION SYSTEM (NO ASYNC IN USEMEMO)
  const unifiedRecommendations = useMemo(() => {
    // Helper function to normalize genres - supports both arrays and objects
    const normalizeGenres = (genres: any): number[] => {
      if (!Array.isArray(genres)) return [];
      
      // Handle numeric IDs
      if (typeof genres[0] === 'number') return genres;
      
      // Handle genre objects with id property
      if (genres[0]?.id) return genres.map((g: any) => g.id);
      
      // Handle genre objects with name property - map to TMDB IDs
      if (genres[0]?.name && genres?.length) {
        const mappedIds: number[] = [];
        genres.forEach((genreObj: any) => {
          const found = (genres as any[])?.find((g: any) => 
            g.name?.toLowerCase() === genreObj.name?.toLowerCase()
          );
          if (found?.id) mappedIds.push(found.id);
        });
        return mappedIds;
      }

      // Handle string array - map genre names to TMDB IDs
      if (typeof genres[0] === 'string' && (genres as any)?.length) {
        const mappedIds: number[] = [];
        (genres as string[]).forEach((genreName) => {
          const found = (genres as any[])?.find((g: any) => 
            g.name?.toLowerCase() === genreName.toLowerCase()
          );
          if (found?.id) mappedIds.push(found.id);
        });
        return mappedIds;
      }

      return [];
    };

    // Genre name to TMDB ID mapping helper
    const mapGenreNamesToIds = (genreNames: string[] | number[]): number[] => {
      if (!genres?.length || !genreNames?.length) return [];
      
      // If already IDs, return as-is
      if (typeof genreNames[0] === 'number') return genreNames as number[];
      
      // Map genre names to TMDB IDs
      const mappedIds: number[] = [];
      (genreNames as string[]).forEach((genreName) => {
        const found = genres.find((g: any) => 
          g.name?.toLowerCase() === genreName.toLowerCase()
        );
        if (found) mappedIds.push(found.id);
      });
      
      console.log('🎭 Genre mapping:', {
        input: genreNames,
        output: mappedIds,
        available: genres.map((g: any) => g.name).slice(0, 5)
      });
      
      return mappedIds;
    };

    // Helper function to normalize AI recommendation items (NO ASYNC)
    const normalizeAIItem = (rec: any, index: number): UnifiedRecommendation => {
      // Generate stable ID using timestamp + index for missing tmdbId
      const baseId = rec.tmdbId || rec.id || (Date.now() + index);
      const details = rec.showDetails || rec;

      // Handle genre mapping - could be names, IDs, or objects  
      let genreIds: number[] = [];
      const detailsGenres = (details as any)?.genres;
      const detailsGenreIds = (details as any)?.genre_ids;
      
      if (detailsGenres) {
        if (Array.isArray(detailsGenres)) {
          // Handle [{ name: "Drama" }] format
          if (typeof detailsGenres[0] === 'object' && detailsGenres[0]?.name) {
            genreIds = mapGenreNamesToIds(detailsGenres.map((g: any) => g.name));
          } 
          // Handle ["Drama", "Comedy"] format
          else if (typeof detailsGenres[0] === 'string') {
            genreIds = mapGenreNamesToIds(detailsGenres);
          }
          // Handle [18, 35] format
          else if (typeof detailsGenres[0] === 'number') {
            genreIds = detailsGenres;
          }
        }
      } else if (detailsGenreIds) {
        genreIds = Array.isArray(detailsGenreIds) ? detailsGenreIds : [];
      }

      return {
        id: baseId,
        tmdbId: baseId,
        title: (details as any)?.name || (details as any)?.title || rec.title || `Show ${baseId}`,
        name: (details as any)?.name || (details as any)?.title || rec.title || `Show ${baseId}`,
        poster_path: (details as any)?.poster_path || rec.poster_path || undefined,
        backdrop_path: (details as any)?.backdrop_path || rec.backdrop_path || undefined,
        overview: (details as any)?.overview || rec.reason || 'AI recommendation',
        // Fixed vote_average scaling - handle both 0-1 and 0-10 scales
        vote_average: rec.score 
          ? (rec.score > 1 ? rec.score : rec.score * 10)
          : ((details as any)?.vote_average ?? 8.0),
        genre_ids: genreIds,
        first_air_date: (details as any)?.first_air_date || (details as any)?.release_date || '',
        original_language: (details as any)?.original_language || 'en',
        media_type: (details as any)?.media_type || 'tv',
        isAI: true,
        reason: rec.reason || 'AI recommended for you',
        awards: rec.awards || (details as any)?.awards || [
          // 🧪 Sample awards data for testing - remove in production
          // { name: "Emmy", year: 2024, category: "Outstanding Drama Series", won: true },
          // { name: "Golden Globe", year: 2024, category: "Best Television Series", won: false }
        ],
      };
    };
    
    console.log('🎭 Building unified recommendations:', {
      recommendationMode,
      hasAI: !!(aiRecommendations as any)?.recommendations,
      aiCount: (aiRecommendations as any)?.recommendations?.length || 0,
      hasTrending: !!(spotlightData as any)?.results,
      trendingCount: (spotlightData as any)?.results?.length || 0,
      genresReady: (genres?.length || 0) > 0,
      filtersReady: !!recommendationFilters,
      selectedGenre: selectedRecommendationGenre,
    });

    // Get AI recommendations (SYNCHRONOUS - no await)
    let aiItems: any[] = [];
    if ((aiRecommendations as any)?.recommendations) {
      try {
        aiItems = (aiRecommendations as any).recommendations
          .map((rec: any, index: number) => {
            try {
              return normalizeAIItem(rec, index);
            } catch (error) {
              console.warn('Failed to normalize AI item:', rec, error);
              return null;
            }
          })
          .filter(Boolean); // Remove nulls
        console.log('✨ Normalized AI items:', aiItems.length);
      } catch (error) {
        console.warn('Error processing AI recommendations:', error);
        aiItems = [];
      }
    }

    // Get TMDB trending/discover recommendations
    let tmdbItems: any[] = [];
    try {
      if ((spotlightData as any)?.results) {
        tmdbItems = (spotlightData as any).results.map((item: any) => ({
          ...item,
          isAI: false,
          reason: 'Trending now',
          awards: item.awards || [
            // 🧪 Sample awards data for testing - remove in production
            // { name: "SAG Award", year: 2024, category: "Outstanding Performance", won: Math.random() > 0.5 }
          ],
        }));
      } else if ((spotlightData as any)?.trending) {
        // Handle alternative spotlight API structure
        tmdbItems = (spotlightData as any).trending.map((item: any) => ({
          ...item,
          isAI: false,
          reason: 'Trending now',
          awards: item.awards || [
            // 🧪 Sample awards data for testing - remove in production
            // { name: "People's Choice", year: 2024, category: "Favorite TV Show", won: Math.random() > 0.5 }
          ],
        }));
      }
    } catch (error) {
      console.warn('Error processing TMDB recommendations:', error);
      tmdbItems = [];
    }

    // Apply genre filtering if needed (only if we have genre data)
    const applyGenreFilter = (items: any[]): any[] => {
      if (!items.length) return items;
      
      // IMPORTANT: Always return all items when 'all' is selected
      if (selectedRecommendationGenre === 'all') {
        console.log('✅ Showing all recommendations (no genre filter applied)');
        return items;
      }
      
      // Only filter if we have valid genre data
      if (!genres?.length) {
        console.log('⏳ Skipping genre filter - genres not loaded yet');
        return items;
      }
      
      const genreId = parseInt(selectedRecommendationGenre);
      const filtered = items.filter((item: any) => {
        const hasGenre = item.genre_ids && item.genre_ids.includes(genreId);
        return hasGenre;
      });
      
      console.log('🎭 Genre filter results:', {
        originalCount: items.length,
        filteredCount: filtered.length,
        genreId,
        genre: genres.find((g: any) => g.id === genreId)?.name
      });
      
      return filtered;
    };

    // Apply additional filters from the filter system
    const applyAdvancedFilters = (items: any[]): any[] => {
      if (!items.length || !recommendationFilters) return items;

      let filtered = [...items];
      
      // Rating filter
      if (recommendationFilters.rating && recommendationFilters.rating !== 'any') {
        const minRating = parseFloat(recommendationFilters.rating);
        filtered = filtered.filter(item => (item.vote_average || 0) >= minRating);
        console.log(`🌟 Applied rating filter (${minRating}+):`, filtered.length);
      }

      // Year filter
      if (recommendationFilters.year && recommendationFilters.year !== 'any') {
        const targetYear = parseInt(recommendationFilters.year);
        filtered = filtered.filter(item => {
          const releaseDate = item.first_air_date || item.release_date;
          if (!releaseDate) return false;
          const year = parseInt(releaseDate.split('-')[0]);
          return year === targetYear;
        });
        console.log(`📅 Applied year filter (${targetYear}):`, filtered.length);
      }

      // Language filter  
      if (recommendationFilters.language && recommendationFilters.language !== 'any') {
        filtered = filtered.filter(item => 
          item.original_language === recommendationFilters.language
        );
        console.log(`🌍 Applied language filter (${recommendationFilters.language}):`, filtered.length);
      }

      // Awards filter (NEW)
      if ((recommendationFilters as any).awards && (recommendationFilters as any).awards !== 'any') {
        filtered = filtered.filter(item => {
          if (!item.awards?.length) return false;
          if ((recommendationFilters as any).awards === 'won') {
            return item.awards.some((a: Award) => a.won);
          } else if ((recommendationFilters as any).awards === 'nominated') {
            return item.awards.some((a: Award) => !a.won);
          }
          return true;
        });
        console.log(`🏆 Applied awards filter:`, (recommendationFilters as any).awards, filtered.length);
      }

      return filtered;
    };

    // Select items based on recommendation mode
    let selectedItems = [];
    
    switch (recommendationMode) {
      case 'ai':
        selectedItems = aiItems;
        console.log('🤖 Using AI-only recommendations:', selectedItems.length);
        break;
      case 'trending':
        selectedItems = tmdbItems;
        console.log('🔥 Using trending-only recommendations:', selectedItems.length);
        break;
      case 'all':
      default:
        // Combine AI and trending with intelligent mixing
        const maxTotal = 12;
        const aiPortion = Math.min(aiItems.length, Math.ceil(maxTotal * 0.6)); // 60% AI
        const trendingPortion = Math.min(tmdbItems.length, maxTotal - aiPortion);
        
        selectedItems = [
          ...aiItems.slice(0, aiPortion),
          ...tmdbItems.slice(0, trendingPortion)
        ];
        
        console.log('🎭 Mixed recommendations:', {
          ai: aiPortion,
          trending: trendingPortion,
          total: selectedItems.length
        });
        break;
    }

    // Apply filters
    selectedItems = applyGenreFilter(selectedItems);
    selectedItems = applyAdvancedFilters(selectedItems);

    // Stable shuffle based on data hash
    const dataHash = selectedItems.map(item => item.id).join('');
    const seed = dataHash.length; // Simple seed from data
    
    // Stable shuffle using seed
    const shuffled = [...selectedItems].sort((a, b) => {
      const hashA = (a.id + seed) % 1000;
      const hashB = (b.id + seed) % 1000;
      return hashA - hashB;
    });
    
    // Final shuffle and limit (FIXED - responsive limit)
    const limit = getRecommendationLimit();
    const final = shuffled.slice(0, limit);
    
    console.log('✅ Final unified recommendations:', {
      mode: recommendationMode,
      total: final.length,
      aiCount: final.filter(item => item.isAI).length,
      trendingCount: final.filter(item => !item.isAI).length,
      genres: selectedRecommendationGenre,
      items: final.map(item => ({
        title: item.title || item.name,
        isAI: !!item.isAI,
        reason: item.reason
      }))
    });

    return final;
  }, [
    genres, 
    recommendationFilters,
    recommendationMode,
    aiRecommendations,
    spotlightData,
    selectedRecommendationGenre,
  ]);

  // Genre filtering for recommendations (optimized memoization)
  const filteredGenres = useMemo(() => {
    if (!genres?.length || !unifiedRecommendations.length) return [];
    
    // Get unique genres from current recommendations
    const recommendationGenres = new Set<number>();
    unifiedRecommendations.forEach(rec => {
      if (rec.genre_ids?.length) {
        rec.genre_ids.forEach((genreId: number) => {
          recommendationGenres.add(genreId);
        });
      }
    });
    
    const availableGenres = genres.filter((genre: any) => 
      recommendationGenres.has(genre.id)
    );
    
    console.log('🎭 Available recommendation genres:', {
      total: availableGenres.length,
      genres: availableGenres.map((g: any) => g.name).slice(0, 5)
    });
    
    return availableGenres;
  }, [genres, unifiedRecommendations]);

  // Helper functions
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };

  const handleAddToList = async (show: Show) => {
    setShowToAddToList(show);
    setIsListSelectorModalOpen(true);
  };

  const handleRecommendationClick = (recommendation: any) => {
    console.log('🔍 Opening recommendation details:', recommendation.title || recommendation.name);
    setSelectedShow(recommendation);
  };

  // Safe render helper for recommendation cards using EnhancedShowCard
  const renderRecommendationCard = (rec: any, index: number) => {
    try {
      // Convert recommendation data to Show format for EnhancedShowCard
      const showData: any = {
        id: Number(rec.id),
        title: getShowTitle(rec),
        name: rec.name || rec.title,
        overview: rec.overview || '',
        poster_path: rec.poster_path,
        backdrop_path: rec.backdrop_path,
        vote_average: rec.vote_average || 0,
        genre_ids: rec.genre_ids || [],
        first_air_date: rec.first_air_date || rec.release_date || '',
        media_type: rec.media_type || 'movie',
        streamingPlatforms: rec.streamingPlatforms || [],
        awards: rec.awards || []
      };
      
      return (
        <EnhancedShowCard
          key={`${rec.id}-${index}`}
          show={showData}
          variant="compact"
          size="sm"
          onCardClick={() => handleRecommendationClick(rec)}
          onAddToWatchlist={() => handleAddToList(rec as Show)}
        />
      );
    } catch (error) {
      console.warn('Error rendering recommendation card:', rec, error);
      return (
        <Card key={`error-${index}`} className="aspect-[2/3] bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500 p-4">
            <div className="text-xs">Unable to load</div>
          </div>
        </Card>
      );
    }
  };

  // Loading states
  const isRecommendationsLoading = spotlightLoading || aiLoading;

  return (
    <>
      {/* 🎯 RECOMMENDATIONS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold">
              {recommendationMode === 'ai' && '🤖 AI Recommendations'}
              {recommendationMode === 'trending' && '🔥 Trending Now'}
              {recommendationMode === 'all' && '✨ Recommended for You'}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mode Toggle */}
            <div className="flex rounded-lg border p-1">
              <button
                onClick={() => setRecommendationMode('all')}
                className={`px-3 py-1 text-sm rounded ${
                  recommendationMode === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setRecommendationMode('ai')}
                className={`px-3 py-1 text-sm rounded ${
                  recommendationMode === 'ai'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                AI
              </button>
              <button
                onClick={() => setRecommendationMode('trending')}
                className={`px-3 py-1 text-sm rounded ${
                  recommendationMode === 'trending'
                    ? 'bg-red-500 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Trending
              </button>
            </div>
            
            {/* Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterPanelOpen(true)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRecommendationModalOpen(true)}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Get More
            </Button>
          </div>
        </div>

        {/* Genre Filter for Recommendations */}
        {filteredGenres.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
              Genre:
            </span>
            <button
              onClick={() => setSelectedRecommendationGenre('all')}
              className={`px-3 py-1 text-sm rounded-full border whitespace-nowrap ${
                selectedRecommendationGenre === 'all'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              Genre
            </button>
            {filteredGenres.slice(0, 8).map((genre: any) => (
              <button
                key={genre.id}
                onClick={() => setSelectedRecommendationGenre(genre.id.toString())}
                className={`px-3 py-1 text-sm rounded-full border whitespace-nowrap ${
                  selectedRecommendationGenre === genre.id.toString()
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        )}

        {/* Recommendations Grid */}
        {isRecommendationsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={`skeleton-${i}`} className="aspect-[2/3] bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : unifiedRecommendations.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {unifiedRecommendations.map((rec, index) => 
              renderRecommendationCard(rec, index)
            )}
          </div>
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No recommendations available
              </h3>
              <p className="text-gray-500 mb-4">
                {spotlightError || aiError 
                  ? 'Unable to load recommendations. Please try again later.'
                  : 'Try adjusting your filters or check back later for new recommendations.'
                }
              </p>
              <Button
                onClick={() => setIsRecommendationModalOpen(true)}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Get Personalized Recommendations
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Continue Watching Section */}
      {((continueWatching && continueWatching.length > 0) || continueWatchingLoading) && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-green-500" />
            <h2 className="text-2xl font-bold">Continue Watching</h2>
          </div>

          {continueWatchingLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={`activity-skeleton-${i}`} className="aspect-video bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {continueWatching?.map((show) => {
              // Fixed progress calculation for ContinueWatchingItem
              const progress = typeof currentProgress?.[show.showId] === 'number' 
                ? currentProgress[show.showId] 
                : show.currentEpisode?.progressPercentage || 0;
                
              return (
                <Card
                  key={show.showId}
                  className="group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  onClick={() => setSelectedShow({
                    id: show.showId,
                    title: show.title,
                    name: show.title,
                    overview: '',
                    poster_path: show.poster_path,
                    backdrop_path: show.backdrop_path,
                    vote_average: 0,
                    genre_ids: [],
                    first_air_date: '',
                    media_type: show.mediaType
                  } as Show)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={createBackdropUrl(show.backdrop_path || null, 'w500')}
                        alt={show.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = createPosterUrl(show.poster_path || null, 'w300');
                        }}
                      />

                      {/* Progress Bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/50">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                          <Play className="h-8 w-8 text-white ml-1" />
                        </div>
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                        {show.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{Math.round(Number(progress))}% watched</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>
          )}
        </section>
      )}

      {/* Filter Panel Modal */}
      <Dialog open={isFilterPanelOpen} onOpenChange={setIsFilterPanelOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Recommendation Filters
            </DialogTitle>
            <DialogDescription>
              Customize your content recommendations by selecting preferred genres, platforms, and content types.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <RecommendationFilter
              onChange={updateRecommendationFilters}
              initialFilters={recommendationFilters}
            />
            
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={resetRecommendationFilters}
              >
                Reset Filters
              </Button>
              <Button onClick={() => setIsFilterPanelOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <RecommendationModal
        userId={user?.id}
      />

      {selectedShow && (
        <ShowDetailsModal
          open={selectedShow !== null}
          show={selectedShow}
          onClose={() => setSelectedShow(null)}
          onAddToList={() => handleAddToList(selectedShow)}
        />
      )}

      {isListSelectorModalOpen && showToAddToList && (
        <ListSelectorModal
          isOpen={isListSelectorModalOpen}
          onClose={() => {
            setIsListSelectorModalOpen(false);
            setShowToAddToList(null);
          }}
          show={showToAddToList}
          onSuccess={() => {
            showToast('Added to list successfully!');
            setIsListSelectorModalOpen(false);
            setShowToAddToList(null);
          }}
        />
      )}

      {toastMessage && (
        <Toast
          isVisible={toastMessage !== ''}
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />
      )}
    </>
  );
}

export default function Dashboard() {
  return (
    <DashboardFilterProvider>
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader />
        <main className="container mx-auto px-4 py-8 space-y-12 max-w-7xl">
          <DashboardContent />
        </main>
      </div>
    </DashboardFilterProvider>
  );
}