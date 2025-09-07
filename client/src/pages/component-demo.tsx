import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import EnhancedFilterSystem from '@/components/common/EnhancedFilterSystem';
import UserFeedback from '@/components/common/UserFeedback';
import CollectionManager from '@/components/common/CollectionManager';
import RecommendationCard from '@/components/common/RecommendationCard';
import { Filter, Heart, FolderOpen, Star } from 'lucide-react';

export default function ComponentDemo() {
  const [activeTab, setActiveTab] = useState('filters');
  const [showFeedback, setShowFeedback] = useState(false);

  // Sample show data for demonstration
  const sampleShow = {
    tmdbId: 12345,
    title: "The Last of Us",
    overview: "Joel and Ellie, a pair connected through the harshness of the world they live in, are forced to endure brutal circumstances and ruthless killers on a trek across a post-pandemic America.",
    posterPath: "https://image.tmdb.org/t/p/w300/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
    rating: 8.8,
    streamingPlatforms: [
      { provider_id: 1, provider_name: "Netflix", logo_path: "/netflix.png" },
      { provider_id: 2, provider_name: "HBO Max", logo_path: "/hbo.png" }
    ],
    hasTrailer: true,
    trailerUrl: "https://youtube.com/watch?v=example"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Enhanced Bingeboard Components
            </CardTitle>
            <p className="text-center text-gray-300">
              Comprehensive database features with modern UX patterns
            </p>
          </CardHeader>
        </Card>

        {/* Component Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="filters" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Enhanced Filters
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              User Feedback
            </TabsTrigger>
            <TabsTrigger value="collections" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Enhanced Cards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="filters" className="space-y-6">
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle>Enhanced Filter System</CardTitle>
                <p className="text-gray-400">
                  Comprehensive filtering with mood detection, accessibility options, and saveable presets
                </p>
              </CardHeader>
              <CardContent>
                <EnhancedFilterSystem />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle>Quick Feedback Mode</CardTitle>
                  <p className="text-gray-400">
                    One-click feedback collection with smart defaults
                  </p>
                </CardHeader>
                <CardContent>
                  <UserFeedback
                    contentId={sampleShow.tmdbId}
                    contentType="tv"
                    contentTitle={sampleShow.title}
                    initialRating={7.5}
                  />
                </CardContent>
              </Card>

              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle>Detailed Feedback Mode</CardTitle>
                  <p className="text-gray-400">
                    Comprehensive feedback with ratings, tags, and comments
                  </p>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setShowFeedback(true)}
                    className="w-full"
                  >
                    Open Detailed Feedback
                  </Button>
                  {showFeedback && (
                    <div className="mt-4">
                      <UserFeedback
                        contentId={sampleShow.tmdbId}
                        contentType="tv"
                        contentTitle={sampleShow.title}
                        onClose={() => setShowFeedback(false)}
                        initialRating={0}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle>Collection Management</CardTitle>
                <p className="text-gray-400">
                  Create, organize, and manage collections with soft delete functionality
                </p>
              </CardHeader>
              <CardContent>
                <CollectionManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle>Enhanced Recommendation Cards</CardTitle>
                <p className="text-gray-400">
                  Improved UX with quick feedback actions and better hover states
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <RecommendationCard
                    show={sampleShow}
                    variant="default"
                    onInteraction={(action, id) => {
                      console.log(`Action: ${action} on content ${id}`);
                    }}
                  />
                  <RecommendationCard
                    show={{
                      ...sampleShow,
                      tmdbId: 12346,
                      title: "Breaking Bad",
                      overview: "A high school chemistry teacher turned methamphetamine manufacturer.",
                      posterPath: "https://image.tmdb.org/t/p/w300/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg",
                      rating: 9.5
                    }}
                    variant="compact"
                    isInWatchlist={true}
                    onInteraction={(action, id) => {
                      console.log(`Action: ${action} on content ${id}`);
                    }}
                  />
                  <RecommendationCard
                    show={{
                      ...sampleShow,
                      tmdbId: 12347,
                      title: "Stranger Things",
                      overview: "A group of kids uncover supernatural mysteries in their small town.",
                      posterPath: "https://image.tmdb.org/t/p/w300/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg",
                      rating: 8.7
                    }}
                    variant="large"
                    isSeen={true}
                    onInteraction={(action, id) => {
                      console.log(`Action: ${action} on content ${id}`);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Feature Summary */}
        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle>Implementation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-400">✅ Database Enhanced</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 32 tables with relationships</li>
                  <li>• Soft delete functionality</li>
                  <li>• Automatic triggers</li>
                  <li>• CHECK constraints</li>
                  <li>• 25 performance indexes</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-400">✅ React Components</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Enhanced filter system</li>
                  <li>• User feedback collection</li>
                  <li>• Collection management</li>
                  <li>• Improved recommendation cards</li>
                  <li>• Centralized architecture</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-400">✅ API Integration</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• TypeScript storage methods</li>
                  <li>• Next.js API routes</li>
                  <li>• React Query integration</li>
                  <li>• Error handling</li>
                  <li>• Activity logging</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-yellow-400">✅ UX Features</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Mood-based filtering</li>
                  <li>• Quick feedback actions</li>
                  <li>• Accessibility support</li>
                  <li>• Filter presets</li>
                  <li>• Hybrid interactions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
