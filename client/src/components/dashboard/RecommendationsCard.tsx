import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecommendationGrid, SectionTitle } from "@/components/common";
import { useTrendingShows } from "@/hooks/useRecommendedShows";

export default function RecommendationsCard() {
  const { data: trendingData, isLoading, error } = useTrendingShows();

  if (error) {
    return (
      <Card className="glass-effect border-white/10">
        <CardHeader>
          <CardTitle>Trending Shows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">
            Unable to load recommendations
          </div>
        </CardContent>
      </Card>
    );
  }

  const shows = trendingData?.results?.slice(0, 6).map((show: any) => ({
    tmdbId: show.id,
    title: show.name || show.title || 'Unknown Title',
    posterPath: show.poster_path 
      ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
      : undefined,
    rating: show.vote_average?.toFixed(1) || 'N/A',
    streamingPlatforms: show.streamingPlatforms
  })) || [];

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle>Trending Shows</CardTitle>
      </CardHeader>
      <CardContent>
        <RecommendationGrid
          shows={shows}
          columns={{ sm: 2, md: 3, lg: 3, xl: 3 }}
          variant="compact"
          isLoading={isLoading}
          emptyMessage="No trending shows available"
          onInteraction={(action, tmdbId) => {
            console.log(`Dashboard trending interaction: ${action} on ${tmdbId}`);
          }}
        />
      </CardContent>
    </Card>
  );
}