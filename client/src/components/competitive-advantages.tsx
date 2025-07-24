import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Zap, Users, TrendingUp, Star, Globe, Smartphone } from "lucide-react";

export function CompetitiveAdvantages() {
  const features = [
    {
      feature: "Real-time Streaming Sync",
      bingeboard: "Instant updates",
      trakt: "24-hour delay",
      tvtime: "Manual sync only",
      icon: Zap,
      highlight: true
    },
    {
      feature: "Platform Access",
      bingeboard: "Web + Mobile",
      trakt: "Web + Mobile",
      tvtime: "Mobile only",
      icon: Globe,
      highlight: true
    },
    {
      feature: "AI Recommendations",
      bingeboard: "Advanced ML with behavior tracking",
      trakt: "Basic trending",
      tvtime: "Genre-based only",
      icon: Star,
      highlight: true
    },
    {
      feature: "Sports Integration",
      bingeboard: "Full sports schedules + TV info",
      trakt: "None",
      tvtime: "None",
      icon: TrendingUp,
      highlight: true
    },
    {
      feature: "Social Features",
      bingeboard: "Advanced friend discovery",
      trakt: "Basic following",
      tvtime: "Limited social",
      icon: Users,
      highlight: false
    },
    {
      feature: "Streaming Platform Deep Links",
      bingeboard: "Direct app launches",
      trakt: "Basic links",
      tvtime: "No deep links",
      icon: Smartphone,
      highlight: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gradient-teal mb-4">Why Choose BingeBoard?</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          We've analyzed the competition and built the most comprehensive entertainment tracking platform
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-4 px-6 text-gray-300 font-semibold">Feature</th>
              <th className="text-center py-4 px-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">B</span>
                  </div>
                  <span className="text-teal-400 font-bold">BingeBoard</span>
                </div>
              </th>
              <th className="text-center py-4 px-6 text-gray-400">Trakt.tv</th>
              <th className="text-center py-4 px-6 text-gray-400">TV Time</th>
            </tr>
          </thead>
          <tbody>
            {features.map((item, index) => {
              const Icon = item.icon;
              return (
                <tr key={index} className={`border-b border-gray-800 ${item.highlight ? 'bg-teal-500/5' : ''}`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${item.highlight ? 'text-teal-400' : 'text-gray-400'}`} />
                      <span className="text-white font-medium">{item.feature}</span>
                      {item.highlight && (
                        <Badge className="bg-teal-500/20 text-teal-300 text-xs">Premium</Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-green-300 font-semibold">{item.bingeboard}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {item.trakt === "None" || item.trakt.includes("delay") || item.trakt === "Basic trending" ? (
                        <X className="h-4 w-4 text-red-400" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-yellow-400" />
                      )}
                      <span className={`${item.trakt === "None" ? 'text-red-300' : 'text-yellow-300'}`}>
                        {item.trakt}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {item.tvtime === "None" || item.tvtime === "Mobile only" || item.tvtime.includes("Limited") ? (
                        <X className="h-4 w-4 text-red-400" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-yellow-400" />
                      )}
                      <span className={`${item.tvtime === "None" || item.tvtime === "Mobile only" ? 'text-red-300' : 'text-yellow-300'}`}>
                        {item.tvtime}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="glass-effect border-green-500/20">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Real-time Updates</h3>
            <p className="text-sm text-gray-400">
              Instant sync vs Trakt's 24-hour delay means you never miss what's trending
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-500/20">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart AI</h3>
            <p className="text-sm text-gray-400">
              Advanced behavioral tracking creates 3x more accurate recommendations
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-purple-500/20">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Sports Integration</h3>
            <p className="text-sm text-gray-400">
              First platform to unify TV shows and sports in one experience
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}