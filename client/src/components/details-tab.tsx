import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, Calendar, Star, Clock, Youtube } from "lucide-react";
import type { Show } from "@/lib/utils";

interface DetailsTabProps {
  show: Show;
  onWatchNow?: (show: Show) => void;
  onAddToList?: (show: Show) => void;
  onWatchTrailer?: () => void;
}

export default function DetailsTab({
  show,
  onWatchNow,
  onAddToList,
  onWatchTrailer
}: DetailsTabProps) {
  const releaseYear = show.first_air_date || show.release_date
    ? new Date(show.first_air_date || show.release_date || '').getFullYear()
    : null;

  return (
    <div className="space-y-6">
      {/* Overview */}
      {show.overview && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-white">Overview</h3>
          <p className="text-gray-300 leading-relaxed text-lg">
            {show.overview}
          </p>
        </div>
      )}

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {show.first_air_date && (
            <div>
              <h4 className="font-semibold text-white mb-1">First Air Date</h4>
              <p className="text-gray-300">
                {new Date(show.first_air_date).toLocaleDateString()}
              </p>
            </div>
          )}
          {show.release_date && (
            <div>
              <h4 className="font-semibold text-white mb-1">Release Date</h4>
              <p className="text-gray-300">
                {new Date(show.release_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {show.original_language && (
            <div>
              <h4 className="font-semibold text-white mb-1">Original Language</h4>
              <p className="text-gray-300 uppercase">
                {show.original_language}
              </p>
            </div>
          )}
          {show.popularity && (
            <div>
              <h4 className="font-semibold text-white mb-1">Popularity</h4>
              <p className="text-gray-300">
                {Math.round(show.popularity)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}