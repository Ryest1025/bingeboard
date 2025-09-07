import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Play, 
  Crown, 
  Target,
  BarChart3,
  Zap,
  Eye,
  MousePointer
} from "lucide-react";

interface MonetizationMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  adRevenue: number;
  subscriptionRevenue: number;
  affiliateRevenue: number;
  totalUsers: number;
  premiumUsers: number;
  adViews: number;
  trailerViews: number;
  clickThroughRate: number;
  conversionRate: number;
}

export default function MonetizationDashboard() {
  const [metrics] = useState<MonetizationMetrics>({
    totalRevenue: 45720,
    monthlyRevenue: 12350,
    adRevenue: 8750,
    subscriptionRevenue: 3200,
    affiliateRevenue: 400,
    totalUsers: 15420,
    premiumUsers: 890,
    adViews: 45680,
    trailerViews: 12340,
    clickThroughRate: 3.2,
    conversionRate: 5.8
  });

  const revenueStreams = [
    {
      name: "Video Ads",
      amount: metrics.adRevenue,
      percentage: 70.8,
      growth: "+12%",
      color: "text-green-500",
      icon: Play,
      description: "Pre-trailer video advertisements"
    },
    {
      name: "Subscriptions",
      amount: metrics.subscriptionRevenue,
      percentage: 25.9,
      growth: "+8%",
      color: "text-blue-500",
      icon: Crown,
      description: "Plus ($1.99) & Premium ($4.99) plans"
    },
    {
      name: "Affiliate Revenue",
      amount: metrics.affiliateRevenue,
      percentage: 3.3,
      growth: "+15%",
      color: "text-purple-500",
      icon: Target,
      description: "Streaming platform referrals"
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Current month progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.premiumUsers)}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.premiumUsers / metrics.totalUsers) * 100).toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ad Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.adViews)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.clickThroughRate}% click-through rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Streams */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Streams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {revenueStreams.map((stream, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <stream.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{stream.name}</div>
                      <div className="text-sm text-muted-foreground">{stream.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(stream.amount)}</div>
                    <div className={`text-sm ${stream.color}`}>{stream.growth}</div>
                  </div>
                </div>
                <Progress value={stream.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monetization Optimization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ad Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Trailer Views</span>
              <span className="font-bold">{formatNumber(metrics.trailerViews)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Ad Completion Rate</span>
              <span className="font-bold">87.3%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average Revenue per View</span>
              <span className="font-bold">$0.19</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Click-Through Rate</span>
              <span className="font-bold text-green-500">{metrics.clickThroughRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Plus Users ($1.99)</span>
              <span className="font-bold">642</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Premium Users ($4.99)</span>
              <span className="font-bold">248</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Monthly Churn Rate</span>
              <span className="font-bold text-red-500">2.1%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg. Revenue per User</span>
              <span className="font-bold text-green-500">$3.59</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Monetization Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Increase Ad Revenue</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Optimize ad placement and targeting to increase CTR by 15%
              </p>
              <Button size="sm" variant="outline">Optimize Ads</Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Premium Conversion</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Launch targeted campaigns to convert 200+ free users to premium
              </p>
              <Button size="sm" variant="outline">Start Campaign</Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="font-medium">Affiliate Partners</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Add 5+ streaming platform partnerships for referral revenue
              </p>
              <Button size="sm" variant="outline">Add Partners</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}