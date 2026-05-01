#!/usr/bin/env bash
set -euo pipefail

assert_http_ok() {
  local name="$1"
  local url="$2"
  if curl -fsS "$url" >/dev/null 2>&1; then
    log "Health OK: $name"
  else
    die "Health check failed: $name ($url)"
  fi
}

verify_stack_running() {
  local expected=(web api-service anpr-service axle-service cctv-service wb-service hasura nats ftp postgres minio)
  local svc
  for svc in "${expected[@]}"; do
    if ! $COMPOSE_BIN -f "$STACK_FILE" -p "$STACK_NAME" ps --services --status running | rg -x "$svc" >/dev/null 2>&1; then
      die "Service is not running: $svc"
    fi
  done
}

verify_deployment() {
  verify_stack_running

  assert_http_ok "web" "http://localhost:${WEB_PORT}"
  assert_http_ok "general api" "http://localhost:${API_PORT}/health"
  assert_http_ok "hasura" "http://localhost:${HASURA_PORT}/healthz"
  assert_http_ok "minio" "http://localhost:${MINIO_API_PORT}/minio/health/live"

  if ! $COMPOSE_BIN -f "$STACK_FILE" -p "$STACK_NAME" exec -T nats nats server check >/dev/null 2>&1; then
    warn "NATS deep check command unavailable, skipping command-based check"
  else
    log "Health OK: nats"
  fi

  if ! $COMPOSE_BIN -f "$STACK_FILE" -p "$STACK_NAME" exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
    die "PostgreSQL readiness check failed"
  fi
  log "Health OK: postgres"
}
