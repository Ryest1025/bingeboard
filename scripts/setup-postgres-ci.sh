#!/bin/bash

# PostgreSQL Setup Script - CI/CD Pipeline Ready
# Zero-interaction setup for automated environments

set -euo pipefail  # Strict error handling

# Configuration from environment or defaults
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-Binge1025}"
DATABASE_NAME="${DATABASE_NAME:-bingeboard}"
DATABASE_USER="${DATABASE_USER:-bingeboard_user}"
DATABASE_USER_PASSWORD="${DATABASE_USER_PASSWORD:-Binge1025}"

# Silent execution - no output unless there's an error
exec_silent() {
    "$@" &>/dev/null || {
        echo "ERROR: Command failed: $*" >&2
        exit 1
    }
}

# CI/CD friendly PostgreSQL setup
setup_postgres_ci() {
    # Ensure PostgreSQL is running
    sudo systemctl start postgresql 2>/dev/null || true
    
    # Set postgres user password (one-liner, no interaction)
    sudo -i -u postgres bash -c "psql -c \"ALTER USER postgres PASSWORD '$POSTGRES_PASSWORD';\""
    
    # Create database and user (ignore if exists)
    sudo -i -u postgres bash -c "psql -c \"CREATE DATABASE $DATABASE_NAME;\"" 2>/dev/null || true
    sudo -i -u postgres bash -c "psql -c \"CREATE USER $DATABASE_USER WITH PASSWORD '$DATABASE_USER_PASSWORD';\"" 2>/dev/null || true
    sudo -i -u postgres bash -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE $DATABASE_NAME TO $DATABASE_USER;\""
    sudo -i -u postgres bash -c "psql -c \"ALTER USER $DATABASE_USER CREATEDB;\""
    
    # Verify setup (fail fast if broken)
    PGPASSWORD="$POSTGRES_PASSWORD" psql -U postgres -h localhost -c "SELECT 1;" -t -A >/dev/null
    PGPASSWORD="$DATABASE_USER_PASSWORD" psql -U "$DATABASE_USER" -h localhost -d "$DATABASE_NAME" -c "SELECT 1;" -t -A >/dev/null
    
    # Output DATABASE_URL for CI/CD
    echo "postgresql://$DATABASE_USER:$DATABASE_USER_PASSWORD@localhost:5432/$DATABASE_NAME"
}

# Execute setup
setup_postgres_ci