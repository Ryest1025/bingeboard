import { Link } from "wouter";
import { Tv, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function UpcomingSimple() {
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
            <nav className="hidden md:flex space-x-6">
              <Link href="/discover" className="hover:text-binge-purple transition-colors">Discover</Link>
              <Link href="/upcoming" className="text-binge-purple font-medium">Upcoming</Link>
              <Link href="/friends" className="hover:text-binge-purple transition-colors">Binge Friends</Link>
            </nav>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Upcoming Releases</h1>
          <p className="text-muted-foreground">Track your favorite shows and never miss a premiere</p>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Upcoming Releases</h3>
            <p className="text-muted-foreground">
              Add shows to your watchlist to see their upcoming releases here!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}