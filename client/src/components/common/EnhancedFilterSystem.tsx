  import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Heart, 
  Save, 
  Filter, 
  Sparkles, 
  Clock, 
  Star, 
  Calendar,
  Play,
  Users,
  Settings,
  RotateCcw,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface FilterPreset {
  id: number;
  name: string;
  description?: string;
  filters: EnhancedFilters;
  is_public: boolean;
  usage_count: number;
}

interface EnhancedFilters {
  // Content Type & Genre
  genres: string[];
  content_types: string[];
  
  // Mood & Context
  mood: string[];
  viewing_context: string[];
  
  // Technical Specs
  content_rating: string[];
  runtime_min: number;
  runtime_max: number;
  release_year_min: number;
  release_year_max: number;
  
  // Quality & Availability
  min_rating: number;
  streaming_services: number[];
  languages: string[];
  
  // Accessibility
  accessibility_needs: string[];
  content_warnings: string[];
  
  // Social
  social_features: string[];
}

interface Mood {
  id: number;
  name: string;
  description: string;
  color_code: string;
  icon: string;
}

interface StreamingService {
  id: number;
  provider_id: number;
  name: string;
  logo_path: string;
}

interface EnhancedFilterSystemProps {
  onApply?: (filters: EnhancedFilters) => void;
  onFiltersChange?: (filters: EnhancedFilters) => void;
  showAdvanced?: boolean;
}

export default function EnhancedFilterSystem({ 
  onApply, 
  onFiltersChange, 
  showAdvanced = true 
}: EnhancedFilterSystemProps = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<EnhancedFilters>({
    genres: [],
    content_types: [],
    mood: [],
    viewing_context: [],
    content_rating: [],
    runtime_min: 30,
    runtime_max: 180,
    release_year_min: 2000,
    release_year_max: new Date().getFullYear(),
    min_rating: 6.0,
    streaming_services: [],
    languages: [],
    accessibility_needs: [],
    content_warnings: [],
    social_features: []
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [presetName, setPresetName] = useState('');
  const [presetNameError, setPresetNameError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  // Debounce filters to reduce API calls and improve performance
  const debouncedFilters = useDebounce(filters, 300);
  
  // Call onFiltersChange when debounced filters change
  useEffect(() => {
    onFiltersChange?.(debouncedFilters);
  }, [debouncedFilters, onFiltersChange]);

  // Smart preset suggestions based on current filters
  const suggestedPresets = useMemo(() => {
    const suggestions = [];
    if (filters.mood.includes('Relaxed') && filters.viewing_context.includes('Evening')) {
      suggestions.push({ name: 'Cozy Evening', description: 'Perfect for unwinding' });
    }
    if (filters.mood.includes('Adventurous') && filters.genres.includes('Action')) {
      suggestions.push({ name: 'Action-Packed Night', description: 'High-energy entertainment' });
    }
    if (filters.viewing_context.includes('Date Night') && filters.genres.includes('Romance')) {
      suggestions.push({ name: 'Romantic Date Night', description: 'Perfect for couples' });
    }
    return suggestions;
  }, [filters]);

  // Count active filters for UI feedback
  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += filters.genres.length;
    count += filters.content_rating.length;
    count += filters.mood.length;
    count += filters.viewing_context.length;
    count += filters.streaming_services.length;
    count += filters.accessibility_needs.length;
    count += filters.content_warnings.length;
    if (filters.runtime_min !== 30 || filters.runtime_max !== 180) count++;
    if (filters.release_year_min !== 2000 || filters.release_year_max !== new Date().getFullYear()) count++;
    if (filters.min_rating !== 6.0) count++;
    return count;
  }, [filters]);

  // Fetch reference data
  const { data: moods = [] } = useQuery<Mood[]>({
    queryKey: ['/api/moods'],
    queryFn: async () => {
      const response = await fetch('/api/moods', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch moods');
      const data = await response.json();
      return data.moods || [];
    }
  });  const { data: streamingServices = [] } = useQuery<StreamingService[]>({
    queryKey: ['/api/streaming-services'],
    queryFn: async () => {
      const response = await fetch('/api/streaming-services', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch streaming services');
      const data = await response.json();
      return data.services || [];
    }
  });

  const { data: filterPresets = [] } = useQuery<FilterPreset[]>({
    queryKey: ['/api/filter-presets'],
    queryFn: async () => {
      const response = await fetch('/api/filter-presets', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch filter presets');
      const data = await response.json();
      return data.presets || [];
    }
  });

  // Save filter preset mutation
  const savePresetMutation = useMutation({
    mutationFn: async (preset: { name: string; description?: string; filters: EnhancedFilters; is_public: boolean }) => {
      const response = await fetch('/api/filter-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_id: 'user-id', // Replace with actual user ID
          ...preset
        })
      });
      if (!response.ok) throw new Error('Failed to save preset');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/filter-presets'] });
      toast({
        title: 'Success',
        description: 'Filter preset saved successfully!'
      });
      setPresetName('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save filter preset',
        variant: 'destructive'
      });
    }
  });

  const handleGenreToggle = (genre: string) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleMoodToggle = (moodName: string) => {
    setFilters(prev => ({
      ...prev,
      mood: prev.mood.includes(moodName)
        ? prev.mood.filter(m => m !== moodName)
        : [...prev.mood, moodName]
    }));
  };

  const handleStreamingServiceToggle = (serviceId: number) => {
    setFilters(prev => ({
      ...prev,
      streaming_services: prev.streaming_services.includes(serviceId)
        ? prev.streaming_services.filter(s => s !== serviceId)
        : [...prev.streaming_services, serviceId]
    }));
  };

  const loadPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
    toast({
      title: 'Preset Loaded',
      description: `Loaded "${preset.name}" filter preset`
    });
  };

  const saveCurrentAsPreset = () => {
    if (!presetName.trim()) {
      setPresetNameError('Please enter a name for your preset');
      return;
    }
    
    if (presetName.trim().length < 3) {
      setPresetNameError('Preset name must be at least 3 characters');
      return;
    }

    setPresetNameError('');
    savePresetMutation.mutate({
      name: presetName.trim(),
      description: `Custom filter preset created on ${new Date().toLocaleDateString()}`,
      filters,
      is_public: false
    });
  };

  // Clear error when user starts typing
  const handlePresetNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPresetName(e.target.value);
    if (presetNameError) setPresetNameError('');
  };

  const resetFilters = () => {
    setFilters({
      genres: [],
      content_types: [],
      mood: [],
      viewing_context: [],
      content_rating: [],
      runtime_min: 30,
      runtime_max: 180,
      release_year_min: 2000,
      release_year_max: new Date().getFullYear(),
      min_rating: 6.0,
      streaming_services: [],
      languages: [],
      accessibility_needs: [],
      content_warnings: [],
      social_features: []
    });
  };

  // Section-specific reset functions
  const resetSection = (section: string) => {
    switch (section) {
      case 'basic':
        setFilters(prev => ({
          ...prev,
          genres: [],
          content_rating: [],
          streaming_services: []
        }));
        break;
      case 'mood':
        setFilters(prev => ({
          ...prev,
          mood: [],
          viewing_context: []
        }));
        break;
      case 'technical':
        setFilters(prev => ({
          ...prev,
          runtime_min: 30,
          runtime_max: 180,
          release_year_min: 2000,
          release_year_max: new Date().getFullYear(),
          min_rating: 6.0
        }));
        break;
      case 'accessibility':
        setFilters(prev => ({
          ...prev,
          accessibility_needs: [],
          content_warnings: []
        }));
        break;
    }
  };

  const genreOptions = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
    'Romance', 'Science Fiction', 'TV Movie', 'Thriller', 'War', 'Western'
  ];

  const contentRatingOptions = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR'];
  const viewingContextOptions = ['Morning', 'Afternoon', 'Evening', 'Late Night', 'Weekend', 'Date Night', 'Family Time', 'Solo'];
  const accessibilityOptions = ['Closed Captions', 'Audio Description', 'Sign Language', 'Easy Reading'];
  const contentWarningOptions = ['Violence', 'Language', 'Sexual Content', 'Drug Use', 'Flashing Lights'];

  return (
    <div className="space-y-4">
      {/* DEBUG: Enhanced indicator with performance metrics */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white p-4 rounded-lg border-2 border-teal-400">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Filter className="h-6 w-6" />
          🎯 ENHANCED FILTER SYSTEM LOADED!
        </h2>
        <p className="text-sm opacity-90">
          Moods: {moods.length} | Streaming Services: {streamingServices.length} | Presets: {filterPresets.length}
        </p>
        <div className="flex gap-2 mt-2 text-xs">
          <Badge variant="secondary">
            Active Filters: {activeFilterCount}
          </Badge>
          <Badge variant="secondary">
            Debounced (300ms)
          </Badge>
          {suggestedPresets.length > 0 && (
            <Badge variant="secondary">
              {suggestedPresets.length} Smart Suggestions
            </Badge>
          )}
        </div>
      </div>
      
      <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Enhanced Content Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="mood">Mood</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="accessibility">Access</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Basic Filters</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetSection('basic')}
                className="text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset Basic
              </Button>
            </div>
            
            {/* Genres */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">Genres</Label>
                {filters.genres.length > 0 && (
                  <span className="text-xs text-gray-400">
                    {filters.genres.length} selected
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {genreOptions.map(genre => (
                  <Badge
                    key={genre}
                    variant={filters.genres.includes(genre) ? "default" : "outline"}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleGenreToggle(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Content Rating */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Content Rating</Label>
              <div className="flex flex-wrap gap-2">
                {contentRatingOptions.map(rating => (
                  <Badge
                    key={rating}
                    variant={filters.content_rating.includes(rating) ? "default" : "outline"}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        content_rating: prev.content_rating.includes(rating)
                          ? prev.content_rating.filter(r => r !== rating)
                          : [...prev.content_rating, rating]
                      }));
                    }}
                  >
                    {rating}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Streaming Services */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">Available On</Label>
                {filters.streaming_services.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, streaming_services: [] }))}
                    className="text-xs h-6 px-2"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear ({filters.streaming_services.length})
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {streamingServices.map(service => (
                  <div
                    key={service.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                      filters.streaming_services.includes(service.provider_id)
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => handleStreamingServiceToggle(service.provider_id)}
                  >
                    <Checkbox 
                      checked={filters.streaming_services.includes(service.provider_id)}
                      onChange={() => {}} // Handled by onClick above
                    />
                    {service.logo_path ? (
                      <div className="flex items-center gap-2">
                        <img 
                          src={service.logo_path} 
                          alt={service.name} 
                          className="w-6 h-6 rounded"
                          onError={(e) => {
                            // Fallback to text if image fails to load
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="text-sm font-medium">{service.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-medium">{service.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mood" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Mood & Context</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetSection('mood')}
                className="text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset Mood
              </Button>
            </div>

            {/* Smart Suggestions */}
            {suggestedPresets.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <Label className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Smart Suggestions Based on Your Selections
                </Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedPresets.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer border-blue-400 text-blue-400 hover:bg-blue-500/20"
                      onClick={() => {
                        setPresetName(suggestion.name);
                        toast({
                          title: 'Suggestion Applied',
                          description: suggestion.description
                        });
                      }}
                    >
                      ✨ {suggestion.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Moods */}
            <div>
              <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                What's your mood?
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {moods.map(mood => (
                  <div
                    key={mood.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                      filters.mood.includes(mood.name)
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => handleMoodToggle(mood.name)}
                  >
                    <div className="text-2xl mb-1">{mood.icon}</div>
                    <div className="text-sm font-medium">{mood.name}</div>
                    <div className="text-xs text-gray-400">{mood.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Viewing Context */}
            <div>
              <Label className="text-base font-semibold mb-3 block">When are you watching?</Label>
              <div className="flex flex-wrap gap-2">
                {viewingContextOptions.map(context => (
                  <Badge
                    key={context}
                    variant={filters.viewing_context.includes(context) ? "default" : "outline"}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        viewing_context: prev.viewing_context.includes(context)
                          ? prev.viewing_context.filter(c => c !== context)
                          : [...prev.viewing_context, context]
                      }));
                    }}
                  >
                    {context}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="space-y-6">
            {/* Runtime */}
            <div>
              <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Runtime ({filters.runtime_min} - {filters.runtime_max} minutes)
              </Label>
              <div className="px-3">
                <Slider
                  value={[filters.runtime_min, filters.runtime_max]}
                  min={15}
                  max={300}
                  step={15}
                  onValueChange={([min, max]) => {
                    setFilters(prev => ({ ...prev, runtime_min: min, runtime_max: max }));
                  }}
                  className="w-full"
                />
              </div>
            </div>

            {/* Release Year */}
            <div>
              <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Release Year ({filters.release_year_min} - {filters.release_year_max})
              </Label>
              <div className="px-3">
                <Slider
                  value={[filters.release_year_min, filters.release_year_max]}
                  min={1900}
                  max={new Date().getFullYear() + 2}
                  step={1}
                  onValueChange={([min, max]) => {
                    setFilters(prev => ({ ...prev, release_year_min: min, release_year_max: max }));
                  }}
                  className="w-full"
                />
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Minimum Rating ({filters.min_rating}/10)
              </Label>
              <div className="px-3">
                <Slider
                  value={[filters.min_rating]}
                  min={0}
                  max={10}
                  step={0.5}
                  onValueChange={([rating]) => {
                    setFilters(prev => ({ ...prev, min_rating: rating }));
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-6">
            {/* Accessibility Needs */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Accessibility Features</Label>
              <div className="flex flex-wrap gap-2">
                {accessibilityOptions.map(option => (
                  <Badge
                    key={option}
                    variant={filters.accessibility_needs.includes(option) ? "default" : "outline"}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        accessibility_needs: prev.accessibility_needs.includes(option)
                          ? prev.accessibility_needs.filter(a => a !== option)
                          : [...prev.accessibility_needs, option]
                      }));
                    }}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Content Warnings */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Avoid Content With</Label>
              <div className="flex flex-wrap gap-2">
                {contentWarningOptions.map(warning => (
                  <Badge
                    key={warning}
                    variant={filters.content_warnings.includes(warning) ? "destructive" : "outline"}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        content_warnings: prev.content_warnings.includes(warning)
                          ? prev.content_warnings.filter(w => w !== warning)
                          : [...prev.content_warnings, warning]
                      }));
                    }}
                  >
                    {warning}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="presets" className="space-y-6">
            {/* Save Current Preset */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Save Current Filters as Preset</Label>
              <div className="space-y-3">
                <div>
                  <Input
                    placeholder="Enter preset name (min. 3 characters)..."
                    value={presetName}
                    onChange={handlePresetNameChange}
                    className={`flex-1 ${presetNameError ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {presetNameError && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-red-400">
                      <AlertCircle className="h-3 w-3" />
                      {presetNameError}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="public-preset"
                    checked={false} // We'll track this in state later
                    onCheckedChange={() => {}}
                  />
                  <Label htmlFor="public-preset" className="text-sm text-gray-400">
                    Make this preset public (others can discover and use it)
                  </Label>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={saveCurrentAsPreset}
                    disabled={savePresetMutation.isPending || !presetName.trim() || presetName.trim().length < 3}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savePresetMutation.isPending ? 'Saving...' : 'Save Preset'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex-none"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? 'Hide' : 'Preview'}
                  </Button>
                </div>
                
                {showPreview && (
                  <div className="bg-gray-800/50 border rounded-lg p-3">
                    <Label className="text-xs font-medium text-gray-400 mb-2 block">Filter Preview:</Label>
                    <div className="text-xs text-gray-300 space-y-1">
                      {activeFilterCount === 0 ? (
                        <p>No filters currently applied</p>
                      ) : (
                        <>
                          {filters.genres.length > 0 && <p>Genres: {filters.genres.join(', ')}</p>}
                          {filters.mood.length > 0 && <p>Mood: {filters.mood.join(', ')}</p>}
                          {filters.content_rating.length > 0 && <p>Rating: {filters.content_rating.join(', ')}</p>}
                          {filters.streaming_services.length > 0 && <p>Services: {filters.streaming_services.length} selected</p>}
                          <p>Runtime: {filters.runtime_min}-{filters.runtime_max} min</p>
                          <p>Year: {filters.release_year_min}-{filters.release_year_max}</p>
                          <p>Min Rating: {filters.min_rating}/10</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Existing Presets */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Saved Presets</Label>
              <div className="space-y-2">
                {filterPresets.map(preset => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{preset.name}</span>
                        {preset.is_public && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            Public
                          </Badge>
                        )}
                      </div>
                      {preset.description && (
                        <p className="text-sm text-gray-400 mt-1">{preset.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Used {preset.usage_count} times</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadPreset(preset)}
                    >
                      Load
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Action Buttons */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-700">
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="px-2 py-1">
                {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            {showAdvanced && (
              <Button 
                variant="outline"
                onClick={() => {
                  toast({
                    title: 'Advanced Filters',
                    description: 'Coming soon: Language preferences, social features, and more!'
                  });
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Advanced
              </Button>
            )}
            <Button
              onClick={() => {
                if (onApply) {
                  onApply(filters);
                  toast({
                    title: 'Filters Applied',
                    description: activeFilterCount > 0 
                      ? `Applied ${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''}` 
                      : 'Showing all content'
                  });
                } else {
                  toast({
                    title: 'Filters Ready',
                    description: 'Configure onApply callback to handle filter application'
                  });
                }
              }}
              disabled={activeFilterCount === 0}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
