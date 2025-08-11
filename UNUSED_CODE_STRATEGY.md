## Unused Code & Export Hygiene Strategy

### Goals
1. Keep the codebase lean by steadily shrinking the baseline of unused exports.
2. Prevent silent growth: any delta above the baseline triggers at least a warning (currently FAIL on >0% growth; WARN disabled on main by STRICT_MAIN_NO_WARN).
3. Make intentional exceptions explicit and easy to audit.

### Analyzer Summary
The `scripts/analyze-unused.sh` script runs:
- `ts-prune` for unused TypeScript exports
- `depcheck` for unused dependencies/devDependencies
It compares results to baselines stored in `analysis/`.

Exit codes:
| Code | Meaning |
|------|---------|
| 0 | PASS |
| 1 | FAIL (threshold exceeded) |
| 2 | WARN (non-fatal growth / changes) |

### Intentional Ignore Mechanisms
Use the following patterns sparingly and only with clear rationale:

1. Inline comment marker: `/* ignore-unused-export */` placed immediately before an exported symbol (interface, function, type) that is:
   - Consumed indirectly via dynamic import / reflection
   - Required by external integration tests
   - A public API surface planned for near-term usage

2. Global ignore list: `analysis/unused-ignore.txt`
   - Line substrings matched (simple `grep -F -v`).
   - Prefer prefix conventions instead of listing individual files repeatedly.
   - Accepted naming conventions for intentionally unused stubs:
     - `__experimental_*`
     - `_unused_*`
     - `Internal*` (when required for library exposure but not yet referenced)

3. Internalization: convert unused exports to un-exported `const` / functions instead of ignoring when feasible.

### When to Regenerate Baselines
Regenerate (with `--update-baseline`) only after:
1. A cleanup PR that demonstrably reduces the export count or dependency noise.
2. A large feature merge that introduces necessary new exported surfaces verified by reviewers.

Avoid regenerating baselines just to silence warnings—address underlying unused code first.

### Burn-Down Plan
Current baseline (exports): See `analysis/baseline-unused-exports.txt`.
Target reductions:
- Short-term: -10% of baseline (remove low-hanging unused UI components & legacy helpers).
- Mid-term: Consolidate duplicated schema / model exports.
- Long-term: Drive toward <25% of initial baseline size by pruning dead feature experiments.

### Developer Workflow
1. Run locally: `bash scripts/analyze-unused.sh`.
2. If FAIL due to legitimate new usage surfaces, add inline markers or refactor to internal.
3. If still FAIL and changes are intentional & reviewed, update baseline: `bash scripts/analyze-unused.sh --update-baseline` (include rationale in commit message).

### Review Checklist for New Exports
- Is this export referenced by at least one consumer? If not, can it be internal?
- Will it be used in <2 weeks? If not, postpone adding it.
- Could this be grouped under an existing namespace/module instead of new top-level export?

### CI Enforcement Notes
- `STRICT_MAIN_NO_WARN=1` escalates WARN → FAIL on main to keep baseline stable.
- Adjust thresholds via env vars only in exceptional circumstances.

### Future Enhancements
- Auto-open GitHub issue when FAIL persists across 3 consecutive runs.
- Track burn-down trend (store historical counts in JSON for charting).
- Add eslint rule to flag `ignore-unused-export` markers lacking a trailing reason.

---
Last updated: 2025-08-11
