/**
 * Enhanced Database Integration Service
 * Multi-database support (SQLite for dev, Postgres for prod)
 * Improved performance, error handling, and JSON processing
 */

import Database from 'better-sqlite3';
import { Pool, Client } from 'pg';
import path from 'path';

interface UserBehaviorRecord {
  userId: string;
  tmdbId: number;
  action: 'viewed' | 'completed' | 'skipped' | 'rated' | 'liked' | 'shared';
  timestamp: number;
  sessionDuration?: number;
  rating?: number;
  completionPercentage?: number;
  skipReason?: string;
  contextualData?: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: string;
    device: string;
    location: string;
    experimentName?: string;
    experimentVariant?: string;
  };
}

interface ContentMetrics {
  tmdbId: number;
  mediaType: 'tv' | 'movie';
  title: string;
  genres: string[];
  averageRating: number;
  totalViews: number;
  completionRate: number;
  skipRate: number;
  lastUpdated: number;
  trendingScore: number;
  popularityIndex: number;
}

interface UserSimilarity {
  userId1: string;
  userId2: string;
  similarityScore: number;
  commonInterests: string[];
  lastCalculated: number;
  sharedViews: number;
}

interface UserBehaviorAnalytics {
  userId: string;
  totalViews: number;
  averageSessionDuration: number;
  favoriteGenres: string[];
  preferredTimeSlots: string[];
  completionRate: number;
  averageRating: number;
  lastActiveDate: string;
  genreEmbedding?: number[];
}

interface DatabaseConfig {
  type: 'sqlite' | 'postgres';
  sqlitePath?: string;
  postgresUrl?: string;
  poolConfig?: {
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
  };
}

export class DatabaseError extends Error {
  constructor(message: string, public code: string, public originalError?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class DatabaseIntegrationService {
  private config: DatabaseConfig;
  private sqliteDb?: Database.Database;
  private pgPool?: Pool;
  private isInitialized = false;

  constructor(config?: DatabaseConfig) {
    this.config = config || {
      type: process.env.NODE_ENV === 'production' ? 'postgres' : 'sqlite',
      sqlitePath: path.join(process.cwd(), 'dev.db'),
      postgresUrl: process.env.DATABASE_URL,
      poolConfig: {
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
      }
    };

    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      console.log(`🗄️ Initializing ${this.config.type} database with analytics tables...`);

      if (this.config.type === 'sqlite') {
        await this.initializeSQLite();
      } else {
        await this.initializePostgres();
      }

      this.isInitialized = true;
      console.log('✅ Database analytics tables initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      throw new DatabaseError('Failed to initialize database', 'INIT_ERROR', error as Error);
    }
  }

  private async initializeSQLite(): Promise<void> {
    this.sqliteDb = new Database(this.config.sqlitePath!);
    
    // Enable optimizations
    try {
      this.sqliteDb.pragma('journal_mode = WAL');
      this.sqliteDb.pragma('synchronous = NORMAL');
      this.sqliteDb.pragma('cache_size = 1000');
    } catch (error) {
      console.warn('⚠️ SQLite optimization failed:', error);
    }

    const schemas = this.getSQLiteSchemas();
    const transaction = this.sqliteDb.transaction(() => {
      schemas.forEach(schema => this.sqliteDb!.exec(schema));
    });
    transaction();
  }

  private async initializePostgres(): Promise<void> {
    this.pgPool = new Pool({
      connectionString: this.config.postgresUrl,
      ...this.config.poolConfig
    });

    const client = await this.pgPool.connect();
    try {
      const schemas = this.getPostgresSchemas();
      for (const schema of schemas) {
        await client.query(schema);
      }
    } finally {
      client.release();
    }
  }

  private getSQLiteSchemas(): string[] {
    return [
      `CREATE TABLE IF NOT EXISTS user_behavior (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        tmdb_id INTEGER NOT NULL,
        action TEXT CHECK(action IN ('viewed', 'completed', 'skipped', 'rated', 'liked', 'shared')) NOT NULL,
        timestamp INTEGER NOT NULL,
        session_duration INTEGER,
        rating REAL,
        completion_percentage REAL,
        skip_reason TEXT,
        contextual_data TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );`,
      
      `CREATE TABLE IF NOT EXISTS content_metrics (
        tmdb_id INTEGER PRIMARY KEY,
        media_type TEXT CHECK(media_type IN ('tv', 'movie')) NOT NULL,
        title TEXT NOT NULL,
        genres TEXT NOT NULL,
        average_rating REAL DEFAULT 0,
        total_views INTEGER DEFAULT 0,
        completion_rate REAL DEFAULT 0,
        skip_rate REAL DEFAULT 0,
        last_updated INTEGER DEFAULT (unixepoch()),
        trending_score REAL DEFAULT 0,
        popularity_index REAL DEFAULT 0
      );`,
      
      `CREATE TABLE IF NOT EXISTS user_similarity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id_1 TEXT NOT NULL,
        user_id_2 TEXT NOT NULL,
        similarity_score REAL NOT NULL,
        common_interests TEXT,
        last_calculated INTEGER DEFAULT (unixepoch()),
        shared_views INTEGER DEFAULT 0,
        UNIQUE(user_id_1, user_id_2),
        FOREIGN KEY (user_id_1) REFERENCES users(id),
        FOREIGN KEY (user_id_2) REFERENCES users(id)
      );`,
      
      `CREATE TABLE IF NOT EXISTS content_embeddings (
        tmdb_id INTEGER PRIMARY KEY,
        embedding_vector TEXT NOT NULL,
        embedding_model TEXT NOT NULL,
        last_updated INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (tmdb_id) REFERENCES content_metrics(tmdb_id)
      );`,
      
      `CREATE TABLE IF NOT EXISTS user_genre_embeddings (
        user_id TEXT PRIMARY KEY,
        genre_vector TEXT NOT NULL,
        last_updated INTEGER DEFAULT (unixepoch()),
        total_interactions INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );`,
      
      'CREATE INDEX IF NOT EXISTS idx_user_behavior_user_id ON user_behavior(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_behavior_tmdb_id ON user_behavior(tmdb_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_behavior_action ON user_behavior(action);',
      'CREATE INDEX IF NOT EXISTS idx_user_behavior_timestamp ON user_behavior(timestamp);',
      'CREATE INDEX IF NOT EXISTS idx_content_metrics_media_type ON content_metrics(media_type);',
      'CREATE INDEX IF NOT EXISTS idx_content_metrics_trending_score ON content_metrics(trending_score DESC);',
      'CREATE INDEX IF NOT EXISTS idx_user_similarity_user1 ON user_similarity(user_id_1);',
      'CREATE INDEX IF NOT EXISTS idx_user_similarity_user2 ON user_similarity(user_id_2);',
      'CREATE INDEX IF NOT EXISTS idx_user_similarity_score ON user_similarity(similarity_score DESC);'
    ];
  }

  private getPostgresSchemas(): string[] {
    return [
      `CREATE TABLE IF NOT EXISTS user_behavior (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        tmdb_id INTEGER NOT NULL,
        action TEXT CHECK(action IN ('viewed', 'completed', 'skipped', 'rated', 'liked', 'shared')) NOT NULL,
        timestamp BIGINT NOT NULL,
        session_duration INTEGER,
        rating REAL,
        completion_percentage REAL,
        skip_reason TEXT,
        contextual_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      
      `CREATE TABLE IF NOT EXISTS content_metrics (
        tmdb_id INTEGER PRIMARY KEY,
        media_type TEXT CHECK(media_type IN ('tv', 'movie')) NOT NULL,
        title TEXT NOT NULL,
        genres JSONB NOT NULL,
        average_rating REAL DEFAULT 0,
        total_views INTEGER DEFAULT 0,
        completion_rate REAL DEFAULT 0,
        skip_rate REAL DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        trending_score REAL DEFAULT 0,
        popularity_index REAL DEFAULT 0
      );`,
      
      `CREATE TABLE IF NOT EXISTS user_similarity (
        id SERIAL PRIMARY KEY,
        user_id_1 TEXT NOT NULL,
        user_id_2 TEXT NOT NULL,
        similarity_score REAL NOT NULL,
        common_interests JSONB,
        last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        shared_views INTEGER DEFAULT 0,
        UNIQUE(user_id_1, user_id_2)
      );`,
      
      `CREATE TABLE IF NOT EXISTS content_embeddings (
        tmdb_id INTEGER PRIMARY KEY,
        embedding_vector REAL[] NOT NULL,
        embedding_model TEXT NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      
      `CREATE TABLE IF NOT EXISTS user_genre_embeddings (
        user_id TEXT PRIMARY KEY,
        genre_vector REAL[] NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_interactions INTEGER DEFAULT 0
      );`,
      
      'CREATE INDEX IF NOT EXISTS idx_user_behavior_user_id ON user_behavior(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_behavior_tmdb_id ON user_behavior(tmdb_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_behavior_action ON user_behavior(action);',
      'CREATE INDEX IF NOT EXISTS idx_user_behavior_timestamp ON user_behavior(timestamp);',
      'CREATE INDEX IF NOT EXISTS idx_content_metrics_media_type ON content_metrics(media_type);',
      'CREATE INDEX IF NOT EXISTS idx_content_metrics_trending_score ON content_metrics(trending_score DESC);',
      'CREATE INDEX IF NOT EXISTS idx_user_similarity_user1 ON user_similarity(user_id_1);',
      'CREATE INDEX IF NOT EXISTS idx_user_similarity_user2 ON user_similarity(user_id_2);',
      'CREATE INDEX IF NOT EXISTS idx_user_similarity_score ON user_similarity(similarity_score DESC);',
      'CREATE INDEX IF NOT EXISTS idx_user_behavior_contextual_gin ON user_behavior USING GIN(contextual_data);',
      'CREATE INDEX IF NOT EXISTS idx_content_metrics_genres_gin ON content_metrics USING GIN(genres);'
    ];
  }

  async recordUserBehavior(record: UserBehaviorRecord): Promise<void> {
    if (!this.isInitialized) {
      throw new DatabaseError('Database not initialized', 'NOT_INITIALIZED');
    }

    try {
      if (this.config.type === 'sqlite') {
        await this.recordUserBehaviorSQLite(record);
      } else {
        await this.recordUserBehaviorPostgres(record);
      }

      // Update user genre embedding asynchronously
      this.updateUserGenreEmbeddingAsync(record.userId).catch(console.error);

      console.log(`📊 Recorded user behavior: ${record.userId} ${record.action} ${record.tmdbId}`);
    } catch (error) {
      console.error('❌ Error recording user behavior:', error);
      throw new DatabaseError('Failed to record user behavior', 'RECORD_ERROR', error as Error);
    }
  }

  private async recordUserBehaviorSQLite(record: UserBehaviorRecord): Promise<void> {
    const stmt = this.sqliteDb!.prepare(`
      INSERT INTO user_behavior (
        user_id, tmdb_id, action, timestamp, session_duration, 
        rating, completion_percentage, skip_reason, contextual_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.userId,
      record.tmdbId,
      record.action,
      record.timestamp,
      record.sessionDuration || null,
      record.rating || null,
      record.completionPercentage || null,
      record.skipReason || null,
      record.contextualData ? JSON.stringify(record.contextualData) : null
    );
  }

  private async recordUserBehaviorPostgres(record: UserBehaviorRecord): Promise<void> {
    const client = await this.pgPool!.connect();
    try {
      await client.query(`
        INSERT INTO user_behavior (
          user_id, tmdb_id, action, timestamp, session_duration, 
          rating, completion_percentage, skip_reason, contextual_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        record.userId,
        record.tmdbId,
        record.action,
        record.timestamp,
        record.sessionDuration || null,
        record.rating || null,
        record.completionPercentage || null,
        record.skipReason || null,
        record.contextualData || null
      ]);
    } finally {
      client.release();
    }
  }

  async getUserBehaviorAnalytics(userId: string, limit: number = 100): Promise<UserBehaviorAnalytics> {
    if (!this.isInitialized) {
      throw new DatabaseError('Database not initialized', 'NOT_INITIALIZED');
    }

    try {
      if (this.config.type === 'sqlite') {
        return await this.getUserBehaviorAnalyticsSQLite(userId, limit);
      } else {
        return await this.getUserBehaviorAnalyticsPostgres(userId, limit);
      }
    } catch (error) {
      console.error('❌ Error getting user behavior analytics:', error);
      return this.getDefaultAnalytics(userId);
    }
  }

  private async getUserBehaviorAnalyticsSQLite(userId: string, limit: number): Promise<UserBehaviorAnalytics> {
    const query = `
      SELECT 
        action,
        COUNT(*) as action_count,
        AVG(session_duration) as avg_duration,
        AVG(rating) as avg_rating,
        AVG(completion_percentage) as avg_completion,
        MAX(timestamp) as last_active
      FROM user_behavior 
      WHERE user_id = ?
      GROUP BY action
      ORDER BY timestamp DESC
      LIMIT ?
    `;

    const rows = this.sqliteDb!.prepare(query).all(userId, limit) as any[];
    return this.processAnalyticsRows(userId, rows);
  }

  private async getUserBehaviorAnalyticsPostgres(userId: string, limit: number): Promise<UserBehaviorAnalytics> {
    const client = await this.pgPool!.connect();
    try {
      const query = `
        SELECT 
          action,
          COUNT(*) as action_count,
          AVG(session_duration) as avg_duration,
          AVG(rating) as avg_rating,
          AVG(completion_percentage) as avg_completion,
          MAX(timestamp) as last_active
        FROM user_behavior 
        WHERE user_id = $1
        GROUP BY action
        ORDER BY timestamp DESC
        LIMIT $2
      `;

      const result = await client.query(query, [userId, limit]);
      return this.processAnalyticsRows(userId, result.rows);
    } finally {
      client.release();
    }
  }

  private processAnalyticsRows(userId: string, rows: any[]): UserBehaviorAnalytics {
    let totalViews = 0;
    let averageSessionDuration = 0;
    let averageRating = 0;
    let completionRate = 0;
    let lastActiveDate = '';

    if (rows.length > 0) {
      const viewedRecord = rows.find(r => r.action === 'viewed');
      const completedRecord = rows.find(r => r.action === 'completed');
      const ratedRecord = rows.find(r => r.action === 'rated');

      totalViews = viewedRecord ? parseInt(viewedRecord.action_count) : 0;
      averageSessionDuration = viewedRecord ? (viewedRecord.avg_duration || 0) : 0;
      averageRating = ratedRecord ? (ratedRecord.avg_rating || 0) : 0;
      completionRate = completedRecord && viewedRecord 
        ? (parseInt(completedRecord.action_count) / parseInt(viewedRecord.action_count)) 
        : 0;
      
      const latestTimestamp = Math.max(...rows.map(r => r.last_active).filter(Boolean));
      lastActiveDate = latestTimestamp ? new Date(latestTimestamp * 1000).toISOString() : '';
    }

    // Get favorite genres - safely parse JSON in JavaScript
    const favoriteGenres = this.getFavoriteGenresForUser(userId);
    const preferredTimeSlots = this.getPreferredTimeSlotsForUser(userId);

    return {
      userId,
      totalViews,
      averageSessionDuration: Math.round(averageSessionDuration),
      favoriteGenres,
      preferredTimeSlots,
      completionRate: Math.round(completionRate * 100) / 100,
      averageRating: Math.round(averageRating * 10) / 10,
      lastActiveDate
    };
  }

  private getFavoriteGenresForUser(userId: string): string[] {
    try {
      if (this.config.type === 'sqlite') {
        // Parse JSON in JavaScript instead of relying on JSON_EXTRACT
        const query = `
          SELECT cm.genres, COUNT(*) as count
          FROM user_behavior ub
          JOIN content_metrics cm ON ub.tmdb_id = cm.tmdb_id
          WHERE ub.user_id = ? AND ub.action IN ('viewed', 'completed')
          GROUP BY cm.genres
          ORDER BY count DESC
          LIMIT 10
        `;
        
        const rows = this.sqliteDb!.prepare(query).all(userId) as any[];
        const genreCounts = new Map<string, number>();
        
        rows.forEach(row => {
          try {
            const genres = JSON.parse(row.genres || '[]');
            if (Array.isArray(genres)) {
              genres.forEach(genre => {
                genreCounts.set(genre, (genreCounts.get(genre) || 0) + parseInt(row.count));
              });
            }
          } catch {
            // Ignore parse errors
          }
        });

        return Array.from(genreCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([genre]) => genre);
      }
      return [];
    } catch (error) {
      console.error('❌ Error getting favorite genres:', error);
      return [];
    }
  }

  private getPreferredTimeSlotsForUser(userId: string): string[] {
    try {
      if (this.config.type === 'sqlite') {
        // Parse contextual data to extract time preferences
        const query = `
          SELECT contextual_data, COUNT(*) as count
          FROM user_behavior
          WHERE user_id = ? AND contextual_data IS NOT NULL
          GROUP BY contextual_data
          ORDER BY count DESC
          LIMIT 20
        `;
        
        const rows = this.sqliteDb!.prepare(query).all(userId) as any[];
        const timeCounts = new Map<string, number>();
        
        rows.forEach(row => {
          try {
            const contextual = JSON.parse(row.contextual_data);
            if (contextual?.timeOfDay) {
              timeCounts.set(contextual.timeOfDay, (timeCounts.get(contextual.timeOfDay) || 0) + parseInt(row.count));
            }
          } catch {
            // Ignore parse errors
          }
        });

        return Array.from(timeCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([timeSlot]) => timeSlot);
      }
      return [];
    } catch (error) {
      console.error('❌ Error getting preferred time slots:', error);
      return [];
    }
  }

  private getDefaultAnalytics(userId: string): UserBehaviorAnalytics {
    return {
      userId,
      totalViews: 0,
      averageSessionDuration: 0,
      favoriteGenres: [],
      preferredTimeSlots: [],
      completionRate: 0,
      averageRating: 0,
      lastActiveDate: ''
    };
  }

  async updateUserGenreEmbeddingAsync(userId: string): Promise<void> {
    try {
      const analytics = await this.getUserBehaviorAnalytics(userId);
      if (analytics.favoriteGenres.length === 0) return;

      // Create a simple genre vector (this could be enhanced with ML embeddings)
      const allGenres = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 
                        'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 
                        'Romance', 'Science Fiction', 'TV Movie', 'Thriller', 'War', 'Western'];
      
      const genreVector = allGenres.map(genre => 
        analytics.favoriteGenres.includes(genre) ? 1.0 : 0.0
      );

      if (this.config.type === 'sqlite') {
        const stmt = this.sqliteDb!.prepare(`
          INSERT OR REPLACE INTO user_genre_embeddings 
          (user_id, genre_vector, total_interactions, last_updated)
          VALUES (?, ?, ?, unixepoch())
        `);
        stmt.run(userId, JSON.stringify(genreVector), analytics.totalViews);
      }
    } catch (error) {
      console.error('❌ Error updating user genre embedding:', error);
    }
  }

  async findSimilarUsers(targetUserId: string, limit: number = 10): Promise<Array<{ userId: string; similarity: number; commonInterests: string[] }>> {
    if (!this.isInitialized) {
      throw new DatabaseError('Database not initialized', 'NOT_INITIALIZED');
    }

    try {
      // Check for pre-computed similarities first
      const cached = await this.getCachedSimilarities(targetUserId, limit);
      if (cached.length > 0) {
        return cached;
      }

      // Compute similarities on demand
      return await this.computeSimilarUsers(targetUserId, limit);
    } catch (error) {
      console.error('❌ Error finding similar users:', error);
      return [];
    }
  }

  private async getCachedSimilarities(targetUserId: string, limit: number): Promise<Array<{ userId: string; similarity: number; commonInterests: string[] }>> {
    const cacheTimeSeconds = 24 * 60 * 60; // 24 hours
    
    if (this.config.type === 'sqlite') {
      const query = `
        SELECT 
          CASE 
            WHEN user_id_1 = ? THEN user_id_2 
            ELSE user_id_1 
          END as similar_user_id,
          similarity_score,
          common_interests
        FROM user_similarity 
        WHERE (user_id_1 = ? OR user_id_2 = ?)
          AND last_calculated > (unixepoch() - ?)
        ORDER BY similarity_score DESC
        LIMIT ?
      `;
      
      const rows = this.sqliteDb!.prepare(query).all(targetUserId, targetUserId, targetUserId, cacheTimeSeconds, limit) as any[];
      return rows.map(row => ({
        userId: row.similar_user_id,
        similarity: row.similarity_score,
        commonInterests: this.parseJsonSafely(row.common_interests, [])
      }));
    }
    
    return [];
  }

  private async computeSimilarUsers(targetUserId: string, limit: number): Promise<Array<{ userId: string; similarity: number; commonInterests: string[] }>> {
    // Get candidate users who have interacted with similar content
    const candidatesQuery = this.config.type === 'sqlite' 
      ? `SELECT DISTINCT user_id FROM user_behavior WHERE user_id != ? AND tmdb_id IN (SELECT tmdb_id FROM user_behavior WHERE user_id = ? LIMIT 50) LIMIT 20`
      : `SELECT DISTINCT user_id FROM user_behavior WHERE user_id != $1 AND tmdb_id IN (SELECT tmdb_id FROM user_behavior WHERE user_id = $2 LIMIT 50) LIMIT 20`;

    let candidateRows: any[] = [];
    
    if (this.config.type === 'sqlite') {
      candidateRows = this.sqliteDb!.prepare(candidatesQuery).all(targetUserId, targetUserId) as any[];
    } else {
      const client = await this.pgPool!.connect();
      try {
        const result = await client.query(candidatesQuery, [targetUserId, targetUserId]);
        candidateRows = result.rows;
      } finally {
        client.release();
      }
    }

    const similarities: Array<{ userId: string; similarity: number; commonInterests: string[] }> = [];

    for (const candidate of candidateRows) {
      const similarity = await this.calculateUserSimilarity(targetUserId, candidate.user_id);
      if (similarity.score > 0.1) {
        similarities.push({
          userId: candidate.user_id,
          similarity: similarity.score,
          commonInterests: similarity.commonInterests
        });
      }
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  private async calculateUserSimilarity(userId1: string, userId2: string): Promise<{ score: number; commonInterests: string[] }> {
    try {
      // Get viewing patterns for both users
      const pattern1 = await this.getViewingPattern(userId1);
      const pattern2 = await this.getViewingPattern(userId2);

      if (pattern1.length === 0 || pattern2.length === 0) {
        return { score: 0, commonInterests: [] };
      }

      // Calculate content overlap
      const tmdbIds1 = new Set(pattern1.map(p => p.tmdb_id));
      const tmdbIds2 = new Set(pattern2.map(p => p.tmdb_id));
      const commonContent = Array.from(tmdbIds1).filter(id => tmdbIds2.has(id));
      
      const unionSize = new Set(Array.from(tmdbIds1).concat(Array.from(tmdbIds2))).size;
      const contentSimilarity = commonContent.length / unionSize;

      // Extract and compare genres
      const genres1 = this.extractGenresFromPatterns(pattern1);
      const genres2 = this.extractGenresFromPatterns(pattern2);
      const commonGenres = genres1.filter(g => genres2.includes(g));
      
      const allGenresSize = new Set(genres1.concat(genres2)).size;
      const genreSimilarity = allGenresSize > 0 ? commonGenres.length / allGenresSize : 0;

      // Combined similarity (weighted)
      const totalSimilarity = (contentSimilarity * 0.7) + (genreSimilarity * 0.3);

      // Cache the result
      await this.cacheSimilarityResult(userId1, userId2, totalSimilarity, commonGenres, commonContent.length);

      return {
        score: Math.round(totalSimilarity * 100) / 100,
        commonInterests: commonGenres
      };
    } catch (error) {
      console.error('❌ Error calculating user similarity:', error);
      return { score: 0, commonInterests: [] };
    }
  }

  private async getViewingPattern(userId: string): Promise<any[]> {
    const query = this.config.type === 'sqlite'
      ? `SELECT ub.tmdb_id, ub.action, ub.rating, cm.genres FROM user_behavior ub LEFT JOIN content_metrics cm ON ub.tmdb_id = cm.tmdb_id WHERE ub.user_id = ? AND ub.action IN ('viewed', 'completed', 'rated', 'liked')`
      : `SELECT ub.tmdb_id, ub.action, ub.rating, cm.genres FROM user_behavior ub LEFT JOIN content_metrics cm ON ub.tmdb_id = cm.tmdb_id WHERE ub.user_id = $1 AND ub.action IN ('viewed', 'completed', 'rated', 'liked')`;

    if (this.config.type === 'sqlite') {
      return this.sqliteDb!.prepare(query).all(userId) as any[];
    } else {
      const client = await this.pgPool!.connect();
      try {
        const result = await client.query(query, [userId]);
        return result.rows;
      } finally {
        client.release();
      }
    }
  }

  private extractGenresFromPatterns(patterns: any[]): string[] {
    const genres = new Set<string>();
    patterns.forEach(p => {
      if (p.genres) {
        const genreList = this.parseJsonSafely(p.genres, []);
        if (Array.isArray(genreList)) {
          genreList.forEach(g => genres.add(g));
        }
      }
    });
    return Array.from(genres);
  }

  private async cacheSimilarityResult(userId1: string, userId2: string, similarity: number, commonGenres: string[], sharedViews: number): Promise<void> {
    if (this.config.type === 'sqlite') {
      const stmt = this.sqliteDb!.prepare(`
        INSERT OR REPLACE INTO user_similarity 
        (user_id_1, user_id_2, similarity_score, common_interests, shared_views, last_calculated)
        VALUES (?, ?, ?, ?, ?, unixepoch())
      `);
      stmt.run(userId1, userId2, similarity, JSON.stringify(commonGenres), sharedViews);
    }
  }

  private parseJsonSafely<T>(jsonString: string, fallback: T): T {
    try {
      return JSON.parse(jsonString) || fallback;
    } catch {
      return fallback;
    }
  }

  async updateContentMetrics(tmdbId: number, mediaType: 'tv' | 'movie', title: string, genres: string[]): Promise<void> {
    if (!this.isInitialized) {
      throw new DatabaseError('Database not initialized', 'NOT_INITIALIZED');
    }

    try {
      if (this.config.type === 'sqlite') {
        const stmt = this.sqliteDb!.prepare(`
          INSERT OR REPLACE INTO content_metrics 
          (tmdb_id, media_type, title, genres, last_updated)
          VALUES (?, ?, ?, ?, unixepoch())
        `);
        stmt.run(tmdbId, mediaType, title, JSON.stringify(genres));
      } else {
        const client = await this.pgPool!.connect();
        try {
          await client.query(`
            INSERT INTO content_metrics (tmdb_id, media_type, title, genres)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (tmdb_id) DO UPDATE SET
              media_type = EXCLUDED.media_type,
              title = EXCLUDED.title,
              genres = EXCLUDED.genres,
              last_updated = CURRENT_TIMESTAMP
          `, [tmdbId, mediaType, title, JSON.stringify(genres)]);
        } finally {
          client.release();
        }
      }
    } catch (error) {
      console.error('❌ Error updating content metrics:', error);
      throw new DatabaseError('Failed to update content metrics', 'UPDATE_ERROR', error as Error);
    }
  }

  async getContentMetrics(tmdbId: number): Promise<ContentMetrics | null> {
    if (!this.isInitialized) {
      throw new DatabaseError('Database not initialized', 'NOT_INITIALIZED');
    }

    try {
      const query = `
        SELECT 
          cm.*,
          COUNT(ub.id) as total_views,
          AVG(ub.rating) as avg_rating,
          COALESCE(
            SUM(CASE WHEN ub.action = 'completed' THEN 1 ELSE 0 END) * 1.0 / 
            NULLIF(SUM(CASE WHEN ub.action = 'viewed' THEN 1 ELSE 0 END), 0),
            0
          ) as completion_rate,
          COALESCE(
            SUM(CASE WHEN ub.action = 'skipped' THEN 1 ELSE 0 END) * 1.0 / 
            NULLIF(COUNT(ub.id), 0),
            0
          ) as skip_rate
        FROM content_metrics cm
        LEFT JOIN user_behavior ub ON cm.tmdb_id = ub.tmdb_id
        WHERE cm.tmdb_id = ${this.config.type === 'sqlite' ? '?' : '$1'}
        GROUP BY cm.tmdb_id
      `;

      let row: any;
      
      if (this.config.type === 'sqlite') {
        row = this.sqliteDb!.prepare(query).get(tmdbId);
      } else {
        const client = await this.pgPool!.connect();
        try {
          const result = await client.query(query, [tmdbId]);
          row = result.rows[0];
        } finally {
          client.release();
        }
      }

      if (!row) return null;

      return {
        tmdbId: row.tmdb_id,
        mediaType: row.media_type,
        title: row.title,
        genres: this.parseJsonSafely(row.genres, []),
        averageRating: parseFloat(row.avg_rating) || 0,
        totalViews: parseInt(row.total_views) || 0,
        completionRate: parseFloat(row.completion_rate) || 0,
        skipRate: parseFloat(row.skip_rate) || 0,
        lastUpdated: row.last_updated,
        trendingScore: parseFloat(row.trending_score) || 0,
        popularityIndex: parseFloat(row.popularity_index) || 0
      };
    } catch (error) {
      console.error('❌ Error getting content metrics:', error);
      return null;
    }
  }

  async getExperimentResults(experimentName: string, timeRange: { start: number; end: number }): Promise<Array<{ variant: string; conversions: number; views: number }>> {
    if (!this.isInitialized) {
      return [];
    }

    try {
      if (this.config.type === 'sqlite') {
        // Fetch all relevant rows and parse JSON in JS
        const query = `
          SELECT contextual_data, action
          FROM user_behavior
          WHERE contextual_data IS NOT NULL
            AND timestamp BETWEEN ? AND ?
        `;
        const rows = this.sqliteDb!.prepare(query).all(timeRange.start, timeRange.end) as any[];

        const variantStats: Record<string, { conversions: number; views: number }> = {};

        rows.forEach(row => {
          try {
            const data = JSON.parse(row.contextual_data || '{}');
            if (data.experimentName === experimentName && data.experimentVariant) {
              const variant = data.experimentVariant;
              if (!variantStats[variant]) {
                variantStats[variant] = { conversions: 0, views: 0 };
              }

              // Define conversion as "completed" action, fallback to view count
              if (row.action === 'completed') {
                variantStats[variant].conversions++;
              }
              variantStats[variant].views++;
            }
          } catch {
            // ignore bad JSON
          }
        });

        return Object.entries(variantStats).map(([variant, stats]) => ({
          variant,
          conversions: stats.conversions,
          views: stats.views
        }));
      } else {
        const client = await this.pgPool!.connect();
        try {
          const query = `
            SELECT 
              contextual_data->>'experimentVariant' as variant,
              SUM(CASE WHEN action = 'completed' THEN 1 ELSE 0 END) as conversions,
              COUNT(*) as views
            FROM user_behavior
            WHERE (contextual_data->>'experimentName') = $1
              AND timestamp BETWEEN $2 AND $3
            GROUP BY variant
          `;
          const result = await client.query(query, [experimentName, timeRange.start, timeRange.end]);
          return result.rows.map(r => ({
            variant: r.variant,
            conversions: parseInt(r.conversions),
            views: parseInt(r.views)
          }));
        } finally {
          client.release();
        }
      }
    } catch (error) {
      console.error('❌ Error getting experiment results:', error);
      return [];
    }
  }

  async cleanupOldData(retentionDays: number = 90): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      const cutoffTime = Math.floor(Date.now() / 1000) - (retentionDays * 24 * 60 * 60);
      
      if (this.config.type === 'sqlite') {
        const deleteStmt = this.sqliteDb!.prepare('DELETE FROM user_behavior WHERE timestamp < ?');
        const result = deleteStmt.run(cutoffTime);
        console.log(`🧹 Cleaned up ${result.changes} old behavior records`);
      } else {
        const client = await this.pgPool!.connect();
        try {
          const result = await client.query('DELETE FROM user_behavior WHERE timestamp < $1', [cutoffTime]);
          console.log(`🧹 Cleaned up ${result.rowCount} old behavior records`);
        } finally {
          client.release();
        }
      }
    } catch (error) {
      console.error('❌ Error cleaning up old data:', error);
    }
  }

  async getHealthStatus(): Promise<{ status: string; recordCount: number; lastActivity: string | null; dbType: string }> {
    if (!this.isInitialized) {
      return { status: 'not_initialized', recordCount: 0, lastActivity: null, dbType: this.config.type };
    }

    try {
      let recordCount = 0;
      let lastActivity: string | null = null;

      if (this.config.type === 'sqlite') {
        const countResult = this.sqliteDb!.prepare('SELECT COUNT(*) as count FROM user_behavior').get() as any;
        const lastActivityResult = this.sqliteDb!.prepare('SELECT MAX(timestamp) as last_timestamp FROM user_behavior').get() as any;
        
        recordCount = countResult?.count || 0;
        const lastTimestamp = lastActivityResult?.last_timestamp;
        lastActivity = lastTimestamp ? new Date(lastTimestamp * 1000).toISOString() : null;
      } else {
        const client = await this.pgPool!.connect();
        try {
          const countResult = await client.query('SELECT COUNT(*) as count FROM user_behavior');
          const lastActivityResult = await client.query('SELECT MAX(timestamp) as last_timestamp FROM user_behavior');
          
          recordCount = parseInt(countResult.rows[0]?.count) || 0;
          const lastTimestamp = lastActivityResult.rows[0]?.last_timestamp;
          lastActivity = lastTimestamp ? new Date(lastTimestamp * 1000).toISOString() : null;
        } finally {
          client.release();
        }
      }

      return {
        status: 'healthy',
        recordCount,
        lastActivity,
        dbType: this.config.type
      };
    } catch (error) {
      console.error('❌ Database health check error:', error);
      return {
        status: 'error',
        recordCount: 0,
        lastActivity: null,
        dbType: this.config.type
      };
    }
  }

  async close(): Promise<void> {
    try {
      if (this.config.type === 'sqlite' && this.sqliteDb) {
        this.sqliteDb.close();
      } else if (this.config.type === 'postgres' && this.pgPool) {
        await this.pgPool.end();
      }
      console.log(`📦 ${this.config.type} database connection closed`);
    } catch (error) {
      console.error('❌ Error closing database connection:', error);
    }
  }
}
