import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, UserPlus } from "lucide-react";

export default function FindFriendsBasic() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-binge-charcoal text-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Friends</h1>
          <p className="text-gray-300">Discover and connect with friends on BingeBoard</p>
        </div>

        {/* Search Section */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by username, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              <Button
                disabled={searchQuery.length < 3}
                className="bg-gradient-purple hover:opacity-90"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {searchQuery.length < 3 && (
              <p className="text-sm text-gray-400">
                Type at least 3 characters to search
              </p>
            )}
          </CardContent>
        </Card>

        {/* Contact Import Section */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Import Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
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
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">More Features Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
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
  );
}