import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Crown, Star, Zap, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: "monthly" | "yearly";
  features: string[];
  removedFeatures?: string[];
  popular?: boolean;
  color: string;
  icon: React.ComponentType<any>;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Basic tracking with ads",
    price: 0,
    interval: "monthly",
    features: [
      "Track up to 25 shows",
      "Basic watchlist",
      "Community features",
      "Mobile app access"
    ],
    removedFeatures: [
      "Video ads before trailers",
      "Banner advertisements",
      "Limited recommendations"
    ],
    color: "gray",
    icon: Star
  },
  {
    id: "plus",
    name: "Plus",
    description: "Ad-free experience with more features",
    price: 1.99,
    interval: "monthly",
    features: [
      "Everything in Free",
      "Ad-free trailer viewing",
      "No banner advertisements", 
      "Track up to 100 shows",
      "Enhanced recommendations",
      "Email support"
    ],
    popular: true,
    color: "blue",
    icon: Crown
  },
  {
    id: "premium",
    name: "Premium",
    description: "Complete platform access with premium tools",
    price: 4.99,
    interval: "monthly",
    features: [
      "Everything in Plus",
      "Unlimited show tracking",
      "Advanced analytics dashboard",
      "Custom lists and tags",
      "Priority customer support",
      "Early access to new features",
      "Export watchlist data"
    ],
    color: "purple",
    icon: Zap
  }
];

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: currentSubscription } = useQuery({
    queryKey: ["/api/subscription/current"],
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      return await apiRequest("/api/subscription/create", "POST", { planId });
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: "Subscription updated!",
          description: "Your plan has been successfully updated.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Subscription failed",
        description: "Unable to process subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (planId: string) => {
    if (planId === "free") {
      // Handle downgrade to free
      toast({
        title: "Downgrade to Free",
        description: "Contact support to downgrade your plan.",
      });
      return;
    }
    
    setSelectedPlan(planId);
    subscribeMutation.mutate(planId);
  };

  const getCurrentPlanId = () => {
    return currentSubscription?.planId || "free";
  };

  const isCurrentPlan = (planId: string) => {
    return getCurrentPlanId() === planId;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground text-lg">
          Upgrade for an ad-free experience and premium features
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {subscriptionPlans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = isCurrentPlan(plan.id);
          const isLoading = subscribeMutation.isPending && selectedPlan === plan.id;

          return (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''} ${
                isCurrent ? 'ring-2 ring-green-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                </div>
              )}
              
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500 text-white">Current Plan</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className={`p-3 rounded-full bg-${plan.color}-100 text-${plan.color}-600`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                
                <div className="mt-4">
                  <span className="text-3xl font-bold">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <Separator />
                
                {/* Features */}
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Removed Features (for Free plan) */}
                {plan.removedFeatures && (
                  <div className="space-y-2 border-t pt-2">
                    <div className="text-xs text-muted-foreground font-medium">
                      Limitations:
                    </div>
                    {plan.removedFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  className="w-full mt-6"
                  variant={isCurrent ? "secondary" : plan.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrent || isLoading}
                >
                  {isLoading ? (
                    "Processing..."
                  ) : isCurrent ? (
                    "Current Plan"
                  ) : plan.price === 0 ? (
                    "Downgrade"
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </Button>

                {plan.price > 0 && (
                  <p className="text-xs text-center text-muted-foreground">
                    Cancel anytime • No hidden fees
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upgrade Benefits */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Upgrade Benefits
          </CardTitle>
          <CardDescription>
            Start with Plus at just $1.99/month for an ad-free experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">🎬 Ad-Free Viewing ($1.99/month)</h4>
              <p className="text-sm text-muted-foreground">
                Watch trailers instantly without advertisements starting with Plus. 
                No more interruptions when you want to preview shows.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">⚡ Enhanced Experience ($1.99/month)</h4>
              <p className="text-sm text-muted-foreground">
                Track more shows and get better recommendations without banner ads. 
                Enjoy a cleaner, more focused interface.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">🎯 Advanced Analytics ($4.99/month)</h4>
              <p className="text-sm text-muted-foreground">
                Get detailed viewing insights, custom lists, and unlimited tracking
                with Premium for serious TV enthusiasts.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">📱 Priority Support ($4.99/month)</h4>
              <p className="text-sm text-muted-foreground">
                Get priority customer support, early access to features, and
                data export capabilities with Premium.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Compact subscription upgrade prompt
export function UpgradePrompt({ feature }: { feature: string }) {
  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5 text-yellow-600" />
          <div className="flex-1">
            <h4 className="font-medium text-sm">Premium Feature</h4>
            <p className="text-xs text-muted-foreground">
              {feature} is available with Premium subscription
            </p>
          </div>
          <Button size="sm" variant="outline">
            Upgrade
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}