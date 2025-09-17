#!/bin/bash

# Test the new unified recommendations endpoint
echo "🧪 Testing Unified Recommendations Endpoint"
echo "========================================="

# Set up test variables
BASE_URL="http://localhost:5000"
ENDPOINT="/api/recommendations/unified"

# Test payload with filters
TEST_PAYLOAD='{
  "filters": {
    "genre": "Drama",
    "year": "2023",
    "platform": "netflix",
    "rating": "7.0",
    "hideWatched": true
  },
  "userProfile": {
    "favoriteGenres": ["Drama", "Thriller", "Crime"],
    "preferredNetworks": ["netflix", "hbo"],
    "viewingHistory": [
      {"tmdbId": 1399, "title": "Game of Thrones"},
      {"tmdbId": 66732, "title": "Stranger Things"}
    ],
    "watchlist": [
      {"tmdbId": 85552, "title": "Euphoria"}
    ]
  },
  "limit": 10
}'

echo "📤 Sending test request to: ${BASE_URL}${ENDPOINT}"
echo "📋 Test payload:"
echo "$TEST_PAYLOAD" | jq '.'

echo ""
echo "📥 Response:"

# Make the request and format the response
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d "$TEST_PAYLOAD" \
  "${BASE_URL}${ENDPOINT}" | jq '.'

echo ""
echo "🔍 Testing health endpoint:"
curl -s "${BASE_URL}${ENDPOINT}/health" | jq '.'

echo ""
echo "✅ Test completed!"