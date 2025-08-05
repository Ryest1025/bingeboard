import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserStats {
  currentlyWatching?: number;
  favorites?: number;
  toWatch?: number;
  hoursWatched?: number;
}

interface QuickStatsCardProps {
  stats?: UserStats;
}

export default function QuickStatsCard({ stats }: QuickStatsCardProps) {
  const watchedHours = stats?.hoursWatched || 65;
  const totalShows = (stats?.currentlyWatching || 0) + (stats?.favorites || 0) + (stats?.toWatch || 0) || 65;
  const progressPercentage = 75;

  return (
    <Card className="bg-slate-900">
      <CardHeader>
        <CardTitle className="text-white text-lg">Stats & Progress</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {/* Circular Progress */}
        <div className="relative w-24 h-24 mb-4">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="rgb(51 65 85)"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="rgb(34 197 94)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${progressPercentage * 2.51} 251`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{watchedHours}h</span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-white font-medium">{totalShows}</div>
          <div className="text-gray-400 text-sm">shows & movies watched</div>
        </div>
      </CardContent>
    </Card>
  );
}
