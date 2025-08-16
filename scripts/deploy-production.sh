#!/bin/bash

# Winky-Coder Production Deployment Script
# This script handles production deployment with comprehensive safety checks

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="winky-coder"
PRODUCTION_URL="https://winky-coder.com"
STAGING_URL="https://staging.winky-coder.com"
BACKUP_DIR="/backups/winky-coder"
LOG_FILE="/var/log/winky-coder/deployment.log"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root or with sudo
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root"
    fi
}

# Validate environment
validate_environment() {
    log "Validating deployment environment..."
    
    # Check required environment variables
    required_vars=(
        "DATABASE_URL"
        "REDIS_URL"
        "JWT_SECRET"
        "AWS_ACCESS_KEY_ID"
        "AWS_SECRET_ACCESS_KEY"
        "S3_BUCKET"
        "GEMINI_API_KEY"
        "OPENROUTER_API_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error "Required environment variable $var is not set"
        fi
    done
    
    # Check required tools
    required_tools=("docker" "node" "npm" "git" "curl")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            error "Required tool $tool is not installed"
        fi
    done
    
    success "Environment validation passed"
}

# Create backup
create_backup() {
    log "Creating production backup..."
    
    BACKUP_TIMESTAMP=$(date +'%Y%m%d_%H%M%S')
    BACKUP_PATH="$BACKUP_DIR/backup_$BACKUP_TIMESTAMP"
    
    mkdir -p "$BACKUP_PATH"
    
    # Database backup
    log "Creating database backup..."
    pg_dump "$DATABASE_URL" > "$BACKUP_PATH/database.sql"
    
    # File backup
    log "Creating file backup..."
    aws s3 sync "s3://$S3_BUCKET" "$BACKUP_PATH/files/"
    
    # Configuration backup
    log "Creating configuration backup..."
    cp .env "$BACKUP_PATH/"
    cp docker-compose.yml "$BACKUP_PATH/"
    
    success "Backup created at $BACKUP_PATH"
}

# Run pre-deployment tests
run_pre_deployment_tests() {
    log "Running pre-deployment tests..."
    
    # Unit tests
    log "Running unit tests..."
    npm run test:unit || error "Unit tests failed"
    
    # Integration tests
    log "Running integration tests..."
    npm run test:integration || error "Integration tests failed"
    
    # Security tests
    log "Running security tests..."
    npm run test:security || error "Security tests failed"
    
    # Performance tests
    log "Running performance tests..."
    npm run test:performance || error "Performance tests failed"
    
    success "All pre-deployment tests passed"
}

# Deploy to staging first
deploy_to_staging() {
    log "Deploying to staging environment..."
    
    # Build and deploy to staging
    npm run build
    npm run deploy:staging
    
    # Wait for staging deployment
    log "Waiting for staging deployment to complete..."
    sleep 60
    
    # Run staging smoke tests
    log "Running staging smoke tests..."
    npm run test:smoke:staging || error "Staging smoke tests failed"
    
    success "Staging deployment successful"
}

# Deploy to production
deploy_to_production() {
    log "Deploying to production environment..."
    
    # Check if user confirms production deployment
    echo -e "${YELLOW}Are you sure you want to deploy to production? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log "Production deployment cancelled by user"
        exit 0
    fi
    
    # Deploy to production
    npm run deploy:production
    
    # Wait for production deployment
    log "Waiting for production deployment to complete..."
    sleep 120
    
    success "Production deployment completed"
}

# Run post-deployment verification
run_post_deployment_verification() {
    log "Running post-deployment verification..."
    
    # Health check
    log "Checking production health..."
    if ! curl -f "$PRODUCTION_URL/health" > /dev/null 2>&1; then
        error "Production health check failed"
    fi
    
    # Smoke tests
    log "Running production smoke tests..."
    npm run test:smoke:production || error "Production smoke tests failed"
    
    # Performance verification
    log "Running performance verification..."
    npm run test:verification:production || error "Performance verification failed"
    
    success "Post-deployment verification passed"
}

# Create release
create_release() {
    log "Creating production release..."
    
    # Get current version
    VERSION=$(node -p "require('./package.json').version")
    RELEASE_TAG="v$VERSION"
    
    # Create Git tag
    git tag -a "$RELEASE_TAG" -m "Production release $RELEASE_TAG"
    git push origin "$RELEASE_TAG"
    
    # Create GitHub release
    gh release create "$RELEASE_TAG" \
        --title "Production Release $RELEASE_TAG" \
        --notes "Production deployment completed successfully" \
        --target main
    
    success "Release $RELEASE_TAG created"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up production monitoring..."
    
    # Configure alerts
    npm run monitoring:setup:alerts
    
    # Setup dashboards
    npm run monitoring:setup:dashboards
    
    success "Production monitoring configured"
}

# Rollback function
rollback() {
    log "Initiating rollback..."
    
    # Get latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/backup_* | head -n1)
    
    if [[ -z "$LATEST_BACKUP" ]]; then
        error "No backup found for rollback"
    fi
    
    log "Rolling back to backup: $LATEST_BACKUP"
    
    # Restore database
    log "Restoring database..."
    psql "$DATABASE_URL" < "$LATEST_BACKUP/database.sql"
    
    # Restore files
    log "Restoring files..."
    aws s3 sync "$LATEST_BACKUP/files/" "s3://$S3_BUCKET"
    
    # Restore configuration
    log "Restoring configuration..."
    cp "$LATEST_BACKUP/.env" .
    cp "$LATEST_BACKUP/docker-compose.yml" .
    
    # Redeploy
    log "Redeploying with backup..."
    npm run deploy:production
    
    success "Rollback completed successfully"
}

# Main deployment function
main() {
    log "Starting Winky-Coder production deployment..."
    
    # Check permissions
    check_permissions
    
    # Validate environment
    validate_environment
    
    # Create backup
    create_backup
    
    # Run pre-deployment tests
    run_pre_deployment_tests
    
    # Deploy to staging
    deploy_to_staging
    
    # Deploy to production
    deploy_to_production
    
    # Run post-deployment verification
    run_post_deployment_verification
    
    # Create release
    create_release
    
    # Setup monitoring
    setup_monitoring
    
    success "Production deployment completed successfully!"
    
    log "Deployment Summary:"
    log "- Production URL: $PRODUCTION_URL"
    log "- Backup Location: $BACKUP_PATH"
    log "- Release Tag: $RELEASE_TAG"
    log "- Log File: $LOG_FILE"
}

# Handle errors
trap 'error "Deployment failed. Check logs at $LOG_FILE"' ERR

# Parse command line arguments
case "${1:-}" in
    "rollback")
        rollback
        ;;
    "backup")
        create_backup
        ;;
    "test")
        run_pre_deployment_tests
        ;;
    "staging")
        deploy_to_staging
        ;;
    "verify")
        run_post_deployment_verification
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  (no args)  Full production deployment"
        echo "  rollback   Rollback to latest backup"
        echo "  backup     Create backup only"
        echo "  test       Run pre-deployment tests"
        echo "  staging    Deploy to staging only"
        echo "  verify     Run post-deployment verification"
        echo "  help       Show this help message"
        ;;
    "")
        main
        ;;
    *)
        error "Unknown command: $1"
        ;;
esac