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
      UNUSED_EXPORT_*|UNUSED_GROWTH_*|UNUSED_DEP_*|STRICT_BASELINE|AUTO_UPDATE_BASELINE|UNUSED_DISABLE_KNIP_FALLBACK)
        # Trim possible CR/LF
        val="${val%$'\r'}"
        export "$key"="$val"
        ;;
    esac
  done < <(grep -E '^(UNUSED_EXPORT_|UNUSED_GROWTH_|UNUSED_DEP_|STRICT_BASELINE|AUTO_UPDATE_BASELINE|UNUSED_DISABLE_KNIP_FALLBACK)=' "$REPO_ROOT/.env" || true)
fi

# Defaults (can be overridden by env)
# Initial tightening per cleanup plan:
#  - WARN on any growth (>0%)
#  - FAIL on >5% growth
#  - WARN on any new unused export (>0 new) and FAIL if >5 new
UNUSED_EXPORT_FAIL_THRESHOLD=${UNUSED_EXPORT_FAIL_THRESHOLD:-5}
UNUSED_EXPORT_WARN_THRESHOLD=${UNUSED_EXPORT_WARN_THRESHOLD:-0}
UNUSED_GROWTH_FAIL_PERCENT=${UNUSED_GROWTH_FAIL_PERCENT:-5}
UNUSED_GROWTH_WARN_PERCENT=${UNUSED_GROWTH_WARN_PERCENT:-0}

UNUSED_DEP_FAIL_THRESHOLD=${UNUSED_DEP_FAIL_THRESHOLD:-5}
UNUSED_DEP_WARN_THRESHOLD=${UNUSED_DEP_WARN_THRESHOLD:-1}

STRICT_BASELINE=${STRICT_BASELINE:-0} # if 1, any change triggers at least WARN (or FAIL if above warn threshold)
STRICT_MAIN_NO_WARN=${STRICT_MAIN_NO_WARN:-0} # if 1 (on main branch post-milestone), escalate what would be WARN growth to FAIL

# Allow disabling the Knip fallback for experimentation / A/B in CI
UNUSED_DISABLE_KNIP_FALLBACK=${UNUSED_DISABLE_KNIP_FALLBACK:-0}

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
    STRICT_BASELINE=1             (treat any diff as at least WARN)
    UNUSED_DISABLE_KNIP_FALLBACK=1 (disable Knip fallback when ts-prune fails)

Exit codes:
  0 = PASS
  1 = FAIL
  2 = WARN
EOF
      exit 0
      ;;
  esac
done

DATE=$(date +%Y%m%d)
REPORT_MD="$REPORT_DIR/report-$DATE.md"

TS_PRUNE_OUT="/tmp/ts-prune-unused.txt"
TS_PRUNE_FILTERED="/tmp/ts-prune-unused.filtered.txt"
BASELINE_FILTERED="/tmp/ts-prune-baseline.filtered.txt"
DEPCHECK_OUT="/tmp/depcheck-unused.txt"

BASELINE_EXPORTS="$REPORT_DIR/baseline-unused-exports.txt"
BASELINE_DEPS="$REPORT_DIR/baseline-unused-deps.txt"

DIFF_NEW_EXPORTS="/tmp/ts-prune-new.txt"
DIFF_REMOVED_EXPORTS="/tmp/ts-prune-removed.txt"
DIFF_NEW_DEPS="/tmp/dep-new.txt"
DIFF_REMOVED_DEPS="/tmp/dep-removed.txt"

STATUS="PASS"

echo "[analyze-unused] Running ts-prune..." >&2
set +e
npx ts-prune -p "$REPO_ROOT/tsconfig.tsprune.json" > "$TS_PRUNE_OUT.raw" 2> /tmp/ts-prune.err
TS_PRUNE_EXIT=$?
set -e
if [[ $TS_PRUNE_EXIT -ne 0 ]]; then
  if [[ "${UNUSED_DISABLE_KNIP_FALLBACK:-0}" == "1" ]]; then
    echo "[analyze-unused] ts-prune failed (exit $TS_PRUNE_EXIT) and UNUSED_DISABLE_KNIP_FALLBACK=1; skipping Knip fallback." >&2
    echo "# ts-prune failed; fallback disabled. See /tmp/ts-prune.err" > "$TS_PRUNE_OUT.raw"
  else
    echo "[analyze-unused] ts-prune failed (exit $TS_PRUNE_EXIT). Falling back to Knip exports analysis..." >&2
    # Fallback: use Knip to produce a similar 'file: ExportName' list for unused exports
    export DATABASE_URL=${DATABASE_URL:-postgres://user:pass@localhost:5432/db}
    TMP_KNIP_JSON="/tmp/knip-exports.json"
    npx knip --exports --reporter json --no-progress > "$TMP_KNIP_JSON"
    # Extract unused type exports and duplicate exported value names
    # Output format: path: ExportName
    jq -r '
      .issues[]? as $f | ($f.types // [])[]?.name as $n | "",$f.file,": ",$n
    ' "$TMP_KNIP_JSON" | paste -sd '' - > "$TS_PRUNE_OUT.raw" || true
  fi
fi

sort -u "$TS_PRUNE_OUT.raw" > "$TS_PRUNE_OUT" && rm -f "$TS_PRUNE_OUT.raw" || true

echo "[analyze-unused] Running depcheck..." >&2
npx depcheck --json | jq -r '.unusedDependencies[]?, .unusedDevDependencies[]?' | sort -u > "$DEPCHECK_OUT" || true

# Filter ts-prune output (remove test files, build artifacts, etc.)
grep -v '/\(test\|spec\|__tests__\|\.test\.\|\.spec\.\|dist/\|build/\)' "$TS_PRUNE_OUT" > "$TS_PRUNE_FILTERED" || true

# Compare with baselines
CURRENT_EXPORT_COUNT=$(wc -l < "$TS_PRUNE_FILTERED")
CURRENT_DEPS_COUNT=$(wc -l < "$DEPCHECK_OUT")

if [[ -f "$BASELINE_EXPORTS" ]]; then
  BASELINE_EXPORT_COUNT=$(wc -l < "$BASELINE_EXPORTS")
  grep -v '/\(test\|spec\|__tests__\|\.test\.\|\.spec\.\|dist/\|build/\)' "$BASELINE_EXPORTS" > "$BASELINE_FILTERED" || true
  comm -13 "$BASELINE_FILTERED" "$TS_PRUNE_FILTERED" > "$DIFF_NEW_EXPORTS" || true
  comm -23 "$BASELINE_FILTERED" "$TS_PRUNE_FILTERED" > "$DIFF_REMOVED_EXPORTS" || true
  NEW_EXPORTS=$(wc -l < "$DIFF_NEW_EXPORTS")
  REMOVED_EXPORTS=$(wc -l < "$DIFF_REMOVED_EXPORTS")
  if (( BASELINE_EXPORT_COUNT > 0 )); then
    GROWTH_PERCENT=$(( (CURRENT_EXPORT_COUNT - BASELINE_EXPORT_COUNT) * 100 / BASELINE_EXPORT_COUNT ))
  else
    GROWTH_PERCENT=0
  fi
else
  echo "[analyze-unused] No export baseline found -> will create." >&2
  BASELINE_EXPORT_COUNT=0
  NEW_EXPORTS=$CURRENT_EXPORT_COUNT
  REMOVED_EXPORTS=0
  GROWTH_PERCENT=0
  touch "$DIFF_NEW_EXPORTS" "$DIFF_REMOVED_EXPORTS"
fi

if [[ -f "$BASELINE_DEPS" ]]; then
  BASELINE_DEPS_COUNT=$(wc -l < "$BASELINE_DEPS")
  comm -13 "$BASELINE_DEPS" "$DEPCHECK_OUT" > "$DIFF_NEW_DEPS" || true
  comm -23 "$BASELINE_DEPS" "$DEPCHECK_OUT" > "$DIFF_REMOVED_DEPS" || true
  NEW_DEPS=$(wc -l < "$DIFF_NEW_DEPS")
  REMOVED_DEPS=$(wc -l < "$DIFF_REMOVED_DEPS")
else
  echo "[analyze-unused] No dependency baseline found -> will create." >&2
  BASELINE_DEPS_COUNT=0
  NEW_DEPS=$CURRENT_DEPS_COUNT
  REMOVED_DEPS=0
  touch "$DIFF_NEW_DEPS" "$DIFF_REMOVED_DEPS"
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

# Escalate WARN to FAIL on main if STRICT_MAIN_NO_WARN
if $EXPORT_WARN && (( STRICT_MAIN_NO_WARN == 1 )); then
  EXPORT_FAIL=true
  EXPORT_WARN=false
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
  # Group counts (prefix-based) for prioritization
  echo "## Unused Export Group Summary"
  if [[ -s "$TS_PRUNE_FILTERED" ]]; then
    awk -F':' '{print $1}' "$TS_PRUNE_FILTERED" | \
      awk -F'/' '{
        if($1=="client" && $2=="src" && $3=="components") {g=$1"/"$2"/"$3"/"$4} \
        else if($1=="client" && $2=="src" && $3=="firebase") {g=$1"/"$2"/"$3} \
        else if($1=="client" && $2=="src" && $3=="pages") {g=$1"/"$2"/"$3} \
        else if($1=="server") {g=$1"/"$2} else {g=$1}
        counts[g]++
      } END { for(k in counts) printf("- %s: %d\n", k, counts[k]) }' | sort -k2 -nr
  else
    echo "None."
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
  echo "## Full Unused Export List (filtered)"
  if [[ -s "$TS_PRUNE_FILTERED" ]]; then
    echo '\n```'
    cat "$TS_PRUNE_FILTERED"
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
