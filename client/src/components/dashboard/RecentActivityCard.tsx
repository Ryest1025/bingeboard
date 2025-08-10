import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FriendActivityCardProps {
  activities?: any[];
  onRefresh?: () => void;
  feed?: any[];
}

export default function FriendActivityCard({ activities, feed, onRefresh }: FriendActivityCardProps) {
  // Mock data to match the reference design
  const mockFriends = [
    {
      id: 1,
      name: "Bear",
      avatar: "/api/placeholder/32/32",
      watching: "The Bear"
    },
    {
      id: 2,
      name: "Alex",
      avatar: "/api/placeholder/32/32",
      watching: "Succession"
    },
    {
      id: 3,
      name: "Sam",
      avatar: "/api/placeholder/32/32",
      watching: "Breaking Bad"
    },
  ];

  return (
    <Card className="bg-slate-900">
      <CardHeader>
        <CardTitle className="text-white text-lg">Your Friends Are Watching</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockFriends.map((friend) => (
          <div key={friend.id} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm">{friend.name}</h4>
              <p className="text-gray-400 text-xs">watching {friend.watching}</p>
            </div>
          </div>
        ))}

        <div className="flex justify-center pt-2">
          <div className="w-6 h-1 bg-slate-700 rounded-full"></div>
        </div>
      </CardContent>
    </Card>
  );
}
