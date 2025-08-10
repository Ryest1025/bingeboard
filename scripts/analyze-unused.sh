#!/bin/bash
set -euo pipefail

# ---------------------------------------
# Unused exports & dependency analyzer
# Supports PASS / WARN / FAIL exit codes:
#   0 = PASS, 1 = FAIL, 2 = WARN
# ---------------------------------------

SCRIPT_DIR="$(dirname "$0")"
REPO_ROOT="$SCRIPT_DIR/.."
REPORT_DIR="$REPO_ROOT/analysis"
mkdir -p "$REPORT_DIR"

# Load relevant tuning vars from .env safely (ignore secrets / spaced values)
if [[ -f "$REPO_ROOT/.env" ]]; then
  while IFS='=' read -r key val; do
    case "$key" in
      UNUSED_EXPORT_*|UNUSED_GROWTH_*|UNUSED_DEP_*|STRICT_BASELINE|AUTO_UPDATE_BASELINE)
        # Trim possible CR/LF
        val="${val%$'\r'}"
        export "$key"="$val"
        ;;
    esac
  done < <(grep -E '^(UNUSED_EXPORT_|UNUSED_GROWTH_|UNUSED_DEP_|STRICT_BASELINE|AUTO_UPDATE_BASELINE)=' "$REPO_ROOT/.env" || true)
fi

# Defaults (can be overridden by env)
UNUSED_EXPORT_FAIL_THRESHOLD=${UNUSED_EXPORT_FAIL_THRESHOLD:-5}
UNUSED_EXPORT_WARN_THRESHOLD=${UNUSED_EXPORT_WARN_THRESHOLD:-2}
UNUSED_GROWTH_FAIL_PERCENT=${UNUSED_GROWTH_FAIL_PERCENT:-10}
UNUSED_GROWTH_WARN_PERCENT=${UNUSED_GROWTH_WARN_PERCENT:-5}

UNUSED_DEP_FAIL_THRESHOLD=${UNUSED_DEP_FAIL_THRESHOLD:-5}
UNUSED_DEP_WARN_THRESHOLD=${UNUSED_DEP_WARN_THRESHOLD:-1}

STRICT_BASELINE=${STRICT_BASELINE:-0} # if 1, any change triggers at least WARN (or FAIL if above warn threshold)

AUTO_UPDATE_BASELINE=0
for arg in "$@"; do
  case "$arg" in
    --update-baseline)
      AUTO_UPDATE_BASELINE=1
      shift || true
      ;;
    --help|-h)
      cat <<EOF
Usage: $(basename "$0") [--update-baseline]

Environment overrides:
  UNUSED_EXPORT_FAIL_THRESHOLD (default $UNUSED_EXPORT_FAIL_THRESHOLD)
  UNUSED_EXPORT_WARN_THRESHOLD (default $UNUSED_EXPORT_WARN_THRESHOLD)
  UNUSED_GROWTH_FAIL_PERCENT  (default $UNUSED_GROWTH_FAIL_PERCENT)
  UNUSED_GROWTH_WARN_PERCENT  (default $UNUSED_GROWTH_WARN_PERCENT)
  UNUSED_DEP_FAIL_THRESHOLD   (default $UNUSED_DEP_FAIL_THRESHOLD)
  UNUSED_DEP_WARN_THRESHOLD   (default $UNUSED_DEP_WARN_THRESHOLD)
  STRICT_BASELINE=1           (treat any diff as at least WARN)

Exit codes: 0 PASS, 1 FAIL, 2 WARN
EOF
      exit 0
      ;;
  esac
done

DATE=$(date +%Y%m%d)
REPORT_MD="$REPORT_DIR/report-$DATE.md"

TS_PRUNE_OUT="/tmp/ts-prune-unused.txt"
DEPCHECK_OUT="/tmp/depcheck-unused.txt"

BASELINE_EXPORTS="$REPORT_DIR/baseline-unused-exports.txt"
BASELINE_DEPS="$REPORT_DIR/baseline-unused-deps.txt"

DIFF_NEW_EXPORTS="/tmp/ts-prune-new.txt"
DIFF_REMOVED_EXPORTS="/tmp/ts-prune-removed.txt"
DIFF_NEW_DEPS="/tmp/dep-new.txt"
DIFF_REMOVED_DEPS="/tmp/dep-removed.txt"

STATUS="PASS"

echo "[analyze-unused] Running ts-prune..." >&2
npx ts-prune > "$TS_PRUNE_OUT.raw"
sort -u "$TS_PRUNE_OUT.raw" > "$TS_PRUNE_OUT" && rm -f "$TS_PRUNE_OUT.raw"

echo "[analyze-unused] Running depcheck..." >&2
npx depcheck --json | jq -r '.unusedDependencies[]?, .unusedDevDependencies[]?' | sort -u > "$DEPCHECK_OUT" || true

CURRENT_EXPORT_COUNT=$(wc -l < "$TS_PRUNE_OUT" | tr -d ' ')
BASELINE_EXPORT_COUNT=0
NEW_EXPORTS=0
REMOVED_EXPORTS=0
GROWTH_PERCENT=0

CURRENT_DEPS_COUNT=$(wc -l < "$DEPCHECK_OUT" | tr -d ' ')
BASELINE_DEPS_COUNT=0
NEW_DEPS=0
REMOVED_DEPS=0

if [[ -f "$BASELINE_EXPORTS" ]]; then
  BASELINE_EXPORT_COUNT=$(wc -l < "$BASELINE_EXPORTS" | tr -d ' ')
  grep -Fxv -f "$BASELINE_EXPORTS" "$TS_PRUNE_OUT" > "$DIFF_NEW_EXPORTS" || true
  grep -Fxv -f "$TS_PRUNE_OUT" "$BASELINE_EXPORTS" > "$DIFF_REMOVED_EXPORTS" || true
  NEW_EXPORTS=$(grep -c . "$DIFF_NEW_EXPORTS" || true)
  REMOVED_EXPORTS=$(grep -c . "$DIFF_REMOVED_EXPORTS" || true)
  if [[ $BASELINE_EXPORT_COUNT -gt 0 ]]; then
    GROWTH_PERCENT=$(( ( (CURRENT_EXPORT_COUNT - BASELINE_EXPORT_COUNT) * 100 ) / BASELINE_EXPORT_COUNT ))
  fi
else
  echo "[analyze-unused] No export baseline found -> will create." >&2
fi

if [[ -f "$BASELINE_DEPS" ]]; then
  BASELINE_DEPS_COUNT=$(wc -l < "$BASELINE_DEPS" | tr -d ' ')
  grep -Fxv -f "$BASELINE_DEPS" "$DEPCHECK_OUT" > "$DIFF_NEW_DEPS" || true
  grep -Fxv -f "$DEPCHECK_OUT" "$BASELINE_DEPS" > "$DIFF_REMOVED_DEPS" || true
  NEW_DEPS=$(grep -c . "$DIFF_NEW_DEPS" || true)
  REMOVED_DEPS=$(grep -c . "$DIFF_REMOVED_DEPS" || true)
else
  echo "[analyze-unused] No dependency baseline found -> will create." >&2
fi

# Determine status for exports
EXPORT_FAIL=false
EXPORT_WARN=false

if (( NEW_EXPORTS > UNUSED_EXPORT_FAIL_THRESHOLD )) || (( GROWTH_PERCENT > UNUSED_GROWTH_FAIL_PERCENT )); then
  EXPORT_FAIL=true
elif (( NEW_EXPORTS > UNUSED_EXPORT_WARN_THRESHOLD )) || (( GROWTH_PERCENT > UNUSED_GROWTH_WARN_PERCENT )); then
  EXPORT_WARN=true
elif (( STRICT_BASELINE == 1 )) && [[ -f "$BASELINE_EXPORTS" ]] && ! diff -q "$BASELINE_EXPORTS" "$TS_PRUNE_OUT" >/dev/null; then
  EXPORT_WARN=true
fi

# Determine status for dependencies
DEPS_FAIL=false
DEPS_WARN=false
if (( NEW_DEPS > UNUSED_DEP_FAIL_THRESHOLD )); then
  DEPS_FAIL=true
elif (( NEW_DEPS > UNUSED_DEP_WARN_THRESHOLD )); then
  DEPS_WARN=true
elif (( STRICT_BASELINE == 1 )) && [[ -f "$BASELINE_DEPS" ]] && ! diff -q "$BASELINE_DEPS" "$DEPCHECK_OUT" >/dev/null; then
  DEPS_WARN=true
fi

if $EXPORT_FAIL || $DEPS_FAIL; then
  STATUS="FAIL"
elif $EXPORT_WARN || $DEPS_WARN; then
  STATUS="WARN"
else
  STATUS="PASS"
fi

# Auto-update baseline if requested (after computing status so caller can still see prior diff in report)
if (( AUTO_UPDATE_BASELINE == 1 )); then
  cp "$TS_PRUNE_OUT" "$BASELINE_EXPORTS"
  cp "$DEPCHECK_OUT" "$BASELINE_DEPS"
  echo "[analyze-unused] Baselines updated (exports & deps)." >&2
  # If user explicitly updates baseline, downgrade FAIL to PASS (treat as intentional reset)
  if [[ "$STATUS" == "FAIL" ]]; then
    STATUS="PASS"
  fi
fi

# Write report markdown
{
  echo "# Unused Code & Dependency Report ($DATE)"
  echo
  echo "## Summary"
  echo "- Status: $STATUS"
  echo "- Exports: current=$CURRENT_EXPORT_COUNT baseline=$BASELINE_EXPORT_COUNT new=$NEW_EXPORTS removed=$REMOVED_EXPORTS growth=${GROWTH_PERCENT}%"
  echo "- Deps: current=$CURRENT_DEPS_COUNT baseline=$BASELINE_DEPS_COUNT new=$NEW_DEPS removed=$REMOVED_DEPS"
  echo "- Thresholds: exports(new warn/fail=$UNUSED_EXPORT_WARN_THRESHOLD/$UNUSED_EXPORT_FAIL_THRESHOLD, growth warn/fail=${UNUSED_GROWTH_WARN_PERCENT}%/${UNUSED_GROWTH_FAIL_PERCENT}%), deps(new warn/fail=$UNUSED_DEP_WARN_THRESHOLD/$UNUSED_DEP_FAIL_THRESHOLD)"
  if (( AUTO_UPDATE_BASELINE == 1 )); then
    echo "- Baseline updated in this run (intentional reset)."
  fi
  echo
  echo "## New Unused Exports"
  if [[ -s "$DIFF_NEW_EXPORTS" ]]; then
    echo '\n```'
    cat "$DIFF_NEW_EXPORTS"
    echo '```'
  else
    echo "None."
  fi
  echo
  echo "## Removed Unused Exports"
  if [[ -s "$DIFF_REMOVED_EXPORTS" ]]; then
    echo '\n```'
    cat "$DIFF_REMOVED_EXPORTS"
    echo '```'
  else
    echo "None."
  fi
  echo
  echo "## New Unused Dependencies"
  if [[ -s "$DIFF_NEW_DEPS" ]]; then
    echo '\n```'
    cat "$DIFF_NEW_DEPS"
    echo '```'
  else
    echo "None."
  fi
  echo
  echo "## Removed Unused Dependencies"
  if [[ -s "$DIFF_REMOVED_DEPS" ]]; then
    echo '\n```'
    cat "$DIFF_REMOVED_DEPS"
    echo '```'
  else
    echo "None."
  fi
  echo
  echo "## Full Unused Export List"
  if [[ -s "$TS_PRUNE_OUT" ]]; then
    echo '\n```'
    cat "$TS_PRUNE_OUT"
    echo '```'
  else
    echo "None found."
  fi
  echo
  echo "## Full Unused Dependency List"
  if [[ -s "$DEPCHECK_OUT" ]]; then
    echo '\n```'
    cat "$DEPCHECK_OUT"
    echo '```'
  else
    echo "None found."
  fi
  echo
  echo "---"
  echo "Export baseline: $BASELINE_EXPORTS"
  echo "Dependency baseline: $BASELINE_DEPS"
} > "$REPORT_MD"

# Short summary snippet
SUMMARY_SNIPPET="$REPORT_DIR/summary-latest.txt"
{
  echo "STATUS: $STATUS"
  echo "Exports => current:$CURRENT_EXPORT_COUNT baseline:$BASELINE_EXPORT_COUNT new:$NEW_EXPORTS removed:$REMOVED_EXPORTS growth:${GROWTH_PERCENT}%"
  echo "Deps    => current:$CURRENT_DEPS_COUNT baseline:$BASELINE_DEPS_COUNT new:$NEW_DEPS removed:$REMOVED_DEPS"
  if [[ -s "$DIFF_NEW_EXPORTS" ]]; then
    echo "New exports (first 10):"; head -n 10 "$DIFF_NEW_EXPORTS"; fi
  if [[ -s "$DIFF_NEW_DEPS" ]]; then
    echo "New deps (first 10):"; head -n 10 "$DIFF_NEW_DEPS"; fi
  if [[ -s "$DIFF_REMOVED_EXPORTS" ]]; then
    echo "Removed exports (first 10):"; head -n 10 "$DIFF_REMOVED_EXPORTS"; fi
  if [[ -s "$DIFF_REMOVED_DEPS" ]]; then
    echo "Removed deps (first 10):"; head -n 10 "$DIFF_REMOVED_DEPS"; fi
  if (( AUTO_UPDATE_BASELINE == 1 )); then
    echo "(Baselines updated this run)"
  fi
} > "$SUMMARY_SNIPPET"

# Create baselines if they didn't exist (initialization scenario)
if [[ ! -f "$BASELINE_EXPORTS" ]]; then
  cp "$TS_PRUNE_OUT" "$BASELINE_EXPORTS"
  echo "[analyze-unused] Export baseline initialized." >&2
fi
if [[ ! -f "$BASELINE_DEPS" ]]; then
  cp "$DEPCHECK_OUT" "$BASELINE_DEPS"
  echo "[analyze-unused] Dependency baseline initialized." >&2
fi

# Exit codes
case "$STATUS" in
  PASS) exit 0 ;;
  WARN) exit 2 ;;
  FAIL) exit 1 ;;
esac

exit 0
