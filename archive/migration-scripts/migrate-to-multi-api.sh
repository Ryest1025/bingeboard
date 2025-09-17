#!/bin/bash

# 🚀 BingeBoard Multi-API Migration Executor
# This script provides an easy interface to run the multi-API migration

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_colored() {
    echo -e "${1}${2}${NC}"
}

print_colored $CYAN "🚀 BingeBoard Multi-API Migration System"
print_colored $BLUE "=================================================="

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    print_colored $RED "❌ Node.js is required but not installed. Please install Node.js first."
    exit 1
fi

# Check if the migration script exists
if [ ! -f "migrate-to-multi-api.js" ]; then
    print_colored $RED "❌ Migration script not found. Please ensure migrate-to-multi-api.js is in the current directory."
    exit 1
fi

# Check if the config file exists
if [ ! -f "migration-config.json" ]; then
    print_colored $YELLOW "⚠️  Migration config not found. Using default settings."
fi

# Check if MultiAPIStreamingService exists
if [ ! -f "server/services/multiAPIStreamingService.ts" ]; then
    print_colored $RED "❌ MultiAPIStreamingService not found. Please ensure the Multi-API service is available."
    print_colored $BLUE "   Expected location: server/services/multiAPIStreamingService.ts"
    exit 1
fi

print_colored $GREEN "✅ Pre-flight checks passed!"
echo

# Show migration options
print_colored $YELLOW "Migration Options:"
echo "1. 🚀 Run Full Migration (Recommended)"
echo "2. 🔍 Check Migration Status"
echo "3. 🔄 Rollback Previous Migration"
echo "4. 📋 View Migration Config"
echo "5. 🧪 Test Multi-API Endpoints"
echo "6. ❌ Exit"
echo

# Read user choice
read -p "$(print_colored $CYAN "Select an option (1-6): ")" choice

case $choice in
    1)
        print_colored $YELLOW "🚀 Starting Full Multi-API Migration..."
        echo
        
        # Confirm migration
        read -p "$(print_colored $YELLOW "⚠️  This will modify multiple files. Continue? (y/N): ")" confirm
        
        if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
            print_colored $BLUE "Migration cancelled."
            exit 0
        fi
        
        # Run the migration
        print_colored $BLUE "Executing migration script..."
        node migrate-to-multi-api.js
        
        if [ $? -eq 0 ]; then
            print_colored $GREEN "✅ Migration completed successfully!"
            echo
            print_colored $BLUE "📋 Next steps:"
            echo "   1. Review the MIGRATION_REPORT.md file"
            echo "   2. Test the application: npm run dev"
            echo "   3. Verify streaming data is working"
            echo "   4. Check affiliate link generation"
            echo
            print_colored $CYAN "🧪 Run: ./migrate-to-multi-api.sh and select option 2 to check status"
        else
            print_colored $RED "❌ Migration failed. Check the error messages above."
            exit 1
        fi
        ;;
        
    2)
        print_colored $YELLOW "🔍 Checking Migration Status..."
        echo
        
        if [ -f "migration-status-check.js" ]; then
            node migration-status-check.js
        else
            print_colored $RED "❌ Status checker not found. Run full migration first."
        fi
        ;;
        
    3)
        print_colored $YELLOW "🔄 Rollback Options..."
        echo
        
        # Look for backup directories
        backup_dirs=(migration-backup-*)
        
        if [ ${#backup_dirs[@]} -eq 0 ] || [ ! -d "${backup_dirs[0]}" ]; then
            print_colored $RED "❌ No backup directories found."
            exit 1
        fi
        
        print_colored $BLUE "Available backups:"
        for i in "${!backup_dirs[@]}"; do
            echo "  $((i+1)). ${backup_dirs[i]}"
        done
        echo
        
        read -p "$(print_colored $CYAN "Select backup to restore (1-${#backup_dirs[@]}): ")" backup_choice
        
        if [[ $backup_choice -ge 1 && $backup_choice -le ${#backup_dirs[@]} ]]; then
            selected_backup="${backup_dirs[$((backup_choice-1))]}"
            
            read -p "$(print_colored $YELLOW "⚠️  This will restore files from $selected_backup. Continue? (y/N): ")" confirm
            
            if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
                if [ -f "migration-rollback.js" ]; then
                    node migration-rollback.js "$selected_backup"
                    print_colored $GREEN "✅ Rollback completed!"
                else
                    print_colored $RED "❌ Rollback script not found."
                fi
            else
                print_colored $BLUE "Rollback cancelled."
            fi
        else
            print_colored $RED "❌ Invalid selection."
        fi
        ;;
        
    4)
        print_colored $YELLOW "📋 Migration Configuration..."
        echo
        
        if [ -f "migration-config.json" ]; then
            if command -v jq &> /dev/null; then
                cat migration-config.json | jq .
            else
                cat migration-config.json
            fi
        else
            print_colored $RED "❌ Migration config file not found."
        fi
        ;;
        
    5)
        print_colored $YELLOW "🧪 Testing Multi-API Endpoints..."
        echo
        
        # Check if server is running
        if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
            print_colored $GREEN "✅ Server is running on localhost:5000"
            
            # Test enhanced search endpoint
            print_colored $BLUE "Testing enhanced search endpoint..."
            response=$(curl -s "http://localhost:5000/api/streaming/enhanced-search?query=Game+of+Thrones&type=tv" || echo "FAILED")
            
            if [[ "$response" == "FAILED" ]] || [[ "$response" == *"error"* ]]; then
                print_colored $RED "❌ Enhanced search endpoint failed"
            else
                print_colored $GREEN "✅ Enhanced search endpoint working"
            fi
            
            # Test comprehensive streaming endpoint
            print_colored $BLUE "Testing comprehensive streaming endpoint..."
            response=$(curl -s "http://localhost:5000/api/streaming/comprehensive/tv/1399?title=Game%20of%20Thrones" || echo "FAILED")
            
            if [[ "$response" == "FAILED" ]] || [[ "$response" == *"error"* ]]; then
                print_colored $RED "❌ Comprehensive streaming endpoint failed"
            else
                print_colored $GREEN "✅ Comprehensive streaming endpoint working"
            fi
            
        else
            print_colored $RED "❌ Server is not running on localhost:5000"
            print_colored $BLUE "   Start the server with: npm run dev"
        fi
        ;;
        
    6)
        print_colored $BLUE "👋 Goodbye!"
        exit 0
        ;;
        
    *)
        print_colored $RED "❌ Invalid option. Please select 1-6."
        exit 1
        ;;
esac

echo
print_colored $CYAN "🎉 Operation completed!"
