import { Router } from 'express';
import { TMDBService } from '../services/tmdb.js';
import { MultiAPIStreamingService } from '../services/multiAPIStreamingService.js';
import { parseUserPreferences } from '../validation/userPreferences.js';

/**
 * Personalized content endpoint leveraging multi-API streaming aggregation.
 * GET /api/personalized/:type
 * Query params:
 *  - type: tv|movie (path param)
 *  - page (optional, default 1)
 *  - limit (optional, default 20, max 40)
 *  - includeStreaming (boolean, default true) -> enrich first N items with streaming data (N=8)
 *  - preference filtering via userPreferences schema (preferredPlatforms, excludedPlatforms, subscriptionTypes, onlyAffiliateSupported)
 *  - passthrough TMDB discover params (sort_by, with_genres, vote_average.gte, vote_average.lte, first_air_date_year, primary_release_year)
 *
 * TODO:
 *  - Add POST variant with body-based preference payload for richer filter controls.
 *  - Integrate per-user preferences from database (auth-aware endpoint).
 *  - Remove legacy /api/tmdb/discover usage once all clients migrate.
 *  - Add response caching layer (CDN + in-memory) keyed on params.
 *  - Expose preference stats (filteredOut count) in response for UX insights.
 */
const router = Router();
const tmdb = new TMDBService();

// Helper: map TMDB discover params from query (whitelist to avoid arbitrary injection)
function buildDiscoverParams(q: any) {
  const allowedKeys = [
    'sort_by', 'with_genres', 'vote_average.gte', 'vote_average.lte',
    'first_air_date_year', 'primary_release_year', 'with_watch_providers', 'watch_region'
  ];
  const params: Record<string, any> = { page: parseInt(q.page || '1', 10) || 1 };
  for (const k of allowedKeys) {
    if (q[k] !== undefined) params[k] = q[k];
  }
  return params;
}

router.get('/:type', async (req, res) => {
  const started = Date.now();
  const requestId = Math.random().toString(36).slice(2, 10);
  try {
    const { type } = req.params;
    if (type !== 'tv' && type !== 'movie') {
      return res.status(400).json({ message: 'Type must be tv or movie' });
    }

    const includeStreaming = (req.query.includeStreaming !== 'false'); // default true
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10) || 20, 40);

    // Build TMDB discover params
    const discoverParams = buildDiscoverParams(req.query);
    // Reasonable default sorting
    if (!discoverParams.sort_by) discoverParams.sort_by = 'popularity.desc';

    // Execute TMDB discover
    const discoverResp = await tmdb.discover(type, discoverParams as any);
    let results: any[] = Array.isArray(discoverResp.results) ? discoverResp.results.slice(0, limit) : [];

    // Prepare items for streaming enrichment (first ENRICH_LIMIT items)
    const ENRICH_LIMIT = 8;

    // Parse user preferences (non-fatal if invalid -> still return base data)
    let prefs: any = undefined;
    try {
      prefs = parseUserPreferences({
        preferredPlatforms: req.query.preferredPlatforms ? String(req.query.preferredPlatforms).split(',') : undefined,
        excludedPlatforms: req.query.excludedPlatforms ? String(req.query.excludedPlatforms).split(',') : undefined,
        subscriptionTypes: req.query.subscriptionTypes ? String(req.query.subscriptionTypes).split(',') as any : undefined,
        onlyAffiliateSupported: req.query.onlyAffiliateSupported === 'true'
      });
    } catch (e) {
      // Silently ignore preference errors for now (could add warning header)
    }

    if (includeStreaming && results.length > 0) {
      const batchItems = results.slice(0, ENRICH_LIMIT).map(r => ({
        tmdbId: r.id as number,
        title: (r.title || r.name || '') as string,
        mediaType: type as 'tv' | 'movie'
      }));

      try {
        const availabilityMap = prefs
          ? await MultiAPIStreamingService.getBatchAvailabilityWithPreferences(batchItems, prefs)
          : await MultiAPIStreamingService.getBatchAvailability(batchItems);

        results = results.map(r => {
          const availability = availabilityMap.get(r.id);
          if (availability) {
            const platforms = availability.platforms || [];
            return {
              ...r,
              streaming: platforms,
              streamingPlatforms: platforms,
              streamingProviders: platforms,
              watchProviders: platforms,
              streamingStats: {
                totalPlatforms: availability.totalPlatforms,
                affiliatePlatforms: availability.affiliatePlatforms,
                premiumPlatforms: availability.premiumPlatforms,
                freePlatforms: availability.freePlatforms,
                sources: availability.sources,
                preferenceMeta: (availability as any).preferenceMeta
              }
            };
          }
          return r;
        });
      } catch (e) {
        console.warn(`[personalized:${requestId}] Streaming batch enrichment failed:`, (e as Error).message);
      }
    }

    const duration = Date.now() - started;
    res.json({
      results,
      total_results: discoverResp.total_results,
      page: discoverResp.page,
      enriched: includeStreaming,
      type,
      limit,
      durationMs: duration,
      sources: { tmdb: true, multiApiStreaming: includeStreaming },
      preferenceFiltering: !!prefs
    });
  } catch (error) {
    console.error(`[personalized:${requestId}] Error:`, error);
    res.status(500).json({ message: 'Failed to fetch personalized content' });
  }
});

export default router;
# Backend deployment trigger Tue Oct 14 21:31:48 UTC 2025
