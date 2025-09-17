#!/bin/bash
# Usage: ./setup_postgres.sh

# Exit immediately if a command fails
set -e

echo "🐘 Setting up PostgreSQL for BingeBoard..."

# Non-interactive password change for Postgres
sudo -i -u postgres bash -c "psql -c \"ALTER USER postgres PASSWORD 'Binge1025';\""

# Create dev database if not exists
sudo -i -u postgres bash -c "psql -c \"CREATE DATABASE IF NOT EXISTS bingeboard;\"" 2>/dev/null || {
    echo "Database 'bingeboard' might already exist, attempting to create anyway..."
    sudo -i -u postgres bash -c "psql -c \"CREATE DATABASE bingeboard;\"" 2>/dev/null || true
}

echo "✅ PostgreSQL user/password updated and database 'bingeboard' created."
echo "Test connection: psql -U postgres -W -h localhost"
echo ""
echo "📝 Add this to your .env file:"
echo "DATABASE_URL=postgresql://postgres:Binge1025@localhost:5432/bingeboard"