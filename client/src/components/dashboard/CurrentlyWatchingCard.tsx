import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";

interface Show {
  id: number;
  name?: string;
  title?: string;
  poster_path?: string;
  first_air_date?: string;
  release_date?: string;
}

interface CurrentlyWatchingCardProps {
  shows: Show[];
}

export default function CurrentlyWatchingCard({ shows }: CurrentlyWatchingCardProps) {
  // Mock data to match the reference design
  const mockShows = [
    {
      id: 1,
      title: "The Last of Us",
      progress: "Resume S1E4",
      platform: "HBO MAX",
      poster: "/api/placeholder/60/80"
    },
    {
      id: 2,
      title: "Succession",
      progress: "Resume S1E4",
      platform: "HBO MAX",
      poster: "/api/placeholder/60/80"
    }
  ];

  return (
    <Card className="bg-slate-900">
      <CardHeader>
        <CardTitle className="text-white text-lg">Continue Watching</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockShows.map((show) => (
          <div key={show.id} className="flex items-center gap-3">
            <div className="w-12 h-16 bg-slate-700 rounded flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm truncate">{show.title}</h4>
              <p className="text-gray-400 text-xs">{show.progress}</p>
              <p className="text-gray-500 text-xs">{show.platform}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
