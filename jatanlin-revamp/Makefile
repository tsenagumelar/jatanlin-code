SHELL := /bin/sh

COMPOSE := docker compose
COMPOSE_FILE := infra/compose/docker-compose.yml
PROJECT_NAME ?= jatanlin-revamp
ENV_FILE ?= .env
RUN_ENV := set -a; [ ! -f $(ENV_FILE) ] || . ./$(ENV_FILE); set +a;

.DEFAULT_GOAL := help

WEB_DIR := apps/web
WEB_PORT ?= 3000
NODE_BIN ?= /opt/homebrew/opt/node@20/bin
NPM := PATH="$(NODE_BIN):$$PATH" npm
BACKEND_DIR := services/backend
WB_AGENT_DIR := services/wb-agent
GO ?= go
GO_CACHE_DIR ?= $(CURDIR)/$(BACKEND_DIR)/.gocache
DOTNET ?= /opt/homebrew/opt/dotnet@8/bin/dotnet

.PHONY: help infra-up infra-bootstrap infra-migrate infra-seed infra-down infra-restart infra-ps infra-logs infra-pull infra-clean web-install web web-dev web-build web-lint backend-api anpr-watcher axle-watcher cctv-streamer wb-agent veam-license-generate veam-license-check services dev dev-full

help:
	@printf '%s\n' 'Jatanlin Revamp'
	@printf '%s\n' ''
	@printf '%s\n' 'Infrastructure targets:'
	@printf '%s\n' '  make infra-up       Start local infrastructure only'
	@printf '%s\n' '  make infra-bootstrap Start infra, run database migration, then seed'
	@printf '%s\n' '  make infra-migrate  Apply database schema migrations'
	@printf '%s\n' '  make infra-seed     Seed local master/admin data'
	@printf '%s\n' '  make infra-down     Stop local infrastructure'
	@printf '%s\n' '  make infra-restart  Restart local infrastructure'
	@printf '%s\n' '  make infra-ps       Show infrastructure containers'
	@printf '%s\n' '  make infra-logs     Follow infrastructure logs'
	@printf '%s\n' '  make infra-pull     Pull infrastructure images'
	@printf '%s\n' '  make infra-clean    Stop infra and remove volumes'
	@printf '%s\n' ''
	@printf '%s\n' 'Web targets:'
	@printf '%s\n' '  make web-install    Install web dependencies'
	@printf '%s\n' '  make web            Start revamp web locally'
	@printf '%s\n' '  make web-dev        Start revamp web locally'
	@printf '%s\n' '  make web-build      Build revamp web'
	@printf '%s\n' '  make web-lint       Run web lint'
	@printf '%s\n' ''
	@printf '%s\n' 'Service targets:'
	@printf '%s\n' '  make backend-api    Start backend API service'
	@printf '%s\n' '  make anpr-watcher   Start ANPR FTP watcher'
	@printf '%s\n' '  make axle-watcher   Start AXLE FTP watcher'
	@printf '%s\n' '  make cctv-streamer  Start CCTV streamer'
	@printf '%s\n' '  make wb-agent       Start WB agent'
	@printf '%s\n' '  make veam-license-generate Generate local VEAM license'
	@printf '%s\n' '  make veam-license-check    Validate local VEAM license'
	@printf '%s\n' '  make services       Start all backend services'
	@printf '%s\n' '  make dev            Start all services and web'
	@printf '%s\n' '  make dev-full       Start infra, then all services and web'

infra-up:
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d

infra-bootstrap: infra-up infra-migrate infra-seed

infra-migrate:
	./scripts/db-migrate.sh

infra-seed:
	./scripts/db-seed.sh

infra-down:
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down

infra-restart:
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) restart

infra-ps:
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) ps

infra-logs:
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) logs -f

infra-pull:
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) pull

infra-clean:
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down -v

web-install:
	$(NPM) --prefix $(WEB_DIR) install

web: web-dev

web-dev:
	$(RUN_ENV) $(NPM) --prefix $(WEB_DIR) run dev -- --port $(WEB_PORT)

web-build:
	$(NPM) --prefix $(WEB_DIR) run build

web-lint:
	$(NPM) --prefix $(WEB_DIR) run lint

backend-api:
	$(RUN_ENV) cd $(BACKEND_DIR) && GOCACHE=$(GO_CACHE_DIR) $(GO) run ./cmd/api

anpr-watcher:
	$(RUN_ENV) cd $(BACKEND_DIR) && GOCACHE=$(GO_CACHE_DIR) $(GO) run ./cmd/anpr-watcher

axle-watcher:
	$(RUN_ENV) cd $(BACKEND_DIR) && GOCACHE=$(GO_CACHE_DIR) $(GO) run ./cmd/axle-watcher

cctv-streamer:
	$(RUN_ENV) cd $(BACKEND_DIR) && GOCACHE=$(GO_CACHE_DIR) $(GO) run ./cmd/cctv-streamer

wb-agent:
	$(RUN_ENV) cd $(WB_AGENT_DIR) && $(DOTNET) run --project WServerApi.csproj

veam-license-generate:
	$(RUN_ENV) cd $(BACKEND_DIR) && GOCACHE=$(GO_CACHE_DIR) $(GO) run ./cmd/veam-license-gen -out ./data/license.veam

veam-license-check:
	$(RUN_ENV) cd $(BACKEND_DIR) && GOCACHE=$(GO_CACHE_DIR) $(GO) run ./cmd/veam-license-check

services:
	@$(MAKE) backend-api & p1=$$!; \
	$(MAKE) anpr-watcher & p2=$$!; \
	$(MAKE) axle-watcher & p3=$$!; \
	$(MAKE) cctv-streamer & p4=$$!; \
	$(MAKE) wb-agent & p5=$$!; \
	trap 'kill $$p1 $$p2 $$p3 $$p4 $$p5 2>/dev/null || true' INT TERM EXIT; \
	wait

dev:
	@$(MAKE) services & p1=$$!; \
	$(MAKE) web & p2=$$!; \
	trap 'kill $$p1 $$p2 2>/dev/null || true' INT TERM EXIT; \
	wait

dev-full: infra-up dev
