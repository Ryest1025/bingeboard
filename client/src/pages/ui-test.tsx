import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TopNav } from "@/components/top-nav";
import MobileNav from "@/components/mobile-nav";
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  Calendar,
  ChevronRight,
  Plus,
  TrendingUp,
  Eye,
  Heart,
  Share,
  Bell,
  Settings,
  CheckCircle,
  Search,
  Filter,
  Grid,
  List
} from "lucide-react";

// Modern UI Test Page - Implementing GitHub Copilot suggestions
export default function UITestPage() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Enhanced color scheme with better gradients
  const modernGradients = {
    primary: "bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500",
    secondary: "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500",
    dark: "bg-gradient-to-br from-slate-900 via-gray-900 to-black",
    glass: "backdrop-blur-xl bg-white/10 border border-white/20"
  };

  // Mock data for testing UI improvements
  const featuredContent = [
    {
      id: 1,
      title: "House of the Dragon",
      poster: "https://image.tmdb.org/t/p/w500/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg",
      rating: 8.7,
      year: 2024,
      genre: "Fantasy",
      status: "watching",
      progress: 75,
      platforms: ["HBO Max", "Amazon Prime"]
    },
    {
      id: 2,
      title: "Wednesday",
      poster: "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
      rating: 8.1,
      year: 2023,
      genre: "Comedy",
      status: "completed",
      progress: 100,
      platforms: ["Netflix"]
    },
    {
      id: 3,
      title: "The Crown",
      poster: "https://image.tmdb.org/t/p/w500/38mxhJ99WM0zYvaXKdqyFTl6LZH.jpg",
      rating: 8.9,
      year: 2023,
      genre: "Drama",
      status: "plan-to-watch",
      progress: 0,
      platforms: ["Netflix", "Hulu"]
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center p-4">
        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 max-w-md mx-auto">
          <CardContent className="p-8 text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Play className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              BingeBoard UI Test
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Testing modern UI improvements with enhanced gradients, better spacing, and improved interactions.
            </p>
            <Button asChild className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-xl hover:shadow-teal-500/25 transition-all duration-300">
              <Link href="/login">Experience the New Design</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      <TopNav />
      
      <div className="pt-20 pb-32">
        <div className="container mx-auto px-4 space-y-8">
          
          {/* Enhanced Hero Section */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600/30 via-cyan-600/20 to-blue-600/30"></div>
            <div className="relative p-8 text-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="relative">
                  {/* Enhanced TV Logo */}
                  <div className="w-10 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-2xl border border-slate-600 relative">
                    <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
                      <div className="text-sm font-bold text-white drop-shadow-lg">B</div>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-slate-700 rounded-sm"></div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-slate-600 rounded-sm"></div>
                  </div>
                </div>
                <h1 className="text-4xl font-bold">
                  <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Binge
                  </span>
                  <span className="text-white">Board</span>
                </h1>
              </div>
              <p className="text-xl text-gray-300 mb-6">UI Testing & Improvements</p>
              
              {/* Quick Stats with Enhanced Design */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {[
                  { label: "Watching", value: "12", icon: Eye, color: "from-teal-500 to-cyan-500" },
                  { label: "Completed", value: "84", icon: CheckCircle, color: "from-green-500 to-emerald-500" },
                  { label: "Planned", value: "27", icon: Clock, color: "from-purple-500 to-pink-500" },
                  { label: "Total Hours", value: "342", icon: Star, color: "from-yellow-500 to-orange-500" }
                ].map((stat, index) => (
                  <Card key={index} className="backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <CardContent className="p-4 text-center">
                      <div className={`w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Search and Filter Bar */}
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search your shows and movies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <div className="flex border border-white/20 rounded-lg overflow-hidden">
                    <Button
                      variant={activeView === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveView('grid')}
                      className={activeView === 'grid' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={activeView === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveView('list')}
                      className={activeView === 'list' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Content Grid/List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Your Library</h2>
              <Button variant="outline" className="border-teal-500/50 text-teal-400 hover:bg-teal-600/20">
                <Plus className="h-4 w-4 mr-2" />
                Add Show
              </Button>
            </div>

            {activeView === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredContent.map((item) => (
                  <Card key={item.id} className="group backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/20">
                    <CardContent className="p-0">
                      <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
                        <img 
                          src={item.poster} 
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                                <Play className="h-3 w-3 mr-1" />
                                Watch
                              </Button>
                              <Button size="sm" variant="outline" className="border-white/50 text-white hover:bg-white/20">
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          <Badge variant={item.status === 'watching' ? 'default' : item.status === 'completed' ? 'secondary' : 'outline'}>
                            {item.status === 'watching' ? 'Watching' : item.status === 'completed' ? 'Completed' : 'Planned'}
                          </Badge>
                        </div>

                        {/* Progress Bar */}
                        {item.progress > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1">
                            <div className="h-full bg-white/20">
                              <div 
                                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
                                style={{ width: `${item.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-white mb-1 group-hover:text-teal-400 transition-colors">{item.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                          <span>{item.year}</span>
                          <span>•</span>
                          <span>{item.genre}</span>
                          <span>•</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            {item.rating}
                          </div>
                        </div>
                        
                        {/* Platform Icons */}
                        <div className="flex items-center gap-1">
                          {item.platforms.map((platform, index) => (
                            <div key={index} className="w-6 h-6 bg-white/20 rounded text-xs flex items-center justify-center text-white">
                              {platform.charAt(0)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {featuredContent.map((item) => (
                  <Card key={item.id} className="backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <span>{item.year}</span>
                            <span>•</span>
                            <span>{item.genre}</span>
                            <span>•</span>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                              {item.rating}
                            </div>
                          </div>
                          {item.progress > 0 && (
                            <div className="w-full bg-white/20 rounded-full h-1.5 mb-2">
                              <div 
                                className="bg-gradient-to-r from-teal-500 to-cyan-500 h-1.5 rounded-full"
                                style={{ width: `${item.progress}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                            <Play className="h-3 w-3 mr-1" />
                            Watch
                          </Button>
                          <Button size="sm" variant="outline" className="border-white/50 text-white hover:bg-white/20">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Recommendation Section */}
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">AI Recommendations</h2>
                <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                  Powered by AI
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {featuredContent.slice(0, 4).map((item, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-700 mb-3">
                      <img 
                        src={item.poster} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <h4 className="text-sm font-medium text-white text-center group-hover:text-teal-400 transition-colors">{item.title}</h4>
                    <p className="text-xs text-gray-400 text-center">{item.genre} • {item.year}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}