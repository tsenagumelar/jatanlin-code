#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

TAG="${1:-latest}"
DOCKER_USER="${DOCKER_USER:-taufansena}"
if [[ -z "${PLATFORM:-}" ]]; then
  ARCH="$(docker info --format '{{.Architecture}}' 2>/dev/null || true)"
  case "$ARCH" in
    amd64|x86_64) PLATFORM="linux/amd64" ;;
    arm64|aarch64) PLATFORM="linux/arm64/v8" ;;
    *) PLATFORM="linux/amd64" ;;
  esac
fi

log() { printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }

require_cmd() { command -v "$1" >/dev/null 2>&1 || { echo "missing command: $1"; exit 1; }; }

require_cmd docker

docker info >/dev/null 2>&1 || { echo "docker daemon is not reachable"; exit 1; }

WEB_IMAGE="${DOCKER_USER}/jtn-web:${TAG}"
API_IMAGE="${DOCKER_USER}/jtn-api-service:${TAG}"
ANPR_IMAGE="${DOCKER_USER}/jtn-anpr-service:${TAG}"
AXLE_IMAGE="${DOCKER_USER}/jtn-axle-service:${TAG}"

WEB_ENV_FILE="jatanlin-web-apps/.env"
if [[ ! -f "${WEB_ENV_FILE}" ]]; then
  echo "missing file: ${WEB_ENV_FILE}"
  exit 1
fi

# Load build-time NEXT_PUBLIC_* variables from web env (without executing the file).
while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%$'\r'}"
  [[ -z "${line// }" ]] && continue
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ "$line" != *=* ]] && continue

  key="${line%%=*}"
  value="${line#*=}"

  # Trim key and leading/trailing whitespace on value.
  key="${key#"${key%%[![:space:]]*}"}"
  key="${key%"${key##*[![:space:]]}"}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"

  export "${key}=${value}"
done < "${WEB_ENV_FILE}"

log "Building WEB image: ${WEB_IMAGE}"
docker build \
  --platform "${PLATFORM}" \
  -t "${WEB_IMAGE}" \
  --build-arg NEXT_PUBLIC_HASURA_URL="${NEXT_PUBLIC_HASURA_URL:-}" \
  --build-arg NEXT_PUBLIC_HASURA_WS="${NEXT_PUBLIC_HASURA_WS:-}" \
  --build-arg NEXT_PUBLIC_HASURA_WS_IP="${NEXT_PUBLIC_HASURA_WS_IP:-}" \
  --build-arg NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-}" \
  --build-arg NEXT_PUBLIC_SITE_ID="${NEXT_PUBLIC_SITE_ID:-}" \
  --build-arg NEXT_PUBLIC_SITE_CODE="${NEXT_PUBLIC_SITE_CODE:-}" \
  --build-arg NEXT_PUBLIC_SITE_NAME="${NEXT_PUBLIC_SITE_NAME:-}" \
  --build-arg NEXT_PUBLIC_SITE_LOCATION="${NEXT_PUBLIC_SITE_LOCATION:-}" \
  --build-arg NEXT_PUBLIC_SITE_REGION="${NEXT_PUBLIC_SITE_REGION:-}" \
  --build-arg NEXT_PUBLIC_MINIO_URL="${NEXT_PUBLIC_MINIO_URL:-}" \
  -f jatanlin-web-apps/Dockerfile jatanlin-web-apps

log "Building backend base image once"
docker build --platform "${PLATFORM}" -t "${API_IMAGE}" -f jatanlin-backend-services/Dockerfile jatanlin-backend-services

docker tag "${API_IMAGE}" "${ANPR_IMAGE}"
docker tag "${API_IMAGE}" "${AXLE_IMAGE}"

log "Pushing images"
docker push "${WEB_IMAGE}"
docker push "${API_IMAGE}"
docker push "${ANPR_IMAGE}"
docker push "${AXLE_IMAGE}"

log "Done. Published images:"
printf '%s\n' \
  "- ${WEB_IMAGE}" \
  "- ${API_IMAGE}" \
  "- ${ANPR_IMAGE}" \
  "- ${AXLE_IMAGE}"
