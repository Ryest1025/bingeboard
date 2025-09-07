import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  Calendar,
  Tv,
  Globe,
  Clock,
  SortAsc,
  SortDesc,
  RotateCcw
} from "lucide-react";

interface FilterState {
  genres: string[];
  networks: string[];
  yearRange: [number, number];
  ratingRange: [number, number];
  contentRatings: string[];
  countries: string[];
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface DiscoverFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  className?: string;
}

const GENRE_OPTIONS = [
  "Action & Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Family", "Fantasy", "History", "Horror", "Mystery",
  "News", "Reality", "Romance", "Sci-Fi & Fantasy", "Thriller",
  "War & Politics", "Western"
];

const NETWORK_OPTIONS = [
  "Netflix", "Amazon Prime Video", "Disney Plus", "HBO Max", "Hulu",
  "Apple TV Plus", "Paramount Plus", "Peacock", "ABC", "CBS", "NBC",
  "Fox", "The CW", "FX", "AMC", "Showtime", "Starz"
];

const CONTENT_RATING_OPTIONS = [
  "TV-Y", "TV-Y7", "TV-G", "TV-PG", "TV-14", "TV-MA"
];

const COUNTRY_OPTIONS = [
  "United States", "United Kingdom", "Canada", "Germany", "France",
  "Spain", "Italy", "Japan", "South Korea", "Australia", "Brazil"
];

const STATUS_OPTIONS = [
  { value: "", label: "All Shows" },
  { value: "returning", label: "Returning Series" },
  { value: "ended", label: "Ended" },
  { value: "canceled", label: "Canceled" },
  { value: "in_production", label: "In Production" }
];

const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "vote_average", label: "Rating" },
  { value: "first_air_date", label: "Release Date" },
  { value: "name", label: "Title" },
  { value: "vote_count", label: "Vote Count" }
];

export default function DiscoverFilters({
  filters,
  onFiltersChange,
  onReset,
  className = ""
}: DiscoverFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    genres: true,
    networks: false,
    dates: false,
    ratings: false,
    content: false,
    sort: true
  });

  const currentYear = new Date().getFullYear();
  const minYear = 1950;
  const maxYear = currentYear + 2;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleGenre = (genre: string) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    updateFilters({ genres: newGenres });
  };

  const toggleNetwork = (network: string) => {
    const newNetworks = filters.networks.includes(network)
      ? filters.networks.filter(n => n !== network)
      : [...filters.networks, network];
    updateFilters({ networks: newNetworks });
  };

  const toggleContentRating = (rating: string) => {
    const newRatings = filters.contentRatings.includes(rating)
      ? filters.contentRatings.filter(r => r !== rating)
      : [...filters.contentRatings, rating];
    updateFilters({ contentRatings: newRatings });
  };

  const toggleCountry = (country: string) => {
    const newCountries = filters.countries.includes(country)
      ? filters.countries.filter(c => c !== country)
      : [...filters.countries, country];
    updateFilters({ countries: newCountries });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.genres.length > 0) count++;
    if (filters.networks.length > 0) count++;
    if (filters.yearRange[0] !== minYear || filters.yearRange[1] !== maxYear) count++;
    if (filters.ratingRange[0] !== 0 || filters.ratingRange[1] !== 10) count++;
    if (filters.contentRatings.length > 0) count++;
    if (filters.countries.length > 0) count++;
    if (filters.status) count++;
    return count;
  };

  const activeCount = getActiveFilterCount();

  return (
    <Card className={`glass-effect border-white/10 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Sort
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              disabled={activeCount === 0}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Sort Section */}
            <Collapsible open={expandedSections.sort} onOpenChange={() => toggleSection('sort')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <SortAsc className="h-4 w-4" />
                    <span className="font-medium">Sort By</span>
                  </div>
                  {expandedSections.sort ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    onClick={() => updateFilters({ 
                      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
                    })}
                    className="flex items-center gap-2"
                  >
                    {filters.sortOrder === 'asc' ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    )}
                    {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Genres Section */}
            <Collapsible open={expandedSections.genres} onOpenChange={() => toggleSection('genres')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <Tv className="h-4 w-4" />
                    <span className="font-medium">Genres</span>
                    {filters.genres.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {filters.genres.length}
                      </Badge>
                    )}
                  </div>
                  {expandedSections.genres ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <ScrollArea className="h-32">
                  <div className="grid grid-cols-2 gap-2">
                    {GENRE_OPTIONS.map(genre => (
                      <div key={genre} className="flex items-center space-x-2">
                        <Checkbox
                          id={`genre-${genre}`}
                          checked={filters.genres.includes(genre)}
                          onCheckedChange={() => toggleGenre(genre)}
                        />
                        <Label
                          htmlFor={`genre-${genre}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {genre}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Networks Section */}
            <Collapsible open={expandedSections.networks} onOpenChange={() => toggleSection('networks')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="font-medium">Networks & Platforms</span>
                    {filters.networks.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {filters.networks.length}
                      </Badge>
                    )}
                  </div>
                  {expandedSections.networks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <ScrollArea className="h-32">
                  <div className="grid grid-cols-2 gap-2">
                    {NETWORK_OPTIONS.map(network => (
                      <div key={network} className="flex items-center space-x-2">
                        <Checkbox
                          id={`network-${network}`}
                          checked={filters.networks.includes(network)}
                          onCheckedChange={() => toggleNetwork(network)}
                        />
                        <Label
                          htmlFor={`network-${network}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {network}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Year Range Section */}
            <Collapsible open={expandedSections.dates} onOpenChange={() => toggleSection('dates')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Release Year</span>
                    {(filters.yearRange[0] !== minYear || filters.yearRange[1] !== maxYear) && (
                      <Badge variant="secondary" className="ml-2">
                        {filters.yearRange[0]} - {filters.yearRange[1]}
                      </Badge>
                    )}
                  </div>
                  {expandedSections.dates ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-3">
                <div className="px-2">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>{filters.yearRange[0]}</span>
                    <span>{filters.yearRange[1]}</span>
                  </div>
                  <Slider
                    value={filters.yearRange}
                    onValueChange={(value) => updateFilters({ yearRange: value as [number, number] })}
                    min={minYear}
                    max={maxYear}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Rating Range Section */}
            <Collapsible open={expandedSections.ratings} onOpenChange={() => toggleSection('ratings')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span className="font-medium">Rating</span>
                    {(filters.ratingRange[0] !== 0 || filters.ratingRange[1] !== 10) && (
                      <Badge variant="secondary" className="ml-2">
                        {filters.ratingRange[0]} - {filters.ratingRange[1]} ★
                      </Badge>
                    )}
                  </div>
                  {expandedSections.ratings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-3">
                <div className="px-2">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>{filters.ratingRange[0]} ★</span>
                    <span>{filters.ratingRange[1]} ★</span>
                  </div>
                  <Slider
                    value={filters.ratingRange}
                    onValueChange={(value) => updateFilters({ ratingRange: value as [number, number] })}
                    min={0}
                    max={10}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Content Rating & Status Section */}
            <Collapsible open={expandedSections.content} onOpenChange={() => toggleSection('content')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Content & Status</span>
                    {(filters.contentRatings.length > 0 || filters.status) && (
                      <Badge variant="secondary" className="ml-2">
                        {(filters.contentRatings.length > 0 ? 1 : 0) + (filters.status ? 1 : 0)}
                      </Badge>
                    )}
                  </div>
                  {expandedSections.content ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Content Rating</Label>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_RATING_OPTIONS.map(rating => (
                      <Button
                        key={rating}
                        variant={filters.contentRatings.includes(rating) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleContentRating(rating)}
                        className="text-xs"
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Show Status</Label>
                  <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All shows" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Active Filters Summary */}
            {activeCount > 0 && (
              <>
                <Separator />
                <div>
                  <Label className="text-sm font-medium mb-2 block">Active Filters</Label>
                  <div className="flex flex-wrap gap-2">
                    {filters.genres.map(genre => (
                      <Badge key={genre} variant="secondary" className="text-xs">
                        {genre}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => toggleGenre(genre)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                    {filters.networks.map(network => (
                      <Badge key={network} variant="secondary" className="text-xs">
                        {network}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => toggleNetwork(network)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                    {(filters.yearRange[0] !== minYear || filters.yearRange[1] !== maxYear) && (
                      <Badge variant="secondary" className="text-xs">
                        {filters.yearRange[0]}-{filters.yearRange[1]}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => updateFilters({ yearRange: [minYear, maxYear] })}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {(filters.ratingRange[0] !== 0 || filters.ratingRange[1] !== 10) && (
                      <Badge variant="secondary" className="text-xs">
                        {filters.ratingRange[0]}-{filters.ratingRange[1]} ★
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => updateFilters({ ratingRange: [0, 10] })}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {filters.status && (
                      <Badge variant="secondary" className="text-xs">
                        {STATUS_OPTIONS.find(s => s.value === filters.status)?.label}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => updateFilters({ status: "" })}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}