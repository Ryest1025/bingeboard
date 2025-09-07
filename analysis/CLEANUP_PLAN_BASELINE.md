## Unused Export Baseline Strategy

This repository now enforces staged tightening of unused export growth with WARN/FAIL thresholds plus a filtered ignore list.

### Current Threshold Defaults
- WARN on any growth (>0% exports or >0 new dependencies)
- FAIL on >5 new exports OR >5% export growth OR >5 new unused dependencies

Adjust via environment variables:
```
UNUSED_EXPORT_WARN_THRESHOLD=0
UNUSED_EXPORT_FAIL_THRESHOLD=5
UNUSED_GROWTH_WARN_PERCENT=0
UNUSED_GROWTH_FAIL_PERCENT=5
UNUSED_DEP_WARN_THRESHOLD=0
UNUSED_DEP_FAIL_THRESHOLD=5
```

### Strict Main (Post-Milestone)
Set `STRICT_MAIN_NO_WARN=1` (e.g. in CI for main branch) after initial cleanup milestone to escalate WARN to FAIL and block any new unused code growth.

### Ignore List (`analysis/unused-ignore.txt`)
Use for intentionally unused exports (storybook/demo, type-only noise). Keep minimal to retain pressure for removal.

### Group Summary
Report includes grouped counts by path prefix to prioritize high-volume areas (e.g. duplicated Firebase configs, legacy pages, UI re-export surface).

### Cleanup Phases
1. Phase 0 (Now): Establish accurate baseline (done). Identify top 3 groups by count.
2. Phase 1: Remove duplicate firebase config & obsolete auth/onboarding page variants. Target reduction: 50+.
3. Phase 2: Consolidate UI component re-export noise (decide which surfaces are public). Target reduction: additional 75.
4. Phase 3: Archive legacy dashboard/home variants in date-stamped folder under `archive/` (excluded from ts-prune via tsconfig or removal).
5. Phase 4: Tighten FAIL thresholds (e.g. new exports >2, growth >2%).
6. Phase 5: Enable `STRICT_MAIN_NO_WARN=1`.

### Archival Convention
Move obsolete code to `archive/<YYYY-MM-DD>/<original-path>` or delete outright if git history suffices. Archived code should not be part of the build (adjust tsconfig include/exclude if needed).

### Weekly Target
Aim for net reduction of at least 50 unused exports until baseline <200.

### Future Enhancements
- Per-group thresholds (e.g. firebase configs must trend to zero).
- Automated suggested deletion list ordering by last git modify date + group frequency.

---
Maintainers: Update this document when thresholds or strategy shifts.
