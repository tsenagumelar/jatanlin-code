#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/deploy/docker-compose.ftp-local.yml"
DATA_DIR="$ROOT_DIR/deploy/ftp-local-data"
PROJECT_NAME="${PROJECT_NAME:-jatanlin-ftp-local}"

usage() {
  cat <<'EOF'
Usage:
  ./deploy/run-ftp-local.sh [start|stop|restart|status|logs]

Default command: start

FTP local:
  Host from Mac/local process : localhost:10021
  Host from Docker container  : host.docker.internal:10021
  User                        : ftpuser
  Password                    : ftppass
  ANPR dir                    : /anpr
  AXLE dir                    : /axle
EOF
}

docker_compose() {
  docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" "$@"
}

ensure_dirs() {
  mkdir -p "$DATA_DIR/anpr" "$DATA_DIR/axle"
}

print_env() {
  cat <<EOF

FTP local is ready.

Backend env jika backend jalan langsung di Mac:
ANPR_FTP_HOST=localhost:10021
ANPR_FTP_USER=ftpuser
ANPR_FTP_PASS=ftppass
ANPR_FTP_DIR=/anpr
ANPR_FTP_INTERVAL_SEC=5

AXLE_FTP_HOST=localhost:10021
AXLE_FTP_USER=ftpuser
AXLE_FTP_PASS=ftppass
AXLE_FTP_DIR=/axle
AXLE_FTP_INTERVAL_SEC=5

Jika backend jalan di Docker container:
ANPR_FTP_HOST=host.docker.internal:10021
AXLE_FTP_HOST=host.docker.internal:10021

Folder data:
$DATA_DIR/anpr
$DATA_DIR/axle
EOF
}

cmd="${1:-start}"

case "$cmd" in
  start|up)
    ensure_dirs
    docker_compose up -d
    print_env
    ;;
  stop|down)
    docker_compose down
    ;;
  restart)
    ensure_dirs
    docker_compose down
    docker_compose up -d
    print_env
    ;;
  status|ps)
    docker_compose ps
    ;;
  logs)
    docker_compose logs -f ftp-local
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    usage
    exit 1
    ;;
esac
