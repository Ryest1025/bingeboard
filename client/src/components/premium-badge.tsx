import { Crown, Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PremiumBadgeProps {
  type?: "premium" | "pro" | "vip";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export default function PremiumBadge({ 
  type = "premium", 
  size = "default",
  className = "" 
}: PremiumBadgeProps) {
  const configs = {
    premium: {
      icon: Crown,
      text: "Premium",
      className: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0"
    },
    pro: {
      icon: Star,
      text: "Pro",
      className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
    },
    vip: {
      icon: Zap,
      text: "VIP",
      className: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0"
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <Badge 
      variant="secondary" 
      className={`${config.className} ${className} gap-1 font-medium`}
    >
      <Icon className={`${size === "sm" ? "w-3 h-3" : "w-4 h-4"}`} />
      {config.text}
    </Badge>
  );
}

export function PremiumFeatureBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <div className="absolute -top-1 -right-1">
        <PremiumBadge type="premium" size="sm" />
      </div>
    </div>
  );
}