#!/usr/bin/env bash
set -euo pipefail

ensure_portainer() {
  if docker container inspect portainer >/dev/null 2>&1; then
    local state
    state="$(docker inspect -f '{{.State.Status}}' portainer 2>/dev/null || true)"
    if [[ "$state" == "running" ]]; then
      log "Portainer container already running"
    else
      log "Starting existing Portainer container"
      docker start portainer >/dev/null
    fi
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
