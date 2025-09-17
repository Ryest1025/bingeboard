// Shared styling constants for BingeBoard components
export const GRADIENTS = {
  watchlist: 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600',
  trailer: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
  premium: 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600',
  play: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
  highRating: 'bg-gradient-to-r from-yellow-500 to-orange-500',
  trending: 'bg-gradient-to-br from-purple-500 to-indigo-500',
  upcoming: 'bg-gradient-to-br from-emerald-500 to-teal-500',
  cardHover: 'bg-gradient-to-br from-slate-700 to-slate-800',
  pageBackground: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
} as const;

export const POSTER_SIZES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w154',
  md: 'w342',
  lg: 'w500',
};

export const getRatingColor = (rating: number): string => {
  if (rating >= 8.0) return 'text-emerald-400';
  if (rating >= 6.5) return 'text-yellow-400';
  if (rating >= 5.0) return 'text-orange-400';
  return 'text-red-400';
};

export const getVariantStyles = (variant: 'trending' | 'upcoming' | 'search' | 'award') => {
  switch (variant) {
    case 'trending':
      return { border: 'border-purple-500/30', shadow: 'shadow-purple-500/10', title: 'text-xl' };
    case 'upcoming':
      return { border: 'border-emerald-500/30', shadow: 'shadow-emerald-500/10', title: 'text-lg' };
    case 'search':
      return { border: 'border-teal-500/30', shadow: 'shadow-teal-500/10', title: 'text-base' };
    case 'award':
      return { border: 'border-yellow-500/30', shadow: 'shadow-yellow-500/10', title: 'text-lg' };
    default:
      return { border: 'border-slate-600', shadow: 'shadow-slate-500/10', title: 'text-base' };
  }
};

export const getDaysUntilRelease = (releaseDate: string): number => {
  const release = new Date(releaseDate);
  const today = new Date();
  const diffTime = release.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getPlatformColor = (providerName: string): string => {
  const colors: Record<string, string> = {
    Netflix: 'bg-red-600',
    Hulu: 'bg-green-600',
    'Prime Video': 'bg-blue-600',
    'Disney+': 'bg-blue-400',
    'HBO Max': 'bg-purple-600',
    'Apple TV+': 'bg-gray-800',
  };
  return colors[providerName] || 'bg-slate-600';
};

// Award season detection and styling
export const isAwardSeason = (date: Date): boolean => {
  const month = date.getMonth() + 1; // 1-12
  // Award season is typically January-March (Oscars, Emmys, Golden Globes)
  return month >= 1 && month <= 3;
};

export const getAwardBadgeStyles = (isWinner: boolean = false) => {
  if (isWinner) {
    return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg';
  }
  return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white border border-gray-500';
};

export const AWARD_GRADIENTS = {
  winner: 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500',
  nominee: 'bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800',
  seasonal: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600',
} as const;
