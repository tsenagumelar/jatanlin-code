# Phase 9 — Canonical Data Center Transaction Store

## Decision

`dc_transact_vehicle_actual` is the canonical transaction store in the data center. It preserves the site transaction contract, nullable source relations, completeness, verification, provenance, source state, and revision history.

`dc_vehicle_actual` is a legacy summary table. It remains in the schema for rollback and audit, but:

- it is not part of `dc_dashboard_vehicle_actual`;
- its legacy batch endpoint returns HTTP `410 Gone`;
- new site sync uses `/api/sync/mirror/batch` only.

This removes the previous `UNION ALL` ambiguity where one site transaction could be returned from both stores.

## Detail contract

`GET /api/data-center/transactions/{id}` returns the canonical actual values plus:

- `completeness_status` and `missing_sources`;
- `verification_status` and `actual_data_origin`;
- all session source states, including mode, status, timeout, and error;
- immutable revision history;
- nullable raw records and available attachments.

The web detail page treats missing device data as an expected partial-data state and displays source failures without inventing fallback values.

## Migration and rollback

Apply `data-center/infra/database/004_phase9_canonical_transactions.sql`. The migration replaces only the read view and does not delete legacy rows.

Rollback can recreate the pre-Phase-9 union view from repository history and restore the legacy route handler. Do not delete `dc_vehicle_actual` until retention and rollback requirements have been approved.

The migration runner deliberately ignores `manual_migration.sql`; that file is a manual legacy snapshot, not an ordered migration.
