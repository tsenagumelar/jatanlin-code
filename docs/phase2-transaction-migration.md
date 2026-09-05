# Phase 2 Transaction Foundation Migration

## Objective

Migration `010_phase2_transaction_foundation.sql` prepares partial device data, user verification, and multi-site transaction integrity without requiring every device to return data.

## Before migration

1. Use a clone or backup of the current database. Never point the revamp migration command at the current production database.
2. Stop transaction writers for the target revamp database.
3. Run `infra/database/audits/phase2_preflight.sql` read-only.
4. Resolve every returned duplicate or site mismatch manually. The migration deliberately does not choose which enforcement record is authoritative.
5. Record current constraint/index definitions for the affected transaction tables.

## Compatibility decisions

- Device payload columns and source record relations remain nullable.
- A timed-out or failed source is represented in `transact_session_source`; it does not block creation of `transact_vehicle_actual`.
- Existing sessions are backfilled with five source-state rows. Existing device records become `RECEIVED`; missing records remain `PENDING` for later reconciliation.
- `external_id` uniqueness changes from global to `(site_id, device scope, external_id)`.
- Audit foreign keys for all legacy transaction columns are deferred until orphan rows from the preflight report are resolved.

## Recovery

The migration runs inside one PostgreSQL transaction. Any failed precondition or DDL statement rolls back the complete migration.

If application compatibility fails after a successful migration:

1. Stop revamp writers.
2. Restore the pre-migration database backup for a full rollback.
3. Alternatively keep the additive columns/tables and disable the Phase 3 writer; do not drop them while new revision/source rows exist.
4. Re-create the old global `external_id` constraints only after proving external IDs are globally unique again.

Dropping Phase 2 tables or columns is intentionally not automated because it can destroy source-state and verification history.
