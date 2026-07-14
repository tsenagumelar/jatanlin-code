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

SITE_CODE="${SITE_CODE:-MST-25-00001}"
SITE_ID="${SITE_ID:-e1123daf-a4db-4ee1-88da-ba9bff382f45}"
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
  -f /database/001_seed.sql
