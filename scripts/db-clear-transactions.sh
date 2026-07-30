#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  . "$ROOT_DIR/.env"
  set +a
fi

if [ "${CONFIRM:-}" != "clear-transactions" ]; then
  printf '%s\n' "Refusing to clear transactions without CONFIRM=clear-transactions" >&2
  exit 1
fi

COMPOSE_FILE="$ROOT_DIR/infra/compose/docker-compose.yml"
PROJECT_NAME="${PROJECT_NAME:-jatanlin-revamp}"
POSTGRES_USER="${POSTGRES_USER:-jatanlin}"
POSTGRES_DB="${POSTGRES_DB:-jatanlin}"

compose() {
  docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" "$@"
}

compose exec -T postgres psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<'SQL'
TRUNCATE TABLE
  public.transact_vehicle_status,
  public.transact_vehicle_actual,
  public.transact_dimension,
  public.transact_weighing,
  public.transact_cctv,
  public.transact_axle_capture,
  public.transact_anpr_capture,
  public.transact_wim_session
RESTART IDENTITY CASCADE;
SQL
