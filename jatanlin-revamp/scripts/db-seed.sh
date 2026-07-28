#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  . "$ROOT_DIR/.env"
  set +a
fi

NODE_BIN="${NODE:-node}"
if ! command -v "$NODE_BIN" >/dev/null 2>&1 && [ -x "/opt/homebrew/opt/node@20/bin/node" ]; then
  NODE_BIN="/opt/homebrew/opt/node@20/bin/node"
fi
if command -v "$NODE_BIN" >/dev/null 2>&1 && [ -f "$ROOT_DIR/site.json" ]; then
  eval "$("$NODE_BIN" "$ROOT_DIR/scripts/site-config.js" shell "$ROOT_DIR/site.json")"
fi

COMPOSE_FILE="$ROOT_DIR/infra/compose/docker-compose.yml"
PROJECT_NAME="${PROJECT_NAME:-jatanlin-revamp}"
POSTGRES_USER="${POSTGRES_USER:-jatanlin}"
POSTGRES_DB="${POSTGRES_DB:-jatanlin}"
SEED_MODE="${1:-${SEED_MODE:-master}}"

SITE_CODE="${SITE_CODE:-MST-25-00001}"
SITE_ID="${SITE_ID:-628f033e-49b2-4ba0-b1e8-12af4b3895ee}"
SITE_NAME="${SITE_NAME:-Mampang Revamp Local}"
SITE_LOCATION="${SITE_LOCATION:-Central Office}"
SITE_REGION="${SITE_REGION:-Default}"
SITE_ADDRESS="${SITE_ADDRESS:-Jl. Mampang Prapatan Raya, Jakarta Selatan}"
SITE_CITY="${SITE_CITY:-Jakarta Selatan}"
SITE_PROVINCE="${SITE_PROVINCE:-DKI Jakarta}"
SITE_TIMEZONE="${SITE_TIMEZONE:-Asia/Jakarta}"
SITE_CONTACT_NAME="${SITE_CONTACT_NAME:-Site Administrator}"
SITE_CONTACT_PHONE="${SITE_CONTACT_PHONE:-}"
DEFAULT_ADMIN_USERNAME="${DEFAULT_ADMIN_USERNAME:-admin}"
DEFAULT_ADMIN_PASSWORD="${DEFAULT_ADMIN_PASSWORD:-admin123}"
DEFAULT_ADMIN_FULL_NAME="${DEFAULT_ADMIN_FULL_NAME:-Administrator}"
DEFAULT_ADMIN_BADGE_NO="${DEFAULT_ADMIN_BADGE_NO:-ADM-001}"
DEFAULT_ADMIN_PHONE="${DEFAULT_ADMIN_PHONE:-}"
DEFAULT_ADMIN_EMAIL="${DEFAULT_ADMIN_EMAIL:-admin@local.test}"

compose() {
  docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" "$@"
}

postgres_exec() {
  compose exec -T postgres "$@"
}

seed_file() {
  seed_path="$1"
  printf '%s\n' "Applying seed: $seed_path"
  postgres_exec psql \
    -v ON_ERROR_STOP=1 \
    -v site_code="$SITE_CODE" \
    -v site_id="$SITE_ID" \
    -v site_name="$SITE_NAME" \
    -v site_location="$SITE_LOCATION" \
    -v site_region="$SITE_REGION" \
    -v site_address="$SITE_ADDRESS" \
    -v site_city="$SITE_CITY" \
    -v site_province="$SITE_PROVINCE" \
    -v site_timezone="$SITE_TIMEZONE" \
    -v site_contact_name="$SITE_CONTACT_NAME" \
    -v site_contact_phone="$SITE_CONTACT_PHONE" \
    -v admin_username="$DEFAULT_ADMIN_USERNAME" \
    -v admin_password="$DEFAULT_ADMIN_PASSWORD" \
    -v admin_full_name="$DEFAULT_ADMIN_FULL_NAME" \
    -v admin_badge_no="$DEFAULT_ADMIN_BADGE_NO" \
    -v admin_phone="$DEFAULT_ADMIN_PHONE" \
    -v admin_email="$DEFAULT_ADMIN_EMAIL" \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -f "$seed_path"
}

case "$SEED_MODE" in
  master)
    seed_file /database/001_seed.sql
    ;;
  transactions)
    seed_file /database/002_transaction_seed.sql
    ;;
  with-transactions)
    seed_file /database/001_seed.sql
    seed_file /database/002_transaction_seed.sql
    ;;
  *)
    printf 'Unknown seed mode: %s\n' "$SEED_MODE" >&2
    printf '%s\n' 'Use: master, transactions, or with-transactions' >&2
    exit 1
    ;;
esac
