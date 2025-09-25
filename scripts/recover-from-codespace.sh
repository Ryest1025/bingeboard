#!/usr/bin/env bash
set -euo pipefail

# Codespace Recovery Helper
# - Creates a recovery branch, commits all changes, and pushes it to origin (or a fork)
# - Non-destructive: does not modify main or rewrite history

usage() {
  cat <<EOF
Usage: $(basename "$0") [--remote <origin|fork|URL>] [--branch-prefix <prefix>] [--no-push]

Options:
  --remote <name|URL>     Git remote name or full URL to push to (default: origin)
  --branch-prefix <str>   Prefix for the recovery branch (default: recovery/codespace)
  --no-push               Create branch and commit locally without pushing
  -h, --help              Show this help

Behavior:
  - Creates and switches to a new branch named: <prefix>-YYYYMMDD-HHMMSS
  - Adds all changes and commits (WIP is okay)
  - Pushes to the selected remote unless --no-push

Examples:
  $(basename "$0")
  $(basename "$0") --remote fork
  $(basename "$0") --remote https://github.com/YOURUSER/bingeboard.git
  $(basename "$0") --branch-prefix rescue/codespace
EOF
}

REMOTE="origin"
PREFIX="recovery/codespace"
PUSH=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --remote)
      REMOTE="$2"; shift 2 ;;
    --branch-prefix)
      PREFIX="$2"; shift 2 ;;
    --no-push)
      PUSH=0; shift ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "Unknown arg: $1" >&2; usage; exit 1 ;;
  esac
done

# Ensure we're in a git repo
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: not a git repository." >&2
  exit 1
fi

# Show current status
echo "[codespace-recover] Current status:" >&2
git status -s || true

STAMP=$(date +%Y%m%d-%H%M%S)
BRANCH="$PREFIX-$STAMP"

# Create and switch to recovery branch
echo "[codespace-recover] Creating branch: $BRANCH" >&2
git switch -c "$BRANCH"

# Commit everything (WIP ok)
echo "[codespace-recover] Committing all changes..." >&2
git add -A
if git diff --cached --quiet; then
  echo "[codespace-recover] No staged changes to commit (working tree clean or already committed)." >&2
else
  git commit -m "Recovery: snapshot from Codespace ($STAMP)"
fi

if (( PUSH == 1 )); then
  echo "[codespace-recover] Pushing to $REMOTE ..." >&2
  # If REMOTE is a URL, push to that URL; otherwise assume remote name
  if [[ "$REMOTE" =~ ^https?:// ]]; then
    git push -u "$REMOTE" "$BRANCH" || {
      echo "[codespace-recover] Push to URL failed. You can retry with a different --remote." >&2
      exit 1
    }
  else
    # Ensure the remote exists
    if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
      echo "[codespace-recover] Remote '$REMOTE' not found. Add it or use --remote <URL>." >&2
      exit 1
    fi
    git push -u "$REMOTE" HEAD || {
      echo "[codespace-recover] Push to remote '$REMOTE' failed. You can retry with --remote <URL> or --no-push." >&2
      exit 1
    }
  fi
  echo "[codespace-recover] Done. Branch pushed: $BRANCH" >&2
else
  echo "[codespace-recover] Skipped push (--no-push). Local branch created: $BRANCH" >&2
fi

# Print next steps
cat <<EON

Next steps:
- Open a PR from $BRANCH into your target branch (e.g., main)
- Or locally:
    git fetch ${REMOTE/https:\/\/*/origin}
    git switch -c review/${BRANCH//\//-} ${REMOTE/https:\/\/*/origin}/$BRANCH || git checkout -b review/${BRANCH//\//-} $BRANCH
    git diff YOUR_LOCAL_BRANCH...review/${BRANCH//\//-}

Tip: To take a single file from the recovery branch locally:
    git restore --source=review/${BRANCH//\//-} -- path/to/file
EON
