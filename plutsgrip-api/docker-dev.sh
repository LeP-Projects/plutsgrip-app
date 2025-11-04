#!/bin/bash

# PlutusGrip API - Development Docker Management Script
# Usage: ./docker-dev.sh [command]

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

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Command functions
start_dev() {
    print_header "Starting Development Environment"

    if [ ! -f .env.development ]; then
        print_error ".env.development not found!"
        exit 1
    fi

    docker-compose -f docker-compose.development.yml --env-file .env.development down 2>/dev/null || true
    docker-compose -f docker-compose.development.yml --env-file .env.development up -d

    print_success "Development environment started"
    print_info "API: http://localhost:8000"
    print_info "Docs: http://localhost:8000/docs"
    print_info "PgAdmin: http://localhost:5050"
    print_info ""
    print_info "View logs with: ./docker-dev.sh logs"
}

stop_dev() {
    print_header "Stopping Development Environment"
    docker-compose -f docker-compose.development.yml --env-file .env.development down
    print_success "Development environment stopped"
}

restart_dev() {
    stop_dev
    sleep 2
    start_dev
}

logs_dev() {
    print_header "Development Logs (Press Ctrl+C to exit)"
    docker-compose -f docker-compose.development.yml --env-file .env.development logs -f
}

shell_api() {
    print_header "Entering API Container Shell"
    docker-compose -f docker-compose.development.yml --env-file .env.development exec api bash
}

shell_db() {
    print_header "Entering Database Container Shell"
    docker-compose -f docker-compose.development.yml --env-file .env.development exec postgres bash
}

run_tests() {
    print_header "Running Tests"
    docker-compose -f docker-compose.development.yml --env-file .env.development exec api pytest -v "${@:2}"
    print_success "Tests completed"
}

run_migrations() {
    print_header "Running Database Migrations"
    docker-compose -f docker-compose.development.yml --env-file .env.development exec api alembic upgrade head
    print_success "Migrations completed"
}

reset_db() {
    print_header "Resetting Development Database"
    read -p "$(echo -e ${RED})Are you sure? This will delete all data! (yes/no): $(echo -e ${NC})" -n 3 -r
    echo
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        docker-compose -f docker-compose.development.yml --env-file .env.development down -v
        print_success "Database reset. Run './docker-dev.sh start' to initialize fresh."
    else
        print_info "Reset cancelled"
    fi
}

format_code() {
    print_header "Formatting Code with Black"
    docker-compose -f docker-compose.development.yml --env-file .env.development exec api black app main.py
    print_success "Code formatted"
}

lint_code() {
    print_header "Running Linters"
    docker-compose -f docker-compose.development.yml --env-file .env.development exec api bash -c "flake8 app && mypy app"
    print_success "Linting completed"
}

show_status() {
    print_header "Development Container Status"
    docker-compose -f docker-compose.development.yml --env-file .env.development ps
}

show_help() {
    cat << EOF
${BLUE}PlutusGrip API - Docker Development Management${NC}

${GREEN}Usage:${NC}
  ./docker-dev.sh [command]

${GREEN}Commands:${NC}
  start              Start development environment
  stop               Stop development environment
  restart            Restart development environment
  logs               View development logs (follow mode)
  shell-api          Open bash shell in API container
  shell-db           Open bash shell in database container
  test               Run tests (pass additional args: ./docker-dev.sh test -v)
  migrate            Run database migrations
  reset-db           Reset development database (WARNING: deletes data)
  format             Format code with black
  lint               Run linters (flake8, mypy)
  status             Show container status
  help               Show this help message

${GREEN}Examples:${NC}
  ./docker-dev.sh start              # Start environment
  ./docker-dev.sh logs               # View logs
  ./docker-dev.sh test -v --tb=short # Run tests with options
  ./docker-dev.sh shell-api          # Open API container shell

EOF
}

# Main script logic
case "${1:-help}" in
    start)
        start_dev
        ;;
    stop)
        stop_dev
        ;;
    restart)
        restart_dev
        ;;
    logs)
        logs_dev
        ;;
    shell-api)
        shell_api
        ;;
    shell-db)
        shell_db
        ;;
    test)
        run_tests "$@"
        ;;
    migrate)
        run_migrations
        ;;
    reset-db)
        reset_db
        ;;
    format)
        format_code
        ;;
    lint)
        lint_code
        ;;
    status)
        show_status
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
