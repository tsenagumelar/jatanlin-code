#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

TAG="${1:-latest}"
DOCKER_USER="${DOCKER_USER:-taufansena}"
PLATFORM="${PLATFORM:-linux/arm64/v8}"
PUBLIC_HASURA_PORT="${PUBLIC_HASURA_PORT:-18080}"
PUBLIC_API_PORT="${PUBLIC_API_PORT:-14000}"

log() { printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }

require_cmd() { command -v "$1" >/dev/null 2>&1 || { echo "missing command: $1"; exit 1; }; }

require_cmd docker

docker info >/dev/null 2>&1 || { echo "docker daemon is not reachable"; exit 1; }

WEB_IMAGE="${DOCKER_USER}/jtn-web:${TAG}"
API_IMAGE="${DOCKER_USER}/jtn-api-service:${TAG}"
ANPR_IMAGE="${DOCKER_USER}/jtn-anpr-service:${TAG}"
AXLE_IMAGE="${DOCKER_USER}/jtn-axle-service:${TAG}"
CCTV_IMAGE="${DOCKER_USER}/jtn-cctv-service:${TAG}"
WB_IMAGE="${DOCKER_USER}/jtn-wb-service:${TAG}"

log "Building WEB image: ${WEB_IMAGE}"
docker build \
  --platform "${PLATFORM}" \
  -t "${WEB_IMAGE}" \
  --build-arg NEXT_PUBLIC_HASURA_URL="http://localhost:${PUBLIC_HASURA_PORT}/v1/graphql" \
  --build-arg NEXT_PUBLIC_HASURA_WS="ws://localhost:${PUBLIC_HASURA_PORT}/v1/graphql" \
  --build-arg NEXT_PUBLIC_HASURA_WS_IP="ws://localhost:${PUBLIC_HASURA_PORT}/v1/graphql" \
  --build-arg NEXT_PUBLIC_HASURA_SECRET="dev-secret" \
  --build-arg NEXT_PUBLIC_API_URL="http://localhost:${PUBLIC_API_PORT}" \
  --build-arg NEXT_PUBLIC_SITE_ID="" \
  --build-arg NEXT_PUBLIC_SITE_CODE="" \
  --build-arg NEXT_PUBLIC_SITE_NAME="" \
  --build-arg NEXT_PUBLIC_SITE_LOCATION="" \
  --build-arg NEXT_PUBLIC_SITE_REGION="" \
  --build-arg NEXT_PUBLIC_MINIO_URL="http://localhost:9000" \
  -f jatanlin-web-apps/Dockerfile jatanlin-web-apps

log "Building backend base image once"
docker build --platform "${PLATFORM}" -t "${API_IMAGE}" -f jatanlin-backend-services/Dockerfile jatanlin-backend-services

docker tag "${API_IMAGE}" "${ANPR_IMAGE}"
docker tag "${API_IMAGE}" "${AXLE_IMAGE}"
docker tag "${API_IMAGE}" "${CCTV_IMAGE}"

log "Building WB image: ${WB_IMAGE}"
docker build --platform "${PLATFORM}" -t "${WB_IMAGE}" -f jatanlin-wb-agent/Dockerfile jatanlin-wb-agent

log "Pushing images"
docker push "${WEB_IMAGE}"
docker push "${API_IMAGE}"
docker push "${ANPR_IMAGE}"
docker push "${AXLE_IMAGE}"
docker push "${CCTV_IMAGE}"
docker push "${WB_IMAGE}"

log "Done. Published images:"
printf '%s\n' \
  "- ${WEB_IMAGE}" \
  "- ${API_IMAGE}" \
  "- ${ANPR_IMAGE}" \
  "- ${AXLE_IMAGE}" \
  "- ${CCTV_IMAGE}" \
  "- ${WB_IMAGE}"
