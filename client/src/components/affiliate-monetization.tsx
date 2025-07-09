import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink, 
  DollarSign, 
  TrendingUp, 
  Target,
  Play,
  Star,
  Users,
  Gift
} from "lucide-react";

interface AffiliatePartner {
  id: string;
  name: string;
  logo: string;
  category: string;
  commission: number;
  conversions: number;
  revenue: number;
  ctr: number;
  description: string;
}

interface AffiliateOffer {
  id: string;
  partner: string;
  title: string;
  description: string;
  commission: number;
  cta: string;
  category: string;
  popularity: number;
}

export default function AffiliateMonetization() {
  const [partners] = useState<AffiliatePartner[]>([
    {
      id: "netflix",
      name: "Netflix",
      logo: "https://image.tmdb.org/t/p/w45/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg",
      category: "Streaming",
      commission: 8.5,
      conversions: 1240,
      revenue: 15680,
      ctr: 4.2,
      description: "Monthly subscription referrals"
    },
    {
      id: "hulu",
      name: "Hulu",
      logo: "https://image.tmdb.org/t/p/w45/pqzK9z7NfFjzl5J3cDJvAmEXFH0.jpg",
      category: "Streaming",
      commission: 6.0,
      conversions: 890,
      revenue: 8920,
      ctr: 3.8,
      description: "Ad-supported & Premium plans"
    },
    {
      id: "disney",
      name: "Disney+",
      logo: "https://image.tmdb.org/t/p/w45/dgPueyEdOwpQ10fjuhL2WYFQwQs.jpg",
      category: "Streaming",
      commission: 7.2,
      conversions: 760,
      revenue: 6840,
      ctr: 5.1,
      description: "Family-friendly content subscriptions"
    },
    {
      id: "paramount",
      name: "Paramount+",
      logo: "https://image.tmdb.org/t/p/w45/fi83B1oztoS47tONWdHuCMx3kyw.jpg",
      category: "Streaming",
      commission: 5.5,
      conversions: 420,
      revenue: 3280,
      ctr: 3.2,
      description: "Sports & entertainment content"
    },
    {
      id: "peacock",
      name: "Peacock",
      logo: "https://image.tmdb.org/t/p/w45/xTVM8pXPtTyPdVamGjSF3PtjCp0.jpg",
      category: "Streaming",
      commission: 4.8,
      conversions: 310,
      revenue: 2240,
      ctr: 2.9,
      description: "NBCUniversal content library"
    },
    {
      id: "snacks",
      name: "MovieSnacks",
      logo: "/api/placeholder/45/45",
      category: "Food & Beverage",
      commission: 12.0,
      conversions: 520,
      revenue: 3120,
      ctr: 6.8,
      description: "Premium movie theater snacks"
    },
    {
      id: "roku",
      name: "Roku",
      logo: "/api/placeholder/45/45",
      category: "Hardware",
      commission: 15.0,
      conversions: 180,
      revenue: 2700,
      ctr: 4.5,
      description: "Streaming devices & accessories"
    },
    {
      id: "vpn",
      name: "StreamVPN",
      logo: "/api/placeholder/45/45",
      category: "Privacy",
      commission: 25.0,
      conversions: 95,
      revenue: 1900,
      ctr: 8.2,
      description: "VPN for global content access"
    }
  ]);

  const [offers] = useState<AffiliateOffer[]>([
    {
      id: "netflix-trial",
      partner: "Netflix",
      title: "30-Day Free Trial",
      description: "Start your Netflix journey with a free month",
      commission: 12.50,
      cta: "Start Free Trial",
      category: "Trial",
      popularity: 95
    },
    {
      id: "hulu-bundle",
      partner: "Hulu",
      title: "Hulu + Disney+ Bundle",
      description: "Save $5/month with the entertainment bundle",
      commission: 18.00,
      cta: "Get Bundle Deal",
      category: "Bundle",
      popularity: 87
    },
    {
      id: "snacks-first",
      partner: "MovieSnacks",
      title: "First Order 20% Off",
      description: "Premium movie snacks delivered to your door",
      commission: 8.50,
      cta: "Shop Now",
      category: "Discount",
      popularity: 72
    },
    {
      id: "roku-upgrade",
      partner: "Roku",
      title: "Roku Ultra 4K Streaming",
      description: "Upgrade your streaming with 4K HDR support",
      commission: 35.00,
      cta: "Buy Now",
      category: "Hardware",
      popularity: 68
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalRevenue = partners.reduce((sum, partner) => sum + partner.revenue, 0);
  const totalConversions = partners.reduce((sum, partner) => sum + partner.conversions, 0);
  const avgCommission = partners.reduce((sum, partner) => sum + partner.commission, 0) / partners.length;

  return (
    <div className="space-y-6">
      {/* Affiliate Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +15.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions}</div>
            <p className="text-xs text-muted-foreground">
              Active referrals this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partners.length}</div>
            <p className="text-xs text-muted-foreground">
              Active affiliate partnerships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCommission.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average commission rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Partner Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Partner Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {partners.map((partner) => (
              <div key={partner.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <img 
                    src={partner.logo} 
                    alt={partner.name}
                    className="w-10 h-10 rounded"
                    onError={(e) => {
                      // Fallback to first letter
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div>
                    <div className="font-medium">{partner.name}</div>
                    <div className="text-sm text-muted-foreground">{partner.description}</div>
                  </div>
                  <Badge variant="secondary">{partner.category}</Badge>
                </div>
                <div className="text-right space-y-1">
                  <div className="font-bold">{formatCurrency(partner.revenue)}</div>
                  <div className="text-sm text-muted-foreground">
                    {partner.conversions} conversions • {partner.commission}% commission
                  </div>
                  <div className="text-xs text-green-600">
                    {partner.ctr}% CTR
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Featured Offers */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Affiliate Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.map((offer) => (
              <div key={offer.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium">{offer.title}</div>
                    <div className="text-sm text-muted-foreground">{offer.partner}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatCurrency(offer.commission)}</div>
                    <div className="text-xs text-muted-foreground">per conversion</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{offer.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{offer.category}</Badge>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs">{offer.popularity}%</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {offer.cta}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">High-Converting Offers</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Netflix and Hulu trials show 85%+ conversion rates. Feature these prominently in recommendations.
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">Seasonal Opportunities</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Holiday season approaching - promote gift subscriptions and premium hardware with bonus commissions.
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-800 dark:text-purple-200">New Partner Potential</span>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Consider partnerships with Apple TV+, HBO Max, and Amazon Prime for comprehensive streaming coverage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}