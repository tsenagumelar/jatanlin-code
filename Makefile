SHELL := /bin/sh

PROJECT_NAME ?= jatanlin-revamp
ENV_FILE ?= .env
SITE ?=
COMPOSE := docker compose --env-file $(ENV_FILE)
COMPOSE_FILE := infra/compose/docker-compose.yml
RUN_ENV := set -a; [ ! -f $(ENV_FILE) ] || . ./$(ENV_FILE); set +a;
ENV_EXAMPLE_FILES := .env.example apps/web/.env.example services/backend/.env.example services/wb-agent/.env.example data-center/.env.example data-center/apps/web/.env.example
SITE_ENV_EXAMPLE_FILES := .env.example apps/web/.env.example services/backend/.env.example services/wb-agent/.env.example
INFRA_SERVICES := postgres hasura minio minio-init nats redis ftp-local edge-proxy
DOCKER_APP_SERVICES := backend-api anpr-watcher axle-watcher cctv-streamer sync-agent wb-agent

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
VEAM_API_URL ?= http://localhost:4000
FTP_TARGET ?= anpr
FTP_LIST_SERVICE = $(FTP_TARGET)-watcher

.PHONY: help full-deployment data-center-full-deployment require-site redeploy-all redeploy-services redeploy-web data-center-redeploy-all data-center-redeploy-services data-center-redeploy-web site-apply env-init env-force docker-up docker-bootstrap docker-bootstrap-dev docker-config docker-build docker-deploy-apps docker-redeploy-services docker-down docker-ps docker-logs docker-restart infra-up infra-bootstrap infra-bootstrap-dev infra-migrate infra-seed infra-seed-transactions infra-seed-with-transactions infra-transactions-clear infra-down infra-restart infra-ps infra-logs infra-pull infra-clean proxy-up proxy-down proxy-restart proxy-logs proxy-test dns-hosts-print web-install web web-dev web-build web-lint backend-api anpr-watcher axle-watcher cctv-streamer sync-agent wb-agent veam-license-generate veam-license-check veam-usb-drive veam-usb-mount veam-usb-redeploy veam-usb-scan ftp-list services dev dev-full

help:
	@printf '%s\n' 'Jatanlin Revamp'
	@printf '%s\n' ''
	@printf '%s\n' 'Full deployment:'
	@printf '%s\n' '  make full-deployment SITE=1       Deploy one site completely using sites[0] from site.json'
	@printf '%s\n' '  make data-center-full-deployment  Deploy the data center completely'
	@printf '%s\n' ''
	@printf '%s\n' 'Redeployment:'
	@printf '%s\n' '  make redeploy-all SITE=1          Redeploy site services and web'
	@printf '%s\n' '  make redeploy-services SITE=1     Redeploy site services only'
	@printf '%s\n' '  make redeploy-web SITE=1          Redeploy site web only'
	@printf '%s\n' '  make data-center-redeploy-all      Redeploy Data Center backend and web'
	@printf '%s\n' '  make data-center-redeploy-services Redeploy Data Center backend only'
	@printf '%s\n' '  make data-center-redeploy-web      Redeploy Data Center web only'
	@printf '%s\n' ''
	@printf '%s\n' 'Environment targets:'
	@printf '%s\n' '  make site-apply SITE=1 Apply selected site.json entry into runtime environment files'
	@printf '%s\n' '  make env-init       Create missing .env files from .env.example'
	@printf '%s\n' '  make env-force      Overwrite all .env files from .env.example'
	@printf '%s\n' ''
	@printf '%s\n' 'Docker targets:'
	@printf '%s\n' '  make docker-up      Build and start infra, backend services, WB agent, and web in Docker'
	@printf '%s\n' '  make docker-bootstrap Build/start full Docker stack, migrate, seed master data, then restart app services'
	@printf '%s\n' '  make docker-bootstrap-dev Build/start full Docker stack with master + demo transaction seed'
	@printf '%s\n' '  make docker-config  Apply runtime config values for Docker internal service URLs'
	@printf '%s\n' '  make docker-build   Build Docker images for all app services'
	@printf '%s\n' '  make docker-redeploy-services Rebuild/recreate app services without web'
	@printf '%s\n' '  make docker-down    Stop full Docker stack'
	@printf '%s\n' '  make docker-ps      Show full Docker stack containers'
	@printf '%s\n' '  make docker-logs    Follow full Docker stack logs'
	@printf '%s\n' '  make docker-restart Restart full Docker stack'
	@printf '%s\n' ''
	@printf '%s\n' 'Infrastructure targets:'
	@printf '%s\n' '  make infra-up       Start local infrastructure only'
	@printf '%s\n' '  make infra-bootstrap Start infra, run database migration, then seed master data'
	@printf '%s\n' '  make infra-bootstrap-dev Start infra, migrate, then seed master + demo transactions'
	@printf '%s\n' '  make infra-migrate  Apply database schema migrations'
	@printf '%s\n' '  make infra-seed     Seed master data only'
	@printf '%s\n' '  make infra-seed-with-transactions Seed master data and demo transactions'
	@printf '%s\n' '  make infra-transactions-clear CONFIRM=clear-transactions Clear transaction tables only'
	@printf '%s\n' '  make infra-down     Stop local infrastructure'
	@printf '%s\n' '  make infra-restart  Restart local infrastructure'
	@printf '%s\n' '  make infra-ps       Show infrastructure containers'
	@printf '%s\n' '  make infra-logs     Follow infrastructure logs'
	@printf '%s\n' '  make infra-pull     Pull infrastructure images'
	@printf '%s\n' '  make infra-clean    Stop infra and remove volumes'
	@printf '%s\n' '  make proxy-up       Start local DNS reverse proxy only'
	@printf '%s\n' '  make proxy-down     Stop local DNS reverse proxy only'
	@printf '%s\n' '  make proxy-restart  Restart local DNS reverse proxy'
	@printf '%s\n' '  make proxy-logs     Follow local DNS reverse proxy logs'
	@printf '%s\n' '  make proxy-test     Validate local DNS reverse proxy config'
	@printf '%s\n' '  make dns-hosts-print Print /etc/hosts entries for local DNS'
	@printf '%s\n' ''
	@printf '%s\n' 'VEAM targets:'
	@printf '%s\n' '  make veam-usb-drive DRIVE=D Select USB drive D:, mount it, and redeploy backend'
	@printf '%s\n' '  make veam-usb-mount   Mount Windows USB drive into WSL and list .veam files'
	@printf '%s\n' '  make veam-usb-redeploy Mount USB, recreate backend-api, and enable USB scan path'
	@printf '%s\n' '  make veam-usb-scan    Call backend USB license scan endpoint'
	@printf '%s\n' ''
	@printf '%s\n' 'FTP targets:'
	@printf '%s\n' '  make ftp-list FTP_TARGET=anpr List files from ANPR FTP via watcher container'
	@printf '%s\n' '  make ftp-list FTP_TARGET=axle List files from AXLE FTP via watcher container'
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
	@printf '%s\n' '  make sync-agent     Start data center sync agent continuously'
	@printf '%s\n' '  make wb-agent       Start WB agent'
	@printf '%s\n' '  make veam-license-generate Generate local VEAM license'
	@printf '%s\n' '  make veam-license-check    Validate local VEAM license'
	@printf '%s\n' '  make services       Start all backend services'
	@printf '%s\n' '  make dev            Start all services and web'
	@printf '%s\n' '  make dev-full       Start infra, then all services and web'

site-apply:
	./scripts/site-apply.sh

require-site:
	@if [ -z "$(SITE)" ]; then \
		printf '%s\n' 'SITE wajib diisi, contoh: make redeploy-all SITE=1' >&2; \
		exit 2; \
	fi

redeploy-all: require-site
	@$(MAKE) site-apply SITE="$(SITE)"
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d --build --force-recreate --no-deps $(DOCKER_APP_SERVICES) web

redeploy-services: require-site
	@$(MAKE) site-apply SITE="$(SITE)"
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d --build --force-recreate --no-deps $(DOCKER_APP_SERVICES)

redeploy-web: require-site
	@$(MAKE) site-apply SITE="$(SITE)"
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d --build --force-recreate --no-deps web

full-deployment:
	@if [ -z "$(SITE)" ]; then \
		printf '%s\n' 'SITE wajib diisi, contoh: make full-deployment SITE=1' >&2; \
		exit 2; \
	fi
	@printf '%s\n' '[1/6] Menyalin environment site dari .env.example'
	@for example in $(SITE_ENV_EXAMPLE_FILES); do \
		target=$$(dirname "$$example")/.env; \
		if [ "$$example" = ".env.example" ]; then target=.env; fi; \
		cp "$$example" "$$target"; \
		printf 'write %s\n' "$$target"; \
	done
	@printf '%s\n' '[2/6] Menerapkan konfigurasi site'
	@$(MAKE) site-apply SITE="$(SITE)"
	@printf '%s\n' '[3/6] Menjalankan infrastructure'
	@$(MAKE) infra-up SITE="$(SITE)"
	@printf '%s\n' '[4/6] Menjalankan migration dan seed'
	@$(MAKE) infra-migrate infra-seed SITE="$(SITE)"
	@$(MAKE) docker-config SITE="$(SITE)"
	@printf '%s\n' '[5/6] Membangun dan menjalankan services serta web'
	@$(MAKE) docker-deploy-apps SITE="$(SITE)"
	@printf '%s\n' '[6/6] Membuat dan memasang license site'
	@$(MAKE) veam-license-generate SITE="$(SITE)"
	@$(MAKE) docker-ps
	@printf '%s\n' 'Full deployment site selesai.'

data-center-full-deployment:
	@$(MAKE) -C data-center full-deployment

data-center-redeploy-all:
	@$(MAKE) -C data-center redeploy-all

data-center-redeploy-services:
	@$(MAKE) -C data-center redeploy-services

data-center-redeploy-web:
	@$(MAKE) -C data-center redeploy-web

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
	@$(MAKE) site-apply

env-force:
	@for example in $(ENV_EXAMPLE_FILES); do \
		target=$$(dirname "$$example")/.env; \
		if [ "$$example" = ".env.example" ]; then target=.env; fi; \
		cp "$$example" "$$target"; \
		printf 'write %s\n' "$$target"; \
	done
	@$(MAKE) site-apply

docker-up: site-apply
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d --build

docker-bootstrap: docker-up infra-migrate infra-seed docker-config
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) restart backend-api anpr-watcher axle-watcher cctv-streamer sync-agent wb-agent web

docker-bootstrap-dev: docker-up infra-migrate infra-seed-with-transactions docker-config
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) restart backend-api anpr-watcher axle-watcher cctv-streamer sync-agent wb-agent web

docker-config: site-apply
	./scripts/db-docker-config.sh

docker-build: site-apply
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) build

docker-deploy-apps: site-apply
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d --build --force-recreate $(DOCKER_APP_SERVICES) web

docker-redeploy-services:
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d --build --force-recreate --no-deps $(DOCKER_APP_SERVICES)

docker-down:
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down

docker-ps:
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) ps

docker-logs:
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) logs -f

docker-restart:
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) restart

infra-up: site-apply
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d $(INFRA_SERVICES)

infra-bootstrap: infra-up infra-migrate infra-seed

infra-bootstrap-dev: infra-up infra-migrate infra-seed-with-transactions

infra-migrate:
	./scripts/db-migrate.sh

infra-seed:
	./scripts/db-seed.sh

infra-seed-transactions:
	./scripts/db-seed.sh transactions

infra-seed-with-transactions:
	./scripts/db-seed.sh with-transactions

infra-transactions-clear:
	./scripts/db-clear-transactions.sh

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

proxy-up:
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d edge-proxy

proxy-down:
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) stop edge-proxy

proxy-restart:
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) restart edge-proxy

proxy-logs:
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) logs -f edge-proxy

proxy-test:
	$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) run --rm edge-proxy nginx -t

dns-hosts-print:
	@cat infra/nginx/hosts.local

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

sync-agent:
	$(RUN_ENV) cd $(BACKEND_DIR) && DATA_CENTER_SYNC_ENABLED=true DATA_CENTER_SYNC_ONCE=false GOCACHE=$(GO_CACHE_DIR) $(GO) run ./cmd/sync-agent

wb-agent:
	$(RUN_ENV) cd $(WB_AGENT_DIR) && $(DOTNET) run --project WServerApi.csproj

veam-license-generate:
	GO=$(GO) ./scripts/veam-generate-license.sh

veam-license-check:
	GO=$(GO) ./scripts/veam-check-license.sh

veam-usb-drive:
	@drive_input='$(DRIVE)'; \
	case "$$drive_input" in \
		[A-Za-z]|[A-Za-z]:) ;; \
		*) printf 'DRIVE harus satu huruf, contoh: make veam-usb-drive DRIVE=D\n' >&2; exit 2 ;; \
	esac; \
	drive_letter=$$(printf '%s' "$$drive_input" | cut -c1); \
	drive_upper=$$(printf '%s' "$$drive_letter" | tr '[:lower:]' '[:upper:]'); \
	drive_lower=$$(printf '%s' "$$drive_letter" | tr '[:upper:]' '[:lower:]'); \
	printf 'Menggunakan USB drive %s: melalui /mnt/%s\n' "$$drive_upper" "$$drive_lower"; \
	VEAM_USB_OVERRIDE_DRIVE="$$drive_upper:" \
	VEAM_USB_OVERRIDE_HOST_MOUNT="/mnt/$$drive_lower" \
	$(MAKE) veam-usb-redeploy

veam-usb-mount:
	@$(RUN_ENV) \
		veam_usb_mode="$${VEAM_USB_MODE:-windows-wsl}"; \
		veam_usb_drive="$${VEAM_USB_OVERRIDE_DRIVE:-$${VEAM_USB_DRIVE:-}}"; \
		veam_usb_mount="$${VEAM_USB_OVERRIDE_HOST_MOUNT:-$${VEAM_USB_HOST_MOUNT:-}}"; \
		if [ -z "$$veam_usb_drive" ] && [ -n "$$veam_usb_mount" ]; then \
			mount_name=$$(basename "$$veam_usb_mount"); \
			if [ "$${#mount_name}" -eq 1 ]; then \
				veam_usb_drive=$$(printf '%s:' "$$mount_name" | tr '[:lower:]' '[:upper:]'); \
			fi; \
		fi; \
		veam_usb_drive="$${veam_usb_drive:-E:}"; \
		drive_letter=$$(printf '%s' "$$veam_usb_drive" | cut -c1 | tr '[:upper:]' '[:lower:]'); \
		veam_usb_mount="$${veam_usb_mount:-/mnt/$$drive_letter}"; \
		printf 'veam_usb_mode=%s\n' "$$veam_usb_mode"; \
		printf 'veam_usb_drive=%s\n' "$$veam_usb_drive"; \
		printf 'veam_usb_mount=%s\n' "$$veam_usb_mount"; \
		if [ "$$veam_usb_mode" = 'windows-wsl' ]; then \
		if mountpoint -q "$$veam_usb_mount"; then \
			printf 'veam_usb_mount=already_mounted\n'; \
		else \
			sudo mkdir -p "$$veam_usb_mount"; \
			sudo mount -t drvfs "$$veam_usb_drive" "$$veam_usb_mount"; \
			printf 'veam_usb_mount=mounted\n'; \
		fi; \
	else \
		if [ ! -d "$$veam_usb_mount" ]; then \
			printf 'veam_usb_mount=missing path=%s\n' "$$veam_usb_mount" >&2; \
			exit 1; \
		fi; \
		printf 'veam_usb_mount=existing\n'; \
	fi; \
	find "$$veam_usb_mount" -maxdepth 2 -iname '*.veam' -print

veam-usb-redeploy: veam-usb-mount
	@$(RUN_ENV) \
		veam_usb_drive="$${VEAM_USB_OVERRIDE_DRIVE:-$${VEAM_USB_DRIVE:-}}"; \
		veam_usb_mount="$${VEAM_USB_OVERRIDE_HOST_MOUNT:-$${VEAM_USB_HOST_MOUNT:-}}"; \
		if [ -z "$$veam_usb_drive" ] && [ -n "$$veam_usb_mount" ]; then \
			mount_name=$$(basename "$$veam_usb_mount"); \
			if [ "$${#mount_name}" -eq 1 ]; then \
				veam_usb_drive=$$(printf '%s:' "$$mount_name" | tr '[:lower:]' '[:upper:]'); \
			fi; \
		fi; \
		veam_usb_drive="$${veam_usb_drive:-E:}"; \
		drive_letter=$$(printf '%s' "$$veam_usb_drive" | cut -c1 | tr '[:upper:]' '[:lower:]'); \
		veam_usb_mount="$${veam_usb_mount:-/mnt/$$drive_letter}"; \
		veam_usb_container_mount="$${VEAM_USB_CONTAINER_MOUNT:-/host/usb}"; \
		veam_usb_scan_paths="$${VEAM_USB_SCAN_PATHS:-$$veam_usb_container_mount,/host/windows,/host/media,/host/run-media,/host/mnt,/mnt,/host/Volumes,/Volumes}"; \
		VEAM_USB_HOST_MOUNT="$$veam_usb_mount" \
		VEAM_USB_CONTAINER_MOUNT="$$veam_usb_container_mount" \
		VEAM_USB_SCAN_PATHS="$$veam_usb_scan_paths" \
		$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d --force-recreate backend-api

veam-usb-scan:
	curl -s '$(VEAM_API_URL)/veam/scan-license'

ftp-list:
	@if [ '$(FTP_TARGET)' != 'anpr' ] && [ '$(FTP_TARGET)' != 'axle' ]; then \
		printf 'FTP_TARGET must be anpr or axle\n' >&2; \
		exit 2; \
	fi
	@$(COMPOSE) -p $(PROJECT_NAME) -f $(COMPOSE_FILE) exec -T $(FTP_LIST_SERVICE) /app/bin/ftp-list '$(FTP_TARGET)'

services:
	@$(MAKE) backend-api & p1=$$!; \
	$(MAKE) anpr-watcher & p2=$$!; \
	$(MAKE) axle-watcher & p3=$$!; \
	$(MAKE) cctv-streamer & p4=$$!; \
	$(MAKE) sync-agent & p5=$$!; \
	$(MAKE) wb-agent & p6=$$!; \
	trap 'kill $$p1 $$p2 $$p3 $$p4 $$p5 $$p6 2>/dev/null || true' INT TERM EXIT; \
	wait

dev:
	@$(MAKE) services & p1=$$!; \
	$(MAKE) web & p2=$$!; \
	trap 'kill $$p1 $$p2 2>/dev/null || true' INT TERM EXIT; \
	wait

dev-full: infra-up dev
