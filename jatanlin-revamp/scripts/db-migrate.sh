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
SCHEMA_FILE="$ROOT_DIR/infra/database/001_schema.sql"

compose() {
  docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" "$@"
}

postgres_exec() {
  compose exec -T postgres "$@"
}

wait_postgres() {
  timeout_sec="${1:-120}"
  start_ts=$(date +%s)

  while :; do
    if postgres_exec pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
      printf '%s\n' "PostgreSQL is ready"
      return 0
    fi

    now_ts=$(date +%s)
    if [ "$((now_ts - start_ts))" -gt "$timeout_sec" ]; then
      printf '%s\n' "PostgreSQL not ready after ${timeout_sec}s" >&2
      return 1
    fi

    sleep 2
  done
}

psql_file() {
  sql_file="$1"
  printf '%s\n' "Applying SQL: $(basename "$sql_file")"
  postgres_exec psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$sql_file"
}

psql_stdin() {
  postgres_exec psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"
}

apply_baseline_safe() {
  sql_file="$SCHEMA_FILE"
  tmp_main=$(mktemp)
  tmp_triggers=$(mktemp)

  printf '%s\n' "Applying database schema: $(basename "$sql_file")"

  psql_stdin <<'SQL'
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
SQL

  awk '
    BEGIN { in_trigger=0 }
    /^create trigger / { in_trigger=1; print > trigger_file; next }
    in_trigger == 1 {
      print > trigger_file
      if ($0 ~ /execute function .*;$/) in_trigger=0
      next
    }
    /^CREATE SCHEMA public AUTHORIZATION pg_database_owner;$/ { next }
    { print }
  ' trigger_file="$tmp_triggers" "$sql_file" > "$tmp_main"

  postgres_exec psql -v ON_ERROR_STOP=0 -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$tmp_main" >/dev/null

  if [ -s "$tmp_triggers" ]; then
    postgres_exec psql -v ON_ERROR_STOP=0 -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$tmp_triggers" >/dev/null
  fi

  rm -f "$tmp_main" "$tmp_triggers"
}

main() {
  wait_postgres

  master_user_exists=$(postgres_exec psql -tA -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT to_regclass('public.master_user') IS NOT NULL;")
  if [ "$master_user_exists" != "t" ]; then
    apply_baseline_safe
  else
    printf '%s\n' "Database schema already exists"
  fi

  for sql_file in "$ROOT_DIR"/infra/database/*.sql; do
    case "$(basename "$sql_file")" in
      001_schema.sql|*_seed.sql) continue ;;
    esac
    psql_file "$sql_file"
  done
}

main "$@"
