# BingeBoard Experiments

> Living document describing active / planned product experiments, their goals, instrumentation, and evaluation framework.

---
## Index
1. Modal Variant A/B Test (Full vs Lite)
2. (Placeholder) Search Result Ranking Tweaks
3. (Placeholder) Mood Filter Auto-Suggestions

---
## 1. Modal Variant A/B Test (Full vs Lite)

### Overview
We are evaluating whether a lighter-weight show details modal ("Lite") improves core engagement metrics (watchlist adds, watch intent) and perceived performance vs the existing rich modal ("Full").

| Aspect        | Full Variant                                      | Lite Variant |
|---------------|---------------------------------------------------|--------------|
| Component     | `BrandedShowModal`                                | `BrandedShowModalLite` |
| Media Player  | `ReactPlayer` (YouTube + rich overlay)            | `<iframe>` with prioritized embeddable URL |
| Layout        | Cinematic backdrop + multi-section details        | Compact hero + essential metadata |
| Dependencies  | More animation & heavier layout cost              | Minimal visual chrome |
| Context Usage | Standalone                                        | Leverages `DashboardFilterProvider` for relevance badges |
| Goals         | High immersion                                    | Fast open / mobile friendly |

### Hypothesis
1. H1: Lite modal reduces time-to-first-interaction (TTFI) by >20% vs Full.
2. H2: Lite modal yields a non-inferior (<= -2% relative drop) or higher watchlist add rate per modal open.
3. H3: Lite modal increases trailer open rate per modal open by >= 5% (due to clearer CTA proximity / reduced scroll).

### Primary Metrics
| Metric | Definition | Direction |
|--------|------------|-----------|
| Watchlist Add Rate | `watchlist_add` events / `modal_open` events | Maintain or improve |
| Trailer Open Rate | `watch_trailer` / `modal_open` | Improve |
| Watch Intent Rate | `watch_click` / `modal_open` | Maintain |
| Time To First Action (TTFA) | ms between `modal_open` and first of (`watchlist_add`,`watch_trailer`,`watch_click`) | Decrease |

### Secondary / Diagnostic Metrics
- Modal Open Success Rate (modal_open with valid show payload / attempted opens)
- Platform Redirect Rate (platform_redirect / watch_click)
- Average Session Modals Opened per user
- Bounce Rate: modal_open with no subsequent action in 10s
- Client Error Events (console surfaced, if later instrumented)

### Guardrail Metrics
| Guardrail | Rationale | Threshold |
|-----------|-----------|-----------|
| Crash / fatal error rate | Avoid regression in stability | No increase > +0.5pp |
| Average page CPU time | Prevent performance regressions | Non-inferior (+5%) |
| API error rate (show details / trailer) | Ensure resilience | Non-inferior |

### Instrumentation (Implemented / Planned)
Events standardized via `trackEvent(eventName, props)` in `lib/analytics.ts` which internally delegates to `behaviorTracker`.

| Event Name | Fired When | Required Props | Variant Included | Status |
|------------|------------|----------------|------------------|--------|
| `modal_open` | Modal becomes visible with loaded show | `showId`, `showTitle`, `variant` | Yes | Implemented (Full) / Pending (Lite) |
| `watchlist_add` | User clicks Add to Watchlist | `showId`, `showTitle`, `variant` | Yes | Implemented (Full) / Pending (Lite) |
| `watch_click` | User clicks Watch Now (or platform redirect) | `showId`, `showTitle`, `variant`, optional `platform` | Yes | Implemented (Full) |
| `watch_trailer` | User opens trailer overlay | `showId`, `showTitle`, `variant` | Yes | Implemented (Full) |
| `platform_redirect` | User clicks a specific platform button | `showId`, `platform`, `variant` | Yes | Planned |

### Event Payload Conventions
```jsonc
{
  "showId": "12345",         // string or number convertible to number
  "showTitle": "Dune: Part Two",
  "variant": "full" | "lite",
  "platform": "Netflix",      // when applicable
  "source": "modal" | "trailer" | ... // optional context
}
```

### Exposure & Assignment
Initial phase: 100% Full (control) while Lite stabilizes.
Rollout plan:
1. Internal QA: manual query param override `?variant=lite` (dev only).
2. 10% random assignment (cookie/localStorage persisted) for production users.
3. 50/50 split after confirming guardrails.
4. Graduate winning variant or continue multivariate tuning.

### Variant Selection Mechanism (Proposed)
Priority order (first available wins):
1. Query Param: `?variant=full|lite` (debug / forced test)
2. Local Storage: `bb.modalVariant`
3. Environment Default: `import.meta.env.VITE_DEFAULT_MODAL_VARIANT` (fallback `full`)
4. Random Assignment: 50/50 persisted if none of the above.

### Implementation Steps (Remaining)
- [ ] Add variant resolver utility (`resolveModalVariant()` + context/hook)
- [ ] Wrap Discover & Dashboard pages with resolver + provider
- [ ] Inject Lite modal instrumentation (mirror Full)
- [ ] Add `platform_redirect` events for platform buttons
- [ ] Implement TTFA measurement: store timestamp at `modal_open`; compute delta on first action event
- [ ] Add analysis script / notebook stub (optional)

### Data Collection & Storage
Behavior events currently POST to `/api/behavior/track` individually (batch flush loop). For experiment analysis we will:
- Query events by time window & `metadata.variant`
- Derive session-level aggregates (e.g., first variant per session ensures consistent assignment)
- Compute metrics using SQL / analytic layer (future: BigQuery / ClickHouse)

### Sample Query Sketch (SQL-like)
```sql
-- Watchlist add rate by variant
SELECT variant,
       COUNT(*) FILTER (WHERE actionType = 'watchlist_add') * 1.0 / NULLIF(COUNT(*) FILTER (WHERE actionType = 'show_view' AND metadata->>'source' = 'modal'),0) AS watchlist_add_rate
FROM events
WHERE actionType IN ('watchlist_add','show_view')
  AND ts BETWEEN :start AND :end
GROUP BY 1;
```

### Analysis Cadence
- Daily automated snapshot (once infra exists)
- Manual interim checks during ramp
- Pre-specified decision date (e.g., 14 days after 50/50 launch)

### Success Criteria
Declare Lite winner if ALL hold:
1. Watchlist Add Rate: Δ >= -2% (non-inferior) & preferably positive
2. Trailer Open Rate: Δ >= +5% relative
3. TTFA: ≥ 20% faster (median or P75)
4. No guardrail breach

If mixed results: consider hybrid improvements to Full or adjusted Lite with selective rich elements.

### Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Inconsistent variant assignment between pages | Persist variant in localStorage & include in every event payload |
| Event duplication on rapid open/close | Debounce modal_open (only fire when showId changes & open=true) |
| Missing variant in payload | Add defensive default in `trackEvent` if absent |
| Performance noise (network variance) | Use relative, distributional stats (median, P75) not just mean |

### Next Enhancements
- Add `impression` events for cards leading to modal opens (funnel completeness)
- Instrument scroll depth inside Full modal (content engagement)
- Capture trailer playback progress (25/50/100) for richer engagement signals

---
## 2. Search Result Ranking Tweaks (Placeholder)
Define experiment once redesigned search ranking model is ready.

---
## 3. Mood Filter Auto-Suggestions (Placeholder)
Will test adaptive mood suggestion vs static set.

---
### Document Maintenance
Update this file when:
- A new experiment begins (ADD section)
- Metrics definitions change (REVISION note)
- Experiment is analyzed (APPEND results summary)

> Keep changes atomic & reference related PR/issue numbers for traceability.
