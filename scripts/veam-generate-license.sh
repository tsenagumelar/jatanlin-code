#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

ORIG_SITE_ID="${SITE_ID-}"; ORIG_SITE_ID_SET="${SITE_ID+x}"
ORIG_SITE_CODE="${SITE_CODE-}"; ORIG_SITE_CODE_SET="${SITE_CODE+x}"
ORIG_SITE_NAME="${SITE_NAME-}"; ORIG_SITE_NAME_SET="${SITE_NAME+x}"
ORIG_VEAM_LICENSE_ID="${VEAM_LICENSE_ID-}"; ORIG_VEAM_LICENSE_ID_SET="${VEAM_LICENSE_ID+x}"
ORIG_VEAM_ISSUED_BY="${VEAM_ISSUED_BY-}"; ORIG_VEAM_ISSUED_BY_SET="${VEAM_ISSUED_BY+x}"
ORIG_VEAM_ISSUED_AT="${VEAM_ISSUED_AT-}"; ORIG_VEAM_ISSUED_AT_SET="${VEAM_ISSUED_AT+x}"
ORIG_VEAM_EXPIRES_AT="${VEAM_EXPIRES_AT-}"; ORIG_VEAM_EXPIRES_AT_SET="${VEAM_EXPIRES_AT+x}"
ORIG_VEAM_MODULES="${VEAM_MODULES-}"; ORIG_VEAM_MODULES_SET="${VEAM_MODULES+x}"
ORIG_VEAM_MAX_DEVICES="${VEAM_MAX_DEVICES-}"; ORIG_VEAM_MAX_DEVICES_SET="${VEAM_MAX_DEVICES+x}"
ORIG_VEAM_HARDWARE_ID="${VEAM_HARDWARE_ID-}"; ORIG_VEAM_HARDWARE_ID_SET="${VEAM_HARDWARE_ID+x}"
ORIG_VEAM_GENERATE_OUT="${VEAM_GENERATE_OUT-}"; ORIG_VEAM_GENERATE_OUT_SET="${VEAM_GENERATE_OUT+x}"
ORIG_VEAM_PUBLIC_KEY_OUT="${VEAM_PUBLIC_KEY_OUT-}"; ORIG_VEAM_PUBLIC_KEY_OUT_SET="${VEAM_PUBLIC_KEY_OUT+x}"

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

[ -z "$ORIG_SITE_ID_SET" ] || SITE_ID="$ORIG_SITE_ID"
[ -z "$ORIG_SITE_CODE_SET" ] || SITE_CODE="$ORIG_SITE_CODE"
[ -z "$ORIG_SITE_NAME_SET" ] || SITE_NAME="$ORIG_SITE_NAME"
[ -z "$ORIG_VEAM_LICENSE_ID_SET" ] || VEAM_LICENSE_ID="$ORIG_VEAM_LICENSE_ID"
[ -z "$ORIG_VEAM_ISSUED_BY_SET" ] || VEAM_ISSUED_BY="$ORIG_VEAM_ISSUED_BY"
[ -z "$ORIG_VEAM_ISSUED_AT_SET" ] || VEAM_ISSUED_AT="$ORIG_VEAM_ISSUED_AT"
[ -z "$ORIG_VEAM_EXPIRES_AT_SET" ] || VEAM_EXPIRES_AT="$ORIG_VEAM_EXPIRES_AT"
[ -z "$ORIG_VEAM_MODULES_SET" ] || VEAM_MODULES="$ORIG_VEAM_MODULES"
[ -z "$ORIG_VEAM_MAX_DEVICES_SET" ] || VEAM_MAX_DEVICES="$ORIG_VEAM_MAX_DEVICES"
[ -z "$ORIG_VEAM_HARDWARE_ID_SET" ] || VEAM_HARDWARE_ID="$ORIG_VEAM_HARDWARE_ID"
[ -z "$ORIG_VEAM_GENERATE_OUT_SET" ] || VEAM_GENERATE_OUT="$ORIG_VEAM_GENERATE_OUT"
[ -z "$ORIG_VEAM_PUBLIC_KEY_OUT_SET" ] || VEAM_PUBLIC_KEY_OUT="$ORIG_VEAM_PUBLIC_KEY_OUT"

GO="${GO:-go}"
PROJECT_NAME="${PROJECT_NAME:-jatanlin-revamp}"
COMPOSE_FILE="$ROOT_DIR/infra/compose/docker-compose.yml"
POSTGRES_USER="${POSTGRES_USER:-jatanlin}"
POSTGRES_DB="${POSTGRES_DB:-jatanlin}"
SITE_ID="${SITE_ID:-628f033e-49b2-4ba0-b1e8-12af4b3895ee}"
SITE_CODE="${SITE_CODE:-MST-25-00001}"
SITE_NAME="${SITE_NAME:-Mampang Revamp Local}"
ISSUED_BY="${VEAM_ISSUED_BY:-Activa Digital}"
ISSUED_AT="${VEAM_ISSUED_AT:-$(date +%Y-%m-%d)}"
EXPIRES_AT="${VEAM_EXPIRES_AT:-2027-12-31}"
MODULES="${VEAM_MODULES:-PWS,TIIC,DMC}"
MAX_DEVICES="${VEAM_MAX_DEVICES:-5}"
HARDWARE_ID="${VEAM_HARDWARE_ID:-}"
OUT="${VEAM_GENERATE_OUT:-$ROOT_DIR/services/backend/data/license.veam}"
PUBLIC_KEY_OUT="${VEAM_PUBLIC_KEY_OUT:-$ROOT_DIR/services/backend/data/license.public_key_b64}"
LICENSE_ID="${VEAM_LICENSE_ID:-VEAM2-${SITE_CODE}-${ISSUED_AT}}"

mkdir -p "$(dirname "$OUT")"

tmp_output=$(mktemp)
(
  cd "$ROOT_DIR/services/backend"
  "$GO" run ./cmd/veam-license-gen \
    -site-id "$SITE_ID" \
    -license-id "$LICENSE_ID" \
    -issued-to "$SITE_NAME" \
    -issued-by "$ISSUED_BY" \
    -issued-at "$ISSUED_AT" \
    -expires-at "$EXPIRES_AT" \
    -modules "$MODULES" \
    -max-devices "$MAX_DEVICES" \
    -hardware-id "$HARDWARE_ID" \
    -out "$OUT"
) | tee "$tmp_output"

public_key=$(sed -n 's/^public_key_b64=//p' "$tmp_output" | tail -1)
rm -f "$tmp_output"

if [ -z "$public_key" ]; then
  printf '%s\n' "Failed to read generated public_key_b64" >&2
  exit 1
fi

printf '%s\n' "$public_key" > "$PUBLIC_KEY_OUT"
printf 'public_key_path=%s\n' "$PUBLIC_KEY_OUT"

if docker compose --env-file "$ROOT_DIR/.env" -p "$PROJECT_NAME" -f "$COMPOSE_FILE" ps postgres >/dev/null 2>&1; then
  docker compose --env-file "$ROOT_DIR/.env" -p "$PROJECT_NAME" -f "$COMPOSE_FILE" exec -T postgres \
    psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    -v public_key="$public_key" <<'SQL'
UPDATE public.system_runtime_config
SET config_value = :'public_key',
    updated_date = now()
WHERE config_key = 'VEAM_PUBLIC_KEY_B64';
SQL
  printf '%s\n' "runtime_config=updated VEAM_PUBLIC_KEY_B64"
  if docker compose --env-file "$ROOT_DIR/.env" -p "$PROJECT_NAME" -f "$COMPOSE_FILE" ps --status running backend-api | grep -q backend-api; then
    docker compose --env-file "$ROOT_DIR/.env" -p "$PROJECT_NAME" -f "$COMPOSE_FILE" cp \
      "$OUT" backend-api:/app/data/license.veam
    printf '%s\n' "container_license=updated /app/data/license.veam"
  fi
  docker compose --env-file "$ROOT_DIR/.env" -p "$PROJECT_NAME" -f "$COMPOSE_FILE" restart backend-api
  printf '%s\n' "backend_api=restarted"
else
  printf '%s\n' "runtime_config=skipped postgres container is not available"
fi
