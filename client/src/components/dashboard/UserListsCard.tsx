import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface List {
  id: string;
  name: string;
  items?: any[];
  itemCount?: number;
}

interface UserListsCardProps {
  lists?: List[];
  onCreate?: () => void;
}

export default function UserListsCard({ lists, onCreate }: UserListsCardProps) {
  // Fetch real user lists data
  const { data: listsData, isLoading } = useQuery({
    queryKey: ["/api/user/lists"],
    queryFn: async () => {
      const res = await fetch("/api/user/lists", {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch user lists");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-slate-900">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-lg">Your Lists</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-cyan-400 hover:text-cyan-300"
          >
            <Plus className="w-4 h-4 mr-1" /> Add new
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 min-w-[200px]">
                <div className="bg-slate-700 h-5 w-24 animate-pulse mb-3"></div>
                <div className="flex gap-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="w-10 h-14 bg-slate-700 animate-pulse flex-shrink-0"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const userLists = lists || listsData?.lists || [];

  return (
    <Card className="bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white text-lg">Your Lists</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-cyan-400 hover:text-cyan-300"
          onClick={onCreate}
        >
          <Plus className="w-4 h-4 mr-1" /> Add new
        </Button>
      </CardHeader>
      <CardContent>
        {userLists.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No lists created yet</p>
            <Button
              variant="outline"
              className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
              onClick={onCreate}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create your first list
            </Button>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-2">
            {userLists.map((list: any) => (
              <div key={list.id} className="flex-shrink-0 min-w-[200px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium text-sm truncate">{list.name}</h3>
                  <span className="text-gray-400 text-xs">
                    {list.itemCount || 0}
                  </span>
                </div>
                <div className="flex gap-2">
                  {/* Mock poster placeholders - replace with actual list items */}
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="w-10 h-14 bg-slate-700 flex-shrink-0 flex items-center justify-center">
                      <span className="text-xs text-gray-400">{index}</span>
                    </div>
                  ))}
                  <button
                    className="w-10 h-14 border-2 border-dashed border-slate-600 flex items-center justify-center hover:border-slate-500 transition flex-shrink-0"
                    onClick={() => console.log('Add to list:', list.name)}
                  >
                    <Plus className="w-3 h-3 text-slate-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
