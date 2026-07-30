#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env}"

if [ -f "$ENV_FILE" ]; then
  set -a
  . "$ENV_FILE"
  set +a
fi

POSTGRES_HOST="${POSTGRES_HOST:-127.0.0.1}"
POSTGRES_PORT="${POSTGRES_PORT:-25432}"
POSTGRES_DB="${POSTGRES_DB:-jatanlin_data_center}"
POSTGRES_USER="${POSTGRES_USER:-jatanlin_dc}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-jatanlin_dc_password}"
DEFAULT_ADMIN_USERNAME="${DEFAULT_ADMIN_USERNAME:-admin}"
DEFAULT_ADMIN_PASSWORD="${DEFAULT_ADMIN_PASSWORD:-admin123}"
DEFAULT_ADMIN_FULL_NAME="${DEFAULT_ADMIN_FULL_NAME:-Data Center Administrator}"
DEFAULT_ADMIN_BADGE_NO="${DEFAULT_ADMIN_BADGE_NO:-ADM-DC-001}"
DEFAULT_ADMIN_EMAIL="${DEFAULT_ADMIN_EMAIL:-admin@localhost}"

for file in "$ROOT_DIR"/infra/database/*_seed.sql; do
  [ -f "$file" ] || continue
  echo "Seeding $(basename "$file")"
  PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$POSTGRES_HOST" \
    -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -v ON_ERROR_STOP=1 \
    -v admin_username="$DEFAULT_ADMIN_USERNAME" \
    -v admin_password="$DEFAULT_ADMIN_PASSWORD" \
    -v admin_full_name="$DEFAULT_ADMIN_FULL_NAME" \
    -v admin_badge_no="$DEFAULT_ADMIN_BADGE_NO" \
    -v admin_email="$DEFAULT_ADMIN_EMAIL" \
    -f "$file"
done
