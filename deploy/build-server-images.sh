#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

TAG="${1:-${TAG:-latest}}"
DOCKER_USER="${DOCKER_USER:-taufansena}"
SERVER_HOST="${SERVER_HOST:-51.79.173.213}"

SERVER_WEB_PORT="${SERVER_WEB_PORT:-23000}"
SERVER_API_PORT="${SERVER_API_PORT:-24000}"
SERVER_WIM_PORT="${SERVER_WIM_PORT:-25000}"
SERVER_CCTV_PORT="${SERVER_CCTV_PORT:-26090}"

WEB_ENV_FILE="${WEB_ENV_FILE:-jatanlin-web-apps/.env}"
BACKEND_ENV_FILE="${BACKEND_ENV_FILE:-jatanlin-backend-services/.env}"
OUTPUT_DIR="${OUTPUT_DIR:-deploy/out/server-images}"
STACK_FILE="${STACK_FILE:-${OUTPUT_DIR}/server-stack.yml}"
ENV_FILE="${ENV_FILE:-${OUTPUT_DIR}/server.env}"

WEB_IMAGE="${WEB_IMAGE:-${DOCKER_USER}/jtn-web:${TAG}}"
API_IMAGE="${API_IMAGE:-${DOCKER_USER}/jtn-api-service:${TAG}}"
ANPR_IMAGE="${ANPR_IMAGE:-${DOCKER_USER}/jtn-anpr-service:${TAG}}"
AXLE_IMAGE="${AXLE_IMAGE:-${DOCKER_USER}/jtn-axle-service:${TAG}}"
CCTV_IMAGE="${CCTV_IMAGE:-${DOCKER_USER}/jtn-cctv-service:${TAG}}"
WB_IMAGE="${WB_IMAGE:-${DOCKER_USER}/jtn-wb-service:${TAG}}"
BUILD_WB="${BUILD_WB:-false}"

PLATFORM="${PLATFORM:-linux/amd64}"
if [[ "$BUILD_WB" == "true" ]]; then
  WEIGHING_TRIGGER_PUBLIC_URL="${WEIGHING_TRIGGER_PUBLIC_URL:-http://${SERVER_HOST}:${SERVER_WIM_PORT}/ws/wim/anpr-capture}"
else
  WEIGHING_TRIGGER_PUBLIC_URL="${WEIGHING_TRIGGER_PUBLIC_URL:-}"
fi

log() { printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
require_cmd() { command -v "$1" >/dev/null 2>&1 || die "missing command: $1"; }

load_env_file() {
  local file="$1"
  [[ -f "$file" ]] || die "missing env file: $file"

  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ -z "${line//[[:space:]]/}" ]] && continue
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" == *"="* ]] || continue

    local key="${line%%=*}"
    local value="${line#*=}"

    key="$(printf '%s' "$key" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
    value="$(printf '%s' "$value" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"

    if [[ "$value" =~ ^\".*\"$ ]]; then
      value="${value:1:${#value}-2}"
    elif [[ "$value" =~ ^\'.*\'$ ]]; then
      value="${value:1:${#value}-2}"
    fi

    export "$key=$value"
  done < "$file"
}

env_value() {
  local key="$1"
  local fallback="${2:-}"
  local value="${!key:-$fallback}"
  printf '%s' "$value"
}

yaml_quote() {
  local value="${1:-}"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '"%s"' "$value"
}

write_env_line() {
  local key="$1"
  local value="$2"
  printf '%s=%q\n' "$key" "$value" >> "$ENV_FILE"
}

write_yaml_env_line() {
  local key="$1"
  local value="$2"
  printf '      %s: %s\n' "$key" "$(yaml_quote "$value")" >> "$STACK_FILE"
}

write_common_backend_env() {
  write_yaml_env_line SITE_ID "$(env_value SITE_ID)"
  write_yaml_env_line SITE_CODE "$(env_value SITE_CODE)"
  write_yaml_env_line SITE_NAME "$(env_value SITE_NAME)"
  write_yaml_env_line SITE_LOCATION "$(env_value SITE_LOCATION)"
  write_yaml_env_line SITE_REGION "$(env_value SITE_REGION)"
  write_yaml_env_line DATABASE_URL "$(env_value DATABASE_URL)"
  write_yaml_env_line JWT_SECRET "$(env_value JWT_SECRET)"
  write_yaml_env_line AUTH_ENABLED "$(env_value AUTH_ENABLED false)"
  write_yaml_env_line NATS_URL "$(env_value NATS_URL)"
  write_yaml_env_line SESSION_WINDOW_SECONDS "$(env_value SESSION_WINDOW_SECONDS 600)"
  write_yaml_env_line VEAM_PUBLIC_KEY_B64 "$(env_value VEAM_PUBLIC_KEY_B64)"
  write_yaml_env_line VEAM_LICENSE_PATH "$(env_value VEAM_LICENSE_PATH ./data/license.veam)"
  write_yaml_env_line VEAM_HARDWARE_ID "$(env_value VEAM_HARDWARE_ID)"
}

write_minio_env() {
  write_yaml_env_line ANPR_MINIO_ENDPOINT "$(env_value ANPR_MINIO_ENDPOINT)"
  write_yaml_env_line ANPR_MINIO_ACCESS_KEY "$(env_value ANPR_MINIO_ACCESS_KEY)"
  write_yaml_env_line ANPR_MINIO_SECRET_KEY "$(env_value ANPR_MINIO_SECRET_KEY)"
  write_yaml_env_line ANPR_MINIO_BUCKET "$(env_value ANPR_MINIO_BUCKET)"
  write_yaml_env_line ANPR_MINIO_USE_SSL "$(env_value ANPR_MINIO_USE_SSL false)"
  write_yaml_env_line AXLE_MINIO_ENDPOINT "$(env_value AXLE_MINIO_ENDPOINT)"
  write_yaml_env_line AXLE_MINIO_ACCESS_KEY "$(env_value AXLE_MINIO_ACCESS_KEY)"
  write_yaml_env_line AXLE_MINIO_SECRET_KEY "$(env_value AXLE_MINIO_SECRET_KEY)"
  write_yaml_env_line AXLE_MINIO_BUCKET "$(env_value AXLE_MINIO_BUCKET)"
  write_yaml_env_line AXLE_MINIO_USE_SSL "$(env_value AXLE_MINIO_USE_SSL false)"
  write_yaml_env_line ATTACHMENT_MINIO_ENDPOINT "$(env_value ATTACHMENT_MINIO_ENDPOINT)"
  write_yaml_env_line ATTACHMENT_MINIO_ACCESS_KEY "$(env_value ATTACHMENT_MINIO_ACCESS_KEY)"
  write_yaml_env_line ATTACHMENT_MINIO_SECRET_KEY "$(env_value ATTACHMENT_MINIO_SECRET_KEY)"
  write_yaml_env_line ATTACHMENT_MINIO_BUCKET "$(env_value ATTACHMENT_MINIO_BUCKET)"
  write_yaml_env_line ATTACHMENT_MINIO_USE_SSL "$(env_value ATTACHMENT_MINIO_USE_SSL false)"
}

write_generated_files() {
  mkdir -p "$OUTPUT_DIR"
  : > "$ENV_FILE"
  : > "$STACK_FILE"

  write_env_line TAG "$TAG"
  write_env_line DOCKER_USER "$DOCKER_USER"
  write_env_line SERVER_HOST "$SERVER_HOST"
  write_env_line SERVER_WEB_PORT "$SERVER_WEB_PORT"
  write_env_line SERVER_API_PORT "$SERVER_API_PORT"
  write_env_line SERVER_WIM_PORT "$SERVER_WIM_PORT"
  write_env_line SERVER_CCTV_PORT "$SERVER_CCTV_PORT"
  write_env_line WEB_IMAGE "$WEB_IMAGE"
  write_env_line API_IMAGE "$API_IMAGE"
  write_env_line ANPR_IMAGE "$ANPR_IMAGE"
  write_env_line AXLE_IMAGE "$AXLE_IMAGE"
  write_env_line CCTV_IMAGE "$CCTV_IMAGE"
  write_env_line WB_IMAGE "$WB_IMAGE"

  cat > "$STACK_FILE" <<YAML
services:
  jtn-web:
    image: $(yaml_quote "$WEB_IMAGE")
    platform: ${PLATFORM}
    container_name: jtn-web-server
    restart: unless-stopped
    environment:
YAML
  write_yaml_env_line NEXT_PUBLIC_HASURA_URL "$(env_value NEXT_PUBLIC_HASURA_URL)"
  write_yaml_env_line NEXT_PUBLIC_HASURA_WS "$(env_value NEXT_PUBLIC_HASURA_WS)"
  write_yaml_env_line NEXT_PUBLIC_HASURA_WS_IP "$(env_value NEXT_PUBLIC_HASURA_WS_IP)"
  write_yaml_env_line NEXT_PUBLIC_API_URL "http://${SERVER_HOST}:${SERVER_API_PORT}"
  write_yaml_env_line NEXT_PUBLIC_SITE_ID "$(env_value NEXT_PUBLIC_SITE_ID "$(env_value SITE_ID)")"
  write_yaml_env_line NEXT_PUBLIC_SITE_CODE "$(env_value NEXT_PUBLIC_SITE_CODE "$(env_value SITE_CODE)")"
  write_yaml_env_line NEXT_PUBLIC_SITE_NAME "$(env_value NEXT_PUBLIC_SITE_NAME "$(env_value SITE_NAME)")"
  write_yaml_env_line NEXT_PUBLIC_SITE_LOCATION "$(env_value NEXT_PUBLIC_SITE_LOCATION "$(env_value SITE_LOCATION)")"
  write_yaml_env_line NEXT_PUBLIC_SITE_REGION "$(env_value NEXT_PUBLIC_SITE_REGION "$(env_value SITE_REGION)")"
  write_yaml_env_line NEXT_PUBLIC_MINIO_URL "$(env_value NEXT_PUBLIC_MINIO_URL "http://${SERVER_HOST}:9000")"
  write_yaml_env_line NEXT_PUBLIC_DEVICE_CHECK_PROD_MODE "$(env_value NEXT_PUBLIC_DEVICE_CHECK_PROD_MODE false)"
  write_yaml_env_line NEXT_PUBLIC_DEVICE_CHECK_TIMEOUT_MS "$(env_value NEXT_PUBLIC_DEVICE_CHECK_TIMEOUT_MS 3000)"
  write_yaml_env_line NEXT_PUBLIC_ANPR_IP "$(env_value NEXT_PUBLIC_ANPR_IP)"
  write_yaml_env_line NEXT_PUBLIC_AXLE_IP "$(env_value NEXT_PUBLIC_AXLE_IP)"
  write_yaml_env_line NEXT_PUBLIC_CCTV_IP "$(env_value NEXT_PUBLIC_CCTV_IP)"
  write_yaml_env_line NEXT_PUBLIC_WIM_IP "$(env_value NEXT_PUBLIC_WIM_IP)"
  cat >> "$STACK_FILE" <<YAML
    ports:
      - target: 3000
        published: ${SERVER_WEB_PORT}
        protocol: tcp
        mode: host

  jtn-api:
    image: $(yaml_quote "$API_IMAGE")
    platform: ${PLATFORM}
    container_name: jtn-api-server
    restart: unless-stopped
    environment:
      SERVICE: "api"
YAML
  write_common_backend_env
  write_yaml_env_line API_PORT "4000"
  write_yaml_env_line ANPR_FTP_HOST "$(env_value ANPR_FTP_HOST)"
  write_yaml_env_line ANPR_FTP_USER "$(env_value ANPR_FTP_USER)"
  write_yaml_env_line ANPR_FTP_PASS "$(env_value ANPR_FTP_PASS)"
  write_yaml_env_line ANPR_FTP_DIR "$(env_value ANPR_FTP_DIR)"
  write_yaml_env_line ANPR_FTP_INTERVAL_SEC "$(env_value ANPR_FTP_INTERVAL_SEC 5)"
  write_yaml_env_line AXLE_FTP_HOST "$(env_value AXLE_FTP_HOST)"
  write_yaml_env_line AXLE_FTP_USER "$(env_value AXLE_FTP_USER)"
  write_yaml_env_line AXLE_FTP_PASS "$(env_value AXLE_FTP_PASS)"
  write_yaml_env_line AXLE_FTP_DIR "$(env_value AXLE_FTP_DIR)"
  write_yaml_env_line AXLE_FTP_INTERVAL_SEC "$(env_value AXLE_FTP_INTERVAL_SEC 5)"
  write_minio_env
  write_yaml_env_line DIMENSION_ENABLED "$(env_value DIMENSION_ENABLED true)"
  write_yaml_env_line DIMENSION_DUMMY_ENABLED "$(env_value DIMENSION_DUMMY_ENABLED true)"
  write_yaml_env_line WEIGHING_TRIGGER_URL "$WEIGHING_TRIGGER_PUBLIC_URL"
  write_yaml_env_line WEIGHING_TRIGGER_DIRECTION "$(env_value WEIGHING_TRIGGER_DIRECTION RIGHT)"
  write_yaml_env_line WEIGHING_TRIGGER_TIMEOUT_SECONDS "$(env_value WEIGHING_TRIGGER_TIMEOUT_SECONDS 25)"
  write_yaml_env_line WEIGHING_TRIGGER_SAVE "$(env_value WEIGHING_TRIGGER_SAVE true)"
  write_yaml_env_line WEIGHING_TRIGGER_DUMMY "$(env_value WEIGHING_TRIGGER_DUMMY false)"
  write_yaml_env_line CCTV_TRIGGER_ENABLED "$(env_value CCTV_TRIGGER_ENABLED true)"
  write_yaml_env_line CCTV_TRIGGER_URL "http://${SERVER_HOST}:${SERVER_CCTV_PORT}/record"
  write_yaml_env_line CCTV_TRIGGER_SECONDS "$(env_value CCTV_TRIGGER_SECONDS 20)"
  write_yaml_env_line CCTV_TRIGGER_DUMMY "$(env_value CCTV_TRIGGER_DUMMY true)"
  cat >> "$STACK_FILE" <<YAML
    ports:
      - target: 4000
        published: ${SERVER_API_PORT}
        protocol: tcp
        mode: host
    volumes:
      - jtn-api-license-data:/app/data
    extra_hosts:
      - "host.docker.internal:host-gateway"

  jtn-anpr:
    image: $(yaml_quote "$ANPR_IMAGE")
    platform: ${PLATFORM}
    container_name: jtn-anpr-server
    restart: unless-stopped
    depends_on:
      - jtn-api
    environment:
      SERVICE: "anpr-watcher"
YAML
  write_common_backend_env
  write_yaml_env_line ANPR_FTP_HOST "$(env_value ANPR_FTP_HOST)"
  write_yaml_env_line ANPR_FTP_USER "$(env_value ANPR_FTP_USER)"
  write_yaml_env_line ANPR_FTP_PASS "$(env_value ANPR_FTP_PASS)"
  write_yaml_env_line ANPR_FTP_DIR "$(env_value ANPR_FTP_DIR)"
  write_yaml_env_line ANPR_FTP_INTERVAL_SEC "$(env_value ANPR_FTP_INTERVAL_SEC 5)"
  write_yaml_env_line ANPR_DUMMY_ENABLED "$(env_value ANPR_DUMMY_ENABLED true)"
  write_minio_env
  write_yaml_env_line DIMENSION_ENABLED "$(env_value DIMENSION_ENABLED true)"
  write_yaml_env_line DIMENSION_DUMMY_ENABLED "$(env_value DIMENSION_DUMMY_ENABLED true)"
  write_yaml_env_line WEIGHING_TRIGGER_URL "$WEIGHING_TRIGGER_PUBLIC_URL"
  write_yaml_env_line WEIGHING_TRIGGER_DUMMY "$(env_value WEIGHING_TRIGGER_DUMMY false)"
  write_yaml_env_line CCTV_TRIGGER_URL "http://${SERVER_HOST}:${SERVER_CCTV_PORT}/record"
  write_yaml_env_line CCTV_TRIGGER_DUMMY "$(env_value CCTV_TRIGGER_DUMMY true)"
  cat >> "$STACK_FILE" <<YAML
    extra_hosts:
      - "host.docker.internal:host-gateway"

  jtn-axle:
    image: $(yaml_quote "$AXLE_IMAGE")
    platform: ${PLATFORM}
    container_name: jtn-axle-server
    restart: unless-stopped
    depends_on:
      - jtn-api
    environment:
      SERVICE: "axle-watcher"
YAML
  write_common_backend_env
  write_yaml_env_line AXLE_FTP_HOST "$(env_value AXLE_FTP_HOST)"
  write_yaml_env_line AXLE_FTP_USER "$(env_value AXLE_FTP_USER)"
  write_yaml_env_line AXLE_FTP_PASS "$(env_value AXLE_FTP_PASS)"
  write_yaml_env_line AXLE_FTP_DIR "$(env_value AXLE_FTP_DIR)"
  write_yaml_env_line AXLE_FTP_INTERVAL_SEC "$(env_value AXLE_FTP_INTERVAL_SEC 5)"
  write_yaml_env_line AXLE_DUMMY_ENABLED "$(env_value AXLE_DUMMY_ENABLED true)"
  write_minio_env
  cat >> "$STACK_FILE" <<YAML
    extra_hosts:
      - "host.docker.internal:host-gateway"

  jtn-cctv:
    image: $(yaml_quote "$CCTV_IMAGE")
    platform: ${PLATFORM}
    container_name: jtn-cctv-server
    restart: unless-stopped
    depends_on:
      - jtn-api
    environment:
      SERVICE: "cctv-streamer"
YAML
  write_common_backend_env
  write_minio_env
  write_yaml_env_line CCTV_MODE "$(env_value CCTV_MODE rtsp)"
  write_yaml_env_line CCTV_RTSP_URL "$(env_value CCTV_RTSP_URL "$(env_value RTSP_URL)")"
  write_yaml_env_line RTSP_URL "$(env_value RTSP_URL "$(env_value CCTV_RTSP_URL)")"
  write_yaml_env_line ONVIF_ENDPOINT "$(env_value ONVIF_ENDPOINT)"
  write_yaml_env_line ONVIF_USERNAME "$(env_value ONVIF_USERNAME)"
  write_yaml_env_line ONVIF_PASSWORD "$(env_value ONVIF_PASSWORD)"
  write_yaml_env_line CCTV_TRIGGER_DUMMY "$(env_value CCTV_TRIGGER_DUMMY true)"
  write_yaml_env_line CCTV_HTTP_PORT "8090"
  write_yaml_env_line PORT "8090"
  cat >> "$STACK_FILE" <<YAML
    ports:
      - target: 8090
        published: ${SERVER_CCTV_PORT}
        protocol: tcp
        mode: host
    extra_hosts:
      - "host.docker.internal:host-gateway"
YAML

  if [[ "$BUILD_WB" == "true" ]]; then
    cat >> "$STACK_FILE" <<YAML
  jtn-wb:
    image: $(yaml_quote "$WB_IMAGE")
    platform: ${PLATFORM}
    container_name: jtn-wb-server
    restart: unless-stopped
    environment:
      ASPNETCORE_URLS: "http://+:5000"
YAML
  write_yaml_env_line DATABASE_URL "$(env_value DATABASE_URL)"
  write_yaml_env_line NATS_URL "$(env_value NATS_URL)"
  write_yaml_env_line SITE_CODE "$(env_value SITE_CODE)"
  write_yaml_env_line SITE_NAME "$(env_value SITE_NAME)"
  write_yaml_env_line SITE_LOCATION "$(env_value SITE_LOCATION)"
  write_yaml_env_line SITE_REGION "$(env_value SITE_REGION)"
  write_yaml_env_line WB_SITE_CODE "$(env_value SITE_CODE)"
  write_yaml_env_line WB_SITE_ID "$(env_value SITE_ID)"
  write_yaml_env_line WB_DUMMY_ENABLED "$(env_value WB_DUMMY_ENABLED true)"
  write_yaml_env_line WB_SESSION_LISTENER_ENABLED "$(env_value WB_SESSION_LISTENER_ENABLED true)"
  write_yaml_env_line WB_CAPTURE_TIMEOUT_SEC "$(env_value WB_CAPTURE_TIMEOUT_SEC 60)"
  write_yaml_env_line WB_CAPTURE_DIRECTION "$(env_value WB_CAPTURE_DIRECTION RIGHT)"
  write_yaml_env_line WB_LOCATION_CODE "$(env_value WB_LOCATION_CODE GATE-A1)"
  write_yaml_env_line WServer__Host "$(env_value WIM_IP "$(env_value NEXT_PUBLIC_WIM_IP 10.0.43.10)")"
  write_yaml_env_line WServer__Port "$(env_value WSERVER_PORT 65002)"
  write_yaml_env_line WServer__Username "$(env_value WSERVER_USERNAME admin)"
  write_yaml_env_line WServer__Password "$(env_value WSERVER_PASSWORD admin)"
  write_yaml_env_line Nats__Url "$(env_value NATS_URL)"
  write_yaml_env_line ConnectionStrings__PostgresDatabase "$(env_value DATABASE_URL)"
  cat >> "$STACK_FILE" <<YAML
    ports:
      - target: 5000
        published: ${SERVER_WIM_PORT}
        protocol: tcp
        mode: host
    extra_hosts:
      - "host.docker.internal:host-gateway"
YAML
  fi

  cat >> "$STACK_FILE" <<YAML

volumes:
  jtn-api-license-data:
YAML
}

require_cmd docker
docker info >/dev/null 2>&1 || die "docker daemon is not reachable"

log "Loading env files"
load_env_file "$BACKEND_ENV_FILE"
load_env_file "$WEB_ENV_FILE"

export NEXT_PUBLIC_API_URL="http://${SERVER_HOST}:${SERVER_API_PORT}"

log "Building web image: ${WEB_IMAGE}"
docker build \
  --platform "$PLATFORM" \
  -t "$WEB_IMAGE" \
  --build-arg NEXT_PUBLIC_HASURA_URL="$(env_value NEXT_PUBLIC_HASURA_URL)" \
  --build-arg NEXT_PUBLIC_HASURA_WS="$(env_value NEXT_PUBLIC_HASURA_WS)" \
  --build-arg NEXT_PUBLIC_HASURA_WS_IP="$(env_value NEXT_PUBLIC_HASURA_WS_IP)" \
  --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  --build-arg NEXT_PUBLIC_SITE_ID="$(env_value NEXT_PUBLIC_SITE_ID "$(env_value SITE_ID)")" \
  --build-arg NEXT_PUBLIC_SITE_CODE="$(env_value NEXT_PUBLIC_SITE_CODE "$(env_value SITE_CODE)")" \
  --build-arg NEXT_PUBLIC_SITE_NAME="$(env_value NEXT_PUBLIC_SITE_NAME "$(env_value SITE_NAME)")" \
  --build-arg NEXT_PUBLIC_SITE_LOCATION="$(env_value NEXT_PUBLIC_SITE_LOCATION "$(env_value SITE_LOCATION)")" \
  --build-arg NEXT_PUBLIC_SITE_REGION="$(env_value NEXT_PUBLIC_SITE_REGION "$(env_value SITE_REGION)")" \
  --build-arg NEXT_PUBLIC_MINIO_URL="$(env_value NEXT_PUBLIC_MINIO_URL "http://${SERVER_HOST}:9000")" \
  --build-arg NEXT_PUBLIC_DEVICE_CHECK_PROD_MODE="$(env_value NEXT_PUBLIC_DEVICE_CHECK_PROD_MODE false)" \
  --build-arg NEXT_PUBLIC_DEVICE_CHECK_TIMEOUT_MS="$(env_value NEXT_PUBLIC_DEVICE_CHECK_TIMEOUT_MS 3000)" \
  --build-arg NEXT_PUBLIC_ANPR_IP="$(env_value NEXT_PUBLIC_ANPR_IP)" \
  --build-arg NEXT_PUBLIC_AXLE_IP="$(env_value NEXT_PUBLIC_AXLE_IP)" \
  --build-arg NEXT_PUBLIC_CCTV_IP="$(env_value NEXT_PUBLIC_CCTV_IP)" \
  --build-arg NEXT_PUBLIC_WIM_IP="$(env_value NEXT_PUBLIC_WIM_IP)" \
  -f jatanlin-web-apps/Dockerfile jatanlin-web-apps

log "Building backend multi-service image: ${API_IMAGE}"
docker build \
  --platform "$PLATFORM" \
  -t "$API_IMAGE" \
  -f jatanlin-backend-services/Dockerfile jatanlin-backend-services

log "Tagging backend image for watcher/streamer services"
docker tag "$API_IMAGE" "$ANPR_IMAGE"
docker tag "$API_IMAGE" "$AXLE_IMAGE"
docker tag "$API_IMAGE" "$CCTV_IMAGE"

if [[ "$BUILD_WB" == "true" ]]; then
  log "Building WIM/WB image: ${WB_IMAGE}"
  docker build \
    --platform "$PLATFORM" \
    -t "$WB_IMAGE" \
    -f jatanlin-wb-agent/Dockerfile jatanlin-wb-agent
else
  log "Skipping WIM/WB image build (set BUILD_WB=true to build it): ${WB_IMAGE}"
fi

write_generated_files

if [[ "${PUSH:-false}" == "true" ]]; then
  log "Pushing images"
  docker push "$WEB_IMAGE"
  docker push "$API_IMAGE"
  docker push "$ANPR_IMAGE"
  docker push "$AXLE_IMAGE"
  docker push "$CCTV_IMAGE"
  if [[ "$BUILD_WB" == "true" ]]; then
    docker push "$WB_IMAGE"
  else
    log "Skipping WIM/WB image push because BUILD_WB=false: ${WB_IMAGE}"
  fi
fi

log "Done"
printf 'Images:\n'
printf '  - %s\n' "$WEB_IMAGE" "$API_IMAGE" "$ANPR_IMAGE" "$AXLE_IMAGE" "$CCTV_IMAGE" "$WB_IMAGE"
printf 'Generated files:\n'
printf '  - %s\n' "$STACK_FILE" "$ENV_FILE"
printf 'Server ports:\n'
printf '  - web:  %s -> container 3000\n' "$SERVER_WEB_PORT"
printf '  - api:  %s -> container 4000\n' "$SERVER_API_PORT"
printf '  - wim:  %s -> container 5000\n' "$SERVER_WIM_PORT"
printf '  - cctv: %s -> container 8090\n' "$SERVER_CCTV_PORT"
printf '  - anpr/axle: no published HTTP port; watcher processes only\n'
