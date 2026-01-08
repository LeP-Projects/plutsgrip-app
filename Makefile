.PHONY: help up down restart logs logs-api logs-frontend logs-db shell shell-db build clean status test pgadmin dev prod

# ============================================================
# PLUTUSGRIP - MAKEFILE
# ============================================================
# Unified docker-compose.yml with profiles
# ============================================================

# Default target
.DEFAULT_GOAL := help

# Environment (dev or prod)
ENV ?= dev

# Compose command
ifeq ($(ENV),prod)
    PROFILE = --profile prod
    ENV_FILE = .env.prod
else
    PROFILE = --profile dev
    ENV_FILE = .env.dev
endif

COMPOSE_CMD = docker compose $(PROFILE) --env-file $(ENV_FILE)

help: ## Show this help message
	@echo "PlutusGrip Docker Management"
	@echo ""
	@echo "Usage: make [target] ENV=dev|prod"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'
	@echo ""
	@echo "Examples:"
	@echo "  make up                  # Start dev environment"
	@echo "  make up ENV=prod         # Start production environment"
	@echo "  make logs ENV=prod       # View prod logs"
	@echo "  make shell ENV=dev       # Access API shell in dev"
	@echo "  make pgadmin             # Start pgAdmin (dev only)"
	@echo ""
	@echo "Notes:"
	@echo "  - Dev profile includes: postgres + pgAdmin + hot reload"
	@echo "  - Prod profile includes: Nginx reverse proxy (no postgres)"
	@echo "  - Prod requires external database in .env.prod"

up: ## Start all containers
	@echo "Starting containers in $(ENV) environment (profile: $(ENV))..."
	@$(COMPOSE_CMD) up -d
	@echo ""
	@echo "✓ All services started!"
	@echo "ℹ Available at:"
	@if [ "$(ENV)" = "dev" ]; then \
		echo "  Frontend: http://localhost:5173"; \
		echo "  API: http://localhost:8000"; \
		echo "  API Docs: http://localhost:8000/docs"; \
		echo "  pgAdmin: http://localhost:5050 (admin@plutusgrip.com / admin123)"; \
		echo "  Database: localhost:5432"; \
	else \
		echo "  Application: http://localhost"; \
		echo "  API: http://localhost/api"; \
		echo "  Docs: http://localhost/docs"; \
		echo "  Note: Using external database (no postgres container)"; \
	fi

down: ## Stop all containers
	@echo "Stopping containers in $(ENV) environment..."
	@$(COMPOSE_CMD) down

restart: ## Restart all containers
	@$(MAKE) down ENV=$(ENV)
	@sleep 1
	@$(MAKE) up ENV=$(ENV)

logs: ## View container logs
	@$(COMPOSE_CMD) logs -f

logs-api: ## View API logs
	@$(COMPOSE_CMD) logs -f api

logs-frontend: ## View Frontend logs
	@$(COMPOSE_CMD) logs -f frontend

logs-db: ## View Database logs (dev only)
	@if [ "$(ENV)" != "dev" ]; then \
		echo "✗ Database container only available in dev environment!"; \
		exit 1; \
	fi
	@$(COMPOSE_CMD) logs -f postgres

shell: ## Access API container shell
	@$(COMPOSE_CMD) exec api bash

shell-db: ## Access database container shell (dev only)
	@if [ "$(ENV)" != "dev" ]; then \
		echo "✗ Database container only available in dev environment!"; \
		exit 1; \
	fi
	@$(COMPOSE_CMD) exec postgres bash

build: ## Build/rebuild containers
	@echo "Building images for $(ENV) environment..."
	@$(COMPOSE_CMD) build --no-cache
	@echo "✓ Images built successfully!"

clean: ## Remove containers and volumes (WARNING!)
	@echo "⚠ This will remove all containers and volumes for $(ENV)!"
	@read -p "Are you sure? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		$(COMPOSE_CMD) down -v --rmi local; \
		echo "✓ Cleaned up successfully!"; \
	else \
		echo "ℹ Cleanup cancelled"; \
	fi

status: ## Show container status
	@echo ""
	@echo "ℹ Container Status ($(ENV)):"
	@$(COMPOSE_CMD) ps

test: ## Run tests (dev only)
	@if [ "$(ENV)" != "dev" ]; then \
		echo "✗ Tests can only run in dev environment!"; \
		exit 1; \
	fi
	@echo "Running tests..."
	@$(COMPOSE_CMD) exec api pytest -v

pgadmin: ## Start pgAdmin (dev only)
	@if [ "$(ENV)" != "dev" ]; then \
		echo "✗ pgAdmin only available in dev environment!"; \
		exit 1; \
	fi
	@echo "Starting pgAdmin..."
	@docker compose --profile dev --env-file .env.dev up -d pgadmin
	@echo "✓ pgAdmin started!"
	@echo "  Access: http://localhost:5050"
	@echo "  Email: admin@plutusgrip.com"
	@echo "  Password: admin123"

dev: ## Quick start development environment
	@$(MAKE) up ENV=dev

prod: ## Quick start production environment
	@$(MAKE) up ENV=prod
