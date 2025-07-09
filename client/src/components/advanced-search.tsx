import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, Star, Calendar, Tv } from "lucide-react";
import ShowCard from "@/components/show-card";

interface AdvancedSearchProps {
  onClose?: () => void;
}

export default function AdvancedSearch({ onClose }: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [searchExecuted, setSearchExecuted] = useState(false);

  // Fetch genres and networks for filters
  const { data: genres = [] } = useQuery({
    queryKey: ['/api/search/genres'],
  });

  const { data: networks = [] } = useQuery({
    queryKey: ['/api/search/networks'],
  });

  // Search results
  const { data: searchResults, isLoading, refetch } = useQuery({
    queryKey: ['/api/search/advanced', {
      query: searchQuery,
      genres: selectedGenres.join(','),
      networks: selectedNetworks.join(','),
      yearFrom: yearFrom || undefined,
      yearTo: yearTo || undefined,
      rating: minRating || undefined,
      sortBy
    }],
    enabled: false, // Only run when manually triggered
  });

  const handleSearch = () => {
    setSearchExecuted(true);
    refetch();
  };

  const handleGenreToggle = (genreName: string) => {
    setSelectedGenres(prev => 
      prev.includes(genreName) 
        ? prev.filter(g => g !== genreName)
        : [...prev, genreName]
    );
  };

  const handleNetworkToggle = (networkName: string) => {
    setSelectedNetworks(prev => 
      prev.includes(networkName) 
        ? prev.filter(n => n !== networkName)
        : [...prev, networkName]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGenres([]);
    setSelectedNetworks([]);
    setYearFrom("");
    setYearTo("");
    setMinRating("");
    setSortBy("popularity.desc");
    setSearchExecuted(false);
  };

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'first_air_date.desc', label: 'Newest' },
    { value: 'first_air_date.asc', label: 'Oldest' }
  ];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Advanced Search</h2>
        </div>
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        )}
      </div>

      {/* Search Form */}
      <Card className="glass-effect border-white/10">
        <CardHeader>
          <CardTitle className="text-lg">Search Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="search-query">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-query"
                placeholder="Search for shows, actors, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Genres */}
          <div className="space-y-2">
            <Label>Genres</Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {genres.map((genre: any) => (
                <Badge
                  key={genre.id}
                  variant={selectedGenres.includes(genre.name) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => handleGenreToggle(genre.name)}
                >
                  {genre.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Networks */}
          <div className="space-y-2">
            <Label>Networks & Streaming Platforms</Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {networks.map((network: any) => (
                <Badge
                  key={network.id}
                  variant={selectedNetworks.includes(network.name) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => handleNetworkToggle(network.name)}
                >
                  <Tv className="w-3 h-3 mr-1" />
                  {network.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Year Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year-from">From Year</Label>
              <Input
                id="year-from"
                type="number"
                placeholder="1950"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year-to">To Year</Label>
              <Input
                id="year-to"
                type="number"
                placeholder={new Date().getFullYear().toString()}
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          {/* Rating and Sort */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-rating">Minimum Rating</Label>
              <div className="relative">
                <Star className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="min-rating"
                  type="number"
                  placeholder="7.0"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  min="0"
                  max="10"
                  step="0.1"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              onClick={handleSearch} 
              disabled={isLoading}
              className="flex-1 bg-gradient-purple hover:opacity-90"
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchExecuted && (
        <div className="space-y-4">
          <Separator />
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Searching...</p>
            </div>
          ) : searchResults?.results ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Search Results ({searchResults.totalResults} found)
                </h3>
                {searchResults.totalPages > 1 && (
                  <p className="text-sm text-muted-foreground">
                    Page 1 of {searchResults.totalPages}
                  </p>
                )}
              </div>

              {searchResults.results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.results.map((show: any) => (
                    <ShowCard key={show.tmdbId} show={show} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No shows found matching your criteria.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Quick Filter Shortcuts */}
      <Card className="glass-effect border-white/10">
        <CardHeader>
          <CardTitle className="text-lg">Quick Searches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedNetworks(["Netflix"]);
                setSearchExecuted(true);
                refetch();
              }}
            >
              Netflix Originals
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedGenres(["Sci-Fi & Fantasy"]);
                setMinRating("8.0");
                setSearchExecuted(true);
                refetch();
              }}
            >
              Top Sci-Fi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setYearFrom("2020");
                setSortBy("vote_average.desc");
                setSearchExecuted(true);
                refetch();
              }}
            >
              Recent Hits
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedGenres(["Comedy"]);
                setSelectedNetworks(["HBO"]);
                setSearchExecuted(true);
                refetch();
              }}
            >
              HBO Comedy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}