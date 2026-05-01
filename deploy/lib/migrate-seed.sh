#!/usr/bin/env bash
set -euo pipefail

postgres_exec() {
  $COMPOSE_BIN -f "$STACK_FILE" -p "$STACK_NAME" exec -T postgres "$@"
}

wait_postgres() {
  local timeout_sec="${1:-120}"
  local start_ts
  start_ts=$(date +%s)

  while true; do
    if postgres_exec pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
      log "PostgreSQL is ready"
      break
    fi

    if (( $(date +%s) - start_ts > timeout_sec )); then
      die "PostgreSQL not ready after ${timeout_sec}s"
    fi
    sleep 2
  done
}

apply_sql_file() {
  local sql_file="$1"
  log "Applying SQL: $sql_file"
  cat "$sql_file" | postgres_exec psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null
}

apply_v2_baseline_sql_safe() {
  local sql_file="$1"
  log "Applying baseline SQL safely: $sql_file"
  postgres_exec psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<'SQL' >/dev/null
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
SQL

  local tmp_main tmp_triggers
  tmp_main="$(mktemp)"
  tmp_triggers="$(mktemp)"

  # Pass 1: apply all objects except trigger creation blocks.
  # Also skip CREATE SCHEMA public because schema already exists on initialized PostgreSQL.
  awk '
    BEGIN { in_trigger=0 }
    /^create trigger / { in_trigger=1; print > "'"$tmp_triggers"'"; next }
    in_trigger == 1 {
      print > "'"$tmp_triggers"'"
      if ($0 ~ /execute function .*;$/) in_trigger=0
      next
    }
    /^CREATE SCHEMA public AUTHORIZATION pg_database_owner;$/ { next }
    { print }
  ' "$sql_file" > "$tmp_main"

  # Baseline is not fully idempotent; allow "already exists" and continue.
  cat "$tmp_main" | postgres_exec psql -v ON_ERROR_STOP=0 -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null

  # Pass 2: apply triggers after functions are guaranteed to exist.
  if [[ -s "$tmp_triggers" ]]; then
    cat "$tmp_triggers" | postgres_exec psql -v ON_ERROR_STOP=0 -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null
  fi

  rm -f "$tmp_main" "$tmp_triggers"
}

ensure_schema_migrations_table() {
  postgres_exec psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<'SQL' >/dev/null
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  filename text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
SQL
}

is_migration_applied() {
  local filename="$1"
  local result
  result=$(postgres_exec psql -tA -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1 FROM public.schema_migrations WHERE filename='${filename}' LIMIT 1;")
  [[ "$result" == "1" ]]
}

mark_migration_applied() {
  local filename="$1"
  postgres_exec psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "INSERT INTO public.schema_migrations(filename) VALUES ('${filename}') ON CONFLICT DO NOTHING;" >/dev/null
}

run_migrations() {
  [[ "${RUN_DB_MIGRATION_ON_INSTALL}" == "true" ]] || {
    warn "RUN_DB_MIGRATION_ON_INSTALL=false, skipping DB migration"
    return
  }

  wait_postgres

  local master_user_table
  master_user_table=$(postgres_exec psql -tA -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT to_regclass('public.master_user') IS NOT NULL;")

  if [[ "$master_user_table" != "t" ]]; then
    apply_v2_baseline_sql_safe "jatanlin-backend-services/migrations/v2-ddl.sql"
  fi

  ensure_schema_migrations_table

  local mig
  while IFS= read -r mig; do
    local name
    name="$(basename "$mig")"
    if is_migration_applied "$name"; then
      continue
    fi
    apply_sql_file "$mig"
    mark_migration_applied "$name"
  done < <(ls jatanlin-backend-services/migrations/*.sql | rg -v '/(ddl|v1-ddl|v2-ddl)\.sql$' | sort)

  mark_migration_applied "v2-ddl.sql"
}

run_seed() {
  [[ "${RUN_MASTER_SEED_ON_INSTALL}" == "true" ]] || {
    warn "RUN_MASTER_SEED_ON_INSTALL=false, skipping seed"
    return
  }

  render_seed_sql
  apply_sql_file "$SEED_FILE"
}
