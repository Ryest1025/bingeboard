import { RecommendationCard, RecommendationGrid, SectionTitle } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock data for testing
const mockShows = [
  {
    tmdbId: 1,
    title: "Breaking Bad",
    posterPath: "https://image.tmdb.org/t/p/w300/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg",
    rating: "9.5",
    streamingPlatforms: [
      { provider_id: 8, provider_name: "Netflix", logo_path: "https://image.tmdb.org/t/p/w45/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg" }
    ],
    hasTrailer: true,
    trailerUrl: "https://www.youtube.com/watch?v=HhesaQXLuRY"
  },
  {
    tmdbId: 2,
    title: "Stranger Things",
    posterPath: "https://image.tmdb.org/t/p/w300/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg", 
    rating: "8.7",
    streamingPlatforms: [
      { provider_id: 8, provider_name: "Netflix", logo_path: "https://image.tmdb.org/t/p/w45/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg" }
    ],
    hasTrailer: true,
    trailerUrl: "https://www.youtube.com/watch?v=b9EkMc79ZSU"
  },
  {
    tmdbId: 3,
    title: "The Crown",
    posterPath: "https://image.tmdb.org/t/p/w300/1M876KPjulVwppEpldhdc8V4o68.jpg",
    rating: "8.6", 
    streamingPlatforms: [
      { provider_id: 8, provider_name: "Netflix", logo_path: "https://image.tmdb.org/t/p/w45/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg" }
    ]
  },
  {
    tmdbId: 4,
    title: "The Mandalorian", 
    posterPath: "https://image.tmdb.org/t/p/w300/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
    rating: "8.8",
    streamingPlatforms: [
      { provider_id: 337, provider_name: "Disney Plus", logo_path: "https://image.tmdb.org/t/p/w45/dgPueyEdOwpQ10fjuhL2WYFQwQs.jpg" }
    ],
    hasTrailer: true,
    trailerUrl: "https://www.youtube.com/watch?v=aOC8E8z_ifw"
  },
  {
    tmdbId: 5,
    title: "House of the Dragon",
    posterPath: "https://image.tmdb.org/t/p/w300/z2yahl2uefxDCl0nogcRBstwruJ.jpg",
    rating: "8.5",
    streamingPlatforms: [
      { provider_id: 384, provider_name: "HBO Max", logo_path: "https://image.tmdb.org/t/p/w45/Ajqyt5aNxNGjmF9uOfxArGrdf3X.jpg" }
    ]
  }
];

export default function ComponentsDemo() {
  const handleInteraction = (action: string, tmdbId: number) => {
    console.log(`Demo: ${action} on show ${tmdbId}`);
  };

  return (
    <div className="min-h-screen bg-binge-dark text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Component Design System Demo</h1>
          <p className="text-gray-400">Testing the new centralized components for scalable development</p>
        </div>

        {/* Section Title Demo */}
        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle>SectionTitle Component</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionTitle title="Trending Now" badge="Live Data" />
            <SectionTitle title="Your Recommendations" subtitle="Based on your watch history" />
            <SectionTitle title="Continue Watching" />
          </CardContent>
        </Card>

        {/* RecommendationCard Variants */}
        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle>RecommendationCard Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Compact Variant</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {mockShows.slice(0, 3).map((show) => (
                    <RecommendationCard
                      key={show.tmdbId}
                      show={show}
                      variant="compact"
                      onInteraction={handleInteraction}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Default Variant</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {mockShows.slice(0, 3).map((show) => (
                    <RecommendationCard
                      key={show.tmdbId}
                      show={show}
                      variant="default"
                      onInteraction={handleInteraction}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Large Variant</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {mockShows.slice(0, 2).map((show) => (
                    <RecommendationCard
                      key={show.tmdbId}
                      show={show}
                      variant="large"
                      onInteraction={handleInteraction}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RecommendationGrid Demo */}
        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle>RecommendationGrid Component</CardTitle>
          </CardHeader>
          <CardContent>
            <RecommendationGrid
              title="Trending This Week"
              shows={mockShows}
              columns={{ sm: 2, md: 3, lg: 4, xl: 5 }}
              onInteraction={handleInteraction}
            />
          </CardContent>
        </Card>

        {/* Interactive Demo */}
        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle>Interactive Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              Hover over the cards above to see the quick actions overlay. 
              Check the browser console to see interaction events.
            </p>
            <Button onClick={() => handleInteraction('demo-button', 999)}>
              Test Console Log
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
