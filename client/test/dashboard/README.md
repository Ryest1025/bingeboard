# Dashboard Test Suite

Covers critical rendering states of the Dashboard page:

1. Spotlight fallback appears when trending dataset is empty
2. Recommendations render when personalized endpoint returns data
3. Empty state message when no personalized recommendations and no active filters
4. Continue Watching section presence

Future additions:
- Filter interactions (select genre/network/year and assert reduction)
- Watchlist action button interactions (mock handlers invoked)
- Streaming platform badges presence limit (<=4)

Run tests:

```
npm test -- --run
```
