# 🎯 BingeBoard Recommendation Engine - Database Schema Enhancement

## Enhanced Schema for Advanced Recommendation Engine

The following tables extend your existing schema to support a comprehensive, multi-layered recommendation system.

```sql
-- User behavior tracking with enhanced granularity
CREATE TABLE user_behavior_events (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR NOT NULL,
  event_type VARCHAR NOT NULL, -- 'view', 'click', 'play', 'pause', 'skip', 'like', 'dislike', 'share', 'add_to_list', 'remove_from_list', 'complete', 'abandon'
  content_id INTEGER REFERENCES shows(id),
  content_type VARCHAR NOT NULL, -- 'movie', 'tv', 'episode', 'trailer'
  platform_source VARCHAR, -- 'netflix', 'hulu', 'prime', etc.
  context JSONB, -- device, time_of_day, location, duration, progress_percent, etc.
  engagement_score REAL DEFAULT 0, -- calculated engagement score 0-1
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_behavior_user_id (user_id),
  INDEX idx_user_behavior_event_type (event_type),
  INDEX idx_user_behavior_content (content_id, content_type),
  INDEX idx_user_behavior_created_at (created_at)
);

-- Content features for ML models
CREATE TABLE content_features (
  id SERIAL PRIMARY KEY,
  content_id INTEGER NOT NULL REFERENCES shows(id),
  feature_type VARCHAR NOT NULL, -- 'genre', 'cast', 'director', 'keyword', 'mood', 'theme'
  feature_value VARCHAR NOT NULL,
  weight REAL DEFAULT 1.0,
  source VARCHAR DEFAULT 'tmdb', -- 'tmdb', 'ai_extracted', 'user_tagged'
  confidence REAL DEFAULT 1.0,
  
  UNIQUE(content_id, feature_type, feature_value),
  INDEX idx_content_features_content (content_id),
  INDEX idx_content_features_type (feature_type)
);

-- User taste profiles (dynamic, ML-driven)
CREATE TABLE user_taste_profiles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature_type VARCHAR NOT NULL,
  feature_value VARCHAR NOT NULL,
  affinity_score REAL NOT NULL, -- -1 to 1 (negative = dislike)
  confidence REAL DEFAULT 0.5,
  last_updated TIMESTAMP DEFAULT NOW(),
  decay_rate REAL DEFAULT 0.1, -- how quickly this preference decays
  
  UNIQUE(user_id, feature_type, feature_value),
  INDEX idx_taste_profiles_user (user_id),
  INDEX idx_taste_profiles_feature (feature_type, feature_value)
);

-- Content embeddings for semantic similarity
CREATE TABLE content_embeddings (
  id SERIAL PRIMARY KEY,
  content_id INTEGER NOT NULL REFERENCES shows(id),
  embedding_type VARCHAR NOT NULL, -- 'description', 'metadata', 'hybrid'
  embedding VECTOR(1536), -- OpenAI embeddings dimension
  model_version VARCHAR DEFAULT 'text-embedding-3-large',
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(content_id, embedding_type),
  INDEX idx_embeddings_content (content_id)
);

-- Recommendation candidates with scoring breakdown
CREATE TABLE recommendation_candidates (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id INTEGER NOT NULL REFERENCES shows(id),
  algorithm_type VARCHAR NOT NULL, -- 'collaborative', 'content_based', 'hybrid', 'trending', 'social'
  base_score REAL NOT NULL,
  popularity_boost REAL DEFAULT 0,
  recency_boost REAL DEFAULT 0,
  diversity_penalty REAL DEFAULT 0,
  availability_boost REAL DEFAULT 0,
  social_boost REAL DEFAULT 0,
  final_score REAL NOT NULL,
  explanation JSONB, -- detailed breakdown of why recommended
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours',
  
  UNIQUE(user_id, content_id, algorithm_type),
  INDEX idx_rec_candidates_user_score (user_id, final_score DESC),
  INDEX idx_rec_candidates_expires (expires_at)
);

-- User context tracking for contextual recommendations
CREATE TABLE user_context (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  context_type VARCHAR NOT NULL, -- 'time_of_day', 'day_of_week', 'device', 'session_length', 'mood'
  context_value VARCHAR NOT NULL,
  frequency INTEGER DEFAULT 1,
  last_seen TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, context_type, context_value),
  INDEX idx_user_context_user (user_id)
);

-- Social recommendation signals
CREATE TABLE social_signals (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id INTEGER NOT NULL REFERENCES shows(id),
  signal_type VARCHAR NOT NULL, -- 'watched', 'liked', 'recommended', 'shared', 'rated'
  signal_strength REAL DEFAULT 1.0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_social_signals_user (user_id),
  INDEX idx_social_signals_content (content_id),
  INDEX idx_social_signals_created (created_at)
);

-- A/B testing for recommendation algorithms
CREATE TABLE recommendation_experiments (
  id SERIAL PRIMARY KEY,
  experiment_name VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  variant VARCHAR NOT NULL, -- 'control', 'treatment_a', 'treatment_b'
  algorithm_config JSONB,
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  UNIQUE(experiment_name, user_id),
  INDEX idx_rec_experiments_active (is_active, experiment_name)
);

-- Recommendation feedback for continuous learning
CREATE TABLE recommendation_feedback (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recommendation_id INTEGER REFERENCES recommendation_candidates(id),
  content_id INTEGER NOT NULL REFERENCES shows(id),
  feedback_type VARCHAR NOT NULL, -- 'impression', 'click', 'like', 'dislike', 'not_interested', 'watch_started', 'watch_completed'
  feedback_value REAL, -- numerical feedback value if applicable
  context JSONB, -- where/when/how feedback was given
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_rec_feedback_user (user_id),
  INDEX idx_rec_feedback_content (content_id),
  INDEX idx_rec_feedback_type (feedback_type)
);

-- Similar content precomputed for fast lookups
CREATE TABLE content_similarity (
  id SERIAL PRIMARY KEY,
  content_id_a INTEGER NOT NULL REFERENCES shows(id),
  content_id_b INTEGER NOT NULL REFERENCES shows(id),
  similarity_type VARCHAR NOT NULL, -- 'genre', 'cast', 'embedding', 'user_behavior'
  similarity_score REAL NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(content_id_a, content_id_b, similarity_type),
  INDEX idx_content_similarity_a (content_id_a, similarity_score DESC),
  INDEX idx_content_similarity_b (content_id_b, similarity_score DESC)
);

-- User clustering for collaborative filtering
CREATE TABLE user_clusters (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cluster_id VARCHAR NOT NULL,
  cluster_type VARCHAR NOT NULL, -- 'taste_based', 'behavior_based', 'demographic'
  similarity_score REAL DEFAULT 1.0,
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_clusters_user (user_id),
  INDEX idx_user_clusters_cluster (cluster_id)
);

-- Trending content cache
CREATE TABLE trending_cache (
  id SERIAL PRIMARY KEY,
  content_id INTEGER NOT NULL REFERENCES shows(id),
  time_window VARCHAR NOT NULL, -- 'hour', 'day', 'week', 'month'
  trend_type VARCHAR NOT NULL, -- 'global', 'genre', 'platform', 'friend_network'
  trend_score REAL NOT NULL,
  segment JSONB, -- demographic/interest segment
  calculated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  
  UNIQUE(content_id, time_window, trend_type, segment),
  INDEX idx_trending_cache_expires (expires_at),
  INDEX idx_trending_cache_score (trend_type, trend_score DESC)
);

-- Platform availability optimization
CREATE TABLE platform_user_preferences (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform_name VARCHAR NOT NULL,
  has_subscription BOOLEAN DEFAULT FALSE,
  usage_frequency REAL DEFAULT 0, -- 0-1 based on user behavior
  preference_score REAL DEFAULT 0.5, -- user's preference for this platform
  last_updated TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, platform_name),
  INDEX idx_platform_prefs_user (user_id)
);
```

## Indexes for Performance

```sql
-- Composite indexes for common recommendation queries
CREATE INDEX idx_user_behavior_user_content_time ON user_behavior_events(user_id, content_id, created_at DESC);
CREATE INDEX idx_taste_profiles_user_score ON user_taste_profiles(user_id, affinity_score DESC);
CREATE INDEX idx_rec_candidates_user_final_score ON recommendation_candidates(user_id, final_score DESC, expires_at);
CREATE INDEX idx_content_features_type_value ON content_features(feature_type, feature_value, weight);

-- GIN indexes for JSONB columns
CREATE INDEX idx_rec_candidates_explanation_gin ON recommendation_candidates USING GIN(explanation);
CREATE INDEX idx_user_behavior_context_gin ON user_behavior_events USING GIN(context);
CREATE INDEX idx_social_signals_metadata_gin ON social_signals USING GIN(metadata);
```

## Vector Search Setup (if using pgvector)

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create vector index for semantic search
CREATE INDEX idx_content_embeddings_vector ON content_embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Update statistics for better query planning
ANALYZE content_embeddings;
```

This enhanced schema provides the foundation for:
- ✅ **Multi-algorithm recommendations** (collaborative, content-based, hybrid)
- ✅ **Real-time behavior tracking** with rich context
- ✅ **Semantic content understanding** with embeddings
- ✅ **Social recommendation signals** from friend networks
- ✅ **A/B testing framework** for algorithm optimization
- ✅ **Continuous learning** from user feedback
- ✅ **Platform-aware recommendations** using your multi-API streaming data
