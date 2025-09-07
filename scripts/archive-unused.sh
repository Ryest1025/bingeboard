#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ARCHIVE_DIR="$ROOT_DIR/archive/$(date +%Y-%m-%d)"
REPORT_DIR="$ROOT_DIR/analysis"
mkdir -p "$ARCHIVE_DIR" "$REPORT_DIR"

TS_JSON="/tmp/ts-prune-results.json"
DC_JSON="/tmp/depcheck-results.json"
TS_TXT="/tmp/ts-prune-unused.txt"
DATE=$(date +%Y%m%d)
REPORT_MD="$REPORT_DIR/report-$DATE-archive.md"
BASELINE="$REPORT_DIR/baseline-unused-exports.txt"

echo "==> Running ts-prune (JSON)"
# Use local ts-prune config if present
npx ts-prune --json > "$TS_JSON"
# Also store plain text list for baseline diff
npx ts-prune > "$TS_TXT"

echo "==> Running depcheck (JSON)"
npx depcheck --json > "$DC_JSON" || true

# Identify candidate files to archive:
# ts-prune JSON format: array of objects; we archive only default export files that look like standalone variant entrypoints
# (Simpler: archive if filename matches patterns like App-*.tsx or *-debug.tsx, etc.)

echo "==> Selecting unused variant files"
UNUSED_FILES=$(grep -E 'client/src/App-|client/src/.*-debug|client/src/App-(debug|diagnostic|fresh|minimal|mobile|simple|test|working)\.tsx' "$TS_TXT" | awk -F':' '{print $1}' | sort -u || true)

if [[ -z "$UNUSED_FILES" ]]; then
  echo "No variant unused files matched archive criteria."
else
  echo "Archiving files:" $UNUSED_FILES
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    if [[ -f "$ROOT_DIR/$file" ]]; then
      DEST="$ARCHIVE_DIR/$file"
      mkdir -p "$(dirname "$DEST")"
      git mv "$ROOT_DIR/$file" "$DEST" 2>/dev/null || mv "$ROOT_DIR/$file" "$DEST"
      echo "Moved $file -> $DEST"
    fi
  done <<< "$UNUSED_FILES"
fi

# Generate markdown report (reuse logic similar to analyze script)
{
  echo "# Archive Mode Unused Report ($DATE)"
  echo
  echo "## Archived Files"
  if [[ -n "$UNUSED_FILES" ]]; then
    echo '\n'"$(echo "$UNUSED_FILES" | sed 's#^#- #')"
  else
    echo "None archived."
  fi
  echo
  echo "## Raw ts-prune Output"
  echo '\n```'
  cat "$TS_TXT"
  echo '```'
  echo
  echo "## Depcheck Summary (truncated)"
  echo '\n```'
  jq '{unusedDependencies, unusedDevDependencies}' "$DC_JSON" 2>/dev/null || echo "(depcheck parse error)"
  echo '```'
  echo
  echo "Baseline file: $BASELINE"
} > "$REPORT_MD"

# Baseline comparison (same as analyze script)
if [[ ! -f "$BASELINE" ]]; then
  cp "$TS_TXT" "$BASELINE"
  echo "Baseline created (none existed)."
else
  if ! diff -q "$BASELINE" "$TS_TXT" >/dev/null; then
    echo "Unused exports differ from baseline (archive run). See $REPORT_MD" >&2
  fi
fi

echo "Archive mode complete. Report: $REPORT_MD"
