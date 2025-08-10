import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, Star, X, ExternalLink, Calendar, Clock, Users, Globe, Youtube, Film, Info } from "lucide-react";
import TrailerButton from "@/components/trailer-button";
import { TrailerWithAds } from "@/components/ad-player";
import { useAuth } from "@/hooks/useAuth";
import {
  getShowTitle,
  getShowPosterUrl,
  getShowOverview,
  getShowRating,
  getStreamingPlatforms,
  getShowId
} from "@/utils/show-utils";
import { getBestTrailer, getYouTubeEmbedUrl, trackTrailerView } from "@/lib/trailerUtils";

interface Show {
  id: number;
  name?: string;
  title?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  genre_ids?: number[];
  media_type?: string;
  streaming?: any[];
  first_air_date?: string;
  release_date?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
  origin_country?: string[];
  original_language?: string;
  production_companies?: Array<{ name: string; logo_path?: string }>;
}

interface ShowDetailsModalProps {
  show: Show | null;
  open: boolean;
  onClose: () => void;
  onAddToList?: (show: Show) => void;
  onWatchNow?: (show: Show) => void;
  onWatchTrailer?: (show: Show) => void;
}

// Genre mapping for display
const GENRE_MAP: { [key: number]: string } = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics"
};

export default function ShowDetailsModal({
  show,
  open,
  onClose,
  onAddToList,
  onWatchNow,
  onWatchTrailer
}: ShowDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'trailer'>('details');
  const [trailerData, setTrailerData] = useState<any>(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const { user } = useAuth();

  if (!show) return null;

  const title = getShowTitle(show);
  const poster = getShowPosterUrl(show);
  const overview = getShowOverview(show);
  const rating = getShowRating(show);
  const streamingPlatforms = getStreamingPlatforms(show);
  const showId = getShowId(show);

  // Check if user has premium plan for ad-free trailers
  const userPlan = user?.subscription?.plan || "free";
  const hasAdFreeTrailers = userPlan === "plus" || userPlan === "premium";

  // Fetch trailer data when modal opens or trailer tab is selected
  useEffect(() => {
    if (open && activeTab === 'trailer' && !trailerData && !loadingTrailer) {
      fetchTrailer();
    }
  }, [open, activeTab, showId]);

  const fetchTrailer = async () => {
    if (!showId) return;

    setLoadingTrailer(true);
    try {
      const trailer = await getBestTrailer(showId, 'tv');

      if (trailer) {
        setTrailerData({
          key: trailer.key,
          url: getYouTubeEmbedUrl(trailer.key, true),
          name: trailer.name
        });

        // Track trailer view
        if (user) {
          await trackTrailerView(
            showId,
            trailer.key,
            user.id || user.uid,
            title,
            !hasAdFreeTrailers
          );
        }
      }
    } catch (error) {
      console.error('Failed to fetch trailer:', error);
    } finally {
      setLoadingTrailer(false);
    }
  };

  const handleWatchNow = () => {
    if (onWatchNow) {
      onWatchNow(show);
    }
  };

  const handleAddToList = () => {
    if (onAddToList) {
      onAddToList(show);
    }
  };

  const handleWatchTrailer = () => {
    setActiveTab('trailer');
    if (!trailerData && !loadingTrailer) {
      fetchTrailer();
    }
  };

  // Format release date
  const releaseDate = show.first_air_date || show.release_date;
  const formattedDate = releaseDate ? new Date(releaseDate).getFullYear() : null;

  // Format runtime
  const runtime = show.episode_run_time?.[0];
  const formattedRuntime = runtime ? `${runtime}min` : null;

  // Get genres
  const genres = show.genre_ids?.map(id => GENRE_MAP[id]).filter(Boolean) || [];

  // Get country
  const country = show.origin_country?.[0];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-slate-900 text-white border border-slate-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">{title}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg w-fit">
            <Button
              variant={activeTab === 'details' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('details')}
              className={activeTab === 'details'
                ? "bg-slate-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-slate-700"
              }
            >
              <Info className="w-4 h-4 mr-2" />
              Details
            </Button>
            <Button
              variant={activeTab === 'trailer' ? 'default' : 'ghost'}
              size="sm"
              onClick={handleWatchTrailer}
              className={activeTab === 'trailer'
                ? "bg-slate-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-slate-700"
              }
            >
              <Youtube className="w-4 h-4 mr-2" />
              Trailer
            </Button>
          </div>
        </DialogHeader>

        {activeTab === 'details' ? (
          // Details Tab Content
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Poster */}
            <div className="lg:w-1/3">
              <img
                src={poster || "/placeholder.jpg"}
                alt={title}
                className="w-full rounded-lg object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4 lg:w-2/3">
              {/* Basic Info */}
              <div className="flex items-center gap-4 flex-wrap">
                {formattedDate && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formattedDate}</span>
                  </div>
                )}

                {formattedRuntime && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{formattedRuntime}</span>
                  </div>
                )}

                {show.number_of_seasons && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{show.number_of_seasons} Season{show.number_of_seasons > 1 ? 's' : ''}</span>
                  </div>
                )}

                {country && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <Globe className="w-4 h-4" />
                    <span>{country}</span>
                  </div>
                )}
              </div>

              {/* Rating */}
              {rating && (
                <div className="flex items-center gap-2 text-yellow-400 text-lg">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">{rating}</span>
                  <span className="text-gray-400 text-sm">/10</span>
                </div>
              )}

              {/* Genres */}
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre, index) => (
                    <Badge key={index} variant="secondary" className="bg-slate-700 text-white">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Overview */}
              <p className="text-gray-300 text-sm leading-relaxed">
                {overview || "No description available"}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  onClick={handleWatchNow}
                >
                  <Play className="w-4 h-4 mr-2" /> Watch Now
                </Button>

                <Button
                  variant="outline"
                  className="border-slate-600 text-white hover:border-slate-400 hover:bg-slate-800"
                  onClick={handleAddToList}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add to Watch Later
                </Button>

                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:bg-slate-800"
                  onClick={handleWatchTrailer}
                >
                  <Youtube className="w-4 h-4 mr-2" /> Watch Trailer
                </Button>
              </div>

              {/* Streaming Platforms */}
              {streamingPlatforms && streamingPlatforms.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-medium text-gray-300">Available on:</span>
                  <div className="flex gap-2 flex-wrap">
                    {streamingPlatforms.slice(0, 8).map((platform: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 hover:bg-slate-700 transition-colors cursor-pointer"
                        onClick={() => handleWatchNow()}
                        title={`Watch on ${platform.provider_name}`}
                      >
                        {platform.logo_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/w45${platform.logo_path}`}
                            alt={platform.provider_name}
                            className="w-5 h-5 rounded"
                          />
                        )}
                        <span className="text-xs text-gray-300">{platform.provider_name}</span>
                        <ExternalLink className="w-3 h-3 text-gray-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Production Info */}
              {show.production_companies && show.production_companies.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-300">Production:</span>
                  <div className="flex flex-wrap gap-2">
                    {show.production_companies.slice(0, 3).map((company, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                        {company.logo_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/w45${company.logo_path}`}
                            alt={company.name}
                            className="w-4 h-4 rounded"
                          />
                        )}
                        <span>{company.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Trailer Tab Content
          <div className="space-y-4">
            {loadingTrailer ? (
              <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-400">Loading trailer...</p>
                </div>
              </div>
            ) : trailerData ? (
              <div className="space-y-4">
                {hasAdFreeTrailers ? (
                  // Premium users get ad-free trailers
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-500 text-white">
                        Premium: Ad-Free Trailer
                      </Badge>
                      <div className="text-sm text-gray-400">
                        Enjoying your {userPlan} experience!
                      </div>
                    </div>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        width="100%"
                        height="100%"
                        src={trailerData.url}
                        title={`${title} - Trailer`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                ) : (
                  // Free users see ads before trailers
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline" className="border-orange-500 text-orange-400">
                        Free Plan: Ad-Supported
                      </Badge>
                      <div className="text-gray-400">
                        Upgrade to Plus/Premium for ad-free trailers
                      </div>
                    </div>
                    <TrailerWithAds
                      trailerUrl={trailerData.url}
                      showTitle={title}
                    >
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <iframe
                          width="100%"
                          height="100%"
                          src={trailerData.url}
                          title={`${title} - Trailer`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    </TrailerWithAds>
                  </div>
                )}

                {/* Action buttons below trailer */}
                <div className="flex items-center gap-3 justify-center">
                  <Button
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    onClick={handleWatchNow}
                  >
                    <Play className="w-4 h-4 mr-2" /> Watch Now
                  </Button>

                  <Button
                    variant="outline"
                    className="border-slate-600 text-white hover:border-slate-400 hover:bg-slate-800"
                    onClick={handleAddToList}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add to Watch Later
                  </Button>

                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white hover:bg-slate-800"
                    onClick={() => setActiveTab('details')}
                  >
                    <Info className="w-4 h-4 mr-2" /> View Details
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Film className="w-12 h-12 text-gray-500" />
                  <p className="text-gray-400">No trailer available for this show</p>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-white hover:border-slate-400"
                    onClick={() => setActiveTab('details')}
                  >
                    <Info className="w-4 h-4 mr-2" /> View Details Instead
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
