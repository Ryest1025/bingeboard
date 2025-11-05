import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SocialBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  earnedAt?: string;
}

interface SocialBadgesProps {
  badges: SocialBadge[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function SocialBadges({ badges, maxDisplay = 5, size = 'md' }: SocialBadgesProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = Math.max(0, badges.length - maxDisplay);

  const sizeClasses = {
    sm: 'h-6 px-2 text-xs',
    md: 'h-8 px-3 text-sm',
    lg: 'h-10 px-4 text-base'
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 flex-wrap">
        {displayBadges.map((badge, idx) => (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Badge
                  className={`${sizeClasses[size]} ${badge.color} bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all cursor-pointer`}
                >
                  <span className={iconSizes[size]}>{badge.icon}</span>
                  <span className="ml-1.5 font-medium">{badge.name}</span>
                </Badge>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-slate-900 border-slate-800 text-white max-w-xs">
              <div className="space-y-1">
                <p className="font-semibold flex items-center gap-2">
                  <span className="text-lg">{badge.icon}</span>
                  {badge.name}
                </p>
                <p className="text-slate-400 text-xs">{badge.description}</p>
                {badge.earnedAt && (
                  <p className="text-slate-500 text-xs">Earned {badge.earnedAt}</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                className={`${sizeClasses[size]} bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 transition-all cursor-pointer`}
              >
                <Award className="h-4 w-4 mr-1" />
                +{remainingCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-slate-900 border-slate-800 text-white">
              <p className="text-sm">View all {badges.length} badges</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

// Badge Grid for profile modal
export function SocialBadgeGrid({ badges }: { badges: SocialBadge[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {badges.map((badge, idx) => (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-cyan-500/50 transition-all group cursor-pointer"
        >
          <div className="text-center space-y-2">
            <div className="text-4xl group-hover:scale-110 transition-transform">
              {badge.icon}
            </div>
            <div>
              <p className={`font-semibold ${badge.color} text-sm`}>{badge.name}</p>
              <p className="text-slate-400 text-xs mt-1">{badge.description}</p>
              {badge.earnedAt && (
                <p className="text-slate-500 text-xs mt-1">Earned {badge.earnedAt}</p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
