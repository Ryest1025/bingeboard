
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserActions } from "@/hooks/useUserActions";
import UniversalShowCard from "@/components/global/UniversalShowCard";
import BrandedShowModal from "@/components/search/BrandedShowModal";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layouts/AppLayout";

const testShows = [
  {
    id: "test1",
    title: "Test Show 1",
    mediaType: "movie",
    posterUrl: "https://via.placeholder.com/200x300",
    rating: 8.2,
    genres: ["Action", "Adventure"],
    streamingPlatform: "Netflix",
  },
  {
    id: "test2",
    title: "Test Show 2",
    mediaType: "tv",
    posterUrl: "https://via.placeholder.com/200x300",
    rating: 7.5,
    genres: ["Drama"],
    streamingPlatform: "Hulu",
  },
  {
    id: "test3",
    title: "Test Show 3",
    mediaType: "movie",
    posterUrl: "https://via.placeholder.com/200x300",
    rating: 9.0,
    genres: ["Comedy"],
    streamingPlatform: "Prime Video",
  },
];

export default function UserActionsTestPage() {
  const { isAuthenticated } = useAuth();
  const { addToList, removeFromList, toggleRemind, isInList, isReminded, loading } = useUserActions();
  const { toast } = useToast();

  const [modalShowId, setModalShowId] = useState<string | null>(null);
  const [modalShowType, setModalShowType] = useState<string>("movie");
  const [activeTab, setActiveTab] = useState<"all" | "tv" | "movies" | "watchlist">("all");

  const filteredShows = testShows.filter((show) => {
    if (activeTab === "tv") return show.mediaType === "tv";
    if (activeTab === "movies") return show.mediaType === "movie";
    if (activeTab === "watchlist") return isInList(show.id);
    return true; // all
  });

  const handleAddRemove = async (id: string, mediaType: string) => {
    if (isInList(id)) {
      await removeFromList(id);
      toast({ title: "Removed from watchlist", description: "Show removed from your list" });
    } else {
      await addToList(id, mediaType);
      toast({ title: "Added to watchlist", description: "Show added to your list" });
    }
  };

  const handleRemind = async (id: string) => {
    await toggleRemind(id);
    toast({ title: isReminded(id) ? "Reminder removed" : "Reminder set", description: "Reminder preference updated" });
  };

  const openModal = (id: string, mediaType: string) => {
    setModalShowId(id);
    setModalShowType(mediaType);
  };

  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🧪 useUserActions Dev Page
        </h1>

        {!isAuthenticated && (
          <p className="text-center text-red-400 mb-6">
            Not authenticated – actions will show login prompts
          </p>
        )}

        {/* Tabs for All / TV / Movies / Watchlist */}
        <div className="flex justify-center gap-4 mb-8">
          {(["all", "tv", "movies", "watchlist"] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? "bg-teal-600 hover:bg-teal-700" : ""}
            >
              {tab === "all" ? "All" : tab === "watchlist" ? "Watchlist" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredShows.length > 0 ? (
            filteredShows.map((show) => (
              <UniversalShowCard
                key={show.id}
                show={show}
                showQuickActions={true}
                onAddToList={() => handleAddRemove(show.id, show.mediaType)}
                onRemoveFromList={() => handleAddRemove(show.id, show.mediaType)}
                onClick={() => openModal(show.id, show.mediaType)}
              />
            ))
          ) : (
            <p className="text-center text-gray-300 col-span-full">
              No shows for this category
            </p>
          )}
        </div>

        {/* Bulk Actions */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={() => {
              filteredShows.forEach((show) => {
                if (!isInList(show.id)) addToList(show.id, show.mediaType);
              });
              toast({ title: "Added all shows to watchlist", description: "All test shows added to your list" });
            }}
            disabled={loading}
          >
            Add All to List
          </Button>

          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={() => {
              filteredShows.forEach((show) => {
                if (isInList(show.id)) removeFromList(show.id);
              });
              toast({ title: "Removed all shows from watchlist", description: "All test shows removed from your list" });
            }}
            disabled={loading}
          >
            Remove All from List
          </Button>

          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => {
              filteredShows.forEach((show) => {
                if (!isReminded(show.id)) toggleRemind(show.id);
              });
              toast({ title: "Set reminders for all shows", description: "Reminders enabled for all test shows" });
            }}
            disabled={loading}
          >
            Set All Reminders
          </Button>
        </div>

        {/* BrandedShowModal */}
        {modalShowId && (
          <BrandedShowModal
            showId={modalShowId}
            showType={modalShowType}
            open={!!modalShowId}
            onClose={() => setModalShowId(null)}
            onAddToWatchlist={() => handleAddRemove(modalShowId, modalShowType)}
          />
        )}
      </div>
    </AppLayout>
  );
}
