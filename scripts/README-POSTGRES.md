# PostgreSQL Setup for Bingeboard

This directory contains PostgreSQL setup scripts that work in any Linux dev environment, CI/CD pipelines, and Docker containers.

## 🚀 Quick Setup

### One-Line Setup (Manual)
```bash
# Set postgres user password (works anywhere, no sudoers tweaks needed)
sudo -i -u postgres bash -c "psql -c \"ALTER USER postgres PASSWORD 'Binge1025';\""

# Verify it works
PGPASSWORD='Binge1025' psql -U postgres -h localhost -c "SELECT version();"
```

### Full Automated Setup
```bash
# Run the complete setup script
./scripts/setup-postgres.sh

# Or for CI/CD environments (silent, returns DATABASE_URL)
DATABASE_URL=$(./scripts/setup-postgres-ci.sh)
echo "DATABASE_URL=$DATABASE_URL" >> .env
```

## 📁 Scripts Overview

### `setup-postgres.sh` - Interactive Development Setup
- ✅ Full setup with colored output and progress indicators
- ✅ Creates database, user, and sets all permissions
- ✅ Generates environment variables for `.env` file
- ✅ Shows connection examples
- ✅ Verifies setup before completion

```bash
./scripts/setup-postgres.sh
```

### `setup-postgres-ci.sh` - CI/CD Pipeline Ready
- ✅ Zero-interaction setup for automated environments
- ✅ Strict error handling (`set -euo pipefail`)
- ✅ Returns DATABASE_URL on success
- ✅ Configurable via environment variables
- ✅ Fails fast on any error

```bash
# Basic usage
DATABASE_URL=$(./scripts/setup-postgres-ci.sh)

# With custom configuration
POSTGRES_PASSWORD="custom123" DATABASE_NAME="myapp" ./scripts/setup-postgres-ci.sh
```

### `verify-postgres.sh` - Connection Testing
- ✅ Tests all connection types
- ✅ Verifies database and user existence
- ✅ Quick health check for debugging

```bash
./scripts/verify-postgres.sh
```

## 🔧 Configuration

All scripts use these defaults (customizable via environment variables):

```bash
POSTGRES_PASSWORD="Binge1025"          # postgres user password
DATABASE_NAME="bingeboard"             # application database name
DATABASE_USER="bingeboard_user"        # application user name
DATABASE_USER_PASSWORD="Binge1025"     # application user password
```

## 📝 Environment Variables

After setup, add these to your `.env` file:

```bash
# PostgreSQL Configuration
DATABASE_URL=postgresql://bingeboard_user:Binge1025@localhost:5432/bingeboard
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=bingeboard
POSTGRES_USER=bingeboard_user
POSTGRES_PASSWORD=Binge1025
```

## 🐳 Docker Integration

For Docker Compose, you can use these scripts in your initialization:

```yaml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: Binge1025
      POSTGRES_DB: bingeboard
      POSTGRES_USER: bingeboard_user
    volumes:
      - ./scripts/setup-postgres-ci.sh:/docker-entrypoint-initdb.d/setup.sh
```

## 🔍 Connection Examples

### Command Line
```bash
# Connect as postgres user
PGPASSWORD='Binge1025' psql -U postgres -h localhost

# Connect as application user  
PGPASSWORD='Binge1025' psql -U bingeboard_user -h localhost -d bingeboard

# Connect with URL
psql 'postgresql://bingeboard_user:Binge1025@localhost:5432/bingeboard'
```

### Node.js/TypeScript
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // or individual options:
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});
```

## 🛠️ Troubleshooting

### PostgreSQL Not Installed
```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib

# macOS
brew install postgresql
```

### Service Not Running
```bash
# Start PostgreSQL service
sudo systemctl start postgresql

# Enable on boot
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

### Permission Issues
```bash
# If you get authentication errors, the one-liner handles it:
sudo -i -u postgres bash -c "psql -c \"ALTER USER postgres PASSWORD 'Binge1025';\""

# Verify with:
PGPASSWORD='Binge1025' psql -U postgres -h localhost -c "SELECT version();"
```

### Connection Refused
```bash
# Check if PostgreSQL is listening on the right port
sudo netstat -tlnp | grep :5432

# Check PostgreSQL configuration
sudo -u postgres psql -c "SHOW listen_addresses;"
```

## 🚀 Integration with Bingeboard

Once PostgreSQL is set up, update your Bingeboard configuration:

1. Run the setup script: `./scripts/setup-postgres.sh`
2. Copy the environment variables to your `.env` file
3. Update your database configuration to use PostgreSQL instead of SQLite
4. Run your database migrations
5. Start your application

The scripts ensure everything is ready for production-scale PostgreSQL usage with proper security and permissions.