import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { 
  Tv, 
  Check, 
  Star, 
  Crown, 
  Zap, 
  Users, 
  Bell, 
  BarChart3, 
  Sparkles,
  User,
  Settings,
  LogOut
} from "lucide-react";

export default function SubscriptionPricing() {
  const { user } = useAuth();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for casual TV watchers",
      features: [
        "Track up to 50 shows",
        "Basic recommendations",
        "Connect with up to 10 Binge Friends",
        "Email notifications",
        "Basic viewing statistics"
      ],
      limitations: [
        "Limited advanced search filters",
        "Basic recommendation engine",
        "Standard support"
      ],
      buttonText: "Current Plan",
      isPopular: false,
      icon: <Tv className="w-6 h-6" />
    },
    {
      name: "Plus",
      price: "$1.99",
      period: "per month",
      description: "For dedicated binge watchers",
      features: [
        "Track unlimited shows",
        "AI-powered recommendations",
        "Unlimited Binge Friends",
        "Advanced search & filters",
        "Detailed viewing analytics",
        "Priority notifications",
        "Streaming platform integration",
        "Viewing history import"
      ],
      limitations: [],
      buttonText: "Upgrade to Plus",
      isPopular: true,
      icon: <Star className="w-6 h-6" />
    },
    {
      name: "Premium",
      price: "$4.99",
      period: "per month",
      description: "Ultimate entertainment experience",
      features: [
        "Everything in Plus",
        "Premium AI recommendations",
        "Advanced behavior tracking",
        "Custom recommendation training",
        "Priority customer support",
        "Early access to new features",
        "Advanced social features",
        "Group watchlists",
        "Premium badges & themes",
        "Export data capabilities"
      ],
      limitations: [],
      buttonText: "Go Premium",
      isPopular: false,
      icon: <Crown className="w-6 h-6" />
    }
  ];

  const premiumFeatures = [
    {
      icon: <Sparkles className="w-8 h-8 text-binge-purple" />,
      title: "AI-Powered Recommendations",
      description: "Advanced machine learning analyzes your viewing patterns to suggest shows you'll love"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-binge-purple" />,
      title: "Detailed Analytics",
      description: "Comprehensive insights into your viewing habits, favorite genres, and watching patterns"
    },
    {
      icon: <Users className="w-8 h-8 text-binge-purple" />,
      title: "Social Features",
      description: "Connect with unlimited Binge Friends, share watchlists, and discover what others are watching"
    },
    {
      icon: <Bell className="w-8 h-8 text-binge-purple" />,
      title: "Smart Notifications",
      description: "Get notified about new episodes, season releases, and personalized recommendations"
    },
    {
      icon: <Zap className="w-8 h-8 text-binge-purple" />,
      title: "Streaming Integration",
      description: "Connect your Netflix, Hulu, Disney+ accounts for seamless viewing history import"
    }
  ];

  return (
    <div className="min-h-screen bg-binge-dark text-white pb-20 md:pb-0">
      {/* Top Navigation */}
      <div className="nav-opaque border-b border-binge-gray sticky top-0 z-[60]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <Tv className="w-8 h-8 text-binge-purple" />
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-0.5 text-xs font-bold text-white">B</span>
              </div>
              <h1 className="text-2xl font-bold">BingeBoard</h1>
            </Link>
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex space-x-6">
                <Link href="/discover" className="hover:text-binge-purple transition-colors">Discover</Link>
                <Link href="/upcoming" className="hover:text-binge-purple transition-colors">Upcoming</Link>
                <Link href="/friends" className="hover:text-binge-purple transition-colors">Binge Friends</Link>
                <Link href="/pricing" className="hover:text-binge-purple transition-colors">Pricing</Link>
              </nav>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={(user as any).profileImageUrl} />
                        <AvatarFallback className="bg-gradient-purple text-white">
                          {(user as any).firstName?.[0] || (user as any).email?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block text-sm">
                        {(user as any).firstName && (user as any).lastName 
                          ? `${(user as any).firstName} ${(user as any).lastName}`
                          : (user as any).email || 'User'
                        }
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-binge-charcoal border-white/10">
                    <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = '/streaming'}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => window.location.href = '/login'} className="bg-binge-purple hover:bg-binge-purple/80">
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold mb-6">
            Choose Your <span className="text-gradient-purple">Binge Experience</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Unlock the full power of BingeBoard with advanced features, AI recommendations, and premium social tools
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative bg-binge-charcoal border-binge-gray ${
                plan.isPopular ? 'ring-2 ring-binge-purple scale-105' : ''
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-purple text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-binge-purple">
                    {plan.price}
                    <span className="text-lg font-normal text-gray-400">/{plan.period}</span>
                  </div>
                  <CardDescription className="text-gray-300">
                    {plan.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button 
                  className={`w-full ${
                    plan.isPopular 
                      ? 'bg-gradient-purple hover:bg-binge-purple/80' 
                      : 'bg-binge-gray hover:bg-binge-gray/80'
                  }`}
                  disabled={plan.name === "Free"}
                >
                  {plan.buttonText}
                </Button>

                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Included Features:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.limitations.length > 0 && (
                  <div className="border-t border-binge-gray pt-4">
                    <h4 className="font-semibold text-gray-400 mb-2">Limitations:</h4>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, i) => (
                        <li key={i} className="text-gray-500 text-sm">
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Premium Features Showcase */}
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">
              Why Go <span className="text-gradient-purple">Premium</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Unlock advanced features that transform how you discover and track your favorite shows
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {premiumFeatures.map((feature, index) => (
              <Card key={index} className="bg-binge-charcoal border-binge-gray hover:border-binge-purple/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    {feature.icon}
                    <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ or Benefits Section */}
        <div className="bg-gradient-dark rounded-2xl p-8 space-y-6">
          <h3 className="text-3xl font-bold text-center">
            Ready to Upgrade Your <span className="text-gradient-purple">Binge Experience</span>?
          </h3>
          <div className="grid md:grid-cols-2 gap-8 text-center">
            <div className="space-y-3">
              <h4 className="text-xl font-semibold text-binge-purple">30-Day Money Back Guarantee</h4>
              <p className="text-gray-300">
                Try BingeBoard Plus or Premium risk-free. If you're not satisfied, get a full refund within 30 days.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-xl font-semibold text-binge-purple">Cancel Anytime</h4>
              <p className="text-gray-300">
                No long-term commitments. Upgrade, downgrade, or cancel your subscription at any time from your account settings.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4 pt-6">
            <Button className="bg-gradient-purple hover:bg-binge-purple/80 px-8 py-3 text-lg">
              Start 7-Day Free Trial
            </Button>
            <Button variant="outline" className="border-binge-purple text-binge-purple hover:bg-binge-purple/10 px-8 py-3 text-lg">
              Compare Plans
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}