import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Filter, ChevronDown, X, Plus, Bell, Star, Award, Calendar, Clock, Globe } from "lucide-react";
import { ShowCard } from "./show-card";
import { useToast } from "@/hooks/use-toast";

interface AdvancedFilters {
  query: string;
  genres: string[];
  networks: string[];
  contentRatings: string[];
  languages: string[];
  countries: string[];
  yearFrom: number;
  yearTo: number;
  minRating: number;
  maxRating: number;
  runtimeMin: number;
  runtimeMax: number;
  keywords: string[];
  withCompanies: string[];
  withPeople: string[];
  awards: string[];
  status: string;
  mediaType: string;
  includeAdult: boolean;
  trendingPeriod: string;
  sortBy: string;
}

const initialFilters: AdvancedFilters = {
  query: "",
  genres: [],
  networks: [],
  contentRatings: [],
  languages: [],
  countries: [],
  yearFrom: 1950,
  yearTo: new Date().getFullYear() + 2,
  minRating: 0,
  maxRating: 10,
  runtimeMin: 0,
  runtimeMax: 300,
  keywords: [],
  withCompanies: [],
  withPeople: [],
  awards: [],
  status: "",
  mediaType: "tv",
  includeAdult: false,
  trendingPeriod: "",
  sortBy: "popularity.desc"
};

const CONTENT_RATINGS = [
  "G", "PG", "PG-13", "R", "NC-17", "TV-Y", "TV-Y7", "TV-G", "TV-PG", "TV-14", "TV-MA"
];

const POPULAR_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "hi", name: "Hindi" },
  { code: "pt", name: "Portuguese" }
];

const POPULAR_COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "AU", name: "Australia" }
];

const AWARDS = [
  "Emmy Awards", "Golden Globe Awards", "Critics Choice Awards", 
  "Screen Actors Guild Awards", "BAFTA Awards", "Peabody Awards",
  "Academy Awards", "Independent Spirit Awards"
];

const STATUS_OPTIONS = [
  { value: "returning", label: "Returning Series" },
  { value: "ended", label: "Ended" },
  { value: "cancelled", label: "Cancelled" },
  { value: "in_production", label: "In Production" },
  { value: "planned", label: "Planned" },
  { value: "pilot", label: "Pilot" }
];

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "popularity.asc", label: "Least Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "vote_average.asc", label: "Lowest Rated" },
  { value: "first_air_date.desc", label: "Latest Release" },
  { value: "first_air_date.asc", label: "Oldest Release" },
  { value: "vote_count.desc", label: "Most Votes" },
  { value: "original_title.asc", label: "A-Z" }
];

export function EnhancedAdvancedSearch() {
  const [filters, setFilters] = useState<AdvancedFilters>(initialFilters);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [keywordInput, setKeywordInput] = useState("");
  const [personInput, setPersonInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [alertName, setAlertName] = useState("");
  const { toast } = useToast();

  // Fetch available genres and networks
  const { data: genreData } = useQuery({
    queryKey: ["/api/search/genres"],
    retry: false,
  });

  const { data: networkData } = useQuery({
    queryKey: ["/api/search/networks"],
    retry: false,
  });

  const performSearch = async (page = 1) => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        ...Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [
            key,
            Array.isArray(value) ? value.join(",") : value.toString()
          ])
        ),
        page: page.toString()
      });

      const response = await fetch(`/api/search/advanced?${params}`);
      const data = await response.json();

      if (page === 1) {
        setResults(data.results || []);
        setTotalResults(data.totalResults || 0);
      } else {
        setResults(prev => [...prev, ...(data.results || [])]);
      }
      
      setCurrentPage(page);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterChange = (key: keyof AdvancedFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addToList = (list: string[], item: string) => {
    if (item && !list.includes(item)) {
      return [...list, item];
    }
    return list;
  };

  const removeFromList = (list: string[], item: string) => {
    return list.filter(x => x !== item);
  };

  const saveAsAlert = async () => {
    if (!alertName.trim()) {
      toast({
        title: "Alert Name Required",
        description: "Please enter a name for your search alert.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/search-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: alertName,
          ...filters,
          notificationFrequency: "daily"
        }),
      });

      if (response.ok) {
        toast({
          title: "Search Alert Created",
          description: `"${alertName}" will notify you of new matching content.`,
        });
        setShowSaveAlert(false);
        setAlertName("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create search alert.",
        variant: "destructive",
      });
    }
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setResults([]);
    setTotalResults(0);
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.query) count++;
    if (filters.genres.length) count++;
    if (filters.networks.length) count++;
    if (filters.contentRatings.length) count++;
    if (filters.languages.length) count++;
    if (filters.countries.length) count++;
    if (filters.yearFrom !== 1950 || filters.yearTo !== new Date().getFullYear() + 2) count++;
    if (filters.minRating !== 0 || filters.maxRating !== 10) count++;
    if (filters.runtimeMin !== 0 || filters.runtimeMax !== 300) count++;
    if (filters.keywords.length) count++;
    if (filters.withPeople.length) count++;
    if (filters.withCompanies.length) count++;
    if (filters.awards.length) count++;
    if (filters.status) count++;
    if (filters.trendingPeriod) count++;
    if (filters.includeAdult) count++;
    return count;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Search & Filtering
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary">{getActiveFilterCount()} active</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="search-query">Search Query</Label>
            <div className="flex gap-2">
              <Input
                id="search-query"
                placeholder="Search for shows, movies, actors, directors..."
                value={filters.query}
                onChange={(e) => handleFilterChange("query", e.target.value)}
              />
              <Button onClick={() => performSearch(1)} disabled={isSearching}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Basic Filters */}
            <TabsContent value="basic" className="space-y-4">
              {/* Media Type */}
              <div className="space-y-2">
                <Label>Media Type</Label>
                <Select
                  value={filters.mediaType}
                  onValueChange={(value) => handleFilterChange("mediaType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tv">TV Shows</SelectItem>
                    <SelectItem value="movie">Movies</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Genres */}
              <div className="space-y-2">
                <Label>Genres</Label>
                <ScrollArea className="h-32 w-full border rounded-md p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {genreData?.map((genre: any) => (
                      <div key={genre.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`genre-${genre.id}`}
                          checked={filters.genres.includes(genre.id.toString())}
                          onCheckedChange={(checked) => {
                            const genreId = genre.id.toString();
                            if (checked) {
                              handleFilterChange("genres", addToList(filters.genres, genreId));
                            } else {
                              handleFilterChange("genres", removeFromList(filters.genres, genreId));
                            }
                          }}
                        />
                        <Label htmlFor={`genre-${genre.id}`} className="text-sm">
                          {genre.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {filters.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.genres.map(genreId => {
                      const genre = genreData?.find((g: any) => g.id.toString() === genreId);
                      return genre ? (
                        <Badge key={genreId} variant="secondary" className="text-xs">
                          {genre.name}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => handleFilterChange("genres", removeFromList(filters.genres, genreId))}
                          />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Networks */}
              <div className="space-y-2">
                <Label>Streaming Networks</Label>
                <ScrollArea className="h-32 w-full border rounded-md p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {networkData?.map((network: any) => (
                      <div key={network.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`network-${network.id}`}
                          checked={filters.networks.includes(network.id.toString())}
                          onCheckedChange={(checked) => {
                            const networkId = network.id.toString();
                            if (checked) {
                              handleFilterChange("networks", addToList(filters.networks, networkId));
                            } else {
                              handleFilterChange("networks", removeFromList(filters.networks, networkId));
                            }
                          }}
                        />
                        <Label htmlFor={`network-${network.id}`} className="text-sm">
                          {network.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Year Range */}
              <div className="space-y-2">
                <Label>Release Year Range</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Label className="text-xs">From: {filters.yearFrom}</Label>
                    <Slider
                      value={[filters.yearFrom]}
                      onValueChange={(value) => handleFilterChange("yearFrom", value[0])}
                      min={1950}
                      max={new Date().getFullYear() + 2}
                      step={1}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">To: {filters.yearTo}</Label>
                    <Slider
                      value={[filters.yearTo]}
                      onValueChange={(value) => handleFilterChange("yearTo", value[0])}
                      min={1950}
                      max={new Date().getFullYear() + 2}
                      step={1}
                    />
                  </div>
                </div>
              </div>

              {/* Rating Range */}
              <div className="space-y-2">
                <Label>Rating Range</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Label className="text-xs">Min: {filters.minRating}</Label>
                    <Slider
                      value={[filters.minRating]}
                      onValueChange={(value) => handleFilterChange("minRating", value[0])}
                      min={0}
                      max={10}
                      step={0.1}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Max: {filters.maxRating}</Label>
                    <Slider
                      value={[filters.maxRating]}
                      onValueChange={(value) => handleFilterChange("maxRating", value[0])}
                      min={0}
                      max={10}
                      step={0.1}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Content Filters */}
            <TabsContent value="content" className="space-y-4">
              {/* Content Ratings */}
              <div className="space-y-2">
                <Label>Content Ratings</Label>
                <div className="grid grid-cols-4 gap-2">
                  {CONTENT_RATINGS.map(rating => (
                    <div key={rating} className="flex items-center space-x-2">
                      <Checkbox
                        id={`rating-${rating}`}
                        checked={filters.contentRatings.includes(rating)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleFilterChange("contentRatings", addToList(filters.contentRatings, rating));
                          } else {
                            handleFilterChange("contentRatings", removeFromList(filters.contentRatings, rating));
                          }
                        }}
                      />
                      <Label htmlFor={`rating-${rating}`} className="text-sm">
                        {rating}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Runtime */}
              <div className="space-y-2">
                <Label>Episode/Movie Length (minutes)</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Label className="text-xs">Min: {filters.runtimeMin}</Label>
                    <Slider
                      value={[filters.runtimeMin]}
                      onValueChange={(value) => handleFilterChange("runtimeMin", value[0])}
                      min={0}
                      max={300}
                      step={5}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Max: {filters.runtimeMax}</Label>
                    <Slider
                      value={[filters.runtimeMax]}
                      onValueChange={(value) => handleFilterChange("runtimeMax", value[0])}
                      min={0}
                      max={300}
                      step={5}
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Show Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any status</SelectItem>
                    {STATUS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Awards */}
              <div className="space-y-2">
                <Label>Awards</Label>
                <div className="grid grid-cols-2 gap-2">
                  {AWARDS.map(award => (
                    <div key={award} className="flex items-center space-x-2">
                      <Checkbox
                        id={`award-${award}`}
                        checked={filters.awards.includes(award)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleFilterChange("awards", addToList(filters.awards, award));
                          } else {
                            handleFilterChange("awards", removeFromList(filters.awards, award));
                          }
                        }}
                      />
                      <Label htmlFor={`award-${award}`} className="text-sm">
                        <Award className="h-3 w-3 inline mr-1" />
                        {award}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Technical Filters */}
            <TabsContent value="technical" className="space-y-4">
              {/* Languages */}
              <div className="space-y-2">
                <Label>Original Language</Label>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_LANGUAGES.map(lang => (
                    <div key={lang.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${lang.code}`}
                        checked={filters.languages.includes(lang.code)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleFilterChange("languages", addToList(filters.languages, lang.code));
                          } else {
                            handleFilterChange("languages", removeFromList(filters.languages, lang.code));
                          }
                        }}
                      />
                      <Label htmlFor={`lang-${lang.code}`} className="text-sm">
                        <Globe className="h-3 w-3 inline mr-1" />
                        {lang.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Countries */}
              <div className="space-y-2">
                <Label>Production Country</Label>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_COUNTRIES.map(country => (
                    <div key={country.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={`country-${country.code}`}
                        checked={filters.countries.includes(country.code)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleFilterChange("countries", addToList(filters.countries, country.code));
                          } else {
                            handleFilterChange("countries", removeFromList(filters.countries, country.code));
                          }
                        }}
                      />
                      <Label htmlFor={`country-${country.code}`} className="text-sm">
                        {country.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending */}
              <div className="space-y-2">
                <Label>Trending Period</Label>
                <Select
                  value={filters.trendingPeriod}
                  onValueChange={(value) => handleFilterChange("trendingPeriod", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No trending filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No trending filter</SelectItem>
                    <SelectItem value="day">Trending Today</SelectItem>
                    <SelectItem value="week">Trending This Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => handleFilterChange("sortBy", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Advanced Filters */}
            <TabsContent value="advanced" className="space-y-4">
              {/* Keywords */}
              <div className="space-y-2">
                <Label>Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add keyword..."
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && keywordInput.trim()) {
                        handleFilterChange("keywords", addToList(filters.keywords, keywordInput.trim()));
                        setKeywordInput("");
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      if (keywordInput.trim()) {
                        handleFilterChange("keywords", addToList(filters.keywords, keywordInput.trim()));
                        setKeywordInput("");
                      }
                    }}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {filters.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.keywords.map(keyword => (
                      <Badge key={keyword} variant="secondary">
                        {keyword}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => handleFilterChange("keywords", removeFromList(filters.keywords, keyword))}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Cast & Crew */}
              <div className="space-y-2">
                <Label>Cast & Crew</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Actor, director, writer..."
                    value={personInput}
                    onChange={(e) => setPersonInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && personInput.trim()) {
                        handleFilterChange("withPeople", addToList(filters.withPeople, personInput.trim()));
                        setPersonInput("");
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      if (personInput.trim()) {
                        handleFilterChange("withPeople", addToList(filters.withPeople, personInput.trim()));
                        setPersonInput("");
                      }
                    }}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {filters.withPeople.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.withPeople.map(person => (
                      <Badge key={person} variant="secondary">
                        {person}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => handleFilterChange("withPeople", removeFromList(filters.withPeople, person))}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Production Companies */}
              <div className="space-y-2">
                <Label>Production Companies</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Netflix, HBO, Disney..."
                    value={companyInput}
                    onChange={(e) => setCompanyInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && companyInput.trim()) {
                        handleFilterChange("withCompanies", addToList(filters.withCompanies, companyInput.trim()));
                        setCompanyInput("");
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      if (companyInput.trim()) {
                        handleFilterChange("withCompanies", addToList(filters.withCompanies, companyInput.trim()));
                        setCompanyInput("");
                      }
                    }}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {filters.withCompanies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.withCompanies.map(company => (
                      <Badge key={company} variant="secondary">
                        {company}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => handleFilterChange("withCompanies", removeFromList(filters.withCompanies, company))}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Adult Content */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-adult"
                  checked={filters.includeAdult}
                  onCheckedChange={(checked) => handleFilterChange("includeAdult", checked)}
                />
                <Label htmlFor="include-adult">Include adult content</Label>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => performSearch(1)} disabled={isSearching} className="flex-1 min-w-[120px]">
              {isSearching ? "Searching..." : "Search"}
              <Search className="h-4 w-4 ml-2" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowSaveAlert(true)}
              disabled={getActiveFilterCount() === 0}
            >
              <Bell className="h-4 w-4 mr-2" />
              Save Alert
            </Button>
            
            <Button variant="outline" onClick={resetFilters}>
              Clear All
            </Button>
          </div>

          {/* Save Alert Dialog */}
          {showSaveAlert && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Save Search Alert</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alert-name">Alert Name</Label>
                  <Input
                    id="alert-name"
                    placeholder="e.g., 'New Sci-Fi Shows on Netflix'"
                    value={alertName}
                    onChange={(e) => setAlertName(e.target.value)}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  You'll get daily notifications when new content matches your search criteria.
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveAsAlert}>Create Alert</Button>
                  <Button variant="outline" onClick={() => setShowSaveAlert(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Search Results ({totalResults.toLocaleString()} found)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {results.map((show) => (
                <ShowCard key={show.tmdbId} show={show} />
              ))}
            </div>
            
            {results.length < totalResults && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => performSearch(currentPage + 1)}
                  disabled={isSearching}
                  variant="outline"
                >
                  {isSearching ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {totalResults === 0 && results.length === 0 && !isSearching && filters.query && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-lg font-medium">No results found</div>
            <div className="text-muted-foreground">
              Try adjusting your search criteria or removing some filters.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}