#!/bin/bash
set -e
set -o pipefail

# Output files
TS_PRUNE_OUT="/tmp/ts-prune-unused.txt"
DEPCHECK_OUT="/tmp/depcheck-unused.txt"
REPORT_DIR="$(dirname "$0")/../analysis"
DATE=$(date +%Y%m%d)
REPORT_MD="$REPORT_DIR/report-$DATE.md"
BASELINE="$REPORT_DIR/baseline-unused-exports.txt"

mkdir -p "$REPORT_DIR"

# Run ts-prune
npx ts-prune > "$TS_PRUNE_OUT"

# Run depcheck (only unused deps/files)
npx depcheck --json | jq -r '.unusedDependencies[]?, .unusedDevDependencies[]?' > "$DEPCHECK_OUT"

# Compose Markdown report
{
  echo "# Unused Code & Dependency Report ($DATE)"
  echo
  echo "## Unused TypeScript Exports (ts-prune)"
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

# Baseline comparison
if [[ ! -f "$BASELINE" ]]; then
  cp "$TS_PRUNE_OUT" "$BASELINE"
  echo "Baseline created."
else
  if ! diff -q "$BASELINE" "$TS_PRUNE_OUT" >/dev/null; then
    echo "Unused exports have changed! See $REPORT_MD for details." >&2
    exit 1
  fi
fi

# Success
exit 0
