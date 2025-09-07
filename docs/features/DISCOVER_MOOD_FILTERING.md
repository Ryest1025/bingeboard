# Discover Page Mood Filtering System

## Overview
The discover page mood filtering system uses authentic TMDB data with real genre classifications to provide users with accurate content recommendations based on their current viewing mood.

## CRITICAL: Data Authenticity
- **NEVER use mock or placeholder data**
- **ALWAYS use real TMDB API responses**
- **All genre filtering based on official TMDB genre IDs**
- **Results are limited to 12 shows for optimal display**

## Mood Filter Configuration

### 8 Mood Options (All Must Be Visible)
The system provides exactly 8 mood filters displayed in a responsive grid layout:

1. **Light & Fun** (Yellow theme)
   - TMDB Genre IDs: 35, 10751 (Comedy/Family)
   - Icon: Sun
   - Color: `bg-yellow-500/20 text-yellow-400 border-yellow-500/30`

2. **Bingeable** (Orange theme)
   - Filter: TMDB Rating > 7.5 stars
   - Icon: Zap
   - Color: `bg-orange-500/20 text-orange-400 border-orange-500/30`

3. **Feel-Good** (Pink theme)
   - TMDB Genre IDs: 35, 10751, 10749 (Comedy/Family/Romance)
   - Icon: Heart
   - Color: `bg-pink-500/20 text-pink-400 border-pink-500/30`

4. **Dark & Intense** (Purple theme)
   - TMDB Genre IDs: 18, 9648, 80 (Drama/Mystery/Crime)
   - Icon: Moon
   - Color: `bg-purple-500/20 text-purple-400 border-purple-500/30`

5. **Comedy** (Green theme)
   - TMDB Genre ID: 35 (Comedy)
   - Icon: Laugh
   - Color: `bg-green-500/20 text-green-400 border-green-500/30`

6. **Drama** (Blue theme)
   - TMDB Genre ID: 18 (Drama)
   - Icon: Drama
   - Color: `bg-blue-500/20 text-blue-400 border-blue-500/30`

7. **Action** (Red theme)
   - TMDB Genre IDs: 10759, 28 (Action & Adventure/Action)
   - Icon: Swords
   - Color: `bg-red-500/20 text-red-400 border-red-500/30`

8. **Sci-Fi** (Indigo theme)
   - TMDB Genre IDs: 10765, 878 (Sci-Fi & Fantasy/Science Fiction)
   - Icon: Rocket
   - Color: `bg-indigo-500/20 text-indigo-400 border-indigo-500/30`

## Layout Implementation

### Responsive Grid System
```jsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-3">
```
- Mobile: 2 columns
- Small screens: 3 columns  
- Medium screens: 4 columns
- Large screens: 5 columns
- Extra large screens: 8 columns (all in one row)

### NEVER Use Horizontal Scrolling
The previous horizontal scrolling layout caused moods to be hidden beyond screen width. The grid layout ensures all 8 moods are always visible.

## Data Sources

### Primary APIs
1. **TMDB Trending API**: `/api/tmdb/trending`
   - Provides current trending TV shows
   - Updated regularly with live data

2. **TMDB Popular API**: `/api/tmdb/discover/tv`
   - Provides popular TV shows
   - Used for broader content pool

### Content Filtering Logic
```javascript
// Combine trending and popular data, remove duplicates
const allShows = [
  ...(trendingData?.results || []),
  ...(popularData?.results || [])
].filter((show, index, self) => 
  index === self.findIndex(s => s.id === show.id)
);

// Filter by selected mood using official TMDB genre IDs
const moodFilteredShows = allShows.filter(show => {
  const genreIds = show.genre_ids || [];
  // Genre matching logic here...
}).slice(0, 12);
```

## File Locations

### Primary Implementation
- **File**: `client/src/pages/modern-discover.tsx`
- **Route**: `/discover` (authenticated users only)
- **Component**: `ModernDiscover`

### Key Functions
- `handleMoodFilter()`: Toggles mood selection
- `filteredContent()`: Applies mood filtering logic
- `moodFilters[]`: Defines all 8 mood options

## Quality Assurance Checklist

- [ ] All 8 mood filters are visible on all screen sizes
- [ ] Grid layout is responsive (2-8 columns based on screen)
- [ ] Each mood uses authentic TMDB genre classification
- [ ] Results show real show titles and posters
- [ ] No duplicate shows in filtered results
- [ ] Console logs confirm genre filtering is working
- [ ] No placeholder or mock data in results

## Troubleshooting

### If Only 3 Moods Show
1. Check if horizontal scrolling layout was restored
2. Verify grid CSS classes are applied correctly
3. Ensure `moodFilters` array contains all 8 items

### If Results Are Not Authentic
1. Verify TMDB API endpoints are responding
2. Check genre ID mapping in filter logic
3. Confirm no hardcoded mock data is being used

## Documentation References
- Main project documentation: `replit.md`
- Architecture documentation: `WATCHLIST_ARCHITECTURE.md`
- Inline code comments in `modern-discover.tsx`

---
**IMPORTANT**: This documentation must be kept in sync with code changes. Any modifications to mood filtering logic require updating both code comments and this documentation file.