import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Play, ExternalLink, ChevronDown, Video } from "lucide-react";
import { TrailerWithAds } from "@/components/ad-player";
import PremiumFeatureGate from "@/components/premium-feature-gate";
import { useAuth } from "@/hooks/useAuth";
import {
  openStreamingApp,
  getPrimaryStreamingPlatform,
  getAllAvailablePlatforms,
  getWatchNowText,
  getShortButtonText,
  getPlatformDirectUrl
} from "@/lib/streamingUtils";
import {
  getBestTrailer,
  getYouTubeEmbedUrl,
  trackTrailerView,
  hasTrailer
} from "@/lib/trailerUtils";
import {
  openAffiliateLink,
  hasAffiliateSupport,
  getAffiliateCTA
} from "@/lib/affiliateUtils";

interface StreamingPlatform {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface WatchNowButtonProps {
  show: {
    title: string;
    tmdbId?: number;
    streamingPlatforms?: StreamingPlatform[];
  };
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export default function WatchNowButton({
  show,
  variant = "default",
  size = "default",
  className = ""
}: WatchNowButtonProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [trailerData, setTrailerData] = useState<any>(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const { user } = useAuth();

  // Check if user has premium plan for ad-free trailers
  const userPlan = user?.subscription?.plan || "free";
  const hasAdFreeTrailers = userPlan === "plus" || userPlan === "premium";

  // Load trailer data when modal opens
  const handleTrailerClick = async () => {
    setLoadingTrailer(true);
    try {
      const trailer = await getBestTrailer(show.tmdbId || show.id, 'tv');
      setTrailerData(trailer);
      if (trailer) {
        setShowTrailerModal(true);
        // Track trailer view
        if (user) {
          await trackTrailerView(
            show.tmdbId || show.id,
            trailer.key,
            user.id,
            show.title,
            !hasAdFreeTrailers
          );
        }
      }
    } catch (error) {
      console.error('Error loading trailer:', error);
    } finally {
      setLoadingTrailer(false);
    }
  };

  const platforms = getAllAvailablePlatforms(show.streamingPlatforms || []);
  const primaryPlatform = getPrimaryStreamingPlatform(platforms);

  // If no streaming platforms available, don't show the button
  if (!platforms || platforms.length === 0) {
    return null;
  }

  // Single platform - direct watch button
  if (platforms.length === 1 && primaryPlatform) {
    return (
      <Button
        variant={variant}
        size={size}
        className={`flex items-center gap-2 ${className}`}
        onClick={() => {
          if (user && hasAffiliateSupport(primaryPlatform.provider_name)) {
            openAffiliateLink(primaryPlatform.provider_name, user.id, show.tmdbId || show.id, show.title);
          } else {
            openStreamingApp(primaryPlatform.provider_name, show.title, show.tmdbId);
          }
        }}
        title={getWatchNowText(primaryPlatform.provider_name)}
      >
        <Play className="h-4 w-4" />
        {getShortButtonText(primaryPlatform.provider_name)}
        <ExternalLink className="h-3 w-3 opacity-70" />
      </Button>
    );
  }

  // Multiple platforms - dropdown menu
  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`flex items-center gap-2 ${className}`}
        >
          <Play className="h-4 w-4" />
          Watch Now
          <ChevronDown className="h-3 w-3 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {primaryPlatform && (
          <>
            <DropdownMenuItem
              onClick={() => {
                if (user && hasAffiliateSupport(primaryPlatform.provider_name)) {
                  openAffiliateLink(primaryPlatform.provider_name, user.id, show.tmdbId || show.id, show.title);
                } else {
                  openStreamingApp(primaryPlatform.provider_name, show.title, show.tmdbId);
                }
                setIsDropdownOpen(false);
              }}
              className="flex items-center gap-3 p-3"
            >
              {primaryPlatform.logo_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w45${primaryPlatform.logo_path}`}
                  alt={primaryPlatform.provider_name}
                  className="w-6 h-6 rounded"
                  onError={(e) => {
                    // Replace with platform icon when image fails
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary"
                style={{ display: primaryPlatform.logo_path ? 'none' : 'flex' }}
              >
                {primaryPlatform.provider_name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-medium">{getWatchNowText(primaryPlatform.provider_name)}</span>
                <span className="text-xs text-muted-foreground">Recommended</span>
              </div>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </DropdownMenuItem>
            {platforms.length > 1 && <DropdownMenuSeparator />}
          </>
        )}

        {/* Watch Trailer Option */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleTrailerClick}
          disabled={loadingTrailer}
          className="flex items-center gap-3 p-3"
        >
          <Video className="w-6 h-6 text-blue-500" />
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {loadingTrailer ? "Loading..." : "Watch Trailer"}
              </span>
              {/* Premium indicator for ad-free trailers */}
              <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600">
                {hasAdFreeTrailers ? "Ad-Free" : "With Ads"}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              {hasAdFreeTrailers ? "Premium: Instant access" : "Free: Preview with ads"}
            </span>
          </div>
        </DropdownMenuItem>

        {platforms
          .filter(platform => platform.provider_id !== primaryPlatform?.provider_id)
          .map((platform) => (
            <DropdownMenuItem
              key={platform.provider_id}
              onClick={() => {
                if (user && hasAffiliateSupport(platform.provider_name)) {
                  openAffiliateLink(platform.provider_name, user.id, show.tmdbId || show.id, show.title);
                } else {
                  openStreamingApp(platform.provider_name, show.title, show.tmdbId);
                }
                setIsDropdownOpen(false);
              }}
              className="flex items-center gap-3 p-3"
            >
              <img
                src={`https://image.tmdb.org/t/p/w45${platform.logo_path}`}
                alt={platform.provider_name}
                className="w-6 h-6 rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="flex-1">{getWatchNowText(platform.provider_name)}</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </DropdownMenuItem>
          ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            // Use Netflix as fallback platform for "Find other sources"
            const fallbackUrl = getPlatformDirectUrl('Netflix', show.title);
            window.open(fallbackUrl, '_blank');
            setIsDropdownOpen(false);
          }}
          className="flex items-center gap-3 p-3 text-muted-foreground"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Search on Netflix</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Trailer Modal with Ads */}
      <Dialog open={showTrailerModal} onOpenChange={setShowTrailerModal}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Watch Trailer: {show.title}</DialogTitle>
            <DialogDescription>
              Enjoy this preview trailer for {show.title}
            </DialogDescription>
          </DialogHeader>

          {!trailerData ? (
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No trailer available</p>
              </div>
            </div>
          ) : hasAdFreeTrailers ? (
            // Premium users get ad-free trailers
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-500 text-white">
                  Premium: Ad-Free Trailer
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Enjoying your Plus/Premium experience!
                </div>
              </div>
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                <iframe
                  width="100%"
                  height="100%"
                  src={getYouTubeEmbedUrl(trailerData.key, true)}
                  title={`${show.title} Trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                />
              </div>
            </div>
          ) : (
            // Free users see ads before trailers
            <TrailerWithAds
              trailerUrl={getYouTubeEmbedUrl(trailerData.key)}
              showTitle={show.title}
            >
              {/* Actual trailer player after ad */}
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                <iframe
                  width="100%"
                  height="100%"
                  src={getYouTubeEmbedUrl(trailerData.key, true)}
                  title={`${show.title} Trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                />
              </div>
            </TrailerWithAds>
          )}
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
}

// Quick watch button for minimal UI contexts
export function QuickWatchButton({
  show,
  className = ""
}: {
  show: WatchNowButtonProps['show'];
  className?: string;
}) {
  const platforms = getAllAvailablePlatforms(show.streamingPlatforms || []);
  const primaryPlatform = getPrimaryStreamingPlatform(platforms);

  if (!primaryPlatform) return null;

  return (
    <Button
      size="sm"
      variant="secondary"
      className={`h-8 px-3 ${className}`}
      onClick={() => openStreamingApp(primaryPlatform.provider_name, show.title, show.tmdbId)}
    >
      <Play className="h-3 w-3 mr-1" />
      Watch
    </Button>
  );
}

// Platform indicator badges for show cards
export function StreamingBadges({
  platforms,
  maxShow = 3,
  showWatchButton = false,
  show
}: {
  platforms: StreamingPlatform[];
  maxShow?: number;
  showWatchButton?: boolean;
  show?: WatchNowButtonProps['show'];
}) {
  const availablePlatforms = getAllAvailablePlatforms(platforms);
  const displayPlatforms = availablePlatforms.slice(0, maxShow);
  const remainingCount = availablePlatforms.length - maxShow;

  if (availablePlatforms.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1">
        {displayPlatforms.map((platform) => (
          <div key={platform.provider_id} className="relative">
            {platform.logo_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w45${platform.logo_path}`}
                alt={platform.provider_name}
                className="w-6 h-6 rounded border border-white/10"
                title={platform.provider_name}
                onError={(e) => {
                  // Replace with platform icon when image fails
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-white/10"
              style={{ display: platform.logo_path ? 'none' : 'flex' }}
              title={platform.provider_name}
            >
              {platform.provider_name.slice(0, 2).toUpperCase()}
            </div>
          </div>
        ))}
        {remainingCount > 0 && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-6">
            +{remainingCount}
          </Badge>
        )}
      </div>

      {showWatchButton && show && (
        <QuickWatchButton show={show} />
      )}
    </div>
  );
}