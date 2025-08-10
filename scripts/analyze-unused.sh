#!/bin/bash
set -e
set -o pipefail

# Configuration (tweak thresholds as needed)
MAX_NEW_UNUSED=5              # fail if more than this number of new unused exports
MAX_GROWTH_PERCENT=10         # fail if growth > this percent vs baseline

# Output files
TS_PRUNE_OUT="/tmp/ts-prune-unused.txt"
DEPCHECK_OUT="/tmp/depcheck-unused.txt"
REPORT_DIR="$(dirname "$0")/../analysis"
DATE=$(date +%Y%m%d)
REPORT_MD="$REPORT_DIR/report-$DATE.md"
BASELINE="$REPORT_DIR/baseline-unused-exports.txt"

mkdir -p "$REPORT_DIR"

# Run ts-prune (raw)
npx ts-prune > "$TS_PRUNE_OUT.raw"

# Deduplicate identical lines (some tools may output duplicates)
sort -u "$TS_PRUNE_OUT.raw" > "$TS_PRUNE_OUT"
rm -f "$TS_PRUNE_OUT.raw"

# Run depcheck (only unused deps/files)
npx depcheck --json | jq -r '.unusedDependencies[]?, .unusedDevDependencies[]?' > "$DEPCHECK_OUT"

# Baseline diff calculations
CURRENT_COUNT=$(wc -l < "$TS_PRUNE_OUT" | tr -d ' ')
BASELINE_COUNT=0
NEW_UNUSED=0
REMOVED_UNUSED=0
GROWTH_PERCENT=0
DIFF_NEW_FILE="/tmp/ts-prune-new.txt"
DIFF_REMOVED_FILE="/tmp/ts-prune-removed.txt"

if [[ -f "$BASELINE" ]]; then
  BASELINE_COUNT=$(wc -l < "$BASELINE" | tr -d ' ')
  # Compute new (in current not in baseline)
  grep -Fxv -f "$BASELINE" "$TS_PRUNE_OUT" > "$DIFF_NEW_FILE" || true
  # Compute removed (in baseline not in current)
  grep -Fxv -f "$TS_PRUNE_OUT" "$BASELINE" > "$DIFF_REMOVED_FILE" || true
  NEW_UNUSED=$(grep -c . "$DIFF_NEW_FILE" || true)
  REMOVED_UNUSED=$(grep -c . "$DIFF_REMOVED_FILE" || true)
  if [[ $BASELINE_COUNT -gt 0 ]]; then
    GROWTH_PERCENT=$(( ( (CURRENT_COUNT - BASELINE_COUNT) * 100 ) / BASELINE_COUNT ))
  fi
fi

# Compose Markdown report with summary & diff
{
  echo "# Unused Code & Dependency Report ($DATE)"
  echo
  echo "## Summary"
  echo "- Current unused exports: $CURRENT_COUNT"
  echo "- Baseline unused exports: $BASELINE_COUNT"
  echo "- New unused exports vs baseline: $NEW_UNUSED"
  echo "- Removed unused exports vs baseline: $REMOVED_UNUSED"
  echo "- Growth percent vs baseline: ${GROWTH_PERCENT}%"
  if [[ -s "$DIFF_NEW_FILE" ]]; then
    echo "- Thresholds: MAX_NEW_UNUSED=$MAX_NEW_UNUSED, MAX_GROWTH_PERCENT=$MAX_GROWTH_PERCENT"
  fi
  echo
  echo "## New Unused Exports (since baseline)"
  if [[ -s "$DIFF_NEW_FILE" ]]; then
    echo '\n```'
    cat "$DIFF_NEW_FILE"
    echo '```'
  else
    echo "None."
  fi
  echo
  echo "## Removed Unused Exports (cleaned up)"
  if [[ -s "$DIFF_REMOVED_FILE" ]]; then
    echo '\n```'
    cat "$DIFF_REMOVED_FILE"
    echo '```'
  else
    echo "None."
  fi
  echo
  echo "## Unused TypeScript Exports (Full List)"
  if [[ -s "$TS_PRUNE_OUT" ]]; then
    echo '\n```'
    cat "$TS_PRUNE_OUT"
    echo '```'
  else
    echo "None found."
  fi
  echo
  echo "## Unused Dependencies (depcheck)"
  if [[ -s "$DEPCHECK_OUT" ]]; then
    echo '\n```'
    cat "$DEPCHECK_OUT"
    echo '```'
  else
    echo "None found."
  fi
  echo
  echo "---"
  echo "Baseline file: $BASELINE"
} > "$REPORT_MD"

# Produce short summary snippet for CI comment
SUMMARY_SNIPPET="$REPORT_DIR/summary-latest.txt"
{
  echo "Current: $CURRENT_COUNT | Baseline: $BASELINE_COUNT | New: $NEW_UNUSED | Removed: $REMOVED_UNUSED | Growth: ${GROWTH_PERCENT}%"
  if [[ -s "$DIFF_NEW_FILE" ]]; then
    echo "New (first 10):"
    head -n 10 "$DIFF_NEW_FILE"
  fi
  if [[ -s "$DIFF_REMOVED_FILE" ]]; then
    echo "Removed (first 10):"
    head -n 10 "$DIFF_REMOVED_FILE"
  fi
} > "$SUMMARY_SNIPPET"

# Baseline comparison
if [[ ! -f "$BASELINE" ]]; then
  cp "$TS_PRUNE_OUT" "$BASELINE"
  echo "Baseline created." >&2
else
  # Fail if thresholds exceeded
  if [[ $NEW_UNUSED -gt $MAX_NEW_UNUSED ]] || [[ $GROWTH_PERCENT -gt $MAX_GROWTH_PERCENT ]]; then
    echo "Threshold exceeded: NEW_UNUSED=$NEW_UNUSED (limit $MAX_NEW_UNUSED) or GROWTH_PERCENT=${GROWTH_PERCENT}% (limit ${MAX_GROWTH_PERCENT}%)." >&2
    echo "See $REPORT_MD for details." >&2
    exit 1
  fi
  # Also fail if any change (strict mode) - optional: keep for now
  if ! diff -q "$BASELINE" "$TS_PRUNE_OUT" >/dev/null; then
    echo "Unused exports differ from baseline (but within thresholds). See $REPORT_MD. Failing to enforce cleanup." >&2
    exit 1
  fi
fi

# Success
exit 0
