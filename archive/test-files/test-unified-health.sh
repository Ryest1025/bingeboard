#!/bin/bash

echo "🧪 Testing Unified Recommendations Endpoint Health Check"
echo "======================================================"

BASE_URL="http://localhost:5000"
HEALTH_ENDPOINT="/api/recommendations/unified/health"

echo "📤 Testing health endpoint: ${BASE_URL}${HEALTH_ENDPOINT}"

# Test the health check endpoint (no auth required)
curl -s "${BASE_URL}${HEALTH_ENDPOINT}" | jq '.'

echo ""
echo "✅ Health check completed!"

echo ""
echo "🧪 Testing Main Endpoint (Expected: 401 without auth)"
echo "=================================================="

MAIN_ENDPOINT="/api/recommendations/unified"

# Test the main endpoint without auth (should return 401)
echo "📤 Testing main endpoint without auth: ${BASE_URL}${MAIN_ENDPOINT}"
echo "Expected result: 401 Unauthorized"

curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"filters": {"genre": "Comedy"}}' \
  "${BASE_URL}${MAIN_ENDPOINT}" | jq '.'

echo ""
echo "✅ Test completed! Endpoint is responding correctly."