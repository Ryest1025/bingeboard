import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSpot from "@/components/HeroSpot";
import EnhancedFilterSystem from "@/components/EnhancedFilterSystem";
import TrendingCarousel from "@/components/TrendingCarousel";
import RecommendationsSection from "@/components/RecommendationsSection";
import HiddenGemsSection from "@/components/HiddenGemsSection";
import { Show } from "@/types";

// Mock data for lab testing
const mockTrendingMovies: Show[] = [
  { id: '1', title: 'The Dark Knight', posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', genres: ['Action', 'Crime', 'Drama'], rating: 9.0 },
  { id: '2', title: 'Inception', posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', genres: ['Action', 'Thriller'], rating: 8.8 },
  { id: '3', title: 'Interstellar', posterUrl: 'https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg', genres: ['Drama'], rating: 8.6 },
  { id: '4', title: 'Dune', posterUrl: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', genres: ['Action', 'Adventure'], rating: 8.0 },
  { id: '5', title: 'Top Gun: Maverick', posterUrl: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg', genres: ['Action', 'Drama'], rating: 8.3 },
  { id: '6', title: 'Everything Everywhere All at Once', posterUrl: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg', genres: ['Comedy', 'Drama'], rating: 7.8 },
];

const mockTrendingTV: Show[] = [
  { id: 'tv1', title: 'House of the Dragon', posterUrl: 'https://image.tmdb.org/t/p/w500/17TTFFAXcvOPalI99dYKURJmNsV.jpg', genres: ['Drama', 'Fantasy'], rating: 8.4 },
  { id: 'tv2', title: 'The Bear', posterUrl: 'https://image.tmdb.org/t/p/w500/zMvjeDgMJNH9MdKrJQVNhqyMeMo.jpg', genres: ['Comedy', 'Drama'], rating: 8.7 },
  { id: 'tv3', title: 'Wednesday', posterUrl: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg', genres: ['Comedy', 'Horror'], rating: 8.1 },
  { id: 'tv4', title: 'Stranger Things', posterUrl: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', genres: ['Drama', 'Horror'], rating: 8.7 },
  { id: 'tv5', title: 'The Last of Us', posterUrl: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', genres: ['Drama', 'Horror'], rating: 8.8 },
  { id: 'tv6', title: 'Abbott Elementary', posterUrl: 'https://image.tmdb.org/t/p/w500/fDrZqmPhDeHlbL7zVASQeKNQj5T.jpg', genres: ['Comedy'], rating: 8.0 },
];

interface DiscoverPageProps {
  trendingMovies?: Show[];
  trendingTV?: Show[];
  recommendedShows?: Show[];
  hiddenGems?: Show[];
}

export default function DiscoverLab({
  trendingMovies = mockTrendingMovies,
  trendingTV = mockTrendingTV,
  recommendedShows = mockTrendingMovies.slice(0, 4),
  hiddenGems = [...mockTrendingMovies, ...mockTrendingTV].filter(s => (s.rating ?? 0) >= 8.5),
}: DiscoverPageProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  return (
    <div className="w-full min-h-screen bg-slate-900 text-white">
      {/* Universal Branded Header */}
      <Header />

      {/* Hero Section */}
      <HeroSpot shows={[...trendingMovies, ...trendingTV].slice(0, 5)} height="h-[600px]" />

      {/* Sticky Filter Toolbar */}
      <div className="sticky top-0 z-20 bg-slate-900 bg-opacity-95 backdrop-blur-sm p-6 md:p-12 shadow-md">
        <EnhancedFilterSystem
          compactMode={true}
          onFiltersChange={(filters: any) => {
            const allFilters = [
              ...filters.genres,
              ...filters.platforms,
              ...filters.countries,
              ...filters.sports
            ];
            setActiveFilters(allFilters);
          }}
        />
      </div>

      {/* Trending Movies Section */}
      <div className="p-6 md:p-12">
        <TrendingCarousel
          title="Trending Movies"
          shows={trendingMovies}
          activeFilters={activeFilters}
        />
      </div>

      {/* Trending TV Section */}
      <div className="p-6 md:p-12">
        <TrendingCarousel
          title="Trending TV Shows"
          shows={trendingTV}
          activeFilters={activeFilters}
        />
      </div>

      {/* AI Recommendations Section */}
      <div className="p-6 md:p-12">
        <RecommendationsSection
          title="AI Recommendations"
          shows={recommendedShows}
          activeFilters={activeFilters}
        />
      </div>

      {/* Hidden Gems Section */}
      <div className="p-6 md:p-12">
        <HiddenGemsSection shows={hiddenGems} activeFilters={activeFilters} />
      </div>

      {/* Quick Actions / Watchlist Floating Button */}
      <button className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-full shadow-lg z-30">
        Add to Watchlist
      </button>

      {/* Universal Branded Footer */}
      <Footer />
    </div>
  );
}
