/**
 * Dashboard Page — MERGED PRODUCTION + UNIVERSAL
 * @version 1.2.0
 * @lastModified 2025-10-14T21:25:00Z
 * @author BingeBoard Team
 *
 * Features:
 *  - Animated Spotlight hero with backdrop + poster overlay + gradient
 *  - "For You" recommendations (6 items max) using UniversalMediaCard
 *  - Continue Watching section
 *  - Universal buttons for all actions
 *  - Spotlight Watch Now button includes first streaming provider logo
 */

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import NavigationHeader from "@/components/navigation-header";
import ContinueWatching from "@/components/ContinueWatching";
import { Button } from "@/components/ui/button";
import { normalizeMedia } from "@/utils/normalizeMedia";
import { UniversalMediaCard } from "@/components/universal";
import useMediaActions from "@/hooks/useMediaActions";
import type { NormalizedMedia } from "@/types/media";
import type { MediaItem as ActionMediaItem } from "@/services/userActions";
import { apiFetch } from "@/utils/api-config";
import BuildInfoBadge from "@/components/BuildInfoBadge";

// TMDB base image sizes
const TMDB_BACKDROP_SIZE = "w1280";
const TMDB_POSTER_SIZE = "w500";

function buildTmdbUrl(path?: string | null, size: string = "original") {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="w-full space-y-6">
    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{title}</h2>
    {children}
  </section>
);

const DashboardPage: React.FC = () => {
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const { addToWatchlist, watchNow, watchTrailer } = useMediaActions();

  // --- API Queries ---
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      const res = await apiFetch("/api/trending/tv/day?includeStreaming=true");
      if (!res.ok) throw new Error("Failed to fetch trending");
      return res.json();
    },
  });

  const { data: personalizedData, isLoading: personalizedLoading } = useQuery({
    queryKey: ["personalized-multiapi", "v1"],
    queryFn: async () => {
      const res = await apiFetch("/api/personalized/tv?sort_by=popularity.desc&includeStreaming=true");
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return res.json();
    },
  });

  // --- Process Data ---
  const processedTrending = useMemo(() => {
    const raw = (trendingData as any)?.results || [];
    return normalizeMedia(raw.length ? raw : [
      {
        id: 999001,
        name: "Sample Spotlight Show",
        overview: "Fallback sample because trending data returned empty.",
        poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
        vote_average: 8.2,
        first_air_date: "2024-09-18",
        genres: [{ id: 18, name: "Drama" }],
      },
    ] as any);
  }, [trendingData]);

  const spotlightItem = useMemo(() => processedTrending.find((item) => item.streaming?.length > 0) || processedTrending[0], [processedTrending]);

  const filteredRecommendations = useMemo(() => {
    const raw = (personalizedData as any)?.results || [];
    return normalizeMedia(raw).slice(0, 6); // always max 6
  }, [personalizedData]);

  // --- Handlers ---
  const toActionMedia = (m: NormalizedMedia): ActionMediaItem => ({
    id: m.id.toString(),
    title: m.title,
    name: m.name,
    type: (m as any).type === "movie" ? "movie" : "tv",
    poster_path: m.poster_path,
    backdrop_path: m.backdrop_path,
    release_date: m.release_date,
    first_air_date: m.first_air_date,
    vote_average: m.vote_average,
    overview: m.overview,
    genre_ids: m.genre_ids,
  });

  const handleAddToWatchlist = async (media: NormalizedMedia) => {
    try {
      const success = await addToWatchlist(toActionMedia(media));
      setToastMessage(success ? `Added "${media.title || media.name}" to watchlist!` : "Failed to add to watchlist");
      setToastType(success ? "success" : "error");
    } catch {
      setToastMessage("Failed to add to watchlist");
      setToastType("error");
    }
  };

  const handleWatchNow = async (media: NormalizedMedia) => {
    try {
      const success = await watchNow(toActionMedia(media));
      if (!success) {
        setToastMessage("No streaming option available");
        setToastType("error");
      }
    } catch {
      setToastMessage("Failed to launch watch");
      setToastType("error");
    }
  };

  const handleWatchTrailer = async (media: NormalizedMedia) => {
    try {
      const success = await watchTrailer(toActionMedia(media), true);
      if (!success) {
        setToastMessage("No trailer available");
        setToastType("error");
      }
    } catch {
      setToastMessage("Failed to load trailer");
      setToastType("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 w-full overflow-x-hidden">
      <NavigationHeader />

      <main className="w-full max-w-none px-6 py-6 space-y-12" aria-live="polite">
        {/* Spotlight */}
        {spotlightItem && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="relative w-full rounded-xl overflow-hidden shadow-xl min-h-[400px]"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-cover bg-center filter brightness-75"
              style={{ backgroundImage: `url(${buildTmdbUrl(spotlightItem.backdrop_path, TMDB_BACKDROP_SIZE)})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

            {/* Content */}
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 p-6">
              <div className="flex-shrink-0 w-44 rounded-lg overflow-hidden shadow-2xl ring-1 ring-slate-900/60">
                <img
                  src={buildTmdbUrl(spotlightItem.poster_path, TMDB_POSTER_SIZE)}
                  alt={spotlightItem.title || spotlightItem.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 space-y-3 text-white">
                <h2 className="text-3xl md:text-4xl font-bold">{spotlightItem.title || spotlightItem.name}</h2>
                <p className="text-gray-200 line-clamp-3">{spotlightItem.overview}</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {/* Watch Now with first streaming logo */}
                  <Button
                    onClick={() => handleWatchNow(spotlightItem as NormalizedMedia)}
                    className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                  >
                    ▶ Watch Now
                    {spotlightItem.streaming?.[0]?.logo_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w45${spotlightItem.streaming[0].logo_path}`}
                        alt={spotlightItem.streaming[0].provider_name}
                        className="w-5 h-5 object-contain rounded-sm bg-white p-0.5"
                      />
                    )}
                  </Button>
                  <Button
                    onClick={() => handleWatchTrailer(spotlightItem as NormalizedMedia)}
                    variant="outline"
                    className="text-white border-white hover:bg-white/10"
                  >
                    🎬 Trailer
                  </Button>
                  <Button
                    onClick={() => handleAddToWatchlist(spotlightItem as NormalizedMedia)}
                    variant="ghost"
                    className="text-white border border-white hover:bg-white/10"
                  >
                    + My List
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* For You */}
        <Section title="For You">
          {personalizedLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {filteredRecommendations.map((media) => (
                <UniversalMediaCard
                  key={media.id}
                  media={media}
                  variant="vertical-polished"
                  size="sm"
                  showRating
                  actions={{ watchNow: true, trailer: true, addToList: true }}
                  moveButtonsToBottom
                  onAddToWatchlist={handleAddToWatchlist}
                  onWatchNow={handleWatchNow}
                  onWatchTrailer={handleWatchTrailer}
                />
              ))}
            </div>
          )}
        </Section>

        {/* Continue Watching */}
        <Section title="Continue Watching">
          <ContinueWatching limit={10} />
        </Section>
      </main>

      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            toastType === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {toastMessage}
        </div>
      )}

      <BuildInfoBadge className="fixed bottom-3 right-3 opacity-80 hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default DashboardPage;
