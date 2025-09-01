# 🎯 BingeBoard Recommendation Engine

## The Heart of BingeBoard

This comprehensive recommendation engine serves as the core personalization system for BingeBoard, delivering solid, encompassing, and personally relevant recommendations while maintaining scalability. It integrates seamlessly with your existing multi-API streaming service to provide sophisticated content discovery.

## 🏗️ Architecture Overview

### Core Pillars

1. **User-Centric Data Collection**
   - Implicit behavior tracking (watch time, completion rates, interaction patterns)
   - Explicit preferences (genres, networks, content ratings, languages)
   - Social graph analysis (friend connections, shared activities)
   - Cross-platform usage patterns

2. **Content Metadata Integration**
   - Multi-API streaming service integration (TMDB + Watchmode + Utelly + Streaming Availability)
   - Rich content features (genres, cast, keywords, ratings, popularity)
   - Real-time streaming availability
   - Content similarity calculations

3. **Hybrid Recommendation Models**
   - **Collaborative Filtering**: Find users with similar taste
   - **Content-Based Filtering**: Recommend similar content to what users enjoyed
   - **Social Recommendations**: Leverage friend network activity
   - **Trending Analysis**: Incorporate platform-wide popularity
   - **Hybrid Algorithm**: Intelligently combine all approaches

4. **AI-Enhanced Personalization**
   - Dynamic user taste profiling
   - Real-time preference adaptation
   - Semantic content understanding
   - Explainable AI recommendations

## 📊 Database Schema

### Enhanced Tables

The recommendation engine extends your existing schema with sophisticated tracking:

```sql
-- User behavior events for granular tracking
user_behavior_events (
  id, user_id, content_id, event_type, 
  session_id, timestamp, duration_seconds,
  platform, device_type, metadata
)

-- Content features for ML models
content_features (
  content_id, feature_type, feature_name, 
  feature_value, confidence_score, extracted_at
)

-- Dynamic user taste profiles
user_taste_profiles (
  user_id, profile_type, preferences,
  last_updated, confidence_score, metadata
)

-- Content embeddings for semantic similarity
content_embeddings (
  content_id, embedding_model, embedding_vector,
  dimension_count, created_at, metadata
)

-- Recommendation candidates with scoring breakdown
recommendation_candidates (
  id, user_id, content_id, algorithm_type,
  base_score, boost_factors, penalty_factors,
  final_score, explanation, generated_at
)

-- Social signals from friend network
social_signals (
  id, user_id, friend_id, content_id,
  signal_type, signal_strength, timestamp
)
```

## 🚀 API Endpoints

### Main Recommendations
```typescript
GET /api/recommendations
// Get comprehensive personalized recommendations
// Returns: Sectioned recommendations (For You, Social, Trending)

GET /api/recommendations/for-you?limit=20
// Get hybrid algorithm recommendations

GET /api/recommendations/social?limit=15
// Get friend-based recommendations

GET /api/recommendations/trending?limit=20
// Get trending recommendations with personalization
```

### Feedback & Analytics
```typescript
POST /api/recommendations/feedback
// Record user interactions (clicks, dismissals, additions)

GET /api/recommendations/analytics
// Performance metrics and insights (admin)

GET /api/recommendations/explain/:contentId
// Detailed explanation for specific recommendation
```

### User Profile
```typescript
GET /api/recommendations/profile
// User's taste profile and preferences

POST /api/recommendations/refresh
// Force refresh of recommendations
```

## 🔧 Integration Guide

### 1. Install Dependencies

The recommendation engine works with your existing infrastructure:

```bash
# Already included in your package.json
npm install drizzle-orm postgres
```

### 2. Database Migration

Apply the enhanced schema (see `RECOMMENDATION_ENGINE_SCHEMA.md`):

```bash
# Run the enhanced schema migration
npx drizzle-kit migrate
```

### 3. Service Integration

Add to your main server:

```typescript
// server/index.ts
import recommendationRoutes from './routes/recommendations.js';

app.use('/api/recommendations', recommendationRoutes);
```

### 4. Frontend Integration

```typescript
// Frontend usage example
const recommendations = await fetch('/api/recommendations');
const { sections } = await recommendations.json();

// sections: [
//   { key: 'for_you', title: 'For You', items: [...] },
//   { key: 'friends_watching', title: 'Friends Are Watching', items: [...] },
//   { key: 'trending_now', title: 'Trending Now', items: [...] }
// ]
```

## 🎛️ Algorithm Configuration

### Content-Based Filtering
- **Genre Matching**: Weighted by explicit preferences and implicit affinities
- **Cast Affinity**: Based on viewing history and completion rates
- **Content Features**: Ratings, popularity, recency, keywords
- **Platform Availability**: Boost for user's subscribed platforms

### Collaborative Filtering
- **User Similarity**: Based on shared viewing history and ratings
- **Neighbor Discovery**: Find users with overlapping tastes
- **Preference Prediction**: Predict user preferences from similar users
- **Social Weighting**: Higher weight for friend recommendations

### Hybrid Algorithm
- **Score Combination**: Weighted average of all algorithms
- **Diversity Enforcement**: Limit similar content in recommendations
- **Freshness Factor**: Balance familiar vs. discovery content
- **Availability Optimization**: Prioritize accessible content

## 📈 Performance Optimization

### Caching Strategy
- **User Profiles**: 30-minute cache for preference data
- **Content Features**: Daily refresh for metadata
- **Recommendations**: Smart cache with invalidation triggers
- **Similarity Computations**: Precomputed and stored

### Scalability Features
- **Batch Processing**: Generate recommendations for multiple users
- **Incremental Updates**: Real-time preference adjustments
- **A/B Testing**: Built-in experimentation framework
- **Performance Monitoring**: Comprehensive analytics

## 🔍 Explainable AI

Every recommendation includes detailed explanations:

```typescript
interface RecommendationExplanation {
  primaryReason: string;
  factors: Array<{
    type: string;
    value: number;
    description: string;
  }>;
  similarContent: string[];
  socialSignals: string[];
  availabilityInfo: {
    platforms: string[];
    hasUserPlatforms: boolean;
  };
}
```

## 📊 Analytics & Insights

### User Behavior Tracking
- **Implicit Signals**: Watch time, completion rate, replay behavior
- **Explicit Feedback**: Ratings, watchlist additions, dismissals
- **Social Interactions**: Friend follows, shared content
- **Platform Usage**: Cross-platform viewing patterns

### Performance Metrics
- **Click-through Rate**: Recommendation engagement
- **Conversion Rate**: Watchlist additions from recommendations
- **Diversity Score**: Genre/content type distribution
- **Satisfaction Score**: User feedback aggregation

## 🔄 Real-time Updates

### Behavior Integration
```typescript
// Automatically log user actions
await logUserBehavior(userId, 'watch_start', {
  contentId,
  platform,
  sessionId,
  timestamp: new Date()
});

// Real-time preference updates
await updateUserPreferences(userId, {
  genreAffinity: { 'Drama': 0.8 },
  platformUsage: { 'Netflix': 5 }
});
```

### Dynamic Recommendations
- **Session-based**: Adjust during viewing session
- **Event-triggered**: Update on significant actions
- **Periodic Refresh**: Background recommendation updates
- **Social Sync**: Real-time friend activity integration

## 🚀 Deployment

### Environment Setup
```bash
# Environment variables
DATABASE_URL=postgresql://...
REDIS_URL=redis://...  # For caching
TMDB_API_KEY=your_key
WATCHMODE_API_KEY=your_key
```

### Production Configuration
```typescript
// Recommendation engine configuration
const config = {
  algorithms: {
    contentBased: { weight: 0.4, enabled: true },
    collaborative: { weight: 0.3, enabled: true },
    social: { weight: 0.2, enabled: true },
    trending: { weight: 0.1, enabled: true }
  },
  caching: {
    userProfileTTL: 30 * 60 * 1000,    // 30 minutes
    recommendationsTTL: 60 * 60 * 1000, // 1 hour
    contentFeaturesTTL: 24 * 60 * 60 * 1000 // 24 hours
  },
  limits: {
    maxRecommendationsPerSection: 50,
    maxSimilarUsers: 100,
    maxContentFeatures: 1000
  }
};
```

## 🎯 Key Features Summary

✅ **Multi-Algorithm Hybrid System**
- Collaborative, content-based, social, and trending algorithms
- Intelligent score combination and ranking
- Dynamic algorithm weighting based on user profile

✅ **Real-time Personalization**
- Live behavior tracking and preference updates
- Session-based recommendation adjustments
- Immediate feedback integration

✅ **Social Intelligence**
- Friend network analysis and recommendations
- Social signals and shared activity tracking
- Privacy-respecting social features

✅ **Streaming Integration**
- Multi-platform availability checking
- User subscription awareness
- Real-time streaming data updates

✅ **Explainable AI**
- Detailed recommendation explanations
- Transparent algorithm decisions
- User-friendly reasoning display

✅ **Performance & Scalability**
- Intelligent caching and optimization
- A/B testing framework
- Comprehensive analytics

✅ **Production Ready**
- Error handling and fallbacks
- Monitoring and alerting
- Horizontal scaling support

## 🔧 Maintenance

### Regular Tasks
- **Model Retraining**: Update similarity models weekly
- **Cache Optimization**: Monitor and tune cache hit rates
- **A/B Test Analysis**: Review and implement winning experiments
- **Performance Monitoring**: Track response times and accuracy

### Troubleshooting
- **Low Recommendation Quality**: Check user behavior data collection
- **Slow Response Times**: Review caching and database queries
- **Missing Explanations**: Verify algorithm explanation generation
- **Social Recommendations Missing**: Check friend network data

---

## 📞 Integration Support

This recommendation engine is designed to work seamlessly with your existing BingeBoard infrastructure:

- **Database**: Uses your existing Drizzle ORM and PostgreSQL setup
- **Authentication**: Integrates with your current auth middleware
- **Multi-API Service**: Leverages your TMDB + Watchmode + Utelly + Streaming Availability system
- **Frontend**: Provides clean API endpoints for your React components

The system is **production-ready**, **scalable**, and provides the comprehensive personalization that makes BingeBoard truly shine as a content discovery platform! 🌟
