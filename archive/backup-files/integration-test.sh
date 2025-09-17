#!/bin/bash
# integration-test.sh - Basic integration test script for BingeBoard API endpoints
# Usage: ./integration-test.sh [host] [port]
# Example: ./integration-test.sh localhost 5000

set -e

# Configuration
HOST="${1:-localhost}"
PORT="${2:-5000}"
BASE_URL="http://${HOST}:${PORT}"
TIMEOUT=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED_TESTS++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Test helper function
test_endpoint() {
    local method="$1"
    local endpoint="$2"
    local expected_status="$3"
    local description="$4"
    local data="$5"
    
    ((TOTAL_TESTS++))
    log_info "Testing: $description"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            --max-time $TIMEOUT \
            "${BASE_URL}${endpoint}" 2>/dev/null || echo -e "\n000")
    else
        response=$(curl -s -w "\n%{http_code}" \
            --max-time $TIMEOUT \
            "${BASE_URL}${endpoint}" 2>/dev/null || echo -e "\n000")
    fi
    
    # Split response body and status code
    body=$(echo "$response" | head -n -1)
    status=$(echo "$response" | tail -n 1)
    
    if [ "$status" = "$expected_status" ]; then
        log_success "$method $endpoint -> $status (Expected: $expected_status)"
        
        # Additional validation for JSON responses
        if [ "$expected_status" = "200" ] && echo "$body" | jq . >/dev/null 2>&1; then
            log_info "  ✓ Valid JSON response"
        fi
        
        return 0
    else
        log_error "$method $endpoint -> $status (Expected: $expected_status)"
        if [ -n "$body" ] && [ ${#body} -lt 500 ]; then
            log_error "  Response: $body"
        fi
        return 1
    fi
}

# Start tests
echo "==========================================="
echo "BingeBoard API Integration Tests"
echo "==========================================="
echo "Target: $BASE_URL"
echo "Timeout: ${TIMEOUT}s"
echo ""

# Check if server is running
log_info "Checking if server is responding..."
if ! curl -s --max-time 3 "$BASE_URL" >/dev/null; then
    log_error "Server at $BASE_URL is not responding"
    log_error "Please ensure the server is running with: npm run dev"
    exit 1
fi

log_success "Server is responding"
echo ""

# Test 1: Health Check
log_info "=== Core Health Checks ==="
test_endpoint "GET" "/api/health" "200" "Health check endpoint"

# Test 2: Genres endpoints
log_info "=== Genres API ==="
test_endpoint "GET" "/api/content/genres-combined/list" "200" "Combined genres endpoint"
test_endpoint "GET" "/api/genres/combined" "200" "Global genres alias"

# Test 3: Enhanced search endpoints
log_info "=== Enhanced Search API ==="
test_endpoint "GET" "/api/streaming/enhanced-search?query=breaking%20bad&type=multi" "200" "Enhanced search GET with query"
test_endpoint "POST" "/api/streaming/enhanced-search" "200" "Enhanced search POST with filters" \
    '{"type": "tv", "includeStreaming": true, "genres": [], "sortBy": "popularity.desc"}'

# Test 4: Debug endpoints
log_info "=== Debug Endpoints ==="
test_endpoint "GET" "/api/debug/echo-cookies" "200" "Debug cookies echo endpoint"
test_endpoint "POST" "/api/debug/user-by-email" "400" "Debug user by email (missing email)"
test_endpoint "GET" "/api/debug/streaming-sources?tmdbId=1399&title=Game%20of%20Thrones&mediaType=tv" "200" "Debug streaming sources breakdown"

# Test 5: TMDB endpoints
log_info "=== TMDB API ==="
test_endpoint "GET" "/api/tmdb/trending?mediaType=tv&timeWindow=week" "200" "TMDB trending endpoint"
test_endpoint "GET" "/api/tmdb/search?query=game&type=multi" "200" "TMDB search endpoint"

# Test 6: Content discovery
log_info "=== Content Discovery ==="
test_endpoint "GET" "/api/tmdb/discover/tv?sort_by=popularity.desc" "200" "TMDB discover TV"
test_endpoint "GET" "/api/tmdb/discover/movie?sort_by=popularity.desc" "200" "TMDB discover movies"

# Test 7: Auth endpoints (should work without auth)
log_info "=== Authentication ==="
test_endpoint "GET" "/api/auth/session" "401" "Session check (unauthenticated)"
test_endpoint "POST" "/api/auth/login" "400" "Login endpoint (missing credentials)"

# Test 8: Multi-API trailer aggregation
log_info "=== Multi-API Features ==="
test_endpoint "GET" "/api/multi-api/trailer/tv/1399?title=Game%20of%20Thrones" "200" "Multi-API trailer aggregation"

# Test 9: Comprehensive streaming availability
log_info "=== Streaming Availability ==="
test_endpoint "GET" "/api/streaming/comprehensive/tv/1399?title=Game%20of%20Thrones" "200" "Comprehensive streaming availability"
test_endpoint "POST" "/api/streaming/batch-availability" "200" "Batch streaming availability" \
    '{"items": [{"tmdbId": 1399, "title": "Game of Thrones", "mediaType": "tv"}]}'

# Test 10: Error handling
log_info "=== Error Handling ==="
test_endpoint "GET" "/api/nonexistent-endpoint" "404" "Non-existent endpoint"
test_endpoint "GET" "/api/streaming/enhanced-search?query=" "200" "Enhanced search with empty query"

# Performance test - measure response time for enhanced search
log_info "=== Performance Check ==="
start_time=$(date +%s%N)
curl -s "${BASE_URL}/api/streaming/enhanced-search?query=avengers&type=multi" >/dev/null
end_time=$(date +%s%N)
duration=$((($end_time - $start_time) / 1000000)) # Convert to milliseconds

if [ $duration -lt 5000 ]; then
    log_success "Enhanced search response time: ${duration}ms (< 5s)"
    ((PASSED_TESTS++))
else
    log_warning "Enhanced search response time: ${duration}ms (>= 5s)"
fi
((TOTAL_TESTS++))

# Summary
echo ""
echo "==========================================="
echo "Test Summary"
echo "==========================================="
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"

if [ $FAILED_TESTS -eq 0 ]; then
    log_success "All tests passed! ✅"
    echo ""
    echo "The BingeBoard API is functioning correctly."
    echo "Key endpoints are responding as expected."
    exit 0
else
    log_error "$FAILED_TESTS test(s) failed ❌"
    echo ""
    echo "Some endpoints may need attention."
    echo "Check the server logs for more details."
    exit 1
fi
