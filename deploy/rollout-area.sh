#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

source deploy/lib/common.sh
source deploy/lib/preflight.sh
source deploy/lib/config-loader.sh
source deploy/lib/render-stack.sh
source deploy/lib/portainer.sh
source deploy/lib/migrate-seed.sh
source deploy/lib/verify.sh

MODE="install"
CONFIG_FILE=""
SKIP_VERIFY="false"

usage() {
  cat <<USAGE
Usage:
  ./deploy/rollout-area.sh --config <file> [--mode install|upgrade|validate] [--skip-verify]

Examples:
  ./deploy/rollout-area.sh --config deploy/configs/area.example.env --mode validate
  ./deploy/rollout-area.sh --config deploy/configs/area-mampang.env --mode install
  ./deploy/rollout-area.sh --config deploy/configs/area-mampang.env --mode upgrade
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --config)
      CONFIG_FILE="${2:-}"
      shift 2
      ;;
    --mode)
      MODE="${2:-}"
      shift 2
      ;;
    --skip-verify)
      SKIP_VERIFY="true"
      shift 1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "Unknown argument: $1"
      ;;
  esac
done

[[ -n "$CONFIG_FILE" ]] || {
  usage
  die "--config is required"
}

case "$MODE" in
  install|upgrade|validate) ;;
  *) die "Invalid --mode: $MODE" ;;
esac

log "Loading config: $CONFIG_FILE"
preflight_check
load_config "$CONFIG_FILE"
if [[ "$MODE" != "upgrade" ]]; then
  check_required_ports
fi

log "Area: ${AREA_CODE} | Stack: ${STACK_NAME} | Mode: ${MODE}"
render_stack

if [[ "$MODE" == "validate" ]]; then
  log "Validation success. Rendered stack file: $STACK_FILE"
  exit 0
fi

ensure_portainer
wait_portainer

log "Deploying stack with ${COMPOSE_BIN}"
$COMPOSE_BIN -f "$STACK_FILE" -p "$STACK_NAME" pull

if [[ "$MODE" == "install" ]]; then
  log "Starting infra services first (postgres/minio/nats/ftp/hasura)"
  $COMPOSE_BIN -f "$STACK_FILE" -p "$STACK_NAME" up -d --force-recreate postgres minio nats ftp hasura

  run_migrations
  run_seed

  log "Starting application services after DB bootstrap"
  $COMPOSE_BIN -f "$STACK_FILE" -p "$STACK_NAME" up -d --force-recreate web api-service anpr-service axle-service cctv-service wb-service
else
  $COMPOSE_BIN -f "$STACK_FILE" -p "$STACK_NAME" up -d --force-recreate
fi


if [[ "$SKIP_VERIFY" != "true" ]]; then
  verify_deployment
fi

log "Deployment finished successfully"
log "Output artifacts: $OUTPUT_DIR"
