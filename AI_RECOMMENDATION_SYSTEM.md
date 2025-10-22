# AI-Powered Recommendation Engine

## Overview

BingeBoard uses a **multi-model AI ensemble** to deliver extremely powerful, relevant, and measured recommendations. The system combines:

- 🎨 **Creative AI** (GPT-4o) - Emotional resonance & storytelling fit
- 📊 **Analytical AI** (GPT-4o-mini) - Fast, data-driven matching  
- 🧬 **Deep Analysis AI** (Claude 3.5 Sonnet) - Nuanced contextual understanding
- 📺 **TMDB Intelligence** - Trending & discovery algorithms
- 👥 **Social Recommendations** - Friend-based collaborative filtering

## Key Features

### 🧠 Behavioral Pattern Analysis
The system builds a psychological profile of each user:

```typescript
{
  genreAffinities: Map<string, number>,      // Genre preferences with confidence
  bingeVsEpisodic: number,                  // -1 to 1: episodic to binge
  newVsClassic: number,                     // -1 to 1: classic to new  
  completionRate: number,                   // How often they finish shows
  moodPatterns: Map<string, string[]>       // Mood → preferred genres
}
```

**How it works:**
1. Analyzes viewing history, watchlist, and current watching
2. Calculates genre affinity scores (% of views per genre)
3. Determines binge behavior (multi-season shows preference)
4. Identifies new vs classic content preference
5. Measures completion rate (finished / started)

### 🎯 Multi-Model Ensemble

Each AI model brings unique strengths:

| Model | Specialty | Temperature | Use Case |
|-------|-----------|-------------|----------|
| GPT-4o | Creative storytelling | 0.8 | Emotional fit, mood matching |
| GPT-4o-mini | Data analysis | 0.3 | Fast genre matching, precision |
| Claude 3.5 | Deep context | 0.7 | Psychological understanding |

**Ensemble Strategy:**
1. Run all models in parallel
2. Combine recommendations
3. Boost score when models agree (+0.1)
4. Deduplicate and rank by consensus

### 📊 Real-Time Metrics & A/B Testing

Track recommendation effectiveness:

```typescript
interface MetricsSnapshot {
  clickThroughRate: number;       // % clicked
  addToWatchlistRate: number;    // % added
  watchRate: number;             // % actually watched
  avgRating: number;             // User ratings
  qualityScore: number;          // Composite 0-1 score
  sessionSuccess: number;        // % sessions with positive action
}
```

**Quality Score Formula:**
```
score = CTR × 0.15 + 
        AddRate × 0.25 + 
        WatchRate × 0.35 + 
        AvgRating × 0.20 + 
        (1 - DismissRate) × 0.05
```

## API Usage

### Generate Recommendations

```javascript
POST /api/recommendations/unified

{
  "filters": {
    "genre": "Drama",
    "year": 2024,
    "platform": "netflix",
    "mood": "intense"
  },
  "userProfile": {
    "favoriteGenres": ["Drama", "Thriller"],
    "preferredNetworks": ["HBO", "Netflix"],
    "recentlyWatched": [...],
    "currentlyWatching": [...]
  },
  "limit": 12
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "tmdbId": 123456,
      "title": "Show Name",
      "score": 0.92,
      "confidence": 0.88,
      "aiModel": "gpt-4o-creative",
      "reason": "Matches your love of complex character studies",
      "matchFactors": [
        {
          "factor": "emotional tone",
          "weight": 0.3,
          "explanation": "Similar dramatic tension to Breaking Bad"
        }
      ],
      "explanations": {
        "why": "This show shares the moral complexity you enjoyed in...",
        "howDiscovered": "AI analyzed your completed shows with 8+ ratings",
        "whatToExpect": "6 seasons of character-driven drama",
        "whenToWatch": "Best for focused evening viewing"
      }
    }
  ],
  "metadata": {
    "sources": {
      "ai": { "count": 8, "success": true },
      "tmdb": { "count": 15, "success": true },
      "friends": { "count": 3, "success": true }
    }
  }
}
```

### Track User Actions

```javascript
POST /api/metrics/action

{
  "recommendationId": "rec_1234567890_abc123",
  "tmdbId": 123456,
  "actionType": "add_watchlist",  // view | add_watchlist | watch | rate | dismiss
  "actionValue": 9,              // For 'rate' actions
  "timeToAction": 5000           // Milliseconds from shown to action
}
```

### View Performance Dashboard

```javascript
GET /api/metrics/dashboard?timeRange=week

// Response:
{
  "overall": {
    "clickThroughRate": 0.23,
    "addToWatchlistRate": 0.18,
    "watchRate": 0.12,
    "qualityScore": 0.78,
    "sessionSuccess": 0.65
  },
  "bySource": {
    "ai": { "qualityScore": 0.82, ... },
    "tmdb": { "qualityScore": 0.75, ... },
    "friends": { "qualityScore": 0.79, ... }
  },
  "trending": {
    "improving": ["ai (+12.3%)", "friends (+8.1%)"],
    "declining": ["tmdb (-3.2%)"]
  },
  "recommendations": [
    "AI recommendations performing above average",
    "Consider increasing recommendation diversity"
  ]
}
```

### A/B Testing

```javascript
GET /api/metrics/compare?variantA=ai&variantB=tmdb&days=7

// Response:
{
  "winner": "ai",
  "confidence": 0.89,
  "insights": [
    "ai has 15.3% higher CTR",
    "ai recommendations get higher ratings (+1.2)",
    "ai has higher session success rate (+12.5%)"
  ]
}
```

## Environment Setup

Required API keys (at least one):

```bash
# OpenAI (for GPT-4o and GPT-4o-mini)
OPENAI_API_KEY=sk-...

# Anthropic (for Claude 3.5 Sonnet)
ANTHROPIC_API_KEY=sk-ant-...

# TMDB (always required)
TMDB_API_KEY=...
```

## How AI Recommendations Work

### 1. Behavioral Analysis
```
User watches Breaking Bad (Crime, Drama) → 10/10 rating
User watches The Wire (Crime, Drama) → 9/10 rating
User starts but abandons sitcoms → Low completion

→ Pattern: Prefers serious crime dramas, high completion rate
→ Binge tendency: High (multi-season shows)
→ Quality bar: 8.0+ ratings only
```

### 2. Creative AI Prompt
```
"Find shows with moral complexity and character evolution.
User loved Breaking Bad (rated 10/10) and The Wire (9/10).
High completion rate suggests commitment to deep narratives.
Avoid lightweight content - they prefer serious themes."
```

### 3. Analytical AI Processing
```
- Top genres: Crime (85%), Drama (78%), Thriller (45%)
- Completion rate: 92%
- Binge score: 0.8 (high)
- Preference: New shows (2020+)

→ Filter: Crime OR Drama AND rating >= 8.0 AND multi-season
→ Result: Ozark, Better Call Saul, Succession
```

### 4. Claude Deep Analysis
```
"This user exhibits sophisticated taste preferences:
- Gravitates toward morally ambiguous protagonists
- Values character development over plot twists  
- Demonstrates patience for slow-burn narratives
- Prefers prestige TV with critical acclaim

Recommended: Shows with similar psychological depth..."
```

### 5. Ensemble & Ranking
```
All 3 models agree on "Ozark" → Boost +0.1
GPT-4o and Claude agree on "Succession" → Boost +0.05
Only TMDB suggests "Generic Action Show" → Lower priority

Final ranking by consensus-weighted score
```

## Measurement & Optimization

### Key Metrics

1. **Click-Through Rate (CTR)**: 15-25% is good
2. **Add to Watchlist Rate**: 10-20% is strong
3. **Watch Rate**: 8-15% is excellent
4. **Quality Score**: 0.7+ indicates good recommendations
5. **Session Success**: 60%+ users taking positive actions

### Continuous Improvement

The system learns from every interaction:

```
User adds show to watchlist → +0.2 quality update
User watches show → +0.3 quality update  
User rates 9/10 → +0.36 quality update
User dismisses → -0.3 quality update
```

These signals feed back into the AI prompts for future recommendations.

### A/B Test Interpretation

When comparing variants:
- **Quality Score** difference > 5% = significant
- **Confidence** > 80% = reliable result
- Sample size > 100 recommendations = valid test

## Best Practices

### For Frontend Integration

```typescript
// 1. Track when recommendations are shown
recommendationShown(rec) {
  fetch('/api/metrics/action', {
    method: 'POST',
    body: JSON.stringify({
      recommendationId: rec.id,
      tmdbId: rec.tmdbId,
      actionType: 'view',
      timeToAction: 0
    })
  });
}

// 2. Track user actions
userClicksShow(rec) {
  const timeToAction = Date.now() - rec.shownAt;
  
  fetch('/api/metrics/action', {
    method: 'POST',
    body: JSON.stringify({
      recommendationId: rec.id,
      tmdbId: rec.tmdbId,
      actionType: 'add_watchlist',
      timeToAction
    })
  });
}

// 3. Track ratings
userRatesShow(rec, rating) {
  fetch('/api/metrics/action', {
    method: 'POST',
    body: JSON.stringify({
      recommendationId: rec.id,
      tmdbId: rec.tmdbId,
      actionType: 'rate',
      actionValue: rating
    })
  });
}
```

### For Backend Optimization

1. **Monitor dashboard daily**: Check for declining sources
2. **Run A/B tests weekly**: Compare AI vs TMDB vs Friends
3. **Review insights**: Act on "improving" and "declining" signals
4. **Adjust weights**: If AI performs better, increase its weight
5. **Diversity check**: Ensure qualityScore stays above 0.6

## Performance

**Typical Response Times:**
- TMDB only: 200-500ms
- AI (GPT-4o-mini): 1-2s
- AI (GPT-4o creative): 2-4s  
- Claude Deep: 3-5s
- Full Ensemble: 3-6s (parallel execution)

**Optimization Tips:**
- Use caching (10min TTL for user patterns)
- Run models in parallel with Promise.all()
- Fallback to fast models if slow ones timeout
- Cache TMDB data aggressively

## Cost Optimization

**Token Usage (approximate):**
- GPT-4o-mini: ~500 tokens/request ($0.0015)
- GPT-4o: ~1000 tokens/request ($0.015)
- Claude Sonnet: ~1500 tokens/request ($0.0075)

**Total per recommendation session:** $0.02-0.03

**Cost-saving strategies:**
1. Use GPT-4o-mini for quick filters
2. Reserve GPT-4o for personalized sessions
3. Cache results for 10 minutes per user
4. Batch similar requests
5. Use TMDB-only for anonymous users

## Architecture

```
┌─────────────────────────────────────────────────┐
│          Frontend - Discover Page               │
│  (User interactions, UI, action tracking)       │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│    Unified Recommendations API                  │
│    /api/recommendations/unified                 │
└─────┬───────────────────────────────────────────┘
      │
      ├──► TMDB Service
      │      - Trending, discover, popular
      │      - Genre & platform filtering
      │
      ├──► Enhanced AI Engine  
      │      ├──► Behavioral Analysis
      │      ├──► GPT-4o Creative
      │      ├──► GPT-4o-mini Analytical
      │      └──► Claude 3.5 Deep Context
      │
      └──► Friends Recommendations
             - Social collaborative filtering
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│         Recommendation Metrics                  │
│  - Event logging, A/B testing, dashboard        │
└─────────────────────────────────────────────────┘
```

## Troubleshooting

### "AI recommendations returning 0 results"
- Check API keys are set
- Verify TMDB is returning shows
- Check filters aren't too restrictive
- Review console logs for specific errors

### "Low quality scores"
- Review user action rates - are recommendations relevant?
- Check if diversity score is too low (filter bubble)
- Compare A/B test results - which source performs best?
- Verify user profile has sufficient data

### "Slow response times"
- Enable caching (10min TTL recommended)
- Use GPT-4o-mini instead of GPT-4o
- Reduce max_tokens in AI prompts
- Consider removing Claude if too slow

## Future Enhancements

- [ ] Collaborative filtering with similar users
- [ ] Real-time trending boost from social media
- [ ] Mood detection from time-of-day patterns
- [ ] Multi-language support
- [ ] Genre discovery (expand user's taste)
- [ ] Seasonal recommendations (holidays, events)
- [ ] Voice-based recommendation explanations
- [ ] Integration with viewing platforms

---

**Questions?** Check `/api/metrics/health` for system status or `/api/metrics/dashboard` for performance insights.
