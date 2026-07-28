#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
NODE_BIN="${NODE:-node}"

if ! command -v "$NODE_BIN" >/dev/null 2>&1; then
  if [ -x "/opt/homebrew/opt/node@20/bin/node" ]; then
    NODE_BIN="/opt/homebrew/opt/node@20/bin/node"
  else
    printf '%s\n' "node is required to read site.json" >&2
    exit 1
  fi
fi

"$NODE_BIN" "$ROOT_DIR/scripts/site-config.js" apply "$ROOT_DIR/site.json"
