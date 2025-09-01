-- BingeBoard Recommendation Engine Database Schema
-- This migration adds tables for advanced personalization features

-- User temporal metrics (pre-aggregated for performance)
CREATE TABLE IF NOT EXISTS user_temporal_metrics (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  metrics JSONB NOT NULL COMMENT 'Stored TemporalPreferences JSON',
  computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_temporal_metrics_user_id (user_id),
  INDEX idx_user_temporal_metrics_updated (updated_at),
  
  COMMENT 'Pre-computed temporal viewing preferences for performance optimization'
);

-- User device preferences
CREATE TABLE IF NOT EXISTS user_device_preferences (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  device_type ENUM('mobile', 'tablet', 'desktop', 'tv') NOT NULL,
  preferences JSONB NOT NULL COMMENT 'DevicePreferences JSON',
  session_count INT DEFAULT 1,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_user_device (user_id, device_type),
  INDEX idx_device_prefs_user (user_id),
  
  COMMENT 'Device-specific viewing preferences and usage patterns'
);

-- Seasonal content boosts (for dynamic seasonal adjustments)
CREATE TABLE IF NOT EXISTS seasonal_content_boosts (
  id SERIAL PRIMARY KEY,
  content_id VARCHAR(255) NOT NULL,
  boost_type VARCHAR(100) NOT NULL COMMENT 'horror, holiday, comfort, etc.',
  boost_value DECIMAL(3,2) NOT NULL COMMENT 'Boost multiplier (0.00-1.00)',
  active_from DATE NOT NULL,
  active_until DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_seasonal_content_boost (content_id, boost_type),
  INDEX idx_seasonal_active_period (active_from, active_until),
  INDEX idx_seasonal_boost_type (boost_type),
  
  COMMENT 'Dynamic seasonal boosts for content recommendations'
);

-- Recommendation analytics and A/B testing
CREATE TABLE IF NOT EXISTS recommendation_events (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  recommendation_id VARCHAR(255) NOT NULL,
  content_id VARCHAR(255) NOT NULL,
  algorithm VARCHAR(100) NOT NULL COMMENT 'advanced_personalization, basic, seasonal, etc.',
  device_type VARCHAR(50),
  context_data JSONB COMMENT 'PersonalizationContext at time of recommendation',
  event_type ENUM('impression', 'click', 'watch_start', 'watch_complete') NOT NULL,
  position INT COMMENT 'Position in recommendation list',
  score DECIMAL(4,3) COMMENT 'Final recommendation score',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_rec_events_user (user_id),
  INDEX idx_rec_events_algorithm (algorithm),
  INDEX idx_rec_events_type (event_type),
  INDEX idx_rec_events_created (created_at),
  INDEX idx_rec_events_content (content_id),
  
  COMMENT 'Track recommendation performance and user interactions'
);

-- A/B testing experiments
CREATE TABLE IF NOT EXISTS ab_test_events (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  experiment VARCHAR(100) NOT NULL,
  variant VARCHAR(100) NOT NULL,
  interaction ENUM('view', 'click', 'watch') NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_ab_test_user (user_id),
  INDEX idx_ab_test_experiment (experiment, variant),
  INDEX idx_ab_test_timestamp (timestamp),
  
  COMMENT 'A/B testing events for recommendation algorithm comparison'
);

-- Content genre mapping (for improved seasonal boost matching)
CREATE TABLE IF NOT EXISTS content_genre_mapping (
  content_id VARCHAR(255) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 1.00 COMMENT 'Genre classification confidence',
  source VARCHAR(50) DEFAULT 'tmdb' COMMENT 'Source of genre data',
  
  PRIMARY KEY (content_id, genre),
  INDEX idx_genre_mapping_content (content_id),
  INDEX idx_genre_mapping_genre (genre),
  
  COMMENT 'Normalized genre mapping for content to improve matching'
);

-- Performance metrics (for monitoring)
CREATE TABLE IF NOT EXISTS recommendation_performance_logs (
  id SERIAL PRIMARY KEY,
  method_name VARCHAR(100) NOT NULL,
  duration_ms INT NOT NULL,
  user_count INT DEFAULT 1,
  cache_hit BOOLEAN DEFAULT FALSE,
  error_count INT DEFAULT 0,
  metadata JSONB,
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_perf_logs_method (method_name),
  INDEX idx_perf_logs_duration (duration_ms),
  INDEX idx_perf_logs_logged (logged_at),
  
  COMMENT 'Performance monitoring logs for recommendation engine'
);

-- User preference cache invalidation tracking
CREATE TABLE IF NOT EXISTS cache_invalidation_log (
  id SERIAL PRIMARY KEY,
  cache_type VARCHAR(100) NOT NULL COMMENT 'temporal, device, seasonal',
  cache_key VARCHAR(255) NOT NULL,
  invalidated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason VARCHAR(255) COMMENT 'Why cache was invalidated',
  
  INDEX idx_cache_invalidation_type (cache_type),
  INDEX idx_cache_invalidation_key (cache_key),
  INDEX idx_cache_invalidation_time (invalidated_at),
  
  COMMENT 'Track cache invalidation for debugging and optimization'
);

-- Views for common analytics queries
CREATE VIEW recommendation_analytics_summary AS
SELECT 
  DATE(created_at) as date,
  algorithm,
  device_type,
  COUNT(*) as total_recommendations,
  COUNT(CASE WHEN event_type = 'click' THEN 1 END) as clicks,
  COUNT(CASE WHEN event_type = 'watch_start' THEN 1 END) as watch_starts,
  AVG(score) as avg_score,
  AVG(position) as avg_position
FROM recommendation_events 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at), algorithm, device_type
ORDER BY date DESC, total_recommendations DESC;

-- Performance summary view
CREATE VIEW performance_summary AS
SELECT 
  method_name,
  DATE(logged_at) as date,
  COUNT(*) as call_count,
  AVG(duration_ms) as avg_duration_ms,
  MAX(duration_ms) as max_duration_ms,
  SUM(CASE WHEN cache_hit = TRUE THEN 1 ELSE 0 END) / COUNT(*) as cache_hit_rate,
  SUM(error_count) as total_errors
FROM recommendation_performance_logs
WHERE logged_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY method_name, DATE(logged_at)
ORDER BY date DESC, avg_duration_ms DESC;
