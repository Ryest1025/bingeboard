import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Crown, Lock, Sparkles, Star, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

interface PremiumFeatureGateProps {
  feature: string;
  requiredPlan: "plus" | "premium";
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

interface PremiumFeatureInfo {
  title: string;
  description: string;
  benefits: string[];
  icon: React.ComponentType<any>;
  color: string;
}

const PREMIUM_FEATURES: Record<string, PremiumFeatureInfo> = {
  "ad-free-trailers": {
    title: "Ad-Free Trailers",
    description: "Watch trailers instantly without ads",
    benefits: ["Skip all video ads", "Instant trailer access", "Better viewing experience"],
    icon: Sparkles,
    color: "text-blue-500"
  },
  "unlimited-tracking": {
    title: "Unlimited Show Tracking",
    description: "Track as many shows as you want",
    benefits: ["No 25-show limit", "Unlimited watchlists", "Track entire seasons"],
    icon: Star,
    color: "text-purple-500"
  },
  "advanced-analytics": {
    title: "Advanced Analytics",
    description: "Detailed insights into your viewing habits",
    benefits: ["Viewing time statistics", "Genre preferences", "Binge streak tracking", "Monthly reports"],
    icon: Zap,
    color: "text-green-500"
  },
  "premium-recommendations": {
    title: "AI-Powered Recommendations",
    description: "Get personalized suggestions based on advanced algorithms",
    benefits: ["AI-driven suggestions", "Deep learning analysis", "Seasonal recommendations", "Friend-based discovery"],
    icon: Crown,
    color: "text-gold-500"
  },
  "custom-lists": {
    title: "Custom Lists & Tags",
    description: "Create unlimited custom lists with tags",
    benefits: ["Unlimited custom lists", "Tag system", "Share with friends", "List collaboration"],
    icon: Lock,
    color: "text-indigo-500"
  },
  "priority-support": {
    title: "Priority Support",
    description: "Get help faster with priority customer support",
    benefits: ["Priority response times", "Direct support channel", "Feature requests", "Beta access"],
    icon: Crown,
    color: "text-orange-500"
  },
  "data-export": {
    title: "Data Export",
    description: "Export your viewing data anytime",
    benefits: ["CSV/JSON export", "Backup your data", "Third-party integrations", "Data portability"],
    icon: Sparkles,
    color: "text-cyan-500"
  }
};

export default function PremiumFeatureGate({ 
  feature, 
  requiredPlan, 
  children, 
  fallback,
  className = ""
}: PremiumFeatureGateProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  
  // Mock user plan check - replace with actual subscription logic
  const userPlan = user?.subscription?.plan || "free";
  const hasAccess = userPlan === requiredPlan || (requiredPlan === "plus" && userPlan === "premium");
  
  const featureInfo = PREMIUM_FEATURES[feature];
  
  if (hasAccess) {
    return <>{children}</>;
  }

  const upgradeContent = (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800`}>
          <featureInfo.icon className={`h-5 w-5 ${featureInfo.color}`} />
        </div>
        <div>
          <h3 className="font-semibold">{featureInfo.title}</h3>
          <p className="text-sm text-muted-foreground">{featureInfo.description}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium">This premium feature includes:</h4>
        <ul className="space-y-1">
          {featureInfo.benefits.map((benefit, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <div className="w-1 h-1 bg-primary rounded-full" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex gap-2">
        <Button 
          className="flex-1" 
          onClick={() => setLocation("/subscription-pricing")}
        >
          <Crown className="h-4 w-4 mr-2" />
          Upgrade to {requiredPlan === "plus" ? "Plus" : "Premium"}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setShowUpgradeDialog(false)}
        >
          Maybe Later
        </Button>
      </div>
    </div>
  );

  if (fallback) {
    return (
      <div className={className}>
        {fallback}
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upgrade Required</DialogTitle>
              <DialogDescription>
                This feature requires a {requiredPlan} subscription
              </DialogDescription>
            </DialogHeader>
            {upgradeContent}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/60 backdrop-blur-sm rounded-lg z-10" />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="backdrop-blur-sm">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to {requiredPlan === "plus" ? "Plus" : "Premium"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upgrade Required</DialogTitle>
                <DialogDescription>
                  This feature requires a {requiredPlan} subscription
                </DialogDescription>
              </DialogHeader>
              {upgradeContent}
            </DialogContent>
          </Dialog>
        </div>
        <div className="opacity-30 pointer-events-none">
          {children}
        </div>
      </div>
    </div>
  );
}

// Premium Badge Component
export function PremiumBadge({ plan = "plus", className = "" }: { plan?: "plus" | "premium"; className?: string }) {
  const colors = {
    plus: "bg-blue-500 text-white",
    premium: "bg-purple-500 text-white"
  };

  return (
    <Badge className={`${colors[plan]} ${className}`}>
      <Crown className="h-3 w-3 mr-1" />
      {plan === "plus" ? "Plus" : "Premium"}
    </Badge>
  );
}

// Premium Feature Indicator
export function PremiumIndicator({ feature, plan = "plus", inline = false }: { 
  feature: string; 
  plan?: "plus" | "premium"; 
  inline?: boolean;
}) {
  const featureInfo = PREMIUM_FEATURES[feature];
  
  if (inline) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Crown className="h-3 w-3" />
        <span>{plan === "plus" ? "Plus" : "Premium"} Feature</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
      <Crown className="h-4 w-4 text-purple-500" />
      <div>
        <div className="font-medium text-sm">{featureInfo.title}</div>
        <div className="text-xs text-muted-foreground">
          Requires {plan === "plus" ? "Plus" : "Premium"} subscription
        </div>
      </div>
    </div>
  );
}