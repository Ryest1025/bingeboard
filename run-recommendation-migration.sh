#!/bin/bash

# 🎯 BingeBoard Recommendation Engine - Migration Runner
# Applies the enhanced database schema for the recommendation engine
#
# Usage:
#   ./run-recommendation-migration.sh [migration-script]
#
# Examples:
#   ./run-recommendation-migration.sh                          # Uses default: migrate-recommendation-engine.js
#   ./run-recommendation-migration.sh custom-migration.js      # Uses custom migration script

# Exit on error, treat unset variables as errors, catch pipe failures
set -euo pipefail

echo "🎯 BingeBoard Recommendation Engine Migration"
echo "============================================"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed or not in PATH"
    echo "   Please install Node.js and ensure it's available in your PATH"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo "   Please set your PostgreSQL connection string:"
    echo "   export DATABASE_URL='postgresql://user:password@localhost:5432/bingeboard'"
    exit 1
fi

# Mask credentials in DATABASE_URL for safe logging
DB_SAFE=$(echo "$DATABASE_URL" | sed -E 's#(postgresql://)[^:]+:[^@]+#\1***:***#')
echo "📊 Database URL: ${DB_SAFE}"
echo ""

# Allow flexible migration script (default: migrate-recommendation-engine.js)
MIGRATION_SCRIPT=${1:-migrate-recommendation-engine.js}

# Check if migration script exists
if [ ! -f "$MIGRATION_SCRIPT" ]; then
    echo "❌ ERROR: Migration script '$MIGRATION_SCRIPT' not found"
    echo "   Please ensure the migration script exists in the current directory"
    exit 1
fi

# Run the migration
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 Running recommendation engine migration..."
echo "   Script: $MIGRATION_SCRIPT"
node "$MIGRATION_SCRIPT"

if [ $? -eq 0 ]; then
    echo ""
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Migration completed successfully!"
    echo ""
    echo "🎯 BingeBoard Recommendation Engine is ready!"
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Start your development server: npm run dev"
    echo "   2. Test the recommendation endpoints:"
    echo "      - GET /api/recommendations"
    echo "      - GET /api/recommendations/for-you"
    echo "      - GET /api/recommendations/social"
    echo "   3. Monitor performance and user engagement"
    echo ""
    echo "📖 For detailed documentation, see:"
    echo "   - RECOMMENDATION_ENGINE_README.md"
    echo "   - RECOMMENDATION_ENGINE_SCHEMA.md"
    echo ""
else
    echo ""
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Migration failed!"
    echo "   Check the error messages above and ensure:"
    echo "   - PostgreSQL is running"
    echo "   - Database credentials are correct"
    echo "   - User has necessary permissions"
    echo "   - Migration script '$MIGRATION_SCRIPT' is valid"
    echo ""
    exit 1
fi
