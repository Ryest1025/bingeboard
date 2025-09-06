import { apiRequest } from "@/lib/queryClient";

interface TrackingEvent {
  actionType: string;
  targetType: string;
  targetId?: number;
  metadata?: Record<string, any>;
  sessionId?: string;
}

class BehaviorTracker {
  private sessionId: string;
  private queue: TrackingEvent[] = [];
  private isFlushInProgress = false;
  private flushInterval: NodeJS.Timeout | null = null;
  private lastFlushAt = 0;
  private lastSentCache: Map<string, number> = new Map();
  private readonly DEDUPE_WINDOW_MS = 5000;

  // Privacy toggle
  private readonly OPT_OUT_KEY = 'bb.analyticsOptOut';

  // Tuning knobs
  private readonly FLUSH_INTERVAL_MS = 10_000;
  private readonly MAX_QUEUE_LENGTH = 200;
  private readonly FLUSH_THRESHOLD = 20; // flush sooner when many events buffered
  private readonly STORAGE_KEY = 'bb.behaviorQueue';
  private readonly SESSION_KEY = 'bb.behaviorSessionId';
  private readonly BATCH_ENDPOINTS = ['/api/behavior/track-batch', '/api/behavior/track/batch'];
  private readonly SINGLE_ENDPOINT = '/api/behavior/track';

  constructor() {
    // Restore or generate a session ID for this browsing session
    this.sessionId = this.restoreSessionId();
    // Restore any persisted queue
    this.restoreQueue();

    // Auto-flush tracking events on an interval
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL_MS);

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        // Best-effort final flush
        this.flush();
      });

      // Flush when back online
      window.addEventListener('online', () => {
        this.flush();
      });
    }
  }

  private restoreSessionId(): string {
    try {
      const existing = typeof localStorage !== 'undefined' ? localStorage.getItem(this.SESSION_KEY) : null;
      if (existing) return existing;
    } catch { /* ignore */ }
    const sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try { localStorage.setItem(this.SESSION_KEY, sid); } catch { /* ignore */ }
    return sid;
  }

  private restoreQueue() {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(this.STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.queue = parsed.filter(this.validateEvent);
        }
      }
    } catch { /* ignore */ }
  }

  private persistQueue() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch { /* ignore */ }
  }

  private validateEvent = (event: any): event is TrackingEvent => {
    return (
      event &&
      typeof event.actionType === 'string' &&
      typeof event.targetType === 'string' &&
      (event.targetId === undefined || typeof event.targetId === 'number') &&
      (event.metadata === undefined || typeof event.metadata === 'object')
    );
  };

  /**
   * Track when user adds a show to their watchlist
   */
  trackWatchlistAdd(showId: number, status: string = 'want_to_watch', metadata?: Record<string, any>) {
  this.track({
      actionType: 'watchlist_add',
      targetType: 'show',
      targetId: showId,
      metadata: {
        status,
        ...metadata
      }
    });
  }

  /**
   * Track when user removes a show from their watchlist
   */
  trackWatchlistRemove(showId: number, metadata?: Record<string, any>) {
    this.track({
      actionType: 'watchlist_remove',
      targetType: 'show',
      targetId: showId,
      metadata
    });
  }

  /**
   * Track when user clicks "Watch Now" button
   */
  trackWatchNowClick(showId: number, platform: string, metadata?: Record<string, any>) {
    this.track({
      actionType: 'watch_now_click',
      targetType: 'show',
      targetId: showId,
      metadata: {
        platform,
        ...metadata
      }
    });
  }

  /**
   * Track when user views a recommendation
   */
  trackRecommendationView(recommendationId: number, showId: number, metadata?: Record<string, any>) {
    this.track({
      actionType: 'recommendation_view',
      targetType: 'recommendation',
      targetId: recommendationId,
      metadata: {
        showId,
        ...metadata
      }
    });
  }

  /**
   * Track when user interacts with a recommendation (clicks, dismisses, etc.)
   */
  trackRecommendationInteract(recommendationId: number, showId: number, interactionType: string, metadata?: Record<string, any>) {
    this.track({
      actionType: 'recommendation_interact',
      targetType: 'recommendation',
      targetId: recommendationId,
      metadata: {
        showId,
        interactionType,
        ...metadata
      }
    });
  }

  /**
   * Track search queries
   */
  trackSearch(query: string, filters?: Record<string, any>, resultCount?: number) {
    this.track({
      actionType: 'search',
      targetType: 'search_query',
      metadata: {
        query,
        filters,
        resultCount,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Track when user clicks on a search result
   */
  trackSearchResultClick(showId: number, query: string, position: number, metadata?: Record<string, any>) {
    this.track({
      actionType: 'search_result_click',
      targetType: 'show',
      targetId: showId,
      metadata: {
        query,
        position,
        ...metadata
      }
    });
  }

  /**
   * Track page visits and navigation
   */
  trackPageView(page: string, metadata?: Record<string, any>) {
    this.track({
      actionType: 'page_view',
      targetType: 'page',
      metadata: {
        page,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        ...metadata
      }
    });
  }

  /**
   * Track show detail page views
   */
  trackShowView(showId: number, source?: string, metadata?: Record<string, any>) {
    this.track({
      actionType: 'show_view',
      targetType: 'show',
      targetId: showId,
      metadata: {
        source, // 'search', 'recommendation', 'trending', etc.
        viewDuration: undefined, // Can be updated later
        ...metadata
      }
    });
  }

  /**
   * Track filter usage in search/browse
   */
  trackFilterUse(filterType: string, filterValue: any, context: string, metadata?: Record<string, any>) {
    this.track({
      actionType: 'filter_use',
      targetType: 'filter',
      metadata: {
        filterType,
        filterValue,
        context, // 'search', 'browse', 'recommendations'
        ...metadata
      }
    });
  }

  /**
   * Track social actions
   */
  trackSocialAction(actionType: string, targetType: string, targetId?: number, metadata?: Record<string, any>) {
    this.track({
      actionType: `social_${actionType}`, // 'social_like', 'social_comment', 'social_follow'
      targetType,
      targetId,
      metadata
    });
  }

  /**
   * Track streaming platform preferences
   */
  trackPlatformPreference(platform: string, action: string, metadata?: Record<string, any>) {
    this.track({
      actionType: 'platform_preference',
      targetType: 'platform',
      metadata: {
        platform,
        action, // 'prefer', 'avoid', 'neutral'
        ...metadata
      }
    });
  }

  /**
   * Track time spent on page/component
   */
  trackTimeSpent(targetType: string, targetId: number | undefined, duration: number, metadata?: Record<string, any>) {
    this.track({
      actionType: 'time_spent',
      targetType,
      targetId,
      metadata: {
        duration, // in milliseconds
        ...metadata
      }
    });
  }

  /**
   * Internal method to add event to queue
   */
  private track(event: TrackingEvent) {
    // Respect user opt-out
    try {
      const optedOut = typeof localStorage !== 'undefined' && localStorage.getItem(this.OPT_OUT_KEY) === '1';
      if (optedOut) return;
    } catch { /* ignore */ }

    // Add session ID to all events
    event.sessionId = this.sessionId;
    
    // Add timestamp if not present
    if (!event.metadata) {
      event.metadata = {};
    }
    event.metadata.timestamp = event.metadata.timestamp || new Date().toISOString();

    // Attach experiment variantSource if present globally
    try {
      const source = (window as any).__bbVariantSource;
      if (source && !event.metadata.variantSource) event.metadata.variantSource = source;
    } catch { /* noop */ }

    // Runtime validation to guard malformed payloads
    if (!this.validateEvent(event)) {
      console.warn('Dropping malformed tracking event', event);
      return;
    }

    // Deduplicate identical events within a short window
    const key = `${event.actionType}|${event.targetType}|${event.targetId ?? ''}|${event.metadata?.platform ?? ''}`;
    const now = Date.now();
    const last = this.lastSentCache.get(key) || 0;
    if (now - last < this.DEDUPE_WINDOW_MS) {
      return; // drop duplicate
    }
    this.lastSentCache.set(key, now);

    this.queue.push(event);

    // Rate limiting by capping queue size (drop oldest)
    if (this.queue.length > this.MAX_QUEUE_LENGTH) {
      const dropCount = this.queue.length - this.MAX_QUEUE_LENGTH;
      this.queue.splice(0, dropCount);
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`BehaviorTracker queue capped. Dropped ${dropCount} oldest events.`);
      }
    }

    // Persist after enqueue
    this.persistQueue();

    // If queue gets too large, flush immediately
    if (this.queue.length >= this.FLUSH_THRESHOLD) {
      this.flush();
    }
  }

  /**
   * Send queued events to the server
   */
  private async flush() {
    if (this.queue.length === 0 || this.isFlushInProgress) {
      return;
    }

    // If offline, skip
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }

    this.isFlushInProgress = true;
    const eventsToSend = [...this.queue];
    this.queue = [];
    this.persistQueue();

    try {
      // Try batch endpoints first
      const batchPayload = { events: eventsToSend };
      let batchSuccess = false;
      for (const endpoint of this.BATCH_ENDPOINTS) {
        try {
          await this.sendWithRetry(() => apiRequest('POST', endpoint, batchPayload));
          batchSuccess = true;
          break;
        } catch (e) {
          // try next batch endpoint
        }
      }

      if (!batchSuccess) {
        // Fallback: send individually with retry + small delay to avoid flooding
        for (const event of eventsToSend) {
          try {
            await this.sendWithRetry(() => apiRequest('POST', this.SINGLE_ENDPOINT, event));
            // tiny delay to be gentle on server when many events
            await this.sleep(25);
          } catch (error) {
            // If individual event fails after retries, re-queue for next flush
            this.queue.push(event);
          }
        }
      }
    } catch (error) {
      // If batch fails, put events back in queue
      console.error("Failed to flush behavior tracking queue:", error);
      this.queue = [...eventsToSend, ...this.queue];
    } finally {
      this.isFlushInProgress = false;
      // Persist queue state after attempts
      this.persistQueue();
      this.lastFlushAt = Date.now();
    }
  }

  private async sendWithRetry(fn: () => Promise<any>, maxRetries = 3, baseDelayMs = 300): Promise<void> {
    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        await fn();
        return;
      } catch (e) {
        attempt++;
        if (attempt > maxRetries) throw e;
        const delay = Math.round(baseDelayMs * Math.pow(2, attempt - 1) * (1 + Math.random() * 0.2));
        await this.sleep(delay);
      }
    }
  }

  private sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  /**
   * Manually flush events (useful for testing or critical events)
   */
  public async forceFlush() {
    await this.flush();
  }

  /**
   * Clear the queue without sending (useful for logout)
   */
  public clearQueue() {
    this.queue = [];
  }

  /**
   * Clean up resources
   */
  public destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush(); // Final flush
  }
}

// Create a singleton instance
export const behaviorTracker = new BehaviorTracker();

// Export the class for testing
export { BehaviorTracker };