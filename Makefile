.PHONY: help up down restart logs logs-api logs-frontend logs-db shell shell-db build clean status test

# Default target
.DEFAULT_GOAL := help

# Environment (dev or prod)
ENV ?= dev

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

up: ## Start all containers
	@bash docker-manage.sh up $(ENV)

down: ## Stop all containers
	@bash docker-manage.sh down $(ENV)

restart: ## Restart all containers
	@bash docker-manage.sh restart $(ENV)

logs: ## View container logs
	@bash docker-manage.sh logs $(ENV)

logs-api: ## View API logs
	@bash docker-manage.sh logs-api $(ENV)

logs-frontend: ## View Frontend logs
	@bash docker-manage.sh logs-frontend $(ENV)

logs-db: ## View Database logs
	@bash docker-manage.sh logs-db $(ENV)

shell: ## Access API container shell
	@bash docker-manage.sh shell $(ENV)

shell-db: ## Access database container shell
	@bash docker-manage.sh shell-db $(ENV)

build: ## Build/rebuild containers
	@bash docker-manage.sh build $(ENV)

clean: ## Remove containers and volumes (WARNING!)
	@bash docker-manage.sh clean $(ENV)

status: ## Show container status
	@bash docker-manage.sh status $(ENV)

test: ## Run tests (dev only)
	@bash docker-manage.sh test $(ENV)
