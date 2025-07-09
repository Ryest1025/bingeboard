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

  constructor() {
    // Generate a session ID for this browsing session
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Auto-flush tracking events every 10 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 10000);

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }

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
    // Add session ID to all events
    event.sessionId = this.sessionId;
    
    // Add timestamp if not present
    if (!event.metadata) {
      event.metadata = {};
    }
    if (!event.metadata.timestamp) {
      event.metadata.timestamp = new Date().toISOString();
    }

    this.queue.push(event);

    // If queue gets too large, flush immediately
    if (this.queue.length >= 10) {
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

    this.isFlushInProgress = true;
    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      // Send events in batch
      for (const event of eventsToSend) {
        try {
          await apiRequest("POST", "/api/behavior/track", event);
        } catch (error) {
          // If individual event fails, log but continue with others
          console.warn("Failed to track behavior event:", error);
        }
      }
    } catch (error) {
      // If batch fails, put events back in queue
      console.error("Failed to flush behavior tracking queue:", error);
      this.queue = [...eventsToSend, ...this.queue];
    } finally {
      this.isFlushInProgress = false;
    }
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