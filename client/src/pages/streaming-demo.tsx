import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Play, ExternalLink, Star } from "lucide-react";

interface WatchmodeTitle {
  id: number;
  title: string;
  type: string;
  year?: number;
  image_url?: string;
  user_rating?: number;
  sources?: Array<{
    source_id: number;
    name: string;
    type: 'sub' | 'buy' | 'rent' | 'free';
    web_url?: string;
    ios_url?: string;
    android_url?: string;
    price?: number;
    format: string;
  }>;
}

export default function StreamingDemo() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTitle, setSelectedTitle] = useState<WatchmodeTitle | null>(null);

  // Search Watchmode titles
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['/api/watchmode/search', searchQuery],
    enabled: searchQuery.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get availability for selected title
  const { data: availability, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['/api/watchmode/availability', selectedTitle?.id],
    enabled: !!selectedTitle,
    staleTime: 5 * 60 * 1000,
  });

  // Get trending titles
  const { data: trendingData } = useQuery({
    queryKey: ['/api/watchmode/trending'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get platform information
  const { data: platforms } = useQuery({
    queryKey: ['/api/watchmode/platforms'],
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is triggered automatically by the query
  };

  const selectTitle = (title: WatchmodeTitle) => {
    setSelectedTitle(title);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sub': return 'bg-green-500/20 text-green-300';
      case 'buy': return 'bg-blue-500/20 text-blue-300';
      case 'rent': return 'bg-yellow-500/20 text-yellow-300';
      case 'free': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
            Watchmode API Integration Demo
          </h1>
          <p className="text-gray-300 text-lg">
            Real-time streaming availability across 200+ platforms
          </p>
        </div>

        {/* Search Section */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Streaming Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for movies or TV shows..."
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button type="submit" disabled={isSearching}>
                {isSearching && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Search
              </Button>
            </form>

            {/* Search Results */}
            {searchResults?.titles && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Search Results</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.titles.slice(0, 6).map((title: WatchmodeTitle) => (
                    <Card 
                      key={title.id} 
                      className="bg-gray-800 border-gray-700 cursor-pointer hover:border-teal-500 transition-colors"
                      onClick={() => selectTitle(title)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {title.image_url && (
                            <img 
                              src={title.image_url} 
                              alt={title.title}
                              className="w-16 h-24 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{title.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {title.type?.replace('_', ' ')}
                              </Badge>
                              {title.year && (
                                <span className="text-gray-400 text-sm">{title.year}</span>
                              )}
                            </div>
                            {title.user_rating && (
                              <div className="flex items-center gap-1 mt-2">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-yellow-400">
                                  {title.user_rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Title Availability */}
        {selectedTitle && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Where to Watch: {selectedTitle.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAvailability ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading availability...</span>
                </div>
              ) : availability?.streamingPlatforms?.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="font-semibold">Available on {availability.streamingPlatforms.length} platform(s):</h4>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {availability.streamingPlatforms.map((platform: any, index: number) => (
                      <Card key={index} className="bg-gray-800 border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium truncate">{platform.provider_name}</h5>
                            <Badge className={getTypeColor(platform.type)}>
                              {platform.type}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Quality:</span>
                              <span>{platform.format}</span>
                            </div>
                            {platform.price && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Price:</span>
                                <span>${platform.price}</span>
                              </div>
                            )}
                          </div>

                          {platform.web_url && (
                            <Button 
                              size="sm" 
                              className="w-full mt-3"
                              onClick={() => window.open(platform.web_url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Watch Now
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No streaming availability found for this title</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Trending Content */}
        {trendingData?.titles && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Trending on Watchmode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {trendingData.titles.slice(0, 8).map((title: WatchmodeTitle) => (
                  <Card 
                    key={title.id}
                    className="bg-gray-800 border-gray-700 cursor-pointer hover:border-teal-500 transition-colors"
                    onClick={() => selectTitle(title)}
                  >
                    <CardContent className="p-3">
                      {title.image_url && (
                        <img 
                          src={title.image_url} 
                          alt={title.title}
                          className="w-full h-48 object-cover rounded mb-3"
                        />
                      )}
                      <h4 className="font-medium truncate">{title.title}</h4>
                      <div className="flex items-center justify-between mt-2">
                        {title.year && (
                          <span className="text-gray-400 text-sm">{title.year}</span>
                        )}
                        {title.user_rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-yellow-400">
                              {title.user_rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Supported Platforms */}
        {platforms && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Supported Streaming Platforms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(platforms).map(([platform, id]) => (
                  <div key={platform} className="flex justify-between items-center p-3 bg-gray-800 rounded">
                    <span className="font-medium">{platform}</span>
                    <Badge variant="outline" className="text-xs">ID: {id}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}