import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NewReleasesCardProps {
  releases?: any[];
}

export default function NewReleasesCard({ releases }: NewReleasesCardProps) {
  // Fetch real new releases data
  const { data: releasesData, isLoading } = useQuery({
    queryKey: ["/api/content/new-releases"],
    queryFn: async () => {
      const res = await fetch("/api/content/new-releases");
      if (!res.ok) throw new Error("Failed to fetch new releases");
      return res.json();
    },
  });

  const displayReleases = releasesData?.releases || releases || [];

  if (isLoading) {
    return (
      <Card className="bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white text-lg">New Releases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="bg-slate-700 rounded-lg aspect-[3/4] animate-pulse"></div>
                <div className="bg-slate-700 rounded h-4 animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900">
      <CardHeader>
        <CardTitle className="text-white text-lg">New Releases</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          {displayReleases.slice(0, 4).map((release: any) => (
            <div key={release.id} className="space-y-2">
              <div className="bg-slate-700 rounded-lg aspect-[3/4] flex items-center justify-center overflow-hidden">
                {release.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w200${release.poster_path}`}
                    alt={release.title || release.name}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    onLoad={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onError={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.display = 'none';
                    }}
                    style={{ opacity: 0 }}
                  />
                ) : (
                  <span className="text-white text-xs text-center px-2">
                    {release.title || release.name}
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-xs text-center truncate">
                {release.media_type === 'movie' ? 'Movie' : 'TV Show'}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
