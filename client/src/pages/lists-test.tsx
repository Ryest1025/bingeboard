import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sparkles, Clock, Tv, SlidersHorizontal, ListIcon, Play } from "lucide-react";
import { motion } from "framer-motion";

const TABS = [
  { key: "my", label: "My Lists", icon: ListIcon },
  { key: "genre", label: "By Genre", icon: Sparkles },
  { key: "network", label: "By Network", icon: Tv },
  { key: "coming", label: "Coming Soon", icon: Clock },
  { key: "custom", label: "Custom", icon: SlidersHorizontal },
];

export default function BingeListPage() {
  const [tab, setTab] = useState("my");
  const [selectedShow, setSelectedShow] = useState<any>(null);
  const [showAd, setShowAd] = useState(true);
  const [search, setSearch] = useState("");

  // Simulated ad delay (5 seconds before trailer starts)
  useEffect(() => {
    if (showAd && selectedShow) {
      const timer = setTimeout(() => setShowAd(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showAd, selectedShow]);

  const { data: lists = [], error, isLoading } = useQuery({
    queryKey: ["lists", tab],
    queryFn: async () => {
      const mockToken = "mock-token-for-development-" + Date.now();
      
      console.log('📋 Fetching lists of type:', tab);
      const response = await fetch(`/api/lists?type=${tab}`, {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching lists:', response.status, response.statusText, errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      return response.json();
    },
  });

  const filteredLists = lists.filter((list: any) =>
    list.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs & Search */}
        <div className="flex flex-wrap gap-3 items-center mb-6">
          {TABS.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={tab === key ? "default" : "ghost"}
              onClick={() => setTab(key)}
            >
              <Icon className="w-4 h-4 mr-1" /> {label}
            </Button>
          ))}
          <Input
            placeholder="Search your lists..."
            className="bg-slate-800 border-slate-600 max-w-xs ml-auto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Grid of Lists */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-10">
              <div className="animate-spin h-10 w-10 border-4 border-teal-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading lists...</p>
            </div>
          ) : error ? (
            <div className="col-span-full bg-red-900/30 text-white p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Error Loading Lists</h3>
              <p>{error instanceof Error ? error.message : "Unknown error"}</p>
              <button
                className="mt-4 bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : filteredLists.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <p>No lists found for this type.</p>
            </div>
          ) : (
            filteredLists.map((list: any) => (
              <Card key={list.id} className="bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {list.name}
                    <Play
                      className="w-5 h-5 cursor-pointer text-teal-400"
                      onClick={() => {
                        setShowAd(true);
                        setSelectedShow(list.shows[0]);
                      }}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 overflow-x-auto">
                    {list.shows.map((show: any) => (
                      <img
                        key={show.id}
                        src={show.poster}
                        alt={show.title}
                        className="w-20 h-28 rounded object-cover cursor-pointer"
                        onClick={() => {
                          setShowAd(true);
                          setSelectedShow(show);
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Trailer Dialog */}
      <Dialog open={!!selectedShow} onOpenChange={() => setSelectedShow(null)}>
        <DialogContent className="bg-slate-900 text-white max-w-xl">
          {selectedShow && (
            <div>
              <DialogTitle className="mb-2">{selectedShow.title}</DialogTitle>
              <p className="text-sm text-gray-400 mb-4">
                {selectedShow.description}
              </p>

              {showAd ? (
                <div className="w-full h-56 bg-black flex items-center justify-center">
                  <p>🔸 Ad playing... (5 sec)</p>
                </div>
              ) : (
                <ReactPlayer
                  url={selectedShow.trailerUrl}
                  controls={true}
                  playing={true}
                  width="100%"
                  height="240px"
                />
              )}

              <div className="mt-4 text-right">
                <Button
                  onClick={() =>
                    window.open(selectedShow.affiliateUrl, "_blank")
                  }
                  className="bg-[#14b8a6]"
                >
                  Watch Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
