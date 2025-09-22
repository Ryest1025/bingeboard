# 🎬 Universal BingeBoard Filtering System

A comprehensive content filtering system with TMDB integration, dynamic platform logos, award filtering, and watchlist management. Built to plug into any Discover/Dashboard page.

## ✅ Features

### 🎯 **Smart Filtering**
- **Platform Support**: Netflix, Prime Video, Disney+, HBO Max, Hulu, Apple TV+, Paramount+, and more
- **Genre-Based**: TMDB-standard genre mapping with 20+ categories
- **Rating Ranges**: 0-10 scale with dual-slider controls
- **Release Years**: Multi-select year filtering
- **Content Types**: Movies, TV Shows, Anime, Documentaries
- **Languages**: ISO language code filtering
- **Advanced Search**: Multi-field search across titles, descriptions, genres, platforms

### 🏢 **Dynamic Platform Logos**
- **TMDB Integration**: Automatic logo fetching from TMDB provider API
- **Local Fallbacks**: 20+ pre-built SVG logos for major platforms
- **Caching System**: In-memory caching to prevent redundant API calls
- **Error Handling**: Graceful fallbacks for missing or failed logo loads

### 🏆 **Award & Premium Content**
- **Award Filtering**: Oscar, Emmy, SAG Award winners and nominees
- **Upcoming Releases**: Filter for upcoming content with release dates
- **Vote Count Filtering**: Minimum vote thresholds for quality content
- **Popularity Ranges**: TMDB popularity-based filtering

### 📋 **Watchlist Management**
- **Local Storage**: Persistent watchlist with automatic save/restore
- **Export/Import**: JSON-based data portability
- **Statistics**: Detailed analytics on watchlist composition
- **Toggle Integration**: One-click add/remove from any content item

## 🛠️ Usage

### Basic Implementation

```tsx
import { useFilteredContent, FilterOptions } from '@/hooks/useFilteredContent';

const MyDiscoverPage = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    platform: ['Netflix', 'Prime Video'],
    genres: ['Action', 'Sci-Fi'],
    rating: [7.0, 10.0],
    sortBy: 'popularity'
  });

  const { 
    filtered, 
    logos, 
    getPlatformLogo,
    toggleWatchlist,
    isInWatchlist 
  } = useFilteredContent(contentItems, filters);

  return (
    <div>
      {filtered.map(item => (
        <div key={item.id}>
          <img src={getPlatformLogo(item.platform)} alt={item.platform} />
          <h3>{item.title}</h3>
          <button onClick={() => toggleWatchlist(item)}>
            {isInWatchlist(item.id) ? 'Remove' : 'Add to Watchlist'}
          </button>
        </div>
      ))}
    </div>
  );
};
```

### Filter Controls Integration

```tsx
import { FilterControls } from '@/components/discover/FilterControls';

<FilterControls
  filters={filters}
  onFiltersChange={setFilters}
  availableGenres={['Action', 'Comedy', 'Drama']}
  availablePlatforms={['Netflix', 'Prime Video']}
/>
```

## 📊 ContentItem Interface

```typescript
interface ContentItem {
  id: string;
  title: string;
  platform: string;
  genres: string[];
  releaseYear: number;
  rating: number;
  type: 'movie' | 'tv' | 'documentary' | 'anime';
  overview?: string;
  runtime?: number;
  isAwardWinning?: boolean;
  isUpcoming?: boolean;
  releaseDate?: string;
  posterUrl?: string;
  tmdbId?: number;
  voteCount?: number;
  popularity?: number;
  originalLanguage?: string;
  awards?: Award[];
}
```

## 🎮 Available Filters

```typescript
interface FilterOptions {
  platform?: string[];              // Platform filtering
  genres?: string[];                // Genre filtering  
  releaseYear?: number[];           // Year filtering
  rating?: [number, number];        // Rating range
  type?: ContentType[];             // Content type
  awardWinning?: boolean;           // Award winners only
  upcoming?: boolean;               // Upcoming releases
  language?: string[];              // Language filtering
  minVoteCount?: number;            // Vote threshold
  sortBy?: SortOption;              // Sort method
  sortOrder?: 'asc' | 'desc';       // Sort direction
  searchQuery?: string;             // Search text
  inWatchlist?: boolean;            // Watchlist filtering
  adult?: boolean;                  // Adult content
}
```

## 🔧 System Components

### Core Hooks
- **`useFilteredContent`**: Main filtering logic with TMDB integration
- **`useWatchlist`**: Watchlist management with localStorage
- **`usePlatformLogo`**: Dynamic logo loading with caching

### UI Components
- **`DiscoverList`**: Complete content grid with filtering
- **`FilterControls`**: Advanced filter controls UI
- **`PlatformLogo`**: Dynamic logo component with fallbacks

### Utilities
- **`fetchTMDBPlatformLogo`**: TMDB API integration for logos
- **`applyFilters`**: Core filtering logic
- **`getFilterStats`**: Filter statistics and analytics

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   npm install @tanstack/react-query
   ```

2. **Set Environment Variables**:
   ```bash
   NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
   ```

3. **Import and Use**:
   ```tsx
   import { useFilteredContent } from '@/hooks/useFilteredContent';
   import { DiscoverList } from '@/components/discover/DiscoverList';
   ```

## 📈 Performance Features

- **Memoized Filtering**: Optimized React hooks prevent unnecessary re-renders
- **Logo Caching**: In-memory cache reduces API calls
- **Lazy Loading**: Platform logos load on-demand
- **Debounced Search**: Search input optimized for performance
- **Batch Updates**: Filter changes batched for efficiency

## 🎨 UI Features

- **Responsive Design**: Mobile-first responsive grid
- **Loading States**: Skeleton loading for logos and content
- **Error Handling**: Graceful error states with fallbacks
- **Accessibility**: ARIA labels and keyboard navigation
- **Dark Theme**: Optimized for dark mode interfaces

## 🔄 Integration Examples

### Dashboard Integration
```tsx
const { filtered } = useFilteredContent(dashboardContent, {
  sortBy: 'popularity',
  awardWinning: true,
  platform: userPreferences.platforms
});
```

### Search Integration
```tsx
const { filtered } = useFilteredContent(searchResults, {
  searchQuery: userQuery,
  type: ['movie', 'tv'],
  rating: [6.0, 10.0]
});
```

This system provides a complete, production-ready content filtering solution that can be dropped into any BingeBoard page for instant TMDB-integrated filtering with dynamic logos and watchlist management.