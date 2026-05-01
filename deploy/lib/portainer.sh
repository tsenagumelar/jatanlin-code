#!/usr/bin/env bash
set -euo pipefail

ensure_portainer() {
  if docker ps --format '{{.Names}}' | rg -x 'portainer' >/dev/null 2>&1; then
    log "Portainer container already running"
    return
  fi

  if docker ps -a --format '{{.Names}}' | rg -x 'portainer' >/dev/null 2>&1; then
    log "Starting existing Portainer container"
    docker start portainer >/dev/null
    return
  fi

  log "Installing Portainer CE container"
  docker volume create portainer_data >/dev/null
  docker run -d \
    --name portainer \
    --restart=unless-stopped \
    -p 9000:9000 \
    -p 9443:9443 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v portainer_data:/data \
    portainer/portainer-ce:latest >/dev/null
}

wait_portainer() {
  local timeout_sec="${1:-60}"
  local start_ts
  start_ts=$(date +%s)

  while true; do
    if curl -fsS "http://localhost:9000/api/status" >/dev/null 2>&1; then
      log "Portainer API reachable on http://localhost:9000"
      break
    fi

    if (( $(date +%s) - start_ts > timeout_sec )); then
      die "Portainer API is not reachable after ${timeout_sec}s"
    fi
    sleep 2
  done
}
