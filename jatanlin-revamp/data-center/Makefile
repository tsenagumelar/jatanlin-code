SHELL := /bin/sh

COMPOSE := docker compose
COMPOSE_FILE := infra/compose/docker-compose.yml
PROJECT_NAME ?= jatanlin-data-center
ENV_FILE ?= .env
RUN_ENV := set -a; [ ! -f $(ENV_FILE) ] || . ./$(ENV_FILE); set +a;

WEB_DIR := apps/web
BACKEND_DIR := services/backend
WEB_PORT ?= 3001
NODE_BIN ?= /opt/homebrew/opt/node@20/bin
NPM := PATH="$(NODE_BIN):$$PATH" npm
GO ?= go
GO_CACHE_DIR ?= $(CURDIR)/$(BACKEND_DIR)/.gocache

.DEFAULT_GOAL := help

.PHONY: help infra-up infra-bootstrap infra-migrate infra-seed infra-down infra-clean infra-ps infra-logs api web-install web web-build web-lint dev

help:
	@printf '%s\n' 'Jatanlin Data Center'
	@printf '%s\n' ''
	@printf '%s\n' 'Infrastructure:'
	@printf '%s\n' '  make infra-up         Start Postgres, Hasura, and backend API'
	@printf '%s\n' '  make infra-bootstrap  Start infra, migrate schema, then seed data'
	@printf '%s\n' '  make infra-migrate    Apply database schema'
	@printf '%s\n' '  make infra-seed       Seed admin and sample data'
	@printf '%s\n' '  make infra-down       Stop infrastructure'
	@printf '%s\n' '  make infra-clean      Stop infrastructure and remove volumes'
	@printf '%s\n' '  make infra-ps         Show containers'
	@printf '%s\n' '  make infra-logs       Follow logs'
	@printf '%s\n' ''
	@printf '%s\n' 'Development:'
	@printf '%s\n' '  make api              Start backend API locally'
	@printf '%s\n' '  make web-install      Install web dependencies'
	@printf '%s\n' '  make web              Start web locally'
	@printf '%s\n' '  make web-build        Build web'
	@printf '%s\n' '  make web-lint         Run web lint'
	@printf '%s\n' '  make dev              Start API and web locally'

infra-up:
	$(COMPOSE) -p $(PROJECT_NAME) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) up -d

infra-bootstrap: infra-up infra-migrate infra-seed

infra-migrate:
	./scripts/db-migrate.sh

infra-seed:
	./scripts/db-seed.sh

infra-down:
	$(COMPOSE) -p $(PROJECT_NAME) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) down

infra-clean:
	$(COMPOSE) -p $(PROJECT_NAME) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) down -v

infra-ps:
	$(COMPOSE) -p $(PROJECT_NAME) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) ps

infra-logs:
	$(COMPOSE) -p $(PROJECT_NAME) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) logs -f

api:
	$(RUN_ENV) cd $(BACKEND_DIR) && GOCACHE=$(GO_CACHE_DIR) $(GO) run ./cmd/api

web-install:
	$(NPM) --prefix $(WEB_DIR) install

web:
	$(RUN_ENV) $(NPM) --prefix $(WEB_DIR) run dev -- --port $(WEB_PORT)

web-build:
	$(NPM) --prefix $(WEB_DIR) run build

web-lint:
	$(NPM) --prefix $(WEB_DIR) run lint

dev:
	@$(MAKE) api & p1=$$!; \
	$(MAKE) web & p2=$$!; \
	trap 'kill $$p1 $$p2 2>/dev/null || true' INT TERM EXIT; \
	wait
