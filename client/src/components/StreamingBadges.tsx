import { Badge } from '@/components/ui/badge';

interface StreamingBadgesProps {
  platforms?: { provider_name: string; logo_path?: string }[];
  maxShow?: number;
}

// Helper to map provider names to colors
const PLATFORM_COLORS: Record<string, string> = {
  Netflix: 'bg-red-600',
  Hulu: 'bg-green-600',
  'Prime Video': 'bg-blue-600',
  'Amazon Prime Video': 'bg-blue-600',
  'Disney Plus': 'bg-blue-400',
  'Disney+': 'bg-blue-400',
  'HBO Max': 'bg-purple-600',
  'HBO': 'bg-purple-600',
  'Apple TV Plus': 'bg-gray-800',
  'Apple TV+': 'bg-gray-800',
  'Paramount Plus': 'bg-blue-700',
  'Paramount+': 'bg-blue-700',
  'Peacock': 'bg-yellow-600',
  'Crunchyroll': 'bg-orange-500',
  'Funimation': 'bg-purple-700',
  'Starz': 'bg-black',
  'Showtime': 'bg-red-700',
  'Cinemax': 'bg-yellow-700'
};

const getPlatformColor = (providerName: string) => PLATFORM_COLORS[providerName] || 'bg-slate-600';

export const StreamingBadges = ({ platforms, maxShow = 3 }: StreamingBadgesProps) => {
  if (!platforms || platforms.length === 0) return null;

  const visiblePlatforms = platforms.slice(0, maxShow);
  const remainingCount = platforms.length - maxShow;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visiblePlatforms.map((platform, index) => (
        <Badge
          key={index}
          className={`text-xs px-2 py-1 ${getPlatformColor(platform.provider_name)} text-white`}
        >
          {platform.provider_name}
        </Badge>
      ))}

      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs px-2 py-1 border-slate-600 text-slate-400">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
};