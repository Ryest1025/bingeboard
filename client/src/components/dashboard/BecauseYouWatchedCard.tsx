import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentCard } from "@/components/ui/ContentCard";

export default function BecauseYouWatchedCard() {
  // Fetch real recommendations data
  const { data: recommendationsData, isLoading, error } = useQuery({
    queryKey: ["/api/recommendations/because-you-watched"],
    queryFn: async () => {
      const res = await fetch("/api/recommendations/because-you-watched", {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return res.json();
    },
    staleTime: 0, // Force fresh data
  });

  if (isLoading) {
    return (
      <Card className="bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white text-lg">Because you watched...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="bg-slate-700 aspect-[2/3] animate-pulse"></div>
                <div className="bg-slate-700 h-4 animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recommendations = (recommendationsData as any)?.shows || [];

  if (error) {
    return (
      <Card className="bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white text-lg">Because you watched Breaking Bad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-400 text-center py-8">
            Failed to load recommendations. Please try refreshing the page.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900">
      <CardHeader>
        <CardTitle className="text-white text-lg">Because you watched Breaking Bad</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          {recommendations.slice(0, 4).map((show: any) => {
            // Transform TMDB data to match ContentCard interface
            const transformedShow = {
              id: show.id,
              title: show.title,
              poster_path: show.poster_path,
              vote_average: show.vote_average || 8.0,
              genres: ["Drama", "Crime"], // Default genres - could be mapped from genre_ids
              providers: [{ provider_name: "Netflix", logo_path: "/netflix-logo.png" }],
              overview: show.overview || "",
              media_type: show.media_type || 'tv'
            };

            return (
              <ContentCard
                key={show.id}
                item={transformedShow}
                type="grid"
                showStreamingLogos={true}
                showWatchNow={true}
                showTrailerButton={true}
                showCalendarButton={false}
                showNotificationButton={false}
                showAffiliateLinks={true}
                onAddToWatchlist={(item: any) => console.log('Added to watchlist:', item)}
                onWatchNow={(item: any, platform: any) => console.log('Watch on:', platform, item)}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
