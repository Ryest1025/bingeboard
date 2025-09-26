#!/bin/bash

# Component Cleanup Script
# Removes backup files, duplicates, and ensures component consistency

echo "🧹 Starting component cleanup..."

# Remove backup and temporary files
echo "🗑️  Removing backup and temporary files..."
find client/src/components -name "*.backup" -type f -delete
find client/src/components -name "*.old" -type f -delete  
find client/src/components -name "*.temp" -type f -delete
find client/src/components -name "*.bak" -type f -delete
find client/src/components -name "*-backup.*" -type f -delete
find client/src/components -name "*-old.*" -type f -delete
find client/src/components -name "*-temp.*" -type f -delete
find client/src/components -name "*_backup.*" -type f -delete

# Remove common duplicate patterns
echo "🔍 Looking for duplicate components..."

# Check for StreamingLogos duplicates
STREAMING_LOGOS_FILES=$(find client/src -name "*streaming*logo*" -type f | grep -v "client/src/components/streaming-logos.tsx")
if [ ! -z "$STREAMING_LOGOS_FILES" ]; then
    echo "⚠️  Found potential StreamingLogos duplicates:"
    echo "$STREAMING_LOGOS_FILES"
    echo "   Please review these files and remove duplicates manually"
fi

# Check for component files with version numbers
VERSION_FILES=$(find client/src/components -name "*-v[0-9]*" -o -name "*_v[0-9]*" -type f)
if [ ! -z "$VERSION_FILES" ]; then
    echo "⚠️  Found versioned component files:"
    echo "$VERSION_FILES"
    echo "   Please review and consolidate these versions"
fi

# Check for index files that might be outdated
echo "📋 Checking component index files..."
if [ -f "client/src/components/ui/index.ts" ]; then
    echo "   Found ui/index.ts - ensure it exports canonical components"
fi

# Clean up empty directories
echo "📁 Removing empty directories..."
find client/src/components -type d -empty -delete 2>/dev/null || true

# Run component audit
echo "🔍 Running component audit..."
if command -v node >/dev/null 2>&1; then
    node scripts/audit-components.cjs || echo "⚠️  Component audit found issues (see above)"
else
    echo "⚠️  Node.js not found, skipping automatic audit"
fi

echo "✅ Component cleanup completed!"
echo ""
echo "📝 Next steps:"
echo "   1. Review any duplicate files mentioned above"
echo "   2. Update imports to use @/components/... paths"
echo "   3. Run 'npm run components:check' to verify consistency"
echo "   4. Commit changes to lock in the cleaned structure"