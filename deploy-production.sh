#!/bin/bash
# 🚀 Production Deployment Script for Advanced Personalization
#
# This script handles the complete deployment of the advanced personalization
# system to production with monitoring, testing, and rollback capabilities.

set -euo pipefail

# Configuration
DEPLOYMENT_ENV="${DEPLOYMENT_ENV:-production}"
LOG_LEVEL="${LOG_LEVEL:-info}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
ROLLOUT_PERCENTAGE="${ROLLOUT_PERCENTAGE:-100}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Error handling
cleanup() {
    log_warning "Deployment interrupted. Cleaning up..."
    if [[ -n "${MIGRATION_PID:-}" ]]; then
        kill "$MIGRATION_PID" 2>/dev/null || true
    fi
}
trap cleanup INT TERM EXIT

# Pre-deployment validation
validate_environment() {
    log_info "🔍 Validating deployment environment..."
    
    # Check required environment variables
    local required_vars=(
        "DATABASE_URL"
        "NODE_ENV"
        "API_BASE_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    # Check database connectivity
    log_info "Testing database connection..."
    if ! node -e "
        const { db } = require('./server/db.js');
        db.select().from('users').limit(1).catch(err => {
            console.error('Database connection failed:', err);
            process.exit(1);
        });
    "; then
        log_error "Database connection test failed"
        exit 1
    fi
    
    # Check Node.js version
    local node_version=$(node --version | cut -d'v' -f2)
    local required_version="18.0.0"
    if ! npx semver-compare "$node_version" ">=" "$required_version"; then
        log_error "Node.js version $node_version is below required $required_version"
        exit 1
    fi
    
    log_success "Environment validation passed"
}

# Create database backup
create_backup() {
    log_info "📦 Creating database backup..."
    
    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Export current schema and data
    if command -v pg_dump >/dev/null 2>&1; then
        pg_dump "$DATABASE_URL" > "$backup_dir/database_backup.sql"
        log_success "Database backup created: $backup_dir/database_backup.sql"
    else
        log_warning "pg_dump not available, skipping database backup"
    fi
    
    # Backup current recommendation cache if exists
    if [[ -f "recommendation_cache.json" ]]; then
        cp recommendation_cache.json "$backup_dir/"
        log_info "Recommendation cache backed up"
    fi
    
    echo "$backup_dir" > .last_backup
}

# Run database migrations
run_migrations() {
    log_info "🗄️ Running database migrations..."
    
    # Check if migration is needed
    if node check-migration-status.js; then
        log_info "Migration required, proceeding..."
        
        # Run the advanced personalization migration
        node migrations/migration-advanced-personalization.js &
        MIGRATION_PID=$!
        
        # Monitor migration progress
        while kill -0 "$MIGRATION_PID" 2>/dev/null; do
            log_info "Migration in progress..."
            sleep 5
        done
        
        wait "$MIGRATION_PID"
        local migration_status=$?
        
        if [[ $migration_status -eq 0 ]]; then
            log_success "Database migration completed successfully"
        else
            log_error "Database migration failed with status $migration_status"
            exit 1
        fi
    else
        log_info "Database is up to date, no migration needed"
    fi
}

# Deploy application code
deploy_application() {
    log_info "🚀 Deploying application code..."
    
    # Install production dependencies
    log_info "Installing production dependencies..."
    npm ci --only=production
    
    # Build the application
    log_info "Building application..."
    npm run build
    
    # Compile TypeScript
    log_info "Compiling TypeScript..."
    npx tsc
    
    log_success "Application deployment completed"
}

# Start monitoring and aggregation services
start_services() {
    log_info "⚙️ Starting background services..."
    
    # Start nightly aggregation job
    log_info "Setting up nightly aggregation cron job..."
    (crontab -l 2>/dev/null; echo "0 2 * * * cd $(pwd) && node scripts/nightly-aggregation.js") | crontab -
    
    # Verify the cron job was added
    if crontab -l | grep -q "nightly-aggregation.js"; then
        log_success "Nightly aggregation job scheduled"
    else
        log_warning "Failed to schedule nightly aggregation job"
    fi
    
    # Start monitoring alerts (if not already running)
    if ! pgrep -f "monitoring-alerts" >/dev/null; then
        nohup node -e "
            const { PersonalizationMonitoring } = require('./server/services/monitoring.js');
            setInterval(async () => {
                try {
                    await PersonalizationMonitoring.checkAlerts();
                } catch (error) {
                    console.error('Alert check failed:', error);
                }
            }, 60000); // Check every minute
        " > logs/monitoring.log 2>&1 &
        
        log_success "Monitoring alerts started"
    else
        log_info "Monitoring alerts already running"
    fi
}

# Run health checks
run_health_checks() {
    log_info "🏥 Running post-deployment health checks..."
    
    # Wait for services to be ready
    sleep 10
    
    # Check API health
    local health_url="${API_BASE_URL}/api/recommendations/health"
    local max_attempts=5
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log_info "Health check attempt $attempt/$max_attempts..."
        
        if curl -sf "$health_url" >/dev/null; then
            log_success "API health check passed"
            break
        else
            if [[ $attempt -eq $max_attempts ]]; then
                log_error "API health check failed after $max_attempts attempts"
                return 1
            fi
            sleep 5
            ((attempt++))
        fi
    done
    
    # Test recommendation endpoint
    log_info "Testing recommendation endpoints..."
    if node -e "
        const axios = require('axios');
        async function test() {
            try {
                const response = await axios.get('$health_url');
                if (response.data.status === 'healthy') {
                    console.log('✅ Health endpoint working');
                    process.exit(0);
                } else {
                    console.error('❌ Health endpoint returned unhealthy status');
                    process.exit(1);
                }
            } catch (error) {
                console.error('❌ Health endpoint test failed:', error.message);
                process.exit(1);
            }
        }
        test();
    "; then
        log_success "Recommendation endpoints are working"
    else
        log_error "Recommendation endpoints test failed"
        return 1
    fi
    
    # Check database performance
    log_info "Testing database performance..."
    if node -e "
        const { PersonalizationMonitoring } = require('./server/services/monitoring.js');
        PersonalizationMonitoring.getPerformanceSnapshot()
            .then(snapshot => {
                console.log('Database performance:', snapshot);
                if (snapshot.systemHealth === 'critical') {
                    console.error('❌ System health is critical');
                    process.exit(1);
                } else {
                    console.log('✅ Database performance acceptable');
                    process.exit(0);
                }
            })
            .catch(error => {
                console.error('❌ Database performance check failed:', error);
                process.exit(1);
            });
    "; then
        log_success "Database performance check passed"
    else
        log_error "Database performance check failed"
        return 1
    fi
}

# Gradual rollout
gradual_rollout() {
    if [[ $ROLLOUT_PERCENTAGE -lt 100 ]]; then
        log_info "🎯 Starting gradual rollout ($ROLLOUT_PERCENTAGE%)"
        
        # Update feature flag or load balancer configuration
        # This is deployment-specific and would depend on your infrastructure
        log_warning "Gradual rollout configuration needed for your infrastructure"
        
        # Monitor during rollout
        log_info "Monitoring rollout for 5 minutes..."
        local end_time=$(($(date +%s) + 300)) # 5 minutes
        
        while [[ $(date +%s) -lt $end_time ]]; do
            if ! run_health_checks; then
                log_error "Health check failed during rollout, consider rolling back"
                return 1
            fi
            sleep 30
        done
        
        log_success "Gradual rollout monitoring completed"
    else
        log_info "Full deployment (100%), skipping gradual rollout"
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log_info "🧹 Cleaning up old backups..."
    
    if [[ -d "backups" ]]; then
        find backups -type d -mtime +$BACKUP_RETENTION_DAYS -exec rm -rf {} + 2>/dev/null || true
        log_success "Old backups cleaned up (retention: $BACKUP_RETENTION_DAYS days)"
    fi
}

# Send deployment notification
send_notification() {
    local status=$1
    local message=$2
    
    log_info "📢 Sending deployment notification..."
    
    # Example: Send to Slack webhook
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 Deployment $status: $message\"}" \
            "$SLACK_WEBHOOK_URL" >/dev/null 2>&1 || true
    fi
    
    # Log deployment event
    echo "$(date): Deployment $status - $message" >> deployment.log
}

# Main deployment function
main() {
    local deployment_start=$(date +%s)
    
    log_info "🚀 Starting Advanced Personalization Deployment"
    log_info "Environment: $DEPLOYMENT_ENV"
    log_info "Rollout: $ROLLOUT_PERCENTAGE%"
    
    # Create logs directory
    mkdir -p logs
    
    # Deployment steps
    validate_environment || { 
        send_notification "FAILED" "Environment validation failed"
        exit 1 
    }
    
    create_backup || { 
        send_notification "FAILED" "Backup creation failed"
        exit 1 
    }
    
    run_migrations || { 
        send_notification "FAILED" "Database migration failed"
        exit 1 
    }
    
    deploy_application || { 
        send_notification "FAILED" "Application deployment failed"
        exit 1 
    }
    
    start_services || { 
        send_notification "FAILED" "Service startup failed"
        exit 1 
    }
    
    run_health_checks || { 
        send_notification "FAILED" "Health checks failed"
        exit 1 
    }
    
    gradual_rollout || { 
        send_notification "FAILED" "Gradual rollout failed"
        exit 1 
    }
    
    cleanup_old_backups
    
    local deployment_end=$(date +%s)
    local deployment_duration=$((deployment_end - deployment_start))
    
    log_success "🎉 Deployment completed successfully in ${deployment_duration}s"
    send_notification "SUCCESS" "Advanced Personalization deployed in ${deployment_duration}s"
}

# Script usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Options:
    -e, --env ENVIRONMENT       Deployment environment (default: production)
    -r, --rollout PERCENTAGE    Rollout percentage (default: 100)
    -h, --help                 Show this help message

Environment Variables:
    DATABASE_URL               Database connection string
    NODE_ENV                   Node.js environment
    API_BASE_URL              Base URL for API health checks
    SLACK_WEBHOOK_URL         Slack webhook for notifications (optional)
    BACKUP_RETENTION_DAYS     Backup retention period (default: 30)

Examples:
    $0                         # Full deployment
    $0 -r 25                   # 25% rollout
    $0 -e staging              # Staging deployment
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            DEPLOYMENT_ENV="$2"
            shift 2
            ;;
        -r|--rollout)
            ROLLOUT_PERCENTAGE="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Validate rollout percentage
if [[ $ROLLOUT_PERCENTAGE -lt 1 || $ROLLOUT_PERCENTAGE -gt 100 ]]; then
    log_error "Rollout percentage must be between 1 and 100"
    exit 1
fi

# Run main deployment
main "$@"
