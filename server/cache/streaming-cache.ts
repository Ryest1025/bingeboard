/**
 * 🚀 STREAMING DATA CACHE
 * 
 * Simple in-memory cache for streaming platform data to reduce API calls
 * and improve performance for frequently requested content.
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class StreamingCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 1000; // Prevent memory issues
  private hits = 0;
  private misses = 0;

  /**
   * Generate cache key for streaming data
   */
  private getCacheKey(tmdbId: number, mediaType: string): string {
    return `streaming:${mediaType}:${tmdbId}`;
  }

  /**
   * Check if cache entry is valid (not expired)
   */
  private isValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp >= entry.ttl) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Get streaming data from cache
   */
  get(tmdbId: number, mediaType: string): any | null {
    const key = this.getCacheKey(tmdbId, mediaType);
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    if (!this.isValid(entry)) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    console.log(`📋 Cache HIT for ${mediaType}:${tmdbId}`);
    this.hits++;
    return entry.data;
  }

  /**
   * Store streaming data in cache
   */
  set(tmdbId: number, mediaType: string, data: any, ttl?: number): void {
    // Cleanup if cache is getting too large
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cleanup();

      // If still too large, clear oldest entries
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        const entries: [string, CacheEntry][] = [];
        this.cache.forEach((entry, key) => {
          entries.push([key, entry]);
        });

        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

        // Remove oldest 20% of entries
        const toRemove = Math.floor(entries.length * 0.2);
        for (let i = 0; i < toRemove; i++) {
          this.cache.delete(entries[i][0]);
        }
      }
    }

    const key = this.getCacheKey(tmdbId, mediaType);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    };

    this.cache.set(key, entry);
    console.log(`💾 Cache SET for ${mediaType}:${tmdbId} (TTL: ${entry.ttl / 1000}s)`);
  }

  /**
   * Clear specific entry
   */
  delete(tmdbId: number, mediaType: string): void {
    const key = this.getCacheKey(tmdbId, mediaType);
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    console.log('🧹 Streaming cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: (this.hits + this.misses) ? this.hits / (this.hits + this.misses) : undefined
    };
  }

  /** Detailed stats including per-entry TTL info */
  getDetailedStats(): {
    size: number;
    maxSize: number;
    hits: number;
    misses: number;
    hitRate: number | null;
    entries: Array<{ key: string; ageMs: number; ttlMs: number; expiresInMs: number }>;
  } {
    const now = Date.now();
    const entries: Array<{ key: string; ageMs: number; ttlMs: number; expiresInMs: number }> = [];
    this.cache.forEach((entry, key) => {
      const age = now - entry.timestamp;
      entries.push({ key, ageMs: age, ttlMs: entry.ttl, expiresInMs: Math.max(0, entry.ttl - age) });
    });
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hits: this.hits,
      misses: this.misses,
      hitRate: (this.hits + this.misses) ? this.hits / (this.hits + this.misses) : null,
      entries
    };
  }

  /**
   * Periodic cleanup (call this from a scheduled job)
   */
  scheduleCleanup(): void {
    setInterval(() => {
      this.cleanup();
      const stats = this.getStats();
      console.log(`🧹 Streaming cache cleanup: ${stats.size}/${stats.maxSize} entries`);
    }, 10 * 60 * 1000); // Clean every 10 minutes
  }
}

// Create singleton instance
export const streamingCache = new StreamingCache();

// Start cleanup scheduler
streamingCache.scheduleCleanup();
