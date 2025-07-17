import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  List,
  Plus,
  Search,
  Star,
  Play,
  Tv,
  Film,
  Clock,
  Heart,
  MoreVertical,
  Filter,
  Grid3X3,
  LayoutList,
  Trash2,
  Share2,
  Edit3
} from "lucide-react";

interface MediaItem {
  id: string;
  title: string;
  poster_path: string;
  vote_average: number;
  media_type: string;
  overview: string;
  addedAt: string;
}

interface UserList {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  itemCount: number;
  items: MediaItem[];
  createdAt: string;
}

const mockLists: UserList[] = [
  {
    id: "1",
    name: "Must Watch",
    description: "My priority viewing list",
    isPublic: false,
    itemCount: 12,
    items: [
      {
        id: "1",
        title: "The Last of Us",
        poster_path: "/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
        vote_average: 8.7,
        media_type: "tv",
        overview: "Post-apocalyptic drama based on the video game",
        addedAt: "2025-01-15"
      },
      {
        id: "2",
        title: "Dune: Part Two",
        poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        vote_average: 8.5,
        media_type: "movie",
        overview: "Epic sci-fi continuation of the Dune saga",
        addedAt: "2025-01-14"
      }
    ],
    createdAt: "2025-01-10"
  },
  {
    id: "2",
    name: "Comedy Gold",
    description: "When I need a good laugh",
    isPublic: true,
    itemCount: 8,
    items: [
      {
        id: "3",
        title: "Ted Lasso",
        poster_path: "/5fKMNPhSzuFmpVTlOBo21YG9aK2.jpg",
        vote_average: 8.8,
        media_type: "tv",
        overview: "Heartwarming comedy about an American football coach",
        addedAt: "2025-01-12"
      }
    ],
    createdAt: "2025-01-05"
  },
  {
    id: "3",
    name: "Weekend Binge",
    description: "Perfect for lazy weekends",
    isPublic: false,
    itemCount: 15,
    items: [],
    createdAt: "2025-01-01"
  }
];

export default function ListsPage() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedList, setSelectedList] = useState<UserList | null>(null);

  // Filter lists based on search
  const filteredLists = mockLists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="text-center text-white max-w-md">
          <List className="w-16 h-16 mx-auto mb-4 text-teal-400" />
          <h1 className="text-2xl font-bold mb-4">Sign in to view your lists</h1>
          <p className="text-gray-400 mb-6">Create and organize your personal watchlists</p>
          <Button className="bg-teal-600 hover:bg-teal-700">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Mobile-first layout with proper spacing */}
      <div className="pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">My Lists</h1>
            <p className="text-gray-400 text-sm sm:text-base">Organize your favorite movies and shows</p>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search lists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-gray-400 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex-1 sm:flex-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex-1 sm:flex-none"
              >
                <LayoutList className="w-4 h-4" />
              </Button>
            </div>

            {/* Create List Button */}
            <Button className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create List
            </Button>
          </div>

          {/* Lists Grid/List View */}
          {filteredLists.length > 0 ? (
            <div className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                : "space-y-4"
            }>
              {filteredLists.map((list) => (
                <ListCard
                  key={list.id}
                  list={list}
                  viewMode={viewMode}
                  onClick={() => setSelectedList(list)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <List className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold text-white mb-2">No lists found</h3>
              <p className="text-gray-400 mb-6">Create your first list to get started</p>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First List
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* List Detail Modal/Overlay for mobile */}
      {selectedList && (
        <ListDetailOverlay
          list={selectedList}
          onClose={() => setSelectedList(null)}
        />
      )}
    </div>
  );
}

interface ListCardProps {
  list: UserList;
  viewMode: "grid" | "list";
  onClick: () => void;
}

function ListCard({ list, viewMode, onClick }: ListCardProps) {
  const isGrid = viewMode === "grid";

  return (
    <Card
      className={`bg-slate-800/50 border-slate-700 hover:border-teal-500/50 transition-all duration-300 cursor-pointer group ${isGrid ? '' : 'flex flex-row'
        }`}
      onClick={onClick}
    >
      {isGrid ? (
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-lg group-hover:text-teal-300 transition-colors truncate">
                  {list.name}
                </h3>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                  {list.description}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                {list.isPublic && (
                  <Badge variant="outline" className="text-xs">
                    Public
                  </Badge>
                )}
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Preview Images */}
            {list.items.length > 0 && (
              <div className="flex gap-2 overflow-hidden">
                {list.items.slice(0, 3).map((item, index) => (
                  <img
                    key={index}
                    src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                    alt={item.title}
                    className="w-12 h-16 sm:w-16 sm:h-20 object-cover rounded border border-slate-600"
                  />
                ))}
                {list.itemCount > 3 && (
                  <div className="w-12 h-16 sm:w-16 sm:h-20 bg-slate-700 border border-slate-600 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-400 font-medium">
                      +{list.itemCount - 3}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                {list.itemCount} {list.itemCount === 1 ? 'item' : 'items'}
              </span>
              <span className="text-gray-500">
                {new Date(list.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      ) : (
        <CardContent className="p-4 flex items-center gap-4 w-full">
          <div className="flex gap-2">
            {list.items.slice(0, 2).map((item, index) => (
              <img
                key={index}
                src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                alt={item.title}
                className="w-10 h-14 object-cover rounded border border-slate-600"
              />
            ))}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white group-hover:text-teal-300 transition-colors truncate">
              {list.name}
            </h3>
            <p className="text-gray-400 text-sm truncate">{list.description}</p>
            <p className="text-gray-500 text-xs">
              {list.itemCount} items
            </p>
          </div>

          <div className="flex items-center gap-2">
            {list.isPublic && (
              <Badge variant="outline" className="text-xs">
                Public
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

interface ListDetailOverlayProps {
  list: UserList;
  onClose: () => void;
}

function ListDetailOverlay({ list, onClose }: ListDetailOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-4xl mx-auto max-h-full overflow-auto">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{list.name}</h2>
              <p className="text-gray-400">{list.description}</p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {list.items.map((item) => (
              <div key={item.id} className="space-y-2">
                <img
                  src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                  alt={item.title}
                  className="w-full aspect-[2/3] object-cover rounded border border-slate-600"
                />
                <h4 className="text-white text-sm font-medium truncate">{item.title}</h4>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-yellow-400">{item.vote_average}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
