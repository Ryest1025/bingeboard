import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopNav } from "@/components/top-nav";
import MobileNav from "@/components/mobile-nav";
import ViewingHistoryImport from "@/components/viewing-history-import";

export default function ImportHistory() {
  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      
      <div className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Import Viewing History</h1>
            <p className="text-gray-400">
              Import your viewing history from streaming platforms to get better personalized recommendations. 
              The more data you provide, the more accurate your suggestions will be.
            </p>
          </div>

          {/* Import Component */}
          <ViewingHistoryImport />

          {/* Benefits Section */}
          <div className="mt-12 p-6 bg-gray-900/50 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Why Import Your Viewing History?</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <h3 className="font-medium text-white mb-2">Better Recommendations</h3>
                <p>Our AI learns from your actual viewing patterns to suggest shows you'll love</p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">Track Progress</h3>
                <p>See what you've watched and pick up where you left off across platforms</p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">Discover Patterns</h3>
                <p>Learn about your viewing habits and discover new genres you might enjoy</p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">Avoid Rewatching</h3>
                <p>Never accidentally start a show you've already completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}