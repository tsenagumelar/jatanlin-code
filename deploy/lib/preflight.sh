#!/usr/bin/env bash
set -euo pipefail

preflight_check() {
  require_cmd docker
  require_cmd curl
  require_cmd jq
  require_cmd perl

  if ! docker info >/dev/null 2>&1; then
    die "Docker daemon is not reachable"
  fi

  if docker compose version >/dev/null 2>&1; then
    COMPOSE_BIN="docker compose"
  elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_BIN="docker-compose"
  else
    die "Docker Compose not found (need 'docker compose' or 'docker-compose')"
  fi
  export COMPOSE_BIN
}

is_port_in_use() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$port" -sTCP:LISTEN -n -P >/dev/null 2>&1
    return $?
  fi

  if command -v ss >/dev/null 2>&1; then
    ss -ltn "( sport = :$port )" | rg -q ":$port"
    return $?
  fi

  if command -v netstat >/dev/null 2>&1; then
    netstat -an 2>/dev/null | rg -q "[\\.:]$port[[:space:]].*LISTEN"
    return $?
  fi

  warn "No lsof/ss/netstat available; skipping port conflict checks"
  return 1
}

check_required_ports() {
  local ports=(
    "$WEB_PORT"
    "$API_PORT"
    "$WB_PORT"
    "$HASURA_PORT"
    "$NATS_PORT"
    "$FTP_PORT"
    "$POSTGRES_PORT"
    "$MINIO_API_PORT"
    "$MINIO_CONSOLE_PORT"
  )

  local conflicts=()
  local p
  for p in "${ports[@]}"; do
    if is_port_in_use "$p"; then
      conflicts+=("$p")
    fi
  done

  if (( ${#conflicts[@]} > 0 )); then
    die "Port(s) already in use on host: ${conflicts[*]}. Please change values in config file."
  fi
}
