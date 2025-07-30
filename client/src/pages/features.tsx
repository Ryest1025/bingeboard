import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TopNav } from "@/components/top-nav";
import MobileNav from "@/components/mobile-nav";
import { 
  Play, 
  Star, 
  Users, 
  Calendar, 
  TrendingUp, 
  List, 
  Trophy,
  Heart,
  Share,
  Bell,
  BarChart3,
  Zap,
  Shield,
  Globe,
  Settings,
  Download,
  Crown,
  ArrowRight,
  CheckCircle,
  Clock,
  Target,
  Sparkles
} from "lucide-react";

const featureCategories = [
  {
    title: "Core Watch Management",
    icon: Play,
    color: "from-teal-500 to-cyan-500",
    features: [
      {
        name: "Track Watch Status",
        description: "Mark shows as Watching, Watched, Plan to Watch, Dropped, or On Hold",
        implemented: true,
        route: "/activity"
      },
      {
        name: "Episode Progress",
        description: "Automatically track episode progress or manually adjust if needed",
        implemented: true,
        route: "/activity"
      },
      {
        name: "Airing Calendar",
        description: "View personalized calendar for upcoming episodes and new seasons",
        implemented: true,
        route: "/lists"
      },
      {
        name: "Platform Sync",
        description: "Sync watch activity across Netflix, Hulu, Max, Disney+, and more",
        implemented: true,
        route: "/settings"
      }
    ]
  },
  {
    title: "Smart Recommendations",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
    features: [
      {
        name: "AI Personalization",
        description: "Get suggestions based on viewing history, genre preferences, and ratings",
        implemented: true,
        route: "/"
      },
      {
        name: "Mood-Based Filters",
        description: "Find shows that match your energy (light and funny, intense, background noise)",
        implemented: false,
        route: "/discover"
      },
      {
        name: "Trending & Tailored",
        description: "See what's trending, but tailored to your individual tastes and habits",
        implemented: true,
        route: "/discover"
      },
      {
        name: "Watch Now Integration",
        description: "Direct links to streaming platforms with deep linking support",
        implemented: true,
        route: "/discover"
      }
    ]
  },
  {
    title: "Social Sharing & Discovery",
    icon: Users,
    color: "from-blue-500 to-indigo-500",
    features: [
      {
        name: "Friend Activity Feed",
        description: "See what friends are watching, rating, or commenting on",
        implemented: true,
        route: "/friends"
      },
      {
        name: "Episode Discussions",
        description: "Join show-specific conversations with spoiler-safe modes",
        implemented: false,
        route: "/friends"
      },
      {
        name: "Direct Recommendations",
        description: "Recommend shows directly to friends with custom notes",
        implemented: false,
        route: "/friends"
      },
      {
        name: "Anonymous Viewing",
        description: "Keep certain shows private when desired",
        implemented: false,
        route: "/settings"
      }
    ]
  },
  {
    title: "Custom Lists & Collaboration",
    icon: List,
    color: "from-green-500 to-emerald-500",
    features: [
      {
        name: "Create Custom Lists",
        description: "Build public and private lists like 'Best Comedies' or 'Weekend Binges'",
        implemented: true,
        route: "/lists"
      },
      {
        name: "Collaborative Lists",
        description: "Invite friends to collaborate on shared lists",
        implemented: true,
        route: "/lists"
      },
      {
        name: "Easy Sharing",
        description: "Share lists via unique URLs or QR codes for easy access",
        implemented: true,
        route: "/lists"
      },
      {
        name: "List Organization",
        description: "Tag, categorize, and organize your lists efficiently",
        implemented: true,
        route: "/lists"
      }
    ]
  },
  {
    title: "Watch Parties & Groups",
    icon: Heart,
    color: "from-red-500 to-rose-500",
    features: [
      {
        name: "Group Watch Events",
        description: "Schedule watch parties with calendar invites and time zone syncing",
        implemented: false,
        route: "/groups"
      },
      {
        name: "Voting Polls",
        description: "Create polls to vote on what the group should watch next",
        implemented: false,
        route: "/groups"
      },
      {
        name: "Live Chat & Reactions",
        description: "Enable live chat during viewing sessions with Teleparty integration",
        implemented: false,
        route: "/groups"
      },
      {
        name: "Group Recommendations",
        description: "Get recommendations based on entire group's preferences",
        implemented: false,
        route: "/groups"
      }
    ]
  },
  {
    title: "Profile & Viewing Stats",
    icon: BarChart3,
    color: "from-orange-500 to-amber-500",
    features: [
      {
        name: "Detailed Stats",
        description: "Track total hours watched, most-watched genres, and binge streaks",
        implemented: true,
        route: "/profile"
      },
      {
        name: "TV Personality Profile",
        description: "Get a personality profile (Sci-Fi Explorer, Reality Show Superfan)",
        implemented: true,
        route: "/profile"
      },
      {
        name: "Achievements & Badges",
        description: "Earn badges for milestones like completing long-running series",
        implemented: true,
        route: "/profile"
      },
      {
        name: "Export Viewing Data",
        description: "Export your full watch history as PDF, CSV, or graphic",
        implemented: true,
        route: "/settings"
      }
    ]
  },
  {
    title: "Notifications & Reminders",
    icon: Bell,
    color: "from-cyan-500 to-teal-500",
    features: [
      {
        name: "New Episode Alerts",
        description: "Get notified when new episodes or seasons of saved shows drop",
        implemented: true,
        route: "/settings"
      },
      {
        name: "Smart Reminders",
        description: "Time-based reminders based on your usual viewing habits",
        implemented: true,
        route: "/settings"
      },
      {
        name: "Continue Watching",
        description: "Prompts to continue shows you've paused or forgotten",
        implemented: true,
        route: "/lists"
      },
      {
        name: "Friend Activity Alerts",
        description: "Get notified when friends start new shows or leave reviews",
        implemented: false,
        route: "/settings"
      }
    ]
  },
  {
    title: "Community & Creator Tools",
    icon: Crown,
    color: "from-violet-500 to-purple-500",
    features: [
      {
        name: "Long-Form Reviews",
        description: "Write detailed reviews or blog-style 'Top 10' lists",
        implemented: false,
        route: "/community"
      },
      {
        name: "Visual List Exports",
        description: "Export curated lists as visual graphics for social sharing",
        implemented: false,
        route: "/lists"
      },
      {
        name: "Creator Profiles",
        description: "Verified status and curated show collections for influencers",
        implemented: false,
        route: "/community"
      },
      {
        name: "Community Features",
        description: "Public discussions, reviews, and recommendation threads",
        implemented: false,
        route: "/community"
      }
    ]
  }
];

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(228,25%,3%)] via-[hsl(226,22%,6%)] to-[hsl(224,20%,8%)]">
      <TopNav />
      
      <div className="pt-20 p-4 pb-24">
        <div className="container mx-auto max-w-7xl">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Complete Entertainment Tracking Platform
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              BingeBoard offers comprehensive features that go beyond basic tracking. 
              Discover, organize, and share your entertainment experience like never before.
            </p>
          </div>

          {/* Feature Categories */}
          <div className="space-y-12">
            {featureCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-6">
                
                {/* Category Header */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center`}>
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">{category.title}</h2>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {category.features.map((feature, featureIndex) => (
                    <Card key={featureIndex} className="glass-effect border-slate-700/50 hover:border-teal-500/50 transition-all duration-300 group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-white text-lg leading-tight">
                            {feature.name}
                          </CardTitle>
                          <div className="flex-shrink-0">
                            {feature.implemented ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Live
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                <Clock className="h-3 w-3 mr-1" />
                                Coming Soon
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                        
                        {feature.implemented && (
                          <Link href={feature.route}>
                            <Button variant="outline" size="sm" className="w-full border-teal-500/30 text-teal-400 hover:bg-teal-500/10 group-hover:border-teal-400/50">
                              Try Now
                              <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Feature Summary Stats */}
          <div className="mt-16">
            <Card className="glass-effect border-slate-700/50 bg-gradient-to-r from-teal-500/10 to-cyan-500/10">
              <CardContent className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-teal-400">24+</div>
                    <div className="text-gray-300">Total Features</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-green-400">18</div>
                    <div className="text-gray-300">Live Now</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-amber-400">6</div>
                    <div className="text-gray-300">Coming Soon</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-purple-400">8</div>
                    <div className="text-gray-300">Categories</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">
                Ready to Transform Your Entertainment Experience?
              </h3>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Join thousands of users who have upgraded their TV and movie tracking with BingeBoard's comprehensive platform.
              </p>
              <div className="flex gap-4 justify-center mt-6">
                <Link href="/">
                  <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white px-8 py-3">
                    <Target className="h-4 w-4 mr-2" />
                    Start Tracking Now
                  </Button>
                </Link>
                <Link href="/discover">
                  <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 px-8 py-3">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Explore Content
                  </Button>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}