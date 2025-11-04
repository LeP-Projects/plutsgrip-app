#!/bin/bash

# PlutusGrip API - Production Docker Management Script
# Usage: ./docker-prod.sh [command]
# WARNING: This script manages PRODUCTION environment - be careful!

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ WARNING: $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

confirm() {
    local prompt="$1"
    local response
    read -p "$(echo -e ${RED})${prompt} (yes/no): $(echo -e ${NC})" -n 3 -r response
    echo
    [[ $response =~ ^[Yy][Ee][Ss]$ ]]
}

# Pre-flight checks
check_production_safety() {
    if [ ! -f .env.production ]; then
        print_error ".env.production not found!"
        exit 1
    fi

    # Check if critical values are still placeholders
    if grep -q "CHANGE_THIS" .env.production; then
        print_error "Production environment contains placeholder values!"
        print_info "Please update .env.production with secure values before deploying."
        exit 1
    fi

    print_success "Production safety checks passed"
}

# Command functions
start_prod() {
    print_header "Starting Production Environment"
    print_warning "This will start the PRODUCTION environment"

    check_production_safety

    if ! confirm "Are you sure you want to start PRODUCTION?"; then
        print_info "Startup cancelled"
        exit 0
    fi

    docker-compose -f docker-compose.production.yml --env-file .env.production up -d

    print_success "Production environment started"
    print_info "nginx: http://localhost:80"
    print_info ""
    print_info "View logs with: ./docker-prod.sh logs"
    print_info "Check status with: ./docker-prod.sh status"
}

stop_prod() {
    print_header "Stopping Production Environment"
    print_warning "This will stop the PRODUCTION environment"

    if ! confirm "Are you sure you want to stop PRODUCTION?"; then
        print_info "Shutdown cancelled"
        exit 0
    fi

    docker-compose -f docker-compose.production.yml --env-file .env.production down
    print_success "Production environment stopped"
}

restart_prod() {
    print_header "Restarting Production Environment"
    print_warning "This will restart the PRODUCTION environment"

    if ! confirm "Are you sure you want to restart PRODUCTION?"; then
        print_info "Restart cancelled"
        exit 0
    fi

    stop_prod
    sleep 3
    start_prod
}

logs_prod() {
    print_header "Production Logs (Press Ctrl+C to exit)"
    docker-compose -f docker-compose.production.yml --env-file .env.production logs -f
}

logs_api() {
    print_header "API Service Logs Only (Press Ctrl+C to exit)"
    docker-compose -f docker-compose.production.yml --env-file .env.production logs -f api
}

logs_db() {
    print_header "Database Service Logs Only (Press Ctrl+C to exit)"
    docker-compose -f docker-compose.production.yml --env-file .env.production logs -f postgres
}

logs_nginx() {
    print_header "Nginx Service Logs Only (Press Ctrl+C to exit)"
    docker-compose -f docker-compose.production.yml --env-file .env.production logs -f nginx
}

shell_api() {
    print_header "Entering Production API Container Shell"
    docker-compose -f docker-compose.production.yml --env-file .env.production exec api bash
}

shell_db() {
    print_header "Entering Production Database Container Shell"
    docker-compose -f docker-compose.production.yml --env-file .env.production exec postgres bash
}

run_migrations() {
    print_header "Running Database Migrations (Production)"
    print_warning "This will run migrations on the PRODUCTION database"

    if ! confirm "Are you sure you want to run migrations on PRODUCTION?"; then
        print_info "Migrations cancelled"
        exit 0
    fi

    docker-compose -f docker-compose.production.yml --env-file .env.production exec api alembic upgrade head
    print_success "Migrations completed"
}

show_status() {
    print_header "Production Container Status"
    docker-compose -f docker-compose.production.yml --env-file .env.production ps
}

backup_db() {
    print_header "Backing up Production Database"

    local backup_file="backups/plutusgrip_backup_$(date +%Y%m%d_%H%M%S).sql"
    mkdir -p backups

    print_info "Creating backup: $backup_file"
    docker-compose -f docker-compose.production.yml --env-file .env.production exec -T postgres pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > "$backup_file"

    print_success "Database backed up to: $backup_file"
}

health_check() {
    print_header "Performing Health Check"

    local api_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)

    if [ "$api_health" = "200" ]; then
        print_success "API is healthy (HTTP $api_health)"
    else
        print_error "API is unhealthy (HTTP $api_health)"
        return 1
    fi
}

show_help() {
    cat << EOF
${BLUE}PlutusGrip API - Docker Production Management${NC}

${RED}⚠  WARNING: This script manages PRODUCTION environment - Be Very Careful!${NC}

${GREEN}Usage:${NC}
  ./docker-prod.sh [command]

${GREEN}Commands:${NC}
  start              Start production environment (requires confirmation)
  stop               Stop production environment (requires confirmation)
  restart            Restart production environment (requires confirmation)
  logs               View all production logs (follow mode)
  logs-api           View only API logs (follow mode)
  logs-db            View only database logs (follow mode)
  logs-nginx         View only nginx logs (follow mode)
  shell-api          Open bash shell in production API container
  shell-db           Open bash shell in production database container
  migrate            Run database migrations on production (requires confirmation)
  status             Show container status
  backup             Backup the production database
  health             Perform health check
  help               Show this help message

${GREEN}Examples:${NC}
  ./docker-prod.sh status              # Check status
  ./docker-prod.sh start               # Start production
  ./docker-prod.sh logs                # View all logs
  ./docker-prod.sh backup              # Backup database before maintenance

${RED}Important:${NC}
  - Always confirm your actions with production environment
  - Ensure .env.production has secure values (not placeholders)
  - Always backup database before running migrations
  - Monitor logs after making changes

EOF
}

# Main script logic
case "${1:-help}" in
    start)
        start_prod
        ;;
    stop)
        stop_prod
        ;;
    restart)
        restart_prod
        ;;
    logs)
        logs_prod
        ;;
    logs-api)
        logs_api
        ;;
    logs-db)
        logs_db
        ;;
    logs-nginx)
        logs_nginx
        ;;
    shell-api)
        shell_api
        ;;
    shell-db)
        shell_db
        ;;
    migrate)
        run_migrations
        ;;
    status)
        show_status
        ;;
    backup)
        backup_db
        ;;
    health)
        health_check
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
