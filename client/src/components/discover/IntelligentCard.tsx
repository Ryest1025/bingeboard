import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Clock, 
  Eye, 
  ThumbsUp, 
  Users, 
  Zap,
  Info,
  Play,
  Plus,
  Heart,
  TrendingUp,
  Award,
  Target,
  Sparkles,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import UniversalMediaCard from '@/components/universal/UniversalMediaCard';

interface IntelligentCardProps {
  media: any; // Using the existing MediaItem interface
  matchPercentage?: number;
  reasonForRecommendation?: string;
  viewingInsight?: string;
  contextualInfo?: string;
  similarViewers?: string;
  watchTimeEstimate?: string;
  trendingRank?: number;
  leavesSoon?: boolean;
  friendsWatching?: number;
  isUpcoming?: boolean;
  releaseDate?: string;
  onCardClick?: (media: any) => void;
  onWatchNow?: (media: any) => void;
  onAddToWatchlist?: (media: any) => void;
  onWatchTrailer?: (media: any) => void;
  onShowInfo?: (media: any) => void;
  className?: string;
}

export const IntelligentCard: React.FC<IntelligentCardProps> = ({
  media,
  matchPercentage,
  reasonForRecommendation,
  viewingInsight,
  contextualInfo,
  similarViewers,
  watchTimeEstimate,
  trendingRank,
  leavesSoon,
  friendsWatching,
  isUpcoming,
  releaseDate,
  onCardClick,
  onWatchNow,
  onAddToWatchlist,
  onWatchTrailer,
  onShowInfo,
  className = ''
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);

  const getMatchColor = (percentage?: number) => {
    if (!percentage) return 'text-gray-400';
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 75) return 'text-blue-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getMatchIcon = (percentage?: number) => {
    if (!percentage) return <Star className="w-3 h-3" />;
    if (percentage >= 90) return <Zap className="w-3 h-3" />;
    if (percentage >= 75) return <Target className="w-3 h-3" />;
    return <Star className="w-3 h-3" />;
  };

  return (
    <motion.div
      className={`relative group ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Enhanced Glow Effect */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"
        animate={{
          background: isHovered 
            ? "linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))"
            : "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))"
        }}
      />

      <div className="relative">
        {/* Enhanced Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          {/* Match Percentage */}
          {matchPercentage && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Badge 
                variant="secondary" 
                className={`${getMatchColor(matchPercentage)} bg-black/80 backdrop-blur-md border-white/20 px-2 py-1 text-xs font-semibold`}
              >
                {getMatchIcon(matchPercentage)}
                <span className="ml-1">{matchPercentage}% Match</span>
              </Badge>
            </motion.div>
          )}

          {/* Trending Badge */}
          {trendingRank && trendingRank <= 10 && (
            <Badge variant="secondary" className="bg-red-600/80 text-white border-red-500/30 px-2 py-1 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              #{trendingRank} Trending
            </Badge>
          )}

          {/* Leaving Soon Badge */}
          {leavesSoon && (
            <Badge variant="secondary" className="bg-orange-600/80 text-white border-orange-500/30 px-2 py-1 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Leaving Soon
            </Badge>
          )}
        </div>

        {/* Friends Watching Badge */}
        {friendsWatching && friendsWatching > 0 && (
          <div className="absolute top-3 right-3 z-20">
            <Badge variant="secondary" className="bg-indigo-600/80 text-white border-indigo-500/30 px-2 py-1 text-xs">
              <Users className="w-3 h-3 mr-1" />
              {friendsWatching} friends
            </Badge>
          </div>
        )}

        {/* Main Card */}
        <UniversalMediaCard
          media={media}
          variant="vertical-polished"
          size="md"
          className="h-full transition-all duration-300 group-hover:shadow-2xl"
          showStreamingLogos={true}
          showRating={true}
          showGenres={false}
          showReleaseDate={true}
          showDescription={false}
          moveButtonsToBottom={true}
          showStreamingLogoInButton={false}
          onCardClick={onCardClick}
          onWatchNow={onWatchNow}
          onWatchTrailer={onWatchTrailer}
          onAddToWatchlist={onAddToWatchlist}
        />

        {/* Enhanced Hover Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent rounded-b-2xl p-4 z-10"
            >
              {/* Intelligent Insights */}
              <div className="space-y-2 text-white">
                {/* Watch Time Estimate */}
                {watchTimeEstimate && (
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Clock className="w-3 h-3" />
                    <span>{watchTimeEstimate} to complete</span>
                  </div>
                )}

                {/* Similar Viewers */}
                {similarViewers && (
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Eye className="w-3 h-3" />
                    <span>{similarViewers}</span>
                  </div>
                )}

                {/* Viewing Insight */}
                {viewingInsight && (
                  <div className="flex items-start gap-2 text-xs text-slate-300">
                    <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{viewingInsight}</span>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className={`${isUpcoming ? 'bg-purple-600 hover:bg-purple-700' : 'bg-white/90 hover:bg-white'} text-${isUpcoming ? 'white' : 'black'} text-xs px-3 py-1 h-7`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onWatchNow?.(media);
                    }}
                  >
                    {isUpcoming ? (
                      <>
                        <Bell className="w-3 h-3 mr-1" />
                        Remind Me
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Watch
                      </>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-white/30 text-white hover:bg-white/10 text-xs px-3 py-1 h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToWatchlist?.(media);
                    }}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-white/30 text-white hover:bg-white/10 text-xs px-3 py-1 h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowInfo?.(media);
                    }}
                  >
                    <Info className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Why This? Tooltip */}
        {reasonForRecommendation && (
          <div 
            className="absolute top-1/2 right-2 z-30"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0 bg-black/60 border-white/20 text-white hover:bg-black/80 rounded-full"
            >
              <Info className="w-3 h-3" />
            </Button>
            
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 10 }}
                  className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl p-3 max-w-xs z-50"
                >
                  <div className="text-xs text-white">
                    <div className="font-semibold mb-1 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-blue-400" />
                      Why this?
                    </div>
                    <p className="text-slate-300">{reasonForRecommendation}</p>
                  </div>
                  {/* Arrow */}
                  <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-black/90" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Helper function to generate intelligent card props
export const generateIntelligentProps = (media: any, category: string) => {
  const mockData = {
    matchPercentage: Math.floor(Math.random() * 30) + 70, // 70-100%
    viewingInsight: getViewingInsight(category),
    similarViewers: `${Math.floor(Math.random() * 80) + 20}% of similar viewers loved this`,
    watchTimeEstimate: getWatchTimeEstimate(media.media_type),
    reasonForRecommendation: getReasonForRecommendation(category),
    trendingRank: Math.random() > 0.7 ? Math.floor(Math.random() * 10) + 1 : undefined,
    leavesSoon: Math.random() > 0.85,
    friendsWatching: Math.random() > 0.6 ? Math.floor(Math.random() * 8) + 1 : 0,
    isUpcoming: category === 'upcoming-with-reminders',
    releaseDate: category === 'upcoming-with-reminders' ? getUpcomingReleaseDate() : undefined
  };

  return mockData;
};

const getUpcomingReleaseDate = () => {
  const dates = [
    'Oct 15, 2025',
    'Nov 3, 2025', 
    'Dec 20, 2025',
    'Jan 10, 2026',
    'Feb 14, 2026'
  ];
  return dates[Math.floor(Math.random() * dates.length)];
};

const getViewingInsight = (category: string) => {
  const insights: Record<string, string> = {
    'because-you-loved': 'Similar themes and tone to your favorites',
    'weekend-bingers': 'Perfect cliffhangers for marathon viewing',
    'award-season-winners': 'Critics and awards panels loved this',
    'quick-wins': 'Satisfying complete story in one sitting',
    'sports-live-events': 'Live action you can\'t watch later',
    'upcoming-with-reminders': 'Highly anticipated by fans like you',
    'friends-are-watching': 'Your friends are talking about this',
    'educational-entertaining': 'Learn while being entertained',
    'ai-curated-surprise': 'Our AI found this gem for you',
    'leaving-soon': 'Available for limited time'
  };
  return insights[category] || 'Recommended for you';
};

const getWatchTimeEstimate = (mediaType: string) => {
  if (mediaType === 'movie') {
    return `${Math.floor(Math.random() * 60) + 90} minutes`;
  }
  return `${Math.floor(Math.random() * 8) + 2} seasons`;
};

const getReasonForRecommendation = (category: string) => {
  const reasons: Record<string, string> = {
    'because-you-loved': 'Based on your 5-star rating of Succession and similar shows in your watchlist',
    'weekend-bingers': 'You tend to watch 3+ episodes in a session on weekends',
    'award-season-winners': 'Award-winning content aligns with your quality preferences',
    'quick-wins': 'Matches your preference for complete stories under 2 hours',
    'sports-live-events': 'Live content based on your sports interests and activity',
    'upcoming-with-reminders': 'Content matching your wishlisted genres and interests',
    'friends-are-watching': 'Multiple friends in your network are currently watching',
    'educational-entertaining': 'Balances learning with entertainment like your documentary history',
    'ai-curated-surprise': 'Advanced algorithm detected perfect match for your unique taste',
    'leaving-soon': 'High-quality content expiring from platforms soon'
  };
  return reasons[category] || 'Personalized recommendation based on your viewing history';
};

export default IntelligentCard;