SHELL := /bin/sh

COMPOSE := docker compose
COMPOSE_FILE := infra/compose/docker-compose.yml
PROJECT_NAME ?= jatanlin-data-center
ENV_FILE ?= .env
RUN_ENV := set -a; [ ! -f $(ENV_FILE) ] || . ./$(ENV_FILE); set +a;
ENV_EXAMPLE_FILES := .env.example apps/web/.env.example

WEB_DIR := apps/web
BACKEND_DIR := services/backend
WEB_PORT ?= 3001
NODE_BIN ?= /opt/homebrew/opt/node@20/bin
NPM := PATH="$(NODE_BIN):$$PATH" npm
GO ?= go
GO_CACHE_DIR ?= $(CURDIR)/$(BACKEND_DIR)/.gocache

.DEFAULT_GOAL := help

.PHONY: help full-deployment redeploy-all redeploy-services redeploy-web env-init env-force docker-up docker-bootstrap docker-build docker-deploy-apps docker-down docker-ps docker-logs infra-up infra-up-local infra-bootstrap infra-bootstrap-local infra-migrate infra-seed infra-down infra-clean infra-ps infra-logs api backend-api web-install web web-build web-lint backend-web dev dev-local

help:
	@printf '%s\n' 'Jatanlin Data Center'
	@printf '%s\n' ''
	@printf '%s\n' 'Full deployment:'
	@printf '%s\n' '  make full-deployment  Initialize env, infra, database, backend, and web'
	@printf '%s\n' ''
	@printf '%s\n' 'Redeployment:'
	@printf '%s\n' '  make redeploy-all      Redeploy backend and web'
	@printf '%s\n' '  make redeploy-services Redeploy backend only'
	@printf '%s\n' '  make redeploy-web      Redeploy web only'
	@printf '%s\n' ''
	@printf '%s\n' 'Environment:'
	@printf '%s\n' '  make env-init         Create missing .env files from .env.example'
	@printf '%s\n' '  make env-force        Overwrite all .env files from .env.example'
	@printf '%s\n' ''
	@printf '%s\n' 'Docker:'
	@printf '%s\n' '  make docker-up        Build and start data-center infra, backend API, and web in Docker'
	@printf '%s\n' '  make docker-bootstrap Build/start full Docker stack, migrate, then seed'
	@printf '%s\n' '  make docker-build     Build Docker images'
	@printf '%s\n' '  make docker-down      Stop full Docker stack'
	@printf '%s\n' '  make docker-ps        Show full Docker stack containers'
	@printf '%s\n' '  make docker-logs      Follow full Docker stack logs'
	@printf '%s\n' ''
	@printf '%s\n' 'Infrastructure:'
	@printf '%s\n' '  make infra-up         Start Postgres, Hasura, MinIO, and backend API in Docker'
	@printf '%s\n' '  make infra-up-local   Start Postgres, Hasura, and MinIO only for local backend'
	@printf '%s\n' '  make infra-bootstrap  Start Docker backend infra, migrate schema, then seed data'
	@printf '%s\n' '  make infra-bootstrap-local Start local-backend infra, migrate schema, then seed data'
	@printf '%s\n' '  make infra-migrate    Apply database schema'
	@printf '%s\n' '  make infra-seed       Seed admin and sample data'
	@printf '%s\n' '  make infra-down       Stop infrastructure'
	@printf '%s\n' '  make infra-clean      Stop infrastructure and remove volumes'
	@printf '%s\n' '  make infra-ps         Show containers'
	@printf '%s\n' '  make infra-logs       Follow logs'
	@printf '%s\n' ''
	@printf '%s\n' 'Development:'
	@printf '%s\n' '  make api              Start backend API locally'
	@printf '%s\n' '  make backend-api      Alias for make api'
	@printf '%s\n' '  make web-install      Install web dependencies'
	@printf '%s\n' '  make web              Start web locally'
	@printf '%s\n' '  make web-build        Build web'
	@printf '%s\n' '  make web-lint         Run web lint'
	@printf '%s\n' '  make backend-web      Start backend API and web locally'
	@printf '%s\n' '  make dev              Start API and web locally'
	@printf '%s\n' '  make dev-local        Start infra deps, API local, and web local'

env-init:
	@for example in $(ENV_EXAMPLE_FILES); do \
		target=$$(dirname "$$example")/.env; \
		if [ "$$example" = ".env.example" ]; then target=.env; fi; \
		if [ -f "$$target" ]; then \
			printf 'skip %s (exists)\n' "$$target"; \
		else \
			cp "$$example" "$$target"; \
			printf 'create %s\n' "$$target"; \
		fi; \
	done

env-force:
	@for example in $(ENV_EXAMPLE_FILES); do \
		target=$$(dirname "$$example")/.env; \
		if [ "$$example" = ".env.example" ]; then target=.env; fi; \
		cp "$$example" "$$target"; \
		printf 'write %s\n' "$$target"; \
	done

full-deployment:
	@printf '%s\n' '[1/4] Menyalin environment data center dari .env.example'
	@$(MAKE) env-force
	@printf '%s\n' '[2/4] Menjalankan infrastructure'
	@$(MAKE) infra-up-local
	@printf '%s\n' '[3/4] Menjalankan migration dan seed'
	@$(MAKE) infra-migrate infra-seed
	@printf '%s\n' '[4/4] Membangun dan menjalankan backend serta web'
	@$(MAKE) docker-deploy-apps
	@$(MAKE) docker-ps
	@printf '%s\n' 'Full deployment data center selesai.'

redeploy-all:
	$(COMPOSE) -p $(PROJECT_NAME) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) up -d --build --force-recreate --no-deps backend web

redeploy-services:
	$(COMPOSE) -p $(PROJECT_NAME) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) up -d --build --force-recreate --no-deps backend

redeploy-web:
	$(COMPOSE) -p $(PROJECT_NAME) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) up -d --build --force-recreate --no-deps web

docker-up:
	$(COMPOSE) -p $(PROJECT_NAME) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) up -d --build

docker-bootstrap: docker-up infra-migrate infra-seed
	$(COMPOSE) -p $(PROJECT_NAME) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) restart backend web

docker-build:
	$(COMPOSE) -p $(PROJECT_NAME) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) build

docker-deploy-apps:
	$(COMPOSE) -p $(PROJECT_NAME) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) up -d --build --force-recreate backend web

docker-down:
	$(COMPOSE) -p $(PROJECT_NAME) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) down

docker-ps:
	$(COMPOSE) -p $(PROJECT_NAME) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) ps

docker-logs:
	$(COMPOSE) -p $(PROJECT_NAME) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) logs -f

infra-up:
	$(COMPOSE) -p $(PROJECT_NAME) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) up -d

infra-up-local:
	$(COMPOSE) -p $(PROJECT_NAME) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) up -d postgres hasura minio minio-init

infra-bootstrap: infra-up infra-migrate infra-seed

infra-bootstrap-local: infra-up-local infra-migrate infra-seed

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

backend-api: api

web-install:
	$(NPM) --prefix $(WEB_DIR) install

web:
	$(RUN_ENV) $(NPM) --prefix $(WEB_DIR) run dev -- --port $(WEB_PORT)

web-build:
	$(NPM) --prefix $(WEB_DIR) run build

web-lint:
	$(NPM) --prefix $(WEB_DIR) run lint

backend-web: dev

dev:
	@$(MAKE) api & p1=$$!; \
	$(MAKE) web & p2=$$!; \
	trap 'kill $$p1 $$p2 2>/dev/null || true' INT TERM EXIT; \
	wait

dev-local: infra-up-local
	@$(MAKE) dev
