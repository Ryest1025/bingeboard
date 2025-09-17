import React, { useEffect, useState } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Loader2, Filter, ChevronDown, ChevronUp, ChevronRight, Trophy, Award, TrendingUp, Flame, Star } from "lucide-react";
import { isAwardSeason, getAwardBadgeStyles, AWARD_GRADIENTS } from "@/styles/constants";

interface FilterValues {
  genres: string[];
  platforms: string[];
  countries: string[];
  sports: string[];
  awardSeason: string[]; // "winners", "nominees", "trending"
  trending: string[]; // "hot", "rising", "viral"
}

interface Props {
  persistKey?: string;
  showAdvanced?: boolean;
  defaultExpanded?: boolean;
  onFiltersChange?: (filters: FilterValues) => void;
  onApply?: (filters: FilterValues) => void;
  className?: string;
  showFilterSummary?: boolean;
  compactMode?: boolean;
  activeTab?: string;
  onActiveTabChange?: (tab: string) => void;
  onFilterSummaryRender?: (summary: JSX.Element | null) => void;
}

export default function EnhancedFilterSystem({
  persistKey = "filters",
  showAdvanced = false,
  defaultExpanded = false,
  onFiltersChange,
  onApply,
  className = "",
  showFilterSummary = true,
  compactMode = false,
  activeTab,
  onActiveTabChange,
  onFilterSummaryRender
}: Props) {
  const [localFilters, setLocalFilters] = useLocalStorage<FilterValues>(persistKey, {
    genres: [],
    platforms: [],
    countries: [],
    sports: [],
    awardSeason: [],
    trending: []
  });

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [currentTab, setCurrentTab] = useState(activeTab || 'genres'); // Default to genres tab

  // Collapsible sections state for non-compact mode
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    genres: false,
    platforms: false,
    countries: false,
    sports: false,
    awardSeason: false,
    trending: false
  });

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const toggle = (key: keyof FilterValues, value: string) => {
    setLocalFilters((prev: FilterValues) => {
      const next = prev[key].includes(value)
        ? prev[key].filter((v: string) => v !== value)
        : [...prev[key], value];
      return { ...prev, [key]: next };
    });
  };

  const clearAllFilters = () => {
    setLocalFilters({
      genres: [],
      platforms: [],
      countries: [],
      sports: [],
      awardSeason: [],
      trending: []
    });
  };

  // Optimized parallel queries using useQueries
  const filterQueries = useQueries({
    queries: [
      {
        queryKey: ["genres"],
        queryFn: async () => {
          const res = await fetch("/api/filters/genres");
          if (!res.ok) throw new Error('Failed to fetch genres');
          return res.json();
        },
      },
      {
        queryKey: ["platforms"],
        queryFn: async () => {
          const res = await fetch("/api/filters/platforms");
          if (!res.ok) throw new Error('Failed to fetch platforms');
          return res.json();
        },
      },
      {
        queryKey: ["countries"],
        queryFn: async () => {
          const res = await fetch("/api/filters/countries");
          if (!res.ok) throw new Error('Failed to fetch countries');
          return res.json();
        },
      },
      {
        queryKey: ["sports"],
        queryFn: async () => {
          const res = await fetch("/api/filters/sports");
          if (!res.ok) throw new Error('Failed to fetch sports');
          return res.json();
        },
      }
    ]
  });

  // Extract data and loading states from parallel queries
  const [genreQuery, platformQuery, countryQuery, sportQuery] = filterQueries;
  const genres = genreQuery.data;
  const platforms = platformQuery.data;
  const countries = countryQuery.data;
  const sports = sportQuery.data;

  const genresLoading = genreQuery.isLoading;
  const platformsLoading = platformQuery.isLoading;
  const countriesLoading = countryQuery.isLoading;
  const sportsLoading = sportQuery.isLoading;

  const isLoading = genresLoading || platformsLoading || countriesLoading || sportsLoading;

  // Calculate active filter count
  const activeFilterCount = [
    ...localFilters.genres,
    ...localFilters.platforms,
    ...localFilters.countries,
    ...localFilters.sports,
    ...localFilters.awardSeason,
    ...localFilters.trending
  ].length;

  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(localFilters);
    }
  }, [localFilters, onFiltersChange]);

  // Sync active tab with parent component
  useEffect(() => {
    if (activeTab && activeTab !== currentTab) {
      setCurrentTab(activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (onActiveTabChange && currentTab !== activeTab) {
      onActiveTabChange(currentTab);
    }
  }, [currentTab, onActiveTabChange]);

  // Generate and pass filter summary to parent
  useEffect(() => {
    if (onFilterSummaryRender) {
      if (activeFilterCount === 0) {
        onFilterSummaryRender(null);
      } else {
        const summary = (
          <div className="flex items-center gap-2 text-sm text-gray-300 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            <span className="text-gray-500 whitespace-nowrap">Active:</span>
            {localFilters.genres.length > 0 && (
              <div className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-xs whitespace-nowrap min-w-0 flex-shrink-0">
                {localFilters.genres.join(' • ')}
              </div>
            )}
            {localFilters.platforms.length > 0 && (
              <div className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded-full text-xs whitespace-nowrap min-w-0 flex-shrink-0">
                {localFilters.platforms.join(' • ')}
              </div>
            )}
            {localFilters.countries.length > 0 && (
              <div className="bg-green-600/20 text-green-300 px-2 py-1 rounded-full text-xs whitespace-nowrap min-w-0 flex-shrink-0">
                {localFilters.countries.join(' • ')}
              </div>
            )}
            {localFilters.sports.length > 0 && (
              <div className="bg-orange-600/20 text-orange-300 px-2 py-1 rounded-full text-xs whitespace-nowrap min-w-0 flex-shrink-0">
                {localFilters.sports.join(' • ')}
              </div>
            )}
            {localFilters.awardSeason.length > 0 && (
              <div className="bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded-full text-xs whitespace-nowrap min-w-0 flex-shrink-0">
                🏆 {localFilters.awardSeason.join(' • ')}
              </div>
            )}
            {localFilters.trending.length > 0 && (
              <div className="bg-red-600/20 text-red-300 px-2 py-1 rounded-full text-xs whitespace-nowrap min-w-0 flex-shrink-0">
                🔥 {localFilters.trending.join(' • ')}
              </div>
            )}
            <span className="text-gray-500 text-xs whitespace-nowrap ml-2">
              ({activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''})
            </span>
          </div>
        );
        onFilterSummaryRender(summary);
      }
    }
  }, [localFilters, activeFilterCount, onFilterSummaryRender, clearAllFilters]);

  // Loading state
  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading filters...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loading skeletons */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Skeleton key={j} className="h-8 w-16" />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const FilterSection = ({ title, items, filterKey }: {
    title: string;
    items: any[];
    filterKey: keyof FilterValues;
  }) => {
    const isCollapsed = collapsedSections[filterKey];

    return (
      <div className={compactMode ? "space-y-2" : "space-y-3"}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!compactMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection(filterKey)}
                className="h-6 w-6 p-0 hover:bg-gray-700"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            )}
            <h3 className={`font-medium ${compactMode ? "text-xs" : "text-sm"} flex items-center gap-1`}>
              {title}
              {localFilters[filterKey].length === 0 && (
                <span className="text-xs text-gray-500 font-normal">(multi-select)</span>
              )}
            </h3>
          </div>
          {localFilters[filterKey].length > 0 && (
            <Badge 
              variant="secondary" 
              className={`text-xs ${
                filterKey === 'awardSeason' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                filterKey === 'trending' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                'bg-blue-500/20 text-blue-300 border-blue-500/30'
              }`}
            >
              {localFilters[filterKey].length} selected
            </Badge>
          )}
        </div>
        {(!isCollapsed || compactMode) && (
          <div className="flex flex-wrap gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pb-1 md:overflow-visible">
            {items?.map((item: any, index: number) => (
              <Button
                key={item.id || item.name || `${filterKey}-${index}`}
                size={compactMode ? "sm" : "sm"}
                onClick={() => toggle(filterKey, item.name)}
                variant={localFilters[filterKey].includes(item.name) ? "default" : "outline"}
                className={`${compactMode ? "text-xs h-7" : "h-8"} min-w-[48px] snap-start flex-shrink-0 touch-manipulation select-none
                  ${filterKey === 'awardSeason' && localFilters[filterKey].includes(item.name) ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 shadow-lg' : ''}
                  ${filterKey === 'trending' && localFilters[filterKey].includes(item.name) ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg' : ''}
                  ${filterKey === 'trending' && item.name === 'hot' ? 'animate-pulse' : ''}
                  ${filterKey === 'trending' && item.name === 'viral' ? 'animate-bounce' : ''}
                `}
              >
                {item.displayName || item.name}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={`w-full ${compactMode ? 'p-1 rounded-lg shadow border border-gray-700 bg-gray-850' : className}`}>
      {/* Award Season Banner */}
      {isAwardSeason(new Date()) && (
        <div className={`${AWARD_GRADIENTS.winner} px-4 py-2 border-b border-yellow-500/20`}>
          <div className="flex items-center justify-center gap-2 text-center">
            <Trophy className="h-4 w-4 text-yellow-200" />
            <span className="text-sm font-medium text-yellow-100">
              🏆 Award Season Special - Filter by winners & nominees
            </span>
            <Award className="h-4 w-4 text-yellow-200" />
          </div>
        </div>
      )}
      <CardHeader className={compactMode ? "pb-2 px-2" : ""}>
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-2 ${compactMode ? "text-sm font-semibold" : ""}`}>
            <Filter className="h-3 w-3" />
            <span className={compactMode ? "text-xs" : ""}>Filter Content</span>
            {activeFilterCount > 0 && (
              <Badge className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          {compactMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-7 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
        {/* Filter Summary */}
        {showFilterSummary && activeFilterCount > 0 && (
          <div className="text-xs text-muted-foreground mt-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                Active Filters: {activeFilterCount} selected
                {activeFilterCount >= 5 && <Flame className="h-3 w-3 text-orange-400 animate-pulse" />}
                {activeFilterCount >= 10 && <Star className="h-3 w-3 text-yellow-400 animate-pulse" />}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-red-400 hover:text-red-500 h-5 px-2 hover:bg-red-500/10 transition-colors"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {localFilters.genres.map(genre => (
                <Badge key={genre} variant="outline" className="text-2xs px-1 py-0.5">
                  {genre}
                </Badge>
              ))}
              {localFilters.platforms.map(platform => (
                <Badge key={platform} variant="outline" className="text-2xs px-1 py-0.5">
                  {platform}
                </Badge>
              ))}
              {localFilters.countries.map(country => (
                <Badge key={country} variant="outline" className="text-2xs px-1 py-0.5">
                  {country}
                </Badge>
              ))}
              {localFilters.sports.map(sport => (
                <Badge key={sport} variant="outline" className="text-2xs px-1 py-0.5">
                  {sport}
                </Badge>
              ))}
              {localFilters.awardSeason.map(award => (
                <Badge key={award} variant="outline" className="text-2xs px-1 py-0.5 bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                  🏆 {award}
                </Badge>
              ))}
              {localFilters.trending.map(trend => (
                <Badge key={trend} variant="outline" className="text-2xs px-1 py-0.5 bg-red-500/10 text-red-400 border-red-500/30">
                  🔥 {trend}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardHeader>
      {(!compactMode || isExpanded) && (
        <CardContent className={`space-y-3 ${compactMode ? "pt-0 px-2 pb-2" : ""}`}>

          {/* Filter Tabs UI - Only show if compact mode */}
          {compactMode && (
            <div className="flex gap-1 mb-3 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pb-1">
              {[
                { key: "genres", label: "Genres" },
                { key: "platforms", label: "Platforms" },
                { key: "countries", label: "Countries" },
                { key: "sports", label: "Sports" },
                ...(isAwardSeason(new Date()) ? [{ key: "awardSeason", label: "🏆 Awards" }] : []),
                { key: "trending", label: "🔥 Trending" }
              ].map((tab) => (
                <Button
                  key={tab.key}
                  variant={currentTab === tab.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentTab(tab.key)}
                  className="text-xs h-6 px-2 snap-start flex-shrink-0 min-w-[60px] touch-manipulation"
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          )}

          {/* Render all sections in non-compact mode, or just current tab in compact mode */}
          {compactMode ? (
            // Tabbed view for compact mode
            <>
              {currentTab === 'genres' && (
                genresLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <div className="flex gap-2">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-6 w-12" />)}
                    </div>
                  </div>
                ) : (
                  <FilterSection title="Genres" items={genres} filterKey="genres" />
                )
              )}
              {currentTab === 'platforms' && (
                platformsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <div className="flex gap-2">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-6 w-16" />)}
                    </div>
                  </div>
                ) : (
                  <FilterSection title="Platforms" items={platforms} filterKey="platforms" />
                )
              )}
              {currentTab === 'countries' && (
                countriesLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <div className="flex gap-2">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-6 w-12" />)}
                    </div>
                  </div>
                ) : (
                  <FilterSection title="Countries" items={countries} filterKey="countries" />
                )
              )}
              {currentTab === 'sports' && (
                sportsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <div className="flex gap-2">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-6 w-14" />)}
                    </div>
                  </div>
                ) : (
                  <FilterSection title="Sports" items={sports} filterKey="sports" />
                )
              )}
              {currentTab === 'awardSeason' && (
                <FilterSection 
                  title="🏆 Award Season" 
                  items={[
                    { name: "winners", displayName: "🏆 Winners" },
                    { name: "nominees", displayName: "🎯 Nominees" },
                    { name: "contenders", displayName: "⭐ Contenders" }
                  ]} 
                  filterKey="awardSeason" 
                />
              )}
              {currentTab === 'trending' && (
                <FilterSection 
                  title="🔥 Trending" 
                  items={[
                    { name: "hot", displayName: "🔥 Hot Now" },
                    { name: "rising", displayName: "📈 Rising" },
                    { name: "viral", displayName: "💥 Viral" },
                    { name: "popular", displayName: "⭐ Popular" }
                  ]} 
                  filterKey="trending" 
                />
              )}
            </>
          ) : (
            // Full view for non-compact mode
            <>
              {genresLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-8 w-16" />)}
                  </div>
                </div>
              ) : (
                <FilterSection title="Genres" items={genres} filterKey="genres" />
              )}

              {platformsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-20" />)}
                  </div>
                </div>
              ) : (
                <FilterSection title="Platforms" items={platforms} filterKey="platforms" />
              )}

              {countriesLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-16" />)}
                  </div>
                </div>
              ) : (
                <FilterSection title="Countries" items={countries} filterKey="countries" />
              )}

              {sportsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-18" />)}
                  </div>
                </div>
              ) : (
                <FilterSection title="Sports" items={sports} filterKey="sports" />
              )}

              {/* Award Season Section - Only show during award season */}
              {isAwardSeason(new Date()) && (
                <FilterSection 
                  title="🏆 Award Season" 
                  items={[
                    { name: "winners", displayName: "🏆 Winners" },
                    { name: "nominees", displayName: "🎯 Nominees" },
                    { name: "contenders", displayName: "⭐ Contenders" }
                  ]} 
                  filterKey="awardSeason" 
                />
              )}

              {/* Trending Section */}
              <FilterSection 
                title="🔥 Trending" 
                items={[
                  { name: "hot", displayName: "🔥 Hot Now" },
                  { name: "rising", displayName: "📈 Rising" },
                  { name: "viral", displayName: "💥 Viral" },
                  { name: "popular", displayName: "⭐ Popular" }
                ]} 
                filterKey="trending" 
              />
            </>
          )}

          {/* Apply Button */}
          {onApply && (
            <div className="pt-2 border-t flex gap-2">
              <Button
                onClick={() => onApply(localFilters)}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-xs py-1 min-h-[44px] touch-manipulation"
                disabled={activeFilterCount === 0}
              >
                Apply {activeFilterCount > 0 ? `${activeFilterCount} ` : ""}Filters
              </Button>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs text-red-400 hover:text-red-500 px-3 min-h-[44px] min-w-[60px] touch-manipulation"
                >
                  Clear
                </Button>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
