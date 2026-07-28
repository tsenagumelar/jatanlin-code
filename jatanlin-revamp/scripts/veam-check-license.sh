#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  . "$ROOT_DIR/.env"
  set +a
fi

GO="${GO:-go}"
PUBLIC_KEY_FILE="${VEAM_PUBLIC_KEY_OUT:-$ROOT_DIR/services/backend/data/license.public_key_b64}"
LICENSE_FILE="${VEAM_LICENSE_PATH:-$ROOT_DIR/services/backend/data/license.veam}"

if [ -f "$PUBLIC_KEY_FILE" ]; then
  VEAM_PUBLIC_KEY_B64=$(cat "$PUBLIC_KEY_FILE")
  export VEAM_PUBLIC_KEY_B64
fi

export VEAM_LICENSE_PATH="$LICENSE_FILE"
export SITE_ID="${SITE_ID:-628f033e-49b2-4ba0-b1e8-12af4b3895ee}"
export VEAM_HARDWARE_ID="${VEAM_HARDWARE_ID:-}"

cd "$ROOT_DIR/services/backend"
"$GO" run ./cmd/veam-license-check
