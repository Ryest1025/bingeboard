// lib/analytics.ts - Unified analytics event helper (A/B test friendly)
import { behaviorTracker } from '@/lib/behaviorTracker';

export type AnalyticsEventName =
  | 'modal_open'
  | 'watchlist_add'
  | 'watch_click'
  | 'watch_trailer'
  | 'platform_redirect';

interface TrackEventOptions {
  variant?: 'full' | 'lite';
  variantSource?: string;
  [key: string]: any;
}

// Basic no-op safe external sink (placeholder for GA/Mixpanel integration)
function sendToExternalProvider(event: string, props: Record<string, any>) {
  // Hook in Google Analytics / Segment / Mixpanel here.
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event, props);
  }
}

export function trackEvent(event: AnalyticsEventName, props: TrackEventOptions = {}) {
  const payload = { ...props } as any;
  try {
    switch (event) {
      case 'modal_open':
        if (payload.showId) {
          behaviorTracker.trackShowView(Number(payload.showId), payload.source || 'modal', { variant: payload.variant, variantSource: payload.variantSource });
        }
        break;
      case 'watchlist_add':
        if (payload.showId) {
          behaviorTracker.trackWatchlistAdd(Number(payload.showId), 'want_to_watch', { variant: payload.variant, variantSource: payload.variantSource });
        }
        break;
      case 'watch_click':
        if (payload.showId) {
          behaviorTracker.trackWatchNowClick(Number(payload.showId), payload.platform || 'unknown', { variant: payload.variant, variantSource: payload.variantSource });
        }
        break;
      case 'watch_trailer':
        if (payload.showId) {
          behaviorTracker.trackShowView(Number(payload.showId), 'trailer', { variant: payload.variant, variantSource: payload.variantSource });
        }
        break;
      case 'platform_redirect':
        if (payload.showId && payload.platform) {
          behaviorTracker.trackWatchNowClick(Number(payload.showId), payload.platform, { variant: payload.variant, variantSource: payload.variantSource, redirect: true });
        }
        break;
      default:
        break;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Behavior tracker failed for event', event, e);
  }
  sendToExternalProvider(event, payload);
}
