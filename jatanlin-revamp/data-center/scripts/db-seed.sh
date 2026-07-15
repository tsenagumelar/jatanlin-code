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

for file in "$ROOT_DIR"/infra/database/*_seed.sql; do
  [ -f "$file" ] || continue
  echo "Seeding $(basename "$file")"
  PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$POSTGRES_HOST" \
    -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -v ON_ERROR_STOP=1 \
    -f "$file"
done
