# Phase 3 Transaction Orchestrator

## Objective

Move transaction lifecycle ownership from the browser to the backend while keeping the current UI appearance unchanged. A device may fail or time out without blocking finalization.

## API contract

All endpoints require a bearer JWT and are scoped to the site selected by the backend deployment.

- `POST /api/transactions/sessions/start`
  - Returns `201` for a new session.
  - Returns `200` with the existing session when one is already active for the site.
  - Accepts `source_modes` and `source_timeout_seconds` keyed by `ANPR`, `AXLE`, `WIM`, `CCTV`, and `DIMENSION`.
- `GET /api/transactions/sessions/active`
  - Returns the active session and reconciles elapsed source timeouts.
- `GET /api/transactions/sessions/recover`
  - Alias used by the web after refresh to restore the active session.
- `POST /api/transactions/sessions/{id}/finalize`
  - May receive actual latitude and longitude; site coordinates are the database fallback.
  - Repeated calls return the same `vehicle_actual_id`.

## Transaction guarantees

- Start is serialized per site with a PostgreSQL advisory transaction lock.
- Session and five source-state rows are created in one transaction.
- Finalization locks the session, discovers the latest source rows, records missing sources, inserts exactly one vehicle actual, and only then completes the session.
- Existing actual data makes finalization idempotent; an incomplete legacy session status is repaired to `COMPLETED`.
- Source payload relations remain nullable so `EMPTY` and `PARTIAL` results are valid.

## Deferred verification

Migration execution, compilation, tests, and end-to-end validation are intentionally deferred at the owner's request and must be completed before Phase 3 is accepted for deployment.
