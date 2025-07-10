import { useState } from "react";
import NavigationHeader from "@/components/navigation-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserPlus, Search } from "lucide-react";

export default function FindFriendsWorking() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-binge-dark text-white">
      <NavigationHeader />
      
      <div className="pt-16 min-h-screen">
        {/* Header */}
        <div className="bg-gradient-dark py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find <span className="text-gradient-purple">Friends</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Discover and connect with friends on BingeBoard
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Search Section */}
          <Card className="glass-effect border-white/10 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold">Search Users</h2>
              </div>
              <div className="flex gap-4">
                <Input
                  placeholder="Search by username, name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button
                  disabled={searchQuery.length < 3}
                  className="bg-gradient-purple hover:opacity-90"
                >
                  Search
                </Button>
              </div>
              {searchQuery.length < 3 && (
                <p className="text-sm text-gray-400 mt-2">
                  Type at least 3 characters to search
                </p>
              )}
            </CardContent>
          </Card>

          {/* Import Contacts */}
          <Card className="glass-effect border-white/10 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold">Import Contacts</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Import your contacts to find friends who are already on BingeBoard.
              </p>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Import Contacts
              </Button>
            </CardContent>
          </Card>

          {/* Coming Soon */}
          <Card className="glass-effect border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold">More Features Coming Soon</h2>
              </div>
              <ul className="text-gray-300 space-y-2">
                <li>• Friend suggestions based on mutual connections</li>
                <li>• Social media integration</li>
                <li>• Contact synchronization</li>
                <li>• Smart friend discovery</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}