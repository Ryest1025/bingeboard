# Watchlist System Architecture

## CRITICAL: This document defines the watchlist tracking architecture. Changes here require updating all related components.

## Core Navigation Rules (DO NOT CHANGE)

### Homepage Stats Cards Navigation
- **Watching Card** → `/watchlist?filter=watching`
- **Completed Card** → `/watchlist?filter=finished` 
- **Plan to Watch Card** → `/watchlist?filter=want_to_watch`
- **Total Hours Card** → `/profile`

### Route Structure
- `/watchlist` - Main watchlist page with all viewing states
- `/lists` - Custom user-created lists (different from watchlist)
- `/profile` - User profile with detailed statistics

## Database Schema

### Watchlist Status Values
- `watching` - Currently viewing the show
- `finished` - Completed the entire series 
- `want_to_watch` - Planning to watch in the future
- `dropped` - Stopped watching before completion
- `on_hold` - Temporarily paused viewing

### Required Fields
- `currentSeason` - Current season number being watched
- `currentEpisode` - Current episode number being watched  
- `totalEpisodesWatched` - Total count of episodes completed
- `totalHoursWatched` - Total viewing time in hours
- `rating` - User's 1-10 rating for the show
- `notes` - Personal notes about the show
- `isPublic` - Whether entry is visible to friends

## Component Structure

### Watchlist Page (`/watchlist`)
- **Tabs**: All, Watching, Plan to Watch, Completed, Dropped, On Hold
- **Filtering**: Search, sort by date/title/rating/progress
- **Statistics**: Quick stats overview at top
- **Episode Tracking**: Season/episode progress with visual indicators
- **Management**: Edit status, rating, notes, progress tracking

### Edit Capabilities
- Status changes between all five states
- Progress tracking (season/episode counters)
- Rating system (1-10 scale)
- Personal notes
- Privacy settings (public/private)

## API Endpoints

### Required Endpoints
- `GET /api/watchlist` - Fetch user's complete watchlist
- `PATCH /api/watchlist/:id` - Update watchlist entry
- `DELETE /api/watchlist/:id` - Remove from watchlist
- `POST /api/watchlist` - Add new show to watchlist

### Data Format
```typescript
interface WatchlistItem {
  id: number;
  showId: number;
  userId: string;
  status: "watching" | "want_to_watch" | "finished" | "dropped" | "on_hold";
  rating?: string;
  currentSeason?: number;
  currentEpisode?: number;
  totalEpisodesWatched?: number;
  totalHoursWatched?: number;
  notes?: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt?: string;
  show: {
    // Show metadata from TMDB
  };
}
```

## Integration Points

### Homepage Integration
- Stats cards display real-time counts from watchlist
- Continue Watching section shows active `watching` status items
- Progress bars calculated from episode tracking

### Profile Integration  
- Total hours stat aggregated from all watchlist entries
- Viewing statistics and achievements
- Personal viewing patterns analysis

### Lists Integration
- Watchlist is separate from custom lists
- Users can create themed lists independent of watchlist tracking
- Both systems coexist without conflict

## Quality Assurance

### Testing Navigation
1. Click each homepage stats card
2. Verify correct `/watchlist` route with proper filter
3. Confirm filter tabs show expected content
4. Test edit/progress update functionality

### Preventing Regressions
- Never change stats card navigation to `/lists` routes
- Always use correct status filter values
- Maintain separation between watchlist and custom lists
- Document any navigation changes in this file

## Homepage Content Selection Logic

### "Start Watching" Section Algorithm
**CRITICAL: This logic must not be changed without updating this documentation**

#### Primary Data Source
- **Source**: TMDB Trending API (`/api/tmdb/trending`)
- **Selection**: `trendingData.results[0]` (first trending item)
- **Updates**: Real-time via API calls
- **Display**: Poster, title, "Start from S1 E1", streaming platforms

#### Context-Aware Alternatives
1. **Weekend Mode** (Saturday/Sunday)
   - Shows "Weekend Binge Picks"
   - Hardcoded popular series: House of the Dragon, Wednesday, The Crown
   - Includes binge time estimates (8h, 20h, 60h)

2. **Friend Activity Mode**
   - Triggered when `friendRecentActivity` exists
   - Shows social recommendations: "Liam just finished Severance"
   - Encourages friend-based discovery

3. **Default Weekday Mode**
   - Uses TMDB trending data
   - Shows streaming platform logos
   - "Start Watching" button with deep linking

#### Implementation Rules
- Never use hardcoded/mock data for trending content
- Always prioritize TMDB API data for relevance
- Maintain context switching logic based on day/activity
- Preserve streaming platform integration

### Data Flow Architecture
```
TMDB API → Trending Data → Context Logic → Display Selection
    ↓
Weekend Check → Friend Activity Check → Content Rendering
```

## Future Enhancements

### Planned Features
- Bulk status updates
- Import from external platforms
- Social sharing of progress
- Advanced statistics dashboard
- Episode-by-episode tracking

### Architecture Considerations
- Maintain backward compatibility
- Keep watchlist separate from lists system
- Preserve existing navigation patterns
- Document all route changes
- Never modify homepage content selection without updating this documentation