# Search & Filter Systems Overview

Unified high-level guide tying together the enhanced search experience (multi‑API) and the production filter system. Use this as an entry point; dive into the detailed docs for deeper implementation notes.

## Source Docs
- Multi‑API Search: `MULTI_API_SEARCH_INTEGRATION_COMPLETE.md`
- Enhanced Filter System: `ENHANCED_FILTER_SYSTEM_README.md`
- Experiments (Modal Variants + Metrics): `EXPERIMENTS.md`

## Architecture Snapshot
```
User Input ─┬─> BrandedSearchBar (debounced query) ─┬─> searchShowsApi / enhancedSearchApi
            │                                      │
            │                                      └─ Prefetch show details + trailer + streaming (React Query)
            │
            └─> EnhancedFilterSystem (stateful) ──> filterUtils -> /api/content/(dashboard|discover|search)

Show Selection -> Modal Variant (Full | Lite) -> trackEvent instrumentation -> behaviorTracker -> /api/behavior/track
```

## Key Components
| Layer | Component / File | Responsibility |
|-------|------------------|----------------|
| Search UI | `BrandedSearchBar.tsx` | Input, debounced query, dropdown trigger |
| Search Results | `BrandedSearchDropdown.tsx` | Accessible, keyboard navigable result list |
| Modals | `BrandedShowModal.tsx` / `BrandedShowModalLite.tsx` | Rich vs lightweight detail views |
| Filters | `EnhancedFilterSystem.tsx` | Multi-section dynamic filters + persistence |
| Active Filters | `FilterBadges.tsx` | Removable chips & summary |
| Data Hooks | `useFilterOptions.ts`, `useFilteredContent.ts`, `useShowDetails.ts`, `useTrailer.ts` | Encapsulate fetch + caching |
| APIs | `search-api.ts` | Unified search + details + streaming fetch logic |
| Analytics | `analytics.ts`, `behaviorTracker.ts` | Event dispatch & batching |

## React Query Keys (Core)
| Domain | Key Pattern | Notes |
|--------|-------------|-------|
| Search | `['search-shows', query]` | Immediate suggestions |
| Enhanced Search | `['enhanced-search', filtersHash]` | POST filter body hashed |
| Show Details | `['show-details', id, type]` | Prefetched on hover / selection |
| Trailer | `['trailer', id, type]` | Provides primaryTrailer.url / embeddableUrl |
| Filter Options | `['filter-options', type]` | Genres, platforms, etc. |
| Content Lists | `['dashboard-content', filtersHash]` / `['discover-content', filtersHash]` | Filter-aware grids |

## Quickstart: Combined Search + Filters + Modal
```tsx
import { useState } from 'react';
import BrandedShowModal from '@/components/search/BrandedShowModal';
import BrandedShowModalLite from '@/components/search/BrandedShowModalLite';
import { BrandedSearchBar } from '@/components/search/BrandedSearchBar';
import { EnhancedFilterSystem } from '@/components/common/EnhancedFilterSystem';
import { FilterBadges } from '@/components/common/FilterBadges';
import { resolveModalVariant } from '@/future/variant-resolver'; // (Planned utility)

export function DiscoverExperience() {
  const [selectedShow, setSelectedShow] = useState<{ id: string; type: string } | null>(null);
  const [open, setOpen] = useState(false);
  const variant = 'full'; // replace with resolver logic later

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <BrandedSearchBar
          onShowSelected={(show) => { setSelectedShow({ id: show.id, type: show.type }); setOpen(true); }}
        />
        <EnhancedFilterSystem compactMode={false} showApplyButton={true} />
        <FilterBadges />
      </div>

      {selectedShow && variant === 'full' && (
        <BrandedShowModal
          open={open}
          showId={selectedShow.id}
            showType={selectedShow.type}
          onClose={() => setOpen(false)}
        />
      )}
      {selectedShow && variant === 'lite' && (
        <BrandedShowModalLite
          open={open}
          showId={selectedShow.id}
          showType={selectedShow.type}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
```

## Filter Application Modes
| Mode | Dashboard | Discover | Rationale |
|------|----------|----------|-----------|
| Real-time (no apply) | Yes | Optional | Immediate feedback for frequent tweaks |
| Apply Button | Optional | Yes (default) | Batch expensive queries / reduce chatter |

## Persistence Strategy
- User filter selections: `localStorage` via `useLocalStorage` hook
- Modal variant (planned): `localStorage['bb.modalVariant']`
- Search query: ephemeral (not persisted) to avoid stale intent

## Instrumentation (Current & Planned)
| Event | Trigger | Variants | Implemented In |
|-------|---------|----------|----------------|
| modal_open | Modal becomes visible with show data | yes | Full |
| watchlist_add | Add to Watchlist click | yes | Full |
| watch_click | Watch Now / platform button | yes | Full |
| watch_trailer | Trailer overlay open | yes | Full |
| platform_redirect | External platform link | yes | Planned |
| filter_use | Filter selection changes | n/a | BehaviorTracker API (available) |
| search | Query executed / submitted | n/a | BehaviorTracker API (available) |

Lite variant instrumentation: mirror the above with `variant: 'lite'` once integrated.

## Planned Utilities
- `resolveModalVariant()` – Determine active modal variant using query param > localStorage > env > random assignment.
- `useModalAnalytics()` – Provide timestamp capture & TTFA (time to first action) derivation.

## Performance Notes
| Area | Optimization |
|------|--------------|
| Search | Debounced queries + cached results (stale 10m) |
| Show Details | Prefetch on result hover (optional) |
| Trailers | Separate query key; lazy only when modal open & id present |
| Filters | Option metadata cached; content queries keyed by hash of active filters |
| Modal | Lite variant reduces initial layout & media player cost |

## Common Pitfalls & Guidance
| Issue | Guidance |
|-------|----------|
| Over-fetching on rapid filter changes | Use `realTimeUpdates=false` + Apply button model |
| Modal opens without show details | Ensure `showId` set before setting `open=true` |
| Stale trailer after switching shows | Key trailer query by `[id,type]` and rely on React Query invalidation |
| Missing analytics variant | Always pass `variant` when calling `trackEvent` for modal events |

## Expansion Ideas
- Add server-driven experiment assignment service
- Introduce result ranking re-score API using engagement signals
- Capture partial trailer watch milestones (25/50/75/100)
- Add semantic search (vector) fallback for sparse queries

## Quick Next Steps (if adopting now)
1. Decide initial modal variant rollout target (Full-only vs 10% Lite).
2. Implement variant resolver + localStorage persistence.
3. Mirror instrumentation in Lite modal.
4. Add `platform_redirect` event emission inside provider buttons.
5. Start baseline metric collection (7 days) before experiment.

---
Maintained alongside feature evolution; update when adding events, variant logic, or altering query key strategies.
