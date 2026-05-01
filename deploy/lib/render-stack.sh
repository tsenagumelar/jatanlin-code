#!/usr/bin/env bash
set -euo pipefail

render_template() {
  local input="$1"
  local output="$2"
  perl -pe 's/\$\{([A-Z0-9_]+)\}/defined $ENV{$1} ? $ENV{$1} : ""/ge' "$input" > "$output"
}

render_stack() {
  render_template "deploy/templates/stack.area.yml.tpl" "$STACK_FILE"
  log "Rendered stack file: $STACK_FILE"
}

render_seed_sql() {
  render_template "deploy/sql/seed-master.sql.tpl" "$SEED_FILE"
  log "Rendered seed SQL: $SEED_FILE"
}
