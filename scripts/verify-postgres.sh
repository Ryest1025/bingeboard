#!/bin/bash

# PostgreSQL Connection Verification Script
# Quick test to verify PostgreSQL setup is working

set -e

# Configuration
POSTGRES_PASSWORD="Binge1025"
DATABASE_NAME="bingeboard"
DATABASE_USER="bingeboard_user"
DATABASE_USER_PASSWORD="Binge1025"

echo "🔍 Verifying PostgreSQL setup..."

# Test 1: Connect as postgres user
echo -n "Testing postgres user connection... "
if PGPASSWORD="$POSTGRES_PASSWORD" psql -U postgres -h localhost -c "SELECT version();" -t -A &>/dev/null; then
    echo "✅ SUCCESS"
else
    echo "❌ FAILED"
    exit 1
fi

# Test 2: Connect as application user
echo -n "Testing application user connection... "
if PGPASSWORD="$DATABASE_USER_PASSWORD" psql -U "$DATABASE_USER" -h localhost -d "$DATABASE_NAME" -c "SELECT 1;" -t -A &>/dev/null; then
    echo "✅ SUCCESS"
else
    echo "❌ FAILED"
    exit 1
fi

# Test 3: Check database exists
echo -n "Verifying database exists... "
if PGPASSWORD="$POSTGRES_PASSWORD" psql -U postgres -h localhost -lqt | cut -d \| -f 1 | grep -qw "$DATABASE_NAME"; then
    echo "✅ SUCCESS"
else
    echo "❌ FAILED"
    exit 1
fi

echo ""
echo "🎉 All PostgreSQL tests passed!"
echo ""
echo "📝 Connection details:"
echo "Database URL: postgresql://$DATABASE_USER:$DATABASE_USER_PASSWORD@localhost:5432/$DATABASE_NAME"
echo ""
echo "🚀 Ready to use with Bingeboard!"