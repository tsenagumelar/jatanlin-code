#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  . "$ROOT_DIR/.env"
  set +a
fi

COMPOSE_FILE="$ROOT_DIR/infra/compose/docker-compose.yml"
PROJECT_NAME="${PROJECT_NAME:-jatanlin-revamp}"
POSTGRES_USER="${POSTGRES_USER:-jatanlin}"
POSTGRES_DB="${POSTGRES_DB:-jatanlin}"
SITE_ID="${SITE_ID:-628f033e-49b2-4ba0-b1e8-12af4b3895ee}"
SITE_CODE="${SITE_CODE:-MST-25-00001}"
SITE_NAME="${SITE_NAME:-Mampang Revamp Local}"

compose() {
  docker compose --env-file "$ROOT_DIR/.env" -p "$PROJECT_NAME" -f "$COMPOSE_FILE" "$@"
}

postgres_exec() {
  compose exec -T postgres "$@"
}

postgres_exec psql \
  -v ON_ERROR_STOP=1 \
  -v site_id="$SITE_ID" \
  -v site_code="$SITE_CODE" \
  -v site_name="$SITE_NAME" \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" <<'SQL'
UPDATE public.system_runtime_config
SET config_value = CASE config_key
  WHEN 'SITE_ID' THEN :'site_id'
  WHEN 'SITE_CODE' THEN :'site_code'
  WHEN 'SITE_NAME' THEN :'site_name'
  WHEN 'NATS_URL' THEN 'nats://nats:4222'
  WHEN 'ANPR_FTP_HOST' THEN 'ftp-local:21'
  WHEN 'AXLE_FTP_HOST' THEN 'ftp-local:21'
  WHEN 'ANPR_MINIO_ENDPOINT' THEN 'minio:9000'
  WHEN 'AXLE_MINIO_ENDPOINT' THEN 'minio:9000'
  WHEN 'ATTACHMENT_MINIO_ENDPOINT' THEN 'minio:9000'
  WHEN 'WEIGHING_TRIGGER_URL' THEN 'http://wb-agent:5001/ws/wim/anpr-capture'
  WHEN 'CCTV_TRIGGER_URL' THEN 'http://cctv-streamer:8090/record'
  ELSE config_value
END,
updated_date = now()
WHERE config_key IN (
  'SITE_ID',
  'SITE_CODE',
  'SITE_NAME',
  'NATS_URL',
  'ANPR_FTP_HOST',
  'AXLE_FTP_HOST',
  'ANPR_MINIO_ENDPOINT',
  'AXLE_MINIO_ENDPOINT',
  'ATTACHMENT_MINIO_ENDPOINT',
  'WEIGHING_TRIGGER_URL',
  'CCTV_TRIGGER_URL'
);
SQL
