#!/bin/bash

echo "=== BINGEBOARD DEV CHECK ==="

# Use localhost since we're testing from inside the container
BACKEND_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:3001"

check_endpoint() {
  local name=$1
  local url=$2

  echo -n "Checking $name ($url)... "

  # Make the request and capture HTTP status
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url")

  if [[ "$status" == "200" ]]; then
    echo "✅ OK"
    # Print the JSON body if session endpoint
    if [[ "$url" == *"/session" ]]; then
      echo "Response:"
      curl -s --max-time 5 "$url" | jq . 2>/dev/null || curl -s --max-time 5 "$url"
    fi
  else
    echo "❌ FAILED (HTTP $status)"
  fi
}

# Backend direct (using container network IP)
check_endpoint "Backend Health" "$BACKEND_URL/api/health"
check_endpoint "Backend Session" "$BACKEND_URL/api/auth/session"

echo ""
echo "--- Frontend Proxy Tests ---"

# Frontend via Vite proxy (using container network IP)
check_endpoint "Frontend Proxy Health" "$FRONTEND_URL/api/health"
check_endpoint "Frontend Proxy Session" "$FRONTEND_URL/api/auth/session"

echo ""
echo "=== Network Info ==="
echo "Backend should be accessible at: $BACKEND_URL"
echo "Frontend should be accessible at: $FRONTEND_URL"
echo "From your browser, use: http://localhost:3001 (if port forwarded)"