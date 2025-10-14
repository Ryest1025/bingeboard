#!/usr/bin/env bash
set -euo pipefail

echo "[post-create] Node: $(node -v)  NPM: $(npm -v)  PWD: $(pwd)"
START_TS=$(date -u +%s)

retry() {
  local tries=$1; shift
  local cmd="$@"
  local attempt=1
  until bash -lc "$cmd"; do
    echo "[post-create][warn] Attempt $attempt failed for: $cmd"
    if [ $attempt -ge $tries ]; then
      echo "[post-create][error] Giving up after $attempt attempts" >&2
      return 1
    fi
    attempt=$(( attempt + 1 ))
    sleep 5
  done
}

# Ensure workspace owned by node user (sometimes root-owned after volume restore)
if [ "$(id -u)" = "0" ]; then
  echo "[post-create] Running as root; adjusting ownership to node for /workspaces/bingeboard-local"
  chown -R node:node /workspaces/bingeboard-local || true
fi

# Install deps with retries
retry 3 "npm install --no-audit --no-fund"

# Basic type check (non-blocking on failure but logs)
if npm exec tsc --noEmit > /dev/null 2>&1; then
  echo "[post-create] Type check: OK"
else
  echo "[post-create][warn] Type check reported issues (see tsc output if needed)"
fi

# Store build meta (used for VITE_COMMIT_HASH fallback if CI not injecting)
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "local")
DATE_ISO=$(date -u +%Y-%m-%dT%H:%M:%SZ)
cat > .build-info.json <<EOF
{
  "commit": "${COMMIT_HASH}",
  "generatedAt": "${DATE_ISO}",
  "source": "post-create"
}
EOF

DURATION=$(( $(date -u +%s) - START_TS ))
echo "[post-create] Completed in ${DURATION}s (commit ${COMMIT_HASH})"