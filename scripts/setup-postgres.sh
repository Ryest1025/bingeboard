#!/bin/bash

# PostgreSQL Setup Script - CI/CD and Dev Environment Ready
# Works on any Linux dev setup without interactive prompts

set -e  # Exit on any error

echo "🐘 Setting up PostgreSQL for Bingeboard..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
POSTGRES_PASSWORD="Binge1025"
DATABASE_NAME="bingeboard"
DATABASE_USER="bingeboard_user"
DATABASE_USER_PASSWORD="Binge1025"

# Function to check if PostgreSQL is installed
check_postgres_installed() {
    if ! command -v psql &> /dev/null; then
        echo -e "${RED}❌ PostgreSQL is not installed${NC}"
        echo "Please install PostgreSQL first:"
        echo "  Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
        echo "  CentOS/RHEL: sudo yum install postgresql-server postgresql-contrib"
        echo "  macOS: brew install postgresql"
        exit 1
    fi
    echo -e "${GREEN}✅ PostgreSQL is installed${NC}"
}

# Function to check if PostgreSQL service is running
check_postgres_running() {
    if ! sudo systemctl is-active --quiet postgresql 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Starting PostgreSQL service...${NC}"
        sudo systemctl start postgresql || {
            echo -e "${RED}❌ Failed to start PostgreSQL service${NC}"
            exit 1
        }
    fi
    echo -e "${GREEN}✅ PostgreSQL service is running${NC}"
}

# Function to set postgres user password (non-interactive)
set_postgres_password() {
    echo -e "${BLUE}🔐 Setting postgres user password...${NC}"
    
    # One-line method that works on any dev setup, no sudoers tweaks needed
    sudo -i -u postgres bash -c "psql -c \"ALTER USER postgres PASSWORD '$POSTGRES_PASSWORD';\""
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PostgreSQL postgres user password set successfully${NC}"
    else
        echo -e "${RED}❌ Failed to set postgres user password${NC}"
        exit 1
    fi
}

# Function to create database and user (non-interactive)
create_database_and_user() {
    echo -e "${BLUE}🗄️  Creating database and user...${NC}"
    
    # Create database
    sudo -i -u postgres bash -c "psql -c \"CREATE DATABASE $DATABASE_NAME;\"" 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Database '$DATABASE_NAME' might already exist${NC}"
    }
    
    # Create user
    sudo -i -u postgres bash -c "psql -c \"CREATE USER $DATABASE_USER WITH PASSWORD '$DATABASE_USER_PASSWORD';\"" 2>/dev/null || {
        echo -e "${YELLOW}⚠️  User '$DATABASE_USER' might already exist${NC}"
    }
    
    # Grant privileges
    sudo -i -u postgres bash -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE $DATABASE_NAME TO $DATABASE_USER;\""
    sudo -i -u postgres bash -c "psql -c \"ALTER USER $DATABASE_USER CREATEDB;\""
    
    echo -e "${GREEN}✅ Database and user created successfully${NC}"
}

# Function to verify the setup
verify_setup() {
    echo -e "${BLUE}🔍 Verifying PostgreSQL setup...${NC}"
    
    # Test connection with postgres user
    echo -e "${YELLOW}Testing postgres user connection...${NC}"
    PGPASSWORD="$POSTGRES_PASSWORD" psql -U postgres -h localhost -c "SELECT version();" -t -A &>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PostgreSQL postgres user connection successful${NC}"
    else
        echo -e "${RED}❌ PostgreSQL postgres user connection failed${NC}"
        exit 1
    fi
    
    # Test connection with application user
    echo -e "${YELLOW}Testing application user connection...${NC}"
    PGPASSWORD="$DATABASE_USER_PASSWORD" psql -U "$DATABASE_USER" -h localhost -d "$DATABASE_NAME" -c "SELECT 1;" -t -A &>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Application user connection successful${NC}"
    else
        echo -e "${RED}❌ Application user connection failed${NC}"
        exit 1
    fi
}

# Function to generate environment variables
generate_env_vars() {
    echo -e "${BLUE}📝 Environment variables for your .env file:${NC}"
    echo ""
    echo "# PostgreSQL Configuration"
    echo "DATABASE_URL=postgresql://$DATABASE_USER:$DATABASE_USER_PASSWORD@localhost:5432/$DATABASE_NAME"
    echo "POSTGRES_HOST=localhost"
    echo "POSTGRES_PORT=5432"
    echo "POSTGRES_DB=$DATABASE_NAME"
    echo "POSTGRES_USER=$DATABASE_USER"
    echo "POSTGRES_PASSWORD=$DATABASE_USER_PASSWORD"
    echo ""
    echo -e "${GREEN}Copy these to your .env file${NC}"
}

# Function to show connection examples
show_connection_examples() {
    echo -e "${BLUE}📚 Connection Examples:${NC}"
    echo ""
    echo -e "${YELLOW}Connect as postgres user:${NC}"
    echo "PGPASSWORD='$POSTGRES_PASSWORD' psql -U postgres -h localhost"
    echo ""
    echo -e "${YELLOW}Connect as application user:${NC}"
    echo "PGPASSWORD='$DATABASE_USER_PASSWORD' psql -U $DATABASE_USER -h localhost -d $DATABASE_NAME"
    echo ""
    echo -e "${YELLOW}Connect with URL:${NC}"
    echo "psql 'postgresql://$DATABASE_USER:$DATABASE_USER_PASSWORD@localhost:5432/$DATABASE_NAME'"
}

# Main execution
main() {
    echo -e "${BLUE}🚀 Starting PostgreSQL setup for Bingeboard...${NC}"
    echo ""
    
    check_postgres_installed
    check_postgres_running
    set_postgres_password
    create_database_and_user
    verify_setup
    
    echo ""
    echo -e "${GREEN}🎉 PostgreSQL setup completed successfully!${NC}"
    echo ""
    
    generate_env_vars
    echo ""
    show_connection_examples
    
    echo ""
    echo -e "${GREEN}✅ Ready to use PostgreSQL with Bingeboard!${NC}"
}

# Run main function
main "$@"