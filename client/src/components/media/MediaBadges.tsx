/**
 * Media Display Components
 * 
 * Provides consistent UI components for displaying media metadata like
 * type badges, live indicators, and next match times.
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Radio, Trophy, Calendar, Star } from 'lucide-react';
import { NormalizedMedia, MediaType } from '@/types/media';
import { cn } from '@/lib/utils';

interface MediaTypeBadgeProps {
  type: MediaType;
  className?: string;
}

export const MediaTypeBadge: React.FC<MediaTypeBadgeProps> = ({ type, className }) => {
  const variants = {
    movie: { 
      variant: 'secondary' as const, 
      className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      icon: null 
    },
    tv: { 
      variant: 'secondary' as const, 
      className: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      icon: null 
    },
    sports: { 
      variant: 'secondary' as const, 
      className: 'bg-green-500/20 text-green-400 border-green-500/30',
      icon: <Trophy className="w-3 h-3 mr-1" /> 
    }
  };

  const config = variants[type];
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.icon}
      {type.toUpperCase()}
    </Badge>
  );
};

interface LiveBadgeProps {
  isLive: boolean;
  className?: string;
}

export const LiveBadge: React.FC<LiveBadgeProps> = ({ isLive, className }) => {
  if (!isLive) return null;
  
  return (
    <Badge 
      variant="destructive"
      className={cn(
        'bg-red-500 text-white border-red-500 animate-pulse',
        className
      )}
    >
      <Radio className="w-3 h-3 mr-1" />
      LIVE
    </Badge>
  );
};

interface NextMatchIndicatorProps {
  nextMatchTime: Date | null;
  className?: string;
}

export const NextMatchIndicator: React.FC<NextMatchIndicatorProps> = ({ 
  nextMatchTime, 
  className 
}) => {
  if (!nextMatchTime) return null;
  
  const formatNextMatch = (date: Date): string => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `in ${diffDays}d`;
    } else if (diffHours > 0) {
      return `in ${diffHours}h`;
    } else if (diffMinutes > 0) {
      return `in ${diffMinutes}m`;
    } else {
      return 'starting soon';
    }
  };
  
  return (
    <div className={cn(
      'flex items-center text-xs text-slate-400 mt-1',
      className
    )}>
      <Clock className="w-3 h-3 mr-1" />
      Next: {formatNextMatch(nextMatchTime)}
    </div>
  );
};

interface AwardBadgeProps {
  isWinner: boolean;
  isNominated: boolean;
  className?: string;
}

export const AwardBadge: React.FC<AwardBadgeProps> = ({ 
  isWinner, 
  isNominated, 
  className 
}) => {
  if (!isWinner && !isNominated) return null;
  
  return (
    <Badge 
      variant={isWinner ? 'default' : 'secondary'}
      className={cn(
        isWinner 
          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
          : 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        className
      )}
    >
      <Trophy className="w-3 h-3 mr-1" />
      {isWinner ? 'WINNER' : 'NOMINATED'}
    </Badge>
  );
};

interface UpcomingBadgeProps {
  isUpcoming: boolean;
  releaseDate?: string;
  className?: string;
}

export const UpcomingBadge: React.FC<UpcomingBadgeProps> = ({ 
  isUpcoming, 
  releaseDate,
  className 
}) => {
  if (!isUpcoming) return null;
  
  const formatReleaseDate = (dateString?: string): string => {
    if (!dateString) return 'Coming Soon';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays > 30) {
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else if (diffDays > 0) {
        return `in ${diffDays} days`;
      } else {
        return 'Coming Soon';
      }
    } catch {
      return 'Coming Soon';
    }
  };
  
  return (
    <Badge 
      variant="outline"
      className={cn(
        'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        className
      )}
    >
      <Calendar className="w-3 h-3 mr-1" />
      {formatReleaseDate(releaseDate)}
    </Badge>
  );
};

interface StreamingCountBadgeProps {
  count: number;
  platforms?: string[];
  className?: string;
}

export const StreamingCountBadge: React.FC<StreamingCountBadgeProps> = ({ 
  count, 
  platforms = [],
  className 
}) => {
  if (count === 0) return null;
  
  const displayText = count === 1 
    ? `1 platform` 
    : `${count} platforms`;
  
  const title = platforms.length > 0 
    ? `Available on: ${platforms.slice(0, 3).join(', ')}${platforms.length > 3 ? '...' : ''}`
    : undefined;
  
  return (
    <Badge 
      variant="outline"
      className={cn(
        'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        className
      )}
      title={title}
    >
      {displayText}
    </Badge>
  );
};

interface RatingBadgeProps {
  rating: number;
  className?: string;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({ rating, className }) => {
  if (rating === 0) return null;
  
  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-400 border-green-500/30 bg-green-500/20';
    if (rating >= 7) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/20';
    if (rating >= 6) return 'text-orange-400 border-orange-500/30 bg-orange-500/20';
    return 'text-red-400 border-red-500/30 bg-red-500/20';
  };
  
  return (
    <Badge 
      variant="outline"
      className={cn(
        getRatingColor(rating),
        className
      )}
    >
      <Star className="w-3 h-3 mr-1 fill-current" />
      {rating.toFixed(1)}
    </Badge>
  );
};

interface MediaBadgeGroupProps {
  media: NormalizedMedia;
  showType?: boolean;
  showLive?: boolean;
  showAwards?: boolean;
  showUpcoming?: boolean;
  showStreaming?: boolean;
  showRating?: boolean;
  showNextMatch?: boolean;
  className?: string;
}

export const MediaBadgeGroup: React.FC<MediaBadgeGroupProps> = ({
  media,
  showType = true,
  showLive = true,
  showAwards = true,
  showUpcoming = true,
  showStreaming = true,
  showRating = false,
  showNextMatch = true,
  className
}) => {
  return (
    <div className={cn('flex flex-wrap gap-1 items-center', className)}>
      {showType && <MediaTypeBadge type={media.type} />}
      
      {showLive && <LiveBadge isLive={media.isLive} />}
      
      {showAwards && (
        <AwardBadge 
          isWinner={media.isAwardWinner} 
          isNominated={media.isAwardNominated} 
        />
      )}
      
      {showUpcoming && (
        <UpcomingBadge 
          isUpcoming={media.isUpcoming}
          releaseDate={media.release_date || media.first_air_date}
        />
      )}
      
      {showStreaming && (
        <StreamingCountBadge 
          count={media.streaming_count}
          platforms={media.normalizedProviders}
        />
      )}
      
      {showRating && media.vote_average && (
        <RatingBadge rating={media.vote_average} />
      )}
      
      {showNextMatch && (
        <NextMatchIndicator nextMatchTime={media.nextMatchTime} />
      )}
    </div>
  );
};

interface CompactMediaInfoProps {
  media: NormalizedMedia;
  className?: string;
}

export const CompactMediaInfo: React.FC<CompactMediaInfoProps> = ({ 
  media, 
  className 
}) => {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <MediaTypeBadge type={media.type} />
        {media.vote_average && media.vote_average > 0 && <RatingBadge rating={media.vote_average} />}
      </div>
      
      <div className="flex flex-wrap gap-1">
        <LiveBadge isLive={media.isLive} />
        <AwardBadge 
          isWinner={media.isAwardWinner} 
          isNominated={media.isAwardNominated} 
        />
        <UpcomingBadge 
          isUpcoming={media.isUpcoming}
          releaseDate={media.release_date || media.first_air_date}
        />
      </div>
      
      {media.streaming_count > 0 && (
        <StreamingCountBadge 
          count={media.streaming_count}
          platforms={media.normalizedProviders}
        />
      )}
      
      <NextMatchIndicator nextMatchTime={media.nextMatchTime} />
    </div>
  );
};