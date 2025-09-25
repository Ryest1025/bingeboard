# Knip Baseline Maintenance

When legitimate unused exports/dependencies have been addressed and the ignore list/config are stable, snapshot a new baseline so CI only flags growth.

## Update the baselines

```bash
npm run knip:update-baseline
```

This updates the files under `analysis/`:
- `analysis/baseline-unused-exports.txt`
- `analysis/baseline-unused-deps.txt`

## What to commit

Commit the updated baseline files above along with any ignore/config changes (e.g., `knip.json`, `analysis/unused-ignore.txt`).

## Verify in CI

Open a PR and ensure the "Analyze Unused Code" job passes with no new warnings. If warnings appear, review diffs and tweak ignores/config instead of immediately re-baselining.

## Tips

- Keep `analysis/unused-ignore.txt` lean; prefer scoping via `knip.json` ignores where possible.
- You can temporarily disable the fallback to compare behaviors:
  ```bash
  UNUSED_DISABLE_KNIP_FALLBACK=1 npm run knip
  ```
