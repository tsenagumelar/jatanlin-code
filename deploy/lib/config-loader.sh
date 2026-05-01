#!/usr/bin/env bash
set -euo pipefail

load_config() {
  local config_file="$1"
  [[ -f "$config_file" ]] || die "Config file not found: $config_file"

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
  done < "$config_file"

  : "${AREA_CODE:?AREA_CODE is required}"
  : "${SITE_CODE:?SITE_CODE is required}"
  : "${SITE_NAME:?SITE_NAME is required}"
  : "${SITE_REGION:?SITE_REGION is required}"

  : "${POSTGRES_DB:?POSTGRES_DB is required}"
  : "${POSTGRES_USER:?POSTGRES_USER is required}"
  : "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"

  : "${JWT_SECRET:?JWT_SECRET is required}"
  : "${HASURA_GRAPHQL_ADMIN_SECRET:?HASURA_GRAPHQL_ADMIN_SECRET is required}"

  : "${DEFAULT_ADMIN_USERNAME:?DEFAULT_ADMIN_USERNAME is required}"
  : "${DEFAULT_ADMIN_PASSWORD:?DEFAULT_ADMIN_PASSWORD is required}"
  : "${DEFAULT_ADMIN_FULL_NAME:?DEFAULT_ADMIN_FULL_NAME is required}"

  : "${WEB_IMAGE:?WEB_IMAGE is required}"
  : "${GENERAL_API_IMAGE:?GENERAL_API_IMAGE is required}"
  : "${ANPR_IMAGE:?ANPR_IMAGE is required}"
  : "${AXLE_IMAGE:?AXLE_IMAGE is required}"
  : "${CCTV_IMAGE:?CCTV_IMAGE is required}"
  : "${WB_IMAGE:?WB_IMAGE is required}"

  : "${WEB_PORT:=13000}"
  : "${API_PORT:=14000}"
  : "${POSTGRES_PORT:=15432}"
  : "${MINIO_API_PORT:=19000}"
  : "${MINIO_CONSOLE_PORT:=19001}"
  : "${HASURA_PORT:=18080}"
  : "${NATS_PORT:=14222}"
  : "${FTP_PORT:=10021}"
  : "${WB_PORT:=15000}"

  : "${RUN_DB_MIGRATION_ON_INSTALL:=true}"
  : "${RUN_MASTER_SEED_ON_INSTALL:=true}"
  : "${AUTH_ENABLED:=true}"
  : "${HOST_PUBLIC_URL:=http://localhost}"

  : "${POSTGRES_IMAGE:=postgres:15-alpine}"
  : "${MINIO_IMAGE:=minio/minio:latest}"
  : "${HASURA_IMAGE:=hasura/graphql-engine:v2.44.0}"
  : "${NATS_IMAGE:=nats:2.11-alpine}"
  : "${FTP_IMAGE:=delfer/alpine-ftp-server:latest}"
  : "${SERVICE_PLATFORM:=linux/arm64/v8}"

  : "${MINIO_ROOT_USER:=minioadmin}"
  : "${MINIO_ROOT_PASSWORD:=minioadmin123}"

  : "${ANPR_MINIO_BUCKET:=anpr}"
  : "${AXLE_MINIO_BUCKET:=axle}"
  : "${ATTACHMENT_MINIO_BUCKET:=attachment}"

  : "${ANPR_FTP_DIR:=/anpr}"
  : "${ANPR_FTP_USER:=ftpuser}"
  : "${ANPR_FTP_PASS:=ftppass}"
  : "${ANPR_FTP_INTERVAL_SEC:=5}"
  : "${ANPR_DUMMY_ENABLED:=false}"

  : "${AXLE_FTP_DIR:=/axle}"
  : "${AXLE_FTP_USER:=ftpuser}"
  : "${AXLE_FTP_PASS:=ftppass}"
  : "${AXLE_FTP_INTERVAL_SEC:=5}"
  : "${AXLE_DUMMY_ENABLED:=false}"

  : "${RTSP_URL:=}"
  : "${CCTV_TRIGGER_DUMMY:=true}"
  : "${WEIGHING_TRIGGER_DUMMY:=false}"
  : "${NATS_USER:=nats}"
  : "${NATS_PASSWORD:=natspass}"

  : "${DEFAULT_ADMIN_EMAIL:=admin@${AREA_CODE}.local}"
  : "${DEFAULT_ADMIN_BADGE_NO:=ADMIN-${AREA_CODE}}"
  : "${DEFAULT_ADMIN_PHONE:=}"

  : "${HASURA_GRAPHQL_JWT_SECRET:={\"type\":\"HS256\",\"key\":\"${JWT_SECRET}\"}}"

  export STACK_NAME="jatanlin-${AREA_CODE}"
  export NETWORK_NAME="jtn-${AREA_CODE}-net"
  export OUTPUT_DIR="deploy/out/${AREA_CODE}"
  mkdir -p "$OUTPUT_DIR"

  export STACK_FILE="$OUTPUT_DIR/stack.rendered.yml"
  export SEED_FILE="$OUTPUT_DIR/seed.rendered.sql"

  export DATABASE_URL="postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?sslmode=disable"
  export HASURA_GRAPHQL_DATABASE_URL="postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"
  export NATS_URL="nats://${NATS_USER}:${NATS_PASSWORD}@nats:4222"

  export ANPR_FTP_HOST="ftp:21"
  export AXLE_FTP_HOST="ftp:21"

  export SERVICE_SITE_LOCATION="${SITE_LOCATION:-${SITE_NAME}}"
}
