import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function QuickActionsCard() {
  const { toast } = useToast();

  return (
    <Card className="glass-effect border-slate-700/50 p-4 rounded-lg">
      <CardHeader>
        <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          className="w-full bg-gradient-to-r from-teal-600 to-blue-600"
          onClick={() => toast({ title: "Discover", description: "Navigate to Discover page" })}
        >
          <TrendingUp className="h-5 w-5 mr-2" />
          Discover Shows
        </Button>

        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
          onClick={() => toast({ title: "Social Feed", description: "Navigate to Social Feed" })}
        >
          <Users className="h-5 w-5 mr-2" />
          Social Feed
        </Button>

        <Button
          variant="outline"
          className="w-full border-slate-700 text-gray-300"
          onClick={() => toast({ title: "Collections", description: "Manage your collections" })}
        >
          <Settings className="h-5 w-5 mr-2" />
          Manage Collections
        </Button>
      </CardContent>
    </Card>
  );
}
