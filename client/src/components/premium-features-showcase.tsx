import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Star, 
  Zap, 
  BarChart3, 
  Users, 
  Bell, 
  Download, 
  Shield,
  Sparkles,
  Play,
  List,
  HeartHandshake
} from "lucide-react";
import { PremiumBadge } from "./premium-feature-gate";
import { useLocation } from "wouter";

interface PremiumFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  plan: "plus" | "premium";
  category: string;
  benefits: string[];
  comparison?: {
    free: string;
    premium: string;
  };
}

export default function PremiumFeaturesShowcase() {
  const [, setLocation] = useLocation();

  const features: PremiumFeature[] = [
    {
      id: "ad-free",
      title: "Ad-Free Experience",
      description: "Watch trailers instantly without any interruptions",
      icon: Play,
      plan: "plus",
      category: "Viewing Experience",
      benefits: [
        "Skip all video ads before trailers",
        "No banner advertisements",
        "Instant trailer access",
        "Cleaner interface"
      ],
      comparison: {
        free: "15-30 second ads before every trailer",
        premium: "Instant trailer access with no ads"
      }
    },
    {
      id: "unlimited-tracking",
      title: "Unlimited Show Tracking",
      description: "Track as many shows as you want with no limits",
      icon: Star,
      plan: "plus",
      category: "Content Management",
      benefits: [
        "No 25-show limit",
        "Unlimited watchlists",
        "Track entire series",
        "Season-by-season progress"
      ],
      comparison: {
        free: "Limited to 25 shows in watchlist",
        premium: "Unlimited show tracking"
      }
    },
    {
      id: "advanced-analytics",
      title: "Advanced Analytics",
      description: "Detailed insights into your viewing habits and preferences",
      icon: BarChart3,
      plan: "premium",
      category: "Analytics & Insights",
      benefits: [
        "Viewing time statistics",
        "Genre preference analysis",
        "Binge streak tracking",
        "Monthly viewing reports",
        "Personalized insights"
      ],
      comparison: {
        free: "Basic viewing history",
        premium: "Comprehensive analytics dashboard"
      }
    },
    {
      id: "ai-recommendations",
      title: "AI-Powered Recommendations",
      description: "Get personalized suggestions using advanced AI algorithms",
      icon: Sparkles,
      plan: "plus",
      category: "Recommendations",
      benefits: [
        "AI-driven suggestions",
        "Deep learning analysis",
        "Seasonal recommendations",
        "Friend-based discovery",
        "Mood-based filtering"
      ],
      comparison: {
        free: "Basic trending recommendations",
        premium: "Personalized AI recommendations"
      }
    },
    {
      id: "custom-lists",
      title: "Custom Lists & Tags",
      description: "Create unlimited custom lists with advanced organization",
      icon: List,
      plan: "premium",
      category: "Organization",
      benefits: [
        "Unlimited custom lists",
        "Tag system",
        "Share with friends",
        "List collaboration",
        "Advanced sorting"
      ],
      comparison: {
        free: "Basic watchlist only",
        premium: "Unlimited custom lists with tags"
      }
    },
    {
      id: "priority-support",
      title: "Priority Support",
      description: "Get help faster with dedicated customer support",
      icon: HeartHandshake,
      plan: "premium",
      category: "Support",
      benefits: [
        "Priority response times",
        "Direct support channel",
        "Feature requests",
        "Beta access",
        "Phone support"
      ],
      comparison: {
        free: "Community support",
        premium: "Priority customer support"
      }
    },
    {
      id: "data-export",
      title: "Data Export & Backup",
      description: "Export your viewing data and create backups",
      icon: Download,
      plan: "premium",
      category: "Data Management",
      benefits: [
        "CSV/JSON export",
        "Backup your data",
        "Third-party integrations",
        "Data portability",
        "Scheduled exports"
      ],
      comparison: {
        free: "No data export",
        premium: "Full data export capabilities"
      }
    },
    {
      id: "enhanced-social",
      title: "Enhanced Social Features",
      description: "Advanced social features for better friend connections",
      icon: Users,
      plan: "premium",
      category: "Social",
      benefits: [
        "Friend activity insights",
        "Group watchlists",
        "Social challenges",
        "Premium badges",
        "Friend recommendations"
      ],
      comparison: {
        free: "Basic friend features",
        premium: "Advanced social features"
      }
    },
    {
      id: "notifications",
      title: "Smart Notifications",
      description: "Intelligent notifications about your favorite shows",
      icon: Bell,
      plan: "plus",
      category: "Notifications",
      benefits: [
        "Episode release alerts",
        "Personalized reminders",
        "Friend activity notifications",
        "Binge suggestions",
        "Custom notification settings"
      ],
      comparison: {
        free: "Basic notifications",
        premium: "Smart personalized notifications"
      }
    }
  ];

  const plusFeatures = features.filter(f => f.plan === "plus");
  const premiumFeatures = features.filter(f => f.plan === "premium");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">
          Premium Features
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock powerful features that enhance your entertainment tracking experience
        </p>
      </div>

      {/* Feature Categories */}
      <div className="grid gap-8">
        {/* Plus Features */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <PremiumBadge plan="plus" />
            <h3 className="text-2xl font-bold">Plus Features ($1.99/month)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plusFeatures.map((feature) => (
              <Card key={feature.id} className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <feature.icon className="h-6 w-6 text-blue-500" />
                    <Badge variant="secondary" className="text-xs">
                      {feature.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                  <ul className="space-y-1">
                    {feature.benefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1 h-1 bg-blue-500 rounded-full" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  {feature.comparison && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span className="text-red-500">Free:</span>
                          <span>{feature.comparison.free}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-blue-500">Plus:</span>
                          <span>{feature.comparison.premium}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Premium Features */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <PremiumBadge plan="premium" />
            <h3 className="text-2xl font-bold">Premium Features ($4.99/month)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {premiumFeatures.map((feature) => (
              <Card key={feature.id} className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <feature.icon className="h-6 w-6 text-purple-500" />
                    <Badge variant="secondary" className="text-xs">
                      {feature.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                  <ul className="space-y-1">
                    {feature.benefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1 h-1 bg-purple-500 rounded-full" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  {feature.comparison && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span className="text-red-500">Free:</span>
                          <span>{feature.comparison.free}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-purple-500">Premium:</span>
                          <span>{feature.comparison.premium}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Crown className="h-12 w-12 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold">Ready to upgrade?</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Choose the plan that's right for you and unlock powerful features
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => setLocation("/subscription-pricing")}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Crown className="h-4 w-4 mr-2" />
                View Pricing
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation("/features")}
              >
                See All Features
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}