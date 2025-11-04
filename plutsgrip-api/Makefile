.PHONY: help dev dev-up dev-down dev-logs dev-shell dev-test prod prod-up prod-down prod-logs clean build

# Color output
BLUE := \033[0;34m
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m # No Color

help:
	@echo "$(BLUE)PlutusGrip API - Docker Management$(NC)"
	@echo ""
	@echo "$(GREEN)Development Commands:$(NC)"
	@echo "  make dev              - Start development environment"
	@echo "  make dev-up           - Start dev containers (already running logs will stop)"
	@echo "  make dev-down         - Stop development containers"
	@echo "  make dev-logs         - View development logs"
	@echo "  make dev-shell        - Open shell in api container"
	@echo "  make dev-test         - Run tests in development"
	@echo "  make dev-db-reset     - Reset development database"
	@echo ""
	@echo "$(GREEN)Production Commands:$(NC)"
	@echo "  make prod-up          - Start production environment"
	@echo "  make prod-down        - Stop production environment"
	@echo "  make prod-logs        - View production logs"
	@echo "  make prod-shell       - Open shell in production api container"
	@echo ""
	@echo "$(GREEN)General Commands:$(NC)"
	@echo "  make build            - Build Docker images"
	@echo "  make clean            - Clean up containers, volumes, and logs"
	@echo "  make lint             - Run linting checks"
	@echo "  make format           - Format code with black"
	@echo ""

# Development environment
dev: dev-down
	@echo "$(BLUE)Starting development environment...$(NC)"
	docker-compose -f docker-compose.development.yml --env-file .env.development up -d
	@echo "$(GREEN)Development environment started!$(NC)"
	@echo "API: http://localhost:8000"
	@echo "Docs: http://localhost:8000/docs"
	@echo "PgAdmin: http://localhost:5050"
	@make dev-logs

dev-up:
	@echo "$(BLUE)Starting dev containers...$(NC)"
	docker-compose -f docker-compose.development.yml --env-file .env.development up -d

dev-down:
	@echo "$(BLUE)Stopping development environment...$(NC)"
	docker-compose -f docker-compose.development.yml --env-file .env.development down

dev-logs:
	docker-compose -f docker-compose.development.yml --env-file .env.development logs -f

dev-shell:
	docker-compose -f docker-compose.development.yml --env-file .env.development exec api /bin/bash

dev-test:
	@echo "$(BLUE)Running tests...$(NC)"
	docker-compose -f docker-compose.development.yml --env-file .env.development exec api pytest -v

dev-db-reset:
	@echo "$(RED)Resetting development database...$(NC)"
	docker-compose -f docker-compose.development.yml --env-file .env.development down -v
	@echo "$(GREEN)Database reset complete. Run 'make dev' to start fresh.$(NC)"

# Production environment
prod-up:
	@echo "$(BLUE)Starting production environment...$(NC)"
	@echo "$(RED)WARNING: Make sure .env.production has secure values!$(NC)"
	docker-compose -f docker-compose.production.yml --env-file .env.production up -d
	@echo "$(GREEN)Production environment started!$(NC)"
	@make prod-logs

prod-down:
	@echo "$(RED)Stopping production environment...$(NC)"
	docker-compose -f docker-compose.production.yml --env-file .env.production down

prod-logs:
	docker-compose -f docker-compose.production.yml --env-file .env.production logs -f

prod-shell:
	docker-compose -f docker-compose.production.yml --env-file .env.production exec api /bin/bash

# General commands
build:
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker-compose -f docker-compose.development.yml build
	docker-compose -f docker-compose.production.yml build
	@echo "$(GREEN)Build complete!$(NC)"

clean:
	@echo "$(RED)Cleaning up Docker environment...$(NC)"
	docker-compose -f docker-compose.development.yml down -v
	docker-compose -f docker-compose.production.yml down -v
	docker system prune -f
	@echo "$(GREEN)Cleanup complete!$(NC)"

lint:
	@echo "$(BLUE)Running linters...$(NC)"
	docker-compose -f docker-compose.development.yml --env-file .env.development exec api bash -c "flake8 app && mypy app"

format:
	@echo "$(BLUE)Formatting code with black...$(NC)"
	docker-compose -f docker-compose.development.yml --env-file .env.development exec api black app main.py

# Database migrations
migrate-create:
	@read -p "Enter migration name: " name; \
	docker-compose -f docker-compose.development.yml --env-file .env.development exec api alembic revision --autogenerate -m "$$name"

migrate-upgrade:
	@echo "$(BLUE)Running migrations...$(NC)"
	docker-compose -f docker-compose.development.yml --env-file .env.development exec api alembic upgrade head

migrate-downgrade:
	@read -p "Enter target revision: " target; \
	docker-compose -f docker-compose.development.yml --env-file .env.development exec api alembic downgrade $$target

# Status commands
status-dev:
	@echo "$(BLUE)Development Environment Status:$(NC)"
	docker-compose -f docker-compose.development.yml --env-file .env.development ps

status-prod:
	@echo "$(BLUE)Production Environment Status:$(NC)"
	docker-compose -f docker-compose.production.yml --env-file .env.production ps

status: status-dev
	@echo ""
	@make status-prod
