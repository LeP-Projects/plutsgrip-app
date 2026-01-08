#!/bin/bash

# PlutusGrip Docker Management Script
# Supports: dev, prod
# Usage: ./docker-manage.sh [command] [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$SCRIPT_DIR/plutsgrip-api"
FRONTEND_DIR="$SCRIPT_DIR/plutsgrip-frond-refac"

# Default environment
ENVIRONMENT="dev"

# ==================== HELPER FUNCTIONS ====================

show_header() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} PlutusGrip Docker Management${BLUE}           ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

show_usage() {
    cat << EOF
${BLUE}Usage:${NC} ./docker-manage.sh [command] [environment]

${BLUE}Commands:${NC}
  up              Start all containers
  down            Stop all containers
  restart         Restart all containers
  logs            View container logs
  logs-api        View API logs only
  logs-frontend   View Frontend logs only
  logs-db         View Database logs only (dev only)
  shell           Access API container shell
  shell-db        Access database container shell (dev only)
  build           Build/rebuild containers
  clean           Remove containers and volumes (WARNING!)
  status          Show container status
  test            Run tests (dev only)
  pgadmin         Start pgAdmin (dev only)
  help            Show this help message

${BLUE}Environments:${NC}
  dev             Development (default) - includes postgres + pgAdmin
  prod            Production - uses external database + Nginx

${BLUE}Examples:${NC}
  ./docker-manage.sh up dev
  ./docker-manage.sh logs prod
  ./docker-manage.sh shell dev
  ./docker-manage.sh pgadmin dev
  ./docker-manage.sh down

${BLUE}Notes:${NC}
  - Dev environment includes: API, Frontend, PostgreSQL, pgAdmin
  - Prod environment includes: API, Frontend, Nginx (no database)
  - Prod requires external database configured in .env.prod

EOF
}

# ==================== ENVIRONMENT SETUP ====================

setup_environment() {
    local env=$1

    if [ ! -f "$SCRIPT_DIR/.env.$env" ]; then
        print_error "Environment file .env.$env not found!"
        exit 1
    fi

    export $(cat "$SCRIPT_DIR/.env.$env" | grep -v '#' | xargs)
    print_info "Environment: $env"
}

get_compose_command() {
    local env=$1
    echo "docker compose --profile $env --env-file $SCRIPT_DIR/.env.$env"
}

# ==================== DOCKER COMMANDS ====================

cmd_up() {
    local env=$1
    setup_environment "$env"

    print_info "Starting containers in $env environment (profile: $env)..."
    $(get_compose_command $env) up -d

    sleep 2
    cmd_status "$env"

    echo ""
    print_success "All services started!"
    print_info "Available at:"

    if [ "$env" = "dev" ]; then
        echo "  Frontend: ${BLUE}http://localhost:5173${NC}"
        echo "  API:      ${BLUE}http://localhost:8000${NC}"
        echo "  Docs:     ${BLUE}http://localhost:8000/docs${NC}"
        echo "  pgAdmin:  ${BLUE}http://localhost:5050${NC} (admin@plutusgrip.com / admin123)"
        echo "  Database: ${BLUE}localhost:5432${NC}"
    else
        echo "  Application: ${BLUE}http://localhost${NC}"
        echo "  API:         ${BLUE}http://localhost/api${NC}"
        echo "  Docs:        ${BLUE}http://localhost/docs${NC}"
        echo "  ${YELLOW}Note: Using external database (no postgres container)${NC}"
    fi
}

cmd_down() {
    local env=$1
    setup_environment "$env"

    print_warning "Stopping containers in $env environment..."
    $(get_compose_command $env) down

    print_success "All services stopped!"
}

cmd_restart() {
    local env=$1
    cmd_down "$env"
    sleep 1
    cmd_up "$env"
}

cmd_logs() {
    local env=$1
    setup_environment "$env"

    $(get_compose_command $env) logs -f
}

cmd_logs_api() {
    local env=$1
    setup_environment "$env"

    $(get_compose_command $env) logs -f api
}

cmd_logs_frontend() {
    local env=$1
    setup_environment "$env"

    $(get_compose_command $env) logs -f frontend
}

cmd_logs_db() {
    local env=$1
    setup_environment "$env"

    if [ "$env" != "dev" ]; then
        print_error "Database container only available in dev environment!"
        exit 1
    fi

    $(get_compose_command $env) logs -f postgres
}

cmd_shell() {
    local env=$1
    setup_environment "$env"

    $(get_compose_command $env) exec api bash
}

cmd_shell_db() {
    local env=$1
    setup_environment "$env"

    if [ "$env" != "dev" ]; then
        print_error "Database container only available in dev environment!"
        exit 1
    fi

    $(get_compose_command $env) exec postgres bash
}

cmd_build() {
    local env=$1
    setup_environment "$env"

    print_info "Building images for $env environment..."
    $(get_compose_command $env) build --no-cache

    print_success "Images built successfully!"
}

cmd_clean() {
    local env=$1
    setup_environment "$env"

    print_warning "This will remove all containers and volumes for $env!"
    read -p "Are you sure? (yes/no): " confirm

    if [ "$confirm" = "yes" ]; then
        $(get_compose_command $env) down -v --rmi local
        print_success "Cleaned up successfully!"
    else
        print_info "Cleanup cancelled"
    fi
}

cmd_status() {
    local env=$1
    setup_environment "$env"

    echo ""
    print_info "Container Status ($env):"
    $(get_compose_command $env) ps
}

cmd_test() {
    local env=$1

    if [ "$env" != "dev" ]; then
        print_error "Tests can only run in dev environment!"
        exit 1
    fi

    setup_environment "$env"

    print_info "Running tests..."
    $(get_compose_command $env) exec api pytest -v
}

cmd_pgadmin() {
    if [ "$1" != "dev" ]; then
        print_error "pgAdmin only available in dev environment!"
        exit 1
    fi

    setup_environment "dev"

    print_info "Starting pgAdmin..."
    $(get_compose_command dev) up -d pgadmin

    print_success "pgAdmin started!"
    echo "  Access: ${BLUE}http://localhost:5050${NC}"
    echo "  Email: ${BLUE}admin@plutusgrip.com${NC}"
    echo "  Password: ${BLUE}admin123${NC}"
}

# ==================== MAIN ====================

main() {
    local command=${1:-help}
    local environment=${2:-dev}

    # Validate environment
    if [ "$environment" != "dev" ] && [ "$environment" != "prod" ]; then
        print_error "Invalid environment: $environment (use 'dev' or 'prod')"
        exit 1
    fi

    show_header

    case "$command" in
        up)
            cmd_up "$environment"
            ;;
        down)
            cmd_down "$environment"
            ;;
        restart)
            cmd_restart "$environment"
            ;;
        logs)
            cmd_logs "$environment"
            ;;
        logs-api)
            cmd_logs_api "$environment"
            ;;
        logs-frontend)
            cmd_logs_frontend "$environment"
            ;;
        logs-db)
            cmd_logs_db "$environment"
            ;;
        shell)
            cmd_shell "$environment"
            ;;
        shell-db)
            cmd_shell_db "$environment"
            ;;
        build)
            cmd_build "$environment"
            ;;
        clean)
            cmd_clean "$environment"
            ;;
        status)
            cmd_status "$environment"
            ;;
        test)
            cmd_test "$environment"
            ;;
        pgadmin)
            cmd_pgadmin "$environment"
            ;;
        help)
            show_usage
            ;;
        *)
            print_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
