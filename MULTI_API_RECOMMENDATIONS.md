# Multi-API Recommendation System

Your Bingeboard app now supports **multiple APIs for enhanced recommendations** including TMDB, Watchmode, and Utelly! Here's how it works and how to use it.

## 🚀 What's New

### Enhanced Recommendation Engine
- **TMDB**: Primary content database with ratings, popularity, and trending data
- **Watchmode**: Streaming availability and platform-specific trending content  
- **Utelly**: Cross-platform streaming search and availability
- **Hybrid Scoring**: Combined algorithm that weighs data from all sources
- **Smart Deduplication**: Removes duplicate recommendations across APIs
- **Streaming Integration**: Real-time platform availability checking
- **Affiliate Tracking**: Revenue optimization with commission tracking

## 📡 API Endpoints

### New Multi-API Endpoint
```bash
GET /api/multi-api-recommendations
```
**Response:**
```json
{
  "recommendations": [
    {
      "id": 1,
      "show": {
        "title": "Breaking Bad",
        "overview": "A high school chemistry teacher...",
        "posterPath": "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg"
      },
      "reason": "Because you like Crime • Similar to Better Call Saul (HYBRID • 95% confidence • 8 platforms)",
      "score": 95,
      "recommendedAt": "2025-01-30T..."
    }
  ],
  "source": "multi-api",
  "apis_used": ["TMDB", "Watchmode", "Utelly"],
  "features": {
    "streaming_availability": true,
    "affiliate_tracking": true,
    "cross_platform_validation": true,
    "hybrid_scoring": true
  },
  "message": "20 recommendations from multiple streaming APIs with enhanced accuracy"
}
```

### Existing Single-API Endpoint
```bash
GET /api/ai-recommendations
```
Still available for TMDB-only recommendations.

## 🔧 Implementation

### Backend Usage

#### Generate Multi-API Recommendations
```typescript
// Enable multi-API mode
const recommendations = await storage.generateRecommendations(userId, true);

// Or use the service directly
import { MultiAPIRecommendationService } from './services/multiAPIRecommendationService';

const userPreferences = {
  favoriteGenres: ['Crime', 'Drama'],
  preferredNetworks: ['Netflix', 'HBO Max'],
  viewingHistory: [/* user's watch history */]
};

const multiAPIRecs = await MultiAPIRecommendationService.generateMultiAPIRecommendations(
  userPreferences,
  20 // limit
);
```

#### Regular Single-API Mode  
```typescript
// Use TMDB only (existing behavior)
const recommendations = await storage.generateRecommendations(userId, false);
```

### Frontend Usage

#### Fetch Multi-API Recommendations
```javascript
// React component example
const { data: multiAPIRecs } = useQuery({
  queryKey: ["/api/multi-api-recommendations"],
  queryFn: async () => {
    const response = await fetch("/api/multi-api-recommendations");
    return response.json();
  }
});

// Display enhanced recommendations
{multiAPIRecs?.recommendations?.map(rec => (
  <div key={rec.id} className="recommendation-card">
    <h3>{rec.show.title}</h3>
    <p>{rec.reason}</p>
    <div className="score">Score: {rec.score}</div>
    <div className="apis">Sources: {multiAPIRecs.apis_used.join(', ')}</div>
  </div>
))}
```

## 🎯 Recommendation Sources

### 1. TMDB (The Movie Database)
- **Genre-based discovery**: Finds shows matching user's favorite genres
- **Similar content**: Recommendations based on viewing history
- **Trending analysis**: Popular and highly-rated content
- **Scoring factors**: Rating (vote_average × 10) + popularity + genre matches + recency

### 2. Watchmode  
- **Trending shows**: Platform-specific trending content
- **Genre search**: Finds shows by genre with streaming availability
- **Network preferences**: Matches user's preferred streaming services
- **Scoring factors**: User rating + critic score + network matches + availability

### 3. Utelly
- **Streaming availability**: Cross-platform search for content availability
- **Genre streaming**: Finds streamable content in preferred genres
- **Platform validation**: Ensures content is actually available
- **Scoring factors**: Base availability score + platform count + network matches

### 4. Hybrid Algorithm
- **Data merging**: Combines information from all sources
- **Confidence scoring**: Higher confidence for multi-source validation
- **Enhanced reasons**: Shows which APIs contributed to the recommendation
- **Streaming boost**: Bonus points for better streaming availability

## 📊 Comparison: Single vs Multi-API

| Feature | TMDB Only | Multi-API |
|---------|-----------|-----------|
| Content Database | ✅ Comprehensive | ✅ Enhanced |
| Streaming Info | ✅ Basic | ✅ Real-time |
| Trending Data | ✅ TMDB trending | ✅ Multi-platform trending |
| Search Quality | ✅ Good | ✅ Excellent |
| Affiliate Links | ❌ No | ✅ Yes |
| Cross-Platform | ❌ No | ✅ Yes |
| Deduplication | ❌ Manual | ✅ Automatic |
| Accuracy | ✅ Good | ✅ Superior |

## 🔧 Configuration

### Environment Variables
```bash
# Required for multi-API functionality
TMDB_API_KEY=your_tmdb_key
WATCHMODE_API_KEY=your_watchmode_key
UTELLY_API_KEY=your_utelly_key
```

### Enable/Disable Multi-API
```typescript
// In your route handlers
app.get('/api/smart-recommendations', async (req, res) => {
  const useMultiAPI = req.query.enhanced === 'true';
  const recommendations = await storage.generateRecommendations(userId, useMultiAPI);
  res.json({ recommendations, enhanced: useMultiAPI });
});
```

## 📈 Performance Benefits

### Better Accuracy
- **Cross-validation**: Shows recommended by multiple APIs have higher confidence
- **Real-time data**: Streaming availability is checked across all platforms
- **Personalization**: Combines preference matching from multiple sources

### Enhanced Monetization
- **Affiliate tracking**: Automatic commission rate calculation
- **Platform optimization**: Prioritizes platforms with better affiliate rates
- **Revenue reporting**: Tracks potential earnings per recommendation

### User Experience
- **Fresher content**: Trending data from multiple sources
- **Better availability**: Real-time streaming platform checking
- **Smarter reasons**: More detailed explanations for recommendations

## 🧪 Testing

Run the test script to see multi-API recommendations in action:

```bash
node test-multi-api-recommendations.mjs
```

This will:
- Call the new multi-API endpoint
- Compare with single-API results
- Show recommendation sources and confidence scores
- Display streaming availability data

## 🎬 Example Output

```
🎯 Generated 18 multi-API recommendations

Sample recommendations:
1. "Stranger Things" - Because you like Sci-Fi • Trending on streaming platforms (HYBRID • 92% confidence • 6 platforms)
2. "The Crown" - Similar to Downton Abbey (TMDB • 88% confidence • 4 platforms) 
3. "Ozark" - Streaming availability in Crime (UTELLY • 75% confidence • 8 platforms)
```

## 🔮 Future Enhancements

- **More APIs**: Add JustWatch, TV Guide, Reelgood
- **Machine Learning**: Train models on multi-API recommendation success
- **Real-time Updates**: Live streaming availability updates
- **Social Integration**: Combine with friend recommendations
- **A/B Testing**: Compare single vs multi-API performance

---

Your recommendation system is now powered by multiple APIs for the most accurate and comprehensive suggestions! 🚀
